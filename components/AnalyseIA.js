export default function AnalyseIA({ tauxReussite, note }) {
  const messages = [];

  if (tauxReussite >= 85) {
    messages.push("Excellent travail ! Continue sur cette lancée.");
  } else if (tauxReussite >= 60) {
    messages.push("Bon travail, mais tu peux encore t'améliorer !");
  } else {
    messages.push("Fais attention à ne pas relâcher tes efforts.");
  }

  if (note >= 15) {
    messages.push("Ta note est excellente, garde cet objectif !");
  } else if (note >= 10) {
    messages.push("Ta note est correcte, vise encore plus haut !");
  } else {
    messages.push("Il faut se ressaisir rapidement pour progresser.");
  }

  // Messages d'encouragement religieux
  if (tauxReussite < 60 || note < 10) {
    messages.push("« Certes, Allah n'altère point l’état d'un peuple tant qu'ils n'altèrent pas ce qui est en eux-mêmes. » (Sourate 13, v.11)");
  } else {
    messages.push("« Allah aime ceux qui persévèrent dans leurs efforts. » (Interprétation rapprochée).");
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-10">
      <h2 className="text-xl font-bold mb-4 text-green-600">🧠 Analyse intelligente de ta journée</h2>
      <ul className="list-disc list-inside text-gray-700 space-y-2">
        {messages.map((msg, idx) => (
          <li key={idx}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}