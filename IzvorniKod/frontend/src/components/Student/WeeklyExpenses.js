import React, { useState, useEffect } from "react";
import ExternalExpenseForm from "./ExternalExpenseForm";
import WeeklyExpensesChart from "./WeeklyExpensesChart";
import { useAuth } from "../../context/AuthContext";
import "../../styles/global.css";
import "../../styles/student.css";

const API = "https://budgetbite.onrender.com/";


export default function WeeklyExpenses() {
  const { user } = useAuth();
  const [completedMealsTotal, setCompletedMealsTotal] = useState(0);
  const [externalExpensesTotal, setExternalExpensesTotal] = useState(0);
  const [weeklyData, setWeeklyData] = useState([]);

  const token = localStorage.getItem("token");

  const safeJson = async (res) => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return { success: false, error: text?.slice(0, 200) || "Invalid JSON response" };
    }
  };

  // Helper: prvi dan u tjednu (ponedjeljak)
  const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  const fetchWeeklyData = async () => {
    if (!user) return;

    try {
      const startOfWeek = getMonday(new Date()).toISOString().split("T")[0];

      // Completed meals
      const completedRes = await fetch(
        `${API}/api/completed-meals?week_start=${startOfWeek}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const completedJson = await safeJson(completedRes);
      const completedArr = Array.isArray(completedJson) ? completedJson : [];
      const mealsTotal = completedArr.reduce(
        (sum, item) => sum + Number(item.price_at_time || 0),
        0
      );

      // External expenses
      const externalRes = await fetch(
        `${API}/api/external-expenses?week_start=${startOfWeek}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const externalJson = await safeJson(externalRes);
      const externalArr = Array.isArray(externalJson) ? externalJson : [];
      const externalTotal = externalArr.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
      );

      setCompletedMealsTotal(mealsTotal);
      setExternalExpensesTotal(externalTotal);
      setWeeklyData([
        { type: "Completed Meals", total: mealsTotal },
        { type: "External Expenses", total: externalTotal },
      ]);
    } catch (error) {
      console.error("Error fetching weekly expenses:", error);
      setCompletedMealsTotal(0);
      setExternalExpensesTotal(0);
      setWeeklyData([
        { type: "Completed Meals", total: 0 },
        { type: "External Expenses", total: 0 },
      ]);
    }
  };

  useEffect(() => {
    fetchWeeklyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="weekly-expenses-page">
      <h1>Tjedna potrošnja</h1>

      <ExternalExpenseForm onNewExpense={fetchWeeklyData} />

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
