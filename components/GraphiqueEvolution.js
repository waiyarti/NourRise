import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

export default function GraphiqueEvolution({ historique }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-4">📈 Progression du % de réussite</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={historique}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="tauxReussite" stroke="#4F46E5" />
        </LineChart>
      </ResponsiveContainer>

      <h2 className="text-2xl font-bold mb-4 mt-10">📊 Progression de la moyenne /20</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={historique}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 20]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="note" stroke="#10B981" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}