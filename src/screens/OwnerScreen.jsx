import React from 'react';
import { fmt, riskColor, riskBg, riskLabel } from '../components/ui.jsx';
import { color, radius, shadow, numericStyle } from '../theme.js';
import { buildRoster, currentMonthDisplay } from '../data/stats.js';

export default function OwnerScreen({ designers, entries }) {
  const roster = buildRoster(designers, entries);
  const totalRevenue = roster.reduce((s, d) => s + d.revenue, 0);
  const highRisk = roster.filter(d => d.risk === 'high');

  const summaryCardStyle = {
    flex: 1, background: color.surface, borderRadius: radius.lg, padding: '14px 16px',
    border: `1px solid ${color.hairline}`, boxShadow: shadow.soft,
  };

  return (
    <div style={{ padding: '20px 16px 100px' }}>
      <div style={{ fontSize: 13, color: color.textSecondary }}>{currentMonthDisplay()} · 團隊總覽</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: color.textPrimary, marginTop: 2, marginBottom: 16 }}>
        留才風險儀表板
      </div>

      {designers.length === 0 ? (
        <div style={{
          background: color.surface, borderRadius: radius.lg, padding: 24, border: `1px solid ${color.hairline}`,
          textAlign: 'center', color: color.textSecondary, fontSize: 13, lineHeight: 1.7,
        }}>
          還沒有任何設計師資料。<br />去「設定」分頁新增團隊成員吧。
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <div style={summaryCardStyle}>
              <div style={{ fontSize: 11, color: color.textSecondary, fontWeight: 600 }}>團隊總業績</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: color.textPrimary, marginTop: 4, ...numericStyle }}>
                ${fmt(totalRevenue)}
              </div>
            </div>
            <div style={summaryCardStyle}>
              <div style={{ fontSize: 11, color: color.textSecondary, fontWeight: 600 }}>在職設計師</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: color.textPrimary, marginTop: 4, ...numericStyle }}>
                {roster.length}
              </div>
            </div>
            <div style={summaryCardStyle}>
              <div style={{ fontSize: 11, color: color.textSecondary, fontWeight: 600 }}>高風險人數</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: color.rose, marginTop: 4, ...numericStyle }}>
                {highRisk.length}
              </div>
            </div>
          </div>

          {highRisk.length > 0 && (
            <div style={{
              background: color.roseTint, border: '1px solid #E6C7C1', borderRadius: radius.lg,
              padding: 14, marginBottom: 16,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: color.roseDeep }}>⚠ 需要關注</div>
              <div style={{ fontSize: 12.5, color: color.roseDeep, marginTop: 4, lineHeight: 1.6 }}>
                {highRisk.map(d => d.name).join('、')} 業績連續下滑或回頭客偏低，是離職前兆常見訊號，建議主動找他們聊聊。
              </div>
            </div>
          )}

          <div style={{ fontSize: 13, fontWeight: 600, color: color.textPrimary, marginBottom: 10 }}>設計師狀態</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {roster.map(d => (
              <div key={d.id} style={{
                background: color.surface, borderRadius: radius.lg, padding: '14px 16px',
                border: `1px solid ${color.hairline}`, display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 20, background: color.surfaceSunken,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, color: color.plum, fontSize: 14, flexShrink: 0,
                }}>
                  {d.name[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: color.textPrimary }}>{d.name}</div>
                  <div style={{ fontSize: 11.5, color: color.textSecondary, marginTop: 2, ...numericStyle }}>
                    {d.hasData
                      ? `$${fmt(d.revenue)} · 回頭率 ${Math.round(d.repeatRate * 100)}% · ${d.trendPct >= 0 ? '↑' : '↓'}${Math.abs(d.trendPct).toFixed(0)}%`
                      : '本月尚無記錄'}
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
        </>
      )}
    </div>
  );
}
