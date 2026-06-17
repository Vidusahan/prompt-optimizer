import {
  IconAlertTriangle, IconInfoCircle, IconLayoutList,
  IconUserQuestion, IconAdjustmentsOff, IconTargetOff,
  IconCodeOff, IconArrowsMaximize, IconArrowsMinimize,
  IconAlertCircle,
} from '@tabler/icons-react';

const ISSUE_COLORS = {
  vagueness:      { bg: '#FAECE7', text: '#993C1D', border: '#F0997B' },
  no_context:     { bg: '#FAEEDA', text: '#854F0B', border: '#EF9F27' },
  no_format:      { bg: '#E6F1FB', text: '#185FA5', border: '#85B7EB' },
  no_role:        { bg: '#EEEDFE', text: '#534AB7', border: '#AFA9EC' },
  no_constraints: { bg: '#FBEAF0', text: '#993556', border: '#ED93B1' },
  ambiguous_goal: { bg: '#FAECE7', text: '#993C1D', border: '#F0997B' },
  no_examples:    { bg: '#EAF3DE', text: '#3B6D11', border: '#97C459' },
  too_long:       { bg: '#FCEBEB', text: '#A32D2D', border: '#F09595' },
  too_short:      { bg: '#FCEBEB', text: '#A32D2D', border: '#F09595' },
};

const ISSUE_ICONS = {
  vagueness:      IconAlertTriangle,
  no_context:     IconInfoCircle,
  no_format:      IconLayoutList,
  no_role:        IconUserQuestion,
  no_constraints: IconAdjustmentsOff,
  ambiguous_goal: IconTargetOff,
  no_examples:    IconCodeOff,
  too_long:       IconArrowsMaximize,
  too_short:      IconArrowsMinimize,
};

export function IssueBadge({ issue }) {
  const c    = ISSUE_COLORS[issue.type] || ISSUE_COLORS.vagueness;
  const Icon = ISSUE_ICONS[issue.type]  || IconAlertCircle;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
      padding: '10px 14px',
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: 8,
      marginBottom: 8,
    }}>
      <Icon size={16} color={c.text} style={{ marginTop: 1, flexShrink: 0 }} />
      <div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: c.text }}>
          {issue.label}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 13, color: c.text, opacity: 0.85 }}>
          {issue.description}
        </p>
      </div>
    </div>
  );
}