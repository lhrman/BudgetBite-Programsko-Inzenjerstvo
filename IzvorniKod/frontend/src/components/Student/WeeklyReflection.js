import React, { useState, useEffect } from 'react';
import '../../styles/student.css';

const MEALS_PER_WEEK = 21; // 3 obroka × 7 dana

// Helper functions
function getMoodEmoji(score) {
  if (score >= 4.5) return '😄';
  if (score >= 3.5) return '🙂';
  if (score >= 2.5) return '😐';
  return '😕';
}

function getMoodLabel(score) {
  if (score >= 4.5) return 'izvrsno';
  if (score >= 3.5) return 'dobro';
  if (score >= 2.5) return 'okej';
  return 'loše';
}

function getMoodDescription(score) {
  if (score >= 4.5) return 'U prosjeku si se osjećao/la izvrsno ovaj tjedan!';
  if (score >= 3.5) return 'U prosjeku si se osjećao/la dobro ovaj tjedan!';
  if (score >= 2.5) return 'U prosjeku si se osjećao/la okej ovaj tjedan.';
  return 'Ovaj tjedan nije bio najbolji. Nadamo se da će sljedeći biti bolji!';
}

function categorizeMood(avgMood) {
  if (avgMood >= 4.5) return 'excellent';
  if (avgMood >= 3.5) return 'good';
  if (avgMood >= 2.5) return 'okay';
  return 'bad';
}

