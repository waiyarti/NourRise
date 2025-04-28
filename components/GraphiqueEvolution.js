import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function GraphiqueEvolution({ historique }) {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart
          data={[...historique].reverse()} // Pour avoir le temps qui avance de gauche à droite
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Line type="monotone" dataKey="tauxReussite" stroke="#3b82f6" strokeWidth={3} name="% de réussite" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}