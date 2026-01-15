import React, { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import WeeklyChallengesList from "./WeeklyChallengesList";
import StreakCard from "./StreakCard";
import RewardsHistory from "./RewardsHistory";
import "../../../styles/gamification.css";

const GamificationPage = () => {
  const [status, setStatus] = useState(null);
  const [weeklyChallenges, setWeeklyChallenges] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [statusRes, weeklyRes, historyRes] = await Promise.all([
        api.get("/gamification/status"),
        api.get("/gamification/weekly"),
        api.get("/gamification/rewards/history"),
      ]);

      setStatus(statusRes.data || null);
      setWeeklyChallenges(Array.isArray(weeklyRes.data) ? weeklyRes.data : []);
      setHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
    } catch (err) {
      console.error("Gamification fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const weeklyBadgeIds = useMemo(() => {
    const s = new Set();
    for (const c of weeklyChallenges) {
      if (c?.completed && c?.id != null) s.add(c.id);
    }
    return Array.from(s);
  }, [weeklyChallenges]);

  const allTimeBadgeIds = useMemo(() => {
    const s = new Set();
    for (const r of history) {
      if (r?.challengeId != null) s.add(r.challengeId);
    }
    return Array.from(s);
  }, [history]);

  if (loading) return <p>Učitavanje...</p>;

  return (
    <div className="gamification-page">
      <h2 className="gamification-title">Izazovi i nagrade</h2>

      <div className="gamification-mb-16">
        <StreakCard current={status?.currentStreak} best={status?.bestStreak} />
      </div>

      <WeeklyChallengesList challenges={weeklyChallenges} />

      <RewardsHistory
        weeklyBadgeIds={weeklyBadgeIds}
        allTimeBadgeIds={allTimeBadgeIds}
      />
    </div>
  );
};

export default GamificationPage;
