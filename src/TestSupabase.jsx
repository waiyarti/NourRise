import { useEffect } from 'react'
import { supabase } from './supabaseClient'

const TestSupabase = () => {
  const envoyerTest = async () => {
    const { data, error } = await supabase
      .from('journal')
      .insert([
        {
          user_id: null,
          date: new Date().toISOString().split('T')[0],
          note: 18,
          taux_reussite: 90,
          taches: [
            { categorie: 'Religion', statut: 'Terminé' },
            { categorie: 'Business', statut: 'En cours' }
          ]
        }
      ])

    if (error) {
      console.error('❌ Erreur Supabase :', error)
    } else {
      console.log('✅ Journée enregistrée dans Supabase !', data)
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Test Supabase</h2>
      <button onClick={envoyerTest}>Tester l'enregistrement</button>
    </div>
  )
}

export default TestSupabase
