import { useState } from 'react';
import { IconWand, IconUserStar, IconArrowsRightLeft, IconCopy, IconCheck } from '@tabler/icons-react';

const STRATEGY_ICONS = [IconWand, IconUserStar, IconArrowsRightLeft];

const STRATEGY_COLORS = [
  { accent: '#534AB7', light: '#EEEDFE', border: '#AFA9EC' }, // purple — Clarity & Precision
  { accent: '#0F6E56', light: '#E1F5EE', border: '#5DCAA5' }, // teal   — Role + Context
  { accent: '#993C1D', light: '#FAECE7', border: '#F0997B' }, // coral  — Chain of Thought
];

export function VersionCard({ version, idx, onCopy, copied }) {
  const sc   = STRATEGY_COLORS[idx];
  const Icon = STRATEGY_ICONS[idx];
  const isCopied = copied === idx;

  return (
    <div style={{
      background: 'var(--bg)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 16,
    }}>
      {/* ── Header ── */}
      <div style={{
        padding: '14px 18px 12px',
        borderBottom: '1px solid var(--border)',
        background: sc.light,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <Icon size={18} color={sc.accent} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 500, fontSize: 14, color: sc.accent }}>
            {version.strategy}
          </p>
          <p style={{ margin: '1px 0 0', fontSize: 12, color: sc.accent, opacity: 0.8 }}>
            {version.tagline}
          </p>
        </div>
        <span style={{
          fontSize: 12, fontWeight: 500, padding: '3px 10px',
          background: sc.accent, color: '#fff', borderRadius: 20,
        }}>
          v{idx + 1}
        </span>
      </div>

      {/* ── Prompt body ── */}
      <div style={{ padding: '14px 18px' }}>
        <div style={{
          background: 'var(--code-bg)',
          borderRadius: 8,
          padding: '12px 14px',
          marginBottom: 14,
          position: 'relative',
        }}>
          <p style={{
            margin: 0,
            fontSize: 13.5,
            lineHeight: 1.6,
            color: 'var(--text-h)',
            whiteSpace: 'pre-wrap',
            fontFamily: 'var(--mono)',
            paddingRight: 72, // space for copy button
          }}>
            {version.prompt}
          </p>
          <button
            onClick={() => onCopy(version.prompt, idx)}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: 12,
              color: 'var(--text)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {isCopied
              ? <><IconCheck size={13} /> Copied</>
              : <><IconCopy size={13} /> Copy</>
            }
          </button>
        </div>

        {/* ── Changes list ── */}
        <p style={{
          margin: '0 0 8px',
          fontSize: 12,
          fontWeight: 500,
          color: 'var(--text)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          What changed
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {version.changes.map((change, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: sc.light,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 1,
              }}>
                <IconCheck size={11} color={sc.accent} />
              </div>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-h)', lineHeight: 1.5 }}>
                {change}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}