import React, { useState, useEffect } from "react";
import "../../styles/global.css";
import "../../styles/student.css";

export default function ExternalExpenseForm({ onNewExpense }) {
  const [amount, setAmount] = useState("");
  const [spentAt, setSpentAt] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [dailyTotal, setDailyTotal] = useState(0);

  // Fetch daily total
  const fetchDailyTotal = async (date) => {
    try {
      const res = await fetch(`/api/external-expenses?date=${date}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      const total = data.reduce((sum, item) => sum + Number(item.amount), 0);
      setDailyTotal(total);
    } catch (err) {
      console.error("Error fetching daily total:", err);
    }
  };

  useEffect(() => {
    fetchDailyTotal(spentAt);
  }, [spentAt]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount)) {
      setMessage("Unesite valjani iznos");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/external-expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          spent_at: spentAt,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Greška");

      setAmount("");
      setMessage("Trošak dodan!");
      onNewExpense();           // refresh weekly totals
      fetchDailyTotal(spentAt); // refresh daily total
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
