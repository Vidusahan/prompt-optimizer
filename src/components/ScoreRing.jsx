export function ScoreRing({ score }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (score / 10) * circ;
  const color = score <= 3 ? '#E24B4A' : score <= 6 ? '#EF9F27' : '#1D9E75';

  return (
    <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
      <svg width="96" height="96" style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx="48" cy="48" r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth="7"
        />
        {/* Fill */}
        <circle
          cx="48" cy="48" r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
      </svg>

      {/* Score label centered over ring */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ fontSize: 24, fontWeight: 500, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 11, color: 'var(--text)' }}>/10</span>
      </div>
    </div>
  );
}