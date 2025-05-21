import React, { useMemo, useState, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ReferenceLine, Cell
} from 'recharts';

/**
 * @component GraphiqueNote
 * @description Graphique avancé visualisant les notes obtenues au fil du temps
 * avec coloration dynamique, interactions et filtres
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {Array} props.journal - Entrées du journal de l'utilisateur
 * @param {number} props.maxEntries - Nombre maximum d'entrées à afficher
 * @param {boolean} props.comparerTaux - Comparer avec le taux de réussite
 * @param {number} props.objectif - Note objectif à atteindre (ligne de référence)
 * @returns {JSX.Element} Graphique de notes interactif
 */
const GraphiqueNote = ({
  journal = [],
  maxEntries = 7,
  comparerTaux = false,
  objectif = 7
}) => {
  // États pour l'interaction
  const [activeBar, setActiveBar] = useState(null);
  const [zoomActive, setZoomActive] = useState(false);
  
  // Préparation des données pour le graphique avec optimisation
  const donnees = useMemo(() => {
    if (!journal || journal.length === 0) return [];
    
    // Limiter le nombre d'entrées et trier par date
    const entriesLimited = [...journal]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, maxEntries)
      .reverse(); // Ordre chronologique
    
    return entriesLimited.map(entry => {
      // Format date to readable format
      const date = new Date(entry.created_at);
      const dateFormatee = date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short' 
      });
      
      const dateComplete = date.toLocaleDateString('fr-FR', { 
        weekday: 'long',
        day: 'numeric', 
        month: 'long' 
      });
      
      return {
        date: dateFormatee,
        dateComplete: dateComplete,
        note: entry.note || 0,
        taux: entry.taux_reussite || 0,
        // Calculer la différence par rapport à l'objectif
        ecart: (entry.note || 0) - objectif,
        // Déterminer si c'est un weekend
        isWeekend: [0, 6].includes(date.getDay())
      };
    });
  }, [journal, objectif, maxEntries]);
  
  // Statistiques pour l'analyse
  const stats = useMemo(() => {
    if (!donnees || donnees.length === 0) return {
      noteMoyenne: 0,
      tauxMoyen: 0,
      noteMax: 0,
      notesAuDessusObjectif: 0,
      pourcentageObjectifAtteint: 0
    };
    
    const notes = donnees.map(d => d.note);
    const taux = donnees.map(d => d.taux);
    
    const noteMoyenne = Math.round((notes.reduce((a, b) => a + b, 0) / notes.length) * 10) / 10;
    const notesAuDessusObjectif = notes.filter(n => n >= objectif).length;
    
    return {
      noteMoyenne,
      tauxMoyen: Math.round(taux.reduce((a, b) => a + b, 0) / taux.length),
      noteMax: Math.max(...notes),
      notesAuDessusObjectif,
      pourcentageObjectifAtteint: Math.round((notesAuDessusObjectif / notes.length) * 100)
    };
  }, [donnees, objectif]);

  // Couleur des barres basée sur la note
  const getBarColor = (note, isActive = false) => {
    // Version plus vive si la barre est active
    const intensity = isActive ? 1 : 0.8;
    
    if (note >= 8) return `rgba(34, 197, 94, ${intensity})`; // Vert
    if (note >= 5) return `rgba(245, 158, 11, ${intensity})`; // Orange
    return `rgba(239, 68, 68, ${intensity})`; // Rouge
  };

  // Formatage personnalisé du tooltip
  const customTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    
    const data = payload[0].payload;
    const atteintObjectif = data.note >= objectif;
    
    return (
      <div className="p-3 bg-gray-800 text-white rounded-lg shadow-lg border border-gray-700">
        <p className="font-medium">{data.dateComplete}</p>
        <div className="space-y-1 mt-2">
          <p className="flex items-center justify-between">
            <span className="text-sm mr-3">Note:</span>
            <span className={`font-medium ${
              data.note >= 8 ? 'text-green-400' : 
              data.note >= 5 ? 'text-amber-400' : 
              'text-red-400'
            }`}>{data.note}/10</span>
          </p>
          
          {comparerTaux && (
            <p className="flex items-center justify-between">
              <span className="text-sm mr-3">Taux de réussite:</span>
              <span className="font-medium text-blue-400">{data.taux}%</span>
            </p>
          )}
          
          <p className="flex items-center justify-between text-xs mt-1">
            <span>Objectif ({objectif}/10):</span>
            <span className={atteintObjectif ? 'text-green-400' : 'text-red-400'}>
              {atteintObjectif ? 'Atteint ✓' : `Manque ${(objectif - data.note).toFixed(1)}`}
            </span>
          </p>
        </div>
      </div>
    );
  };
  
  // Gestion des événements d'interaction
  const handleMouseEnter = useCallback((data) => {
    setActiveBar(data.date);
  }, []);
  
  const handleMouseLeave = useCallback(() => {
    setActiveBar(null);
  }, []);
  
  const toggleZoom = useCallback(() => {
    setZoomActive(!zoomActive);
  }, [zoomActive]);

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
          Valide ta première journée pour voir tes notes et suivre ta progression!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Statistiques dans des cartes */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div className="bg-indigo-900 bg-opacity-30 p-2 rounded-lg text-center">
          <p className="text-xs text-indigo-300">Note moyenne</p>
          <p className="font-bold text-white">{stats.noteMoyenne}/10</p>
        </div>
        <div className="bg-green-900 bg-opacity-30 p-2 rounded-lg text-center">
          <p className="text-xs text-green-300">Objectif atteint</p>
          <p className="font-bold text-white">{stats.pourcentageObjectifAtteint}%</p>
        </div>
        <div className="bg-amber-900 bg-opacity-30 p-2 rounded-lg text-center">
          <p className="text-xs text-amber-300">Meilleure note</p>
          <p className="font-bold text-white">{stats.noteMax}/10</p>
        </div>
      </div>
      
      {/* Bouton pour activer/désactiver le zoom */}
      <div className="flex justify-end mb-1">
        <button
          onClick={toggleZoom}
          className={`px-2 py-1 text-xs rounded-full transition ${
            zoomActive ? 'bg-purple-700 text-white' : 'bg-gray-700 text-gray-300'
          }`}
        >
          {zoomActive ? 'Vue normale' : 'Zoom sur objectif'}
        </button>
      </div>

      {/* Graphique principal */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={donnees}
          margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
          onMouseMove={(e) => e && e.activePayload && handleMouseEnter(e.activePayload[0].payload)}
          onMouseLeave={handleMouseLeave}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
          />
          <YAxis 
            domain={zoomActive ? [Math.max(0, objectif - 3), Math.min(10, objectif + 3)] : [0, 10]} 
            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
            ticks={zoomActive ? [objectif - 2, objectif, objectif + 2] : [0, 2, 4, 6, 8, 10]}
          />
          <Tooltip content={customTooltip} />
          
          {/* Ligne d'objectif */}
          <ReferenceLine 
            y={objectif} 
            stroke="rgba(255,255,255,0.5)" 
            strokeDasharray="3 3"
            label={{ 
              value: `Objectif: ${objectif}`, 
              position: 'right',
              fill: 'rgba(255,255,255,0.7)',
              fontSize: 10
            }}
          />
          
          {/* Ligne de moyenne */}
          <ReferenceLine 
            y={stats.noteMoyenne} 
            stroke="rgba(129, 140, 248, 0.5)" 
            strokeDasharray="3 3"
            label={{ 
              value: 'Moy.', 
              position: 'left',
              fill: 'rgba(129, 140, 248, 0.7)',
              fontSize: 10
            }}
          />
          
          {/* Barres pour les notes */}
          <Bar 
            dataKey="note" 
            radius={[4, 4, 0, 0]}
            animationDuration={1500}
          >
            {donnees.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={getBarColor(entry.note, activeBar === entry.date)}
                stroke={activeBar === entry.date ? '#fff' : 'transparent'}
                strokeWidth={activeBar === entry.date ? 1 : 0}
                // Style spécial pour les weekends
                opacity={entry.isWeekend ? 0.7 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {/* Légende de couleur */}
      <div className="flex justify-center space-x-4 text-xs text-gray-400 mt-2">
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
          &lt; 5/10
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 rounded-full bg-amber-500 mr-1"></span>
          5-7/10
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
          &gt; 8/10
        </div>
      </div>
    </div>
  );
};

export default GraphiqueNote;
