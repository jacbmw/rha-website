'use client';

import {
  createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useSyncExternalStore,
} from 'react';
import WebinarBanner from './WebinarBanner';
import ArticleEbookPanel from './panels/ArticleEbookPanel';
import ArticleFooterPanel from './panels/ArticleFooterPanel';
import ArticleInlinePanel from './panels/ArticleInlinePanel';
import SuburbScoreWidget from './SuburbScoreWidget';

const STORAGE_KEY = 'rha_admix_stats';

const PANELS = [
  { key: 'panel-webinar-banner', component: WebinarBanner, defaultProps: { placement: 'inline' } },
  { key: 'panel-article-ebook', component: ArticleEbookPanel },
  { key: 'panel-article-footer', component: ArticleFooterPanel },
  { key: 'panel-article-inline', component: ArticleInlinePanel },
  { key: 'panel-suburb-score', component: SuburbScoreWidget, defaultProps: { placement: 'article' } },
];

const AdMixContext = createContext(null);

function readStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch { return {}; }
}

function writeStats(stats) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stats)); } catch {}
}

function getPanelStats(stats, key) {
  const s = stats[key];
  return { displays: s?.displays || 0, clicks: s?.clicks || 0, conversions: s?.conversions || 0 };
}

function scorePanel(stats, key) {
  const { displays, clicks, conversions } = getPanelStats(stats, key);
  return (clicks + conversions * 2 + 1) / (displays + 2);
}

function rankPanels(stats) {
  const scored = PANELS.map((p) => ({ panel: p, score: scorePanel(stats, p.key) }));
  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.panel);
}

function subscribeStats(cb) {
  if (typeof window === 'undefined') return () => {};
  const handler = (event) => { if (event.key === STORAGE_KEY) cb(); };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

function getSnapshot() {
  return typeof window === 'undefined' ? '' : JSON.stringify(readStats());
}

function getServerSnapshot() {
  return '';
}

export function AdMixProvider({ variants, children }) {
  const statsHash = useSyncExternalStore(subscribeStats, getSnapshot, getServerSnapshot);
  const ready = statsHash !== '';
  const order = ready ? rankPanels(readStats()) : PANELS;
  const nextIndexRef = useRef(0);
  const slotsRef = useRef(new Map());

  const claim = useCallback((id) => {
    const existing = slotsRef.current.get(id);
    if (existing) return existing;
    const panel = order[nextIndexRef.current % order.length];
    slotsRef.current.set(id, panel);
    nextIndexRef.current += 1;
    return panel;
  }, [order]);

  const recordDisplay = useCallback((key) => {
    const stats = readStats();
    const s = getPanelStats(stats, key);
    s.displays += 1;
    stats[key] = s;
    writeStats(stats);
  }, []);

  const recordClick = useCallback((key) => {
    const stats = readStats();
    const s = getPanelStats(stats, key);
    s.clicks += 1;
    stats[key] = s;
    writeStats(stats);
  }, []);

  const recordConversion = useCallback((key) => {
    const stats = readStats();
    const s = getPanelStats(stats, key);
    s.conversions += 1;
    stats[key] = s;
    writeStats(stats);
  }, []);

  const value = useMemo(() => ({
    ready,
    variants,
    claim,
    recordDisplay,
    recordClick,
    recordConversion,
  }), [ready, variants, claim, recordDisplay, recordClick, recordConversion]);

  return <AdMixContext.Provider value={value}>{children}</AdMixContext.Provider>;
}

export function useAdSlot() {
  const ctx = useContext(AdMixContext);
  const id = useId();
  const panel = useMemo(() => {
    if (!ctx?.ready) return null;
    return ctx.claim(id);
  }, [ctx, id]);

  useEffect(() => {
    if (panel) ctx?.recordDisplay(panel.key);
  }, [panel, ctx]);

  if (!ctx || !panel) return null;
  return {
    panel,
    variants: ctx.variants,
    recordClick: ctx.recordClick,
    recordConversion: ctx.recordConversion,
  };
}
