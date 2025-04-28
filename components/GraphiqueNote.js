import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function GraphiqueNote({ historique }) {
  const historiqueInverse = historique.slice().reverse(); // ==> Très important

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      <h2 className="text-xl font-bold mb-4">✏️ Évolution des notes</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={historiqueInverse} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 20]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="note" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}