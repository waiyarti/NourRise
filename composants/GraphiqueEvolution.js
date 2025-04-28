import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function GraphiqueEvolution({ historique }) {
  return (
    <div className="bg-white p-4 rounded shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-blue-700">📈 % Réussite - Évolution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={[...historique].reverse()}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Line type="monotone" dataKey="tauxReussite" stroke="#3b82f6" strokeWidth={2} name="% de réussite" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}