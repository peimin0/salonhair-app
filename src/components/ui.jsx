import React from 'react';
import { color, radius, shadow, numericStyle } from '../theme.js';

export function fmt(n) {
  return Math.round(n).toLocaleString('zh-TW');
}

export function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: color.surface, borderRadius: radius.lg, padding: '14px 16px',
      flex: 1, minWidth: 0, border: `1px solid ${color.hairline}`, boxShadow: shadow.soft,
    }}>
      <div style={{ fontSize: 11, color: color.textSecondary, fontWeight: 600, letterSpacing: 0.2 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: accent || color.textPrimary, marginTop: 4, ...numericStyle }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: color.textSecondary, marginTop: 2 }}>{sub}</div>}
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
              background: isLast ? color.plum : color.surfaceSunken,
            }} />
            <div style={{ fontSize: 10, color: color.textSecondary }}>{d.label}</div>
          </div>
        );
      })}
    </div>
  );
}

export function Chip({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '9px 16px', borderRadius: radius.pill, border: 'none', fontSize: 13, fontWeight: 600,
      background: active ? color.plum : color.surface,
      color: active ? '#fff' : color.textPrimary,
      boxShadow: active ? 'none' : `inset 0 0 0 1px ${color.hairline}`,
    }}>
      {children}
    </button>
  );
}

export function PrimaryButton({ onClick, children, tone = 'plum', disabled }) {
  const bg = disabled ? '#D9CFD6' : tone === 'plum' ? color.plum : color.sage;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: '100%', padding: '15px 0', borderRadius: radius.md, border: 'none',
      background: bg, color: '#fff', fontSize: 15, fontWeight: 700,
    }}>
      {children}
    </button>
  );
}

export const riskColor = { low: color.sage, medium: color.gold, high: color.rose, unknown: color.textFaint };
export const riskBg = { low: color.sageTint, medium: color.goldTint, high: color.roseTint, unknown: color.surfaceSunken };
export const riskLabel = { low: '穩定', medium: '需留意', high: '高風險', unknown: '尚無資料' };

// 客人姓名搜尋/選擇輸入框。點擊就會列出所有既有客人可以直接選，
// 開始打字則篩選符合的名字；打完全新的名字（沒對到任何既有客人）
// 儲存時才會真的建立新客人資料。
export function CustomerAutocomplete({ customers, queryText, onQueryChange, selectedId, onSelect }) {
  const [focused, setFocused] = React.useState(false);
  const q = queryText.trim();
  const list = q
    ? customers.filter(c => c.name.includes(q) || (c.phone && c.phone.includes(q)))
    : customers.slice().sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'));
  const matches = list.slice(0, 20);

  return (
    <div style={{ position: 'relative' }}>
      <input
        value={queryText}
        onChange={e => { onQueryChange(e.target.value); onSelect(null); }}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        placeholder={customers.length > 0 ? '輸入姓名搜尋，或點選既有客人' : '輸入客人姓名或電話'}
        style={{
          width: '100%', boxSizing: 'border-box', fontSize: 15, color: color.textPrimary,
          border: `1px solid ${color.hairline}`, borderRadius: radius.md, padding: '13px 40px 13px 16px',
          background: color.surface, outline: 'none',
        }}
      />
      {customers.length > 0 && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color.textFaint} strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      )}
      {focused && matches.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, zIndex: 10,
          background: color.surface, borderRadius: radius.sm, border: `1px solid ${color.hairline}`,
          boxShadow: shadow.elevated, overflow: 'auto', maxHeight: 240,
        }}>
          {matches.map(c => (
            <button key={c.id} onMouseDown={() => onSelect(c)} style={{
              width: '100%', textAlign: 'left', padding: '11px 14px', border: 'none',
              borderBottom: `1px solid ${color.hairline}`,
              background: selectedId === c.id ? color.goldTint : color.surface, fontSize: 13.5, color: color.textPrimary,
            }}>
              {c.name}{c.phone ? ` · ${c.phone}` : ''}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// 頁面頂部圖片橫幅，底部帶漸層遮罩融入背景
export function PhotoBanner({ src, height = 150, style }) {
  return (
    <div style={{
      position: 'relative', width: '100%', height, borderRadius: radius.lg,
      overflow: 'hidden', ...style,
    }}>
      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(43,30,42,0) 45%, rgba(43,30,42,0.30) 100%)',
      }} />
    </div>
  );
}

// 分頁列圖示：線條風格，統一 stroke，避免用 emoji 造成風格不一致
const iconPaths = {
  shield: 'M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z',
  chart: 'M4 20V10M11 20V4M18 20v-7',
  plus: 'M12 5v14M5 12h14',
  list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
  gear: 'M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z M19.4 13.5a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.9 2.9l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.6v.2a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.6 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.9-2.9l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.6-1H4a2 2 0 110-4h.1a1.7 1.7 0 001.6-1 1.7 1.7 0 00-.3-1.9l-.1-.1A2 2 0 118.2 2.7l.1.1a1.7 1.7 0 001.9.3H10.5a1.7 1.7 0 001-1.6V1a2 2 0 114 0v.1a1.7 1.7 0 001 1.6 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.9 2.9l-.1.1a1.7 1.7 0 00-.3 1.9V6.5a1.7 1.7 0 001.6 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.6 1z',
};

export function TabIcon({ name, active }) {
  const d = iconPaths[name];
  if (!d) return null;
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke={active ? color.plum : color.textFaint} strokeWidth={active ? 2 : 1.6}
      strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}
