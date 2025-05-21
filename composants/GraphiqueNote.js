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
