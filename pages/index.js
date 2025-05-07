import { useState, useEffect, useRef } from "react";
import { format, isSameDay, addDays, isAfter, isBefore, startOfDay } from "date-fns";
import AnalyseIA from "../composants/AnalyseIA";
import GraphiqueEvolution from "../composants/GraphiqueEvolution";
import GraphiqueNote from "../composants/GraphiqueNote";
import { supabase } from "../supabaseClient";
import { useRouter } from "next/router";
import Head from "next/head";
import { FiAward, FiTrendingUp, FiZap, FiCheck, FiClock, FiX, FiFire, FiStar, FiHeart, FiAperture, FiPlus } from "react-icons/fi";
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

  // Effet pour la vérification des heures bonus
  useEffect(() => {
    const interval = setInterval(() => {
      verifierHeureBonus();
    }, 60000); // Vérifier chaque minute
    
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

  const lancerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

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

      // Charger les points
      if (data && data.length > 0) {
        const pointsTotaux = data.reduce((acc, jour) => acc + (jour.points || 0), 0);
        setPoints(pointsTotaux);
        
        // Mettre à jour le niveau
        calculerNiveau(pointsTotaux);
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

  const selectionnerCitationDuJour = () => {
    // Sélectionner une citation aléatoire
    const index = Math.floor(Math.random() * CITATIONS.length);
    setCitationDuJour(CITATIONS[index]);
  };

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

  const ajouterPoints = (pointsGagnes, source = '') => {
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
  };

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

  const ajouterAchievement = async (achievement) => {
    try {
      const { data, error } = await supabase
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

  // Fonction pour ajouter une nouvelle tâche
  const ajouterNouvelleTache = () => {
    if (!nouvelleTache.nom.trim()) {
      afficherNotification('Veuillez entrer un nom pour la tâche', 'error');
      return;
    }

    const tacheAjoutee = {
      ...nouvelleTache,
      etat: "",
      completed: false,
      derniere_realisation: null,
      streak: 0,
      meilleur_streak: 0
    };

    setTaches([...taches, tacheAjoutee]);
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
  };

  // Fonction pour valider la journée
  const validerJournee = async () => {
    try {
      // Calculer le taux de réussite
      const tachesTerminees = taches.filter(t => t.completed).length;
      const tauxReussite = Math.round((tachesTerminees / taches.length) * 100);
      
      // Calculer la note sur 20
      const note = Math.round((tauxReussite / 100) * 20);
      
      // Mettre à jour le streak
      let nouveauStreak = streak;
      const dateDernierJour = historique.length > 0 ? new Date(historique[0].date) : null;
      const aujourdhui = new Date();
      
      if (!dateDernierJour || !isSameDay(addDays(dateDernierJour, 1), aujourdhui)) {
        // Réinitialiser le streak si ce n'est pas un jour consécutif
        nouveauStreak = 1;
      } else {
        nouveauStreak += 1;
      }
      
      // Enregistrer dans la base de données
      const { data, error } = await supabase
        .from('historique')
        .insert([
          {
            user_id: user.id,
            date: new Date().toISOString(),
            taches_terminees: tachesTerminees,
            total_taches: taches.length,
            taux_reussite: tauxReussite,
            note: note,
            points: pointsJour,
            streak: nouveauStreak
          }
        ]);
      
      if (error) throw error;
      
      // Réinitialiser la journée
      setStreak(nouveauStreak);
      setPointsJour(0);
      
      // Lancer confetti si bon résultat
      if (tauxReussite >= 80) {
        setShowConfetti(true);
      }
      
      // Notification
      afficherNotification(`Journée validée ! Note: ${note}/20`, 'success');
      
      // Recharger l'historique
      await chargerHistorique(user.id);
    } catch (error) {
      console.error('Erreur lors de la validation de la journée:', error);
      afficherNotification('Erreur lors de la validation de la journée', 'error');
    }
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
        <meta name="description" content="Développez vos habitudes positives et suivez votre progression" />
        <link rel="icon" href="/favicon.ico" />
        <style jsx global>{`
          .glassmorphism {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
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
                (NIVEAUX[Math.min(niveau, NIVEAUX.length-1)].requis - NIVEAUX[niveau-1].requis)) * 100}%` 
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
                {modeNuit ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </header>

        {/* Bonus actif */}
        {bonusActif && (
          <div className="mx-auto max-w-4xl my-2 p-3 glassmorphism rounded-lg text-white text-center animate-pulse">
            <p className="text-lg font-bold">⚡ {bonusActif.nom} activé ! (×{bonusActif.multiplicateur})</p>
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
                <h2 className="text-2xl font-bold text-white">Tâches du jour</h2>
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
                        <div>
                          <span className="text-white">{tache.nom}</span>
                          {tache.description && (
                            <p className="text-white/60 text-sm">{tache.description}</p>
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
                          onChange={(e) => {
                            const nouvelEtat = e.target.value;
                            const ancienEtat = taches[index].etat;
                            
                            const updated = [...taches];
                            updated[index].etat = nouvelEtat;
                            updated[index].completed = nouvelEtat === "Terminé";
                            setTaches(updated);

                            if (nouvelEtat === "Terminé" && ancienEtat !== "Terminé") {
                              ajouterPoints(tache.points || tache.coef * 10, tache.nom);
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
                  onClick={() => setShowModal(true)}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition flex items-center space-x-2"
                >
                  <FiPlus /> <span>Ajouter une tâche</span>
                </button>
                <button
                  onClick={validerJournee}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition flex items-center space-x-2"
                >
                  <FiCheck /> <span>Valider la journée</span>
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
                <h3 className="text-xl font-bold text-white mb-4">Aujourd'hui</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 p-3 rounded-lg text-center">
                    <div className="text-3xl font-bold text-white">{pointsJour}</div>
                    <div className="text-sm text-white/80">Points gagnés</div>
                  </div>
                  <div className="bg-white/10 p-3 rounded-lg text-center">
                    <div className="text-3xl font-bold text-white">
                      {Math.round((taches.filter(t => t.completed).length / taches.length) * 100)}%
                    </div>
                    <div className="text-sm text-white/80">Complété</div>
                  </div>
                </div>
              </div>

              {/* Graphiques */}
              {historique.length > 0 && (
                <div className="glassmorphism rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Analyse</h3>
                  <GraphiqueEvolution historique={historique} />
                  <div className="mt-4">
                    <GraphiqueNote historique={historique} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Historique */}
          <div className="mt-10 glassmorphism rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">📅 Historique</h2>
            {historique.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
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
                    <div className="flex items-center space-x-2">
                      <span className="text-white">{jour.points} pts</span>
                      {jour.streak > 1 && (
                        <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs">
                          🔥 {jour.streak}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-white/60 py-8">
                Pas encore d'historique - Commencez par valider votre première journée !
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
                    Nom de la tâche
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
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                >
                  Ajouter
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
            } text-white`}>
              {notification.message}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
