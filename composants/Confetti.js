import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

/**
 * @component Confetti
 * @description Génère des animations de confettis personnalisables pour célébrer les accomplissements
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.type - Type d'animation: 'standard', 'shower', 'fireworks', 'stars'
 * @param {number} props.duration - Durée de l'animation en ms (défaut: 2000)
 * @param {Array} props.colors - Tableau de couleurs personnalisées
 * @param {Object} props.options - Options avancées pour canvas-confetti
 * @returns {null} - Le composant ne rend aucun élément visible
 */
export default function Confetti({
  type = "standard",
  duration = 2000,
  colors,
  options = {}
}) {
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    // Palettes de couleurs par défaut selon le type d'animation
    const defaultColors = {
      standard: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d'],
      fireworks: ['#ff0000', '#ffa500', '#ffff00', '#00ff00', '#0000ff', '#4b0082'],
      stars: ['#FFD700', '#FFA500', '#FF4500', '#FFFF00']
    };

    // Sélection de la palette de couleurs
    const selectedColors = colors || defaultColors[type] || defaultColors.standard;

    // Configuration selon le type d'animation
    switch(type) {
      case "fireworks":
        // Effet de feux d'artifice plus complexe
        const endTime = Date.now() + duration;
        const runFireworks = () => {
          if (Date.now() < endTime) {
            // Position aléatoire en x
            const position = {
              x: 0.2 + Math.random() * 0.6,
              y: 0.4 + Math.random() * 0.2
            };
            
            // Couleurs aléatoires
            const randomColors = [
              selectedColors[Math.floor(Math.random() * selectedColors.length)],
              selectedColors[Math.floor(Math.random() * selectedColors.length)]
            ];
            
            // Éclat principal
            confetti({
              particleCount: 40,
              startVelocity: 30,
              spread: 360,
              origin: position,
              colors: randomColors,
              ...options
            });
            
            requestAnimationFrame(runFireworks);
          } else {
            setIsPlaying(false);
          }
        };
        
        runFireworks();
        break;
      
      case "shower":
        // Pluie continue de confettis
        const end = Date.now() + duration;
        
        const runShower = () => {
          if (Date.now() < end) {
            confetti({
              particleCount: 2,
              angle: 60,
              spread: 55,
              origin: { x: 0, y: 0.1 },
              colors: selectedColors,
              ...options
            });
            
            confetti({
              particleCount: 2,
              angle: 120,
              spread: 55,
              origin: { x: 1, y: 0.1 },
              colors: selectedColors,
              ...options
            });
            
            requestAnimationFrame(runShower);
          } else {
            setIsPlaying(false);
          }
        };
        
        runShower();
        break;
        
      case "stars":
        // Configuration avec formes d'étoiles
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          shapes: ['star'],
          colors: selectedColors,
          gravity: 0.8,
          ...options
        });
        
        setTimeout(() => setIsPlaying(false), 1000);
        break;
      
      default:
        // Animation standard
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: selectedColors,
          ...options
        });
        
        setTimeout(() => setIsPlaying(false), 1000);
    }
    
    // Nettoyage à la destruction du composant
    return () => {
      // canvas-confetti ne nécessite pas de nettoyage spécifique
      setIsPlaying(false);
    };
  }, [type, duration, colors, options]);

  // Exposer une méthode pour déclencher à nouveau l'animation si nécessaire
  if (typeof window !== 'undefined') {
    window.triggerConfetti = () => setIsPlaying(true);
  }

  // Ce composant ne rend aucun élément visible
  return null;
}
