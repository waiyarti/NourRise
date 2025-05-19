import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

/**
 * Composant de graphique visualisant la répartition des tâches accomplies vs restantes
 * @param {Object[]} taches - Liste des tâches
 * @param {number} total - Nombre total de tâches
 * @param {number} faites - Nombre de tâches accomplies
 */
const GraphiqueRepartition = ({ taches = [], total = 0, faites = 0 }) => {
  // Préparation des données pour le graphique
  const donnees = useMemo(() => {
    // Si pas de tâches, retourner un jeu de données vide
    if (!taches || taches.length === 0) {
      return [
        { name: 'Aucune tâche', value: 1, color: '#6b7280' }
      ];
    }

    // Calcul des points potentiels par coefficient
    const pointsParCoefficient = [0, 0, 0]; // indices 0, 1, 2 pour coefficients 1, 2, 3
    const pointsFaitsParCoefficient = [0, 0, 0];
    
    taches.forEach(tache => {
      const coef = (tache.coefficient || 1) - 1; // 0-indexed
      pointsParCoefficient[coef] += 1;
      if (tache.fait) {
        pointsFaitsParCoefficient[coef] += 1;
      }
    });
    
    const result = [];
    
    // Ajouter les tâches faites par coefficient
    if (pointsFaitsParCoefficient[0] > 0) {
      result.push({ 
        name: 'Tâches standards faites', 
        value: pointsFaitsParCoefficient[0], 
        color: '#22c55e'  // Vert 
      });
    }
    
    if (pointsFaitsParCoefficient[1] > 0) {
      result.push({ 
        name: 'Tâches importantes faites', 
        value: pointsFaitsParCoefficient[1], 
        color: '#16a34a'  // Vert foncé
      });
    }
    
    if (pointsFaitsParCoefficient[2] > 0) {
      result.push({ 
        name: 'Tâches critiques faites', 
        value: pointsFaitsParCoefficient[2], 
        color: '#15803d'  // Vert très foncé
      });
    }
    
    // Ajouter les tâches non faites par coefficient
    if (pointsParCoefficient[0] - pointsFaitsParCoefficient[0] > 0) {
      result.push({ 
        name: 'Tâches standards à faire', 
        value: pointsParCoefficient[0] - pointsFaitsParCoefficient[0], 
        color: '#ef4444'  // Rouge
      });
    }
    
    if (pointsParCoefficient[1] - pointsFaitsParCoefficient[1] > 0) {
      result.push({ 
        name: 'Tâches importantes à faire', 
        value: pointsParCoefficient[1] - pointsFaitsParCoefficient[1], 
        color: '#dc2626'  // Rouge foncé
      });
    }
    
    if (pointsParCoefficient[2] - pointsFaitsParCoefficient[2] > 0) {
      result.push({ 
        name: 'Tâches critiques à faire', 
        value: pointsParCoefficient[2] - pointsFaitsParCoefficient[2], 
        color: '#b91c1c'  // Rouge très foncé
      });
    }
    
    return result;
  }, [taches]);

  // Si aucune tâche, afficher un message
  if (!taches || taches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <p className="text-lg font-medium">Aucune tâche disponible</p>
        <p className="text-sm text-gray-400 mt-2">
          Ajoute tes premières tâches pour voir leur répartition!
        </p>
      </div>
    );
  }

  // Calcul du taux de complétion pour l'affichage central
  const tauxCompletion = total > 0 ? Math.round((faites / total) * 100) : 0;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={donnees}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
          animationDuration={1000}
          animationBegin={200}
        >
          {donnees.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={1} stroke="rgba(255,255,255,0.2)" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ 
            backgroundColor: 'rgba(30, 30, 30, 0.9)', 
            border: 'none', 
            borderRadius: '8px',
            color: 'white'
          }}
          formatter={(value, name) => [value, name]}
        />
        <Legend 
          verticalAlign="bottom" 
          layout="horizontal"
          formatter={(value, entry, index) => (
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
              {value}
            </span>
          )}
        />
        
        {/* Texte au centre du donut pour le taux de complétion */}
        <text 
          x="50%" 
          y="50%" 
          textAnchor="middle" 
          dominantBaseline="middle"
          className="text-xl font-bold"
          fill="white"
        >
          {tauxCompletion}%
        </text>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default GraphiqueRepartition;
