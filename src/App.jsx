import React, { useState } from 'react';

// ---------- 模擬資料 ----------
const designer = {
  name: '小雅',
  monthLabel: '2026年8月',
  revenue: 186400,
  commissionRate: 0.45,
  clients: 62,
  repeatClients: 41,
  trend: [
    { label: '5月', value: 152000 },
    { label: '6月', value: 164500 },
    { label: '7月', value: 171200 },
    { label: '8月', value: 186400 },
  ],
};

const roster = [
  { name: '小雅', revenue: 186400, trendPct: 8.9, repeatRate: 0.66, risk: 'low' },
  { name: '志豪', revenue: 94200, trendPct: -18.3, repeatRate: 0.31, risk: 'high' },
  { name: '珮珊', revenue: 141800, trendPct: -4.1, repeatRate: 0.48, risk: 'medium' },
  { name: 'Kevin', revenue: 210300, trendPct: 2.2, repeatRate: 0.71, risk: 'low' },
];

const services = ['剪髮', '染髮', '燙髮', '護髮'];

const riskColor = { low: '#6F8B6E', medium: '#B8934A', high: '#B8756B' };
const riskBg = { low: '#E8EEE6', medium: '#F6EEDD', high: '#F5E6E3' };
const riskLabel = { low: '穩定', medium: '需留意', high: '高風險' };

function fmt(n) {
  return n.toLocaleString('zh-TW');
}

