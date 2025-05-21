import { useEffect, useState, useCallback } from "react";
import confetti from "canvas-confetti";

/**
 * @component Confetti
 * @description Génère des animations de confettis personnalisables pour célébrer les accomplissements
 * 
 * @param {Object} props - Propriétés du composant
 * @param {string} props.type - Type d'animation: 'standard', 'shower', 'burst', 'fireworks', 'stars'
 * @param {number} props.duration - Durée de l'animation en ms (défaut: 2000)
 * @param {Array} props.colors - Tableau de couleurs personnalisées
 * @param {Object} props.options - Options avancées pour canvas-confetti
 * @param {boolean} props.autoStart - Démarre automatiquement (défaut: true)
 * @param {function} props.onComplete - Callback appelé quand l'animation est terminée
 * @returns {JSX.Element} Composant invisible qui génère des animations
 */
export default function Confetti({
  type = "standard",
  duration = 2000,
  colors,
  options = {},
  autoStart = true,
  onComplete
}) {
  // État pour gérer les animations en cours
  const [isAnimating, setIsAnimating] = useState(autoStart);
  
  // Couleurs par défaut pour les différentes animations
  const defaultColors = {
    standard: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'],
    fireworks: ['#ff0000', '#ffa500', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#ee82ee'],
    stars: ['#FFD700', '#FFA500', '#FF4500', '#FFFF00'],
    shower: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b'],
    burst: ['#00ff00', '#ff00ff', '#ffff00', '#00ffff']
  };
  
  // Sélection de la palette de couleurs
  const selectedColors = colors || defaultColors[type] || defaultColors.standard;
  
  // Animation standard: pluie de confettis simple
  const standardConfetti = useCallback(() => {
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
      colors: selectedColors,
      ...options
    });
  }, [selectedColors, options]);
  
  // Animation de douche: continue pendant toute la durée
  const showerConfetti = useCallback(() => {
    const end = Date.now() + duration;
    
    const runAnimation = () => {
      if (Date.now() < end) {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: selectedColors,
          ...options
        });
        
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: selectedColors,
          ...options
        });
        
        requestAnimationFrame(runAnimation);
      } else {
        setIsAnimating(false);
        if (onComplete) onComplete();
      }
    };
    
    runAnimation();
  }, [duration, selectedColors, options, onComplete]);
  
  // Animation d'explosion en cercle
  const burstConfetti = useCallback(() => {
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const particleCount = 150;
    
    confetti({
      ...defaults,
      particleCount,
      colors: selectedColors,
      origin: { x: 0.5, y: 0.5 },
      ...options
    });
    
    setTimeout(() => {
      setIsAnimating(false);
      if (onComplete) onComplete();
    }, 800);
  }, [selectedColors, options, onComplete]);
  
  // Animation de feux d'artifice
  const fireworksConfetti = useCallback(() => {
    const end = Date.now() + duration;
    
    const runFireworks = () => {
      if (Date.now() < end) {
        // Randomize origin position
        const position = {
          x: 0.2 + Math.random() * 0.6,
          y: 0.2 + Math.random() * 0.3
        };
        
        // Shoot upward
        confetti({
          particleCount: 20,
          angle: 270,
          spread: 25,
          origin: position,
          startVelocity: 25,
          gravity: 0.8,
          colors: selectedColors,
          ...options
        });
        
        // Explosion
        setTimeout(() => {
          confetti({
            particleCount: 80,
            angle: 90,
            spread: 360,
            origin: {
              x: position.x,
              y: position.y + 0.1
            },
            colors: selectedColors,
            startVelocity: 25,
            gravity: 0.8,
            ...options
          });
        }, 200);
        
        setTimeout(() => requestAnimationFrame(runFireworks), 450);
      } else {
        setIsAnimating(false);
        if (onComplete) onComplete();
      }
    };
    
    runFireworks();
  }, [duration, selectedColors, options, onComplete]);
  
  // Animation d'étoiles qui tombent
  const starsConfetti = useCallback(() => {
    const defaults = { 
      shapes: ["star"],
      gravity: 0.6,
      ...options
    };
    
    const shootStars = () => {
      confetti({
        ...defaults,
        particleCount: 10,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.1 },
        colors: selectedColors
      });
      
      confetti({
        ...defaults,
        particleCount: 10,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.1 },
        colors: selectedColors
      });
    };
    
    // Shoot stars multiple times
    shootStars();
    
    const interval = setInterval(shootStars, 400);
    
    setTimeout(() => {
      clearInterval(interval);
      setIsAnimating(false);
      if (onComplete) onComplete();
    }, duration);
  }, [duration, selectedColors, options, onComplete]);
  
  // Exécution de l'animation au chargement si autoStart est true
  useEffect(() => {
    if (!isAnimating) return;
    
    switch(type) {
      case "shower":
        showerConfetti();
        break;
      case "burst":
        burstConfetti();
        break;
      case "fireworks":
        fireworksConfetti();
        break;
      case "stars":
        starsConfetti();
        break;
      default:
        standardConfetti();
        setTimeout(() => {
          setIsAnimating(false);
          if (onComplete) onComplete();
        }, 800);
    }
    
    // Nettoyage
    return () => {
      setIsAnimating(false);
    };
  }, [
    isAnimating,
    type,
    standardConfetti,
    showerConfetti,
    burstConfetti,
    fireworksConfetti,
    starsConfetti,
    onComplete
  ]);
  
  // Méthode publique pour déclencher l'animation manuellement
  const trigger = useCallback(() => {
    setIsAnimating(true);
  }, []);
  
  // Exposer la méthode trigger
  if (typeof window !== 'undefined') {
    window.triggerConfetti = trigger;
  }
  
  // Composant sans rendu visuel
  return null;
}
