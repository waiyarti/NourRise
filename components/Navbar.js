import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-blue-600 p-4 text-white shadow-md mb-8">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">🚀 NourRise</h1>
        <div className="space-x-6">
          <Link href="/" className="hover:underline">Accueil</Link>
          <Link href="/progression" className="hover:underline">Progression</Link>
          <Link href="/analyse" className="hover:underline">Analyse IA</Link>
        </div>
      </div>
    </nav>
  );
}