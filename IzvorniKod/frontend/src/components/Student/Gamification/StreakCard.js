import React from "react";

const StreakCard = ({ current = 0, best = 0 }) => {
  return (
    <div className="gamification-card">
      <h3 className="gamification-streak-title">🔥 Konzistentnost</h3>

      <p className="gamification-text">
        Trenutni streak: <strong>{current} dana</strong>
      </p>

      <p className="gamification-text-tight">
        Najbolji streak: <strong>{best} dana</strong>
      </p>
    </div>
  );
};

export default StreakCard;
