import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { supabase } from "../supabaseClient";
import { useRouter } from "next/router";
import Head from "next/head";
import { 
  FiPlus, FiCheck, FiSun, FiMoon, FiTrash2, FiEdit, 
  FiLogOut, FiAward, FiTrendingUp, FiCalendar, FiStar 
} from "react-icons/fi";
import { Transition } from "@headlessui/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Chargement dynamique des composants graphiques pour optimiser le chargement initial
const GraphiqueEvolution = dynamic(() => import("../composants/GraphiqueEvolution"), { 
  ssr: false,
  loading: () => <div className="h-64 bg-white/10 animate-pulse rounded-lg"></div>
});

const GraphiqueNote = dynamic(() => import("../composants/GraphiqueNote"), { 
  ssr: false,
  loading: () => <div className="h-64 bg-white/10 animate-pulse rounded-lg"></div>
});

// Nouveau composant pour afficher la répartition des tâches
const GraphiqueRepartition = dynamic(() => import("../composants/GraphiqueRepartition"), {
  ssr: false,
  loading: () => <div className="h-64 bg-white/10 animate-pulse rounded-lg"></div>
});

// Configuration du système de niveaux avec progression enrichie
const NIVEAUX = [
  { 
    niveau: 1, 
    nom: "Débutant", 
    requis: 0, 
    icone: "🌱", 
    couleur: "from-blue-400 to-blue-600", 
    motivation: "Le début d'un beau voyage vers l'excellence personnelle.",
    debloques: ["Suivi de tâches de base"]
  },
  { 
    niveau: 2, 
    nom: "Apprenti", 
    requis: 100, 
    icone: "🌿", 
    couleur: "from-green-400 to-green-600", 
    motivation: "Tu progresses bien ! La constance est la clé.",
    debloques: ["Personnalisation des tâches", "Graphiques d'évolution"]
  },
  { 
    niveau: 3, 
    nom: "Initié", 
    requis: 300, 
    icone: "⭐", 
    couleur: "from-yellow-400 to-yellow-600", 
    motivation: "Ta persévérance paie ! Continue sur cette lancée.",
    debloques: ["Coefficients pour les tâches", "Analyses hebdomadaires"] 
  },
  { 
    niveau: 4, 
    nom: "Expert", 
    requis: 600, 
    icone: "🔥", 
    couleur: "from-orange-500 to-red-600", 
    motivation: "Tu inspires les autres par ta discipline et ta constance.",
    debloques: ["Suggestions intelligentes", "Badges exclusifs"]
  },
  { 
    niveau: 5, 
    nom: "Maître", 
    requis: 1000, 
    icone: "👑", 
    couleur: "from-purple-500 to-pink-600", 
    motivation: "Ta maîtrise de soi est exemplaire, continue d'élever les standards.",
    debloques: ["Mode mentor", "Statistiques avancées"]
  },
];

// Citations motivantes affichées aléatoirement
const CITATIONS = [
  "La discipline est le pont entre les objectifs et leurs accomplissements.",
  "Peu importe la lenteur à laquelle tu avances, l'important est de ne pas t'arrêter.",
  "Le succès n'est pas définitif, l'échec n'est pas fatal. C'est le courage de continuer qui compte.",
  "Un petit progrès chaque jour mène à des résultats extraordinaires.",
  "La constance est plus importante que l'intensité.",
  "Fais aujourd'hui ce que les autres ne feront pas, pour accomplir demain ce que les autres ne peuvent pas.",
  "Commence là où tu es. Utilise ce que tu as. Fais ce que tu peux.",
  "Les habitudes quotidiennes déterminent ta destinée.",
  "L'autodiscipline est le premier pas vers la liberté véritable.",
  "Ce n'est pas le temps qui compte, c'est ce que tu fais de ce temps."
];

