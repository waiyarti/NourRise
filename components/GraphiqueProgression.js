import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function GraphiqueProgression({ historique }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4">📈 Taux de réussite</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={historique} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="tauxReussite" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}