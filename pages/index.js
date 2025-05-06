import { useState, useEffect } from "react";
import { format } from "date-fns";
import AnalyseIA from "../composants/AnalyseIA";
import GraphiqueEvolution from "../composants/GraphiqueEvolution";
import GraphiqueNote from "../composants/GraphiqueNote";
import { supabase } from "../supabaseClient";
import { useRouter } from "next/router";
import Head from 'next/head';
import { FiAward, FiTrendingUp, FiZap, FiCheck, FiClock, FiX } from 'react-icons/fi';

// Configuration du système de niveau et récompenses
const NIVEAUX = [
  { niveau: 1, nom: "Débutant", requis: 0, couleur: "from-blue-400 to-blue-600" },
  { niveau: 2, nom: "Apprenti", requis: 100, couleur: "from-green-400 to-green-600" },
  { niveau: 3, nom: "Initié", requis: 300, couleur: "from-yellow-400 to-yellow-600" },
  { niveau: 4, nom: "Expert", requis: 600, couleur: "from-purple-400 to-purple-600" },
  { niveau: 5, nom: "Maître", requis: 1000, couleur: "from-red-400 to-red-600" },
  { niveau: 6, nom: "Légende", requis: 2000, couleur: "from-pink-400 to-pink-600" }
];

const CATEGORIES = {
  SPIRITUEL: { nom: "Spirituel", icone: "🕌", couleur: "bg-purple-100 text-purple-800" },
  SPORT: { nom: "Sport", icone: "💪", couleur: "bg-green-100 text-green-800" },
  EDUCATION: { nom: "Éducation", icone: "📚", couleur: "bg-blue-100 text-blue-800" },
  DEVELOPPEMENT: { nom: "Développement", icone: "🚀", couleur: "bg-yellow-100 text-yellow-800" }
};

const tachesJournalieresInitiales = [
  // ... votre liste de tâches existante avec catégories ajoutées
  { nom: "Coran", coef: 5, categorie: "SPIRITUEL" },
  { nom: "Révision", coef: 4, categorie: "EDUCATION" },
  // ... ajoutez la catégorie à chaque tâche
];

// Citation motivantes
const CITATIONS = [
  { texte: "Chaque petit progrès te rapproche de tes objectifs", auteur: "NourRise" },
  { texte: "La constance est la clé du succès", auteur: "NourRise" },
  // Ajoutez plus de citations...
];

