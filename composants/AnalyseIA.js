import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiBrain, FiTrendingUp, FiStar, FiAward, FiHeart } from "react-icons/fi";
import Confetti from "./Confetti";

/**
 * @component AnalyseIA
 * @description Analyse intelligente des performances de l'utilisateur avec feedback personnalisé
 * et recommendations adaptatives basées sur l'historique
 * 
 * @param {Object} props - Propriétés du composant
 * @param {number} props.tauxReussite - Taux de réussite journalier (0-100)
 * @param {number} props.note - Note obtenue (0-20)
 * @param {number} props.streak - Nombre de jours consécutifs actifs
 * @param {Array} props.historique - Données historiques pour analyse tendancielle
 * @param {Object} props.utilisateur - Informations utilisateur pour personnalisation
 * @param {string} props.theme - Thème de couleur choisi par l'utilisateur
 * @returns {JSX.Element} - Interface d'analyse interactive et motivante
 */
export default function AnalyseIA({
  tauxReussite = 0,
  note = 0,
  streak = 0,
  historique = [],
  utilisateur = {},
  theme = "default"
}) {
  // États locaux pour gérer les animations et interactions
  const [showConfetti, setShowConfetti] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [tendance, setTendance] = useState(null); // 'hausse', 'stable', 'baisse'
  const [animateScore, setAnimateScore] = useState(false);
  
  // Configuration des thèmes de couleur
  const themes = {
    default: {
      primary: "text-blue-700",
      background: "bg-white",
      gradient: "from-blue-50 to-indigo-50",
      border: "border-blue-200",
      accent: "text-indigo-600"
    },
    success: {
      primary: "text-green-700",
      background: "bg-green-50",
      gradient: "from-green-50 to-emerald-50",
      border: "border-green-200",
      accent: "text-emerald-600"
    },
    warning: {
      primary: "text-amber-700",
      background: "bg-amber-50",
      gradient: "from-amber-50 to-yellow-50",
      border: "border-amber-200",
      accent: "text-yellow-600"
    },
    danger: {
      primary: "text-red-700",
      background: "bg-red-50",
      gradient: "from-red-50 to-rose-50",
      border: "border-red-200",
      accent: "text-rose-600"
    },
    dark: {
      primary: "text-gray-100",
      background: "bg-gray-800",
      gradient: "from-gray-800 to-gray-900",
      border: "border-gray-700",
      accent: "text-blue-400"
    }
  };
  
  // Sélection du thème actif
  const activeTheme = themes[theme] || themes.default;
  
  // Bibliothèque de messages motivants catégorisés
  const messages = {
    excellent: [
      "Excellent travail ! Ta persévérance forge ta réussite jour après jour.",
      "Impressionnant ! Tu es sur la voie de la maîtrise, continue sur cette lancée !",
      "Performance remarquable ! Ta discipline et ta détermination sont exemplaires.",
      "Exceptionnel ! Tes résultats reflètent parfaitement ton engagement.",
      "Magnifique journée ! Ta constance porte ses fruits, garde ce cap !",
      "Brillant ! Tu as dépassé tes objectifs aujourd'hui, quelle progression !"
    ],
    bon: [
      "Bon travail ! Renforce ta rigueur pour franchir le prochain palier.",
      "Progression solide ! Quelques ajustements mineurs te mèneront à l'excellence.",
      "Bravo pour ta persévérance ! Concentre-toi sur les petits détails maintenant.",
      "Tu avances bien ! Un peu plus de constance et tu atteindras tes objectifs.",
      "Belle journée productive ! Continue d'affiner ta méthode pour progresser."
    ],
    encouragement: [
      "Ne lâche pas ! Chaque petit effort quotidien construit ton succès futur.",
      "Persévère ! Les journées difficiles forgent ta résilience et ta force.",
      "Continue d'avancer ! Le progrès n'est pas toujours linéaire, mais il est certain.",
      "Garde confiance ! Demain est une nouvelle opportunité de te dépasser.",
      "Reste motivé(e) ! Rappelle-toi pourquoi tu as commencé ce parcours."
    ],
    conseil: [
      "Essaie de commencer par les tâches les plus importantes dès le matin.",
      "Divise tes grandes tâches en étapes plus petites et plus gérables.",
      "Prends de courtes pauses régulières pour maintenir ton niveau de concentration.",
      "Planifie ta journée la veille pour commencer avec clarté et détermination.",
      "Célèbre chaque petit succès, ils constituent la base de tes grandes réussites."
    ]
  };
  
  // Analyse de tendance à partir de l'historique
  useEffect(() => {
    if (historique && historique.length > 4) {
      // Extraction des 5 derniers taux de réussite
      const derniersTaux = historique.slice(0, 5).map(jour => jour.taux_reussite || 0);
      
      // Calcul de la moyenne des variations
      let variations = 0;
      for (let i = 0; i < derniersTaux.length - 1; i++) {
        variations += derniersTaux[i] - derniersTaux[i + 1];
      }
      
      const moyenneVariation = variations / (derniersTaux.length - 1);
      
      // Détermination de la tendance
      if (moyenneVariation > 5) setTendance('hausse');
      else if (moyenneVariation < -5) setTendance('baisse');
      else setTendance('stable');
    }
  }, [historique]);
  
  // Animation du score lors du changement
  useEffect(() => {
    setAnimateScore(true);
    const timer = setTimeout(() => setAnimateScore(false), 1000);
    return () => clearTimeout(timer);
  }, [tauxReussite, note]);
  
  // Confettis pour les excellentes performances
  useEffect(() => {
    if (tauxReussite >= 90) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [tauxReussite]);
  
  // Sélection aléatoire d'un message approprié
  useEffect(() => {
    let categorie = 'encouragement';
    
    if (tauxReussite >= 85) categorie = 'excellent';
    else if (tauxReussite >= 60) categorie = 'bon';
    
    const messagesCategorie = messages[categorie];
    setMessageIndex(Math.floor(Math.random() * messagesCategorie.length));
  }, [tauxReussite]);
  
  // Récupération du message à afficher
  const getMessage = () => {
    if (tauxReussite >= 85) return messages.excellent[messageIndex % messages.excellent.length];
    if (tauxReussite >= 60) return messages.bon[messageIndex % messages.bon.length];
    return messages.encouragement[messageIndex % messages.encouragement.length];
  };
  
  // Conseils personnalisés basés sur les performances
  const getConseil = () => {
    // Sélection d'un conseil aléatoire
    return messages.conseil[Math.floor(Math.random() * messages.conseil.length)];
  };
  
  // Icône et couleur selon la tendance
  const getTendanceIcon = () => {
    if (tendance === 'hausse') return <FiTrendingUp className="text-green-500" />;
    if (tendance === 'baisse') return <FiTrendingUp className="text-red-500 transform rotate-180" />;
    return <FiTrendingUp className="text-yellow-500 transform rotate-90" />;
  };
  
  // Niveau de performance textuellement
  const getNiveauPerformance = () => {
    if (tauxReussite >= 90) return "Excellent";
    if (tauxReussite >= 75) return "Très bon";
    if (tauxReussite >= 60) return "Bon";
    if (tauxReussite >= 40) return "Moyen";
    return "À améliorer";
  };

  return (
    <motion.div 
      className={`p-6 ${activeTheme.background} bg-gradient-to-br ${activeTheme.gradient} rounded-xl shadow-lg text-center mt-12 border ${activeTheme.border} overflow-hidden relative`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Effet de confettis pour célébrer les excellentes performances */}
      {showConfetti && <Confetti />}
      
      {/* Cercles décoratifs en arrière-plan */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500 opacity-5 rounded-full"></div>
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-500 opacity-5 rounded-full"></div>
      
      <header className="flex items-center justify-center space-x-2 mb-6">
        <FiBrain className={`text-3xl ${activeTheme.primary}`} />
        <h2 className={`text-2xl font-bold ${activeTheme.primary}`}>Analyse IA du jour</h2>
      </header>
      
      {/* Message principal avec animation */}
      <motion.p 
        className={`text-lg ${tauxReussite >= 85 ? 'font-semibold' : ''} text-gray-700 max-w-lg mx-auto`}
        key={messageIndex} // Force re-render pour animation
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {getMessage()}
      </motion.p>
      
      {/* Affichage du score avec animation */}
      <motion.div 
        className="flex justify-center items-center space-x-8 my-6"
        animate={{ scale: animateScore ? [1, 1.1, 1] : 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <motion.div 
            className={`text-3xl font-bold ${tauxReussite >= 75 ? 'text-green-600' : tauxReussite >= 50 ? 'text-amber-600' : 'text-red-600'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {tauxReussite}%
          </motion.div>
          <p className="text-sm text-gray-500">Taux de réussite</p>
        </div>
        
        <div className="h-12 w-px bg-gray-200"></div>
        
        <div className="text-center">
          <motion.div 
            className={`text-3xl font-bold ${note >= 15 ? 'text-green-600' : note >= 10 ? 'text-amber-600' : 'text-red-600'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {note}/20
          </motion.div>
          <p className="text-sm text-gray-500">Note</p>
        </div>
      </motion.div>
      
      {/* Badge de niveau de performance */}
      <motion.div 
        className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${
          tauxReussite >= 75 ? 'bg-green-100 text-green-800' : 
          tauxReussite >= 50 ? 'bg-amber-100 text-amber-800' : 
          'bg-red-100 text-red-800'
        } mb-4`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        Niveau: {getNiveauPerformance()}
      </motion.div>
      
      {/* Bouton pour afficher plus de détails */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`mt-2 text-sm ${activeTheme.accent} hover:underline focus:outline-none transition-colors`}
      >
        {showDetails ? "Masquer les détails" : "Plus de détails et conseils"}
      </button>
      
      {/* Détails supplémentaires en accordéon */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            className="mt-4 pt-4 border-t border-gray-100 text-left"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Tendance */}
            {tendance && (
              <div className="flex items-center mb-3">
                <span className="text-sm text-gray-600 mr-2">Tendance:</span>
                <div className="flex items-center">
                  {getTendanceIcon()}
                  <span className="text-sm ml-1">
                    {tendance === 'hausse' ? 'En progression' : 
                     tendance === 'baisse' ? 'En diminution' : 'Stable'}
                  </span>
                </div>
              </div>
            )}
            
            {/* Conseil personnalisé */}
            <div className="bg-blue-50 p-3 rounded-lg mb-3">
              <div className="flex items-start">
                <FiStar className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800 mb-1">Conseil du jour:</p>
                  <p className="text-sm text-gray-700">{getConseil()}</p>
                </div>
              </div>
            </div>
            
            {/* Streak si disponible */}
            {streak > 0 && (
              <div className="flex items-center space-x-2 mb-3">
                <FiAward className="text-amber-500" />
                <span className="text-sm">
                  <span className="font-medium">{streak} jour{streak > 1 ? 's' : ''}</span> consécutif{streak > 1 ? 's' : ''}
                </span>
              </div>
            )}
            
            {/* Prochain palier */}
            <div className="flex items-center space-x-2">
              <FiHeart className="text-purple-500" />
              <span className="text-sm">
                Encore {tauxReussite >= 85 ? 15 : tauxReussite >= 60 ? 25 : 60 - tauxReussite}% pour atteindre le prochain palier
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
