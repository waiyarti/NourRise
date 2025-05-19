import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

/**
 * Composant de graphique visualisant l'évolution des points et du streak au fil du temps
 * @param {Object[]} journal - Les entrées du journal de l'utilisateur
 */
const GraphiqueEvolution = ({ journal = [] }) => {
  // Préparation des données pour le graphique (inversées pour avoir l'ordre chronologique)
  const donnees = useMemo(() => {
    // Limit to last 10 entries for better visualization
    const entriesReversed = [...journal].reverse().slice(0, 10);
    
    return entriesReversed.map(entry => {
      // Format date to readable format (short)
      const date = new Date(entry.created_at);
      const dateFormatee = date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short' 
      });
      
      return {
        date: dateFormatee,
        points: entry.points || 0,
        streak: entry.streak || 0,
        note: entry.note || 0,
      };
    });
  }, [journal]);

  // Si aucune donnée, afficher un message
  if (!journal || journal.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <p className="text-lg font-medium">Aucune donnée disponible</p>
        <p className="text-sm text-gray-400 mt-2">
          Valide ta première journée pour voir ton évolution!
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={donnees}
        margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis 
          dataKey="date" 
          tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
        />
        <YAxis 
          yAxisId="left"
          tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
          domain={[0, 'dataMax + 100']}
        />
        <YAxis 
          yAxisId="right" 
          orientation="right" 
          tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
          domain={[0, 'dataMax + 2']}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(30, 30, 30, 0.9)', 
            border: 'none', 
            borderRadius: '8px',
            color: 'white'
          }}
          labelStyle={{ fontWeight: 'bold', marginBottom: '5px' }}
          formatter={(value, name) => [value, name === 'points' ? 'Points' : 'Série']}
        />
        <Legend 
          formatter={(value) => (
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
              {value === 'points' ? 'Points' : 'Série de jours'}
            </span>
          )}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="points"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
          strokeWidth={2}
          dot={{ stroke: '#8884d8', strokeWidth: 2, r: 4, fill: '#8884d8' }}
          animationDuration={1500}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="streak"
          stroke="#ff9d5c"
          strokeWidth={2}
          dot={{ stroke: '#ff9d5c', strokeWidth: 2, r: 4, fill: '#ff9d5c' }}
          animationDuration={1500}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default GraphiqueEvolution;
