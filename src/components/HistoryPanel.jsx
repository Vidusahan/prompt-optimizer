export function HistoryPanel({ history, showHistory, setShowHistory, onSelect }) {
  if (history.length === 0) return null;

  return (
    <div style={{ marginBottom: 12 }}>
      <button
        onClick={() => setShowHistory(h => !h)}
        style={{ fontSize: 13, padding: '5px 12px', borderRadius: 8,
          border: '1px solid var(--border)', background: 'transparent',
          cursor: 'pointer', color: 'var(--text)' }}>
        {showHistory ? 'Hide' : 'Show'} history ({history.length})
      </button>

      {showHistory && (
        <div style={{ marginTop: 8, border: '1px solid var(--border)',
          borderRadius: 10, overflow: 'hidden' }}>
          {history.map((entry, i) => {
            const score = entry.analysis?.score;
            const color = score <= 3 ? '#E24B4A' : score <= 6 ? '#EF9F27' : '#1D9E75';
            const date = new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <button key={entry.key} onClick={() => onSelect(entry)}
                style={{ width: '100%', textAlign: 'left', padding: '10px 14px',
                  background: i % 2 === 0 ? 'var(--bg)' : 'transparent',
                  border: 'none', borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color, minWidth: 24 }}>{score}</span>
                <span style={{ fontSize: 13, color: 'var(--text-h)', flex: 1,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {entry.input}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text)', flexShrink: 0 }}>{date}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}