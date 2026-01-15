import React from "react";
import WeeklyChallengeCard from "./WeeklyChallengeCard";

const WeeklyChallengesList = ({ challenges }) => {
  if (!challenges || challenges.length === 0) {
    return <p>Nema tjednih izazova za tvoje ciljeve.</p>;
  }

  return (
    <div>
      <h3 className="gamification-section-title">Tjedni izazovi</h3>
      <div className="gamification-mt-12">
        {challenges.map((c) => (
          <WeeklyChallengeCard key={c.id} challenge={c} />
        ))}
      </div>
    </div>
  );
};

export default WeeklyChallengesList;
