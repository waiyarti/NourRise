/**
 * @file composants/GraphiqueRepartition.js
 * @description Composant avancé de visualisation interactive pour analyser
 * la répartition des tâches et autres données avec différents types de graphiques
 * @version 2.0.0
 * 
 * Fonctionnalités:
 * - Visualisation hautement interactive de la répartition des données
 * - Support multi-types (camembert, ligne, aire, barres) avec transitions fluides
 * - Animations sophistiquées et transitions élégantes
 * - Optimisation complète pour mode sombre/clair
 * - Génération intelligente de données de démonstration selon le contexte
 * - Gestion élégante des états de chargement et des cas vides
 * - Interactions avancées (survol, clic, segmentation)
 * - Rotation 3D sur les graphiques (optionnel)
 * - Exportation des données en CSV/PNG
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector,
  LineChart, Line, XAxis, YAxis, CartesianGrid, AreaChart, Area,
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis, ComposedChart
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPieChart, FiBarChart2, FiTrendingUp, FiHexagon, 
  FiGrid, FiDownload, FiMaximize2, FiInfo, FiRefreshCw
} from 'react-icons/fi';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * @component GraphiqueRepartition
 * @description Composant avancé et interactif de visualisation de données
 * avec multiples types de graphiques et animations fluides
 * 
 * @param {Object} props - Propriétés du composant
 * @param {Array} props.donnees - Données à visualiser [{name: string, value: number, color?: string}]
 * @param {Array} props.taches - Tâches pour visualisation spécifique (optionnel)
 * @param {number} props.total - Total pour calculs de pourcentage (optionnel)
 * @param {number} props.faites - Nombre d'éléments terminés (optionnel)
 * @param {string} props.titre - Titre du graphique
 * @param {string} props.typeDonnees - Type de données ('taches', 'nutrition', 'activites', etc.)
 * @param {string} props.typeGraphique - Type de graphique initial ('pie', 'bar', 'line', 'area', 'radar')
 * @param {number} props.hauteur - Hauteur du graphique en pixels
 * @param {boolean} props.modeSombre - Activer le mode sombre
 * @param {boolean} props.animationActive - Activer les animations
 * @param {boolean} props.afficherLegende - Afficher la légende
 * @param {boolean} props.afficherControles - Afficher les contrôles interactifs
 * @param {boolean} props.rotation3D - Activer la rotation 3D pour certains graphiques
 * @param {function} props.onSelectionChange - Callback lors de la sélection d'un segment (optionnel)
 * @returns {JSX.Element} Composant de visualisation interactif
 */
