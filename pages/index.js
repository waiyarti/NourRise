import { useState, useEffect, useRef, useCallback } from "react";
import { format, isSameDay, addDays, isAfter, isBefore, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import dynamic from "next/dynamic";
import { supabase } from "../supabaseClient";
import { useRouter } from "next/router";
import Head from "next/head";
import { 
  FiAward, FiTrendingUp, FiZap, FiCheck, FiClock, FiX, FiFire, 
  FiStar, FiHeart, FiAperture, FiPlus, FiCalendar, FiCheckCircle,
  FiSettings, FiLogOut, FiUser, FiRefreshCw, FiEye, FiSearch,
  FiEyeOff, FiAlertCircle, FiChevronDown, FiChevronUp, FiShare2, 
  FiBookmark, FiShield, FiTrendingDown, FiSave, FiActivity, FiSun, FiMoon
} from "react-icons/fi";

// Import dynamique des composants lourds pour optimiser le chargement initial
const GraphiqueEvolution = dynamic(() => import("../composants/GraphiqueEvolution"), { ssr: false });
const GraphiqueNote = dynamic(() => import("../composants/GraphiqueNote"), { ssr: false });
const AnalyseIA = dynamic(() => import("../composants/AnalyseIA"), { ssr: false });

// Importation optimisée de la librairie confetti (côté client uniquement)
const confetti = dynamic(() => import('canvas-confetti'), { ssr: false });

/**
 * @fileoverview Page principale de l'application NourRise
 * Cette application aide les utilisateurs à développer des habitudes positives
 * en utilisant des techniques de gamification et des systèmes de récompense.
 * 
 * @author NourRise Team
 * @version 2.0.0
 */

// ===== CONSTANTES SYSTÈME =====

/**
 * Configuration des récompenses variables et systèmes de motivation
 * Utilise des principes psychologiques pour maximiser l'engagement
 */
const RECOMPENSES_VARIABLES = {
  BONUS_SURPRISE: [10, 20, 50, 100],
  MULTIPLICATEURS: [1.5, 2, 3],
  COMBO_REQUIS: [3, 5, 7, 10],
  POWER_HOURS: {
    MATIN: { debut: 5, fin: 8, multiplicateur: 2, nom: "Bonus Fajr", 
             description: "Profite de l'aube pour multiplier tes bienfaits" },
    SOIREE: { debut: 21, fin: 23, multiplicateur: 1.5, nom: "Bonus Réflexion", 
              description: "Le calme du soir pour finir la journée en beauté" }
  }
};

/**
 * Système de progression par niveaux avec avantages exclusifs
 * Chaque niveau offre de nouvelles fonctionnalités et récompenses
 */
const NIVEAUX = [
  { niveau: 1, nom: "Débutant", requis: 0, couleur: "from-blue-400 to-blue-600", icone: "🌱", 
    motivation: "Le début d'un beau voyage...", bonus: "Débloquez plus de tâches !", medaille: "🥉" },
  { niveau: 2, nom: "Apprenti", requis: 100, couleur: "from-green-400 to-green-600", icone: "🌿", 
    motivation: "Tu progresses bien !", bonus: "Accès aux défis quotidiens", medaille: "🥈" },
  { niveau: 3, nom: "Initié", requis: 300, couleur: "from-yellow-400 to-yellow-600", icone: "⭐", 
    motivation: "Ta persévérance paie !", bonus: "Multiplicateur de points x1.5", medaille: "🥇" },
  { niveau: 4, nom: "Expert", requis: 600, couleur: "from-purple-400 to-purple-600", icone: "💫", 
    motivation: "Tu deviens une source d'inspiration !", bonus: "Débloquez les achievements spéciaux", medaille: "🏆" },
  { niveau: 5, nom: "Maître", requis: 1000, couleur: "from-red-400 to-red-600", icone: "🌟", 
    motivation: "Tu es exceptionnel !", bonus: "Mode Mentor débloqué", medaille: "👑" },
  { niveau: 6, nom: "Légende", requis: 2000, couleur: "from-pink-400 to-pink-600", icone: "🔱", 
    motivation: "Tu es une véritable légende !", bonus: "Personnalisation complète", medaille: "⭐" }
];

/**
 * Catégories de tâches avec thématiques visuelles et motivationnelles
 * Permet une organisation claire et inspirante des activités
 */
const CATEGORIES = {
  TOUS: { 
    nom: "Tous", 
    icone: "📋", 
    couleur: "bg-gray-100 text-gray-800",
    theme: "bg-gray-500",
    description: "Toutes les catégories",
    motivation: "Vue d'ensemble de ta progression"
  },
  SPIRITUEL: { 
    nom: "Spirituel", 
    icone: "🕌", 
    couleur: "bg-purple-100 text-purple-800",
    theme: "bg-purple-500",
    description: "Élévation spirituelle",
    motivation: "Nourris ton âme"
  },
  SPORT: { 
    nom: "Sport", 
    icone: "💪", 
    couleur: "bg-green-100 text-green-800",
    theme: "bg-green-500",
    description: "Santé physique",
    motivation: "Prends soin de ton corps"
  },
  EDUCATION: { 
    nom: "Éducation", 
    icone: "📚", 
    couleur: "bg-blue-100 text-blue-800",
    theme: "bg-blue-500",
    description: "Développement intellectuel",
    motivation: "Cultive ton esprit"
  },
  DEVELOPPEMENT: { 
    nom: "Développement", 
    icone: "🚀", 
    couleur: "bg-yellow-100 text-yellow-800",
    theme: "bg-yellow-500",
    description: "Croissance personnelle",
    motivation: "Deviens meilleur chaque jour"
  }
};

/**
 * Citations motivationnelles dynamiques pour l'inspiration quotidienne
 * Sélection variée pour maintenir l'intérêt et la motivation
 */
const CITATIONS = [
  { texte: "Chaque petit progrès te rapproche de tes objectifs", auteur: "NourRise", categorie: "MOTIVATION" },
  { texte: "La constance est la clé du succès", auteur: "NourRise", categorie: "CONSTANCE" },
  { texte: "Un pas à la fois, mais toujours en avant", auteur: "NourRise", categorie: "PROGRESSION" },
  { texte: "La discipline est le pont entre les objectifs et leur réalisation", auteur: "NourRise", categorie: "DISCIPLINE" },
  { texte: "Le succès se construit chaque jour", auteur: "NourRise", categorie: "QUOTIDIEN" },
  { texte: "Ta détermination façonne ton destin", auteur: "NourRise", categorie: "DETERMINATION" },
  { texte: "L'excellence est un art qui s'acquiert par l'entraînement", auteur: "NourRise", categorie: "EXCELLENCE" },
  { texte: "Chaque difficulté rencontrée est une opportunité de croissance", auteur: "NourRise", categorie: "RESILIENCE" }
];

/**
 * Messages de succès personnalisés pour renforcer la motivation
 * Variation des messages pour éviter la lassitude
 */
const SUCCES_MESSAGES = [
  "Excellente réalisation ! 🌟",
  "Continue sur cette lancée ! 🚀",
  "Tu es sur la bonne voie ! 🎯",
  "Impressionnant ! 💫",
  "Tu progresses admirablement ! ⭐",
  "Quelle persévérance ! 💪",
  "C'est extraordinaire ! 🎉",
  "Une réussite de plus ! 🌈"
];

/**
 * Tâches journalières par défaut avec détails enrichis
 * Chaque tâche est préconfigurée avec des points, descriptions et conseils
 * @type {Array}
 */
const tachesJournalieresInitiales = [
  // Catégorie SPIRITUEL
  { 
    nom: "Coran", 
    coef: 5, 
    categorie: "SPIRITUEL", 
    points: 50,
    description: "Lecture et méditation du Coran",
    conseils: ["Choisis un moment calme", "Commence par une courte sourate", "Réfléchis au sens"],
    bonus: { type: "MULTIPLICATEUR", valeur: 2, condition: "avant_fajr" }
  },
  { 
    nom: "Dou'a matin et soir", 
    coef: 5, 
    categorie: "SPIRITUEL", 
    points: 50,
    rappel: true,
    heures: ["05:00", "19:00"]
  },
  // Ajout de tâches pour d'autres catégories
  { 
    nom: "Méditation", 
    coef: 3, 
    categorie: "DEVELOPPEMENT", 
    points: 30,
    description: "Méditation consciente",
    conseils: ["Trouve un endroit calme", "Respire profondément", "Reste dans le moment présent"]
  },
  { 
    nom: "Lecture enrichissante", 
    coef: 4, 
    categorie: "EDUCATION", 
    points: 40,
    description: "Lecture d'un livre éducatif"
  },
  { 
    nom: "Exercice physique", 
    coef: 4, 
    categorie: "SPORT", 
    points: 40,
    description: "Au moins 30 minutes d'activité physique"
  }
].map(t => ({ 
  ...t, 
  etat: "", 
  completed: false,
  derniere_realisation: null,
  streak: 0,
  meilleur_streak: 0,
  id: `task-${Date.now()}-${Math.floor(Math.random() * 1000000)}`
}));

/**
 * Composant principal de l'application NourRise
 * Gère l'affichage et la logique de l'application de développement personnel
 * @returns {JSX.Element} L'interface utilisateur complète
 */
export default function Home() {
  // ===== ÉTATS PRINCIPAUX =====
  // États de base pour l'utilisateur et les données
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [taches, setTaches] = useState([]);
  const [historique, setHistorique] = useState([]);
  const router = useRouter();

  // États pour les fonctionnalités et l'affichage
  const [niveau, setNiveau] = useState(1);
  const [points, setPoints] = useState(0);
  const [pointsJour, setPointsJour] = useState(0);
  const [streak, setStreak] = useState(0);
  const [notification, setNotification] = useState(null);
  const [citationDuJour, setCitationDuJour] = useState(null);
  const [categorieActive, setCategorieActive] = useState("TOUS");
  const [achievements, setAchievements] = useState([]);
  const [statsCategories, setStatsCategories] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [combo, setCombo] = useState(0);
  const [dernierCombo, setDernierCombo] = useState(null);
  const [bonusActif, setBonusActif] = useState(null);
  const [defisJour, setDefisJour] = useState([]);
  const [modeNuit, setModeNuit] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false); // État pour le chargement des actions
  const [tachesFiltrees, setTachesFiltrees] = useState([]); // État pour les tâches filtrées
  const [filtreRecherche, setFiltreRecherche] = useState(""); // État pour le filtre de recherche
  
  // État pour la modal d'ajout de tâche
  const [showModal, setShowModal] = useState(false);
  const [nouvelleTache, setNouvelleTache] = useState({
    nom: "",
    coef: 3,
    categorie: "SPIRITUEL",
    points: 30,
    description: ""
  });

  // Référence pour l'effet confetti
  const confettiRef = useRef(null);

  // ===== EFFETS ET INITIALISATION =====
  
  /**
   * Effet d'initialisation - Vérification de la session utilisateur
   * Redirige vers la page de connexion si l'utilisateur n'est pas connecté
   */
  useEffect(() => {
    const verifierSession = async () => {
      try {
        // Vérification de la session utilisateur via Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push("/connexion");
          return;
        }
        
        setUser(session.user);
        await initialiserJournee(session.user.id);
      } catch (error) {
        console.error('Erreur de session:', error);
        router.push("/connexion");
      } finally {
        setLoading(false);
      }
    };
    
    verifierSession();
  }, [router]);

  /**
   * Effet pour la vérification des heures bonus
   * Vérifie périodiquement si l'utilisateur est dans une période bonus
   */
  useEffect(() => {
    // Vérification initiale
    verifierHeureBonus();
    
    // Vérification périodique
    const interval = setInterval(() => {
      verifierHeureBonus();
    }, 60000); // Vérifier chaque minute
    
    // Nettoyage à la destruction du composant
    return () => clearInterval(interval);
  }, []);

  /**
   * Effet pour lancer le confetti lorsque showConfetti devient true
   * Animation visuelle pour célébrer les accomplissements
   */
  useEffect(() => {
    if (showConfetti && typeof window !== 'undefined') {
      try {
        // Vérifier si la fonction confetti est disponible
        if (typeof confetti === 'function') {
          // Configuration de base des confettis
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
        
        // Réinitialiser après 2 secondes
        setTimeout(() => setShowConfetti(false), 2000);
      } catch (error) {
        console.error('Erreur avec l\'animation confetti:', error);
      }
    }
  }, [showConfetti]);

  /**
   * Effet pour filtrer les tâches en fonction de la catégorie active et du filtre de recherche
   * Met à jour la liste des tâches affichées selon les critères de filtrage
   */
  useEffect(() => {
    if (!taches || taches.length === 0) {
      setTachesFiltrees([]);
      return;
    }
    
    // Filtrer les tâches selon la catégorie sélectionnée
    let filtered = [...taches];
    
    if (categorieActive !== "TOUS") {
      filtered = filtered.filter(t => t.categorie === categorieActive);
    }
    
    // Appliquer le filtre de recherche si présent
    if (filtreRecherche.trim() !== "") {
      const searchTerm = filtreRecherche.toLowerCase();
      filtered = filtered.filter(t => 
        t.nom.toLowerCase().includes(searchTerm) || 
        (t.description && t.description.toLowerCase().includes(searchTerm))
      );
    }
    
    setTachesFiltrees(filtered);
  }, [taches, categorieActive, filtreRecherche]);

  // ===== FONCTIONS UTILITAIRES =====
  
  /**
   * Charge l'historique des activités de l'utilisateur depuis Supabase
   * @param {string} userId - L'identifiant de l'utilisateur
   */
  const chargerHistorique = async (userId) => {
    try {
      // Requête pour récupérer l'historique de l'utilisateur
      const { data, error } = await supabase
        .from('historique')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      // Mise à jour de l'état avec les données récupérées
      setHistorique(data || []);
      
      // Mise à jour du streak si on a des données
      if (data && data.length > 0) {
        setStreak(data[0].streak || 0);
      }

      // Charger les points et mettre à jour le niveau
      if (data && data.length > 0) {
        const pointsTotaux = data.reduce((acc, jour) => acc + (jour.points || 0), 0);
        setPoints(pointsTotaux);
        
        // Mettre à jour le niveau
        calculerNiveau(pointsTotaux);
      }
      
      return data;
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
      setHistorique([]);
      return [];
    }
  };

  /**
   * Charge les réussites (achievements) de l'utilisateur
   * Récupère les succès débloqués pour affichage et motivation
   */
  const chargerAchievements = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setAchievements(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des achievements:', error);
      setAchievements([]);
    }
  };

  /**
   * Génère les défis quotidiens pour l'utilisateur
   * Initialise les tâches de la journée
   */
  const genererDefisQuotidiens = () => {
    setTaches(tachesJournalieresInitiales);
  };

  /**
   * Affiche une notification à l'utilisateur
   * @param {string} message - Le message à afficher
   * @param {string} type - Le type de notification (info, success, error, achievement)
   */
  const afficherNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  /**
   * Initialise la journée avec toutes les données nécessaires
   * @param {string} userId - L'identifiant de l'utilisateur
   */
  const initialiserJournee = async (userId) => {
    try {
      setLoading(true);
      
      // Charger l'historique et les données
      await chargerHistorique(userId);
      genererDefisQuotidiens();
      selectionnerCitationDuJour();
      verifierHeureBonus();
      await chargerAchievements();
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      
      // Initialisation minimale en cas d'erreur
      setTaches(tachesJournalieresInitiales);
      selectionnerCitationDuJour();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sélectionne une citation du jour aléatoire
   * Change quotidiennement pour maintenir l'intérêt
   */
  const selectionnerCitationDuJour = () => {
    // Sélectionner une citation aléatoire
    const index = Math.floor(Math.random() * CITATIONS.length);
    setCitationDuJour(CITATIONS[index]);
  };

  /**
   * Vérifie si l'heure actuelle correspond à une période de bonus
   * Active des multiplicateurs de points durant certaines heures
   */
  const verifierHeureBonus = () => {
    const maintenant = new Date();
    const heure = maintenant.getHours();
    
    // Vérifier si on est dans une période bonus
    if (heure >= RECOMPENSES_VARIABLES.POWER_HOURS.MATIN.debut && 
        heure < RECOMPENSES_VARIABLES.POWER_HOURS.MATIN.fin) {
      setBonusActif(RECOMPENSES_VARIABLES.POWER_HOURS.MATIN);
    } else if (heure >= RECOMPENSES_VARIABLES.POWER_HOURS.SOIREE.debut && 
              heure < RECOMPENSES_VARIABLES.POWER_HOURS.SOIREE.fin) {
      setBonusActif(RECOMPENSES_VARIABLES.POWER_HOURS.SOIREE);
    } else {
      setBonusActif(null);
    }
  };

  /**
   * Ajoute des points au score de l'utilisateur
   * @param {number} pointsGagnes - Le nombre de points à ajouter
   * @param {string} source - La source des points (nom de la tâche, etc.)
   */
  const ajouterPoints = useCallback((pointsGagnes, source = '') => {
    // Vérifier si un bonus est actif
    let pointsFinaux = pointsGagnes;
    
    if (bonusActif) {
      pointsFinaux = Math.round(pointsGagnes * bonusActif.multiplicateur);
      afficherNotification(`Bonus ${bonusActif.nom} activé ! ${pointsGagnes} × ${bonusActif.multiplicateur} = ${pointsFinaux} points`);
    }

    // Mettre à jour les points
    setPoints(prev => {
      const nouveauxPoints = prev + pointsFinaux;
      // Vérifier si on monte de niveau
      calculerNiveau(nouveauxPoints);
      return nouveauxPoints;
    });
    
    setPointsJour(prev => prev + pointsFinaux);
    
    // Message de succès
    const messageSucces = SUCCES_MESSAGES[Math.floor(Math.random() * SUCCES_MESSAGES.length)];
    afficherNotification(`${messageSucces} +${pointsFinaux} points`);
    
    // Bonus de combo
    if (combo > 0 && combo % 3 === 0) {
      const bonusCombo = Math.round(pointsFinaux * 0.5); // 50% de bonus
      setPoints(prev => prev + bonusCombo);
      setPointsJour(prev => prev + bonusCombo);
      afficherNotification(`Combo ×${combo} ! Bonus de +${bonusCombo} points`, 'achievement');
      setShowConfetti(true);
    }
  }, [bonusActif, combo]);

  /**
   * Calcule le niveau de l'utilisateur en fonction des points
   * @param {number} pointsTotaux - Le nombre total de points de l'utilisateur
   */
  const calculerNiveau = (pointsTotaux) => {
    // Déterminer le niveau en fonction des points
    for (let i = NIVEAUX.length - 1; i >= 0; i--) {
      if (pointsTotaux >= NIVEAUX[i].requis) {
        if (niveau !== NIVEAUX[i].niveau) {
          // Monter de niveau
          levelUp(NIVEAUX[i].niveau);
        }
        break;
      }
    }
  };

  /**
   * Gère la montée de niveau avec effets visuels et récompenses
   * @param {number} nouveauNiveau - Le nouveau niveau atteint
   */
  const levelUp = (nouveauNiveau) => {
    setNiveau(nouveauNiveau);
    setShowConfetti(true);
    afficherNotification(`🎉 Niveau ${nouveauNiveau} atteint ! ${NIVEAUX[nouveauNiveau-1].motivation}`, 'achievement');
    
    // Ajouter un achievement de niveau
    ajouterAchievement({
      type: 'NIVEAU',
      titre: `Niveau ${nouveauNiveau} - ${NIVEAUX[nouveauNiveau-1].nom}`,
      description: NIVEAUX[nouveauNiveau-1].motivation,
      icone: NIVEAUX[nouveauNiveau-1].icone,
      date: new Date().toISOString()
    });
  };

  /**
   * Ajoute un achievement (réussite) à l'utilisateur
   * @param {Object} achievement - Les détails de l'achievement
   */
  const ajouterAchievement = async (achievement) => {
    try {
      if (!user) return;
      
      const { error } = await supabase
        .from('achievements')
        .insert([
          {
            user_id: user.id,
            ...achievement
          }
        ]);
      
      if (error) throw error;
      
      // Recharger les achievements
      await chargerAchievements();
    } catch (error) {
      console.error('Erreur lors de l\'ajout d\'un achievement:', error);
    }
  };

  /**
   * Fonction pour ajouter une nouvelle tâche
   * Ajoute une tâche personnalisée à la liste des tâches
   */
  const ajouterNouvelleTache = async () => {
    try {
      // Vérifier si le nom de la tâche est vide
      if (!nouvelleTache.nom.trim()) {
        afficherNotification('Veuillez entrer un nom pour la tâche', 'error');
        return;
      }

      // Créer un identifiant unique pour la nouvelle tâche
      const tacheId = `task-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

      // Préparer la tâche complète
      const tacheAjoutee = {
        ...nouvelleTache,
        id: tacheId,
        etat: "",
        completed: false,
        derniere_realisation: null,
        streak: 0,
        meilleur_streak: 0
      };

      // Ajouter la tâche à la liste
      setTaches(prevTaches => [...prevTaches, tacheAjoutee]);
      
      // Si l'utilisateur est connecté, sauvegarder dans Supabase
      if (user) {
        try {
          setLoadingAction(true);
          
          // Mise à jour des tâches du jour dans Supabase
          const aujourd'hui = format(new Date(), 'yyyy-MM-dd');
          
          const { error } = await supabase
            .from('taches_jour')
            .upsert({
              user_id: user.id,
              date: aujourd'hui,
              taches: [...taches, tacheAjoutee]
            });
            
          if (error) throw error;
        } finally {
          setLoadingAction(false);
        }
      }
      
      // Fermer la modal et notification
      setShowModal(false);
      afficherNotification('Tâche ajoutée avec succès', 'success');
      
      // Réinitialiser le formulaire
      setNouvelleTache({
        nom: "",
        coef: 3,
        categorie: "SPIRITUEL",
        points: 30,
        description: ""
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout d\'une tâche:', error);
      afficherNotification('Erreur lors de l\'ajout de la tâche', 'error');
    }
  };

  /**
   * Valide la journée et enregistre les résultats dans l'historique
   * Sauvegarde le progrès quotidien et met à jour les statistiques
   */
  const validerJournee = async () => {
    try {
      setLoadingAction(true);
      
      // Vérifier si l'utilisateur est connecté
      if (!user) {
        afficherNotification('Vous devez être connecté pour valider votre journée', 'error');
        return;
      }
      
      // Calculer le taux de réussite
      const tachesTerminees = taches.filter(t => t.completed).length;
      
      // Vérifier s'il y a des tâches terminées
      if (tachesTerminees === 0) {
        afficherNotification('Complétez au moins une tâche avant de valider la journée', 'error');
        setLoadingAction(false);
        return;
      }
      
      const tauxReussite = Math.round((tachesTerminees / taches.length) * 100);
      
      // Calculer la note sur 20
      const note = Math.round((tauxReussite / 100) * 20);
      
      // Mettre à jour le streak
      let nouveauStreak = streak;
      
      // Vérifier si c'est une journée consécutive
      const dateDernierJour = historique.length > 0 ? new Date(historique[0].date) : null;
      const aujourdhui = new Date();
      
      if (!dateDernierJour || !isSameDay(addDays(dateDernierJour, 1), aujourdhui)) {
        // Si ce n'est pas une journée consécutive, réinitialiser le streak
        nouveauStreak = 1;
      } else {
        // Sinon, incrémenter le streak
        nouveauStreak += 1;
      }
      
      // Préparer les données à enregistrer
      const donneesJournee = {
        user_id: user.id,
        date: new Date().toISOString(),
        taches_terminees: tachesTerminees,
        total_taches: taches.length,
        taux_reussite: tauxReussite,
        note: note,
        points: pointsJour,
        streak: nouveauStreak
      };
      
      // Enregistrer dans la base de données
      const { data, error } = await supabase
        .from('historique')
        .insert([donneesJournee]);
      
      if (error) {
        throw new Error(`Erreur lors de l'enregistrement dans Supabase: ${error.message}`);
      }
      
      // Mettre à jour les états
      setStreak(nouveauStreak);
      setPointsJour(0);
      
      // Effets visuels pour une bonne performance
      if (tauxReussite >= 80) {
        setShowConfetti(true);
      }
      
      // Notification de succès
      afficherNotification(`Journée validée ! Note: ${note}/20`, 'success');
      
      // Recharger l'historique
      await chargerHistorique(user.id);
      
      // Réinitialiser les tâches pour une nouvelle journée
      setTaches(taches.map(t => ({
        ...t,
        etat: "",
        completed: false
      })));
      
    } catch (error) {
      console.error('Erreur lors de la validation de la journée:', error);
      afficherNotification('Erreur lors de la validation de la journée: ' + error.message, 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  // ===== FONCTIONS DE MISE À JOUR DES TÂCHES =====

  /**
   * Met à jour l'état d'une tâche (terminée, en cours, etc.)
   * @param {number} index - L'index de la tâche dans le tableau
   * @param {string} nouvelEtat - Le nouvel état à appliquer
   */
  const mettreAJourEtatTache = (index, nouvelEtat) => {
    const ancienEtat = taches[index].etat;
    
    // Ne rien faire si l'état est déjà le même
    if (ancienEtat === nouvelEtat) return;
    
    // Mettre à jour la tâche
    const updated = [...taches];
    updated[index].etat = nouvelEtat;
    updated[index].completed = nouvelEtat === "Terminé";
    
    // Si la tâche est marquée comme terminée
    if (nouvelEtat === "Terminé" && ancienEtat !== "Terminé") {
      // Mettre à jour la date de dernière réalisation
      updated[index].derniere_realisation = new Date().toISOString();
      
      // Ajouter les points
      ajouterPoints(updated[index].points || updated[index].coef * 10, updated[index].nom);
      
      // Augmenter le combo
      setCombo(prev => prev + 1);
    } 
    // Si la tâche était terminée et ne l'est plus
    else if (ancienEtat === "Terminé" && nouvelEtat !== "Terminé") {
      // Réduire le combo
      setCombo(prev => Math.max(0, prev - 1));
    }
    
    // Mettre à jour l'état
    setTaches(updated);
    
    // Sauvegarder les changements dans Supabase si l'utilisateur est connecté
    if (user) {
      try {
        const aujourd'hui = format(new Date(), 'yyyy-MM-dd');
        
        supabase
          .from('taches_jour')
          .upsert({
            user_id: user.id,
            date: aujourd'hui,
            taches: updated
          })
          .then(({ error }) => {
            if (error) {
              console.error('Erreur lors de la mise à jour des tâches:', error);
            }
          });
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des tâches:', error);
      }
    }
  };

  // ===== RENDU CONDITIONNEL =====
  
  /**
   * Page de chargement pendant l'initialisation
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
          Chargement de votre voyage...
        </div>
      </div>
    );
  }

  // ===== RENDU PRINCIPAL =====

  return (
    <>
      <Head>
        <title>NourRise - Votre Voyage vers l'Excellence</title>
        <meta name="description" content="Développez vos habitudes positives et suivez votre progression" />
        <link rel="icon" href="/favicon.ico" />
        <style jsx global>{`
          .glassmorphism {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          }
          
          .floating {
            animation: float 3s ease-in-out infinite;
          }
          
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
          
          .animate-slide-up {
            animation: slideUp 0.5s ease forwards;
          }
          
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          
          .hover\\:scale-102:hover {
            transform: scale(1.02);
          }
          
          .dark {
            color-scheme: dark;
            background: #121212;
          }
          
          /* Transitions fluides */
          .transition-all {
            transition-property: all;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
            transition-duration: 300ms;
          }
          
          /* Animation de pulsation pour attirer l'attention */
          .pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          
          /* Optimisation pour les appareils mobiles */
          @media (max-width: 640px) {
            .container {
              padding-left: 12px;
              padding-right: 12px;
            }
          }
        `}</style>
      </Head>

      <div 
        ref={confettiRef}
        className={`min-h-screen ${modeNuit ? 'dark' : ''} bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500`}
      >
        {/* Barre de progression niveau */}
        <div className="fixed top-0 left-0 w-full h-1 bg-gray-200">
          <div 
            className={`h-full bg-gradient-to-r ${NIVEAUX[niveau-1].couleur}`}
            style={{ 
              width: `${((points - NIVEAUX[niveau-1].requis) / 
                (niveau < NIVEAUX.length ? NIVEAUX[niveau].requis - NIVEAUX[niveau-1].requis : 1000)) * 100}%` 
            }}
          />
        </div>

        {/* Header avec niveau et points */}
        <header className="p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full bg-gradient-to-r ${NIVEAUX[niveau-1].couleur} floating`}>
                <span className="text-2xl">{NIVEAUX[niveau-1].icone}</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Niveau {niveau}</h1>
                <p className="text-white/80">{NIVEAUX[niveau-1].nom}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-3xl font-bold floating">🔥</div>
                <div className="text-sm">{streak} jours</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{points}</div>
                <div className="text-sm">points</div>
              </div>
              <button 
                onClick={() => setModeNuit(!modeNuit)} 
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
              >
                {modeNuit ? <FiSun /> : <FiMoon />}
              </button>
            </div>
          </div>
        </header>

        {/* Bonus actif */}
        {bonusActif && (
          <div className="mx-auto max-w-4xl my-2 p-3 glassmorphism rounded-lg text-white text-center animate-pulse">
            <div className="flex items-center justify-center space-x-2">
              <FiZap className="text-yellow-400" />
              <p className="text-lg font-bold">{bonusActif.nom} activé ! (×{bonusActif.multiplicateur})</p>
            </div>
            <p className="text-sm text-white/80">{bonusActif.description}</p>
          </div>
        )}

        {/* Citation du jour */}
        {citationDuJour && (
          <div className="mx-auto max-w-4xl my-6 p-4 glassmorphism rounded-lg text-white text-center">
            <p className="text-lg italic">"{citationDuJour.texte}"</p>
            <p className="text-sm mt-2">- {citationDuJour.auteur}</p>
          </div>
        )}

        {/* Contenu principal */}
        <main className="container mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tâches */}
            <div className="md:col-span-2 glassmorphism rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <FiCheckCircle className="mr-2" /> Tâches du jour
                </h2>
                <div className="flex space-x-2">
                  {Object.entries(CATEGORIES).map(([key, cat]) => (
                    <button
                      key={key}
                      onClick={() => setCategorieActive(key)}
                      className={`px-3 py-1 rounded-full transition ${
                        categorieActive === key ? cat.couleur : 'bg-white/10 text-white'
                      }`}
                      title={cat.nom}
                    >
                      {cat.icone}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recherche de tâches */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher une tâche..."
                    value={filtreRecherche}
                    onChange={(e) => setFiltreRecherche(e.target.value)}
                    className="w-full p-2 pl-10 rounded-lg bg-white/10 text-white border border-white/20 focus:border-white/40 focus:outline-none"
                  />
                  <FiSearch className="absolute left-3 top-3 text-white/60" />
                  {filtreRecherche && (
                    <button
                      onClick={() => setFiltreRecherche("")}
                      className="absolute right-3 top-3 text-white/60 hover:text-white"
                    >
                      <FiX />
                    </button>
                  )}
                </div>
              </div>

              {/* Liste des tâches */}
              <div className="space-y-4">
                {tachesFiltrees.length > 0 ? (
                  tachesFiltrees.map((tache, index) => {
                    // Trouver l'index réel dans le tableau complet des tâches
                    const realIndex = taches.findIndex(t => t.id === tache.id);
                    
                    return (
                      <div
                        key={tache.id || index}
                        className={`glassmorphism p-4 rounded-lg flex items-center justify-between group hover:scale-102 transition ${
                          tache.completed ? 'border-l-4 border-green-500' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">
                            {CATEGORIES[tache.categorie].icone}
                          </span>
                          <div>
                            <span className="text-white">{tache.nom}</span>
                            {tache.description && (
                              <p className="text-white/60 text-sm">{tache.description}</p>
                            )}
                            {tache.streak > 0 && (
                              <div className="mt-1 text-xs text-orange-300 flex items-center">
                                <FiFire className="mr-1" /> {tache.streak} jours consécutifs
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="flex space-x-1">
                            {[...Array(tache.coef)].map((_, i) => (
                              <span key={i} className="text-yellow-400">⭐</span>
                            ))}
                          </div>
                          <select
                            value={tache.etat || ""}
                            onChange={(e) => mettreAJourEtatTache(realIndex, e.target.value)}
                            className={`bg-white/10 text-white border-0 rounded-lg p-2 ${
                              tache.completed ? 'bg-green-500/20' : ''
                            }`}
                          >
                            <option value="">À faire</option>
                            <option value="Terminé">Terminé</option>
                            <option value="En cours">En cours</option>
                            <option value="Non fait">Non fait</option>
                          </select>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-white/60 py-8">
                    {filtreRecherche ? (
                      <>
                        <FiSearch className="text-4xl mx-auto mb-4 opacity-50" />
                        <p>Aucune tâche ne correspond à votre recherche</p>
                        <button
                          onClick={() => setFiltreRecherche("")}
                          className="mt-2 text-blue-300 hover:text-blue-200"
                        >
                          Effacer la recherche
                        </button>
                      </>
                    ) : (
                      <>
                        <p>Aucune tâche dans cette catégorie</p>
                        <button
                          onClick={() => setCategorieActive("TOUS")}
                          className="mt-2 text-blue-300 hover:text-blue-200"
                        >
                          Voir toutes les catégories
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Boutons d'action */}
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setShowModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white rounded-lg transition shadow-md hover:shadow-lg flex items-center space-x-2"
                >
                  <FiPlus /> <span>Ajouter une tâche</span>
                </button>
                <button
                  onClick={validerJournee}
                  disabled={loadingAction}
                  className={`px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white rounded-lg transition shadow-md hover:shadow-lg flex items-center space-x-2 ${
                    loadingAction ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loadingAction ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      <span>Validation...</span>
                    </>
                  ) : (
                    <>
                      <FiCheck /> <span>Valider la journée</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Statistiques et graphiques */}
            <div className="space-y-6">
              {/* Carte de progression */}
              <div className="glassmorphism rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <FiTrendingUp className="mr-2" /> Progression
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-white/80 mb-1">
                      <span>Niveau {niveau}</span>
                      <span>{points} / {niveau < NIVEAUX.length ? NIVEAUX[niveau].requis : "Max"}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${NIVEAUX[niveau-1].couleur}`}
                        style={{
                          width: niveau < NIVEAUX.length ? 
                            `${((points - NIVEAUX[niveau-1].requis) / 
                              (NIVEAUX[niveau].requis - NIVEAUX[niveau-1].requis)) * 100}%` : "100%"
                        }}
                      />
                    </div>
                    <p className="text-white/80 text-sm mt-2">
                      {NIVEAUX[niveau-1].motivation}
                    </p>
                    <p className="text-white/80 text-sm mt-1">
                      <span className="text-yellow-400 font-bold">Bonus:</span> {NIVEAUX[niveau-1].bonus}
                    </p>
                  </div>
                </div>
              </div>

              {/* Résumé du jour */}
              <div className="glassmorphism rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <FiCalendar className="mr-2" /> Aujourd'hui
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 p-3 rounded-lg text-center">
                    <div className="text-3xl font-bold text-white">{pointsJour}</div>
                    <div className="text-sm text-white/80">Points gagnés</div>
                  </div>
                  <div className="bg-white/10 p-3 rounded-lg text-center">
                    <div className="text-3xl font-bold text-white">
                      {taches.length > 0 
                        ? Math.round((taches.filter(t => t.completed).length / taches.length) * 100)
                        : 0}%
                    </div>
                    <div className="text-sm text-white/80">Complété</div>
                  </div>
                </div>
                
                {/* Compteur de combo */}
                {combo > 0 && (
                  <div className="mt-4 bg-gradient-to-r from-orange-400 to-red-500 p-3 rounded-lg text-center">
                    <div className="flex items-center justify-center text-white font-bold">
                      <FiFire className="mr-2" /> Combo: {combo}
                    </div>
                    {combo >= 2 && (
                      <p className="text-xs text-white/90 mt-1">
                        {3 - (combo % 3)} de plus pour un bonus!
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Graphiques (chargés dynamiquement) */}
              {historique.length > 0 && (
                <div className="glassmorphism rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Analyse</h3>
                  <div className="space-y-4">
                    <GraphiqueEvolution historique={historique} />
                    <GraphiqueNote historique={historique} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Historique */}
          <div className="mt-10 glassmorphism rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <FiActivity className="mr-2" /> Historique
            </h2>
            {historique.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {historique.map((jour, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-white/10 p-4 rounded-lg hover:bg-white/20 transition"
                  >
                    <div className="text-white">
                      <span className="font-medium">
                        {format(new Date(jour.date), 'dd/MM/yyyy', { locale: fr })}
                      </span>
                      <span className="mx-4">•</span>
                      <span className="text-green-400">{jour.taux_reussite}%</span>
                      <span className="mx-4">•</span>
                      <span className="text-yellow-400">{jour.note}/20</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white">{jour.points} pts</span>
                      {jour.streak > 1 && (
                        <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                          <FiFire className="mr-1" /> {jour.streak}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-white/60 py-8">
                <p>Pas encore d'historique - Commencez par valider votre première journée !</p>
              </div>
            )}
          </div>
        </main>

        {/* Modal d'ajout de tâche */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                Ajouter une tâche
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">
                    Nom de la tâche <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nouvelleTache.nom}
                    onChange={(e) => setNouvelleTache({...nouvelleTache, nom: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="Nom de la tâche"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={nouvelleTache.categorie}
                    onChange={(e) => setNouvelleTache({...nouvelleTache, categorie: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    {Object.entries(CATEGORIES).filter(([key]) => key !== "TOUS").map(([key, cat]) => (
                      <option key={key} value={key}>
                        {cat.icone} {cat.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">
                    Difficulté (1-5)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={nouvelleTache.coef}
                    onChange={(e) => {
                      const coef = parseInt(e.target.value);
                      setNouvelleTache({
                        ...nouvelleTache, 
                        coef, 
                        points: coef * 10
                      });
                    }}
                    className="w-full"
                  />
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Facile</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {nouvelleTache.coef} {'⭐'.repeat(nouvelleTache.coef)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Difficile</span>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">
                    Points
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    value={nouvelleTache.points}
                    onChange={(e) => setNouvelleTache({...nouvelleTache, points: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">
                    Description (optionnelle)
                  </label>
                  <textarea
                    value={nouvelleTache.description}
                    onChange={(e) => setNouvelleTache({...nouvelleTache, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    rows="3"
                    placeholder="Description de la tâche"
                  ></textarea>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  onClick={ajouterNouvelleTache}
                  disabled={loadingAction}
                  className={`px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center ${
                    loadingAction ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loadingAction ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      <span>Ajout...</span>
                    </>
                  ) : (
                    <span>Ajouter</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {notification && (
          <div className="fixed bottom-4 right-4 animate-slide-up z-50">
            <div className={`p-4 rounded-lg shadow-lg ${
              notification.type === 'achievement' ? 'bg-yellow-400' : 
              notification.type === 'success' ? 'bg-green-500' :
              notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
            } text-white max-w-xs`}>
              {notification.message}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