// ---------- 共用元件 ----------
function StatCard({ label, value, sub, accent }) {
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

function TrendBars({ data }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 100, padding: '0 4px' }}>
      {data.map((d, i) => {
        const h = Math.max(8, (d.value / max) * 84);
        const isLast = i === data.length - 1;
        return (
          <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
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

// ---------- 畫面一:設計師個人業績 ----------
function DesignerScreen() {
  const commission = Math.round(designer.revenue * designer.commissionRate);
  const repeatRate = Math.round((designer.repeatClients / designer.clients) * 100);
  const prev = designer.trend[designer.trend.length - 2].value;
  const growth = (((designer.revenue - prev) / prev) * 100).toFixed(1);

  return (
    <div style={{ padding: '20px 16px 100px' }}>
      <div style={{ fontSize: 13, color: '#6E5B68' }}>{designer.monthLabel} · 我的業績</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#2B1E2A', marginTop: 2, marginBottom: 16 }}>
        {designer.name} 設計師
      </div>

      <div style={{
        background: '#4A2545', borderRadius: 20, padding: '20px 18px', color: '#fff', marginBottom: 14,
      }}>
        <div style={{ fontSize: 12, opacity: 0.75, fontWeight: 600 }}>本月實拿(抽成 {Math.round(designer.commissionRate * 100)}%)</div>
        <div style={{ fontSize: 32, fontWeight: 700, marginTop: 4 }}>NT$ {fmt(commission)}</div>
        <div style={{
          display: 'inline-block', marginTop: 10, fontSize: 12, fontWeight: 600,
          background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: 999,
        }}>
          {growth >= 0 ? '↑' : '↓'} 較上月 {Math.abs(growth)}%
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <StatCard label="總業績" value={`$${fmt(designer.revenue)}`} />
        <StatCard label="服務客數" value={designer.clients} sub={`回頭客 ${designer.repeatClients} 位`} />
        <StatCard label="回頭率" value={`${repeatRate}%`} accent="#6F8B6E" />
      </div>

      <div style={{
        background: '#FFFFFF', borderRadius: 16, padding: 16, border: '1px solid #EBE2E6', marginBottom: 14,
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#2B1E2A', marginBottom: 10 }}>近 4 個月業績趨勢</div>
        <TrendBars data={designer.trend} />
      </div>

      <div style={{
        background: '#F6EEDD', borderRadius: 16, padding: 14, fontSize: 12.5, color: '#6E5B68', lineHeight: 1.6,
      }}>
        數字只有你自己看得到。老闆看到的是團隊整體概況，不會看到你每一筆客人的細節。
      </div>
    </div>
  );
}

// ---------- 畫面二:老闆留才風險儀表板 ----------
function OwnerScreen() {
  const totalRevenue = roster.reduce((s, d) => s + d.revenue, 0);
  const highRisk = roster.filter(d => d.risk === 'high');

  return (
    <div style={{ padding: '20px 16px 100px' }}>
      <div style={{ fontSize: 13, color: '#6E5B68' }}>{designer.monthLabel} · 團隊總覽</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#2B1E2A', marginTop: 2, marginBottom: 16 }}>
        留才風險儀表板
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <StatCard label="團隊總業績" value={`$${fmt(totalRevenue)}`} />
        <StatCard label="在職設計師" value={roster.length} />
        <StatCard label="高風險人數" value={highRisk.length} accent="#B8756B" />
      </div>

      {highRisk.length > 0 && (
        <div style={{
          background: '#F5E6E3', border: '1px solid #E6C7C1', borderRadius: 16,
          padding: 14, marginBottom: 16,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#8A4A40' }}>⚠ 需要關注</div>
          <div style={{ fontSize: 12.5, color: '#8A4A40', marginTop: 4, lineHeight: 1.6 }}>
            {highRisk.map(d => d.name).join('、')} 業績連續下滑且回頭客偏低，是離職前兆常見訊號，建議主動找他們聊聊。
          </div>
        </div>
      )}

      <div style={{ fontSize: 13, fontWeight: 600, color: '#2B1E2A', marginBottom: 10 }}>設計師狀態</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {roster.map(d => (
          <div key={d.name} style={{
            background: '#FFFFFF', borderRadius: 16, padding: '14px 16px',
            border: '1px solid #EBE2E6', display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 20, background: '#EFE3EC',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, color: '#4A2545', fontSize: 14, flexShrink: 0,
            }}>
              {d.name[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#2B1E2A' }}>{d.name}</div>
              <div style={{ fontSize: 11.5, color: '#6E5B68', marginTop: 2 }}>
                ${fmt(d.revenue)} · 回頭率 {Math.round(d.repeatRate * 100)}% · {d.trendPct >= 0 ? '↑' : '↓'}{Math.abs(d.trendPct)}%
              </div>
            </div>
            <div style={{
              fontSize: 11, fontWeight: 700, color: riskColor[d.risk], background: riskBg[d.risk],
              padding: '5px 10px', borderRadius: 999, flexShrink: 0,
            }}>
              {riskLabel[d.risk]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- 畫面三:快速記錄 ----------
function EntryScreen() {
  const [service, setService] = useState(services[0]);
  const [amount, setAmount] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!amount) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
    setAmount('');
  };

  return (
    <div style={{ padding: '20px 16px 100px' }}>
      <div style={{ fontSize: 13, color: '#6E5B68' }}>今天</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#2B1E2A', marginTop: 2, marginBottom: 16 }}>
        新增一筆服務記錄
      </div>

      <div style={{ fontSize: 12, fontWeight: 600, color: '#6E5B68', marginBottom: 8 }}>服務項目</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        {services.map(s => (
          <button key={s} onClick={() => setService(s)} style={{
            padding: '9px 16px', borderRadius: 999, border: 'none', fontSize: 13, fontWeight: 600,
            background: service === s ? '#4A2545' : '#FFFFFF',
            color: service === s ? '#fff' : '#2B1E2A',
            boxShadow: service === s ? 'none' : 'inset 0 0 0 1px #EBE2E6',
          }}>
            {s}
          </button>
        ))}
      </div>

      <div style={{ fontSize: 12, fontWeight: 600, color: '#6E5B68', marginBottom: 8 }}>消費金額</div>
      <input
        type="number"
        inputMode="numeric"
        placeholder="輸入金額"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        style={{
          width: '100%', boxSizing: 'border-box', fontSize: 22, fontWeight: 700, color: '#2B1E2A',
          border: '1px solid #EBE2E6', borderRadius: 14, padding: '14px 16px', marginBottom: 18,
          background: '#fff', outline: 'none',
        }}
      />

      <button onClick={handleSave} style={{
        width: '100%', padding: '15px 0', borderRadius: 14, border: 'none',
        background: saved ? '#6F8B6E' : '#4A2545', color: '#fff', fontSize: 15, fontWeight: 700,
      }}>
        {saved ? '已記錄 ✓' : '儲存記錄'}
      </button>

      <div style={{ fontSize: 12, color: '#6E5B68', marginTop: 14, lineHeight: 1.6 }}>
        這是示範版本,記錄暫時不會保存。正式版會自動累計進「我的業績」與老闆的團隊總覽。
      </div>
    </div>
  );
}

// ---------- 底部導覽 ----------
const tabs = [
  { key: 'designer', label: '我的業績', icon: '📊' },
  { key: 'owner', label: '團隊總覽', icon: '🛡️' },
  { key: 'entry', label: '記錄', icon: '＋' },
];

export default function App() {
  const [tab, setTab] = useState('designer');

  return (
    <div style={{
      minHeight: '100vh', background: '#FAF7F5', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ flex: 1 }}>
        {tab === 'designer' && <DesignerScreen />}
        {tab === 'owner' && <OwnerScreen />}
        {tab === 'entry' && <EntryScreen />}
      </div>

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(10px)',
        borderTop: '1px solid #EBE2E6', display: 'flex',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, border: 'none', background: 'none', padding: '10px 0 8px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          }}>
            <span style={{ fontSize: 18, opacity: tab === t.key ? 1 : 0.45 }}>{t.icon}</span>
            <span style={{
              fontSize: 10.5, fontWeight: 600,
              color: tab === t.key ? '#4A2545' : '#9C8B97',
            }}>
              {t.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
