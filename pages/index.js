import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { format, isSameDay, addDays, isAfter, isBefore, startOfDay, parseISO, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import AnalyseIA from "../composants/AnalyseIA";
import GraphiqueEvolution from "../composants/GraphiqueEvolution";
import GraphiqueNote from "../composants/GraphiqueNote";
import { supabase } from "../supabaseClient";
import { useRouter } from "next/router";
import Head from "next/head";
import { 
  FiAward, FiTrendingUp, FiZap, FiCheck, FiClock, FiX, FiFire, 
  FiStar, FiHeart, FiAperture, FiPlus, FiCalendar, FiCheckCircle,
  FiBarChart2, FiSettings, FiLogOut, FiUser, FiRefreshCw, FiEye,
  FiEyeOff, FiAlertCircle, FiChevronDown, FiChevronUp, FiShare2, 
  FiBookmark, FiShield, FiTrendingDown, FiSave, FiActivity, FiSun, FiMoon
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import confetti from 'canvas-confetti';
import Lottie from "react-lottie-player";
import loadingAnimation from "../animations/loading.json";
import successAnimation from "../animations/success.json";
import levelUpAnimation from "../animations/level-up.json";
import achievementAnimation from "../animations/achievement.json";
import { Tooltip } from 'react-tooltip';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Line, Bar, Radar, Doughnut } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables, ChartDataLabels);

/**
 * @fileoverview Page principale de l'application NourRise
 * Cette application aide les utilisateurs à développer leurs habitudes positives
 * en utilisant des techniques de gamification et des systèmes de récompense 
 * psychologiquement optimisés pour favoriser l'engagement et la persévérance.
 * 
 * @author NourRise Team
 * @version 2.0.0
 */

// ===== CONSTANTES SYSTÈME =====
// Récompenses et systèmes de motivation avancés basés sur la psychologie comportementale
const RECOMPENSES_VARIABLES = {
  BONUS_SURPRISE: [10, 20, 50, 100], // Valeurs possibles pour les bonus aléatoires
  MULTIPLICATEURS: [1.5, 2, 3],      // Multiplicateurs de points possibles
  COMBO_REQUIS: [3, 5, 7, 10],       // Nombre de tâches consécutives pour déclencher un combo
  POWER_HOURS: {
    MATIN: { debut: 5, fin: 8, multiplicateur: 2, nom: "Bonus Fajr", 
            description: "Profite de l'aube pour multiplier tes bienfaits" },
    SOIREE: { debut: 21, fin: 23, multiplicateur: 1.5, nom: "Bonus Réflexion", 
             description: "Le calme du soir pour finir la journée en beauté" },
    MIDI: { debut: 12, fin: 14, multiplicateur: 1.3, nom: "Boost Déjeuner", 
           description: "Utilise ta pause repas efficacement" }
  },
  // Intervalles d'activation de récompenses aléatoires (en jours)
  INTERVALLE_RECOMPENSES: {
    MIN: 3,
    MAX: 7
  }
};

// Système de progression par niveaux avec avantages exclusifs
const NIVEAUX = [
  { niveau: 1, nom: "Débutant", requis: 0, couleur: "from-blue-400 to-blue-600", icone: "🌱", 
    motivation: "Le début d'un beau voyage...", bonus: "Débloquez plus de tâches !", medaille: "🥉",
    avantages: ["Accès aux tâches de base", "Statistiques journalières"], couleurTexte: "text-blue-400" },
  { niveau: 2, nom: "Apprenti", requis: 100, couleur: "from-green-400 to-green-600", icone: "🌿", 
    motivation: "Tu progresses bien !", bonus: "Accès aux défis quotidiens", medaille: "🥈",
    avantages: ["Défis quotidiens", "Bonus de combo (×1.2)"], couleurTexte: "text-green-400"  },
  { niveau: 3, nom: "Initié", requis: 300, couleur: "from-yellow-400 to-yellow-600", icone: "⭐", 
    motivation: "Ta persévérance paie !", bonus: "Multiplicateur de points ×1.5", medaille: "🥇",
    avantages: ["Multiplicateur de points ×1.5", "Statistiques avancées"], couleurTexte: "text-yellow-400" },
  { niveau: 4, nom: "Expert", requis: 600, couleur: "from-purple-400 to-purple-600", icone: "💫", 
    motivation: "Tu deviens une source d'inspiration !", bonus: "Débloquez les achievements spéciaux", medaille: "🏆",
    avantages: ["Achievements spéciaux", "Bonus de streak amélioré"], couleurTexte: "text-purple-400" },
  { niveau: 5, nom: "Maître", requis: 1000, couleur: "from-red-400 to-red-600", icone: "🌟", 
    motivation: "Tu es exceptionnel !", bonus: "Mode Mentor débloqué", medaille: "👑",
    avantages: ["Mode Mentor", "Défis de groupe", "Badges exclusifs"], couleurTexte: "text-red-400" },
  { niveau: 6, nom: "Légende", requis: 2000, couleur: "from-pink-400 to-pink-600", icone: "🔱", 
    motivation: "Tu es une véritable légende !", bonus: "Personnalisation complète", medaille: "⭐",
    avantages: ["Personnalisation complète", "Accès anticipé aux nouvelles fonctionnalités"], couleurTexte: "text-pink-400" }
];

// Système de catégorisation des tâches avec thématiques visuelles et motivationnelles
const CATEGORIES = {
  TOUS: { 
    nom: "Tous", 
    icone: "📋", 
    couleur: "bg-gray-100 text-gray-800",
    theme: "bg-gray-500",
    description: "Toutes les catégories",
    motivation: "Vue d'ensemble de ta progression",
    iconeComponent: <FiStar className="text-gray-600" />
  },
  SPIRITUEL: { 
    nom: "Spirituel", 
    icone: "🕌", 
    couleur: "bg-purple-100 text-purple-800",
    theme: "bg-purple-500",
    description: "Élévation spirituelle",
    motivation: "Nourris ton âme",
    iconeComponent: <FiHeart className="text-purple-600" />
  },
  SPORT: { 
    nom: "Sport", 
    icone: "💪", 
    couleur: "bg-green-100 text-green-800",
    theme: "bg-green-500",
    description: "Santé physique",
    motivation: "Prends soin de ton corps",
    iconeComponent: <FiActivity className="text-green-600" />
  },
  EDUCATION: { 
    nom: "Éducation", 
    icone: "📚", 
    couleur: "bg-blue-100 text-blue-800",
    theme: "bg-blue-500",
    description: "Développement intellectuel",
    motivation: "Cultive ton esprit",
    iconeComponent: <FiBookmark className="text-blue-600" />
  },
  DEVELOPPEMENT: { 
    nom: "Développement", 
    icone: "🚀", 
    couleur: "bg-yellow-100 text-yellow-800",
    theme: "bg-yellow-500",
    description: "Croissance personnelle",
    motivation: "Deviens meilleur chaque jour",
    iconeComponent: <FiTrendingUp className="text-yellow-600" />
  },
  SOCIAL: { 
    nom: "Social", 
    icone: "👥", 
    couleur: "bg-red-100 text-red-800",
    theme: "bg-red-500",
    description: "Relations sociales",
    motivation: "Cultive des relations significatives",
    iconeComponent: <FiShare2 className="text-red-600" />
  }
};

// Citations motivationnelles dynamiques pour l'inspiration quotidienne
const CITATIONS = [
  { texte: "Chaque petit progrès te rapproche de tes objectifs", auteur: "NourRise", categorie: "MOTIVATION" },
  { texte: "La constance est la clé du succès", auteur: "NourRise", categorie: "CONSTANCE" },
  { texte: "Un pas à la fois, mais toujours en avant", auteur: "NourRise", categorie: "PROGRESSION" },
  { texte: "La discipline est le pont entre les objectifs et leur réalisation", auteur: "NourRise", categorie: "DISCIPLINE" },
  { texte: "Le succès se construit chaque jour", auteur: "NourRise", categorie: "QUOTIDIEN" },
  { texte: "Ta détermination façonne ton destin", auteur: "NourRise", categorie: "DETERMINATION" },
  { texte: "L'excellence est un art qui s'acquiert par l'entraînement", auteur: "NourRise", categorie: "EXCELLENCE" },
  { texte: "Chaque difficulté rencontrée est une opportunité de croissance", auteur: "NourRise", categorie: "RESILIENCE" },
  { texte: "Ce n'est pas le temps qui compte, mais l'intention dans chaque action", auteur: "NourRise", categorie: "INTENTION" },
  { texte: "Vise les étoiles, tu atteindras au moins la lune", auteur: "NourRise", categorie: "AMBITION" },
  { texte: "La patience est amère, mais ses fruits sont doux", auteur: "NourRise", categorie: "PATIENCE" },
  { texte: "Celui qui déplace une montagne commence par déplacer de petites pierres", auteur: "Confucius", categorie: "PERSEVERANCE" },
  { texte: "La meilleure façon de prédire l'avenir est de le créer", auteur: "Peter Drucker", categorie: "VISION" },
  { texte: "Votre temps est limité, alors ne le gaspillez pas à vivre la vie de quelqu'un d'autre", auteur: "Steve Jobs", categorie: "AUTHENTICITE" },
  { texte: "Le succès, c'est d'aller d'échec en échec sans perdre son enthousiasme", auteur: "Winston Churchill", categorie: "PERSEVERANCE" }
];

// Messages de succès personnalisés pour renforcer la motivation
const SUCCES_MESSAGES = [
  "Excellente réalisation ! 🌟",
  "Continue sur cette lancée ! 🚀",
  "Tu es sur la bonne voie ! 🎯",
  "Impressionnant ! 💫",
  "Tu progresses admirablement ! ⭐",
  "Quelle persévérance ! 💪",
  "C'est extraordinaire ! 🎉",
  "Une réussite de plus ! 🌈",
  "Incroyable effort ! 🔥",
  "Tu as dépassé les attentes ! 🏆",
  "Performance remarquable ! ✨",
  "Quelle détermination ! 🌠",
  "Un pas de plus vers l'excellence ! 🌅",
  "Ton engagement inspire ! 💎",
  "La constance paie toujours ! 🌊",
  "Défi relevé avec brio ! 🏅"
];

// Motifs et récompenses pour fidélité qui se débloquent progressivement
const RECOMPENSES_FIDELITE = [
  { jours: 7, nom: "Semaine Constante", icone: "🌟", points: 50, description: "Une semaine complète d'engagement !" },
  { jours: 21, nom: "Habitude Formée", icone: "⚡", points: 150, description: "21 jours forment une habitude durable" },
  { jours: 30, nom: "Mois d'Excellence", icone: "🌙", points: 200, description: "Un mois de transformation" },
  { jours: 66, nom: "Maître du Changement", icone: "🔥", points: 300, description: "66 jours pour changer profondément" },
  { jours: 100, nom: "Centenaire", icone: "💯", points: 500, description: "Une détermination exceptionnelle" },
  { jours: 365, nom: "Révolution Annuelle", icone: "🌍", points: 1000, description: "Un an de transformation continue" }
];

