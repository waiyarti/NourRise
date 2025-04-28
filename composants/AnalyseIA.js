export default function AnalyseIA({ tauxReussite, note }) {
  return (
    <div className="mt-8 p-6 bg-blue-50 rounded shadow-md">
      <h2 className="text-2xl font-bold mb-4">🔍 Analyse personnalisée</h2>
      {tauxReussite >= 85 ? (
        <p className="text-green-700">
          Excellente journée ! Continue sur cette lancée pour atteindre tes plus grands objectifs bi idhnillah.
        </p>
      ) : tauxReussite >= 60 ? (
        <p className="text-yellow-600">
          Bonne progression, mais tu peux viser encore plus haut en restant concentré et assidu.
        </p>
      ) : (
        <p className="text-red-600">
          Il y a des efforts à fournir. Ne te décourage pas, chaque pas compte ! Allah est avec les patients.
        </p>
      )}
    </div>
  );
}