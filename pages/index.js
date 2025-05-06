import { useState, useEffect } from "react";
import { format, isSameDay, addDays, isAfter, isBefore, startOfDay } from "date-fns";
import AnalyseIA from "../composants/AnalyseIA";
import GraphiqueEvolution from "../composants/GraphiqueEvolution";
import GraphiqueNote from "../composants/GraphiqueNote";
import { supabase } from "../supabaseClient";
import { useRouter } from "next/router";
import Head from "next/head";
import { FiAward, FiTrendingUp, FiZap, FiCheck, FiClock, FiX, FiFire, FiStar, FiHeart, FiAperture } from "react-icons/fi";
import confetti from 'canvas-confetti';

// Systèmes psychologiques avancés
const RECOMPENSES_VARIABLES = {
  BONUS_SURPRISE: [10, 20, 50, 100],
  MULTIPLICATEURS: [1.5, 2, 3],
  COMBO_REQUIS: [3, 5, 7, 10],
  POWER_HOURS: {
    MATIN: { debut: 5, fin: 8, multiplicateur: 2, nom: "Bonus Fajr" },
    SOIREE: { debut: 21, fin: 23, multiplicateur: 1.5, nom: "Bonus Réflexion" }
  }
};

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
  // ... Ajoutez toutes les autres tâches avec leurs détails

].map(t => ({ 
  ...t, 
  etat: "", 
  completed: false,
  derniere_realisation: null,
  streak: 0,
  meilleur_streak: 0
}));

export default function Home() {
  // États de base
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [taches, setTaches] = useState([]);
  const [historique, setHistorique] = useState([]);
  const router = useRouter();

  // États améliorés
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

  // Fonctions utilitaires et effets
  useEffect(() => {
    const verifierSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/connexion");
      } else {
        setUser(session.user);
        await initialiserJournee(session.user.id);
      }
      setLoading(false);
    };
    verifierSession();
  }, []);

  const initialiserJournee = async (userId) => {
    await chargerHistorique(userId);
    genererDefisQuotidiens();
    selectionnerCitationDuJour();
    verifierHeureBonus();
    chargerAchievements();
  };

  const selectionnerCitationDuJour = () => {
    const indexAleatoire = Math.floor(Math.random() * CITATIONS.length);
    setCitationDuJour(CITATIONS[indexAleatoire]);
  };

  const verifierHeureBonus = () => {
    const maintenant = new Date();
    const heure = maintenant.getHours();

    Object.entries(RECOMPENSES_VARIABLES.POWER_HOURS).forEach(([periode, config]) => {
      if (heure >= config.debut && heure < config.fin) {
        setBonusActif({
          type: periode,
          multiplicateur: config.multiplicateur,
          nom: config.nom
        });
        afficherNotification(`⚡ ${config.nom} activé ! (x${config.multiplicateur} points)`, 'bonus');
      }
    });
  };

  // Gestion des points et niveaux
  const ajouterPoints = (pointsGagnes, source = '') => {
    let pointsFinaux = pointsGagnes;

    // Application des bonus
    if (bonusActif) {
      pointsFinaux *= bonusActif.multiplicateur;
    }

    // Bonus de combo
    if (combo >= 3) {
      const multiplicateurCombo = Math.floor(combo / 3) * 0.5 + 1;
      pointsFinaux *= multiplicateurCombo;
    }

    setPoints(prev => {
      const nouveauTotal = prev + pointsFinaux;
      const niveauActuel = NIVEAUX.findIndex(n => nouveauTotal < n.requis) || NIVEAUX.length;
      
      if (niveauActuel > niveau) {
        levelUp(niveauActuel);
      }
      
      return nouveauTotal;
    });

    setPointsJour(prev => prev + pointsFinaux);
    
    // Affichage des points gagnés
    afficherNotification(`+${Math.round(pointsFinaux)} points ${source}`, 'points');
  };

  const levelUp = (nouveauNiveau) => {
    setNiveau(nouveauNiveau);
    setShowConfetti(true);
    
    const niveauInfo = NIVEAUX[nouveauNiveau - 1];
    afficherNotification(
      `🎉 Niveau ${nouveauNiveau} atteint !\n${niveauInfo.motivation}\n${niveauInfo.bonus}`, 
      'achievement'
    );
    
    // Animation de confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FF4500']
    });
  };

  // JSX principal
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">
          Chargement de votre voyage...
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>NourRise - Votre Voyage vers l'Excellence</title>
        {/* ... styles existants ... */}
      </Head>

      <div className={`min-h-screen ${modeNuit ? 'dark' : ''} bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500`}>
        {/* ... reste du JSX ... */}
      </div>
    </>
  );
}