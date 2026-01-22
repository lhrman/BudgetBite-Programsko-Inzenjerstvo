import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/student.css';

function GamificationPage() {
    const { user } = useAuth();
    const [challengeState, setChallengeState] = useState(null);
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCurrentChallenge();
        fetchBadges();
    }, []);

    const fetchCurrentChallenge = async () => {
        try {
            const response = await fetch(`/api/student/challenge/current?userId=${user.user_id}`);
            const data = await response.json();
            setChallengeState(data);
            setLoading(false);
        } catch (err) {
            setError('Greška pri dohvaćanju izazova');
            setLoading(false);
        }
    };

    const fetchBadges = async () => {
        try {
            const response = await fetch(`/api/student/badges?userId=${user.user_id}`);
            const data = await response.json();
            setBadges(data.badges || []);
        } catch (err) {
            console.error('Error fetching badges:', err);
        }
    };

    const handleCompleteChallenge = async () => {
        try {
            const response = await fetch('/api/student/challenge/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.user_id,
                    challengeId: challengeState.challenge.challenge_id
                })
            });

            if (response.ok) {
                // Refresh stanje
                fetchCurrentChallenge();
                fetchBadges();
            }
        } catch (err) {
            setError('Greška pri završavanju izazova');
        }
    };

    // ✅ Dodaj provjeru
    if (loading) return <div className="gamification-loading">Učitavanje...</div>;
    if (error) return <div className="gamification-error">{error}</div>;
    if (!challengeState) return <div className="gamification-loading">Učitavanje...</div>;

    return (
        <div className="gamification-container">
            <h1>Tjedni Izazov 🎯</h1>

            {/* ALL COMPLETED STATE */}
            {challengeState.status === 'all_completed' && (
                <div className="all-completed-card">
                    <div className="trophy-icon">🏆</div>
                    <h2>Nevjerojatno!</h2>
                    <p className="completed-message">
                        Završio si sve dostupne izazove!
                    </p>
                    <p className="completed-submessage">
                        Uskoro stižu novi izazovi. Nastavi s odličnim radom! 💪
                    </p>
                </div>
            )}

            {/* ACTIVE CHALLENGE STATE */}
            {challengeState.status === 'active' && (
                <div className="active-challenge-card">
                    <div className="challenge-badge-preview">
                        <img 
                            src={challengeState.challenge.badge_image_url} 
                            alt="Challenge badge" 
                        />
                    </div>

                    <div className="challenge-content">
                        <h2>Tvoj izazov ovaj tjedan:</h2>
                        <p className="challenge-description">
                            {challengeState.challenge.description}
                        </p>
                        
                        {challengeState.challenge.rule_summary && (
                            <div className="challenge-rules">
                                <strong>Pravila:</strong>
                                <p>{challengeState.challenge.rule_summary}</p>
                            </div>
                        )}
                    </div>

                    <button 
                        className="complete-challenge-btn"
                        onClick={handleCompleteChallenge}
                    >
                        ✅ Završio sam izazov!
                    </button>
                </div>
            )}

            {/* WAITING STATE */}
            {challengeState.status === 'waiting' && (
                <div className="waiting-state-card">
                    <div className="congrats-section">
                        <h2>🎉 Čestitamo!</h2>
                        <p>Uspješno si završio izazov!</p>
                        
                        <div className="earned-badge">
                            <img 
                                src={challengeState.completed_challenge.badge_image_url} 
                                alt="Earned badge" 
                            />
                            <p className="badge-name">
                                {challengeState.completed_challenge.description}
                            </p>
                        </div>
                    </div>

                    <div className="countdown-section">
                        <p className="countdown-text">Novi izazov stiže za:</p>
                        <div className="countdown-timer">
                            {challengeState.time_remaining.days > 0 && (
                                <span className="time-unit">
                                    {challengeState.time_remaining.days}d
                                </span>
                            )}
                            <span className="time-unit">
                                {challengeState.time_remaining.hours}h
                            </span>
                            <span className="time-unit">
                                {challengeState.time_remaining.minutes}m
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* BADGE COLLECTION */}
            {badges.length > 0 && (
                <div className="badges-collection">
                    <h2>Osvojeni Badge-ovi 🏅</h2>
                    <div className="badges-grid">
                        {badges.map((badge, index) => (
                            <div key={`${badge.challenge_id}-${index}`} className="badge-item">
                                <img 
                                    src={badge.badge_image_url} 
                                    alt={badge.description}
                                    title={badge.description}
                                />
                                <p className="badge-date">
                                    {new Date(badge.completed_at).toLocaleDateString('hr-HR')}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default GamificationPage;