import Link from 'next/link';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">
            NourRise
          </div>
          <div className="space-x-6 text-lg font-medium text-gray-700">
            <Link href="/" className="hover:text-blue-500 transition">Accueil</Link>
            <Link href="/progression" className="hover:text-blue-500 transition">Progression</Link>
            <Link href="/analyse" className="hover:text-blue-500 transition">Analyse</Link>
          </div>
        </nav>
      </header>

      <main className="pt-24 px-4 flex-1">
        {children}
      </main>

      <footer className="bg-white text-center text-sm text-gray-500 py-6">
        © 2025 NourRise. Tous droits réservés.
      </footer>
    </div>
  );
}