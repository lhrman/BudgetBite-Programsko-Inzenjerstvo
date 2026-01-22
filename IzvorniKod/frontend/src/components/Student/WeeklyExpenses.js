import React, { useState, useEffect } from "react";
import ExternalExpenseForm from "./ExternalExpenseForm";
import WeeklyExpensesChart from "./WeeklyExpensesChart";
import { useAuth } from "../../context/AuthContext";
import "../../styles/global.css";
import "../../styles/student.css";

export default function WeeklyExpenses() {
  const { user } = useAuth();
  const [completedMealsTotal, setCompletedMealsTotal] = useState(0);
  const [externalExpensesTotal, setExternalExpensesTotal] = useState(0);
  const [weeklyData, setWeeklyData] = useState([]);

  // Dohvati podatke za trenutni tjedan
  const fetchWeeklyData = async () => {
    if (!user) return;

    try {
      const startOfWeek = getMonday(new Date()).toISOString().split("T")[0];

      // Completed meals
      const completedRes = await fetch(
        `/api/completed-meals?week_start=${startOfWeek}`,
        { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` } }
      );
      const completedJson = await completedRes.json();
      const mealsTotal = completedJson.reduce((sum, item) => sum + Number(item.price_at_time), 0);

      // External expenses
      const externalRes = await fetch(
        `/api/external-expenses?week_start=${startOfWeek}`,
        { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` } }
      );
      const externalJson = await externalRes.json();
      const externalTotal = externalJson.reduce((sum, item) => sum + Number(item.amount), 0);

      setCompletedMealsTotal(mealsTotal);
      setExternalExpensesTotal(externalTotal);
      setWeeklyData([
        { type: "Completed Meals", total: mealsTotal },
        { type: "External Expenses", total: externalTotal },
      ]);
    } catch (error) {
      console.error("Error fetching weekly expenses:", error);
    }
  };

  useEffect(() => {
    fetchWeeklyData();
  }, [user]);

  // Helper: prvi dan u tjednu (ponedjeljak)
  const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  return (
    <div className="weekly-expenses-page">
      <h1>Tjedna potrošnja</h1>

      <ExternalExpenseForm
        onNewExpense={fetchWeeklyData}
      />

      <div className="weekly-expenses-section">
        <div className="weekly-expenses-card">
            <p>Ukupno potrošeno na naša jela: €{completedMealsTotal.toFixed(2)}</p>
            <p>Ukupno potrošeno na vanjska jela: €{externalExpensesTotal.toFixed(2)}</p>
        </div>
      </div>

      <WeeklyExpensesChart data={weeklyData} />
    </div>
  );
}
