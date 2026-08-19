/**
 * SafeRoute Guardian - Circular / Semicircle AI Risk Gauge Component
 * Displays a 0-100 explainable safety score with animated SVG progress ring,
 * factor breakdown bars, plain-language explanation, and one clear recommended action.
 */

window.RiskGauge = function({ riskData, compact = false }) {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  if (!riskData) return null;

  const score = riskData.score || 0;
  const level = riskData.level || { key: 'SAFE', label: 'Safe', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' };

  // SVG circular gauge geometry
  const size = compact ? 120 : 180;
  const strokeWidth = compact ? 10 : 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={`srg-risk-gauge-card ${compact ? 'compact' : ''}`}>
      <div className="srg-gauge-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem' }}>🧠</span>
          <div>
            <h3 style={{ fontSize: compact ? '0.95rem' : '1.05rem', fontWeight: '800', color: '#FFFFFF' }}>
              AI Safety Risk Gauge
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Deterministic 6-Signal Telemetry</span>
          </div>
        </div>

        <div
          className="srg-status-pill"
          style={{
            background: level.bg,
            border: `1px solid ${level.color}`,
            color: level.color,
            fontSize: '0.75rem'
          }}
        >
          <span className={`srg-status-dot ${level.key === 'EMERGENCY' ? 'srg-pulse' : ''}`} style={{ background: level.color }} />
          <span>{level.label}</span>
        </div>
      </div>

      {/* SVG Meter Visual */}
      <div className="srg-gauge-meter-wrapper">
        <div className="srg-gauge-svg-box" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Background Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#1E293B"
              strokeWidth={strokeWidth}
            />
            {/* Value Arc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={level.color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s' }}
            />
          </svg>

          <div className="srg-gauge-center-text">
            <span className="srg-gauge-score-value" style={{ color: level.color }}>
              {score}
            </span>
            <span className="srg-gauge-score-max">/ 100</span>
          </div>
        </div>

        {/* Plain Language Summary & Recommended Action */}
        <div className="srg-gauge-explanation-box">
          <div className="srg-gauge-plain-text">
            <b>Status Assessment:</b> {riskData.plainExplanation || riskData.summary}
          </div>

          <div className="srg-gauge-action-box" style={{ borderLeftColor: level.color }}>
            <span className="srg-gauge-action-label" style={{ color: level.color }}>
              💡 RECOMMENDED ACTION
            </span>
            <p className="srg-gauge-action-text">{riskData.recommendedAction}</p>
          </div>
        </div>
      </div>

      {/* Contributing Factor Progress Bars */}
      {!compact && (
        <div className="srg-gauge-factors-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.76rem', color: '#94A3B8', fontWeight: '800', letterSpacing: '0.05em' }}>
              CONTRIBUTING RISK SIGNALS
            </span>
            <button
              type="button"
              className="srg-link-btn"
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{ color: '#38BDF8', fontSize: '0.74rem' }}
            >
              {showAdvanced ? 'Hide Technical Details ▴' : 'Inspect Formula Telemetry ▾'}
            </button>
          </div>

          <div className="srg-gauge-factors-grid">
            {(riskData.factors || []).map((f, idx) => {
              const factorPct = Math.min(100, Math.round((f.score / f.max) * 100));
              return (
                <div key={idx} className="srg-gauge-factor-item">
                  <div className="srg-factor-label-row">
                    <span className="srg-factor-name">{f.name}</span>
                    <b className="srg-factor-score" style={{ color: f.score > 0 ? (f.isAlert ? '#EF4444' : '#F59E0B') : '#10B981' }}>
                      +{f.score} / {f.max} pts
                    </b>
                  </div>
                  <div className="srg-factor-progress-track">
                    <div
                      className="srg-factor-progress-bar"
                      style={{
                        width: `${factorPct}%`,
                        background: f.isAlert ? '#EF4444' : f.score > 0 ? '#F59E0B' : '#10B981'
                      }}
                    />
                  </div>
                  {showAdvanced && (
                    <div className="srg-factor-detail-text">{f.detail}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