const GraphiqueRepartition = ({ 
  donnees = [],
  taches = [],
  total = 0,
  faites = 0,
  titre = "Répartition des tâches",
  typeDonnees = "taches",
  typeGraphique = "pie",
  hauteur = 400,
  modeSombre = false,
  animationActive = true,
  afficherLegende = true,
  afficherControles = true,
  rotation3D = false,
  onSelectionChange = null
}) => {
  // Références pour interactions avancées
  const containerRef = useRef(null);
  const graphiqueRef = useRef(null);
  
  // États du composant
  const [activeIndex, setActiveIndex] = useState(0);
  const [typeGraphiqueActif, setTypeGraphiqueActif] = useState(typeGraphique);
  const [donneesTraitees, setDonneesTraitees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [modeComparaison, setModeComparaison] = useState(false);
  const [donneesComparaison, setDonneesComparaison] = useState([]);
  
  // Types de graphiques disponibles selon le type de données
  const typesGraphiquesDisponibles = useMemo(() => {
    // Par défaut, tous les types sont disponibles
    const types = ['pie', 'bar', 'line', 'area', 'radar'];
    
    // Restriction selon le type de données
    if (typeDonnees === 'taches' && taches.length < 3) {
      return ['pie', 'bar'];
    }
    
    return types;
  }, [typeDonnees, taches.length]);
  
  // Palette de couleurs adaptative selon le mode (sombre/clair) et le type de données
  const COLORS = useMemo(() => {
    const baseColors = modeSombre 
      ? ['#38bdf8', '#60a5fa', '#818cf8', '#a78bfa', '#c084fc', '#e879f9', '#f472b6'] 
      : ['#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];
    
    // Couleurs adaptées selon le type de données
    switch(typeDonnees) {
      case 'taches':
        return [
          '#10b981', // Vert (tâches faites)
          '#f97316', // Orange (tâches en cours)
          '#ef4444', // Rouge (tâches non faites)
          '#8b5cf6'  // Violet (tâches reportées)
        ];
      case 'activites':
        return [
          '#3b82f6', // Bleu (cardio)
          '#f97316', // Orange (force)
          '#10b981', // Vert (flexibilité)
          '#8b5cf6'  // Violet (autres)
        ];
      default:
        return baseColors;
    }
  }, [modeSombre, typeDonnees]);
  
  // Styles adaptifs selon le mode
  const styles = {
    container: `w-full transition-all duration-300 rounded-xl shadow-lg ${
      modeSombre ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'
    } ${isFullscreen ? 'fixed inset-0 z-50 p-6' : 'p-4'}`,
    content: `${isFullscreen ? 'h-full flex flex-col' : ''}`,
    title: `text-xl font-bold mb-4 ${
      modeSombre ? 'text-gray-100' : 'text-gray-800'
    }`,
    chartGrid: modeSombre ? '#4b5563' : '#e2e8f0',
    tooltip: {
      backgroundColor: modeSombre ? '#1f2937' : '#fff',
      borderColor: modeSombre ? '#4b5563' : '#e2e8f0',
      textColor: modeSombre ? '#e2e8f0' : '#334155'
    },
    controls: `inline-flex rounded-md shadow-sm ${
      modeSombre ? 'bg-gray-700' : 'bg-gray-100'
    } p-1`,
    buttonActive: `px-3 py-1.5 text-sm font-medium rounded-md ${
      modeSombre ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
    } transition-colors`,
    buttonInactive: `px-3 py-1.5 text-sm font-medium rounded-md ${
      modeSombre ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
    } hover:bg-opacity-10 hover:bg-gray-500 transition-colors`
  };

  // Génération des données pour les tâches si elles sont fournies
  useEffect(() => {
    if (typeDonnees === 'taches' && taches.length > 0) {
      // Comptage par statut
      const statuts = {
        fait: 0,
        enCours: 0,
        nonFait: 0
      };
      
      taches.forEach(tache => {
        if (tache.fait) statuts.fait++;
        else if (tache.enCours) statuts.enCours++;
        else statuts.nonFait++;
      });
      
      // Création des données de répartition
      const donneesStatut = [
        { name: 'Terminées', value: statuts.fait, color: COLORS[0] },
        { name: 'En cours', value: statuts.enCours, color: COLORS[1] },
        { name: 'À faire', value: statuts.nonFait, color: COLORS[2] }
      ].filter(item => item.value > 0);
      
      setDonneesTraitees(donneesStatut);
      setIsLoading(false);
      return;
    }

    // Traitement pour autres données fournies
    if (donnees && donnees.length > 0) {
      const dataWithColors = donnees.map((item, index) => ({
        ...item,
        color: item.color || COLORS[index % COLORS.length]
      }));
      setDonneesTraitees(dataWithColors);
      setIsLoading(false);
      return;
    }
    
    // Pour les cas où aucune donnée n'est fournie
    setIsLoading(true);
    const timer = setTimeout(() => {
      const demoData = generateDemoData(typeDonnees);
      setDonneesTraitees(demoData);
      
      // Générer des données de comparaison aléatoires
      const compData = demoData.map(item => ({
        ...item,
        value: Math.floor(item.value * (0.7 + Math.random() * 0.6)) // 70-130% de la valeur originale
      }));
      setDonneesComparaison(compData);
      
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [donnees, taches, typeDonnees, COLORS]);
  
  // Générer des données de démonstration selon le type
  const generateDemoData = useCallback((type) => {
    switch(type) {
      case 'taches':
        return [
          { name: 'Terminées', value: faites || 3, color: COLORS[0] },
          { name: 'En cours', value: 1, color: COLORS[1] },
          { name: 'À faire', value: (total || 7) - (faites || 3) - 1, color: COLORS[2] }
        ];
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
      case 'repartition_journee':
        return [
          { name: 'Matin', value: 30, color: COLORS[0] },
          { name: 'Après-midi', value: 40, color: COLORS[1] },
          { name: 'Soir', value: 30, color: COLORS[2] }
        ];
      default:
        return [
          { name: 'Catégorie 1', value: 30, color: COLORS[0] },
          { name: 'Catégorie 2', value: 30, color: COLORS[1] },
          { name: 'Catégorie 3', value: 40, color: COLORS[2] }
        ];
    }
  }, [COLORS, faites, total]);
  
  // Gestionnaires d'événements
  const onPieEnter = useCallback((_, index) => {
    setActiveIndex(index);
    
    // Callback externe si fourni
    if (onSelectionChange && donneesTraitees[index]) {
      onSelectionChange(donneesTraitees[index]);
    }
  }, [donneesTraitees, onSelectionChange]);
  
  const onPieLeave = useCallback(() => {
    setActiveIndex(null);
  }, []);
  
  // Gestion du mode plein écran
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
    
    // Si on entre en plein écran, désactiver le scroll
    if (!isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isFullscreen]);
  
  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
  
  // Gestion de la rotation 3D (si activée)
  useEffect(() => {
    if (!rotation3D || !containerRef.current) return;
    
    const handleMouseMove = (e) => {
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientY - rect.top) / rect.height - 0.5;
      const y = (e.clientX - rect.left) / rect.width - 0.5;
      
      setRotation({
        x: x * 20, // -10 à 10 degrés
        y: y * 20  // -10 à 10 degrés
      });
    };
    
    containerRef.current.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [rotation3D]);
  
  // Exportation des données au format CSV
  const exportCSV = useCallback(() => {
    const headers = ['Catégorie', 'Valeur'];
    const csvContent = [
      headers.join(','),
      ...donneesTraitees.map(item => `${item.name},${item.value}`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${typeDonnees}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [donneesTraitees, typeDonnees]);
  
  // Exportation du graphique en PNG
  const exportPNG = useCallback(() => {
    if (!graphiqueRef.current) return;
    
    // Utilisation de html2canvas (nécessite d'être importé)
    if (typeof window !== 'undefined' && window.html2canvas) {
      window.html2canvas(graphiqueRef.current).then(canvas => {
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${typeDonnees}_${format(new Date(), 'yyyy-MM-dd')}.png`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    } else {
      console.warn('html2canvas non disponible pour l\'export PNG');
    }
  }, [typeDonnees]);
  
  // Rendu du segment actif du camembert
  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    
    // Récupération de l'unité selon le type
    const getUnit = () => {
      switch(typeDonnees) {
        case 'nutrition': return ' kcal';
        case 'temps': return ' min';
        default: return '';
      }
    };
    
    return (
      <g>
        <text x={cx} y={cy - 20} textAnchor="middle" fill={modeSombre ? '#e2e8f0' : '#334155'}>
          {payload.name}
        </text>
        <text x={cx} y={cy + 5} textAnchor="middle" fill={modeSombre ? '#e2e8f0' : '#334155'} className="text-lg font-bold">
          {value}
          <tspan className="text-sm font-normal">
            {getUnit()}
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
  const formatTooltip = (value, name, props) => {
    // Récupération de l'unité selon le type
    const getUnit = () => {
      switch(typeDonnees) {
        case 'nutrition': return ' kcal';
        case 'temps': return ' min';
        default: return '';
      }
    };
    
    // Si on est en mode comparaison
    if (modeComparaison && props && props.dataKey === 'valueComp') {
      return [`${value}${getUnit()} (période précédente)`, name];
    }
    
    return [`${value}${getUnit()}`, name];
  };
  
  // Si en mode chargement, afficher un loader
  if (isLoading) {
    return (
      <div className={`w-full h-${hauteur} flex items-center justify-center ${
        modeSombre ? 'bg-gray-800 text-gray-200' : 'bg-gray-50 text-gray-800'
      } rounded-lg transition-all duration-300`}>
        <svg className="animate-spin h-8 w-8 text-blue-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-lg font-medium">Chargement du graphique...</span>
      </div>
    );
  }

  // Si aucune donnée valide, afficher un message
  if (!donneesTraitees.length) {
    return (
      <div className={`w-full h-${hauteur} flex flex-col items-center justify-center ${
        modeSombre ? 'bg-gray-800 text-gray-200' : 'bg-gray-50 text-gray-800'
      } rounded-lg`}>
        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
    // Transformation pour modeComparaison
    const dataComp = modeComparaison ? donneesTraitees.map((item, index) => ({
      ...item,
      valueComp: donneesComparaison[index]?.value || 0
    })) : donneesTraitees;
    
    // Application de la transformation 3D si activée
    const transform3D = rotation3D 
      ? `perspective(1200px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` 
      : '';
    
    // Style pour l'animation 3D
    const style3D = {
      transform: transform3D,
      transformStyle: 'preserve-3d',
      transition: 'transform 0.1s ease-out'
    };
    
    // Calcul de la hauteur maximale du graphique
    const actualHeight = isFullscreen ? window.innerHeight - 180 : hauteur;
    
    switch (typeGraphiqueActif) {
      case 'pie':
        return (
          <div style={rotation3D ? style3D : {}}>
            <ResponsiveContainer width="100%" height={actualHeight}>
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={donneesTraitees}
                  cx="50%"
                  cy="50%"
                  innerRadius={actualHeight / 5}
                  outerRadius={actualHeight / 3}
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
          </div>
        );
      
      case 'bar':
        return (
          <div style={rotation3D ? style3D : {}}>
            <ResponsiveContainer width="100%" height={actualHeight}>
              <BarChart
                data={dataComp}
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
                <Bar 
                  dataKey="value" 
                  animationDuration={animationActive ? 1500 : 0}
                  radius={[4, 4, 0, 0]}
                >
                  {dataComp.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color || COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Bar>
                {modeComparaison && (
                  <Bar 
                    dataKey="valueComp" 
                    fill="#94a3b8"
                    fillOpacity={0.6}
                    animationDuration={animationActive ? 1500 : 0}
                    radius={[4, 4, 0, 0]}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      
      case 'line':
        return (
          <div style={rotation3D ? style3D : {}}>
            <ResponsiveContainer width="100%" height={actualHeight}>
              <LineChart
                data={dataComp}
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
                {modeComparaison && (
                  <Line 
                    type="monotone" 
                    dataKey="valueComp" 
                    stroke="#94a3b8" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ stroke: '#94a3b8', strokeWidth: 2, fill: modeSombre ? '#1f2937' : '#ffffff', r: 4 }}
                    activeDot={{ r: 7 }}
                    animationDuration={animationActive ? 1500 : 0}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      
      case 'area':
        return (
          <div style={rotation3D ? style3D : {}}>
            <ResponsiveContainer width="100%" height={actualHeight}>
              <AreaChart
                data={dataComp}
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
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorValueComp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={COLORS[0]} 
                  fill="url(#colorValue)" 
                  fillOpacity={1}
                  animationDuration={animationActive ? 1500 : 0}
                />
