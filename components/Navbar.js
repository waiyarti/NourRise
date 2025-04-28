import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 mb-6 flex justify-between items-center shadow-md">
      <div className="font-bold text-xl">NourRise</div>
      <div className="space-x-4">
        <Link href="/" className="hover:underline">
          Accueil
        </Link>
        <Link href="/progression" className="hover:underline">
          Progression
        </Link>
        <Link href="/analyse" className="hover:underline">
          Analyse IA
        </Link>
      </div>
    </nav>
  );
}