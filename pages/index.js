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
