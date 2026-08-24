'use client';

import {
  createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState,
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
  const cycleKeysRef = useRef(new Set());
  const slotsRef = useRef(new Map());

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setOrder(rankPanels(readStats()));
      setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const claim = useCallback((id, excludedKeys = []) => {
    const existing = slotsRef.current.get(id);
    if (existing) return existing;
    const excluded = new Set(excludedKeys);
    const eligible = order.filter((candidate) => !excluded.has(candidate.key));
    if (!eligible.length) return null;

    let panel;
    let panelIndex = -1;
    for (let offset = 0; offset < order.length; offset += 1) {
      const index = (nextIndexRef.current + offset) % order.length;
      const candidate = order[index];
      if (!excluded.has(candidate.key) && !cycleKeysRef.current.has(candidate.key)) {
        panel = candidate;
        panelIndex = index;
        break;
      }
    }

    if (!panel) {
      cycleKeysRef.current.clear();
      panel = eligible[0];
      panelIndex = order.indexOf(panel);
    }

    cycleKeysRef.current.add(panel.key);
    nextIndexRef.current = (panelIndex + 1) % order.length;
    slotsRef.current.set(id, panel);
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

export function useAdSlot({ excludeOnDesktop = false } = {}) {
  const ctx = useContext(AdMixContext);
  const id = useId();
  const [panel, setPanel] = useState(null);

  useEffect(() => {
    if (!ctx?.ready) return undefined;
    const excludedKeys = excludeOnDesktop && window.innerWidth > 1100 ? ['panel-webinar-banner'] : [];
    const claimed = ctx.claim(id, excludedKeys);
    const frame = requestAnimationFrame(() => setPanel(claimed));
    return () => cancelAnimationFrame(frame);
  }, [ctx, id, excludeOnDesktop]);

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
