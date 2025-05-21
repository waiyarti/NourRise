import React, { useMemo, useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, Brush, ReferenceLine
} from 'recharts';

/**
 * @component GraphiqueEvolution
 * @description Graphique avancé visualisant l'évolution des points et du streak au fil du temps
 * avec fonctionnalités interactives et analyse des tendances
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {Array} props.journal - Entrées du journal de l'utilisateur
 * @param {boolean} props.showPoints - Afficher la courbe des points
 * @param {boolean} props.showStreak - Afficher la courbe du streak
 * @param {boolean} props.showNote - Afficher la courbe des notes
 * @param {number} props.maxEntries - Nombre maximum d'entrées à afficher
 * @returns {JSX.Element} Graphique d'évolution interactif
 */
const GraphiqueEvolution = ({ 
  journal = [],
  showPoints = true,
  showStreak = true,
  showNote = false,
  maxEntries = 10
}) => {
  // État pour le zoom et les filtres
  const [zoomDomain, setZoomDomain] = useState(null);
  const [activeLines, setActiveLines] = useState({
    points: showPoints,
    streak: showStreak,
    note: showNote
  });

  // Préparation des données pour le graphique avec formatage optimisé
  const donnees = useMemo(() => {
    if (!journal || journal.length === 0) return [];
    
    // Limiter le nombre d'entrées pour l'optimisation et l'affichage
    const entriesReversed = [...journal]
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .slice(-maxEntries);
    
    return entriesReversed.map(entry => {
      // Format date to readable format (short)
      const date = new Date(entry.created_at);
      const dateFormatee = date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short' 
      });
      
      return {
        date: dateFormatee,
        dateComplete: date.toLocaleDateString('fr-FR', { 
          weekday: 'long',
          day: 'numeric', 
          month: 'long' 
        }),
        points: entry.points || 0,
        streak: entry.streak || 0,
        note: entry.note || 0,
        taux: entry.taux_reussite || 0,
        // Données calculées
        pourcentagePoints: journal.length > 1 
          ? Math.round((entry.points / Math.max(...journal.map(j => j.points || 0))) * 100) 
          : 100
      };
    });
  }, [journal, maxEntries]);

  // Calcul des statistiques pour les tooltips et analyses
  const stats = useMemo(() => {
    if (!donnees || donnees.length === 0) return {
      moyPoints: 0,
      moyStreak: 0,
      moyNote: 0,
      maxPoints: 0,
      maxStreak: 0,
      maxNote: 0,
      tendance: 'stable'
    };
    
    const points = donnees.map(d => d.points);
    const streak = donnees.map(d => d.streak);
    const note = donnees.map(d => d.note);
    
    // Calculs des tendances (sur les dernières entrées)
    let tendancePoints = 'stable';
    if (donnees.length >= 3) {
      const recentPoints = points.slice(-3);
      if (recentPoints[2] > recentPoints[0]) tendancePoints = 'hausse';
      else if (recentPoints[2] < recentPoints[0]) tendancePoints = 'baisse';
    }
    
    return {
      moyPoints: Math.round(points.reduce((a, b) => a + b, 0) / points.length),
      moyStreak: Math.round((streak.reduce((a, b) => a + b, 0) / streak.length) * 10) / 10,
      moyNote: Math.round((note.reduce((a, b) => a + b, 0) / note.length) * 10) / 10,
      maxPoints: Math.max(...points),
      maxStreak: Math.max(...streak),
      maxNote: Math.max(...note),
      tendance: tendancePoints
    };
  }, [donnees]);

  // Formatage personnalisé du tooltip
  const customTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    
    const data = payload[0].payload;
    
    return (
      <div className="p-3 bg-gray-800 text-white rounded-lg shadow-lg border border-gray-700">
        <p className="font-medium">{data.dateComplete}</p>
        <div className="space-y-1 mt-2">
          {activeLines.points && (
            <p className="flex items-center justify-between">
              <span className="text-sm mr-3">Points:</span>
              <span className="font-medium text-purple-300">{data.points}</span>
            </p>
          )}
          {activeLines.streak && (
            <p className="flex items-center justify-between">
              <span className="text-sm mr-3">Streak:</span>
              <span className="font-medium text-amber-300">{data.streak} jour{data.streak > 1 ? 's' : ''}</span>
            </p>
          )}
          {activeLines.note && (
            <p className="flex items-center justify-between">
              <span className="text-sm mr-3">Note:</span>
              <span className="font-medium text-blue-300">{data.note}/10</span>
            </p>
          )}
        </div>
      </div>
    );
  };

  // Toggle pour activer/désactiver les lignes
  const toggleLine = (line) => {
    setActiveLines(prev => ({
      ...prev,
      [line]: !prev[line]
    }));
  };

  // Si aucune donnée, afficher un message
  if (!journal || journal.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 rounded-lg bg-opacity-20 bg-white">
        <div className="w-16 h-16 mb-4 rounded-full bg-white bg-opacity-10 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-lg font-medium text-white">Aucune donnée disponible</p>
        <p className="text-sm text-gray-300 mt-2 max-w-md">
          Valide ta première journée pour commencer à voir ton évolution et tes progrès à travers le temps.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Boutons de toggle pour les lignes */}
      <div className="flex flex-wrap gap-2 mb-2">
        <button
          onClick={() => toggleLine('points')}
          className={`px-2 py-1 text-xs rounded-full transition ${
            activeLines.points 
              ? 'bg-purple-700 text-white' 
              : 'bg-gray-700 text-gray-300'
          }`}
        >
          Points {activeLines.points ? '✓' : ''}
        </button>
        <button
          onClick={() => toggleLine('streak')}
          className={`px-2 py-1 text-xs rounded-full transition ${
            activeLines.streak 
              ? 'bg-amber-700 text-white' 
              : 'bg-gray-700 text-gray-300'
          }`}
        >
          Streak {activeLines.streak ? '✓' : ''}
        </button>
        <button
          onClick={() => toggleLine('note')}
          className={`px-2 py-1 text-xs rounded-full transition ${
            activeLines.note 
              ? 'bg-blue-700 text-white' 
              : 'bg-gray-700 text-gray-300'
          }`}
        >
          Note /10 {activeLines.note ? '✓' : ''}
        </button>
      </div>

      {/* Indicateurs de performance */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {activeLines.points && (
          <div className="bg-purple-900 bg-opacity-30 p-2 rounded-lg text-center">
            <p className="text-xs text-purple-300">Points Moy.</p>
            <p className="font-bold text-white">{stats.moyPoints}</p>
          </div>
        )}
        {activeLines.streak && (
          <div className="bg-amber-900 bg-opacity-30 p-2 rounded-lg text-center">
            <p className="text-xs text-amber-300">Streak Max.</p>
            <p className="font-bold text-white">{stats.maxStreak}j</p>
          </div>
        )}
        {activeLines.note && (
          <div className="bg-blue-900 bg-opacity-30 p-2 rounded-lg text-center">
            <p className="text-xs text-blue-300">Note Moy.</p>
            <p className="font-bold text-white">{stats.moyNote}/10</p>
          </div>
        )}
      </div>

      {/* Graphique principal */}
      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={donnees}
          margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
          />
          
          {activeLines.points && (
            <YAxis 
              yAxisId="left"
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
              domain={[0, 'dataMax + 100']}
            />
          )}
          
          {activeLines.streak && (
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
              domain={[0, 'dataMax + 2']}
            />
          )}
          
          {activeLines.note && (
            <YAxis
              yAxisId="note"
              orientation="right"
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
              domain={[0, 10]}
              allowDataOverflow={true}
              hide={!activeLines.note}
            />
          )}
          
          <Tooltip content={customTooltip} />
          
          <Legend 
            formatter={(value) => (
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                {value === 'points' ? 'Points' : 
                 value === 'streak' ? 'Série de jours' :
                 'Note /10'}
              </span>
            )}
            onClick={(e) => toggleLine(e.dataKey)}
          />
          
          {/* Ligne moyenne pour les points */}
          {activeLines.points && stats.moyPoints > 0 && (
            <ReferenceLine 
              y={stats.moyPoints} 
              yAxisId="left"
              stroke="rgba(168, 85, 247, 0.4)" 
              strokeDasharray="3 3"
              label={{ 
                value: 'Moy.', 
                position: 'insideBottomRight',
                fill: 'rgba(168, 85, 247, 0.8)'
              }}
            />
          )}
          
          {/* Ligne de points */}
          {activeLines.points && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="points"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
              strokeWidth={2}
              dot={{ stroke: '#8884d8', strokeWidth: 2, r: 4, fill: '#8884d8' }}
              animationDuration={1500}
              name="points"
            />
          )}
          
          {/* Ligne de streak */}
          {activeLines.streak && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="streak"
              stroke="#ff9d5c"
              strokeWidth={2}
              dot={{ stroke: '#ff9d5c', strokeWidth: 2, r: 4, fill: '#ff9d5c' }}
              animationDuration={1500}
              name="streak"
            />
          )}
          
          {/* Ligne de note */}
          {activeLines.note && (
            <Line
              yAxisId="note"
              type="monotone"
              dataKey="note"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 4, fill: '#3b82f6' }}
              animationDuration={1500}
              name="note"
            />
          )}
          
          {/* Brosse pour zoom interactif */}
          <Brush 
            dataKey="date" 
            height={30} 
            stroke="#8884d8" 
            onChange={(domain) => setZoomDomain(domain)}
            startIndex={zoomDomain ? zoomDomain.startIndex : undefined}
            endIndex={zoomDomain ? zoomDomain.endIndex : undefined}
          />
        </LineChart>
      </ResponsiveContainer>
      
      {/* Indicateur de tendance */}
      <div className="text-right text-xs text-gray-400">
        Tendance: {' '}
        <span className={
          stats.tendance === 'hausse' ? 'text-green-400' : 
          stats.tendance === 'baisse' ? 'text-red-400' : 
          'text-yellow-400'
        }>
          {stats.tendance === 'hausse' ? '↗ En progression' : 
           stats.tendance === 'baisse' ? '↘ En baisse' : 
           '→ Stable'}
        </span>
      </div>
    </div>
  );
};

export default GraphiqueEvolution;
