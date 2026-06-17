import { IconWand, IconLoader2 } from '@tabler/icons-react';

const EXAMPLES = [
  "write me a blog post about AI",
  "help me with my code",
  "summarize this",
  "make it better",
];

export function InputModule({ input, setInput, phase, onAnalyze, onReset }) {
  const isLoading = phase === 'analyzing' || phase === 'improving';

  return (
    <div style={{
      background: 'var(--bg)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 12,
    }}>
      {/* Textarea */}
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        disabled={isLoading}
        placeholder="Paste your prompt here…"
        style={{
          width: '100%',
          minHeight: 120,
          padding: '14px 16px',
          border: 'none',
          resize: 'vertical',
          fontSize: 14,
          lineHeight: 1.6,
          background: 'transparent',
          color: 'var(--text-h)',
          fontFamily: 'var(--sans)',
          boxSizing: 'border-box',
          outline: 'none',
          opacity: isLoading ? 0.6 : 1,
        }}
      />

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid var(--border)',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        flexWrap: 'wrap',
      }}>
        {/* Example buttons */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map(ex => (
            <button
              key={ex}
              onClick={() => setInput(ex)}
              disabled={isLoading}
              style={{
                fontSize: 12,
                padding: '3px 10px',
                borderRadius: 20,
                border: '1px solid var(--border)',
                background: 'transparent',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                color: 'var(--text)',
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              "{ex}"
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          {phase !== 'idle' && (
            <button
              onClick={onReset}
              style={{
                fontSize: 13,
                padding: '6px 14px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--text)',
              }}
            >
              Reset
            </button>
          )}
          <button
            onClick={onAnalyze}
            disabled={!input.trim() || isLoading}
            style={{
              fontSize: 13,
              padding: '6px 16px',
              borderRadius: 8,
              fontWeight: 500,
              border: 'none',
              background: 'var(--accent)',
              color: '#fff',
              cursor: (!input.trim() || isLoading) ? 'not-allowed' : 'pointer',
              opacity: (!input.trim() || isLoading) ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {phase === 'analyzing' ? (
              <><IconLoader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing…</>
            ) : phase === 'improving' ? (
              <><IconLoader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Generating…</>
            ) : (
              <><IconWand size={14} /> Optimize ↗</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}