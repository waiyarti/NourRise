import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

/**
 * @component AnalyseIA
 * @description Composant d'analyse IA avancée qui fournit un feedback personnalisé
 * en fonction du taux de réussite et de la note de l'utilisateur
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {number} props.tauxReussite - Le taux de réussite de l'utilisateur (0-100)
 * @param {number} props.note - La note obtenue par l'utilisateur (/20)
 * @param {number} props.streak - Le nombre de jours consécutifs (optionnel)
 * @returns {JSX.Element} - L'élément React à afficher
 */
export default function AnalyseIA({ tauxReussite, note, streak = 0 }) {
  // États pour gérer l'animation et l'interaction
  const [message, setMessage] = useState("");
  const [conseil, setConseil] = useState("");
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [animation, setAnimation] = useState(false);

  // Tableaux de messages et conseils personnalisés
  const messagesExcellents = [
    "Excellent travail ! Reste constant, la persévérance mène au succès.",
    "Remarquable ! Tu maintiens un niveau d'excellence impressionnant.",
    "Bravo ! Ta discipline porte ses fruits, continue sur cette voie.",
    "Performance exceptionnelle ! Tu bâtis une routine solide jour après jour.",
    "Magnifique travail ! La constance est la clé de ton succès."
  ];

  const messagesBons = [
    "Bon début ! Renforce ta rigueur pour aller encore plus loin.",
    "Tu es sur la bonne voie ! Un peu plus d'effort et tu atteindras l'excellence.",
    "Bon travail ! Concentre-toi sur les détails pour progresser encore plus.",
    "Bien joué ! Établis une routine plus solide pour t'améliorer davantage.",
    "Progrès encourageants ! Identifie ce qui t'a freiné aujourd'hui."
  ];

  const messagesAmeliorer = [
    "Ne lâche pas ! Travaille un peu plus chaque jour, tu es capable !",
    "Chaque petit progrès compte. Concentre-toi sur une tâche à la fois.",
    "C'est en persévérant qu'on progresse. Demain sera meilleur !",
    "Identifie tes obstacles et élabore un plan pour les surmonter.",
    "Les jours difficiles forgent la discipline. Continue d'avancer !"
  ];

  const conseilsPersonnalises = [
    "Essaie de commencer ta journée avec la tâche la plus difficile.",
    "Programme tes tâches la veille pour gagner en efficacité.",
    "Utilise la technique Pomodoro : 25 minutes de travail, 5 minutes de pause.",
    "Élimine les distractions pendant tes sessions de travail intensif.",
    "Célèbre tes petites victoires pour maintenir ta motivation.",
    "Note tes progrès quotidiens pour visualiser ton évolution.",
    "Fixe-toi des objectifs SMART : Spécifiques, Mesurables, Atteignables, Réalistes et Temporels."
  ];

  // Sélectionne aléatoirement un message et un conseil selon le niveau de performance
  useEffect(() => {
    let messageArray;
    if (tauxReussite >= 85) {
      messageArray = messagesExcellents;
    } else if (tauxReussite >= 60) {
      messageArray = messagesBons;
    } else {
      messageArray = messagesAmeliorer;
    }

    // Sélection aléatoire
    const randomMessageIndex = Math.floor(Math.random() * messageArray.length);
    const randomConseilIndex = Math.floor(Math.random() * conseilsPersonnalises.length);

    setMessage(messageArray[randomMessageIndex]);
    setConseil(conseilsPersonnalises[randomConseilIndex]);

    // Active l'animation à chaque changement de message
    setAnimation(true);
    const timer = setTimeout(() => setAnimation(false), 1000);

    return () => clearTimeout(timer);
  }, [tauxReussite]);

  // Fonction pour formater la note avec des émojis
  const getScoreEmoji = () => {
    if (note >= 16) return "🏆";
    if (note >= 14) return "🥇";
    if (note >= 12) return "🥈";
    if (note >= 10) return "🥉";
    if (note >= 8) return "⭐";
    return "🎯";
  };

  return (
    <motion.div 
      className="p-6 bg-white rounded-lg shadow-lg text-center mt-12 overflow-hidden relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Cercles décoratifs en arrière-plan pour effet glassmorphism */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500 opacity-5 rounded-full"></div>
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-500 opacity-5 rounded-full"></div>
      
      {/* Titre et icône */}
      <motion.h2 
        className="text-2xl font-bold text-blue-700 mb-4 flex items-center justify-center gap-2"
        animate={{ scale: animation ? [1, 1.05, 1] : 1 }}
        transition={{ duration: 0.5 }}
      >
        <span className="text-2xl">📊</span> Analyse IA du jour
      </motion.h2>
      
      {/* Message principal */}
      <motion.p 
        className="text-lg text-gray-700 mb-4"
        animate={{ opacity: animation ? [0.7, 1] : 1 }}
        transition={{ duration: 0.5 }}
      >
        {message}
      </motion.p>
      
      {/* Indicateurs de performance */}
      <div className="flex justify-center items-center space-x-6 my-4">
        <div className="text-center">
          <motion.div 
            className={`text-2xl font-bold ${
              tauxReussite >= 85 ? 'text-green-600' : 
              tauxReussite >= 60 ? 'text-amber-600' : 
              'text-red-600'
            }`}
            animate={{ scale: animation ? [1, 1.1, 1] : 1 }}
          >
            {tauxReussite}%
          </motion.div>
          <p className="text-xs text-gray-500">Taux de réussite</p>
        </div>
        
        <div className="h-10 w-px bg-gray-200"></div>
        
        <div className="text-center">
          <motion.div 
            className="text-2xl font-bold text-indigo-600 flex items-center justify-center"
            animate={{ scale: animation ? [1, 1.1, 1] : 1 }}
          >
            {note}/20 <span className="ml-1">{getScoreEmoji()}</span>
          </motion.div>
          <p className="text-xs text-gray-500">Note</p>
        </div>
        
        {streak > 0 && (
          <>
            <div className="h-10 w-px bg-gray-200"></div>
            
            <div className="text-center">
              <motion.div 
                className="text-2xl font-bold text-amber-600 flex items-center"
                animate={{ scale: animation ? [1, 1.1, 1] : 1 }}
              >
                {streak} 🔥
              </motion.div>
              <p className="text-xs text-gray-500">Jours consécutifs</p>
            </div>
          </>
        )}
      </div>
      
      {/* Bouton pour afficher plus de détails */}
      <button
        onClick={() => setDetailsVisible(!detailsVisible)}
        className="text-sm text-blue-600 hover:underline focus:outline-none transition-colors mt-2"
      >
        {detailsVisible ? "Masquer les conseils" : "Voir les conseils personnalisés"}
      </button>
      
      {/* Section de détails et conseils */}
      {detailsVisible && (
        <motion.div
          className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <p className="font-medium text-blue-700 mb-2">Conseil du jour:</p>
          <p className="italic">{conseil}</p>
          
          <div className="mt-3 text-xs text-gray-500">
            <p>Prochain palier: {
              tauxReussite >= 85 ? '100% (Perfection)' : 
              tauxReussite >= 60 ? '85% (Excellence)' : 
              '60% (Progression)'
            }</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
