import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function GraphiqueNote({ historique }) {
  return (
    <div className="bg-white p-4 rounded shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-yellow-600">📊 Note /20 - Progression</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={[...historique].reverse()}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 20]} />
          <Tooltip />
          <Line type="monotone" dataKey="note" stroke="#f59e0b" strokeWidth={2} name="Note sur 20" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}