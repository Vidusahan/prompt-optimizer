import { useState } from 'react';
import { IconKey, IconX, IconCheck, IconExternalLink } from '@tabler/icons-react';

export function ApiKeyModal({ onClose }) {
  const saved = localStorage.getItem('groq_api_key') || '';
  const [value, setValue] = useState(saved);
  const [saved_, setSaved_] = useState(false);

  const handleSave = () => {
    if (value.trim()) {
      localStorage.setItem('groq_api_key', value.trim());
    } else {
      localStorage.removeItem('groq_api_key');
    }
    setSaved_(true);
    setTimeout(() => {
      setSaved_(false);
      onClose();
    }, 900);
  };

  const handleClear = () => {
    localStorage.removeItem('groq_api_key');
    setValue('');
  };

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      {/* Modal card */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: '28px 28px 24px',
          width: '100%',
          maxWidth: 440,
          boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconKey size={18} color="var(--accent)" />
            <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-h)' }}>
              Your Groq API Key
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: '1px solid var(--border)',
              borderRadius: 6, cursor: 'pointer', padding: '3px 6px',
              color: 'var(--text)', display: 'flex', alignItems: 'center',
            }}
          >
            <IconX size={14} />
          </button>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, marginBottom: 16 }}>
          Optionally provide your own{' '}
          <a
            href="https://console.groq.com/keys"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3 }}
          >
            Groq API key <IconExternalLink size={11} />
          </a>
          {' '}to use your own quota. Your key is stored only in your browser's local storage and never sent to our servers.
        </p>

        <input
          type="password"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="gsk_…"
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid var(--border)',
            borderRadius: 8,
            background: 'transparent',
            color: 'var(--text-h)',
            fontSize: 14,
            fontFamily: 'monospace',
            outline: 'none',
            boxSizing: 'border-box',
            marginBottom: 14,
          }}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
        />

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {saved && (
            <button
              onClick={handleClear}
              style={{
                fontSize: 13, padding: '7px 14px', borderRadius: 8,
                border: '1px solid var(--border)', background: 'transparent',
                cursor: 'pointer', color: 'var(--text)',
              }}
            >
              Clear key
            </button>
          )}
          <button
            onClick={handleSave}
            style={{
              fontSize: 13, padding: '7px 18px', borderRadius: 8,
              border: 'none', background: saved_ ? '#1D9E75' : 'var(--accent)',
              color: '#fff', cursor: 'pointer', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'background 0.2s',
            }}
          >
            {saved_ ? <><IconCheck size={14} /> Saved!</> : 'Save key'}
          </button>
        </div>
      </div>
    </div>
  );
}