export default function Home() {
  // États existants
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [taches, setTaches] = useState([]);
  const [historique, setHistorique] = useState([]);
  const router = useRouter();

  // Nouveaux états
  const [niveau, setNiveau] = useState(1);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [notification, setNotification] = useState(null);
  const [citationDuJour, setCitationDuJour] = useState(CITATIONS[0]);
  const [categorieActive, setCategorieActive] = useState("TOUS");

  // Calcul du streak
  useEffect(() => {
    if (historique.length > 0) {
      let streakCount = 0;
      const aujourdhui = new Date();
      let dernierJour = new Date(historique[0].date);

      for (let i = 0; i < historique.length; i++) {
        const jourActuel = new Date(historique[i].date);
        if (i === 0 || (dernierJour - jourActuel) / (1000 * 60 * 60 * 24) === 1) {
          streakCount++;
          dernierJour = jourActuel;
        } else break;
      }
      setStreak(streakCount);
    }
  }, [historique]);

  // Calcul du niveau
  useEffect(() => {
    const totalPoints = historique.reduce((acc, jour) => acc + jour.note, 0);
    setPoints(totalPoints);
    
    for (let i = NIVEAUX.length - 1; i >= 0; i--) {
      if (totalPoints >= NIVEAUX[i].requis) {
        setNiveau(i + 1);
        break;
      }
    }
  }, [historique]);

  // Fonction pour afficher une notification
  const afficherNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Modification de vos fonctions existantes pour ajouter les nouvelles fonctionnalités
  const ajouterJournee = async () => {
    // ... votre code existant
    const ancienNiveau = niveau;
    // Après l'ajout réussi :
    if (nouveauNiveau > ancienNiveau) {
      afficherNotification(`🎉 Félicitations ! Vous avez atteint le niveau ${nouveauNiveau} !`, 'achievement');
    }
  };

  return (
    <>
      <Head>
        <title>NourRise - Votre Voyage vers l'Excellence</title>
        <style jsx global>{`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
          .floating {
            animation: float 3s ease-in-out infinite;
          }
          .glassmorphism {
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.3);
          }
        `}</style>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        {/* Barre de progression niveau */}
        <div className="fixed top-0 left-0 w-full h-1 bg-gray-200">
          <div 
            className={`h-full bg-gradient-to-r ${NIVEAUX[niveau-1].couleur}`}
            style={{ width: `${(points - NIVEAUX[niveau-1].requis) / (NIVEAUX[niveau].requis - NIVEAUX[niveau-1].requis) * 100}%` }}
          />
        </div>

        {/* Header amélioré */}
        <div className="p-6 glassmorphism">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full bg-gradient-to-r ${NIVEAUX[niveau-1].couleur} floating`}>
                <span className="text-2xl">{NIVEAUX[niveau-1].icone}</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Niveau {niveau}</h1>
                <p className="text-white/80">{NIVEAUX[niveau-1].nom}</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-white text-center">
                <div className="text-3xl font-bold floating">🔥</div>
                <div className="text-sm">{streak} jours</div>
              </div>
              <button
                onClick={seDeconnecter}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>

        {/* Citation du jour */}
        <div className="mx-auto max-w-4xl my-6 p-4 glassmorphism rounded-lg text-white text-center">
          <p className="text-lg italic">"{citationDuJour.texte}"</p>
          <p className="text-sm mt-2">- {citationDuJour.auteur}</p>
        </div>

        {/* Grille principale */}
        <div className="container mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Carte des tâches */}
            <div className="md:col-span-2 glassmorphism rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Tâches du jour</h2>
                <div className="flex space-x-2">
                  {Object.keys(CATEGORIES).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategorieActive(cat)}
                      className={`px-3 py-1 rounded-full transition ${
                        categorieActive === cat ? CATEGORIES[cat].couleur : 'bg-white/10 text-white'
                      }`}
                    >
                      {CATEGORIES[cat].icone}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {taches
                  .filter(t => categorieActive === "TOUS" || t.categorie === categorieActive)
                  .map((tache, index) => (
                    <div
                      key={index}
                      className="glassmorphism p-4 rounded-lg flex items-center justify-between group hover:scale-102 transition"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{CATEGORIES[tache.categorie].icone}</span>
                        <span className="text-white">{tache.nom}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex space-x-2">
                          {[...Array(tache.coef)].map((_, i) => (
                            <span key={i} className="text-yellow-400">⭐</span>
                          ))}
                        </div>
                        <select
                          value={tache.etat}
                          onChange={(e) => {
                            const updated = [...taches];
                            updated[index].etat = e.target.value;
                            setTaches(updated);
                            if (e.target.value === "Terminé") {
                              afficherNotification(`🎯 ${tache.nom} terminée !`);
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

              <div className="mt-6 flex justify-between">
                <button
                  onClick={ajouterTache}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
                >
                  Ajouter une tâche
                </button>
                <button
                  onClick={ajouterJournee}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                >
                  Valider la journée
                </button>
              </div>
            </div>

            {/* Statistiques et progression */}
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
                          width: `${(points - NIVEAUX[niveau-1].requis) / 
                            (NIVEAUX[niveau].requis - NIVEAUX[niveau-1].requis) * 100}%`
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
                    <span className="font-medium">{format(new Date(jour.date), 'dd/MM/yyyy')}</span>
                    <span className="mx-4">•</span>
                    <span className="text-green-400">{jour.taux_reussite}%</span>
                    <span className="mx-4">•</span>
                    <span className="text-yellow-400">{jour.note}/20</span>
                  </div>
                  <button
                    onClick={() => supprimerJournee(index)}
                    className="text-red-400 hover:text-red-300 transition"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

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