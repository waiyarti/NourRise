import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlay, FiPause, FiSkipForward, FiRotateCw, 
  FiMoon, FiSun, FiVolume2, FiVolumeX, FiSettings
} from 'react-icons/fi';

/**
 * @component ModePomodoro
 * @description Timer Pomodoro avancé avec alternance travail/pause, personnalisation, 
 * statistiques de session et interface minimaliste pour le mode focus
 * 
 * @param {Object} props - Propriétés du composant
 * @param {boolean} props.modeSombre - Mode sombre actif
 * @param {Function} props.onSessionComplete - Callback lorsqu'une session est terminée
 * @param {string} props.themeColor - Couleur du thème ('blue', 'green', 'purple', 'red')
 * @param {Array} props.taches - Liste des tâches pour associer le focus
 * @param {boolean} props.minimal - Mode d'affichage minimal
 * @param {number} props.dureeDefautTravail - Durée par défaut du travail en minutes
 * @param {number} props.dureeDefautPause - Durée par défaut de la pause en minutes
 * @returns {JSX.Element} Composant timer Pomodoro
 */
const ModePomodoro = ({
  modeSombre = false,
  onSessionComplete,
  themeColor = 'blue',
  taches = [],
  minimal = false,
  dureeDefautTravail = 25,
  dureeDefautPause = 5
}) => {
  // États pour le timer et les fonctionnalités
  const [minutes, setMinutes] = useState(dureeDefautTravail);
  const [secondes, setSecondes] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('travail'); // 'travail' ou 'pause'
  const [configOpen, setConfigOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [tacheSelectionneeId, setTacheSelectionneeId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [tempsTotalFocus, setTempsTotalFocus] = useState(0);
  const [showStats, setShowStats] = useState(false);
  
  // Paramètres configurables
  const [parametres, setParametres] = useState({
    travail: dureeDefautTravail,
    pause: dureeDefautPause,
    pauseLongue: 15,
    cyclesAvantPauseLongue: 4
  });
  
  // Sons pour notifications
  const sonDebut = useRef(null);
  const sonFin = useRef(null);
  
  // Compteur pour suivre les cycles
  const cycleCountRef = useRef(0);
  
  // Couleur du thème
  const getThemeColor = useCallback(() => {
    const themeColors = {
      blue: modeSombre ? 'from-blue-700 to-blue-900' : 'from-blue-500 to-blue-700',
      green: modeSombre ? 'from-green-700 to-green-900' : 'from-green-500 to-green-700',
      purple: modeSombre ? 'from-purple-700 to-purple-900' : 'from-purple-500 to-purple-700',
      red: modeSombre ? 'from-red-700 to-red-900' : 'from-red-500 to-red-700'
    };
    
    return themeColors[themeColor] || themeColors.blue;
  }, [themeColor, modeSombre]);
  
  // Couleur du texte du timer
  const getTimerTextColor = useCallback(() => {
    const textColors = {
      blue: 'text-blue-100',
      green: 'text-green-100',
      purple: 'text-purple-100',
      red: 'text-red-100'
    };
    
    return textColors[themeColor] || textColors.blue;
  }, [themeColor]);
  
  // Initialiser les sons
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Charger les sons
      sonDebut.current = new Audio('/sounds/start.mp3');
      sonFin.current = new Audio('/sounds/complete.mp3');
    }
    
    return () => {
      // Nettoyer les sons
      if (sonDebut.current) sonDebut.current.pause();
      if (sonFin.current) sonFin.current.pause();
    };
  }, []);
  
  // Logique du timer
  useEffect(() => {
    let interval = null;
    
    if (isActive) {
      interval = setInterval(() => {
        // Décrémentation du temps
        if (secondes > 0) {
          setSecondes(secondes - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSecondes(59);
        } else {
          // Fin du timer
          playSound(sonFin.current);
          
          // Changer de mode (travail <-> pause)
          if (mode === 'travail') {
            // Incrémenter le compteur de cycles
            cycleCountRef.current += 1;
            
            // Enregistrer la session terminée
            const nouvelleSessions = [...sessions];
            nouvelleSessions.push({
              date: new Date(),
              duree: parametres.travail,
              mode: 'travail',
              tacheId: tacheSelectionneeId
            });
            setSessions(nouvelleSessions);
            
            // Mettre à jour le temps total de focus
            setTempsTotalFocus(prev => prev + parametres.travail * 60);
            
            // Déterminer si c'est une pause longue
            const estPauseLongue = cycleCountRef.current % parametres.cyclesAvantPauseLongue === 0;
            
            // Passer en mode pause
            setMode('pause');
            setMinutes(estPauseLongue ? parametres.pauseLongue : parametres.pause);
            
            // Callback pour notifier la fin de session
            if (onSessionComplete) {
              onSessionComplete({
                duration: parametres.travail,
                mode: 'travail',
                tacheId: tacheSelectionneeId,
                isComplete: true
              });
            }
          } else {
            // Revenir en mode travail
            setMode('travail');
            setMinutes(parametres.travail);
            
            // Enregistrer la pause terminée
            const nouvelleSessions = [...sessions];
            nouvelleSessions.push({
              date: new Date(),
              duree: mode === 'pause' ? parametres.pause : parametres.pauseLongue,
              mode: 'pause'
            });
            setSessions(nouvelleSessions);
          }
          
          setSecondes(0);
        }
      }, 1000);
    } else if (!isActive && interval) {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isActive, minutes, secondes, mode, parametres, onSessionComplete, sessions, tacheSelectionneeId]);
  
  // Fonction pour jouer un son
  const playSound = (sound) => {
    if (soundEnabled && sound) {
      sound.currentTime = 0;
      sound.play().catch(err => console.error('Erreur de lecture audio:', err));
    }
  };
  
  // Démarrer ou mettre en pause le timer
  const toggleTimer = () => {
    if (!isActive && mode === 'travail') {
      playSound(sonDebut.current);
    }
    setIsActive(!isActive);
  };
  
  // Passer à la session suivante
  const skipSession = () => {
    setIsActive(false);
    
    if (mode === 'travail') {
      setMode('pause');
      const estPauseLongue = (cycleCountRef.current + 1) % parametres.cyclesAvantPauseLongue === 0;
      setMinutes(estPauseLongue ? parametres.pauseLongue : parametres.pause);
      
      // Incrémenter le compteur
      cycleCountRef.current += 1;
    } else {
      setMode('travail');
      setMinutes(parametres.travail);
    }
    
    setSecondes(0);
  };
  
  // Réinitialiser la session courante
  const resetTimer = () => {
    setIsActive(false);
    setMinutes(mode === 'travail' ? parametres.travail : parametres.pause);
    setSecondes(0);
  };
  
  // Formatage du temps pour affichage
  const formatTime = (min, sec) => {
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };
  
  // Calcul du pourcentage de progression pour l'anneau circulaire
  const calculateProgress = () => {
    const totalSecondes = mode === 'travail' 
      ? parametres.travail * 60 
      : (cycleCountRef.current % parametres.cyclesAvantPauseLongue === 0 ? parametres.pauseLongue : parametres.pause) * 60;
    
    const remainingSecondes = minutes * 60 + secondes;
    const progressPercent = ((totalSecondes - remainingSecondes) / totalSecondes) * 100;
    
    return progressPercent;
  };
  
  // Calculer la circonférence du cercle SVG
  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (calculateProgress() / 100) * circumference;
  
  // Formatage des statistiques
  const formaterDuree = (secondesTotal) => {
    const heures = Math.floor(secondesTotal / 3600);
    const minutes = Math.floor((secondesTotal % 3600) / 60);
    
    if (heures > 0) {
      return `${heures}h ${minutes}min`;
    }
    return `${minutes}min`;
  };
  
  // Trouver la tâche sélectionnée
  const tacheSelectionnee = tacheSelectionneeId 
    ? taches.find(t => t.id === tacheSelectionneeId) 
    : null;
  
  // Rendu du composant
  return (
    <div className={`${minimal ? 'max-w-md' : 'max-w-2xl'} mx-auto`}>
      <div className={`relative rounded-xl overflow-hidden shadow-lg ${
        modeSombre ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Timer et cercle de progression */}
        <div className={`bg-gradient-to-br ${getThemeColor()} p-6 flex flex-col items-center justify-center`}>
          {/* Mode actuel */}
          <div className="absolute top-4 right-4 flex space-x-3">
            <button
              onClick={() => setShowStats(!showStats)}
              className="bg-white bg-opacity-20 rounded-full p-2 text-white hover:bg-opacity-30 transition-colors"
            >
              <FiRotateCw />
            </button>
            
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="bg-white bg-opacity-20 rounded-full p-2 text-white hover:bg-opacity-30 transition-colors"
            >
              {soundEnabled ? <FiVolume2 /> : <FiVolumeX />}
            </button>
            
            <button
              onClick={() => setConfigOpen(true)}
              className="bg-white bg-opacity-20 rounded-full p-2 text-white hover:bg-opacity-30 transition-colors"
            >
              <FiSettings />
            </button>
          </div>
          
          <div className="text-white text-lg mb-4">
            {mode === 'travail' ? 'Focus' : 'Pause'}
            {tacheSelectionnee && mode === 'travail' && (
              <span className="ml-1">• {tacheSelectionnee.nom}</span>
            )}
          </div>
          
          {/* Cercle de progression */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              {/* Cercle de fond */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="10"
              />
              
              {/* Cercle de progression */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="white"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s' }}
              />
            </svg>
            
            {/* Temps au centre */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-6xl font-bold ${getTimerTextColor()}`}>
                {formatTime(minutes, secondes)}
              </span>
            </div>
          </div>
          
          {/* Contrôles */}
          <div className="flex space-x-6 mt-8">
            <button
              onClick={resetTimer}
              className="bg-white bg-opacity-20 rounded-full p-4 text-white hover:bg-opacity-30 transition-colors"
            >
              <FiRotateCw size={24} />
            </button>
            
            <button
              onClick={toggleTimer}
              className="bg-white rounded-full p-5 text-blue-600 hover:bg-gray-100 transition-colors"
            >
              {isActive ? <FiPause size={28} /> : <FiPlay size={28} />}
            </button>
            
            <button
              onClick={skipSession}
              className="bg-white bg-opacity-20 rounded-full p-4 text-white hover:bg-opacity-30 transition-colors"
            >
              <FiSkipForward size={24} />
            </button>
          </div>
        </div>
        
        {/* Infos du cycle */}
        <div className={`p-4 ${modeSombre ? 'bg-gray-700' : 'bg-gray-50'} flex justify-between`}>
          <div className="text-center">
            <p className="text-sm opacity-70">Cycle</p>
            <p className="font-semibold">{Math.floor(cycleCountRef.current / parametres.cyclesAvantPauseLongue)}.{cycleCountRef.current % parametres.cyclesAvantPauseLongue}</p>
          </div>
          
          <div className="text-center">
            <p className="text-sm opacity-70">Sessions</p>
            <p className="font-semibold">{sessions.filter(s => s.mode === 'travail').length}</p>
          </div>
          
          <div className="text-center">
            <p className="text-sm opacity-70">Temps total</p>
            <p className="font-semibold">{formaterDuree(tempsTotalFocus)}</p>
          </div>
        </div>
        
        {/* Sélecteur de tâche (si on n'est pas en mode minimal) */}
        {!minimal && taches.length > 0 && (
          <div className={`p-4 ${modeSombre ? 'bg-gray-800' : 'bg-white'}`}>
            <p className="font-medium mb-2">Associer à une tâche:</p>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {taches
                .filter(t => t.statut !== 'terminee')
                .map(tache => (
                  <button
                    key={tache.id}
                    onClick={() => setTacheSelectionneeId(tache.id)}
                    className={`px-3 py-2 rounded-lg text-left text-sm truncate transition-colors ${
                      tacheSelectionneeId === tache.id
                        ? `bg-${themeColor}-100 text-${themeColor}-800`
                        : modeSombre ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {tache.nom}
                  </button>
                ))}
            </div>
          </div>
        )}
        
        {/* Modal de configuration */}
        <AnimatePresence>
          {configOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => setConfigOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`w-full max-w-md rounded-lg p-6 ${
                  modeSombre ? 'bg-gray-800' : 'bg-white'
                }`}
                onClick={e => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold mb-4">Paramètres du Timer</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Durée de travail (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={parametres.travail}
                      onChange={e => setParametres({
                        ...parametres,
                        travail: parseInt(e.target.value) || 1
                      })}
                      className={`w-full px-3 py-2 rounded-lg ${
                        modeSombre 
                          ? 'bg-gray-700 text-white border-gray-600' 
                          : 'bg-white text-gray-900 border-gray-300'
                      } border`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Durée de pause courte (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={parametres.pause}
                      onChange={e => setParametres({
                        ...parametres,
                        pause: parseInt(e.target.value) || 1
                      })}
                      className={`w-full px-3 py-2 rounded-lg ${
                        modeSombre 
                          ? 'bg-gray-700 text-white border-gray-600' 
                          : 'bg-white text-gray-900 border-gray-300'
                      } border`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Durée de pause longue (minutes)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="60"
                      value={parametres.pauseLongue}
                      onChange={e => setParametres({
                        ...parametres,
                        pauseLongue: parseInt(e.target.value) || 5
                      })}
                      className={`w-full px-3 py-2 rounded-lg ${
                        modeSombre 
                          ? 'bg-gray-700 text-white border-gray-600' 
                          : 'bg-white text-gray-900 border-gray-300'
                      } border`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Cycles avant pause longue
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={parametres.cyclesAvantPauseLongue}
                      onChange={e => setParametres({
                        ...parametres,
                        cyclesAvantPauseLongue: parseInt(e.target.value) || 1
                      })}
                      className={`w-full px-3 py-2 rounded-lg ${
                        modeSombre 
                          ? 'bg-gray-700 text-white border-gray-600' 
                          : 'bg-white text-gray-900 border-gray-300'
                      } border`}
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setConfigOpen(false)}
                    className={`px-4 py-2 rounded-lg ${
                      modeSombre
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    Annuler
                  </button>
                  
                  <button
                    onClick={() => {
                      setConfigOpen(false);
                      // Appliquer les changements directement si on n'est pas en cours de session
                      if (!isActive) {
                        setMinutes(mode === 'travail' ? parametres.travail : parametres.pause);
                      }
                    }}
                    className={`px-4 py-2 rounded-lg bg-${themeColor}-600 text-white hover:bg-${themeColor}-700`}
                  >
                    Enregistrer
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Statistiques */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`p-6 ${modeSombre ? 'bg-gray-800' : 'bg-white'} border-t ${
                modeSombre ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              <h3 className="text-xl font-bold mb-4">Statistiques</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${
                  modeSombre ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <p className="text-sm opacity-70">Sessions complétées</p>
                  <p className="text-2xl font-bold">{sessions.filter(s => s.mode === 'travail').length}</p>
                </div>
                
                <div className={`p-4 rounded-lg ${
                  modeSombre ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <p className="text-sm opacity-70">Temps total de focus</p>
                  <p className="text-2xl font-bold">{formaterDuree(tempsTotalFocus)}</p>
                </div>
                
                {tacheSelectionnee && (
                  <div className={`p-4 rounded-lg col-span-2 ${
                    modeSombre ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <p className="text-sm opacity-70">Tâche actuelle</p>
                    <p className="font-semibold">{tacheSelectionnee.nom}</p>
                    <p className="text-sm mt-1">
                      Temps consacré: {formaterDuree(
                        sessions
                          .filter(s => s.mode === 'travail' && s.tacheId === tacheSelectionneeId)
                          .reduce((acc, s) => acc + s.duree * 60, 0)
                      )}
                    </p>
                  </div>
                )}
              </div>
              
              {sessions.length > 0 && (
                <div className="mt-4">
                  <p className="font-medium mb-2">Sessions récentes:</p>
                  <div className="max-h-40 overflow-y-auto">
                    {[...sessions].reverse().slice(0, 5).map((session, index) => {
                      const tache = taches.find(t => t.id === session.tacheId);
                      return (
                        <div 
                          key={index} 
                          className={`mb-2 px-3 py-2 rounded ${
                            modeSombre ? 'bg-gray-700' : 'bg-gray-100'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                                session.mode === 'travail'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {session.mode === 'travail' ? 'Focus' : 'Pause'}
                              </span>
                              {tache && (
                                <span className="ml-2 text-sm">{tache.nom}</span>
                              )}
                            </div>
                            <span className="text-sm opacity-70">{session.duree}min</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Texte motivant */}
      {!minimal && (
        <div className="mt-6 text-center">
          <p className={`text-lg italic ${modeSombre ? 'text-gray-300' : 'text-gray-600'}`}>
            {mode === 'travail' 
              ? "Concentre-toi pleinement, un pas à la fois." 
              : "Respire profondément, tu as bien mérité cette pause."}
          </p>
        </div>
      )}
    </div>
  );
};

export default ModePomodoro;
