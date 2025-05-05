// pages/email-verifie.js

export default function EmailVerifie() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white flex items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-2xl max-w-md w-full p-8 text-center animate-fadeIn">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-green-600 mb-2">Email vérifié !</h1>
        <p className="text-gray-700 mb-6">Ton compte a bien été activé. Tu peux maintenant te connecter à ton espace personnalisé.</p>
        <a
          href="/connexion"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded transition-all duration-200"
        >
          Se connecter
        </a>
        <p className="mt-6 text-xs text-gray-400">Propulsé par Supabase | NourRise 2025</p>
      </div>
    </div>
  );
}