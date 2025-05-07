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
  // États de base - Restent les mêmes (lignes 134-156)
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [taches, setTaches] = useState([]);
  const [historique, setHistorique] = useState([]);
  const router = useRouter();

  // États améliorés - Restent les mêmes
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
      try {
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
  }, []);

  const chargerHistorique = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('historique')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      setHistorique(data || []);
      
      // Mise à jour du streak si on a des données
      if (data && data.length > 0) {
        setStreak(data[0].streak || 0);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
      setHistorique([]);
    }
  };

  const chargerAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user?.id);
      
      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des achievements:', error);
      setAchievements([]);
    }
  };

  const genererDefisQuotidiens = () => {
    setTaches(tachesJournalieresInitiales);
  };

  const afficherNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const initialiserJournee = async (userId) => {
    try {
      setLoading(true);
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

  // Les autres fonctions restent les mêmes
  const selectionnerCitationDuJour = () => {
    // ... code existant ...
  };

  const verifierHeureBonus = () => {
    // ... code existant ...
  };

  const ajouterPoints = (pointsGagnes, source = '') => {
    // ... code existant ...
  };

  const levelUp = (nouveauNiveau) => {
    // ... code existant ...
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
{/* Barre de progression niveau */}
<div className="fixed top-0 left-0 w-full h-1 bg-gray-200">
  <div 
    className={`h-full bg-gradient-to-r ${NIVEAUX[niveau-1].couleur}`}
    style={{ 
      width: `${((points - NIVEAUX[niveau-1].requis) / 
        (NIVEAUX[niveau].requis - NIVEAUX[niveau-1].requis)) * 100}%` 
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
    </div>
  </div>
</header>

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
        <h2 className="text-2xl font-bold text-white">Tâches du jour</h2>
        <div className="flex space-x-2">
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setCategorieActive(key)}
              className={`px-3 py-1 rounded-full transition ${
                categorieActive === key ? cat.couleur : 'bg-white/10 text-white'
              }`}
            >
              {cat.icone}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des tâches */}
      <div className="space-y-4">
        {taches
          .filter(t => categorieActive === "TOUS" || t.categorie === categorieActive)
          .map((tache, index) => (
            <div
              key={index}
              className="glassmorphism p-4 rounded-lg flex items-center justify-between group hover:scale-102 transition"
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">
                  {CATEGORIES[tache.categorie].icone}
                </span>
                <span className="text-white">{tache.nom}</span>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  {[...Array(tache.coef)].map((_, i) => (
                    <span key={i} className="text-yellow-400">⭐</span>
                  ))}
                </div>
                <select
                  value={tache.etat || ""}
                  onChange={(e) => {
                    const nouvelEtat = e.target.value;
                    const ancienEtat = taches[index].etat;
                    
                    const updated = [...taches];
                    updated[index].etat = nouvelEtat;
                    updated[index].completed = nouvelEtat === "Terminé";
                    setTaches(updated);

                    if (nouvelEtat === "Terminé" && ancienEtat !== "Terminé") {
                      ajouterPoints(tache.points || tache.coef * 10);
                      setCombo(prev => prev + 1);
                    }
                  }}
                  className="bg-white/10 text-white border-0 rounded-lg p-2"
                >
                  <option value="">À faire</option>
                  <option value="Terminé">Terminé</option>
                  <option value="En cours">En cours</option>
                  <option value="Non fait">Non fait</option>
                </select>
              </div>
            </div>
          ))}
      </div>

      {/* Pas de tâches */}
      {taches.filter(t => categorieActive === "TOUS" || t.categorie === categorieActive).length === 0 && (
        <div className="text-center text-white/60 py-8">
          Aucune tâche dans cette catégorie
        </div>
      )}

      {/* Boutons d'action */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => {/* Logique pour ajouter une tâche */}}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
        >
          Ajouter une tâche
        </button>
        <button
          onClick={() => {/* Logique pour valider la journée */}}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
        >
          Valider la journée
        </button>
      </div>
    </div>

    {/* Statistiques et graphiques */}
    <div className="space-y-6">
      {/* Carte de progression */}
      <div className="glassmorphism rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Progression</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-white/80 mb-1">
              <span>Niveau {niveau}</span>
              <span>{points} / {NIVEAUX[niveau].requis}</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${NIVEAUX[niveau-1].couleur}`}
                style={{
                  width: `${((points - NIVEAUX[niveau-1].requis) / 
                    (NIVEAUX[niveau].requis - NIVEAUX[niveau-1].requis)) * 100}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      {historique.length > 0 && (
        <div className="glassmorphism rounded-xl p-6">
          <GraphiqueEvolution historique={historique} />
          <GraphiqueNote historique={historique} />
        </div>
      )}
    </div>
  </div>

  {/* Historique */}
  <div className="mt-10 glassmorphism rounded-xl p-6">
    <h2 className="text-2xl font-bold text-white mb-6">📅 Historique</h2>
    <div className="space-y-4">
      {historique.map((jour, index) => (
        <div
          key={index}
          className="flex justify-between items-center bg-white/10 p-4 rounded-lg hover:bg-white/20 transition"
        >
          <div className="text-white">
            <span className="font-medium">
              {format(new Date(jour.date), 'dd/MM/yyyy')}
            </span>
            <span className="mx-4">•</span>
            <span className="text-green-400">{jour.taux_reussite}%</span>
            <span className="mx-4">•</span>
            <span className="text-yellow-400">{jour.note}/20</span>
          </div>
        </div>
      ))}
    </div>
  </div>
</main>

{/* Notifications */}
{notification && (
  <div className="fixed bottom-4 right-4 animate-slide-up">
    <div className={`p-4 rounded-lg shadow-lg ${
      notification.type === 'achievement' ? 'bg-yellow-400' : 'bg-green-400'
    } text-white`}>
      {notification.message}
    </div>
  </div>
)}
      </div>
    </>
  );
}