// Badges déblocables pour gamifier l'expérience
const BADGES = [
  { id: "streak7", nom: "Constance", description: "7 jours consécutifs", icone: "🔄", condition: (stats) => stats.streak >= 7 },
  { id: "streak30", nom: "Discipline", description: "30 jours consécutifs", icone: "⚡", condition: (stats) => stats.streak >= 30 },
  { id: "perfection", nom: "Perfection", description: "100% des tâches accomplies", icone: "💯", condition: (stats) => stats.tauxJournee === 100 },
  { id: "niveau3", nom: "Ascension", description: "Atteindre le niveau 3", icone: "🏔️", condition: (stats) => stats.niveau.niveau >= 3 },
  { id: "taches100", nom: "Centenaire", description: "100 tâches accomplies", icone: "🏆", condition: (stats) => stats.tachesTotal >= 100 },
];

/**
 * Détermine le niveau actuel basé sur les points accumulés
 * @param {number} points - Points totaux de l'utilisateur
 * @returns {Object} Niveau actuel avec ses propriétés
 */
const calculerNiveau = (points) => {
  for (let i = NIVEAUX.length - 1; i >= 0; i--) {
    if (points >= NIVEAUX[i].requis) return NIVEAUX[i];
  }
  return NIVEAUX[0];
};

/**
 * Animation de confettis pour célébrer les accomplissements
 * @param {string} type - Type de célébration (standard, épique, etc.)
 */
const lancerConfettis = async (type = "standard") => {
  const confetti = (await import("canvas-confetti")).default;
  
  switch(type) {
    case "épique":
      // Confettis plus intenses pour les réussites majeures
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF4500'],
      });
      break;
    
    case "streak":
      // Animation spéciale pour les séries
      const end = Date.now() + 2000;
      const colors = ['#26ccff', '#a25afd', '#ff5e7e'];
      
      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });
      
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
      break;
      
    default:
      // Configuration standard
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
  }
};

/**
 * Formatage de la date pour affichage convivial
 * @param {string} dateString - Chaîne ISO de date
 * @returns {string} Date formatée
 */
const formatDate = (dateString) => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

/**
 * Génère une couleur de fond aléatoire pour les tâches
 * @returns {string} Classe Tailwind pour background gradient
 */
const getRandomGradient = () => {
  const gradients = [
    "from-blue-400 to-indigo-500",
    "from-green-400 to-emerald-500",
    "from-yellow-400 to-amber-500",
    "from-red-400 to-rose-500",
    "from-purple-400 to-violet-500",
    "from-pink-400 to-fuchsia-500",
  ];
  return gradients[Math.floor(Math.random() * gradients.length)];
};

