import { useState, useEffect, useRef, useCallback } from "react";
import { format, isSameDay, addDays, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import dynamic from "next/dynamic";
import { supabase } from "../supabaseClient";
import { useRouter } from "next/router";
import Head from "next/head";
import {
  FiAward,
  FiTrendingUp,
  FiZap,
  FiCheck,
  FiClock,
  FiX,
  FiFire,
  FiStar,
  FiHeart,
  FiAperture,
  FiPlus,
  FiCalendar,
  FiCheckCircle,
  FiSettings,
  FiLogOut,
  FiUser,
  FiRefreshCw,
  FiEye,
  FiSearch,
  FiEyeOff,
  FiAlertCircle,
  FiChevronDown,
  FiChevronUp,
  FiShare2,
  FiBookmark,
  FiShield,
  FiTrendingDown,
  FiSave,
  FiActivity,
  FiSun,
  FiMoon,
} from "react-icons/fi";

// Import dynamique des composants lourds pour optimiser le chargement initial
const GraphiqueEvolution = dynamic(
  () => import("../composants/GraphiqueEvolution"),
  { ssr: false }
);
const GraphiqueNote = dynamic(
  () => import("../composants/GraphiqueNote"),
  { ssr: false }
);
const AnalyseIA = dynamic(() => import("../composants/AnalyseIA"), {
  ssr: false,
});

// Importation optimisée de la librairie confetti (côté client uniquement)
const confetti = dynamic(() => import("canvas-confetti"), { ssr: false });

/**
 * @fileoverview Page principale de l'application NourRise
 * Cette application aide les utilisateurs à développer des habitudes positives
 * en utilisant des techniques de gamification et des systèmes de récompense.
 *
 * @author
 * @version 2.0.1
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
    MATIN: {
      debut: 5,
      fin: 8,
      multiplicateur: 2,
      nom: "Bonus Fajr",
      description: "Profite de l'aube pour multiplier tes bienfaits",
    },
    SOIREE: {
      debut: 21,
      fin: 23,
      multiplicateur: 1.5,
      nom: "Bonus Réflexion",
      description: "Le calme du soir pour finir la journée en beauté",
    },
  },
};

/**
 * Système de progression par niveaux avec avantages exclusifs
 * Chaque niveau offre de nouvelles fonctionnalités et récompenses.
 */
const NIVEAUX = [
  {
    niveau: 1,
    nom: "Débutant",
    requis: 0,
    couleur: "from-blue-400 to-blue-600",
    icone: "🌱",
    motivation: "Le début d'un beau voyage...",
    bonus: "Débloquez plus de tâches !",
    medaille: "🥉",
  },
  {
    niveau: 2,
    nom: "Apprenti",
    requis: 100,
    couleur: "from-green-400 to-green-600",
    icone: "🌿",
    motivation: "Tu progresses bien !",
    bonus: "Accès aux défis quotidiens",
    medaille: "🥈",
  },
  {
    niveau: 3,
    nom: "Initié",
    requis: 300,
    couleur: "from-yellow-400 to-yellow-600",
    icone: "⭐",
    motivation: "Ta persévérance paie !",
    bonus: "Multiplicateur de points x1.5",
    medaille: "🥇",
  },
  {
    niveau: 4,
    nom: "Expert",
    requis: 600,
    couleur: "from-purple-400 to-purple-600",
    icone: "💫",
    motivation: "Tu deviens une source d'inspiration !",
    bonus: "Débloquez les achievements spéciaux",
    medaille: "🏆",
  },
  {
    niveau: 5,
    nom: "Maître",
    requis: 1000,
    couleur: "from-red-400 to-red-600",
    icone: "🌟",
    motivation: "Tu es exceptionnel !",
    bonus: "Mode Mentor débloqué",
    medaille: "👑",
  },
  {
    niveau: 6,
    nom: "Légende",
    requis: 2000,
    couleur: "from-pink-400 to-pink-600",
    icone: "🔱",
    motivation: "Tu es une véritable légende !",
    bonus: "Personnalisation complète",
    medaille: "⭐",
  },
];

/**
 * Catégories de tâches avec thématiques visuelles et motivationnelles.
 * Permet une organisation claire et inspirante des activités.
 */
const CATEGORIES = {
  TOUS: {
    nom: "Tous",
    icone: "📋",
    couleur: "bg-gray-100 text-gray-800",
    description: "Toutes les catégories",
  },
  SPIRITUEL: {
    nom: "Spirituel",
    icone: "🕌",
    couleur: "bg-purple-100 text-purple-800",
    description: "Élévation spirituelle",
  },
  SPORT: {
    nom: "Sport",
    icone: "💪",
    couleur: "bg-green-100 text-green-800",
    description: "Santé physique",
  },
  EDUCATION: {
    nom: "Éducation",
    icone: "📚",
    couleur: "bg-blue-100 text-blue-800",
    description: "Développement intellectuel",
  },
  DEVELOPPEMENT: {
    nom: "Développement",
    icone: "🚀",
    couleur: "bg-yellow-100 text-yellow-800",
    description: "Croissance personnelle",
  },
};
/**
 * Citations motivationnelles dynamiques pour l'inspiration quotidienne
 */
const CITATIONS = [
  { texte: "Chaque progrès te rapproche de tes objectifs.", auteur: "NourRise" },
  { texte: "La constance est la clé du succès.", auteur: "NourRise" },
  { texte: "Un pas à la fois, mais toujours en avant.", auteur: "NourRise" },
];

/**
 * Messages personnalisés pour renforcer la motivation.
 */
const SUCCES_MESSAGES = [
  "Excellente réalisation ! 🌟",
  "Continue sur cette lancée ! 🚀",
  "Quelle persévérance ! 💪",
];

export default function Home() {
  // États principaux
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState(0);
  const [niveau, setNiveau] = useState(1);
  const [streak, setStreak] = useState(0);
  const [notification, setNotification] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [taches, setTaches] = useState([]);
  const router = useRouter();

  // Effets pour initialiser l'application
  useEffect(() => {
    const initialize = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data || !data.session) {
          router.push("/connexion");
        } else {
          setUser(data.session.user);
          setTaches([]); // Charger les tâches
        }
      } catch (error) {
        console.error("Erreur d'initialisation :", error);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, [router]);

  // Effet pour lancer les confettis
  useEffect(() => {
    if (showConfetti) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [showConfetti]);

  // Fonction pour valider une journée
  const validerJournee = async () => {
    try {
      const pointsGagnes = Math.floor(Math.random() * 100);
      setPoints((prev) => prev + pointsGagnes);
      setShowConfetti(true);
      afficherNotification(`Bravo ! Vous avez gagné ${pointsGagnes} points.`, "success");
    } catch (error) {
      console.error("Erreur lors de la validation :", error);
      afficherNotification("Erreur lors de la validation.", "error");
    }
  };

  const afficherNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <>
      <Head>
        <title>NourRise - Habitudes Positives</title>
      </Head>
      <main>
        {/* Votre contenu principal ici */}
      </main>
    </>
  );
}
return (
  <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
    <header className="p-6 text-white">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Bienvenue, {user?.email || "Invité"}</h1>
          <p className="text-white/70">Niveau {niveau}</p>
        </div>
        <button
          onClick={() => setShowConfetti(true)}
          className="bg-yellow-400 px-4 py-2 rounded-lg shadow-md hover:bg-yellow-500"
        >
          🎉 Déclencher Confettis
        </button>
      </div>
    </header>

    <main className="p-4">
      {/* Section des statistiques */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Statistiques</h2>
        <div className="flex justify-between mt-4">
          <div className="bg-white/10 p-4 rounded-lg text-center text-white">
            <p className="text-3xl font-bold">{points}</p>
            <p className="text-sm">Points</p>
          </div>
          <div className="bg-white/10 p-4 rounded-lg text-center text-white">
            <p className="text-3xl font-bold">{streak} 🔥</p>
            <p className="text-sm">Jours consécutifs</p>
          </div>
          <div className="bg-white/10 p-4 rounded-lg text-center text-white">
            <p className="text-3xl font-bold">{niveau}</p>
            <p className="text-sm">Niveau</p>
          </div>
        </div>
      </div>

      {/* Section des tâches */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Tâches du jour</h2>
        <div className="space-y-4">
          {taches.length > 0 ? (
            taches.map((tache, index) => (
              <div
                key={index}
                className="p-4 bg-white/10 rounded-lg flex justify-between items-center text-white"
              >
                <div>
                  <h3 className="text-lg font-bold">{tache.nom}</h3>
                  <p className="text-sm">{tache.description}</p>
                </div>
                <button
                  onClick={() => validerJournee()}
                  className="bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  Terminer
                </button>
              </div>
            ))
          ) : (
            <p className="text-white/70">Aucune tâche pour aujourd'hui.</p>
          )}
        </div>
      </div>
    </main>

    {/* Notifications */}
    {notification && (
      <div
        className={`fixed bottom-4 right-4 bg-${
          notification.type === "success"
            ? "green-500"
            : notification.type === "error"
            ? "red-500"
            : "blue-500"
        } text-white p-4 rounded-lg shadow-lg`}
      >
        {notification.message}
      </div>
    )}
  </div>
);
