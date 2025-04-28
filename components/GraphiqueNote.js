import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function GraphiqueNote({ historique }) {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart
          data={[...historique].reverse()} // Toujours dans l'ordre naturel
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 20]} />
          <Tooltip />
          <Line type="monotone" dataKey="note" stroke="#facc15" strokeWidth={3} name="Note sur 20" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}