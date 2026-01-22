import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "../../styles/global.css";
import "../../styles/student.css";

export default function WeeklyExpensesChart({ data }) {
  return (
    <div className="settings-card">
      <h2 className="card-title">Tjedna usporedba potrošnje 📊</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="type" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="total" name="Ukupno (€)" fill="var(--dark-green)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
