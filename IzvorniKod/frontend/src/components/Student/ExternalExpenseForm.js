import React, { useState, useEffect } from "react";
import "../../styles/global.css";
import "../../styles/student.css";

const API = "https://budgetbite.onrender.com/";


export default function ExternalExpenseForm({ onNewExpense }) {
  const [amount, setAmount] = useState("");
  const [spentAt, setSpentAt] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [dailyTotal, setDailyTotal] = useState(0);

  const token = localStorage.getItem("token");

  // Helper: safe JSON parse (da ne pukne na HTML)
  const safeJson = async (res) => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return { success: false, error: text?.slice(0, 200) || "Invalid JSON response" };
    }
  };

  // Fetch daily total
  const fetchDailyTotal = async (date) => {
    try {
      const res = await fetch(`${API}/api/external-expenses?date=${date}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setDailyTotal(0);
        return;
      }

      const data = await safeJson(res);
      if (!Array.isArray(data)) {
        setDailyTotal(0);
        return;
      }

      const total = data.reduce((sum, item) => sum + Number(item.amount || 0), 0);
      setDailyTotal(total);
    } catch (err) {
      console.error("Error fetching daily total:", err);
      setDailyTotal(0);
    }
  };

  useEffect(() => {
    fetchDailyTotal(spentAt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spentAt]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setMessage("Unesite valjani iznos");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API}/api/external-expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          // sigurnije za TIMESTAMP kolonu
          spent_at: new Date(spentAt).toISOString(),
        }),
      });

      const data = await safeJson(res);

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || `Greška (HTTP ${res.status})`);
      }

      setAmount("");
      setMessage("Trošak dodan!");
      onNewExpense?.();
      fetchDailyTotal(spentAt);
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Greška pri dodavanju troška");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-card">
      <h2 className="card-title">Dodaj vanjski trošak 💸</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Iznos (€)</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="settings-input"
            placeholder="npr. 5.50"
          />
        </div>

        <div className="form-group">
          <label>Datum troška</label>
          <input
            type="date"
            value={spentAt}
            onChange={(e) => setSpentAt(e.target.value)}
            className="settings-input"
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Spremanje..." : "Dodaj"}
        </button>
      </form>

      {message && (
        <div className={`message ${message.includes("dod") ? "success" : "error"}`}>
          {message}
        </div>
      )}

      <p style={{ marginTop: "16px", fontWeight: 600 }}>
        Današnji total vanjskih troškova: {dailyTotal.toFixed(2)}€
      </p>
    </div>
  );
}
