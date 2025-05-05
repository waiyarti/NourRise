import { useEffect } from 'react'
import { supabase } from './supabaseClient'

const TestSupabase = () => {
  // Fonction pour insérer une journée de test dans Supabase
  const enregistrerJourneeTest = async () => {
    try {
      // Définition des données à insérer
      const journee = {
        user_id: null, // Remplacez par une valeur réelle si nécessaire
        date: new Date().toISOString().split('T')[0], // Date au format YYYY-MM-DD
        note: 18,
        taux_reussite: 90,
        taches: [
          { categorie: 'Religion', statut: 'Terminé' },
          { categorie: 'Business', statut: 'En cours' }
        ]
      }

      // Insertion dans la table 'journal'
      const { data, error } = await supabase.from('journal').insert([journee])

      if (error) {
        throw error // Lance une exception si une erreur survient
      }

      console.log('✅ Journée enregistrée dans Supabase !', data)
    } catch (error) {
      // Affichage des erreurs avec plus de détails
      console.error('❌ Une erreur est survenue lors de l\'enregistrement :', error.message)
      alert('Une erreur est survenue. Veuillez réessayer plus tard.')
    }
  }

  // Styles pour le conteneur
  const containerStyle = {
    padding: 40,
    textAlign: 'center'
  }

  return (
    <div style={containerStyle}>
      <h2>Test Supabase</h2>
      <button onClick={enregistrerJourneeTest}>Tester l'enregistrement</button>
    </div>
  )
}

export default TestSupabase