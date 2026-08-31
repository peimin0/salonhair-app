// theme.js — 髮廊業績通 視覺系統
// 色彩以美髮沙龍的質感為出發點：深梅紫代表專業與信任，香檳金代表金錢／抽成，
// 鼠尾草綠代表穩定，霧玫瑰代表需要留意的風險訊號。

export const color = {
  bg: '#FAF7F3',
  surface: '#FFFFFF',
  surfaceSunken: '#F3ECEF',
  hairline: '#EBE2E6',

  textPrimary: '#2B1E2A',
  textSecondary: '#6E5B68',
  textFaint: '#9C8B97',

  plum: '#4A2545',
  plumDeep: '#34172F',

  gold: '#B8934A',
  goldDeep: '#8A6B2A',
  goldTint: '#F6EEDD',

  sage: '#6F8B6E',
  sageTint: '#E8EEE6',

  rose: '#B8756B',
  roseDeep: '#8A4A40',
  roseTint: '#F5E6E3',
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 };

export const radius = { sm: 10, md: 14, lg: 16, xl: 20, pill: 999 };

export const shadow = {
  // 只用在真正需要拉出層次的元素（英雄卡片、底部導覽），不是每張卡都套
  elevated: '0 10px 28px rgba(43, 30, 42, 0.16)',
  soft: '0 2px 10px rgba(43, 30, 42, 0.05)',
};

// 金額數字用等寬對齊，直向排列時位數才會對齊，讀起來更像真正的財務數字
export const numericStyle = {
  fontVariantNumeric: 'tabular-nums',
  letterSpacing: '-0.01em',
};
