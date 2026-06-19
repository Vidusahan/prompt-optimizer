import { useState, useRef, useEffect } from "react";
import { callGroq } from './api.js';
import { ANALYSIS_SYSTEM } from './prompts/analysis.js';
import { IMPROVE_SYSTEM } from './prompts/improve.js';
import { InputModule } from './components/InputModule.jsx';
import { ScoreRing } from './components/ScoreRing.jsx';
import { IssueBadge } from './components/IssueBadge.jsx';
import { VersionCard } from './components/VersionCard.jsx';
import { HistoryPanel } from './components/HistoryPanel.jsx';
import { storage, HISTORY_KEY_PREFIX, MAX_HISTORY } from './storage.js';


// ──────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState('idle');     // idle | analyzing | improving | done | error
  const [analysis, setAnalysis] = useState(null);
  const [versions, setVersions] = useState(null);
  const [copied, setCopied] = useState(null);       // index of copied version card
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const loadHistory = async () => {
    const keys = await storage.list(HISTORY_KEY_PREFIX);
    const entries = await Promise.all(keys.map(k => storage.get(k)));
    const valid = entries
      .filter(Boolean)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_HISTORY);
    setHistory(valid);
  };

  useEffect(() => { loadHistory(); }, []);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setPhase('analyzing');
    setAnalysis(null);
    setVersions(null);
    setError('');

    try {
      // Pass 1 — analysis
      const a = await callGroq(
        ANALYSIS_SYSTEM,
        `Analyze this prompt:\n\n${input.trim()}`
      );
      setAnalysis(a);
      setPhase('improving');

      // Pass 2 — improvement (receives full analysis as context)
      const v = await callGroq(
        IMPROVE_SYSTEM,
        `Original prompt:\n${input.trim()}\n\nAnalysis:\n${JSON.stringify(a)}\n\nGenerate 3 improved versions.`
      );

      const entry = {
        key: `${HISTORY_KEY_PREFIX}${Date.now()}`,
        timestamp: Date.now(),
        input: input.trim(),
        analysis: a,
        versions: v.versions,
      };
      await storage.set(entry.key, entry);

      const existingKeys = await storage.list(HISTORY_KEY_PREFIX);
      if (existingKeys.length > MAX_HISTORY) {
        const all = await Promise.all(existingKeys.map(k => storage.get(k)));
        const sorted = all.filter(Boolean).sort((a, b) => a.timestamp - b.timestamp);
        await storage.delete(sorted[0].key);
      }
      setHistory(prev => [entry, ...prev].slice(0, MAX_HISTORY));

      setVersions(v.versions);
      setPhase('done');

    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
      setPhase('error');
    }
  };

  const handleReset = () => {
    setInput('');
    setPhase('idle');
    setAnalysis(null);
    setVersions(null);
    setError('');
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSelectHistory = (entry) => {
    setInput(entry.input);
    setAnalysis(entry.analysis);
    setVersions(entry.versions);
    setPhase('done');
    setShowHistory(false);
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1rem', textAlign: 'left' }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Prompt Optimizer</h1>
      <p style={{ color: 'var(--text)', marginBottom: 24, fontSize: 14 }}>
        Paste any prompt and get a diagnosis plus 3 improved versions.
      </p>

      <HistoryPanel
        history={history}
        showHistory={showHistory}
        setShowHistory={setShowHistory}
        onSelect={handleSelectHistory}
      />

      <InputModule
        input={input}
        setInput={setInput}
        phase={phase}
        onAnalyze={handleAnalyze}
        onReset={handleReset}
      />

      {/* Phase indicator — dev only, will be removed later */}
      <p style={{ fontSize: 12, color: 'var(--text)', marginBottom: 16 }}>
        Phase: <strong>{phase}</strong>
      </p>

      {phase === 'error' && (
        <div style={{
          padding: '12px 16px', background: '#FCEBEB', border: '1px solid #F09595',
          borderRadius: 8, marginBottom: 16, color: '#A32D2D', fontSize: 14
        }}>
          ⚠ {error}
        </div>
      )}

      {analysis && (
        <div style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '18px 20px',
          marginBottom: 16,
        }}>
          {/* Score + summary row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
            <ScoreRing score={analysis.score} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 4px', fontWeight: 500, fontSize: 15, color: 'var(--text-h)' }}>
                Prompt quality score
              </p>
              <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text)', lineHeight: 1.5 }}>
                {analysis.summary}
              </p>
              {/* Strengths chips */}
              {analysis.strengths?.length > 0 && (
                <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                  {analysis.strengths.map((s, i) => (
                    <span key={i} style={{
                      fontSize: 12, padding: '3px 10px', borderRadius: 20,
                      background: '#E1F5EE', color: '#0F6E56', border: '1px solid #5DCAA5',
                    }}>
                      ✓ {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Issues list */}
          {analysis.issues?.length > 0 && (
            <>
              <p style={{
                margin: '0 0 10px', fontSize: 12, fontWeight: 500,
                color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                Issues detected
              </p>
              {analysis.issues.map((issue, i) => (
                <IssueBadge key={i} issue={issue} />
              ))}
            </>
          )}
        </div>
      )}
      {versions && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '20px 0 14px' }}>
            <p style={{ margin: 0, fontWeight: 500, fontSize: 15, color: 'var(--text-h)' }}>
              ✦ 3 improved versions
            </p>
          </div>
          {versions.map((v, i) => (
            <VersionCard
              key={i}
              version={v}
              idx={i}
              onCopy={handleCopy}
              copied={copied}
            />
          ))}
          <p style={{ fontSize: 12, color: 'var(--text)', textAlign: 'center', marginTop: 8 }}>
            Each version uses a different prompt engineering strategy — pick the one that fits your use case.
          </p>
        </div>
      )}
    </div>
  );
}