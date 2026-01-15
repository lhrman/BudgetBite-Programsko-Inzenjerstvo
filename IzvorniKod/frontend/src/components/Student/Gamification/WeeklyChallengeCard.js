import React, { useMemo, useState } from "react";

const badgeSrcFromChallengeId = (id) => `/badges/${id}.png`;

const WeeklyChallengeCard = ({ challenge }) => {
  const completed = !!challenge?.completed;
  const challengeId = challenge?.id;

  const [imgOk, setImgOk] = useState(true);

  const badgeSrc = useMemo(() => {
    if (challengeId == null) return null;
    return badgeSrcFromChallengeId(challengeId);
  }, [challengeId]);

  return (
    <div className="gamification-card gamification-mb-10">
      <div className="challenge-row">
        <div className="challenge-content">
          <h4 className="challenge-title">{challenge?.title}</h4>

          {challenge?.description ? (
            <p className="challenge-desc">{challenge.description}</p>
          ) : null}

          <div className="challenge-status">
            {completed ? (
              <span className="challenge-status-completed">✅ Izazov izvršen</span>
            ) : (
              <span className="challenge-status-pending">⏳ U tijeku</span>
            )}
          </div>
        </div>

        {completed && challengeId != null ? (
          imgOk ? (
            <img
              src={badgeSrc}
              alt={`Badge ${challengeId}`}
              className="badge-img-56"
              onError={() => setImgOk(false)}
            />
          ) : (
            <div className="badge-fallback-56" title={`Badge ${challengeId}`}>
              {challengeId}
            </div>
          )
        ) : null}
      </div>
    </div>
  );
};

export default WeeklyChallengeCard;