// Badges et trophées débloquables pour stimuler la progression
const BADGES = [
  { id: "early_riser", nom: "Lève-tôt", icone: "🌅", condition: "Compléter 5 tâches avant 8h", difficulte: 1 },
  { id: "night_owl", nom: "Noctambule Productif", icone: "🌃", condition: "Compléter 5 tâches après 22h", difficulte: 1 },
  { id: "combo_master", nom: "Maître des Combos", icone: "🔄", condition: "Atteindre un combo de 10", difficulte: 2 },
  { id: "perfect_week", nom: "Semaine Parfaite", icone: "📅", condition: "100% de tâches complétées pendant 7 jours", difficulte: 3 },
  { id: "spiritual_seeker", nom: "Chercheur Spirituel", icone: "✨", condition: "Compléter 50 tâches spirituelles", difficulte: 2 },
  { id: "knowledge_hunter", nom: "Chasseur de Savoir", icone: "📚", condition: "Compléter 50 tâches éducatives", difficulte: 2 },
  { id: "fitness_guru", nom: "Guru du Fitness", icone: "💪", condition: "Compléter 50 tâches sportives", difficulte: 2 },
  { id: "growth_adept", nom: "Adepte de la Croissance", icone: "🌱", condition: "Compléter 50 tâches de développement", difficulte: 2 },
  { id: "balanced_soul", nom: "Âme Équilibrée", icone: "☯️", condition: "Compléter des tâches dans toutes les catégories pendant 10 jours", difficulte: 3 },
  { id: "consistency_king", nom: "Roi de la Constance", icone: "👑", condition: "Maintenir un streak de 30 jours", difficulte: 4 },
  { id: "comeback_kid", nom: "Champion du Retour", icone: "🔙", condition: "Reprendre après une interruption de streak", difficulte: 1 },
  { id: "dawn_seeker", nom: "Chercheur de l'Aube", icone: "🌄", condition: "Compléter 20 tâches pendant le bonus Fajr", difficulte: 3 },
  { id: "social_butterfly", nom: "Papillon Social", icone: "🦋", condition: "Compléter 30 tâches sociales", difficulte: 2 },
  { id: "reflection_master", nom: "Maître de la Réflexion", icone: "🧠", condition: "Noter ses réflexions pendant 20 jours", difficulte: 3 }
];

// Tâches journalières par défaut avec détails enrichis
const tachesJournalieresInitiales = [
  // Catégorie SPIRITUEL
  { 
    nom: "Coran", 
    coef: 5, 
    categorie: "SPIRITUEL", 
    points: 50,
    description: "Lecture et méditation du Coran",
    conseils: ["Choisis un moment calme", "Commence par une courte sourate", "Réfléchis au sens"],
    bonus: { type: "MULTIPLICATEUR", valeur: 2, condition: "avant_fajr" },
    tempsEstime: "15-30 min",
    bienfaits: ["Guidance spirituelle", "Paix intérieure", "Connexion avec Allah"]
  },
  { 
    nom: "Dou'a matin et soir", 
    coef: 5, 
    categorie: "SPIRITUEL", 
    points: 50,
    description: "Invocations quotidiennes pour la protection",
    rappel: true,
    heures: ["05:00", "19:00"],
    tempsEstime: "5-10 min",
    bienfaits: ["Protection spirituelle", "Renforcement de la foi", "Reconnaissance envers Allah"]
  },
  { 
    nom: "Prière à l'heure", 
    coef: 5, 
    categorie: "SPIRITUEL", 
    points: 60,
    description: "Accomplir les prières obligatoires à l'heure",
    rappel: true,
    conseils: ["Prépare-toi quelques minutes avant", "Trouve un endroit calme", "Concentre-toi pleinement"],
    tempsEstime: "Variable",
    bienfaits: ["Connexion spirituelle", "Discipline", "Purification de l'âme"]
  },
  // Catégorie ÉDUCATION
  { 
    nom: "Lecture enrichissante", 
    coef: 4, 
    categorie: "EDUCATION", 
    points: 40,
    description: "Lecture d'un livre éducatif ou inspirant",
    conseils: ["Choisis un sujet qui t'intéresse", "Prends des notes", "Réfléchis aux concepts clés"],
    tempsEstime: "30 min",
    bienfaits: ["Développement intellectuel", "Acquisition de connaissances", "Stimulation cognitive"]
  },
  { 
    nom: "Apprentissage d'une nouvelle compétence", 
    coef: 4, 
    categorie: "EDUCATION", 
    points: 45,
    description: "Consacrer du temps à l'apprentissage d'une nouvelle compétence",
    tempsEstime: "30-60 min",
    bienfaits: ["Développement personnel", "Adaptabilité", "Confiance en soi"]
  },
  // Catégorie SPORT
  { 
    nom: "Exercice physique", 
    coef: 4, 
    categorie: "SPORT", 
    points: 40,
    description: "Au moins 30 minutes d'activité physique",
    conseils: ["Choisis une activité que tu aimes", "Commence doucement", "Sois régulier"],
    tempsEstime: "30-45 min",
    bienfaits: ["Santé cardiovasculaire", "Renforcement musculaire", "Libération d'endorphines"]
  },
  { 
    nom: "Marche quotidienne", 
    coef: 3, 
    categorie: "SPORT", 
    points: 30,
    description: "Marcher au moins 10 000 pas",
    tempsEstime: "Variable",
    bienfaits: ["Santé cardiovasculaire", "Clarté mentale", "Gestion du stress"]
  },
  // Catégorie DÉVELOPPEMENT
  { 
    nom: "Méditation", 
    coef: 3, 
    categorie: "DEVELOPPEMENT", 
    points: 30,
    description: "Méditation consciente pour la clarté mentale",
    conseils: ["Trouve un endroit calme", "Respire profondément", "Reste dans le moment présent"],
    tempsEstime: "10-20 min",
    bienfaits: ["Réduction du stress", "Clarté mentale", "Meilleure concentration"]
  },
  { 
    nom: "Journal de gratitude", 
    coef: 2, 
    categorie: "DEVELOPPEMENT", 
    points: 25,
    description: "Noter 3 choses pour lesquelles tu es reconnaissant",
    tempsEstime: "5-10 min",
    bienfaits: ["Attitude positive", "Appréciation", "Perspective équilibrée"]
  },
  // Catégorie SOCIAL
  { 
    nom: "Acte de gentillesse", 
    coef: 3, 
    categorie: "SOCIAL", 
    points: 35,
    description: "Faire quelque chose de gentil pour quelqu'un",
    tempsEstime: "Variable",
    bienfaits: ["Connexion sociale", "Satisfaction personnelle", "Impact positif"]
  },
  { 
    nom: "Maintenir les liens familiaux", 
    coef: 4, 
    categorie: "SOCIAL", 
    points: 40,
    description: "Passer du temps de qualité avec la famille ou appeler des proches",
    tempsEstime: "15-60 min",
    bienfaits: ["Renforcement des liens", "Soutien émotionnel", "Sentiment d'appartenance"]
  }
].map(t => ({ 
  ...t, 
  etat: "", 
  completed: false,
  derniere_realisation: null,
  streak: 0,
  meilleur_streak: 0,
  id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}));

/**
 * Composant principal de l'application NourRise
 * Gère l'affichage et la logique de l'application de développement personnel
 */