function WeeklyReflection() {
  const [reflectionData, setReflectionData] = useState(null);
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // TODO: Replace with real API call
  useEffect(() => {
    // Mock data - replace with: fetch('/api/reflection/available-weeks')
    const mockWeeks = ['2025-01-13', '2025-01-06', '2024-12-30', '2024-12-23'];
    setAvailableWeeks(mockWeeks);
    
    // Load first (most recent) week
    loadWeekData(mockWeeks[0]);
  }, []);

  const loadWeekData = async (weekStart) => {
    setLoading(true);
    
    // TODO: Replace with real API call
    // const response = await fetch(`/api/reflection/details?weekStart=${weekStart}`);
    // const data = await response.json();
    
    // Mock data
    const mockData = {
      weekStart: weekStart,
      weekEnd: calculateWeekEnd(weekStart),
      totalSpent: weekStart === '2025-01-13' ? 24.50 : 28.00,
      homeCooked: weekStart === '2025-01-13' ? 6 : 5,
      avgMood: weekStart === '2025-01-13' ? 4.2 : 3.8,
      moodBreakdown: {
        excellent: 2,
        good: 8,
        okay: 5,
        bad: 1
      },
      lastFourWeeks: [
        { weekStart: '2024-12-30', completionRate: 19.05 }, // 4/21
        { weekStart: '2025-01-06', completionRate: 23.81 }, // 5/21
        { weekStart: '2025-01-13', completionRate: 28.57 }, // 6/21
        { weekStart: '2025-01-20', completionRate: null }   // current week
      ]
    };

    setReflectionData(mockData);
    setLoading(false);
  };

  const calculateWeekEnd = (weekStart) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + 6);
    return date.toISOString().split('T')[0];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('hr-HR', { month: 'long' });
    return `${day}. ${month}`;
  };

  const handlePrevious = () => {
    if (currentWeekIndex < availableWeeks.length - 1) {
      const newIndex = currentWeekIndex + 1;
      setCurrentWeekIndex(newIndex);
      loadWeekData(availableWeeks[newIndex]);
    }
  };

  const handleNext = () => {
    if (currentWeekIndex > 0) {
      const newIndex = currentWeekIndex - 1;
      setCurrentWeekIndex(newIndex);
      loadWeekData(availableWeeks[newIndex]);
    }
  };

  if (loading || !reflectionData) {
    return (
      <div className="weekly-reflection">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Učitavam refleksiju...</p>
        </div>
      </div>
    );
  }

  const completionRate = (reflectionData.homeCooked / MEALS_PER_WEEK) * 100;
  const moodEmoji = getMoodEmoji(reflectionData.avgMood);
  const moodLabel = getMoodLabel(reflectionData.avgMood);

  return (
    <div className="weekly-reflection">
      {/* Header with Navigation */}
      <div className="reflection-header">
        <div className="week-info">
          <h1>📊 Tjedna Refleksija</h1>
          <p className="date-range">
            {formatDate(reflectionData.weekStart)} - {formatDate(reflectionData.weekEnd)}
          </p>
        </div>
        <div className="week-nav">
          <button 
            className="nav-btn"
            onClick={handlePrevious}
            disabled={currentWeekIndex >= availableWeeks.length - 1}
          >
            ← Prethodni
          </button>
          <button 
            className="nav-btn"
            onClick={handleNext}
            disabled={currentWeekIndex === 0}
          >
            Sljedeći →
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-icon">🍳</div>
          <div className="summary-title">Napravio si / ocijenio</div>
          <div className="summary-value">{reflectionData.homeCooked}/{MEALS_PER_WEEK}</div>
          <div className="summary-subtitle">
            Napravili ste {completionRate.toFixed(0)}% planiranih obroka
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">{moodEmoji}</div>
          <div className="summary-title">Prosječno raspoloženje</div>
          <div className="summary-value">{reflectionData.avgMood.toFixed(1)}/5</div>
          <div className="summary-subtitle">{moodLabel.charAt(0).toUpperCase() + moodLabel.slice(1)}!</div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">💰</div>
          <div className="summary-title">Ukupno potrošeno</div>
          <div className="summary-value">{reflectionData.totalSpent.toFixed(2)} €</div>
          <div className="summary-subtitle">Na domaće obroke</div>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="content-section">
        <h2 className="section-title">📈 Tvoj napredak kroz tjedne</h2>
        <p className="section-subtitle">
          Postotak realizacije meal plana u zadnja 4 tjedna
        </p>

        <div className="progress-chart">
          {reflectionData.lastFourWeeks.map((week, index) => {
            const isCurrentWeek = index === reflectionData.lastFourWeeks.length - 1 && week.completionRate === null;
            const isViewedWeek = week.weekStart === reflectionData.weekStart;
            
            return (
              <div 
                key={week.weekStart} 
                className={`chart-bar ${isViewedWeek ? 'current' : ''} ${isCurrentWeek ? 'disabled' : ''}`}
              >
                <div className="bar-header">
                  <span className="bar-label">
                    {formatDate(week.weekStart)} - {formatDate(calculateWeekEnd(week.weekStart))}
                    {isViewedWeek && ' ⭐'}
                    {isCurrentWeek && ' (trenutni)'}
                  </span>
                  <span className="bar-value">
                    {week.completionRate !== null ? `${week.completionRate.toFixed(0)}%` : '-'}
                  </span>
                </div>
                <div className="bar-container">
                  <div 
                    className="bar-fill" 
                    style={{ width: week.completionRate !== null ? `${week.completionRate}%` : '0%' }}
                  >
                    {week.completionRate !== null && week.completionRate > 15 && `${week.completionRate.toFixed(0)}%`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mood Section */}
      <div className="content-section">
        <h2 className="section-title">😊 Kako si se osjećao/la?</h2>
        <div className="mood-display">
          <div className="mood-emoji-large">{moodEmoji}</div>
          <div className="mood-score">{reflectionData.avgMood.toFixed(1)} / 5</div>
          <div className="mood-description">{getMoodDescription(reflectionData.avgMood)}</div>
          
          <div className="mood-breakdown">
            <div className="mood-tag">
              <span className="emoji">😄</span>
              <div>Odlično</div>
              <div className="count">{reflectionData.moodBreakdown.excellent}x</div>
            </div>
            <div className="mood-tag">
              <span className="emoji">🙂</span>
              <div>Dobro</div>
              <div className="count">{reflectionData.moodBreakdown.good}x</div>
            </div>
            <div className="mood-tag">
              <span className="emoji">😐</span>
              <div>Okej</div>
              <div className="count">{reflectionData.moodBreakdown.okay}x</div>
            </div>
            <div className="mood-tag">
              <span className="emoji">😕</span>
              <div>Loše</div>
              <div className="count">{reflectionData.moodBreakdown.bad}x</div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="content-section">
        <h2 className="section-title">💡 Tvoji Insighti</h2>
        
        {/* Progress insight */}
        {currentWeekIndex < availableWeeks.length - 1 && (
          <div className="insight-card">
            <div className="insight-header">
              <span className="insight-icon">📈</span>
              <span className="insight-title">Napredak u odnosu na prošli tjedan</span>
            </div>
            <div className="insight-text">
              {completionRate > 25 ? (
                <>
                  Odlično! Ovaj tjedan si napravio/la {reflectionData.homeCooked} obroka 
                  ({completionRate.toFixed(0)}%). Nastavi tako! 💪
                </>
              ) : (
                <>
                  Ovaj tjedan si napravio/la {reflectionData.homeCooked} obroka 
                  ({completionRate.toFixed(0)}%). Pokušaj sljedeći tjedan povećati broj domaćih obroka!
                </>
              )}
            </div>
          </div>
        )}

        {/* Completion insight */}
        {completionRate >= 80 && (
          <div className="insight-card">
            <div className="insight-header">
              <span className="insight-icon">🎯</span>
              <span className="insight-title">Izvrsna realizacija!</span>
            </div>
            <div className="insight-text">
              Ostvario/la si {completionRate.toFixed(0)}% meal plana! To je fantastičan rezultat! 🎉
            </div>
          </div>
        )}

        {completionRate < 80 && completionRate >= 50 && (
          <div className="insight-card">
            <div className="insight-header">
              <span className="insight-icon">🎯</span>
              <span className="insight-title">Dobar rezultat!</span>
            </div>
            <div className="insight-text">
              Ostvario/la si {completionRate.toFixed(0)}% meal plana. 
              {MEALS_PER_WEEK - reflectionData.homeCooked === 1 
                ? ' Nedostaje ti još samo 1 obrok do odličnog rezultata!' 
                : ` Još ${MEALS_PER_WEEK - reflectionData.homeCooked} obroka do 100%!`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WeeklyReflection;