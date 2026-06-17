import { useState } from 'react';
import { callGroq } from './api.js';
import { ANALYSIS_SYSTEM } from './prompts/analysis.js';
import { IMPROVE_SYSTEM } from './prompts/improve.js';
import { InputModule } from './components/InputModule.jsx';

function AnalysisPanel({ analysis }) {
  return (
    <pre style={{ background: 'var(--code-bg)', padding: 16, borderRadius: 8, textAlign: 'left', fontSize: 12, overflow: 'auto' }}>
      {JSON.stringify(analysis, null, 2)}
    </pre>
  );
}

function VersionsPanel({ versions }) {
  return (
    <pre style={{ background: 'var(--code-bg)', padding: 16, borderRadius: 8, textAlign: 'left', fontSize: 12, overflow: 'auto' }}>
      {JSON.stringify(versions, null, 2)}
    </pre>
  );
}
// ──────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [input,    setInput]    = useState('');
  const [phase,    setPhase]    = useState('idle');     // idle | analyzing | improving | done | error
  const [analysis, setAnalysis] = useState(null);
  const [versions, setVersions] = useState(null);
  const [copied,   setCopied]   = useState(null);       // index of copied version card
  const [error,    setError]    = useState('');

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

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1rem', textAlign: 'left' }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Prompt Optimizer</h1>
      <p style={{ color: 'var(--text)', marginBottom: 24, fontSize: 14 }}>
        Paste any prompt and get a diagnosis plus 3 improved versions.
      </p>

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
        <div style={{ padding: '12px 16px', background: '#FCEBEB', border: '1px solid #F09595',
          borderRadius: 8, marginBottom: 16, color: '#A32D2D', fontSize: 14 }}>
          ⚠ {error}
        </div>
      )}

      {analysis && <AnalysisPanel analysis={analysis} />}
      {versions  && <VersionsPanel versions={versions} />}
    </div>
  );
}