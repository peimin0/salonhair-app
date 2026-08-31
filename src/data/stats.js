// stats.js — 從真實記錄動態計算業績、趨勢、留才風險

function monthKey(dateISO) {
  const d = new Date(dateISO);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(offsetFromNow = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() + offsetFromNow);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthDisplay(key) {
  const [y, m] = key.split('-');
  return `${y}年${parseInt(m, 10)}月`;
}

// 回傳某設計師在某月份的統計
export function statsForDesignerMonth(entries, designerId, monthKeyStr) {
  const list = entries.filter(
    e => e.designerId === designerId && monthKey(e.dateISO) === monthKeyStr
  );
  const revenue = list.reduce((s, e) => s + e.amount, 0);
  const clients = list.length;
  const repeatClients = list.filter(e => e.isRepeat).length;
  return { revenue, clients, repeatClients, entries: list };
}

// 近 N 個月趨勢(含當月),回傳 [{key, label, value}]
export function trendForDesigner(entries, designerId, months = 4) {
  const result = [];
  for (let i = months - 1; i >= 0; i--) {
    const key = monthLabel(-i);
    const { revenue } = statsForDesignerMonth(entries, designerId, key);
    result.push({ key, label: monthDisplay(key).replace(/^\d+年/, ''), value: revenue });
  }
  return result;
}

// 風險評級:根據本月 vs 上月成長率 + 回頭率
export function riskLevelFor(trendPct, repeatRate, hasData) {
  if (!hasData) return 'unknown';
  if (trendPct <= -15 || repeatRate < 0.3) return 'high';
  if (trendPct < 0 || repeatRate < 0.5) return 'medium';
  return 'low';
}

export function growthPct(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function currentMonthKey() {
  return monthLabel(0);
}

export function previousMonthKey() {
  return monthLabel(-1);
}

export function currentMonthDisplay() {
  return monthDisplay(currentMonthKey());
}

// 幫每位設計師算出完整的當月摘要,給老闆總覽用
export function buildRoster(designers, entries) {
  const curKey = currentMonthKey();
  const prevKey = previousMonthKey();

  return designers.map(d => {
    const cur = statsForDesignerMonth(entries, d.id, curKey);
    const prev = statsForDesignerMonth(entries, d.id, prevKey);
    const repeatRate = cur.clients > 0 ? cur.repeatClients / cur.clients : 0;
    const trendPct = growthPct(cur.revenue, prev.revenue);
    const hasData = cur.clients > 0 || prev.clients > 0;
    return {
      ...d,
      revenue: cur.revenue,
      clients: cur.clients,
      repeatRate,
      trendPct,
      risk: riskLevelFor(trendPct, repeatRate, hasData),
      hasData,
    };
  });
}
