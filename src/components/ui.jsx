import React from 'react';

export function fmt(n) {
  return Math.round(n).toLocaleString('zh-TW');
}

export function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: '#FFFFFF', borderRadius: 16, padding: '14px 16px',
      flex: 1, minWidth: 0, border: '1px solid #EBE2E6',
    }}>
      <div style={{ fontSize: 11, color: '#6E5B68', fontWeight: 600, letterSpacing: 0.4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: accent || '#2B1E2A', marginTop: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#6E5B68', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export function TrendBars({ data }) {
  const max = Math.max(1, ...data.map(d => d.value));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 100, padding: '0 4px' }}>
      {data.map((d, i) => {
        const h = d.value > 0 ? Math.max(8, (d.value / max) * 84) : 4;
        const isLast = i === data.length - 1;
        return (
          <div key={d.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: '100%', height: h, borderRadius: 6,
              background: isLast ? '#4A2545' : '#EFE3EC',
            }} />
            <div style={{ fontSize: 10, color: '#6E5B68' }}>{d.label}</div>
          </div>
        );
      })}
    </div>
  );
}

export function Chip({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '9px 16px', borderRadius: 999, border: 'none', fontSize: 13, fontWeight: 600,
      background: active ? '#4A2545' : '#FFFFFF',
      color: active ? '#fff' : '#2B1E2A',
      boxShadow: active ? 'none' : 'inset 0 0 0 1px #EBE2E6',
    }}>
      {children}
    </button>
  );
}

export function PrimaryButton({ onClick, children, tone = 'plum', disabled }) {
  const bg = disabled ? '#D9CFD6' : tone === 'plum' ? '#4A2545' : '#6F8B6E';
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: '100%', padding: '15px 0', borderRadius: 14, border: 'none',
      background: bg, color: '#fff', fontSize: 15, fontWeight: 700,
    }}>
      {children}
    </button>
  );
}

export const riskColor = { low: '#6F8B6E', medium: '#B8934A', high: '#B8756B', unknown: '#9C8B97' };
export const riskBg = { low: '#E8EEE6', medium: '#F6EEDD', high: '#F5E6E3', unknown: '#F1EDEF' };
export const riskLabel = { low: '穩定', medium: '需留意', high: '高風險', unknown: '尚無資料' };

// 客人姓名搜尋/選擇輸入框。輸入既有客人姓名可從清單點選，
// 輸入新名字（清單沒有比對到）就當作新客人，儲存時才會真的建立。
export function CustomerAutocomplete({ customers, queryText, onQueryChange, selectedId, onSelect }) {
  const [focused, setFocused] = React.useState(false);
  const q = queryText.trim();
  const matches = q
    ? customers.filter(c => c.name.includes(q) || (c.phone && c.phone.includes(q))).slice(0, 6)
    : [];

  return (
    <div style={{ position: 'relative' }}>
      <input
        value={queryText}
        onChange={e => { onQueryChange(e.target.value); onSelect(null); }}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        placeholder="輸入客人姓名或電話"
        style={{
          width: '100%', boxSizing: 'border-box', fontSize: 15, color: '#2B1E2A',
          border: '1px solid #EBE2E6', borderRadius: 14, padding: '13px 16px',
          background: '#fff', outline: 'none',
        }}
      />
      {focused && matches.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, zIndex: 10,
          background: '#fff', borderRadius: 12, border: '1px solid #EBE2E6',
          boxShadow: '0 6px 18px rgba(43,30,42,0.12)', overflow: 'hidden',
        }}>
          {matches.map(c => (
            <button key={c.id} onMouseDown={() => onSelect(c)} style={{
              width: '100%', textAlign: 'left', padding: '11px 14px', border: 'none',
              background: selectedId === c.id ? '#F6EEDD' : '#fff', fontSize: 13.5, color: '#2B1E2A',
            }}>
              {c.name}{c.phone ? ` · ${c.phone}` : ''}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
