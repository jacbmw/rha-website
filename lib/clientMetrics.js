export const clientMetrics = {
  clients: 997,
  properties: 1388,
  totalSpend: 699174652,
  currentValue: 983275698,
  totalGrowth: 284101046,
  medianCagr: 17.1,
  firstQuartileCagr: 11.8,
  thirdQuartileCagr: 22.5,
  updatedAt: '2026-08-13T07:21:00+10:00',
};

export function formatCurrency(value) {
  return `$${Number(value).toLocaleString('en-AU')}`;
}

export function formatPercent(value) {
  return `${value >= 0 ? '+' : ''}${Number(value).toFixed(1)}%`;
}
