import React, { useState } from "react";

const badgeSrcFromChallengeId = (id) => `/badges/${id}.png`;

const BadgeItem = ({ id }) => {
  const [imgOk, setImgOk] = useState(true);

  return (
    <div className="badge-item">
      {imgOk ? (
        <img
          src={badgeSrcFromChallengeId(id)}
          alt={`Badge ${id}`}
          className="badge-img-64"
          onError={() => setImgOk(false)}
        />
      ) : (
        <div className="badge-fallback-64" title={`Badge ${id}`}>
          {id}
        </div>
      )}

      <div className="badge-caption">#{id}</div>
    </div>
  );
};

const BadgeGrid = ({ ids }) => {
  if (!ids || ids.length === 0) {
    return <p className="gamification-empty">Nema još osvojenih badgeva.</p>;
  }

  return (
    <div className="badges-grid">
      {ids.map((id) => (
        <BadgeItem key={id} id={id} />
      ))}
    </div>
  );
};

const RewardsHistory = ({ weeklyBadgeIds = [], allTimeBadgeIds = [] }) => {
  return (
    <div className="gamification-card gamification-mt-16">
      <h3 className="gamification-section-title">🏅 Badgevi</h3>

      <div className="gamification-mt-12">
        <h4 className="gamification-section-subtitle">Ovaj tjedan</h4>
        <BadgeGrid ids={weeklyBadgeIds} />
      </div>

      <div className="gamification-mt-16">
        <h4 className="gamification-section-subtitle">Povijest (svi osvojeni)</h4>
        <BadgeGrid ids={allTimeBadgeIds} />
      </div>
    </div>
  );
};

export default RewardsHistory;