export default function Home() {
  // ===== ÉTATS PRINCIPAUX =====
  // États de base pour l'utilisateur et les données
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
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
  const [badges, setBadges] = useState([]);
  const [statsCategories, setStatsCategories] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [combo, setCombo] = useState(0);
  const [dernierCombo, setDernierCombo] = useState(null);
  const [bonusActif, setBonusActif] = useState(null);
  const [defisJour, setDefisJour] = useState([]);
  const [modeNuit, setModeNuit] = useState(false);
  const [vueHistorique, setVueHistorique] = useState('liste'); // 'liste' ou 'calendrier'
  const [afficherDetailsJournee, setAfficherDetailsJournee] = useState(false);
  const [journeeSelectionnee, setJourneeSelectionnee] = useState(null);
  const [animationSuccess, setAnimationSuccess] = useState(false);
  const [tachesFiltrees, setTachesFiltrees] = useState([]);
  const [filtreRecherche, setFiltreRecherche] = useState("");
  const [synchronisationActive, setSynchronisationActive] = useState(false);
  const [dateStats, setDateStats] = useState(new Date());
  const [modeProfil, setModeProfil] = useState(false);
  const [alerteNouvelleFonctionnalite, setAlerteNouvelleFonctionnalite] = useState(true);
  
  // État pour la modal d'ajout de tâche
  const [showModal, setShowModal] = useState(false);
  const [nouvelleTache, setNouvelleTache] = useState({
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    nom: "",
    coef: 3,
    categorie: "SPIRITUEL",
    points: 30,
    description: "",
    conseils: [],
    tempsEstime: "15-30 min",
    bienfaits: []
  });

  // État pour le tutoriel et l'onboarding
  const [tutorielActif, setTutorielActif] = useState(false);
  const [etapeTutoriel, setEtapeTutoriel] = useState(0);

  // États avancés pour les fonctionnalités premium
  const [planPersonnalise, setPlanPersonnalise] = useState(null);
  const [suggestionsPersonnalisees, setSuggestionsPersonnalisees] = useState([]);
  const [statistiquesDetaillees, setStatistiquesDetaillees] = useState({});
  const [objectifsLongTerme, setObjectifsLongTerme] = useState([]);
  const [journalReflexion, setJournalReflexion] = useState([]);

  // Références pour les animations et interactions
  const confettiRef = useRef(null);
  const chartRef = useRef(null);
  const calendarRef = useRef(null);
  const modalRef = useRef(null);
  const progressBarRef = useRef(null);
  const tutorielRef = useRef(null);

  // ===== EFFETS ET INITIALISATION =====
  
  // Effet d'initialisation - Vérification de la session utilisateur
  useEffect(() => {
    const verifierSession = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push("/connexion");
          return;
        }
        
        setUser(session.user);
        
        // Charger les préférences utilisateur depuis Supabase
        const { data: preferences } = await supabase
          .from('preferences_utilisateurs')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        // Appliquer les préférences si elles existent
        if (preferences) {
          setModeNuit(preferences.mode_nuit || false);
          
          // Autres préférences personnalisées
          if (preferences.categories_favorites) {
            setCategorieActive(preferences.categories_favorites[0] || "TOUS");
          }
          
          // Vérifier si l'utilisateur a déjà vu le tutoriel
          if (preferences.tutoriel_complete === false) {
            setTutorielActif(true);
          }
        }
        
        await initialiserJournee(session.user.id);
      } catch (error) {
        console.error('Erreur de session:', error);
        toast.error("Erreur d'authentification. Veuillez vous reconnecter.");
        router.push("/connexion");
      } finally {
        setLoading(false);
      }
    };
    
    verifierSession();
    
    // Écouter les changements d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          router.push("/connexion");
        } else if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          await initialiserJournee(session.user.id);
        }
      }
    );
    
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Effet pour la vérification des heures bonus - vérifie chaque minute
  useEffect(() => {
    const interval = setInterval(() => {
      verifierHeureBonus();
    }, 60000); // Vérifier chaque minute
    
    // Vérification initiale
    verifierHeureBonus();
    
    return () => clearInterval(interval);
  }, []);

  // Effet pour lancer le confetti lorsque showConfetti devient true
  useEffect(() => {
    if (showConfetti && confettiRef.current) {
      lancerConfetti();
      // Réinitialiser après 2 secondes
      setTimeout(() => setShowConfetti(false), 2000);
    }
  }, [showConfetti]);

  // Effet pour filtrer les tâches en fonction de la catégorie active et du filtre de recherche
  useEffect(() => {
    const filtrerTaches = () => {
      let filtered = [...taches];
      
      // Filtrer par catégorie
      if (categorieActive !== "TOUS") {
        filtered = filtered.filter(t => t.categorie === categorieActive);
      }
      
      // Filtrer par recherche
      if (filtreRecherche.trim() !== "") {
        const searchTerm = filtreRecherche.toLowerCase();
        filtered = filtered.filter(t => 
          t.nom.toLowerCase().includes(searchTerm) || 
          (t.description && t.description.toLowerCase().includes(searchTerm))
        );
      }
      
      setTachesFiltrees(filtered);
    };
    
    filtrerTaches();
  }, [taches, categorieActive, filtreRecherche]);

  // Effet pour vérifier les réalisations de badges après chaque action
  useEffect(() => {
    if (user && taches.length > 0 && historique.length > 0) {
      verifierBadges();
    }
  }, [taches, historique, user]);

  // Effet pour sauvegarder périodiquement les données en cas de fermeture accidentelle
  useEffect(() => {
    const intervalSauvegarde = setInterval(() => {
      if (user && taches.length > 0) {
        sauvegarderProgressionLocale();
      }
    }, 60000); // Sauvegarde toutes les minutes
    
    return () => clearInterval(intervalSauvegarde);
  }, [user, taches]);

  // ===== FONCTIONS UTILITAIRES =====
  
  /**
   * Lance l'effet de confettis pour célébrer les réussites
   * @param {Object} options - Options de configuration des confettis
   */
  const lancerConfetti = (options = {}) => {
    const config = {
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'],
      ...options
    };
    
    confetti(config);
    
    // Pour un effet plus impressionnant, lancer plusieurs vagues
    setTimeout(() => {
      confetti({
        ...config,
        particleCount: 50,
        angle: 60,
        spread: 55,
      });
    }, 200);
    
    setTimeout(() => {
      confetti({
        ...config,
        particleCount: 50,
        angle: 120,
        spread: 55
      });
    }, 400);
  };
  
  /**
   * Formatte une date pour l'affichage en français
   * @param {Date} date - La date à formater
   * @param {string} formatStr - Le format de date souhaité
   * @returns {string} - La date formatée
   */
  const formatDate = (date, formatStr = 'dd MMMM yyyy') => {
    return format(new Date(date), formatStr, { locale: fr });
  };

  /**
   * Sauvegarde la progression dans le stockage local en cas de problème
   */
  const sauvegarderProgressionLocale = () => {
    try {
      localStorage.setItem('nourrise_taches', JSON.stringify(taches));
      localStorage.setItem('nourrise_derniere_sauvegarde', new Date().toISOString());
    } catch (error) {
      console.error('Erreur lors de la sauvegarde locale:', error);
    }
  };

  /**
   * Restaure la progression depuis le stockage local si disponible
   */
  const restaurerProgressionLocale = () => {
    try {
      const tachesSauvegardees = localStorage.getItem('nourrise_taches');
      const derniereSauvegarde = localStorage.getItem('nourrise_derniere_sauvegarde');
      
      if (tachesSauvegardees && derniereSauvegarde) {
        const dateRestoration = new Date(derniereSauvegarde);
        const maintenant = new Date();
        
        // Ne restaurer que si la sauvegarde est récente (moins de 24h)
        if (Math.abs(maintenant - dateRestoration) < 24 * 60 * 60 * 1000) {
          setTaches(JSON.parse(tachesSauvegardees));
          toast.info("Progression précédente restaurée");
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de la restauration locale:', error);
      return false;
    }
  };

  /**
   * Génère un identifiant unique pour les tâches et autres éléments
   * @returns {string} - Un identifiant unique
   */
  const genererID = () => {
    return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // ===== FONCTIONS DE CHARGEMENT ET D'INITIALISATION =====
  
  /**
   * Charge l'historique des activités de l'utilisateur depuis Supabase
   * @param {string} userId - L'identifiant de l'utilisateur
   */
  const chargerHistorique = async (userId) => {
    try {
      setLoadingAction(true);
      
      // Requête à Supabase pour récupérer l'historique
      const { data, error } = await supabase
        .from('historique')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      
      if (error) {
        throw new Error(`Erreur Supabase: ${error.message}`);
      }
      
      // Mettre à jour l'état avec les données récupérées
      setHistorique(data || []);
      
      // Mise à jour du streak si on a des données
      if (data && data.length > 0) {
        // Vérifier si la dernière entrée est d'aujourd'hui ou d'hier
        const dernierJour = new Date(data[0].date);
        const aujourdhui = new Date();
        const hier = new Date();
        hier.setDate(hier.getDate() - 1);
        
        // Vérifier la continuité du streak
        if (isSameDay(dernierJour, aujourdhui)) {
          // Journée déjà validée aujourd'hui
          setStreak(data[0].streak || 0);
        } else if (isSameDay(dernierJour, hier)) {
          // Continuité du streak d'hier
          setStreak(data[0].streak || 0);
        } else {
          // Interruption du streak
          setStreak(0);
        }
      }

      // Charger les points et calculer les statistiques
      if (data && data.length > 0) {
        const pointsTotaux = data.reduce((acc, jour) => acc + (jour.points || 0), 0);
        setPoints(pointsTotaux);
        
        // Mettre à jour le niveau
        calculerNiveau(pointsTotaux);
        
        // Calculer les statistiques par catégorie
        calculerStatistiquesCategories(data);
      }
      
      return data;
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
      toast.error("Erreur lors du chargement de l'historique");
      setHistorique([]);
      return [];
    } finally {
      setLoadingAction(false);
    }
  };

  /**
   * Charge les succès (achievements) de l'utilisateur depuis Supabase
   */
  const chargerAchievements = async () => {
    if (!user) return;
    
    try {
      setLoadingAction(true);
      
      // Récupérer les achievements depuis Supabase
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        throw new Error(`Erreur Supabase: ${error.message}`);
      }
      
      setAchievements(data || []);
      
      // Charger également les badges
      const { data: badgesData, error: badgesError } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', user.id);
      
      if (badgesError) {
        throw new Error(`Erreur Supabase: ${badgesError.message}`);
      }
      
      setBadges(badgesData || []);
      
    } catch (error) {
      console.error('Erreur lors du chargement des achievements:', error);
      toast.error("Erreur lors du chargement des succès");
      setAchievements([]);
      setBadges([]);
    } finally {
      setLoadingAction(false);
    }
  };

  /**
   * Génère les défis quotidiens pour l'utilisateur
   */
  const genererDefisQuotidiens = () => {
    // Vérifier s'il y a des tâches sauvegardées localement
    const restaurationReussie = restaurerProgressionLocale();
    
    if (!restaurationReussie) {
      // Si pas de restauration, générer les tâches initiales
      const tachesNonCompletees = tachesJournalieresInitiales.map(t => ({
        ...t,
        id: genererID(),
        derniere_realisation: null
      }));
      
      setTaches(tachesNonCompletees);
    }
    
    // Générer des défis supplémentaires en fonction du niveau
    if (niveau >= 2) {
      const defisJournaliers = genererDefisPersonnalises(niveau);
      setDefisJour(defisJournaliers);
    }
  };

  /**
   * Génère des défis personnalisés en fonction du niveau de l'utilisateur
   * @param {number} niveauUtilisateur - Le niveau actuel de l'utilisateur
   * @returns {Array} - Les défis personnalisés
   */
  const genererDefisPersonnalises = (niveauUtilisateur) => {
    const defis = [];
    
    // Générer des défis en fonction du niveau
    if (niveauUtilisateur >= 2) {
      defis.push({
        id: genererID(),
        titre: "Combo du jour",
        description: "Complète 3 tâches à la suite sans interruption",
        recompense: 30,
        icone: "🔄",
        complete: false
      });
    }
    
    if (niveauUtilisateur >= 3) {
      defis.push({
        id: genererID(),
        titre: "Équilibre parfait",
        description: "Complète au moins une tâche dans chaque catégorie",
        recompense: 50,
        icone: "⚖️",
        complete: false
      });
    }
    
    if (niveauUtilisateur >= 4) {
      defis.push({
        id: genererID(),
        titre: "Défi du mentor",
        description: "Aide un autre utilisateur ou partage ton expérience",
        recompense: 70,
        icone: "🧠",
        complete: false
      });
    }
    
    return defis;
  };

  /**
   * Affiche une notification à l'utilisateur
   * @param {string} message - Le message à afficher
   * @param {string} type - Le type de notification (info, success, error, achievement)
   */
  const afficherNotification = (message, type = 'info') => {
    // Afficher la notification dans l'interface
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
    
    // Utiliser également react-toastify pour des notifications plus riches
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'achievement':
        toast.info(message, {
          icon: '🏆',
          className: 'achievement-toast'
        });
        break;
      default:
        toast.info(message);
    }
  };

  /**
   * Initialise la journée avec toutes les données nécessaires
   * @param {string} userId - L'identifiant de l'utilisateur
   */
  const initialiserJournee = async (userId) => {
    try {
      setLoading(true);
      
      // Charger les données principales
      const historiqueData = await chargerHistorique(userId);
      
      // Vérifier si la journée a déjà été initialisée aujourd'hui
      const aujourdhui = new Date();
      const journeeDejaInitialisee = historiqueData?.some(entry => 
        isSameDay(new Date(entry.date), aujourdhui)
      );
      
      // Si la journée n'a pas encore été initialisée, générer les tâches
      if (!journeeDejaInitialisee) {
        genererDefisQuotidiens();
      } else {
        // Sinon, charger les tâches actuelles depuis la base de données
        const { data: tachesData, error: tachesError } = await supabase
          .from('taches_jour')
          .select('*')
          .eq('user_id', userId)
          .eq('date', formatDate(aujourdhui, 'yyyy-MM-dd'));
        
        if (tachesError) {
          console.error('Erreur lors du chargement des tâches du jour:', tachesError);
          genererDefisQuotidiens(); // Fallback sur la génération par défaut
        } else if (tachesData && tachesData.length > 0) {
          setTaches(tachesData[0].taches || tachesJournalieresInitiales);
          setPointsJour(tachesData[0].points_jour || 0);
        } else {
          genererDefisQuotidiens();
        }
      }
      
      // Initialiser les autres éléments de la journée
      selectionnerCitationDuJour();
      verifierHeureBonus();
      await chargerAchievements();
      
      // Calculer et mettre à jour les statistiques
      if (historiqueData && historiqueData.length > 0) {
        calculerStatistiquesCategories(historiqueData);
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      toast.error("Une erreur est survenue lors de l'initialisation");
      
      // Initialisation minimale en cas d'erreur
      setTaches(tachesJournalieresInitiales);
      selectionnerCitationDuJour();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sélectionne une citation du jour aléatoire
   */
  const selectionnerCitationDuJour = () => {
    // Sélectionner une citation aléatoire
    const index = Math.floor(Math.random() * CITATIONS.length);
    setCitationDuJour(CITATIONS[index]);
  };

  /**
   * Vérifie si l'heure actuelle correspond à une période de bonus
   */
  const verifierHeureBonus = () => {
    const maintenant = new Date();
    const heure = maintenant.getHours();
    
    // Vérifier chaque période de bonus
    for (const [key, periode] of Object.entries(RECOMPENSES_VARIABLES.POWER_HOURS)) {
      if (heure >= periode.debut && heure < periode.fin) {
        setBonusActif(periode);
        return;
      }
    }
    
    // Aucun bonus actif pour l'heure actuelle
    setBonusActif(null);
  };

  /**
   * Calcule les statistiques par catégorie à partir de l'historique
   * @param {Array} historiqueData - Les données d'historique
   */
  const calculerStatistiquesCategories = (historiqueData) => {
    try {
      // Initialiser les statistiques
      const stats = Object.keys(CATEGORIES).reduce((acc, cat) => {
        if (cat !== "TOUS") {
          acc[cat] = { 
            total: 0, 
            complete: 0, 
            points: 0, 
            tauxReussite: 0,
            tendance: 'stable' // 'hausse', 'baisse', 'stable'
          };
        }
        return acc;
      }, {});
      
      // Calculer les statistiques pour chaque entrée d'historique
      if (historiqueData && historiqueData.length > 0) {
        // Analyser les 7 derniers jours pour les tendances
        const derniersJours = historiqueData.slice(0, Math.min(7, historiqueData.length));
        
        // Pour chaque jour, analyser les tâches complétées par catégorie
        derniersJours.forEach(jour => {
          if (jour.details_taches) {
            Object.entries(jour.details_taches).forEach(([categorie, details]) => {
              if (stats[categorie]) {
                stats[categorie].total += details.total || 0;
                stats[categorie].complete += details.complete || 0;
                stats[categorie].points += details.points || 0;
              }
            });
          }
        });
        
        // Calculer les taux de réussite et tendances
        Object.keys(stats).forEach(categorie => {
          if (stats[categorie].total > 0) {
            stats[categorie].tauxReussite = Math.round((stats[categorie].complete / stats[categorie].total) * 100);
          }
          
          // Analyser la tendance (comparaison avec la semaine précédente)
          if (historiqueData.length > 7) {
            const semainePrecedente = historiqueData.slice(7, Math.min(14, historiqueData.length));
            let completePrecedent = 0;
            let totalPrecedent = 0;
            
            semainePrecedente.forEach(jour => {
              if (jour.details_taches && jour.details_taches[categorie]) {
                completePrecedent += jour.details_taches[categorie].complete || 0;
                totalPrecedent += jour.details_taches[categorie].total || 0;
              }
            });
            
            const tauxPrecedent = totalPrecedent > 0 
              ? (completePrecedent / totalPrecedent) * 100 
              : 0;
            
            const difference = stats[categorie].tauxReussite - tauxPrecedent;
            
            // Déterminer la tendance
            if (difference > 5) {
              stats[categorie].tendance = 'hausse';
            } else if (difference < -5) {
              stats[categorie].tendance = 'baisse';
            } else {
              stats[categorie].tendance = 'stable';
            }
          }
        });
      }
      
      setStatsCategories(stats);
      
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques par catégorie:', error);
    }
  };

  // ===== FONCTIONS DE GESTION DES POINTS ET PROGRESSION =====
  
  /**
   * Ajoute des points au score de l'utilisateur
   * @param {number} pointsGagnes - Le nombre de points à ajouter
   * @param {string} source - La source des points (nom de la tâche, etc.)
   */
  const ajouterPoints = (pointsGagnes, source = '') => {
    // Vérifier si un bonus est actif
    let pointsFinaux = pointsGagnes;
    let detailsBonus = '';
    
    // Appliquer bonus d'heure
    if (bonusActif) {
      const bonusHeure = Math.round(pointsGagnes * (bonusActif.multiplicateur - 1));
      pointsFinaux += bonusHeure;
      detailsBonus += `Bonus ${bonusActif.nom}: +${bonusHeure} points\n`;
    }
    
    // Bonus de niveau (à partir du niveau 3)
    if (niveau >= 3) {
      const bonusNiveau = Math.round(pointsGagnes * 0.25); // +25% au niveau 3+
      pointsFinaux += bonusNiveau;
      detailsBonus += `Bonus niveau ${niveau}: +${bonusNiveau} points\n`;
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
    
    // Message détaillé
    const messageDetail = detailsBonus 
      ? `${messageSucces}\nPoints de base: ${pointsGagnes}\n${detailsBonus}Total: +${pointsFinaux} points` 
      : `${messageSucces} +${pointsFinaux} points`;
    
    afficherNotification(messageDetail, 'success');
    
    // Bonus de combo
    if (combo > 0) {
      // Vérifier si le combo atteint un seuil pour un bonus
      const comboThreshold = RECOMPENSES_VARIABLES.COMBO_REQUIS.find(seuil => combo % seuil === 0);
      
      if (comboThreshold) {
        const bonusCombo = Math.round(pointsFinaux * 0.5); // 50% de bonus
        setPoints(prev => prev + bonusCombo);
        setPointsJour(prev => prev + bonusCombo);
        
        afficherNotification(`🔥 Combo ×${combo} ! Bonus de +${bonusCombo} points`, 'achievement');
        setShowConfetti(true);
        setAnimationSuccess(true);
        setTimeout(() => setAnimationSuccess(false), 2000);
        
        // Vérifier si c'est un nouveau record de combo
        if (!dernierCombo || combo > dernierCombo) {
          setDernierCombo(combo);
          
          // Si c'est un combo important, ajouter un achievement
          if (combo >= 5) {
            ajouterAchievement({
              type: 'COMBO',
              titre: `Combo ×${combo}`,
              description: `Tu as enchaîné ${combo} tâches d'affilée !`,
              icone: '🔄',
              date: new Date().toISOString(),
              details: { combo: combo }
            });
          }
        }
      }
    }
    
    // Mettre à jour la progression dans Supabase
    sauvegarderProgression();
  };

  /**
   * Sauvegarde la progression et les points dans Supabase
   */
  const sauvegarderProgression = async () => {
    if (!user) return;
    
    try {
      setSynchronisationActive(true);
      
      // Mettre à jour les tâches du jour
      const { error: erreurTaches } = await supabase
        .from('taches_jour')
        .upsert({
          user_id: user.id,
          date: formatDate(new Date(), 'yyyy-MM-dd'),
          taches: taches,
          points_jour: pointsJour
        });
      
      if (erreurTaches) {
        throw new Error(`Erreur lors de la sauvegarde des tâches: ${erreurTaches.message}`);
      }
      
      // Mettre à jour le profil utilisateur avec le total des points et le niveau
      const { error: erreurProfil } = await supabase
        .from('profils')
        .upsert({
          id: user.id,
          points_total: points,
          niveau: niveau,
          streak: streak,
          dernier_combo: dernierCombo || 0,
          updated_at: new Date().toISOString()
        });
      
      if (erreurProfil) {
        throw new Error(`Erreur lors de la mise à jour du profil: ${erreurProfil.message}`);
      }
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la progression:', error);
      // Continuer même en cas d'erreur, les données sont sauvegardées localement
    } finally {
      setSynchronisationActive(false);
    }
  };

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
    const ancienNiveau = niveau;
    setNiveau(nouveauNiveau);
    
    // Effets visuels
    setShowConfetti(true);
    setAnimationSuccess(true);
    setTimeout(() => setAnimationSuccess(false), 3000);
    
    // Message de félicitations
    const message = `🎉 Niveau ${nouveauNiveau} atteint !\n${NIVEAUX[nouveauNiveau-1].motivation}\n\nNouveau bonus: ${NIVEAUX[nouveauNiveau-1].bonus}`;
    afficherNotification(message, 'achievement');
    
    // Animation spéciale pour la montée de niveau
    // Déjà gérée par animationSuccess
    
    // Ajouter un achievement de niveau
    ajouterAchievement({
      type: 'NIVEAU',
      titre: `Niveau ${nouveauNiveau} - ${NIVEAUX[nouveauNiveau-1].nom}`,
      description: NIVEAUX[nouveauNiveau-1].motivation,
      icone: NIVEAUX[nouveauNiveau-1].icone,
      medaille: NIVEAUX[nouveauNiveau-1].medaille,
      date: new Date().toISOString(),
      details: { 
        niveau: nouveauNiveau,
        niveau_precedent: ancienNiveau
      }
    });
    
    // Débloquer de nouvelles fonctionnalités selon le niveau
    if (nouveauNiveau >= 2 && ancienNiveau < 2) {
      // Niveau 2: Débloquer les défis quotidiens
      const defisJournaliers = genererDefisPersonnalises(nouveauNiveau);
      setDefisJour(defisJournaliers);
      
      setTimeout(() => {
        afficherNotification("🎯 Nouvelle fonctionnalité débloquée: Défis quotidiens!", 'info');
      }, 3000);
    }
    
    if (nouveauNiveau >= 3 && ancienNiveau < 3) {
      // Niveau 3: Débloquer les statistiques avancées
      setTimeout(() => {
        afficherNotification("📊 Nouvelle fonctionnalité débloquée: Statistiques avancées!", 'info');
      }, 4000);
    }
    
    if (nouveauNiveau >= 4 && ancienNiveau < 4) {
      // Niveau 4: Débloquer les achievements spéciaux
      setTimeout(() => {
        afficherNotification("🏆 Nouvelle fonctionnalité débloquée: Achievements spéciaux!", 'info');
      }, 5000);
    }
    
    if (nouveauNiveau >= 5 && ancienNiveau < 5) {
      // Niveau 5: Débloquer le mode Mentor
      setTimeout(() => {
        afficherNotification("👑 Nouvelle fonctionnalité débloquée: Mode Mentor!", 'info');
      }, 6000);
    }
  };

  /**
   * Ajoute un achievement (réussite) à l'utilisateur
   * @param {Object} achievement - Les détails de l'achievement
   */
  const ajouterAchievement = async (achievement) => {
    if (!user) return;
    
    try {
      // Vérifier si l'achievement existe déjà pour éviter les doublons
      const { data: existants, error: erreurVerif } = await supabase
        .from('achievements')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', achievement.type)
        .eq('titre', achievement.titre);
      
      if (erreurVerif) {
        throw new Error(`Erreur lors de la vérification des achievements: ${erreurVerif.message}`);
      }
      
      // Ne pas ajouter si déjà existant
      if (existants && existants.length > 0) {
        return;
      }
      
      // Ajouter l'achievement dans Supabase
      const { data, error } = await supabase
        .from('achievements')
        .insert([
          {
            user_id: user.id,
            ...achievement
          }
        ]);
      
      if (error) {
        throw new Error(`Erreur lors de l'ajout d'un achievement: ${error.message}`);
      }
      
      // Recharger les achievements
      await chargerAchievements();
      
      // Notification visuelle
      afficherNotification(`🏆 Achievement débloqué: ${achievement.titre}`, 'achievement');
      setShowConfetti(true);
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout d\'un achievement:', error);
    }
  };

  /**
   * Vérifie si l'utilisateur a débloqué de nouveaux badges
   */
  const verifierBadges = async () => {
    if (!user) return;
    
    try {
      // Vérifier les badges déjà obtenus
      const badgesActuels = badges.map(b => b.id);
      
      // Pour chaque badge dans la liste
      for (const badge of BADGES) {
        // Si déjà obtenu, passer au suivant
        if (badgesActuels.includes(badge.id)) continue;
        
        // Vérifier les conditions d'obtention
        let conditionRemplie = false;
        
        switch (badge.id) {
          case 'early_riser': 
            // Compléter 5 tâches avant 8h
            const tachesMatinales = historique.filter(jour => {
              return jour.details_taches && 
                     Object.values(jour.details_taches).some(cat => 
                       cat.taches_matinales && cat.taches_matinales >= 1
                     );
            }).length;
            conditionRemplie = tachesMatinales >= 5;
            break;
            
          case 'night_owl':
            // Compléter 5 tâches après 22h
            const tachesNocturnes = historique
                        const tachesNocturnes = historique.filter(jour => {
              return jour.details_taches && 
                     Object.values(jour.details_taches).some(cat => 
                       cat.taches_nocturnes && cat.taches_nocturnes >= 1
                     );
            }).length;
            conditionRemplie = tachesNocturnes >= 5;
            break;
            
          case 'combo_master':
            // Atteindre un combo de 10
            conditionRemplie = dernierCombo >= 10;
            break;
            
          case 'perfect_week':
            // 100% de tâches complétées pendant 7 jours
            if (historique.length >= 7) {
              const derniersJours = historique.slice(0, 7);
              conditionRemplie = derniersJours.every(jour => jour.taux_reussite === 100);
            }
            break;
            
          case 'spiritual_seeker':
            // Compléter 50 tâches spirituelles
            const tachesSpirituelles = historique.reduce((total, jour) => {
              if (jour.details_taches && jour.details_taches.SPIRITUEL) {
                return total + (jour.details_taches.SPIRITUEL.complete || 0);
              }
              return total;
            }, 0);
            conditionRemplie = tachesSpirituelles >= 50;
            break;
            
          case 'knowledge_hunter':
            // Compléter 50 tâches éducatives
            const tachesEducatives = historique.reduce((total, jour) => {
              if (jour.details_taches && jour.details_taches.EDUCATION) {
                return total + (jour.details_taches.EDUCATION.complete || 0);
              }
              return total;
            }, 0);
            conditionRemplie = tachesEducatives >= 50;
            break;
            
          case 'fitness_guru':
            // Compléter 50 tâches sportives
            const tachesSportives = historique.reduce((total, jour) => {
              if (jour.details_taches && jour.details_taches.SPORT) {
                return total + (jour.details_taches.SPORT.complete || 0);
              }
              return total;
            }, 0);
            conditionRemplie = tachesSportives >= 50;
            break;
            
          case 'growth_adept':
            // Compléter 50 tâches de développement
            const tachesDeveloppement = historique.reduce((total, jour) => {
              if (jour.details_taches && jour.details_taches.DEVELOPPEMENT) {
                return total + (jour.details_taches.DEVELOPPEMENT.complete || 0);
              }
              return total;
            }, 0);
            conditionRemplie = tachesDeveloppement >= 50;
            break;
            
          case 'balanced_soul':
            // Compléter des tâches dans toutes les catégories pendant 10 jours
            if (historique.length >= 10) {
              const categories = Object.keys(CATEGORIES).filter(cat => cat !== "TOUS");
              const derniersJours = historique.slice(0, 10);
              
              // Compter les jours où toutes les catégories ont au moins une tâche complétée
              const joursEquilibres = derniersJours.filter(jour => {
                if (!jour.details_taches) return false;
                
                // Vérifier si chaque catégorie a au moins une tâche complétée
                return categories.every(cat => 
                  jour.details_taches[cat] && jour.details_taches[cat].complete > 0
                );
              }).length;
              
              conditionRemplie = joursEquilibres >= 10;
            }
            break;
            
          case 'consistency_king':
            // Maintenir un streak de 30 jours
            conditionRemplie = streak >= 30;
            break;
            
          case 'comeback_kid':
            // Reprendre après une interruption de streak
            // Vérifier si l'utilisateur a eu une interruption puis a repris
            if (historique.length >= 3) {
              const aujourdhui = new Date();
              const hier = new Date(aujourdhui);
              hier.setDate(hier.getDate() - 1);
              
              const jourActuel = historique[0];
              const jourPrecedent = historique[1];
              const jourEncorePrecedent = historique[2];
              
              // Vérifier si le streak actuel est de 1 (reprise) et qu'il y a eu une interruption
              const reprise = jourActuel.streak === 1;
              const interruption = jourPrecedent.streak === 0 && jourEncorePrecedent.streak > 0;
              
              conditionRemplie = reprise && interruption;
            }
            break;
            
          case 'dawn_seeker':
            // Compléter 20 tâches pendant le bonus Fajr
            const tachesFajr = historique.reduce((total, jour) => {
              if (jour.details_bonus && jour.details_bonus.fajr) {
                return total + (jour.details_bonus.fajr.taches_completees || 0);
              }
              return total;
            }, 0);
            conditionRemplie = tachesFajr >= 20;
            break;
            
          case 'social_butterfly':
            // Compléter 30 tâches sociales
            const tachesSociales = historique.reduce((total, jour) => {
              if (jour.details_taches && jour.details_taches.SOCIAL) {
                return total + (jour.details_taches.SOCIAL.complete || 0);
              }
              return total;
            }, 0);
            conditionRemplie = tachesSociales >= 30;
            break;
            
          case 'reflection_master':
            // Noter ses réflexions pendant 20 jours
            const joursAvecReflexion = historique.filter(jour => 
              jour.reflexions && jour.reflexions.length > 0
            ).length;
            conditionRemplie = joursAvecReflexion >= 20;
            break;
            
          default:
            break;
        }
        
        // Si la condition est remplie, débloquer le badge
        if (conditionRemplie) {
          await debloquerBadge(badge);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des badges:', error);
    }
  };

  /**
   * Débloque un nouveau badge pour l'utilisateur
   * @param {Object} badge - Les informations du badge à débloquer
   */
  const debloquerBadge = async (badge) => {
    if (!user) return;
    
    try {
      // Ajouter le badge dans Supabase
      const { data, error } = await supabase
        .from('badges')
        .insert([
          {
            user_id: user.id,
            badge_id: badge.id,
            nom: badge.nom,
            icone: badge.icone,
            description: badge.condition,
            date_obtention: new Date().toISOString(),
            difficulte: badge.difficulte
          }
        ]);
      
      if (error) {
        throw new Error(`Erreur lors du déblocage d'un badge: ${error.message}`);
      }
      
      // Recharger les badges
      const { data: badgesData, error: badgesError } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', user.id);
      
      if (badgesError) {
        throw new Error(`Erreur lors du chargement des badges: ${badgesError.message}`);
      }
      
      setBadges(badgesData || []);
      
      // Notification visuelle
      afficherNotification(`🏅 Badge débloqué: ${badge.nom}`, 'achievement');
      setShowConfetti(true);
      
      // Bonus de points pour chaque badge obtenu
      const pointsBonus = badge.difficulte * 50; // Plus le badge est difficile, plus il rapporte
      ajouterPoints(pointsBonus, `Badge ${badge.nom}`);
      
    } catch (error) {
      console.error('Erreur lors du déblocage d\'un badge:', error);
    }
  };

  // ===== FONCTIONS DE GESTION DES TÂCHES =====
  
  /**
   * Ajoute une nouvelle tâche personnalisée
   */
  const ajouterNouvelleTache = async () => {
    try {
      // Valider les champs obligatoires
      if (!nouvelleTache.nom.trim()) {
        afficherNotification('Veuillez entrer un nom pour la tâche', 'error');
        return;
      }

      // Générer un ID unique pour la tâche
      const tacheId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Préparer la tâche avec toutes les propriétés nécessaires
      const tacheAjoutee = {
        ...nouvelleTache,
        id: tacheId,
        etat: "",
        completed: false,
        derniere_realisation: null,
        streak: 0,
        meilleur_streak: 0,
        date_creation: new Date().toISOString()
      };

      // Mettre à jour l'état local
      setTaches(prevTaches => [...prevTaches, tacheAjoutee]);
      
      // Si l'utilisateur est connecté, sauvegarder dans Supabase
      if (user) {
        // Sauvegarder la nouvelle tâche dans la collection de l'utilisateur
        const { error } = await supabase
          .from('taches_personnalisees')
          .insert([
            {
              user_id: user.id,
              tache: tacheAjoutee,
              categorie: tacheAjoutee.categorie,
              date_creation: new Date().toISOString(),
              favoris: false
            }
          ]);
          
        if (error) {
          console.error('Erreur lors de la sauvegarde de la tâche personnalisée:', error);
          afficherNotification('Erreur lors de la sauvegarde de la tâche', 'error');
        }
          
        // Mettre à jour également les tâches du jour
        await sauvegarderProgression();
      }

      // Fermer la modal et réinitialiser le formulaire
      setShowModal(false);
      
      // Notification de succès
      afficherNotification('Tâche ajoutée avec succès', 'success');
      
      // Réinitialiser le formulaire pour la prochaine tâche
      setNouvelleTache({
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        nom: "",
        coef: 3,
        categorie: "SPIRITUEL",
        points: 30,
        description: "",
        conseils: [],
        tempsEstime: "15-30 min",
        bienfaits: []
      });
      
      // Effet visuel de confirmation
      setAnimationSuccess(true);
      setTimeout(() => setAnimationSuccess(false), 1500);
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout d\'une tâche:', error);
      afficherNotification('Une erreur est survenue lors de l\'ajout de la tâche', 'error');
    }
  };

  /**
   * Met à jour le statut d'une tâche
   * @param {number} index - L'index de la tâche à mettre à jour
   * @param {string} nouvelEtat - Le nouvel état de la tâche
   */
  const mettreAJourEtatTache = (index, nouvelEtat) => {
    try {
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
        
        // Mise à jour du streak de la tâche
        if (updated[index].streak === undefined) {
          updated[index].streak = 1;
        } else {
          updated[index].streak += 1;
        }
        
        // Mettre à jour le meilleur streak si nécessaire
        if (!updated[index].meilleur_streak || updated[index].streak > updated[index].meilleur_streak) {
          updated[index].meilleur_streak = updated[index].streak;
        }
        
        // Ajouter les points
        ajouterPoints(updated[index].points || updated[index].coef * 10, updated[index].nom);
        
        // Augmenter le combo
        setCombo(prev => prev + 1);
        
        // Vérifier si cette action complète un défi
        verifierCompletion(updated[index]);
      } 
      // Si la tâche était terminée et est maintenant dans un autre état
      else if (ancienEtat === "Terminé" && nouvelEtat !== "Terminé") {
        // Réinitialiser le streak de la tâche
        updated[index].streak = 0;
        
        // Réduire le combo
        setCombo(prev => Math.max(0, prev - 1));
      }
      
      // Mettre à jour l'état
      setTaches(updated);
      
      // Sauvegarder les changements dans Supabase
      sauvegarderProgression();
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'état de la tâche:', error);
      afficherNotification('Une erreur est survenue lors de la mise à jour de la tâche', 'error');
    }
  };

  /**
   * Vérifie si la complétion d'une tâche remplit un défi ou un objectif
   * @param {Object} tacheCompletee - La tâche qui vient d'être complétée
   */
  const verifierCompletion = (tacheCompletee) => {
    // Vérifier les défis du jour
    const defisUpdated = [...defisJour];
    let defiComplete = false;
    
    // Pour chaque défi, vérifier s'il est complété
    defisUpdated.forEach((defi, index) => {
      if (defi.complete) return; // Déjà complété
      
      let estComplete = false;
      
      switch (defi.titre) {
        case "Combo du jour":
          estComplete = combo >= 3;
          break;
        case "Équilibre parfait":
          // Vérifier si au moins une tâche est complétée dans chaque catégorie
          const categories = Object.keys(CATEGORIES).filter(cat => cat !== "TOUS");
          const categoriesCompletes = new Set();
          
          taches.forEach(tache => {
            if (tache.completed && categories.includes(tache.categorie)) {
              categoriesCompletes.add(tache.categorie);
            }
          });
          
          estComplete = categoriesCompletes.size === categories.length;
          break;
        default:
          break;
      }
      
      // Si le défi est complété
      if (estComplete) {
        defisUpdated[index].complete = true;
        defiComplete = true;
        
        // Ajouter les points de récompense
        ajouterPoints(defi.recompense, `Défi: ${defi.titre}`);
      }
    });
    
    if (defiComplete) {
      setDefisJour(defisUpdated);
      setShowConfetti(true);
    }
  };

  /**
   * Supprime une tâche de la liste
   * @param {string} tacheId - L'identifiant de la tâche à supprimer
   */
  const supprimerTache = async (tacheId) => {
    try {
      // Confirmation de suppression
      if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
        return;
      }
      
      // Supprimer de l'état local
      setTaches(prevTaches => prevTaches.filter(t => t.id !== tacheId));
      
      // Si l'utilisateur est connecté, supprimer de Supabase
      if (user) {
        // Supprimer la tâche personnalisée
        const { error } = await supabase
          .from('taches_personnalisees')
          .delete()
          .match({ user_id: user.id, 'tache.id': tacheId });
          
        if (error) {
          console.error('Erreur lors de la suppression de la tâche:', error);
          afficherNotification('Erreur lors de la suppression de la tâche', 'error');
        } else {
          // Mettre à jour également les tâches du jour
          await sauvegarderProgression();
          afficherNotification('Tâche supprimée avec succès', 'info');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error);
      afficherNotification('Une erreur est survenue lors de la suppression de la tâche', 'error');
    }
  };

  /**
   * Marque une tâche comme favorite
   * @param {string} tacheId - L'identifiant de la tâche
   */
  const marquerCommeFavorite = async (tacheId) => {
    try {
      // Mettre à jour l'état local
      setTaches(prevTaches => prevTaches.map(t => {
        if (t.id === tacheId) {
          return { ...t, favoris: !t.favoris };
        }
        return t;
      }));
      
      // Si l'utilisateur est connecté, mettre à jour dans Supabase
      if (user) {
        const tache = taches.find(t => t.id === tacheId);
        
        if (tache) {
          const { error } = await supabase
            .from('taches_personnalisees')
            .update({ favoris: !tache.favoris })
            .match({ user_id: user.id, 'tache.id': tacheId });
            
          if (error) {
            console.error('Erreur lors de la mise à jour du statut favori:', error);
            afficherNotification('Erreur lors de la mise à jour', 'error');
          } else {
            // Mettre à jour également les tâches du jour
            await sauvegarderProgression();
            afficherNotification(
              tache.favoris ? 'Tâche retirée des favoris' : 'Tâche ajoutée aux favoris', 
              'info'
            );
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la gestion des favoris:', error);
      afficherNotification('Une erreur est survenue', 'error');
    }
  };

  // ===== FONCTIONS DE VALIDATION ET DE JOURNALISATION =====
  
  /**
   * Valide la journée et enregistre les résultats dans l'historique
   */
  const validerJournee = async () => {
    try {
      // Vérifier s'il y a au moins une tâche complétée
      const tachesTerminees = taches.filter(t => t.completed);
      
      if (tachesTerminees.length === 0) {
        afficherNotification('Veuillez compléter au moins une tâche avant de valider la journée', 'error');
        return;
      }
      
      setLoadingAction(true);
      
      // Calculer le taux de réussite
      const tauxReussite = Math.round((tachesTerminees.length / taches.length) * 100);
      
      // Calculer la note sur 20
      const note = Math.round((tauxReussite / 100) * 20);
      
      // Calculer les statistiques par catégorie
      const detailsParCategorie = {};
      const categories = Object.keys(CATEGORIES).filter(cat => cat !== "TOUS");
      
      categories.forEach(categorie => {
        const tachesCategorie = taches.filter(t => t.categorie === categorie);
        const tachesCompleteesCategorie = tachesCategorie.filter(t => t.completed);
        
        if (tachesCategorie.length > 0) {
          // Obtenir l'heure de complétion de chaque tâche
          const tachesAvecHeure = tachesCompleteesCategorie.map(t => {
            const heureCompletion = t.derniere_realisation ? new Date(t.derniere_realisation).getHours() : null;
            return {
              ...t,
              heure_completion: heureCompletion
            };
          });
          
          // Compter les tâches complétées avant 8h (matinales) et après 22h (nocturnes)
          const tachesMatinales = tachesAvecHeure.filter(t => t.heure_completion !== null && t.heure_completion < 8).length;
          const tachesNocturnes = tachesAvecHeure.filter(t => t.heure_completion !== null && t.heure_completion >= 22).length;
          
          // Calculer les points gagnés pour cette catégorie
          const pointsCategorie = tachesCompleteesCategorie.reduce((total, t) => total + (t.points || t.coef * 10), 0);
          
          detailsParCategorie[categorie] = {
            total: tachesCategorie.length,
            complete: tachesCompleteesCategorie.length,
            taux: Math.round((tachesCompleteesCategorie.length / tachesCategorie.length) * 100),
            points: pointsCategorie,
            taches_matinales: tachesMatinales,
            taches_nocturnes: tachesNocturnes
          };
        }
      });
      
      // Détails des bonus actifs pendant la journée
      const detailsBonus = {};
      
      if (bonusActif) {
        detailsBonus[bonusActif.nom.toLowerCase().replace(/\s+/g, '_')] = {
          multiplicateur: bonusActif.multiplicateur,
          taches_completees: tachesTerminees.filter(t => 
            t.derniere_realisation && 
            new Date(t.derniere_realisation).getHours() >= bonusActif.debut && 
            new Date(t.derniere_realisation).getHours() < bonusActif.fin
          ).length
        };
      }
      
      // Mettre à jour le streak
      let nouveauStreak = streak;
      const dateDernierJour = historique.length > 0 ? new Date(historique[0].date) : null;
      const aujourdhui = startOfDay(new Date());
      
      // Vérifier si la dernière entrée était hier
      if (!dateDernierJour) {
        // Premier jour d'utilisation
        nouveauStreak = 1;
      } else {
        const dernierJourFormate = startOfDay(new Date(dateDernierJour));
        const hier = addDays(aujourdhui, -1);
        
        if (isSameDay(dernierJourFormate, aujourdhui)) {
          // La journée a déjà été validée aujourd'hui, donc ne pas changer le streak
          afficherNotification('La journée a déjà été validée aujourd\'hui', 'error');
          setLoadingAction(false);
          return;
        } else if (isSameDay(dernierJourFormate, hier)) {
          // La dernière entrée était hier, donc on continue le streak
          nouveauStreak += 1;
        } else {
          // La dernière entrée n'était pas hier, donc on réinitialise le streak
          nouveauStreak = 1;
          
          // Notifications spéciales si le streak précédent était important
          if (streak >= 7) {
            afficherNotification(`Oh non ! Ton streak de ${streak} jours est interrompu. Mais c'est l'occasion de recommencer encore plus fort !`, 'info');
          }
        }
      }
      
      // Enregistrer dans la base de données
      const journeeData = {
        user_id: user.id,
        date: new Date().toISOString(),
        taches_terminees: tachesTerminees.length,
        total_taches: taches.length,
        taux_reussite: tauxReussite,
        note: note,
        points: pointsJour,
        streak: nouveauStreak,
        details_taches: detailsParCategorie,
        details_bonus: detailsBonus,
        reflexions: '', // Sera rempli plus tard si l'utilisateur ajoute des réflexions
        humeur: 'neutre' // Valeur par défaut
      };
      
      // Insérer dans Supabase
      const { data, error } = await supabase
        .from('historique')
        .insert([journeeData]);
      
      if (error) {
        throw new Error(`Erreur lors de la validation de la journée: ${error.message}`);
      }
      
      // Vérifier si un badge de streak est débloqué
      RECOMPENSES_FIDELITE.forEach(async (recompense) => {
        if (nouveauStreak === recompense.jours) {
          // Ajouter des points bonus pour le streak
          ajouterPoints(recompense.points, `Streak de ${recompense.jours} jours`);
          
          // Ajouter un achievement
          await ajouterAchievement({
            type: 'STREAK',
            titre: recompense.nom,
            description: recompense.description,
            icone: recompense.icone,
            date: new Date().toISOString(),
            details: { jours: recompense.jours }
          });
        }
      });
      
      // Réinitialiser pour la prochaine journée
      setStreak(nouveauStreak);
      setPointsJour(0);
      setCombo(0);
      
      // Effets visuels pour une bonne performance
      if (tauxReussite >= 80) {
        setShowConfetti(true);
        setAnimationSuccess(true);
        setTimeout(() => setAnimationSuccess(false), 2000);
      }
      
      // Réinitialiser les tâches pour le lendemain (optionnel, selon l'expérience utilisateur souhaitée)
      const confirmation = window.confirm('Journée validée avec succès ! Voulez-vous réinitialiser les tâches pour demain ?');
      
      if (confirmation) {
        genererDefisQuotidiens();
      } else {
        // Conserver les tâches mais réinitialiser leur état
        setTaches(prevTaches => prevTaches.map(t => ({
          ...t,
          etat: "",
          completed: false
        })));
      }
      
      // Notification
      afficherNotification(`Journée validée ! Note: ${note}/20`, 'success');
      
      // Recharger l'historique
      await chargerHistorique(user.id);
      
      // Demander une réflexion sur la journée (pour les niveaux 3+)
      if (niveau >= 3) {
        setTimeout(() => {
          const ajouterReflexion = window.confirm('Souhaitez-vous ajouter une réflexion sur votre journée ? C\'est un excellent moyen de progresser !');
          
          if (ajouterReflexion) {
            // Ouvrir un modal ou rediriger vers une page de réflexion
            setJourneeSelectionnee(journeeData);
            setAfficherDetailsJournee(true);
          }
        }, 1500);
      }
      
    } catch (error) {
      console.error('Erreur lors de la validation de la journée:', error);
      afficherNotification('Erreur lors de la validation de la journée: ' + error.message, 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  /**
   * Ajoute une réflexion à une journée déjà validée
   * @param {string} journeeId - L'identifiant de la journée
   * @param {string} reflexion - Le texte de la réflexion
   * @param {string} humeur - L'humeur associée à la journée
   */
  const ajouterReflexion = async (journeeId, reflexion, humeur = 'neutre') => {
    try {
      if (!user || !journeeId) return;
      
      setLoadingAction(true);
      
      // Mettre à jour l'entrée d'historique avec la réflexion
      const { data, error } = await supabase
        .from('historique')
        .update({
          reflexions: reflexion,
          humeur: humeur
        })
        .match({ id: journeeId, user_id: user.id });
      
      if (error) {
        throw new Error(`Erreur lors de l'ajout de la réflexion: ${error.message}`);
      }
      
      // Recharger l'historique
      await chargerHistorique(user.id);
      
      // Fermer le modal de détails
      setAfficherDetailsJournee(false);
      
      // Notification
      afficherNotification('Réflexion ajoutée avec succès', 'success');
      
      // Bonus de points pour la réflexion
      ajouterPoints(15, 'Réflexion journalière');
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la réflexion:', error);
      afficherNotification('Erreur lors de l\'ajout de la réflexion', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  // ===== FONCTIONS D'INTERFACE UTILISATEUR =====
  
  /**
   * Change la catégorie active dans l'interface
   * @param {string} categorie - La nouvelle catégorie à afficher
   */
  const changerCategorie = (categorie) => {
    setCategorieActive(categorie);
    
    // Enregistrer la préférence si l'utilisateur est connecté
    if (user) {
      try {
        supabase
          .from('preferences_utilisateurs')
          .upsert({
            user_id: user.id,
            categories_favorites: [categorie, ...Object.keys(CATEGORIES).filter(c => c !== categorie && c !== "TOUS")]
          })
          .then(({ error }) => {
            if (error) {
              console.error('Erreur lors de la sauvegarde de la préférence de catégorie:', error);
            }
          });
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de la préférence:', error);
      }
    }
  };

  /**
   * Bascule entre le mode jour et le mode nuit
   */
  const basculerModeNuit = () => {
    const nouveauMode = !modeNuit;
    setModeNuit(nouveauMode);
    
    // Enregistrer la préférence si l'utilisateur est connecté
    if (user) {
      try {
        supabase
          .from('preferences_utilisateurs')
          .upsert({
            user_id: user.id,
            mode_nuit: nouveauMode
          })
          .then(({ error }) => {
            if (error) {
              console.error('Erreur lors de la sauvegarde de la préférence de mode:', error);
            }
          });
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de la préférence:', error);
      }
    }
  };

  /**
   * Affiche les détails d'une journée spécifique
   * @param {Object} journee - Les données de la journée à afficher
   */
  const afficherDetailsJour = (journee) => {
    setJourneeSelectionnee(journee);
    setAfficherDetailsJournee(true);
  };

  /**
   * Change le mode d'affichage de l'historique (liste ou calendrier)
   * @param {string} mode - Le nouveau mode d'affichage
   */
  const changerVueHistorique = (mode) => {
    setVueHistorique(mode);
  };

  /**
   * Génère une analyse personnalisée des données de l'utilisateur
   */
  const genererAnalysePersonnalisee = () => {
    // Fonction factice, à remplacer par une véritable analyse
    toast.info("Génération de l'analyse en cours...");
    
    setTimeout(() => {
      toast.success("Analyse terminée !");
      
      // Afficher une notification avec des recommandations
      afficherNotification("Notre analyse montre que tu es plus productif le matin. Essaie de planifier tes tâches importantes avant 11h !", 'info');
    }, 2000);
  };

  /**
   * Déconnecte l'utilisateur de l'application
   */
  const deconnecter = async () => {
    try {
      // Sauvegarder les dernières données avant déconnexion
      await sauvegarderProgression();
      
      // Déconnexion Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Redirection vers la page de connexion
      router.push('/connexion');
      
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      afficherNotification('Erreur lors de la déconnexion', 'error');
    }
  };

  // ===== RENDU CONDITIONNEL =====
  
  /**
   * Affiche une animation de chargement pendant l'initialisation
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center">
        <Lottie
          loop
          animationData={loadingAnimation}
          play
          style={{ width: 150, height: 150 }}
        />
        <div className="text-white text-xl mt-4 font-medium">
          Préparation de votre voyage...
        </div>
        <div className="text-white/70 text-sm mt-2 max-w-xs text-center">
          NourRise charge vos données et prépare votre expérience personnalisée
        </div>
      </div>
    );
  }

  // ===== RENDU PRINCIPAL =====
  
  return (
    <>
      <Head>
        <title>NourRise - Votre Voyage vers l'Excellence</title>
        <meta name="description" content="Développez vos habitudes positives et suivez votre progression avec NourRise" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style jsx global>{`
          :root {
            --primary-gradient: linear-gradient(135deg, #6366f1, #a855f7, #ec4899);
            --card-bg: rgba(255, 255, 255, 0.1);
            --card-border: rgba(255, 255, 255, 0.2);
            --card-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            --text-primary: #ffffff;
            --text-secondary: rgba(255, 255, 255, 0.7);
          }
          
          * {
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
          }
          
          html, body {
            padding: 0;
            margin: 0;
            font-family: 'Poppins', -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
              Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
            overscroll-behavior: none;
          }
          
          body {
            color: var(--text-primary);
          }
          
          .glassmorphism {
            background: var(--card-bg);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid var(--card-border);
            box-shadow: var(--card-shadow);
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
          
          .animate-slide-in-right {
            animation: slideInRight 0.5s ease forwards;
          }
          
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          
          .hover\\:scale-102:hover {
            transform: scale(1.02);
          }
          
          .dark {
            color-scheme: dark;
            --card-bg: rgba(18, 18, 18, 0.7);
            --card-border: rgba(255, 255, 255, 0.05);
            --primary-gradient: linear-gradient(135deg, #3730a3, #5b21b6, #831843);
          }
          
          .achievement-toast {
            background: linear-gradient(135deg, #fbbf24, #d97706);
            color: #ffffff;
            font-weight: 600;
          }
          
          /* Animations pour les badges et réalisations */
          .badge-unlock {
            animation: badgeUnlock 1s ease-out forwards;
          }
          
          @keyframes badgeUnlock {
            0% { transform: scale(0.5); opacity: 0; filter: brightness(0.5); }
            60% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(1); filter: brightness(1); }
          }
          
          /* Animation de pulsation */
          .pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          
          /* Animation pour les nouveaux éléments */
          .new-item {
            position: relative;
          }
          
          .new-item::after {
            content: 'Nouveau';
            position: absolute;
            top: -8px;
            right: -8px;
            background: #FF4D4F;
            color: white;
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 10px;
            animation: bounce 1s ease infinite;
          }
          
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          
          /* Personnalisation des barres de défilement */
          * {
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
          }
          
          *::-webkit-scrollbar {
            width: 8px;
          }
          
          *::-webkit-scrollbar-track {
            background: transparent;
          }
          
          *::-webkit-scrollbar-thumb {
            background-color: rgba(255, 255, 255, 0.3);
            border-radius: 10px;
            border: transparent;
          }
        `}</style>
      </Head>

      <div 
        ref={confettiRef}
        className={`min-h-screen ${modeNuit ? 'dark' : ''} bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 transition-colors duration-300`}
      >
        {/* Barre de progression niveau */}
        <div className="fixed top-0 left-0 w-full h-1.5 bg-gray-200/30 z-10">
          <div 
            ref={progressBarRef}
            className={`h-full bg-gradient-to-r ${NIVEAUX[niveau-1].couleur} transition-all duration-1000`}
            style={{ 
              width: `${((points - NIVEAUX[niveau-1].requis) / 
                (NIVEAUX[Math.min(niveau, NIVEAUX.length-1)].requis - NIVEAUX[niveau-1].requis)) * 100}%` 
            }}
          />
        </div>

        {/* Header avec niveau et points */}
        <header className="p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div 
                className={`p-3 rounded-full bg-gradient-to-r ${NIVEAUX[niveau-1].couleur} floating shadow-lg`}
                data-tooltip-id="niveau-tooltip"
                data-tooltip-content={`${NIVEAUX[niveau-1].nom} - ${NIVEAUX[niveau-1].motivation}`}
              >
                <span className="text-2xl">{NIVEAUX[niveau-1].icone}</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Niveau {niveau}</h1>
                <p className="text-white/80">{NIVEAUX[niveau-1].nom}</p>
              </div>
              <Tooltip id="niveau-tooltip" place="bottom" />
            </div>
            
            <div className="flex items-center space-x-6">
              <div 
                className="text-center cursor-pointer"
                data-tooltip-id="streak-tooltip"
                data-tooltip-content={`${streak} jours consécutifs d'activité`}
              >
                <div className="text-3xl font-bold floating">🔥</div>
                <div className="text-sm">{streak} jours</div>
                <Tooltip id="streak-tooltip" place="bottom" />
              </div>
              <div 
                className="text-center cursor-pointer"
                data-tooltip-id="points-tooltip"
                data-tooltip-content={`Points totaux: ${points}`}
              >
                <div className="text-3xl font-bold">{points}</div>
                <div className="text-sm">points</div>
                <Tooltip id="points-tooltip" place="bottom" />
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={basculerModeNuit} 
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-all shadow-md"
                  data-tooltip-id="theme-tooltip"
                  data-tooltip-content={modeNuit ? 'Mode jour' : 'Mode nuit'}
                >
                  {modeNuit ? <FiSun className="text-lg" /> : <FiMoon className="text-lg" />}
                </button>
                <button 
                  onClick={() => setModeProfil(!modeProfil)} 
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-all shadow-md"
                  data-tooltip-id="profile-tooltip"
                  data-tooltip-content="Profil"
                >
                  <FiUser className="text-lg" />
                </button>
                <Tooltip id="theme-tooltip" place="bottom" />
                <Tooltip id="profile-tooltip" place="bottom" />
              </div>
            </div>
          </div>
        </header>

        {/* Bonus actif */}
        <AnimatePresence>
          {bonusActif && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto max-w-4xl my-2 p-3 glassmorphism rounded-lg text-white text-center"
            >
              <p className="flex items-center justify-center gap-2 text-lg font-bold">
                <FiZap className="text-yellow-400 text-xl animate-pulse" />
                {bonusActif.nom} activé ! (×{bonusActif.multiplicateur})
              </p>
              <p className="text-sm mt-1 text-white/80">{bonusActif.description}</p>
            </motion.div>
          )}
        </AnimatePresence>

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
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FiCheckCircle /> Tâches du jour
                </h2>
                <div className="flex space-x-2">
                  {Object.entries(CATEGORIES).map(([key, cat]) => (
                    <button
                      key={key}
                      onClick={() => changerCategorie(key)}
                      className={`px-3 py-1 rounded-full transition-all ${
                        categorieActive === key ? cat.couleur : 'bg-white/10 text-white'
                      } shadow-sm hover:shadow-md`}
                      title={cat.nom}
                      data-tooltip-id={`cat-tooltip-${key}`}
                      data-tooltip-content={`${cat.nom}: ${cat.description}`}
                    >
                      {cat.icone}
                      <Tooltip id={`cat-tooltip-${key}`} place="top" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Recherche et filtre */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher une tâche..."
                    value={filtreRecherche}
                    onChange={(e) => setFiltreRecherche(e.target.value)}
                    className="w-full p-3 pl-10 rounded-lg bg-white/10 text-white border border-white/20 focus:border-white/40 focus:outline-none transition-colors"
                  />
                  <FiSearch className="absolute left-3 top-3.5 text-white/60" />
                  {filtreRecherche && (
                    <button
                      onClick={() => setFiltreRecherche("")}
                      className="absolute right-3 top-3.5 text-white/60 hover:text-white"
                    >
                      <FiX />
                    </button>
                  )}
                </div>
              </div>

              {/* Liste des tâches */}
              <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
                {tachesFiltrees.length > 0 ? (
                  tachesFiltrees.map((tache, index) => (
                    <motion.div
                      key={tache.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`glassmorphism p-4 rounded-lg flex items-center justify-between group hover:scale-102 transition-all ${
                        tache.completed ? 'border-l-4 border-green-500 bg-white/5' : 'border-l-4 border-transparent'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-xl mt-1">
                          {CATEGORIES[tache.categorie].icone}
                        </span>
                        <div>
                          <span className="text-white font-medium">{tache.nom}</span>
                          {tache.description && (
                            <p className="text-white/60 text-sm mt-1">{tache.description}</p>
                          )}
                          {tache.tempsEstime && (
                            <div className="flex items-center mt-1 text-xs text-white/50">
                              <FiClock className="mr-1" /> {tache.tempsEstime}
                            </div>
                          )}
                          {tache.streak > 1 && (
                            <div className="inline-flex items-center mt-2 text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full">
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
                          onChange={(e) => mettreAJourEtatTache(
                            taches.findIndex(t => t.id === tache.id || t === tache),
                            e.target.value
                          )}
                          className={`bg-white/10 text-white border-0 rounded-lg p-2 ${
                            tache.completed ? 'bg-green-500/20' : ''
                          }`}
                        >
                          <option value="">À faire</option>
                          <option value="Terminé">Terminé</option>
                          <option value="En cours">En cours</option>
                          <option value="Non fait">Non fait</option>
                        </select>

                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => supprimerTache(tache.id)}
                            className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/40 text-white transition-colors"
                            data-tooltip-id="delete-tooltip"
                            data-tooltip-content="Supprimer cette tâche"
                          >
                            <FiX />
                          </button>
                          <Tooltip id="delete-tooltip" place="top" />
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center text-white/60 py-8 glassmorphism rounded-lg">
                    {filtreRecherche ? (
                      <>
                        <FiSearch className="text-4xl mx-auto mb-2 opacity-50" />
                        <p>Aucune tâche ne correspond à votre recherche</p>
                        <button
                          onClick={() => setFiltreRecherche("")}
                          className="mt-2 text-indigo-300 hover:text-indigo-200 transition-colors"
                        >
                          Effacer la recherche
                        </button>
                      </>
                    ) : (
                      <>
                        <FiAlertCircle className="text-4xl mx-auto mb-2 opacity-50" />
                        <p>Aucune tâche dans cette catégorie</p>
                        <button
                          onClick={() => setCategorieActive("TOUS")}
                          className="mt-2 text-indigo-300 hover:text-indigo-200 transition-colors"
                        >
                          Voir toutes les catégories
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Défis du jour (si niveau 2+) */}
              {niveau >= 2 && defisJour.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <FiAward /> Défis du jour
                  </h3>
                  <div className="space-y-3">
                    {defisJour.map((defi, index) => (
                      <div 
                        key={defi.id || index}
                        className={`glassmorphism p-3 rounded-lg flex items-center justify-between ${
                          defi.complete ? 'border-l-4 border-yellow-500 bg-yellow-500/10' : 'border-l-4 border-transparent'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{defi.icone}</span>
                          <div>
                            <div className="text-white font-medium">{defi.titre}</div>
                            <div className="text-white/60 text-sm">{defi.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-yellow-400 font-medium">+{defi.recompense}</div>
                          {defi.complete ? (
                            <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                              Complété
                            </div>
                          ) : (
                            <div className="bg-white/10 text-white text-xs px-2 py-1 rounded-full">
                              En cours
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Boutons d'action */}
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setShowModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg flex items-center space-x-2"
                >
                  <FiPlus /> <span>Ajouter une tâche</span>
                </button>
                <button
                  onClick={validerJournee}
                  disabled={loadingAction}
                  className={`px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg flex items-center space-x-2 ${
                    loadingAction ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loadingAction ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
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
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FiTrendingUp /> Progression
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-white/80 mb-1">
                      <span>Niveau {niveau}</span>
                      <span>{points} / {niveau < NIVEAUX.length ? NIVEAUX[niveau].requis : "Max"}</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${NIVEAUX[niveau-1].couleur}`}
                        style={{
                          width: niveau < NIVEAUX.length ? 
                            `${((points - NIVEAUX[niveau-1].requis) / 
                              (NIVEAUX[niveau].requis - NIVEAUX[niveau-1].requis)) * 100}%` : "100%"
                        }}
                      />
                    </div>
                    <p className={`text-sm mt-2 font-medium ${NIVEAUX[niveau-1].couleurTexte}`}>
                      {NIVEAUX[niveau-1].motivation}
                    </p>
                    <p className="text-white/80 text-sm mt-2">
                      <span className="text-yellow-400 font-bold">Bonus:</span> {NIVEAUX[niveau-1].bonus}
                    </p>
                    
                    {/* Liste des avantages du niveau */}
                    <div className="mt-3">
                      <h4 className="text-sm font-semibold text-white/90 mb-1">Avantages de ce niveau:</h4>
                      <ul className="text-xs text-white/70 space-y-1 ml-4 list-disc">
                        {NIVEAUX[niveau-1].avantages.map((avantage, idx) => (
                          <li key={idx}>{avantage}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Résumé du jour */}
              <div className="glassmorphism rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FiCalendar /> Aujourd'hui
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
                
                {/* Combo actuel */}
                {combo > 0 && (
                  <div className="mt-4 bg-gradient-to-r from-orange-400 to-red-500 p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-white flex items-center justify-center">
                      <FiFire className="mr-2" /> Combo: {combo}
                    </div>
                    {combo >= 3 && (
                      <div className="text-xs text-white/90 mt-1">
                        Continue pour obtenir un bonus au prochain multiple de 3!
                      </div>
                    )}
                  </div>
                )}
                
                {/* Records personnels */}
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-white/90 mb-2">Records personnels:</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 p-2 rounded-lg text-center">
                      <div className="text-lg
