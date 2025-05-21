import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCornerUpRight, FiShare2, FiHeart, FiCopy, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

/**
 * @component Citations
 * @description Composant pour afficher et gérer les citations motivantes avec
 * rotation automatique, possibilité de marquer comme favoris et partager
 * 
 * @param {Object} props - Propriétés du composant
 * @param {Array} props.citations - Liste des citations à afficher
 * @param {boolean} props.rotation - Activer la rotation automatique des citations
 * @param {number} props.intervalleRotation - Intervalle de rotation en secondes
 * @param {boolean} props.modeSombre - Mode sombre activé
 * @param {string} props.categorie - Catégorie de citations à afficher (optional)
 * @param {boolean} props.permettreFavoris - Permettre de marquer comme favoris
 * @returns {JSX.Element} Interface de citation avec interactions
 */
const Citations = ({
  citations = [],
  rotation = true,
  intervalleRotation = 30,
  modeSombre = false,
  categorie = null,
  permettreFavoris = true
}) => {
  // États du composant
  const [indexCitation, setIndexCitation] = useState(0);
  const [citationsFiltered, setCitationsFiltered] = useState([]);
  const [favoris, setFavoris] = useState([]);
  const [copiee, setCopiee] = useState(false);
  const [autoplay, setAutoplay] = useState(rotation);
  const [transition, setTransition] = useState(false);
  
  // Référence pour le timer de rotation
  const timerRef = useRef(null);
  
  // Citations par défaut si aucune n'est fournie
  const citationsParDefaut = [
    {
      texte: "La discipline est le pont entre les objectifs et leurs accomplissements.",
      auteur: "Jim Rohn",
      categorie: "productivite"
    },
    {
      texte: "Peu importe la lenteur à laquelle tu avances, l'important est de ne pas t'arrêter.",
      auteur: "Confucius",
      categorie: "perseverance"
    },
    {
      texte: "Le succès n'est pas définitif, l'échec n'est pas fatal. C'est le courage de continuer qui compte.",
      auteur: "Winston Churchill",
      categorie: "perseverance"
    },
    {
      texte: "Un petit progrès chaque jour mène à des résultats extraordinaires.",
      auteur: "Anonyme",
      categorie: "progres"
    },
    {
      texte: "La constance est plus importante que l'intensité.",
      auteur: "Simon Sinek",
      categorie: "constance"
    },
    {
      texte: "Commence là où tu es. Utilise ce que tu as. Fais ce que tu peux.",
      auteur: "Arthur Ashe",
      categorie: "action"
    },
    {
      texte: "Les habitudes quotidiennes déterminent ta destinée.",
      auteur: "Anonyme",
      categorie: "habitudes"
    },
    {
      texte: "L'autodiscipline est le premier pas vers la liberté véritable.",
      auteur: "Aristote",
      categorie: "discipline"
    },
    {
      texte: "Ce n'est pas le temps qui compte, c'est ce que tu fais de ce temps.",
      auteur: "Bruce Lee",
      categorie: "temps"
    },
    {
      texte: "Fais aujourd'hui ce que les autres ne feront pas, pour accomplir demain ce que les autres ne peuvent pas.",
      auteur: "Jerry Rice",
      categorie: "discipline"
    }
  ];
  
  // Charger les favoris au démarrage
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage) {
      const savedFavoris = localStorage.getItem('citations-favorites');
      if (savedFavoris) {
        try {
          setFavoris(JSON.parse(savedFavoris));
        } catch (err) {
          console.error('Erreur lors du chargement des favoris:', err);
          setFavoris([]);
        }
      }
    }
  }, []);
  
  // Filtrer les citations selon la catégorie
  useEffect(() => {
    let citationsSource = citations.length > 0 ? citations : citationsParDefaut;
    
    if (categorie) {
      citationsSource = citationsSource.filter(c => c.categorie === categorie);
    }
    
    // S'assurer qu'il y a au moins une citation
    if (citationsSource.length === 0) {
      citationsSource = citationsParDefaut;
    }
    
    setCitationsFiltered(citationsSource);
    setIndexCitation(Math.floor(Math.random() * citationsSource.length));
  }, [citations, categorie]);
  
  // Rotation automatique des citations
  useEffect(() => {
    if (autoplay && citationsFiltered.length > 1) {
      timerRef.current = setInterval(() => {
        setTransition(true);
        setTimeout(() => {
          changerCitation(1);
          setTransition(false);
        }, 500);
      }, intervalleRotation * 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [autoplay, intervalleRotation, indexCitation, citationsFiltered.length]);
  
  // Fonction pour changer de citation manuellement
  const changerCitation = (direction) => {
    if (citationsFiltered.length <= 1) return;
    
    setIndexCitation(current => {
      let newIndex = (current + direction) % citationsFiltered.length;
      if (newIndex < 0) newIndex = citationsFiltered.length - 1;
      return newIndex;
    });
    
    // Réinitialiser le timer en cas de changement manuel
    if (timerRef.current) {
      clearInterval(timerRef.current);
      if (autoplay) {
        timerRef.current = setInterval(() => {
          setTransition(true);
          setTimeout(() => {
            changerCitation(1);
            setTransition(false);
          }, 500);
        }, intervalleRotation * 1000);
      }
    }
  };
  
  // Fonction pour ajouter/retirer des favoris
  const toggleFavori = (citation) => {
    const isFavori = favoris.some(fav => fav.texte === citation.texte);
    
    let nouveauxFavoris;
    if (isFavori) {
      nouveauxFavoris = favoris.filter(fav => fav.texte !== citation.texte);
    } else {
      nouveauxFavoris = [...favoris, citation];
    }
    
    setFavoris(nouveauxFavoris);
    
    // Sauvegarder dans localStorage
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.setItem('citations-favorites', JSON.stringify(nouveauxFavoris));
    }
  };
  
  // Fonction pour copier la citation
  const copierCitation = (citation) => {
    const texteToCopy = `"${citation.texte}" — ${citation.auteur}`;
    navigator.clipboard.writeText(texteToCopy).then(() => {
      setCopiee(true);
      setTimeout(() => setCopiee(false), 2000);
    }).catch(err => {
      console.error('Erreur lors de la copie:', err);
    });
  };
  
  // Fonction pour partager la citation
  const partagerCitation = (citation) => {
    const texteToCopy = `"${citation.texte}" — ${citation.auteur}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Citation inspirante',
        text: texteToCopy
      }).catch(err => {
        console.error('Erreur lors du partage:', err);
      });
    } else {
      copierCitation(citation);
    }
  };
  
  // Si aucune citation n'est disponible
  if (!citationsFiltered.length) {
    return (
      <div className={`p-6 rounded-lg text-center ${
        modeSombre ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
      }`}>
        <p>Aucune citation disponible pour le moment.</p>
      </div>
    );
  }
  
  // Obtenir la citation courante
  const citationCourante = citationsFiltered[indexCitation];
  const estFavori = favoris.some(fav => fav.texte === citationCourante.texte);
  
  return (
    <div className={`relative overflow-hidden rounded-xl shadow-lg ${
      modeSombre ? 'bg-gray-800' : 'bg-white'
    }`}>
      {/* Badge catégorie (si définie) */}
      {citationCourante.categorie && (
        <div className="absolute top-3 right-3">
          
