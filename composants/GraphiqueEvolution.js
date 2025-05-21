import React, { useMemo, useState, useCallback } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, Brush, ReferenceLine, ReferenceArea,
  AreaChart, Area
} from 'recharts';
import { format, subDays, differenceInDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * @component GraphiqueEvolution
 * @description Visualisation avancée de l'évolution des points, streak et notes
 * avec zoom interactif, analyse de tendances et comparaisons de périodes
 * 
 * @param {Object} props - Propriétés du composant
 * @param {Array} props.journal - Entrées du journal de l'utilisateur
 * @param {string} props.periodeActive - Période de visualisation active ('7j', '30j', '90j', '1an', 'tout')
 * @param {boolean} props.modeArea - Utiliser des graphiques de type Area au lieu de Line
 * @param {boolean} props.comparerPeriodes - Activer la comparaison avec période précédente
 * @param {boolean} props.modeSombre - Utiliser le mode sombre
 * @param {Object} props.metriquesVisibles - Contrôle quelles métriques afficher
 * @returns {JSX.Element} Graphique d'évolution interactif et informatif
 */
const GraphiqueEvolution = ({ 
  journal = [],
  periodeActive = 'tout',
  modeArea = false,
  comparerPeriodes = false,
  modeSombre = false,
  metriquesVisibles = { points: true, streak: true, note: false }
}) => {
  // États pour interactions utilisateur
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomDomain, setZoomDomain] = useState({ start: null, end: null });
  const [hoveredDate, setHoveredDate] = useState(null);
  const [metriquesPeriode, setMetriquesPeriode] = useState({
    actuelle: { moyenne: 0, min: 0, max: 0 },
    precedente: { moyenne: 0, min: 0, max: 0 },
    evolution: 0
  });
  
  // Nombre de jours à afficher selon la période sélectionnée
  const joursAffichage = useMemo(() => {
    switch(periodeActive) {
      case '7j': return 7;
      case '30j': return 30;
      case '90j': return 90;
      case '1an': return 365;
      default: return journal.length;
    }
  }, [periodeActive, journal.length]);
  
  // Préparation des données pour le graphique avec limitation selon la période
  const donnees = useMemo(() => {
    if (!journal || journal.length === 0) return [];
    
    // Tri chronologique et limitation au nombre de jours
    const entriesReversed = [...journal]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, joursAffichage)
      .reverse();
    
    // Formater les données pour le graphique
    return entriesReversed.map((entry, index) => {
      const date = parseISO(entry.created_at);
      
      // Format court pour l'affichage
      const dateFormatee = format(date, 'dd MMM', { locale: fr });
      
      // Identifier les weekends pour stylisation différente
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      return {
        date: dateFormatee,
        dateComplete: format(date, 'dd MMMM yyyy', { locale: fr }),
        timestamp: date.getTime(),
        points: entry.points || 0,
        streak: entry.streak || 0,
        note: entry.note || 0,
        taux: entry.taux_reussite || 0,
        index,
        isWeekend
      };
    });
  }, [journal, joursAffichage]);
  
  // Calcul des métriques pour les périodes comparées
  useMemo(() => {
    if (!comparerPeriodes || donnees.length === 0) return;
    
    // Diviser les données en période actuelle et précédente
    const milieuIndex = Math.floor(donnees.length / 2);
    const periodeActuelle = donnees.slice(milieuIndex);
    const periodePrecedente = donnees.slice(0, milieuIndex);
    
    // Calcul des statistiques pour chaque période
    const calculStats = (periode) => {
      if (periode.length === 0) return { moyenne: 0, min: 0, max: 0 };
      
      const points = periode.map(j => j.points);
      return {
        moyenne: Math.round(points.reduce((a, b) => a + b, 0) / periode.length),
        min: Math.min(...points),
        max: Math.max(...points)
      };
    };
    
    const statsActuelle = calculStats(periodeActuelle);
    const statsPrecedente = calculStats(periodePrecedente);
    
    // Calcul de l'évolution en pourcentage
    const evolution = statsPrecedente.moyenne === 0 
      ? 100 
      : Math.round(((statsActuelle.moyenne - statsPrecedente.moyenne) / statsPrecedente.moyenne) * 100);
    
    setMetriquesPeriode({
      actuelle: statsActuelle,
      precedente: statsPrecedente,
      evolution
    });
  }, [donnees, comparerPeriodes]);
  
  // Calcul dynamique des domaines pour les axes Y
  const domaines = useMemo(() => {
    if (donnees.length === 0) return {
      points: [0, 100],
      streak: [0, 5],
      note: [0, 10]
    };
    
    const points = donnees.map(d => d.points);
    const streak = donnees.map(d => d.streak);
    const note = donnees.map(d => d.note);
    
    return {
      points: [0, Math.max(...points) * 1.1],
      streak: [0, Math.max(5, Math.max(...streak) + 1)],
      note: [0, 10]
    };
  }, [donnees]);
  
  // Gestion du zoom sur une période spécifique
  const handleZoom = useCallback((domain) => {
    if (!domain) {
      setZoomActive(false);
      setZoomDomain({ start: null, end: null });
      return;
    }
    
    setZoomActive(true);
    setZoomDomain({
      start: domain.startIndex,
      end: domain.endIndex
    });
  }, []);
  
  // Formatage personnalisé du tooltip
  const customTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    
    // Récupérer les données complètes de l'entrée
    const data = payload[0].payload;
    
    return (
      <div className={`p-3 rounded-lg shadow-lg ${modeSombre ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border ${modeSombre ? 'border-gray-700' : 'border-gray-200'}`}>
        <p className="font-medium">{data.dateComplete}</p>
        <div className="space-y-1 mt-2">
          {metriquesVisibles.points && (
            <p className="flex items-center justify-between">
              <span className="text-sm mr-3">Points:</span>
              <span className="font-medium text-purple-500">{data.points}</span>
            </p>
          )}
          {metriquesVisibles.streak && (
            <p className="flex items-center justify-between">
              <span className="text-sm mr-3">Streak:</span>
              <span className="font-medium text-amber-500">{data.streak} jour{data.streak > 1 ? 's' : ''}</span>
            </p>
          )}
          {metriquesVisibles.note && (
            <p className="flex items-center justify-between">
              <span className="text-sm mr-3">Note:</span>
              <span className="font-medium text-blue-500">{data.note}/10</span>
            </p>
          )}
          <p className="flex items-center justify-between">
            <span className="text-sm mr-3">Taux:</span>
            <span className="font-medium text-green-500">{data.taux}%</span>
          </p>
        </div>
      </div>
    );
  };
  
  // Si aucune donnée, afficher un message
  if (!journal || journal.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center h-full text-center p-8 rounded-lg ${
        modeSombre ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'
      }`}>
        <svg className="w-16 h-16 text-gray-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-lg font-medium">Aucune donnée disponible</p>
        <p className="text-sm text-gray-400 mt-2 max-w-md">
          Valide ta première journée pour commencer à voir ton évolution! 
          Les graphiques s'actualiseront automatiquement.
        </p>
        <button 
          className={`mt-4 px-4 py-2 rounded-lg ${
            modeSombre ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
          } text-white transition-colors`}
          onClick={() => window.scrollTo(0, 0)}
        >
          Ajouter des données
        </button>
      </div>
    );
  }
  
  // Comparaison de périodes - visualisation des zones
  const renderZonesComparaison = () => {
    if (!comparerPeriodes || donnees.length === 0) return null;
    
    const milieuIndex = Math.floor(donnees.length / 2);
    
    return (
      <>
        <ReferenceArea 
          x1={0} 
          x2={milieuIndex} 
          stroke="none"
          fill={modeSombre ? "rgba(59, 130, 246, 0.1)" : "rgba(59, 130, 246, 0.1)"} 
          label={{ 
            value: "Période précédente", 
            position: "insideTopLeft",
            fill: modeSombre ? "rgba(255, 255, 255, 0.7)" : "rgba(30, 41, 59, 0.7)",
            fontSize: 11
          }}
        />
        <ReferenceArea 
          x1={milieuIndex} 
          x2={donnees.length - 1} 
          stroke="none"
          fill={modeSombre ? "rgba(168, 85, 247, 0.1)" : "rgba(168, 85, 247, 0.1)"} 
          label={{ 
            value: "Période actuelle", 
            position: "insideTopRight",
            fill: modeSombre ? "rgba(255, 255, 255, 0.7)" : "rgba(30, 41, 59, 0.7)",
            fontSize: 11
          }}
        />
      </>
    );
  };
  
  // Détermination du type de graphique à afficher (Line ou Area)
  const ChartComponent = modeArea ? AreaChart : LineChart;
  const DataComponent = modeArea ? Area : Line;
  
  return (
    <div className="space-y-4">
      {/* Statistiques de comparaison si activées */}
      {comparerPeriodes && (
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 text-center mb-3 text-sm ${
          modeSombre ? 'text-gray-300' : 'text-gray-700'
        }`}>
          <div className={`p-2 rounded-lg ${modeSombre ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div className="font-medium">Période actuelle</div>
            <div className="text-lg text-purple-500 font-bold">{metriquesPeriode.actuelle.moyenne}</div>
            <div className="text-xs opacity-75">points en moyenne</div>
          </div>
          <div className={`p-2 rounded-lg ${modeSombre ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div className="font-medium">Période précédente</div>
            <div className="text-lg text-blue-500 font-bold">{metriquesPeriode.precedente.moyenne}</div>
            <div className="text-xs opacity-75">points en moyenne</div>
          </div>
          <div className={`p-2 rounded-lg ${modeSombre ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div className="font-medium">Évolution</div>
            <div className={`text-lg font-bold ${
              metriquesPeriode.evolution > 0 ? 'text-green-500' : 
              metriquesPeriode.evolution < 0 ? 'text-red-500' : 'text-yellow-500'
            }`}>
              {metriquesPeriode.evolution > 0 ? '+' : ''}{metriquesPeriode.evolution}%
            </div>
            <div className="text-xs opacity-75">entre les périodes</div>
          </div>
          <div className={`p-2 rounded-lg ${modeSombre ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div className="font-medium">Activité</div>
            <div className="text-lg text-amber-500 font-bold">{donnees.length}</div>
            <div className="text-xs opacity-75">jours enregistrés</div>
          </div>
        </div>
      )}
      
      {/* Graphique principal */}
      <ResponsiveContainer width="100%" height={350}>
        <ChartComponent
          data={donnees}
          margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
          onMouseMove={(e) => e && e.activeLabel && setHoveredDate(e.activeLabel)}
          onMouseLeave={() => setHoveredDate(null)}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={modeSombre ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} 
            vertical={false}
          />
          
          <XAxis 
            dataKey="date" 
            tick={{ 
              fill: modeSombre ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)', 
              fontSize: 12 
            }}
            axisLine={{ stroke: modeSombre ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}
            tickLine={{ stroke: modeSombre ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}
          />
          
          {/* Axes Y multiples pour chaque métrique */}
          {metriquesVisibles.points && (
            <YAxis 
              yAxisId="left"
              tick={{ 
                fill: modeSombre ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)', 
                fontSize: 12 
              }}
              domain={domaines.points}
              axisLine={{ stroke: modeSombre ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}
              tickLine={{ stroke: modeSombre ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}
              label={{ 
                value: 'Points', 
                angle: -90, 
                position: 'insideLeft',
                style: { 
                  textAnchor: 'middle',
                  fill: modeSombre ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                  fontSize: 10
                }
              }}
            />
          )}
          
          {metriquesVisibles.streak && (
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              tick={{ 
                fill: modeSombre ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)', 
                fontSize: 12 
              }}
              domain={domaines.streak}
              axisLine={{ stroke: modeSombre ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}
              tickLine={{ stroke: modeSombre ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}
              label={{ 
                value: 'Streak', 
                angle: 90, 
                position: 'insideRight',
                style: { 
                  textAnchor: 'middle',
                  fill: modeSombre ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                  fontSize: 10
                }
              }}
            />
          )}
          
          {metriquesVisibles.note && (
            <YAxis 
              yAxisId="note" 
              orientation="right"
              tick={{ 
                fill: modeSombre ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)', 
                fontSize: 12 
              }}
              domain={domaines.note}
              axisLine={{ stroke: modeSombre ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}
              tickLine={{ stroke: modeSombre ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}
              tickCount={6}
              hide={!metriquesVisibles.note}
            />
          )}
          
          {/* Tooltip personnalisé */}
          <Tooltip content={customTooltip} />
          
          {/* Légende interactive */}
          <Legend 
            verticalAlign="top"
            height={36}
            iconType="circle"
            iconSize={10}
            formatter={(value) => (
              <span style={{ 
                color: modeSombre ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)', 
                fontSize: '14px',
                cursor: 'pointer'
              }}>
                {value === 'points' ? 'Points' : 
                 value === 'streak' ? 'Série de jours' : 
                 'Note /10'}
              </span>
            )}
          />
          
          {/* Zones de comparaison de périodes */}
          {renderZonesComparaison()}
          
          {/* Lignes de référence */}
          {metriquesVisibles.points && !comparerPeriodes && (
            <ReferenceLine 
              y={donnees.reduce((acc, curr) => acc + curr.points, 0) / donnees.length}
              yAxisId="left"
              stroke="#8884d8" 
              strokeDasharray="3 3"
              label={{ 
                value: 'Moy.', 
                position: 'left',
                fill: modeSombre ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                fontSize: 10
              }}
            />
          )}
          
          {/* Affichage des données */}
          {metriquesVisibles.points && (
            <DataComponent
              yAxisId="left"
              type="monotone"
              dataKey="points"
              stroke="#8884d8"
              strokeWidth={2}
              fill="url(#colorPoints)"
              fillOpacity={0.2}
              activeDot={{ 
                r: 6, 
                strokeWidth: 1,
                stroke: modeSombre ? '#fff' : '#000'
              }}
              animationDuration={1500}
              isAnimationActive={true}
              dot={false}
            />
          )}
          
          {metriquesVisibles.streak && (
            <DataComponent
              yAxisId="right"
              type="monotone"
              dataKey="streak"
              stroke="#ff9d5c"
              strokeWidth={2}
              fill="url(#colorStreak)"
              fillOpacity={0.2}
              activeDot={{ 
                r: 6, 
                strokeWidth: 1,
                stroke: modeSombre ? '#fff' : '#000'
              }}
              animationDuration={1500}
              isAnimationActive={true}
              dot={false}
            />
          )}
          
          {metriquesVisibles.note && (
            <DataComponent
              yAxisId="note"
              type="monotone"
              dataKey="note"
              stroke="#2563eb"
              strokeWidth={2}
              fill="url(#colorNote)"
              fillOpacity={0.2}
              activeDot={{ 
                r: 6, 
                strokeWidth: 1,
                stroke: modeSombre ? '#fff' : '#000'
              }}
              animationDuration={1500}
              isAnimationActive={true}
              dot={false}
            />
          )}
          
          {/* Dégradés pour les aires */}
          <defs>
            <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorStreak" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff9d5c" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ff9d5c" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorNote" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          {/* Brosse pour zoom interactif */}
          <Brush 
            dataKey="date" 
            height={30} 
            stroke={modeSombre ? "#8884d8" : "#8884d8"} 
            fill={modeSombre ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.3)"}
            onChange={handleZoom}
            startIndex={zoomActive ? zoomDomain.start : undefined}
            endIndex={zoomActive ? zoomDomain.end : undefined}
            travellerWidth={10}
          />
        </ChartComponent>
      </ResponsiveContainer>
      
      {/* Boutons interactifs et légende supplémentaire */}
      <div className="flex flex-wrap items-center justify-between mt-2">
        <div className="text-xs opacity-70">
          {hoveredDate ? 
            `Détails pour ${hoveredDate}` : 
            `${donnees.length} jours affichés • Utilisez la brosse ci-dessus pour zoomer sur une période`
          }
        </div>
        
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 text-xs rounded-full transition ${
              zoomActive 
                ? `${modeSombre ? 'bg-purple-800 text-white' : 'bg-purple-600 text-white'}`
                : `${modeSombre ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`
            }`}
            onClick={() => setZoomActive(false)}
          >
            Vue complète
          </button>
          
          <button
            className={`px-3 py-1 text-xs rounded-full transition ${
              !modeArea 
                ? `${modeSombre ? 'bg-blue-800 text-white' : 'bg-blue-600 text-white'}`
                : `${modeSombre ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`
            }`}
            onClick={() => window.location.href = `?modeArea=false&periodeActive=${periodeActive}`}
          >
            Lignes
          </button>
          
          <button
            className={`px-3 py-1 text-xs rounded-full transition ${
              modeArea 
                ? `${modeSombre ? 'bg-green-800 text-white' : 'bg-green-600 text-white'}`
                : `${modeSombre ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`
            }`}
            onClick={() => window.location.href = `?modeArea=true&periodeActive=${periodeActive}`}
          >
            Aires
          </button>
        </div>
      </div>
    </div>
  );
};

export default GraphiqueEvolution;
