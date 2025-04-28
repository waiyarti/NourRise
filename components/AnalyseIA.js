export default function AnalyseIA({ tauxReussite, note }) {
  if (tauxReussite >= 85) {
    return (
      <div className="mt-8 p-6 bg-green-100 border border-green-400 rounded">
        <h2 className="text-xl font-bold mb-2 text-green-700">🔥 Tu es en feu aujourd'hui !</h2>
        <p>Continue comme ça, tu construis ta réussite jour après jour. Garde ce rythme !</p>
      </div>
    );
  } else if (tauxReussite >= 60) {
    return (
      <div className="mt-8 p-6 bg-yellow-100 border border-yellow-400 rounded">
        <h2 className="text-xl font-bold mb-2 text-yellow-700">📈 C'est bien mais tu peux mieux faire !</h2>
        <p>Accroche-toi. Un petit effort supplémentaire et tu franchiras un cap important.</p>
      </div>
    );
  } else {
    return (
      <div className="mt-8 p-6 bg-red-100 border border-red-400 rounded">
        <h2 className="text-xl font-bold mb-2 text-red-700">⏳ Attention !</h2>
        <p>Ne te décourage pas. Chaque jour est une nouvelle chance pour progresser et te rapprocher de tes objectifs.</p>
      </div>
    );
  }
}