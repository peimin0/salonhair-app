import React from 'react';
import { StatCard, TrendBars, fmt } from '../components/ui.jsx';
import { statsForDesignerMonth, trendForDesigner, growthPct, currentMonthKey, previousMonthKey, currentMonthDisplay } from '../data/stats.js';

export default function DesignerScreen({ designer, entries }) {
  if (!designer) return null;

  const cur = statsForDesignerMonth(entries, designer.id, currentMonthKey());
  const prev = statsForDesignerMonth(entries, designer.id, previousMonthKey());
  const commission = Math.round(cur.revenue * designer.commissionRate);
  const repeatRate = cur.clients > 0 ? Math.round((cur.repeatClients / cur.clients) * 100) : 0;
  const growth = growthPct(cur.revenue, prev.revenue).toFixed(1);
  const trend = trendForDesigner(entries, designer.id, 4);
  const hasAnyData = trend.some(t => t.value > 0);

  return (
    <div style={{ padding: '20px 16px 100px' }}>
      <div style={{ fontSize: 13, color: '#6E5B68' }}>{currentMonthDisplay()} · 我的業績</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#2B1E2A', marginTop: 2, marginBottom: 16 }}>
        {designer.name} 設計師
      </div>

      <div style={{
        background: '#4A2545', borderRadius: 20, padding: '20px 18px', color: '#fff', marginBottom: 14,
      }}>
        <div style={{ fontSize: 12, opacity: 0.75, fontWeight: 600 }}>
          本月實拿（抽成 {Math.round(designer.commissionRate * 100)}%）
        </div>
        <div style={{ fontSize: 32, fontWeight: 700, marginTop: 4 }}>NT$ {fmt(commission)}</div>
        {prev.revenue > 0 && (
          <div style={{
            display: 'inline-block', marginTop: 10, fontSize: 12, fontWeight: 600,
            background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: 999,
          }}>
            {growth >= 0 ? '↑' : '↓'} 較上月 {Math.abs(growth)}%
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <StatCard label="總業績" value={`$${fmt(cur.revenue)}`} />
        <StatCard label="服務客數" value={cur.clients} sub={`回頭客 ${cur.repeatClients} 位`} />
        <StatCard label="回頭率" value={cur.clients > 0 ? `${repeatRate}%` : '—'} accent="#6F8B6E" />
      </div>

      <div style={{
        background: '#FFFFFF', borderRadius: 16, padding: 16, border: '1px solid #EBE2E6', marginBottom: 14,
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#2B1E2A', marginBottom: 10 }}>近 4 個月業績趨勢</div>
        {hasAnyData ? <TrendBars data={trend} /> : (
          <div style={{ fontSize: 12.5, color: '#9C8B97', padding: '20px 0', textAlign: 'center' }}>
            還沒有記錄，去「記錄」分頁新增第一筆吧
          </div>
        )}
      </div>

      <div style={{
        background: '#F6EEDD', borderRadius: 16, padding: 14, fontSize: 12.5, color: '#6E5B68', lineHeight: 1.6,
      }}>
        數字只有你自己看得到。老闆看到的是團隊整體概況，不會看到你每一筆客人的細節。
      </div>
    </div>
  );
}
