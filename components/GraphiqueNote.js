import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function GraphiqueNote({ historique }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
      <h2 className="text-xl font-bold mb-4">📚 Suivi de ta note</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={historique} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 20]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="note" stroke="#ffc658" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}