const quotes = [
  "Travaille en silence, laisse ton succès faire du bruit.",
  "Chaque jour est une nouvelle chance de progresser.",
  "Les grands rêves demandent de la discipline.",
  "Ne baisse pas les bras. Le début est toujours le plus dur.",
  "L’effort constant amène au sommet inshallah."
];

export default function MotivationQuote() {
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  return (
    <div className="mt-8 p-4 bg-indigo-100 border-l-4 border-indigo-500 text-indigo-700 rounded shadow animate-fade-in-up">
      <p className="text-lg italic text-center">"{quote}"</p>
    </div>
  );
}