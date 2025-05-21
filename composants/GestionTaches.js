import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  FiCheck, FiClock, FiXCircle, FiTrash2, FiEdit2, 
  FiStar, FiChevronDown, FiChevronUp, FiClipboard, FiFilter
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * @component GestionTaches
 * @description Composant avancé pour la gestion des tâches avec statuts multiples, 
 * coefficients d'importance, drag-and-drop, filtres et animation fluides
 * 
 * @param {Object} props - Propriétés du composant
 * @param {Array} props.taches - Liste des tâches à afficher
 * @param {Function} props.onTacheChange - Callback lorsqu'une tâche est modifiée
 * @param {Function} props.onTacheAdd - Callback pour ajouter une tâche
 * @param {Function} props.onTacheDelete - Callback pour supprimer une tâche
 * @param {Function} props.onTachesReorder - Callback quand l'ordre est modifié
 * @param {boolean} props.modeSombre - Mode sombre activé
 * @param {string} props.styleVisuel - Style visuel (default, minimal, cards, glassmorphism)
 * @param {boolean} props.animations - Activer les animations
 * @returns {JSX.Element} Interface de gestion des tâches
 */
const GestionTaches = ({
  taches = [],
  onTacheChange,
  onTacheAdd,
  onTacheDelete,
  onTachesReorder,
  modeSombre = false,
  styleVisuel = 'glassmorphism',
  animations = true
}) => {
  // États pour le composant
  const [tachesFiltrees, setTachesFiltrees] = useState([]);
  const [filtreCourant, setFiltreCourant] = useState('toutes');
  const [recherche, setRecherche] = useState('');
  const [tacheDraggedId, setTacheDraggedId] = useState(null);
  const [nouveauStatut, setNouveauStatut] = useState(null);
  const [detailsOuverts, setDetailsOuverts] = useState({});
  const [menuFiltreOuvert, setMenuFiltreOuvert] = useState(false);
  const [statsAffichees, setStatsAffichees] = useState(false);
  
  // Références pour le drag & drop
  const dragItem = useRef();
  const dragOverItem = useRef();
  
  // Statistiques sur les tâches
  const stats = {
    total: taches.length,
    terminee: taches.filter(t => t.statut === 'terminee').length,
    enCours: taches.filter(t => t.statut === 'enCours').length,
    nonCommencee: taches.filter(t => t.statut === 'nonCommencee').length,
    tauxCompletion: taches.length > 0 ? 
      Math.round((taches.filter(t => t.statut === 'terminee').length / taches.length) * 100) : 0,
    prioriteHaute: taches.filter(t => t.coefficient === 3).length,
    prioriteMoyenne: taches.filter(t => t.coefficient === 2).length,
    prioriteBasse: taches.filter(t => t.coefficient === 1).length,
  };
  
  // Liste des statuts possibles
  const statuts = [
    { id: 'nonCommencee', label: 'Non commencée', icon: <FiXCircle /> },
    { id: 'enCours', label: 'En cours', icon: <FiClock /> },
    { id: 'terminee', label: 'Terminée', icon: <FiCheck /> }
  ];
  
  // Options de filtre disponibles
  const optionsFiltres = [
    { id: 'toutes', label: 'Toutes les tâches' },
    { id: 'terminee', label: 'Terminées' },
    { id: 'enCours', label: 'En cours' },
    { id: 'nonCommencee', label: 'Non commencées' },
    { id: 'prioriteHaute', label: 'Priorité haute' }
  ];
  
  // Couleurs selon le statut
  const getColorByStatut = (statut) => {
    switch(statut) {
      case 'terminee': return modeSombre ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-800';
      case 'enCours': return modeSombre ? 'bg-amber-800 text-amber-100' : 'bg-amber-100 text-amber-800';
      case 'nonCommencee': return modeSombre ? 'bg-red-800 text-red-100' : 'bg-red-100 text-red-800';
      default: return modeSombre ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-800';
    }
  };
  
  // Couleurs selon le coefficient
  const getColorByCoefficient = (coefficient) => {
    switch(coefficient) {
      case 3: return modeSombre ? 'text-red-400' : 'text-red-600';
      case 2: return modeSombre ? 'text-amber-400' : 'text-amber-600';
      case 1: return modeSombre ? 'text-blue-400' : 'text-blue-600';
      default: return modeSombre ? 'text-gray-400' : 'text-gray-600';
    }
  };
  
  // Filtrage des tâches selon les critères
  useEffect(() => {
    let filtered = [...taches];
    
    // Filtre par statut
    if (filtreCourant !== 'toutes') {
      if (filtreCourant === 'prioriteHaute') {
        filtered = filtered.filter(tache => tache.coefficient === 3);
      } else {
        filtered = filtered.filter(tache => tache.statut === filtreCourant);
      }
    }
    
    // Filtre par recherche
    if (recherche.trim() !== '') {
      const searchLower = recherche.toLowerCase();
      filtered = filtered.filter(tache => 
        tache.nom.toLowerCase().includes(searchLower) || 
        (tache.description && tache.description.toLowerCase().includes(searchLower))
      );
    }
    
    setTachesFiltrees(filtered);
  }, [taches, filtreCourant, recherche]);
  
  // Gestion du drag start
  const handleDragStart = (e, id) => {
    setTacheDraggedId(id);
    dragItem.current = id;
    
    // Visual feedback during drag
    if (e.target && e.target.classList) {
      e.target.classList.add('opacity-50');
    }
  };
  
  // Gestion du drag over
  const handleDragOver = (e, id) => {
    e.preventDefault();
    dragOverItem.current = id;
  };
  
  // Gestion du drop
  const handleDrop = (e) => {
    e.preventDefault();
    
    if (dragItem.current === null || dragOverItem.current === null) return;
    
    // Visual feedback reset
    if (e.target && e.target.classList) {
      e.target.classList.remove('opacity-50');
    }
    
    // Réorganisation des tâches
    const newTaches = [...taches];
    const dragItemIndex = newTaches.findIndex(t => t.id === dragItem.current);
    const dragOverItemIndex = newTaches.findIndex(t => t.id === dragOverItem.current);
    
    if (dragItemIndex !== -1 && dragOverItemIndex !== -1) {
      const temp = newTaches[dragItemIndex];
      newTaches.splice(dragItemIndex, 1);
      newTaches.splice(dragOverItemIndex, 0, temp);
      
      // Appel du callback
      if (onTachesReorder) {
        onTachesReorder(newTaches);
      }
    }
    
    // Reset des références
    dragItem.current = null;
    dragOverItem.current = null;
    setTacheDraggedId(null);
  };
  
  // Gestion des changements de statut
  const handleStatusChange = (tacheId, nouveauStatut) => {
    const tacheIndex = taches.findIndex(t => t.id === tacheId);
    
    if (tacheIndex !== -1) {
      const updatedTache = { 
        ...taches[tacheIndex], 
        statut: nouveauStatut, 
        dateMiseAJour: new Date().toISOString()
      };
      
      // Si terminée, mettre fait = true pour compatibilité
      if (nouveauStatut === 'terminee') {
        updatedTache.fait = true;
      } else {
        updatedTache.fait = false;
      }
      
      const updatedTaches = [...taches];
      updatedTaches[tacheIndex] = updatedTache;
      
      if (onTacheChange) {
        onTacheChange(updatedTache);
      }
    }
  };
  
  // Gestion du clic pour ouvrir/fermer les détails
  const toggleDetails = (tacheId) => {
    setDetailsOuverts(prev => ({
      ...prev,
      [tacheId]: !prev[tacheId]
    }));
  };
  
  // Rendu d'une tâche individuelle
  const renderTache = (tache) => {
    const detailsVisible = detailsOuverts[tache.id] || false;
    const tacheClasses = `
      relative flex flex-col rounded-lg overflow-hidden transition-all duration-300
      ${styleVisuel === 'glassmorphism' ? 'backdrop-blur-md bg-opacity-30' : ''}
      ${styleVisuel === 'cards' ? 'shadow-lg' : 'shadow'}
      ${styleVisuel === 'minimal' ? 'border' : ''}
      ${modeSombre ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-200'}
      ${tacheDraggedId === tache.id ? 'scale-105 z-10 opacity-80' : ''}
      ${detailsVisible ? 'mb-3' : 'mb-2'}
      hover:shadow-md
    `;
    
    return (
      <motion.div
        key={tache.id}
        className={tacheClasses}
        draggable
        onDragStart={(e) => handleDragStart(e, tache.id)}
        onDragOver={(e) => handleDragOver(e, tache.id)}
        onDrop={handleDrop}
        onDragEnd={(e) => {
          if (e.target && e.target.classList) {
            e.target.classList.remove('opacity-50');
          }
        }}
        initial={animations ? { opacity: 0, y: 10 } : {}}
        animate={animations ? { opacity: 1, y: 0 } : {}}
        exit={animations ? { opacity: 0, y: -10 } : {}}
        transition={{ duration: 0.3 }}
      >
        {/* Badge du statut */}
        <div className={`absolute top-0 right-0 rounded-bl-lg px-2 py-1 text-xs font-medium ${getColorByStatut(tache.statut)}`}>
          {statuts.find(s => s.id === tache.statut)?.label || 'Non défini'}
        </div>
        
        {/* Contenu principal */}
        <div className="flex justify-between items-start p-4 cursor-pointer" onClick={() => toggleDetails(tache.id)}>
          <div className="flex-1 pr-16">
            <div className="flex items-center">
              <h3 className={`font-semibold text-lg ${tache.statut === 'terminee' ? 'line-through opacity-70' : ''}`}>
                {tache.nom}
              </h3>
              
              {/* Étoiles de coefficient */}
              <div className="ml-2 flex">
                {Array.from({ length: tache.coefficient || 1 }).map((_, i) => (
                  <FiStar key={i} className={`${getColorByCoefficient(tache.coefficient)}`} />
                ))}
              </div>
            </div>
            
            {/* Date de création */}
            {tache.dateCreation && (
              <p className="text-xs opacity-70 mt-1">
                Créée le {format(new Date(tache.dateCreation), 'dd MMM yyyy', { locale: fr })}
              </p>
            )}
          </div>
          
          <div className="flex items-center">
            {detailsVisible ? <FiChevronUp className="text-gray-400" /> : <FiChevronDown className="text-gray-400" />}
          </div>
        </div>
        
        {/* Détails et actions (visible lors du clic) */}
        <AnimatePresence>
          {detailsVisible && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-4 pb-4"
            >
              {/* Description */}
              {tache.description && (
                <p className={`mb-4 text-sm ${tache.statut === 'terminee' ? 'line-through opacity-50' : ''}`}>
                  {tache.description}
                </p>
              )}
              
              {/* Date de mise à jour */}
              {tache.dateMiseAJour && (
                <p className="text-xs opacity-70 mb-3">
                  Dernière mise à jour: {format(new Date(tache.dateMiseAJour), 'dd MMM yyyy HH:mm', { locale: fr })}
                </p>
              )}
              
              {/* Actions */}
              <div className="flex flex-wrap justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                {/* Sélecteur de statut */}
                <div className="flex space-x-2 mt-2">
                  {statuts.map(statut => (
                    <button
                      key={statut.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(tache.id, statut.id);
                      }}
                      className={`flex items-center px-2 py-1 rounded-full text-xs ${
                        tache.statut === statut.id 
                          ? getColorByStatut(statut.id)
                          : modeSombre ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                      } transition-colors`}
                    >
                      <span className="mr-1">{statut.icon}</span>
                      {statut.label}
                    </button>
                  ))}
                </div>
                
                {/* Boutons d'action */}
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Action d'édition
                    }}
                    className={`p-2 rounded-lg ${
                      modeSombre ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-800'
                    } hover:opacity-80 transition-opacity`}
                  >
                    <FiEdit2 size={16} />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onTacheDelete) onTacheDelete(tache.id);
                    }}
                    className={`p-2 rounded-lg ${
                      modeSombre ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-800'
                    } hover:opacity-80 transition-opacity`}
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };
  
  return (
    <div className={`${modeSombre ? 'text-gray-200' : 'text-gray-800'}`}>
      {/* En-tête avec filtres et statistiques */}
      <div className="mb-6">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            Mes Tâches
            <span className="ml-2 text-sm font-normal opacity-70">
              ({stats.terminee}/{stats.total} terminées)
            </span>
          </h2>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <button
                onClick={() => setMenuFiltreOuvert(!menuFiltreOuvert)}
                className={`flex items-center px-3 py-2 rounded-lg ${
                  modeSombre ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                } transition-colors`}
              >
                <FiFilter className="mr-2" />
                <span>Filtrer</span>
                <FiChevronDown className={`ml-1 transition-transform ${menuFiltreOuvert ? 'transform rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {menuFiltreOuvert && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`absolute right-0 mt-2 w-56 rounded-md shadow-lg z-20 ${
                      modeSombre ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                    }`}
                  >
                    <div className="py-1">
                      {optionsFiltres.map(option => (
                        <button
                          key={option.id}
                          onClick={() => {
                            setFiltreCourant(option.id);
                            setMenuFiltreOuvert(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm ${
                            filtreCourant === option.id 
                              ? modeSombre ? 'bg-blue-800 text-white' : 'bg-blue-100 text-blue-800'
                              : modeSombre ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button
              onClick={() => setStatsAffichees(!statsAffichees)}
              className={`flex items-center px-3 py-2 rounded-lg ${
                modeSombre ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              } transition-colors`}
            >
              <FiClipboard className="mr-2" />
              <span>Statistiques</span>
            </button>
          </div>
        </div>
        
        {/* Barre de recherche */}
        <div className="relative mb-4">
          <input
            type="text"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher une tâche..."
            className={`w-full px-4 py-2 rounded-lg ${
              modeSombre 
                ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600' 
                : 'bg-white text-gray-900 placeholder-gray-500 border-gray-300'
            } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {recherche && (
            <button
              onClick={() => setRecherche('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FiXCircle />
            </button>
          )}
        </div>
        
        {/* Statistiques détaillées (collapsible) */}
        <AnimatePresence>
          {statsAffichees && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 rounded-lg ${
                modeSombre ? 'bg-gray-800' : 'bg-gray-50'
              }`}
            >
              <div className={`p-3 rounded-lg ${modeSombre ? 'bg-gray-700' : 'bg-white'} text-center`}>
                <p className="text-sm opacity-70">Taux de complétion</p>
                <p className={`text-2xl font-bold ${
                  stats.tauxCompletion >= 75 ? 'text-green-500' : 
                  stats.tauxCompletion >= 50 ? 'text-amber-500' : 
                  'text-red-500'
                }`}>
                  {stats.tauxCompletion}%
                </p>
              </div>
              
              <div className={`p-3 rounded-lg ${modeSombre ? 'bg-gray-700' : 'bg-white'} text-center`}>
                <p className="text-sm opacity-70">Tâches en cours</p>
                <p className="text-2xl font-bold text-amber-500">{stats.enCours}</p>
              </div>
              
              <div className={`p-3 rounded-lg ${modeSombre ? 'bg-gray-700' : 'bg-white'} text-center`}>
                <p className="text-sm opacity-70">Priorité haute</p>
                <p className="text-2xl font-bold text-red-500">{stats.prioriteHaute}</p>
              </div>
              
              <div className={`p-3 rounded-lg ${modeSombre ? 'bg-gray-700' : 'bg-white'} text-center`}>
                <p className="text-sm opacity-70">Non commencées</p>
                <p className="text-2xl font-bold text-blue-500">{stats.nonCommencee}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Liste des tâches */}
      <div className="space-y-2">
        {tachesFiltrees.length > 0 ? (
          <AnimatePresence>
            {tachesFiltrees.map(tache => renderTache(tache))}
          </AnimatePresence>
        ) : (
          <div className={`p-8 text-center rounded-lg ${
            modeSombre ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            {recherche || filtreCourant !== 'toutes' ? (
              <>
                <p className="text-lg font-medium">Aucune tâche ne correspond à vos critères</p>
                <button
                  onClick={() => {
                    setRecherche('');
                    setFiltreCourant('toutes');
                  }}
                  className="mt-2 text-blue-500 hover:underline"
                >
                  Réinitialiser les filtres
                </button>
              </>
            ) : (
              <>
                <p className="text-lg font-medium">Aucune tâche pour le moment</p>
                <p className="text-sm mt-1 opacity-70">Ajoutez votre première tâche pour commencer</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionTaches;
