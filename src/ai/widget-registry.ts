'use client';
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

const KanbanBoard        = dynamic(() => import('@/components/workspace/widgets/KanbanBoard'),        { ssr: false });
const StockChart         = dynamic(() => import('@/components/workspace/widgets/StockChart'),         { ssr: false });
const WeatherWidget      = dynamic(() => import('@/components/workspace/widgets/WeatherWidget'),      { ssr: false });
const AnalyticsWidget    = dynamic(() => import('@/components/workspace/widgets/AnalyticsWidget'),    { ssr: false });
const NotesWidget        = dynamic(() => import('@/components/workspace/widgets/NotesWidget'),        { ssr: false });
const FocusTimer         = dynamic(() => import('@/components/workspace/widgets/FocusTimer'),         { ssr: false });
const ActivityTimeline   = dynamic(() => import('@/components/workspace/widgets/ActivityTimeline'),   { ssr: false });
const AIInsights         = dynamic(() => import('@/components/workspace/widgets/AIInsights'),         { ssr: false });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const widgetRegistry: Record<string, ComponentType<any>> = {
  renderKanbanBoard:       KanbanBoard,
  renderStockChart:        StockChart,
  renderWeather:           WeatherWidget,
  renderAnalytics:         AnalyticsWidget,
  renderNotes:             NotesWidget,
  renderFocusTimer:        FocusTimer,
  renderActivityTimeline:  ActivityTimeline,
  renderAIInsights:        AIInsights,
};

export const WIDGET_META: Record<string, { icon: string; label: string }> = {
  renderKanbanBoard:       { icon: '🗂',  label: 'Sprint Board' },
  renderStockChart:        { icon: '📈',  label: 'Stock Chart' },
  renderWeather:           { icon: '🌤',  label: 'Weather' },
  renderAnalytics:         { icon: '📊',  label: 'Analytics' },
  renderNotes:             { icon: '📝',  label: 'Notes' },
  renderFocusTimer:        { icon: '🍅',  label: 'Focus Timer' },
  renderActivityTimeline:  { icon: '⏱',  label: 'Activity Timeline' },
  renderAIInsights:        { icon: '🧠',  label: 'AI Insights' },
};
