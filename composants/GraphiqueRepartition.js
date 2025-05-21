/**
 * @file composants/GraphiqueRepartition.js
 * @description Composant de visualisation de données nutritionnelles optimisé pour Vercel
 * @version 2.0.0
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import dynamic from 'next/dynamic';

// Import dynamique des composants Recharts pour optimiser le chargement
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const Sector = dynamic(() => import('recharts').then(mod => mod.Sector), { ssr: false });
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });

/**
 * Composant de visualisation de données nutritionnelles avancé
 * Optimisé pour le déploiement sur Vercel avec Next.js
 */
const GraphiqueRepartition = ({ 
  donnees = [],
  titre = "Répartition nutritionnelle",
  typeDonnees = "nutrition",
  type = "pie",
  hauteur = 400,
  modeSombre = false,
  animationActive = true,
  afficherLegende = true
}) => {
  // États du composant
  const [activeIndex, setActiveIndex] = useState(0);
  const [typeGraphique, setTypeGraphique] = useState(type);
  const [donneesTraitees, setDonneesTraitees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  
  // Vérifier si le code s'exécute côté client pour éviter les erreurs SSR
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Palette de couleurs adaptative selon le mode (sombre/clair)
  const COLORS = modeSombre 
    ? ['#38bdf8', '#60a5fa', '#818cf8', '#a78bfa', '#c084fc', '#e879f9', '#f472b6'] 
    : ['#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];
  
  // Styles adaptés au mode
  const styles = {
    container: `w-full p-4 rounded-xl shadow-lg ${
      modeSombre ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'
    }`,
    title: `text-xl font-bold mb-4 ${
      modeSombre ? 'text-gray-100' : 'text-gray-800'
    }`,
    chartGrid: modeSombre ? '#4b5563' : '#e2e8f0',
    tooltip: {
      backgroundColor: modeSombre ? '#1f2937' : '#fff',
      borderColor: modeSombre ? '#4b5563' : '#e2e8f0',
      textColor: modeSombre ? '#e2e8f0' : '#334155'
    }
  };

  // Préparation des données à l'initialisation et lors des changements
  useEffect(() => {
    // Ne pas exécuter côté serveur
    if (!isClient) return;
    
    setIsLoading(true);
    
    // Délai minimal pour éviter les flashs UI
    const timer = setTimeout(() => {
      if (!donnees || donnees.length === 0) {
        // Générer des données de démonstration si aucune donnée n'est fournie
        const demoData = generateDemoData(typeDonnees);
        setDonneesTraitees(demoData);
      } else {
        // Ajouter des couleurs aux données si elles n'en ont pas
        const dataWithColors = donnees.map((item, index) => ({
          ...item,
          color: item.color || COLORS[index % COLORS.length]
        }));
        setDonneesTraitees(dataWithColors);
      }
      
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [donnees, typeDonnees, COLORS, isClient]);
  
  // Générer des données de démonstration selon le type
  const generateDemoData = (type) => {
    switch(type) {
      case 'nutrition':
        return [
          { name: 'Protéines', value: 25, color: COLORS[0] },
          { name: 'Glucides', value: 45, color: COLORS[1] },
          { name: 'Lipides', value: 20, color: COLORS[2] },
          { name: 'Fibres', value: 10, color: COLORS[3] }
        ];
      case 'activites':
        return [
          { name: 'Cardio', value: 35, color: COLORS[0] },
          { name: 'Musculation', value: 25, color: COLORS[1] },
          { name: 'Étirements', value: 15, color: COLORS[2] },
          { name: 'Marche', value: 25, color: COLORS[3] }
        ];
      case 'repartition_calorique':
        return [
          { name: 'Petit-déjeuner', value: 20, color: COLORS[0] },
          { name: 'Déjeuner', value: 40, color: COLORS[1] },
          { name: 'Goûter', value: 10, color: COLORS[2] },
          { name: 'Dîner', value: 30, color: COLORS[3] }
        ];
      default:
        return [
          { name: 'Catégorie 1', value: 30, color: COLORS[0] },
          { name: 'Catégorie 2', value: 30, color: COLORS[1] },
          { name: 'Catégorie 3', value: 40, color: COLORS[2] }
        ];
    }
  };

  // Gestionnaires d'événements pour le camembert
  const onPieEnter = useCallback((_, index) => {
    setActiveIndex(index);
  }, []);
  
  const onPieLeave = useCallback(() => {
    setActiveIndex(null);
  }, []);

  // Rendu du segment actif du camembert
  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    
    return (
      <g>
        <text x={cx} y={cy - 20} textAnchor="middle" fill={modeSombre ? '#e2e8f0' : '#334155'}>
          {payload.name}
        </text>
        <text x={cx} y={cy + 5} textAnchor="middle" fill={modeSombre ? '#e2e8f0' : '#334155'} className="text-lg font-bold">
          {value}
          <tspan className="text-sm font-normal">
            {typeDonnees === 'nutrition' ? ' kcal' : ''}
          </tspan>
        </text>
        <text x={cx} y={cy + 30} textAnchor="middle" fill={modeSombre ? '#94a3b8' : '#64748b'}>
          {`${(percent * 100).toFixed(1)}%`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          strokeWidth={2}
          stroke={modeSombre ? '#1f2937' : '#ffffff'}
        />
      </g>
    );
  };

  // Formatage des éléments du tooltip
  const formatTooltip = (value, name) => {
    const unit = typeDonnees === 'nutrition' ? ' kcal' : '';
    return [`${value}${unit}`, name];
  };

  // Si côté serveur, retourner un placeholder
  if (!isClient) {
    return (
      <div className={`w-full h-${hauteur} bg-gray-100 rounded-lg animate-pulse`}></div>
    );
  }

  // Rendu de l'état de chargement
  if (isLoading) {
    return (
      <div className={`w-full h-${hauteur} flex items-center justify-center ${
        modeSombre ? 'bg-gray-800 text-gray-200' : 'bg-gray-50 text-gray-800'
      } rounded-lg`}>
        <svg className="animate-spin h-8 w-8 text-blue-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-lg font-medium">Chargement du graphique...</span>
      </div>
    );
  }

  // Rendu pour données vides
  if (!donneesTraitees.length) {
    return (
      <div className={`w-full h-${hauteur} flex flex-col items-center justify-center ${
        modeSombre ? 'bg-gray-800 text-gray-200' : 'bg-gray-50 text-gray-800'
      } rounded-lg`}>
        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <h3 className="text-lg font-medium mb-2">Aucune donnée disponible</h3>
        <p className="text-sm text-gray-500 max-w-md text-center">
          Ajoutez des données pour voir apparaître le graphique de répartition.
        </p>
      </div>
    );
  }

  // Rendu du graphique selon le type
  const renderGraph = () => {
    switch (typeGraphique) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={hauteur}>
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={donneesTraitees}
                cx="50%"
                cy="50%"
                innerRadius={hauteur / 5}
                outerRadius={hauteur / 3}
                dataKey="value"
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                animationDuration={animationActive ? 1000 : 0}
                animationBegin={0}
              >
                {donneesTraitees.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color || COLORS[index % COLORS.length]} 
                    stroke={modeSombre ? '#1f2937' : '#ffffff'}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              {afficherLegende && (
                <Legend 
                  verticalAlign="bottom" 
                  align="center"
                  layout="horizontal"
                  iconType="circle"
                  iconSize={10}
                  wrapperStyle={{ 
                    paddingTop: 20,
                    color: modeSombre ? '#e2e8f0' : '#334155',
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }} 
                />
              )}
              <Tooltip 
                formatter={formatTooltip}
                contentStyle={{ 
                  backgroundColor: styles.tooltip.backgroundColor,
                  borderColor: styles.tooltip.borderColor,
                  color: styles.tooltip.textColor,
                  borderRadius: '0.375rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={hauteur}>
            <LineChart
              data={donneesTraitees}
              margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={styles.chartGrid} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: modeSombre ? '#e2e8f0' : '#334155' }}
              />
              <YAxis 
                tick={{ fill: modeSombre ? '#e2e8f0' : '#334155' }}
              />
              <Tooltip
                formatter={formatTooltip}
                contentStyle={{ 
                  backgroundColor: styles.tooltip.backgroundColor,
                  borderColor: styles.tooltip.borderColor,
                  color: styles.tooltip.textColor,
                  borderRadius: '0.375rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              />
              {afficherLegende && (
                <Legend 
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ 
                    color: modeSombre ? '#e2e8f0' : '#334155',
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }}
                />
              )}
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={COLORS[0]} 
                strokeWidth={3}
                dot={{ stroke: COLORS[0], strokeWidth: 2, fill: modeSombre ? '#1f2937' : '#ffffff', r: 5 }}
                activeDot={{ r: 8 }}
                animationDuration={animationActive ? 1500 : 0}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={hauteur}>
            <AreaChart
              data={donneesTraitees}
              margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={styles.chartGrid} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: modeSombre ? '#e2e8f0' : '#334155' }}
              />
              <YAxis 
                tick={{ fill: modeSombre ? '#e2e8f0' : '#334155' }}
              />
              <Tooltip
                formatter={formatTooltip}
                contentStyle={{ 
                  backgroundColor: styles.tooltip.backgroundColor,
                  borderColor: styles.tooltip.borderColor,
                  color: styles.tooltip.textColor,
                  borderRadius: '0.375rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              />
              {afficherLegende && (
                <Legend 
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ 
                    color: modeSombre ? '#e2e8f0' : '#334155',
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }}
                />
              )}
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={COLORS[0]} 
                fill={COLORS[0]} 
                fillOpacity={0.2}
                animationDuration={animationActive ? 1500 : 0}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  // Rendu final du composant
  return (
    <div className={styles.container}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={styles.title}>{titre}</h2>
        
        {/* Sélecteur de type de graphique */}
        <div className={`inline-flex rounded-md shadow-sm ${
          modeSombre ? 'bg-gray-700' : 'bg-gray-100'
        } p-1`}>
          <button
            type="button"
            onClick={() => setTypeGraphique('pie')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              typeGraphique === 'pie' 
                ? 'bg-blue-600 text-white' 
                : `${modeSombre ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
            } transition-colors`}
          >
            Camembert
          </button>
          <button
            type="button"
            onClick={() => setTypeGraphique('line')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              typeGraphique === 'line' 
                ? 'bg-blue-600 text-white' 
                : `${modeSombre ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
            } transition-colors`}
          >
            Ligne
          </button>
          <button
            type="button"
            onClick={() => setTypeGraphique('area')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              typeGraphique === 'area' 
                ? 'bg-blue-600 text-white' 
                : `${modeSombre ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
            } transition-colors`}
          >
            Aire
          </button>
        </div>
      </div>
      
      {/* Graphique */}
      {renderGraph()}
      
      {/* Légende explicative */}
      <div className={`mt-4 text-sm ${modeSombre ? 'text-gray-400' : 'text-gray-500'}`}>
        <p className="italic">
          {typeGraphique === 'pie' 
            ? 'Cliquez sur un segment pour voir plus de détails.' 
            : 'Survolez les points pour voir les valeurs exactes.'}
        </p>
      </div>
    </div>
  );
};

// Mémoisation du composant pour de meilleures performances
export default memo(GraphiqueRepartition);
