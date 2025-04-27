export default function AnalyseIA({ tauxReussite, note }) {
  let analyse = "";
  let conseil = "";

  if (tauxReussite >= 85) {
    analyse = "Tu es en excellente voie ! Garde ce niveau de rigueur.";
    conseil = "Maintiens la cadence, améliore ce qui peut l'être et sois reconnaissant envers Allah.";
  } else if (tauxReussite >= 60) {
    analyse = "Bon travail, mais il y a encore une belle marge de progression.";
    conseil = "Fixe-toi des mini-objectifs quotidiens pour franchir un cap bi idhnillah.";
  } else {
    analyse = "Des efforts supplémentaires sont nécessaires.";
    conseil = "Concentre-toi sur la constance, même de petits progrès quotidiens feront une grande différence avec l'aide d'Allah.";
  }

  return (
    <div className="card p-6 mt-10 bg-white rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">🧠 Analyse IA</h2>
      <p className="mb-2"><strong>Analyse :</strong> {analyse}</p>
      <p className="mb-4"><strong>Conseil :</strong> {conseil}</p>
      <div className="text-gray-600 text-sm">
        <strong>Verset motivation :</strong> <br />
        <em>« Et dis : œuvre donc ! Allah verra votre œuvre, ainsi que Son messager et les croyants. »</em> (Sourate 9, verset 105)
      </div>
    </div>
  );
}