export type WidgetType = 'kanban' | 'stock' | 'weather' | 'analytics' | 'notes' | 'focusTimer' | 'activityTimeline' | 'aiInsights';
export type Priority = 'low' | 'medium' | 'high';

export interface KanbanTask {
  id: string;
  title: string;
  priority: Priority;
  assignee?: string;
  tag?: string;
}
export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  tasks: KanbanTask[];
}
export interface StockPoint { time: string; value: number; }
export interface StockData {
  symbol: string; price: number; change: number; changePercent: number;
  data: StockPoint[];
}
export interface WeatherForecast { day: string; high: number; low: number; icon: string; }
export interface WeatherData {
  city: string; temp: number; condition: string; humidity: number; wind: number;
  forecast: WeatherForecast[];
}
export interface AnalyticsMetric { label: string; value: string; change: number; }
export interface AnalyticsData {
  title: string;
  metrics: AnalyticsMetric[];
  chart: { name: string; value: number }[];
}
export interface FocusTimerData {
  workMinutes: number;
  breakMinutes: number;
  sessionsGoal: number;
}
export interface ActivityItem {
  id: string;
  action: string;
  time: string;
  type: string;
  icon: string;
}
export interface ActivityTimelineData {
  activities: ActivityItem[];
}
export interface AIInsight {
  id: string;
  title: string;
  desc: string;
  type: 'positive' | 'tip' | 'neutral' | 'warning';
  icon: string;
}
export interface AIInsightsData {
  insights: AIInsight[];
  summary: string;
}
export interface Widget {
  id: string; type: WidgetType; title: string;
  data: KanbanColumn[] | StockData[] | WeatherData | AnalyticsData | string | FocusTimerData | ActivityTimelineData | AIInsightsData;
  createdAt: number;
}
export interface ToolStep { label: string; status: 'pending' | 'running' | 'done'; }
export interface ToolExecution { steps: ToolStep[]; widgetId?: string; }
export interface ChatMessage {
  id: string; role: 'user' | 'assistant'; content: string; timestamp: number;
  toolExecution?: ToolExecution;
}
export interface WorkspaceSession {
  id: string; name: string; createdAt: number;
  messages: ChatMessage[]; widgetCount: number;
}
