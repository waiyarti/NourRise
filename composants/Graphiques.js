// Fichier : composants/Graphiques.js
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

export default function Graphiques({ historique }) {
  return (
    <div className="space-y-8 mt-10">
      <div>
        <h2 className="text-xl font-semibold mb-2">📈 % Réussite - Évolution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={historique} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="tauxReussite" stroke="#2563eb" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">📊 Note /20 - Progression</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={historique} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 20]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="note" stroke="#f59e0b" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}