export default function Home() {
  // États pour gérer les données utilisateur et l'interface
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [niveau, setNiveau] = useState(NIVEAUX[0]);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [taches, setTaches] = useState([]);
  const [modeNuit, setModeNuit] = useState(false);
  const [notification, setNotification] = useState(null);
  const [journal, setJournal] = useState([]);
  const [statistiques, setStatistiques] = useState({
    tauxReussiteMoyen: 0,
    tauxJournee: 0,
    tachesTotal: 0,
    tachesFaites: 0,
    badgesDebloques: [],
  });
  const [nouvellesTaches, setNouvellesTaches] = useState([]);
  const [citationDuJour, setCitationDuJour] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [actionEnCours, setActionEnCours] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ visible: false, message: "", onConfirm: null });
  const [vueActive, setVueActive] = useState("taches"); // taches, statistiques, journal
  
  // Formulaire pour ajouter/éditer des tâches
  const [formTache, setFormTache] = useState({
    nom: "",
    description: "",
    coefficient: 1,
    visible: false,
  });

  /**
   * Initialisation de l'application
   * Vérifie l'authentification et charge les données utilisateur
   */
  useEffect(() => {
    // Fonction d'initialisation asynchrone
    const init = async () => {
      // Vérification du thème sauvegardé
      if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) setModeNuit(savedTheme === 'dark');
      }
      
      // Récupération de la session utilisateur
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!session) return router.push("/connexion");

      setUser(session.user);
      toast.info("Bienvenue sur NourRise!", { position: "top-center" });
      
      // Récupération des données du journal
      await chargerJournal(session.user.id);
      
      // Génération d'une citation aléatoire
      setCitationDuJour(CITATIONS[Math.floor(Math.random() * CITATIONS.length)]);
      
      // Chargement terminé
      setLoading(false);
    };
    
    init();
    
    // Configuration de l'écouteur d'événements Supabase pour les mises à jour en temps réel
    const subscription = supabase
      .channel('public:journal')
      .on('INSERT', payload => {
        if (payload.new && payload.new.user_id === user?.id) {
          chargerJournal(user.id);
        }
      })
      .subscribe();
      
    return () => {
      // Nettoyage de l'abonnement lors du démontage du composant
      supabase.removeChannel(subscription);
    };
  }, [router]);

  /**
   * Chargement des données du journal de l'utilisateur
   * @param {string} userId - ID utilisateur Supabase
   */
  const chargerJournal = async (userId) => {
    try {
      // Récupération des entrées de journal
      const { data: entrees, error: errJours } = await supabase
        .from("journal")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (errJours) throw new Error(errJours.message);

      if (entrees && entrees.length > 0) {
        setJournal(entrees);
        
        // Extraction des données statistiques
        const dernier = entrees[0];
        setPoints(dernier.points || 0);
        setStreak(dernier.streak || 0);
        setNiveau(calculerNiveau(dernier.points || 0));
        
        // Calcul des statistiques globales
        const tachesTotal = entrees.reduce((acc, jour) => acc + (jour.taches?.length || 0), 0);
        const tachesFaites = entrees.reduce((acc, jour) => {
          return acc + (jour.taches?.filter(t => t.fait)?.length || 0);
        }, 0);
        
        const tauxReussiteMoyen = entrees.reduce((acc, jour) => acc + (jour.taux_reussite || 0), 0) / entrees.length;
        
        // Construction des tâches récentes avec les coefficients
        const tachesDernieresFois = dernier.taches || [];
        const tachesAvecCoef = tachesDernieresFois.map(t => ({
          ...t,
          coefficient: t.coefficient || 1
        }));
        
        // Vérification des badges débloqués
        const badgesDebloques = BADGES.filter(badge => 
          badge.condition({ 
            streak, 
            niveau: calculerNiveau(dernier.points || 0),
            tauxJournee: dernier.taux_reussite || 0,
            tachesTotal,
            tachesFaites
          })
        ).map(b => b.id);
        
        // Mise à jour des statistiques
        setStatistiques({
          tauxReussiteMoyen: Math.round(tauxReussiteMoyen),
          tauxJournee: dernier.taux_reussite || 0,
          tachesTotal,
          tachesFaites,
          badgesDebloques
        });
        
        // Si aucune tâche n'est définie, utiliser les dernières connues
        if (taches.length === 0 && tachesAvecCoef.length > 0) {
          // Réinitialiser l'état "fait" pour les nouvelles tâches du jour
          setTaches(tachesAvecCoef.map(t => ({ ...t, fait: false })));
        }
      } else {
        // Initialisation pour un nouvel utilisateur sans historique
        setTaches([
          { nom: "Réveil tôt", description: "Avant 6h", fait: false, coefficient: 1 },
          { nom: "Sport", description: "15 min minimum", fait: false, coefficient: 1 },
          { nom: "Lecture", description: "10 pages", fait: false, coefficient: 1 },
        ]);
      }
    } catch (err) {
      console.error("Erreur lors du chargement du journal:", err);
      toast.error("Impossible de charger vos données");
    }
  };

  /**
   * Sauvegarde du thème dans localStorage
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', modeNuit ? 'dark' : 'light');
    }
  }, [modeNuit]);

  /**
   * Valide la journée et enregistre les données dans Supabase
   */
  const validerJournee = async () => {
    if (actionEnCours) return;
    
    setActionEnCours(true);
    try {
      // Calculs pour l'évaluation de la journée
      const total = taches.reduce((acc, t) => acc + (t.coefficient || 1), 0);
      const accomplies = taches.reduce((acc, t) => acc + (t.fait ? (t.coefficient || 1) : 0), 0);
      
      // Taux de réussite pondéré par les coefficients
      const taux = total > 0 ? Math.round((accomplies / total) * 100) : 0;
      
      // Note de la journée (1-10)
      const note = taux >= 90 ? 10 : 
                  taux >= 80 ? 9 : 
                  taux >= 70 ? 8 : 
                  taux >= 60 ? 7 : 
                  taux >= 50 ? 6 : 
                  taux >= 40 ? 5 : 
                  taux >= 30 ? 4 : 
                  taux >= 20 ? 3 : 
                  taux >= 10 ? 2 : 1;

      // Calcul du nouveau streak
      let nouveauStreak = 1;
      let estNouveauRecord = false;
      
      if (journal.length > 0) {
        const dernierJour = new Date(journal[0].created_at);
        const aujourdHui = new Date();
        
        // Différence en jours
        const diff = Math.floor((aujourdHui - dernierJour) / (1000 * 60 * 60 * 24));
        
        if (diff === 1) {
          // Continuation du streak
          nouveauStreak = (journal[0].streak || 0) + 1;
          if (nouveauStreak > (streak || 0)) {
            estNouveauRecord = true;
          }
        } else if (diff === 0) {
          return toast.info("Tu as déjà validé aujourd'hui !", { position: "top-right" });
        }
      }

      // Calcul des nouveaux points avec bonus potentiels
      let nouveauxPoints = points + (note * 10);
      
      // Bonus pour 100% des tâches
      if (taux === 100) {
        nouveauxPoints += 20;
        toast.success("🎯 Bonus de perfection: +20 points!", { position: "top-right" });
      }
      
      // Bonus pour streak
      if (nouveauStreak >= 7 && nouveauStreak % 7 === 0) {
        const bonusStreak = 50;
        nouveauxPoints += bonusStreak;
        toast.success(`🔥 Bonus de streak (${nouveauStreak} jours): +${bonusStreak} points!`, { position: "top-right" });
      }
      
      const nouveauNiveau = calculerNiveau(nouveauxPoints);
      const progressionNiveau = niveau.niveau !== nouveauNiveau.niveau;
      
      // Enregistrement dans Supabase
      const { error } = await supabase.from("journal").insert([
        {
          user_id: user.id,
          note,
          taux_reussite: taux,
          taches,
          created_at: new Date().toISOString(),
          nom_utilisateur: user.email,
          streak: nouveauStreak,
          points: nouveauxPoints,
        },
      ]);

      if (error) {
        console.error("Erreur Supabase:", error.message || error);
        toast.error("Erreur d'enregistrement dans la base de données");
        return;
      }

      // Mise à jour des états locaux
      setPoints(nouveauxPoints);
      setStreak(nouveauStreak);
      setNiveau(nouveauNiveau);
      
      // Vérification de badges débloqués
      const nouveauxBadges = BADGES.filter(badge => 
        badge.condition({ 
          streak: nouveauStreak, 
          niveau: nouveauNiveau,
          tauxJournee: taux,
          tachesTotal: statistiques.tachesTotal + taches.length,
          tachesFaites: statistiques.tachesFaites + taches.filter(t => t.fait).length
        }) && 
        !statistiques.badgesDebloques.includes(badge.id)
      );
      
      // Notifications de progression
      if (progressionNiveau) {
        toast.success(`🎊 Niveau supérieur atteint: ${nouveauNiveau.nom}!`, {
          position: "top-center",
          autoClose: 5000,
        });
        lancerConfettis("épique");
      } else if (estNouveauRecord && nouveauStreak > 1) {
        toast.success(`🔥 Nouveau record de streak: ${nouveauStreak} jours!`, {
          position: "top-center",
          autoClose: 3000,
        });
        lancerConfettis("streak");
      } else {
        toast.success("Journée validée avec succès !", {
          position: "top-right",
          autoClose: 3000,
        });
        lancerConfettis();
      }
      
      // Affichage des badges débloqués
      nouveauxBadges.forEach(badge => {
        setTimeout(() => {
          toast.info(`🏆 Badge débloqué: ${badge.nom} (${badge.description})`, {
            position: "top-left",
            autoClose: 5000,
          });
        }, 1500);
      });
      
      // Réinitialisation des tâches pour le lendemain
      setTaches(taches.map(t => ({ ...t, fait: false })));
      
      // Rafraîchissement du journal
      chargerJournal(user.id);
      
    } catch (err) {
      console.error("Erreur lors de la validation:", err);
      toast.error("Une erreur inattendue s'est produite");
    } finally {
      setActionEnCours(false);
    }
  };

  /**
   * Changement de statut d'une tâche (faite/non-faite)
   * @param {number} index - Index de la tâche dans le tableau
   */
  const toggleTacheFaite = useCallback((index) => {
    setTaches(taches => taches.map((t, i) => 
      i === index ? { ...t, fait: !t.fait } : t
    ));
  }, []);

  /**
   * Ajout d'une nouvelle tâche
   */
  const ajouterTache = useCallback(() => {
    if (!formTache.nom.trim()) {
      toast.warning("Le nom de la tâche est requis");
      return;
    }
    
    // Ajout avec un identifiant unique
    const nouvelleTache = {
      id: Date.now().toString(),
      nom: formTache.nom.trim(),
      description: formTache.description.trim(),
      coefficient: parseInt(formTache.coefficient) || 1,
      fait: false,
      couleur: getRandomGradient(),
    };
    
    setTaches(taches => [...taches, nouvelleTache]);
    
    // Réinitialisation du formulaire
    setFormTache({
      nom: "",
      description: "",
      coefficient: 1,
      visible: false,
    });
    
    toast.success("Tâche ajoutée avec succès");
  }, [formTache]);

  /**
   * Modification d'une tâche existante
   */
  const modifierTache = useCallback(() => {
    if (!editingTask) return;
    if (!formTache.nom.trim()) {
      toast.warning("Le nom de la tâche est requis");
      return;
    }
    
    setTaches(taches => taches.map(t => 
      t.id === editingTask.id ? {
        ...t,
        nom: formTache.nom.trim(),
        description: formTache.description.trim(),
        coefficient: parseInt(formTache.coefficient) || 1,
      } : t
    ));
    
    // Réinitialisation du formulaire
    setFormTache({
      nom: "",
      description: "",
      coefficient: 1,
      visible: false,
    });
    
    setEditingTask(null);
    toast.success("Tâche modifiée avec succès");
  }, [editingTask, formTache]);

  /**
   * Suppression d'une tâche
   * @param {number} index - Index de la tâche dans le tableau
   */
  const supprimerTache = useCallback((index) => {
    setConfirmDialog({
      visible: true,
      message: "Êtes-vous sûr de vouloir supprimer cette tâche ?",
      onConfirm: () => {
        setTaches(taches => taches.filter((_, i) => i !== index));
        toast.info("Tâche supprimée");
        setConfirmDialog({ visible: false, message: "", onConfirm: null });
      }
    });
  }, []);

  /**
   * Ouverture du formulaire d'édition d'une tâche
   * @param {Object} tache - Tâche à modifier
   */
  const ouvrirEditionTache = useCallback((tache) => {
    setEditingTask(tache);
    setFormTache({
      nom: tache.nom,
      description: tache.description || "",
      coefficient: tache.coefficient || 1,
      visible: true,
    });
  }, []);

  /**
   * Déconnexion de l'utilisateur
   */
  const deconnexion = async () => {
    setConfirmDialog({
      visible: true,
      message: "Êtes-vous sûr de vouloir vous déconnecter ?",
      onConfirm: async () => {
        await supabase.auth.signOut();
        toast.info("Vous avez été déconnecté");
        router.push("/connexion");
      }
    });
  };

  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
        <div className="w-24 h-24 border-t-4 border-l-4 border-white rounded-full animate-spin"></div>
        <p className="mt-4 text-xl font-medium">Chargement de NourRise...</p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        modeNuit
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white"
          : "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white"
      }`}
    >
      <Head>
        <title>NourRise - Discipline personnelle</title>
        <meta name="description" content="Application de suivi de productivité et de développement personnel" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header fixe */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-black/20 px-4 py-3 flex justify-between items-center mb-4 shadow-lg">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
            {niveau.icone}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">NourRise</h1>
            <p className="text-xs text-gray-300">Discipline et croissance personnelle</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setModeNuit(!modeNuit)}
            className="bg-white/10 p-2 rounded-full shadow hover:scale-105 transition"
            aria-label={modeNuit ? "Activer le mode jour" : "Activer le mode nuit"}
          >
            {modeNuit ? <FiSun className="text-yellow-400" /> : <FiMoon />}
          </button>
          <button
            onClick={deconnexion}
            className="bg-white/10 p-2 rounded-full shadow hover:scale-105 transition"
            aria-label="Se déconnecter"
          >
            <FiLogOut />
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-20">
        {/* Informations utilisateur et progression */}
        <section className="mb-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold">Bienvenue, {user?.email?.split('@')[0] || "Invité"}</h2>
                <div className="flex items-center mt-1">
                  <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                    Niveau {niveau.niveau} — {niveau.nom} {niveau.icone}
                  </span>
                  <span className="ml-2 text-xs italic">{niveau.motivation}</span>
                </div>
              </div>
            </div>
            
            {/* Barre de progression vers le niveau suivant */}
            {niveau.niveau < NIVEAUX.length && (
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span>Niveau {niveau.niveau}</span>
                  <span>Niveau {niveau.niveau + 1} {NIVEAUX[niveau.niveau].icone}</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${NIVEAUX[niveau.niveau].couleur} transition-all duration-1000`}
                    style={{ 
                      width: `${Math.min(100, ((points - niveau.requis) / (NIVEAUX[niveau.niveau].requis - niveau.requis)) * 100)}%` 
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>{points} points</span>
                  <span>
                    {NIVEAUX[niveau.niveau].requis > points 
                      ? `${NIVEAUX[niveau.niveau].requis - points} points restants` 
                      : "Niveau complété!"}
                  </span>
                </div>
              </div>
            )}
            
            {/* Citation du jour */}
            <div className="mt-2 italic text-sm text-center p-2 rounded bg-white/5">
              "{citationDuJour}"
            </div>
          </div>
        </section>
        
        {/* Navigation entre les différentes vues */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-2 mb-6 flex justify-around">
          <button 
            onClick={() => setVueActive("taches")}
            className={`px-4 py-2 rounded-lg transition ${vueActive === "taches" ? "bg-white/20 font-bold" : "hover:bg-white/10"}`}
          >
            Tâches
          </button>
          <button 
            onClick={() => setVueActive("statistiques")}
            className={`px-4 py-2 rounded-lg transition ${vueActive === "statistiques" ? "bg-white/20 font-bold" : "hover:bg-white/10"}`}
          >
            Statistiques
          </button>
          <button 
            onClick={() => setVueActive("journal")}
            className={`px-4 py-2 rounded-lg transition ${vueActive === "journal" ? "bg-white/20 font-bold" : "hover:bg-white/10"}`}
          >
            Journal
          </button>
        </div>

        {/* Statistiques principales */}
        <section className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 text-center shadow-lg">
              <div className="text-3xl font-bold">{points}</div>
              <div className="text-xs uppercase tracking-wider mt-1">Points</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 text-center shadow-lg">
              <div className="text-3xl font-bold flex items-center justify-center">
                {streak > 0 && <span className="text-yellow-400 mr-1">🔥</span>}
                {streak}
              </div>
              <div className="text-xs uppercase tracking-wider mt-1">Jours consécutifs</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 text-center shadow-lg">
              <div className="text-3xl font-bold">{statistiques.tauxReussiteMoyen}%</div>
              <div className="text-xs uppercase tracking-wider mt-1">Taux moyen</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 text-center shadow-lg">
              <div className="text-3xl font-bold">{statistiques.tachesFaites}</div>
              <div className="text-xs uppercase tracking-wider mt-1">Tâches accomplies</div>
            </div>
          </div>
        </section>

        {/* Vue des tâches du jour */}
        {vueActive === "taches" && (
          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Tâches du jour</h2>
              <button
                onClick={() => setFormTache({ ...formTache, visible: true })}
                className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg font-medium transition flex items-center"
              >
                <FiPlus className="mr-1" /> Ajouter
              </button>
            </div>
            
            {taches.length > 0 ? (
              <div className="space-y-4">
                {taches.map((tache, index) => (
                  <div
                    key={tache.id || index}
                    className={`rounded-lg p-4 flex justify-between items-center backdrop-blur-sm transition-all duration-300 ${
                      tache.fait 
                        ? "bg-green-500/20 border-l-4 border-green-500" 
                        : "bg-white/10 hover:bg-white/15"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className={`text-lg font-bold ${tache.fait ? "line-through opacity-70" : ""}`}>
                          {tache.nom}
                        </h3>
                        {Array.from({ length: tache.coefficient || 1 }).map((_, i) => (
                          <FiStar key={i} className="ml-1 text-yellow-400" />
                        ))}
                      </div>
                      {tache.description && (
                        <p className={`text-sm mt-1 ${tache.fait ? "line-through opacity-50" : ""}`}>
                          {tache.description}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className={`p-2 rounded-lg transition ${
                          tache.fait ? "bg-green-600 text-white" : "bg-gray-300 text-black"
                        }`}
                        onClick={() => toggleTacheFaite(index)}
                        aria-label={tache.fait ? "Marquer comme non fait" : "Marquer comme fait"}
                      >
                        {tache.fait ? <FiCheck /> : <FiPlus />}
                      </button>
                      <button
                        className="p-2 rounded-lg bg-blue-500/30 hover:bg-blue-500/50 transition"
                        onClick={() => ouvrirEditionTache(tache)}
                        aria-label="Modifier cette tâche"
                      >
                        <FiEdit />
                      </button>
                      <button
                        className="p-2 rounded-lg bg-red-500/30 hover:bg-red-500/50 transition"
                        onClick={() => supprimerTache(index)}
                        aria-label="Supprimer cette tâche"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 bg-white/10 rounded-lg">
                <p className="text-lg">Aucune tâche pour aujourd'hui.</p>
                <p className="text-sm mt-2">Commencez par ajouter des tâches à accomplir!</p>
              </div>
            )}
            
            <button
              onClick={validerJournee}
              disabled={actionEnCours}
              className={`mt-6 ${
                actionEnCours 
                  ? "bg-gray-500 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-700"
              } px-6 py-3 rounded-xl font-semibold shadow-lg w-full transition flex items-center justify-center`}
            >
              {actionEnCours ? (
                <>
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                  Validation en cours...
                </>
              ) : (
                "Valider la journée"
              )}
            </button>
          </section>
        )}
        
        {/* Vue des statistiques et graphiques */}
        {vueActive === "statistiques" && (
          <section className="space-y-8">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">Évolution de tes progrès</h2>
              <div className="h-64">
                <GraphiqueEvolution journal={journal} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4">Notes des derniers jours</h2>
                <div className="h-64">
                  <GraphiqueNote journal={journal} />
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4">Répartition des tâches</h2>
                <div className="h-64">
                  <GraphiqueRepartition 
                    taches={taches} 
                    total={taches.length} 
                    faites={taches.filter(t => t.fait).length} 
                  />
                </div>
              </div>
            </div>
            
            {/* Badges débloqués */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">Badges & Accomplissements</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {BADGES.map(badge => (
                  <div 
                    key={badge.id} 
                    className={`p-3 rounded-lg text-center transition ${
                      statistiques.badgesDebloques.includes(badge.id)
                        ? "bg-gradient-to-br from-yellow-400 to-amber-600 text-white shadow-lg"
                        : "bg-white/5 grayscale opacity-60"
                    }`}
                  >
                    <div className="text-3xl mb-2">{badge.icone}</div>
                    <div className="font-bold">{badge.nom}</div>
                    <div className="text-xs">{badge.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
        
        {/* Vue du journal de progression */}
        {vueActive === "journal" && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">Ton journal de progression</h2>
            {journal.length > 0 ? (
              <div className="space-y-4">
                {journal.map((entry, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-md rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold">{formatDate(entry.created_at)}</h3>
                        <p className="text-sm">
                          Note: <span className="font-medium">{entry.note}/10</span> • 
                          Réussite: <span className="font-medium">{entry.taux_reussite}%</span>
                        </p>
                      </div>
                      <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
                        {entry.streak} 🔥
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <h4 className="text-sm font-medium mb-2">Tâches effectuées:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {entry.taches?.map((tache, i) => (
                          <div 
                            key={i} 
                            className={`px-3 py-2 rounded text-sm ${
                              tache.fait ? "bg-green-500/30" : "bg-white/5"
                            }`}
                          >
                            <span className={tache.fait ? "" : "opacity-50"}>
                              {tache.nom}
                              {tache.coefficient > 1 && (
                                <span className="ml-1 text-yellow-400">
                                  {"★".repeat(tache.coefficient)}
                                </span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 bg-white/10 rounded-lg">
                <p>Aucune entrée dans ton journal pour le moment.</p>
                <p className="text-sm mt-2">Commence par valider ta première journée!</p>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Formulaire d'ajout/édition de tâche (modal) */}
      <Transition
        show={formTache.visible}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">
              {editingTask ? "Modifier la tâche" : "Ajouter une tâche"}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom de la tâche</label>
                <input
                  type="text"
                  value={formTache.nom}
                  onChange={(e) => setFormTache({ ...formTache, nom: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ex: Méditation matinale"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description (optionnelle)</label>
                <input
                  type="text"
                  value={formTache.description}
                  onChange={(e) => setFormTache({ ...formTache, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ex: 10 minutes minimum"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Importance (coefficient)</label>
                <div className="flex items-center space-x-3">
                  {[1, 2, 3].map((coef) => (
                    <button
                      key={coef}
                      type="button"
                      onClick={() => setFormTache({ ...formTache, coefficient: coef })}
                      className={`flex-1 py-2 rounded-lg flex items-center justify-center ${
                        formTache.coefficient === coef 
                          ? "bg-blue-600" 
                          : "bg-gray-700 hover:bg-gray-600"
                      }`}
                    >
                      {Array.from({ length: coef }).map((_, i) => (
                        <FiStar key={i} className="text-yellow-400" />
                      ))}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  L'importance affecte le calcul du score final
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setFormTache({ ...formTache, visible: false });
                  setEditingTask(null);
                }}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={editingTask ? modifierTache : ajouterTache}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500"
              >
                {editingTask ? "Sauvegarder" : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      </Transition>

      {/* Boîte de dialogue de confirmation */}
      <Transition
        show={confirmDialog.visible}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl w-full max-w-sm p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Confirmation</h2>
            <p>{confirmDialog.message}</p>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setConfirmDialog({ visible: false, message: "", onConfirm: null })}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      </Transition>

      {/* Toast notifications */}
      <ToastContainer 
        position="bottom-right"
        theme={modeNuit ? "dark" : "light"}
        autoClose={3000}
      />
    </div>
  );
}
