import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

/**
 * Composant de graphique visualisant les notes obtenues chaque jour
 * @param {Object[]} journal - Les entrées du journal de l'utilisateur
 */
const GraphiqueNote = ({ journal = [] }) => {
  // Préparation des données pour le graphique
  const donnees = useMemo(() => {
    // Limit to last 7 entries for better visualization
    const entriesLimited = [...journal].slice(0, 7);
    
    return entriesLimited.map(entry => {
      // Format date to readable format
      const date = new Date(entry.created_at);
      const dateFormatee = date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short' 
      });
      
      return {
        date: dateFormatee,
        note: entry.note || 0,
        taux: entry.taux_reussite || 0,
      };
    });
  }, [journal]);

  // Couleur des barres basée sur la note
  const getBarColor = (note) => {
    if (note >= 8) return '#22c55e'; // Vert
    if (note >= 5) return '#f59e0b'; // Orange
    return '#ef4444'; // Rouge
  };

  // Si aucune donnée, afficher un message
  if (!journal || journal.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <p className="text-lg font-medium">Aucune donnée disponible</p>
        <p className="text-sm text-gray-400 mt-2">
          Valide ta première journée pour voir tes notes!
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={donnees}
        margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis 
          dataKey="date" 
          tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
        />
        <YAxis 
          domain={[0, 10]} 
          tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
          ticks={[0, 2, 4, 6, 8, 10]}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(30, 30, 30, 0.9)', 
            border: 'none', 
            borderRadius: '8px',
            color: 'white'
          }}
          labelStyle={{ fontWeight: 'bold', marginBottom: '5px' }}
          formatter={(value, name, props) => {
            if (name === 'note') {
              return [`${value}/10`, 'Note'];
            }
            return [`${value}%`, 'Taux de réussite'];
          }}
        />
        <ReferenceLine y={7} stroke="rgba(255,255,255,0.3)" strokeDasharray="3 3" />
        <Bar 
          dataKey="note" 
          fill="#8884d8"
          radius={[4, 4, 0, 0]}
          animationDuration={1500}
        >
          {donnees.map((entry, index) => (
            <rect
              key={`rect-${index}`}
              fill={getBarColor(entry.note)}
              fillOpacity={0.8}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default GraphiqueNote;
