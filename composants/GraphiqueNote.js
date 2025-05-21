import React, { useMemo, useState, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ReferenceLine, Cell, Legend,
  Brush, Line, ComposedChart
} from 'recharts';
import { format, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * @component GraphiqueNote
 * @description Visualisation avancée des notes quotidiennes avec analyse de performance
 * et comparaison avec le taux de réussite
 * 
 * @param {Object} props - Propriétés du composant
 * @param {Array} props.journal - Entrées du journal de l'utilisateur
 * @param {string} props.periode - Période d'affichage ('7j', '30j', '90j', 'tout')
 * @param {boolean} props.afficherObjectif - Afficher une ligne d'objectif
 * @param {number} props.objectifNote - Valeur de l'objectif de note (0-10)
 * @param {boolean} props.comparerTaux - Comparer avec le taux de réussite
 * @param {boolean} props.modeSombre - Utiliser le mode sombre
 * @param {boolean} props.modeGroupeParSemaine - Grouper par semaine plutôt que par jour
 * @returns {JSX.Element} Graphique de notes interactif
 */
const GraphiqueNote = ({
  journal = [],
  periode = '7j',
  afficherObjectif = true,
  objectifNote = 7,
  comparerTaux = true,
  modeSombre = false,
  modeGroupeParSemaine = false
}) => {
  // États pour interactivité
  const [hoverData, setHoverData] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [showWeeklyAverage, setShowWeeklyAverage] = useState(false);
  
  // Nombre d'entrées à afficher selon la période
  const nbEntrees = useMemo(() => {
    switch(periode) {
      case '7j': return 7;
      case '30j': return 30;
      case '90j': return 90;
      default: return journal.length;
    }
  }, [periode, journal.length]);
  
  // Préparation des données brutes du graphique
  const donneesJournalieres = useMemo(() => {
    if (!journal || journal.length === 0) return [];
    
    // Limitation au nombre d'entrées selon la période
    const entriesLimited = [...journal].slice(0, nbEntrees);
    
    return entriesLimited.map(entry => {
      // Formatage de la date
      const date = parseISO(entry.created_at);
      const dateFormatee = format(date, 'd MMM', { locale: fr });
      
      // Formatage de la semaine pour regroupement
      const debutSemaine = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const finSemaine = format(endOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const semaine = `${format(startOfWeek(date, { weekStartsOn: 1 }), 'd MMM', { locale: fr })} - ${format(endOfWeek(date, { weekStartsOn: 1 }), 'd MMM', { locale: fr })}`;
      
      return {
        date: dateFormatee,
        dateComplete: format(date, 'EEEE d MMMM yyyy', { locale: fr }),
        timestamp: date.getTime(),
        note: entry.note || 0,
        taux: entry.taux_reussite || 0,
        points: entry.points || 0,
        semaine,
        debutSemaine,
        finSemaine,
        isWeekend: [0, 6].includes(date.getDay())
      };
    });
  }, [journal, nbEntrees]);
  
  // Groupement par semaine si mode activé
  const donnees = useMemo(() => {
    if (!modeGroupeParSemaine) return donneesJournalieres;
    
    // Regroupement des données par semaine
    const semainesMap = new Map();
    
    donneesJournalieres.forEach(jour => {
      if (!semainesMap.has(jour.semaine)) {
        semainesMap.set(jour.semaine, {
          semaine: jour.semaine,
          debutSemaine: jour.debutSemaine,
          finSemaine: jour.finSemaine,
          notes: [],
          taux: [],
          points: []
        });
      }
      
      const semaine = semainesMap.get(jour.semaine);
      semaine.notes.push(jour.note);
      semaine.taux.push(jour.taux);
      semaine.points.push(jour.points);
    });
    
    // Calcul des moyennes par semaine
    return Array.from(semainesMap.values()).map(semaine => ({
      date: semaine.semaine,
      dateComplete: `Semaine du ${format(parseISO(semaine.debutSemaine), 'd MMMM', { locale: fr })} au ${format(parseISO(semaine.finSemaine), 'd MMMM', { locale: fr })}`,
      note: Math.round(semaine.notes.reduce((a, b) => a + b, 0) / semaine.notes.length * 10) / 10,
      taux: Math.round(semaine.taux.reduce((a, b) => a + b, 0) / semaine.taux.length),
      points: Math.round(semaine.points.reduce((a, b) => a + b, 0) / semaine.points.length),
      nbJours: semaine.notes.length,
      debutSemaine: semaine.debutSemaine,
      finSemaine: semaine.finSemaine
    }));
  }, [donneesJournalieres, modeGroupeParSemaine]);
  
  // Calcul des statistiques générales
  const stats = useMemo(() => {
    if (!donnees || donnees.length === 0) return {
      moyenneNote: 0,
      moyenneTaux: 0,
      joursMeilleurNote: [],
      tendance: 'stable'
    };
    
    const notes = donnees.map(d => d.note);
    const taux = donnees.map(d => d.taux);
    
    // Calcul des moyennes
    const moyenneNote = Math.round(notes.reduce((a, b) => a + b, 0) / notes.length * 10) / 10;
    const moyenneTaux = Math.round(taux.reduce((a, b) => a + b, 0) / taux.length);
    
    // Meilleurs jours
    const noteMax = Math.max(...notes);
    const joursMeilleurNote = donnees
      .filter(jour => jour.note === noteMax)
      .map(jour => jour.dateComplete);
    
    // Calcul de tendance (sur les 5 dernières entrées s'il y en a assez)
    let tendance = 'stable';
    if (donnees.length >= 5) {
      const dernieresNotes = donnees.slice(0, 5).map(d => d.note);
      const variation = dernieresNotes[0] - dernieresNotes[dernieresNotes.length - 1];
      
      if (variation > 1) tendance = 'hausse';
      else if (variation < -1) tendance = 'baisse';
    }
    
    return { moyenneNote, moyenneTaux, joursMeilleurNote, tendance };
  }, [donnees]);
  
  // Détermine la couleur de la barre selon la note
  const getBarColor = (note) => {
    if (note >= 8) return modeSombre ? '#22c55e' : '#22c55e'; // Vert
    if (note >= 5) return modeSombre ? '#f59e0b' : '#f59e0b'; // Orange
    return modeSombre ? '#ef4444' : '#ef4444'; // Rouge
  };
  
  // Format personnalisé pour le tooltip
  const customTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    
    const data = payload[0].payload;
    
    return (
      <div className={`p-3 rounded-lg shadow-lg ${modeSombre ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border ${modeSombre ? 'border-gray-700' : 'border-gray-200'}`}>
        <p className="font-medium">{data.dateComplete}</p>
        <div className="space-y-1 mt-2">
          <p className="flex items-center justify-between">
            <span className="text-sm mr-3">Note:</span>
            <span className={`font-medium ${
              data.note >= 8 ? 'text-green-500' : 
              data.note >= 5 ? 'text-amber-500' : 
              'text-red-500'
            }`}>{data.note}/10</span>
          </p>
          <p className="flex items-center justify-between">
            <span className="text-sm mr-3">Taux de réussite:</span>
            <span className="font-medium text-blue-500">{data.taux}%</span>
          </p>
          {modeGroupeParSemaine && (
            <p className="flex items-center justify-between">
              <span className="text-sm mr-3">Jours comptabilisés:</span>
              <span className="font-medium">{data.nbJours}</span>
            </p>
          )}
        </div>
      </div>
    );
  };
  
  // Gestion des événements de survol
  const handleMouseOver = useCallback((data) => {
    setHoverData(data);
  }, []);
  
  const handleMouseLeave = useCallback(() => {
    setHoverData(null);
  }, []);
  
  // Gestion des événements de clic sur semaine
  const handleWeekClick = useCallback((data) => {
    if (modeGroupeParSemaine) {
      setSelectedWeek(selectedWeek === data.date ? null : data.date);
    }
  }, [modeGroupeParSemaine, selectedWeek]);
  
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
          Valide ta première journée pour commencer à voir tes notes!
          Le graphique s'actualisera automatiquement.
        </p>
        <button 
          className={`mt-4 px-4 py-2 rounded-lg ${
            modeSombre ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
          } text-white transition-colors`}
          onClick={() => window.scrollTo(0, 0)}
        >
          Valider une journée
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* En-tête avec statistiques */}
      <div className={`flex flex-wrap justify-between items-center ${modeSombre ? 'text-gray-300' : 'text-gray-700'}`}>
        <div className="mb-2">
          <span className="text-sm font-medium opacity-80">
            {modeGroupeParSemaine ? 'Vue par semaine' : 'Vue par jour'} • 
            {stats.tendance === 'hausse' ? (
              <span className="text-green-500"> En progression</span>
            ) : stats.tendance === 'baisse' ? (
              <span className="text-red-500"> En baisse</span>
            ) : (
              <span className="text-yellow-500"> Stable</span>
            )}
          </span>
        </div>
        
        <div className="flex space-x-2 mb-2">
          <div className={`px-3 py-1 rounded-lg text-center ${
            modeSombre ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div className="text-xs opacity-70">Moyenne</div>
            <div className={`font-bold ${
              stats.moyenneNote >= 8 ? 'text-green-500' : 
              stats.moyenneNote >= 5 ? 'text-amber-500' : 
              'text-red-500'
            }`}>{stats.moyenneNote}/10</div>
          </div>
          
          <div className={`px-3 py-1 rounded-lg text-center ${
            modeSombre ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div className="text-xs opacity-70">Taux moyen</div>
            <div className="font-bold text-blue-500">{stats.moyenneTaux}%</div>
          </div>
        </div>
      </div>
      
      {/* Graphique principal */}
      <ResponsiveContainer width="100%" height={350}>
        {comparerTaux ? (
          <ComposedChart
            data={donnees}
            margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
            onMouseEnter={handleMouseOver}
            onMouseLeave={handleMouseLeave}
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
            />
            
            <YAxis 
              yAxisId="left"
              tick={{ 
                fill: modeSombre ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)', 
                fontSize: 12 
              }}
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
              axisLine={{ stroke: modeSombre ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}
              tickLine={{ stroke: modeSombre ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}
              label={{ 
                value: 'Note /10', 
                angle: -90, 
                position: 'insideLeft',
                style: { 
                  textAnchor: 'middle',
                  fill: modeSombre ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                  fontSize: 10
                }
              }}
            />
            
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ 
                fill: modeSombre ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)', 
                fontSize: 12 
              }}
              domain={[0, 100]}
              axisLine={{ stroke: modeSombre ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}
              tickLine={{ stroke: modeSombre ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}
              label={{ 
                value: 'Taux %', 
                angle: 90, 
                position: 'insideRight',
                style: { 
                  textAnchor: 'middle',
                  fill: modeSombre ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                  fontSize: 10
                }
              }}
            />
            
            <Tooltip content={customTooltip} />
            
            <Legend 
              verticalAlign="top"
              height={36}
              formatter={(value) => (
                <span style={{ 
                  color: modeSombre ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)', 
                  fontSize: '14px' 
                }}>
                  {value === 'note' ? 'Note /10' : 'Taux de réussite %'}
                </span>
              )}
            />
            
            {/* Ligne d'objectif */}
            {afficherObjectif && (
              <ReferenceLine 
                y={objectifNote} 
                yAxisId="left"
                stroke={modeSombre ? "rgba(130, 190, 255, 0.5)" : "rgba(59, 130, 246, 0.5)"} 
                strokeDasharray="3 3"
                label={{ 
                  value: `Objectif: ${objectifNote}`, 
                  position: 'insideBottomLeft',
                  fill: modeSombre ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                  fontSize: 10
                }}
              />
            )}
            
            {/* Ligne moyenne */}
            <ReferenceLine 
              y={stats.moyenneNote} 
              yAxisId="left"
              stroke={modeSombre ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)"} 
              strokeDasharray="3 3"
              label={{ 
                value: 'Moy.', 
                position: 'insideBottomRight',
                fill: modeSombre ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                fontSize: 10
              }}
            />
            
            {/* Barres pour notes */}
            <Bar 
              yAxisId="left"
              dataKey="note" 
              fill="#8884d8"
              onClick={handleWeekClick}
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            >
              {donnees.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={getBarColor(entry.note)}
                  fillOpacity={selectedWeek === entry.date ? 1 : 0.8}
                  stroke={selectedWeek === entry.date ? '#fff' : 'none'}
                  strokeWidth={selectedWeek === entry.date ? 2 : 0}
                  cursor={modeGroupeParSemaine ? 'pointer' : 'default'}
                />
              ))}
            </Bar>
            
            {/* Ligne pour taux de réussite */}
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="taux" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ 
                r: 4, 
                stroke: '#3b82f6', 
                strokeWidth: 1,
                fill: modeSombre ? '#1f2937' : '#ffffff' 
              }}
            />
          </ComposedChart>
        ) : (
          <BarChart
            data={donnees}
            margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
            onMouseEnter={handleMouseOver}
            onMouseLeave={handleMouseLeave}
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
            />
            
            <YAxis 
              domain={[0, 10]} 
              tick={{ 
                fill: modeSombre ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)', 
                fontSize: 12 
              }}
              ticks={[0, 2, 4, 6, 8, 10]}
              axisLine={{ stroke: modeSombre ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}
            />
            
            <Tooltip content={customTooltip} />
            
            {/* Ligne d'objectif */}
            {afficherObjectif && (
              <ReferenceLine 
                y={objectifNote} 
                stroke={modeSombre ? "rgba(130, 190, 255, 0.5)" : "rgba(59, 130, 246, 0.5)"} 
                strokeDasharray="3 3"
                label={{ 
                  value: `Objectif: ${objectifNote}`, 
                  position: 'insideBottomLeft',
                  fill: modeSombre ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                  fontSize: 10
                }}
              />
            )}
            
            {/* Ligne moyenne */}
            <ReferenceLine 
              y={stats.moyenneNote} 
              stroke={modeSombre ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)"} 
              strokeDasharray="3 3"
              label={{ 
                value: 'Moy.', 
                position: 'insideBottomRight',
                fill: modeSombre ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                fontSize: 10
              }}
            />
            
            <Bar 
              dataKey="note" 
              fill="#8884d8"
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
              onClick={handleWeekClick}
            >
              {donnees.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={getBarColor(entry.note)}
                  fillOpacity={selectedWeek === entry.date ? 1 : 0.8}
                  stroke={selectedWeek === entry.date ? '#fff' : 'none'}
                  strokeWidth={selectedWeek === entry.date ? 2 : 0}
                  cursor={modeGroupeParSemaine ? 'pointer' : 'default'}
                />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
      
      {/* Options interactives */}
      <div className="flex flex-wrap justify-between items-center">
        <div className="flex space-x-2 mb-2">
          <button
            onClick={() => setShowWeeklyAverage(!showWeeklyAverage)}
            className={`px-3 py-1 text-xs rounded-full transition ${
              showWeeklyAverage 
                ? `${modeSombre ? 'bg-blue-700 text-white' : 'bg-blue-600 text-white'}`
                : `${modeSombre ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`
            }`}
          >
            {showWeeklyAverage ? 'Masquer moyennes' : 'Afficher moyennes'}
          </button>
          
          <button
            onClick={() => window.location.href = `?modeGroupeParSemaine=${!modeGroupeParSemaine}`}
            className={`px-3 py-1 text-xs rounded-full transition ${
              modeGroupeParSemaine 
                ? `${modeSombre ? 'bg-green-700 text-white' : 'bg-green-600 text-white'}`
                : `${modeSombre ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`
            }`}
          >
            {modeGroupeParSemaine ? 'Vue par jour' : 'Vue par semaine'}
          </button>
        </div>
        
        <div className="text-xs opacity-75">
          {hoverData ? 
            `Détails pour ${hoverData.date}` : 
            selectedWeek ? 
            `Semaine sélectionnée: ${selectedWeek}` : 
            `${donnees.length} entrées affichées`
          }
        </div>
      </div>
      
      {/* Section des meilleurs jours si disponible */}
      {stats.joursMeilleurNote.length > 0 && (
        <div className={`mt-4 p-3 rounded-lg ${
          modeSombre ? 'bg-gray-700 bg-opacity-50' : 'bg-gray-100'
        }`}>
          <p className="text-sm font-medium mb-1">Meilleure(s) note(s):</p>
          <div className="flex flex-wrap gap-2">
            {stats.joursMeilleurNote.slice(0, 3).map((jour, idx) => (
              <span 
                key={idx} 
                className={`text-xs px-2 py-1 rounded-full ${
                  modeSombre ? 'bg-green-900 text-green-100' : 'bg-green-100 text-green-800'
                }`}
              >
                {jour}
              </span>
            ))}
            {stats.joursMeilleurNote.length > 3 && (
              <span className="text-xs opacity-75">
                +{stats.joursMeilleurNote.length - 3} autre(s)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphiqueNote;
