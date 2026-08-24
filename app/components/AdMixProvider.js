'use client';

import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
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
    return raw ? JSON.parse(raw) || {} : {};
  } catch { return {}; }
}

function writeStats(stats) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stats)); } catch {}
}

function getPanelStats(stats, key) {
  const s = stats[key];
  return { displays: s?.displays || 0, clicks: s?.clicks || 0, conversions: s?.conversions || 0 };
}

function rankPanels(stats) {
  return PANELS.map((panel) => {
    const { displays, clicks, conversions } = getPanelStats(stats, panel.key);
    return { panel, score: (clicks + conversions * 2 + 1) / (displays + 2) };
  }).sort((a, b) => b.score - a.score).map(({ panel }) => panel);
}

export function AdMixProvider({ variants, children }) {
  const [order, setOrder] = useState(PANELS);
  const [ready, setReady] = useState(false);
  const nextIndexRef = useRef(0);
  const slotsRef = useRef(new Map());

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setOrder(rankPanels(readStats()));
      setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const claim = useCallback((id) => {
    const existing = slotsRef.current.get(id);
    if (existing) return existing;
    const panel = order[nextIndexRef.current % order.length];
    slotsRef.current.set(id, panel);
    nextIndexRef.current += 1;
    return panel;
  }, [order]);

  const record = useCallback((key, field) => {
    const stats = readStats();
    const current = getPanelStats(stats, key);
    current[field] += 1;
    stats[key] = current;
    writeStats(stats);
  }, []);

  const value = useMemo(() => ({
    ready,
    variants,
    claim,
    recordDisplay: (key) => record(key, 'displays'),
    recordClick: (key) => record(key, 'clicks'),
    recordConversion: (key) => record(key, 'conversions'),
  }), [ready, variants, claim, record]);

  return <AdMixContext.Provider value={value}>{children}</AdMixContext.Provider>;
}

export function useAdSlot() {
  const ctx = useContext(AdMixContext);
  const id = useId();
  const [panel, setPanel] = useState(null);

  useEffect(() => {
    if (!ctx?.ready) return undefined;
    const claimed = ctx.claim(id);
    const frame = requestAnimationFrame(() => setPanel(claimed));
    return () => cancelAnimationFrame(frame);
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
