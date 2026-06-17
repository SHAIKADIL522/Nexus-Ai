export interface WorkspaceTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  prompts: string[];
  tags: string[];
}

export const WORKSPACE_TEMPLATES: WorkspaceTemplate[] = [
  {
    id: 'engineering-sprint',
    name: 'Engineering Sprint',
    description: 'Sprint board + analytics dashboard for engineering teams.',
    icon: '🚀',
    category: 'Engineering',
    prompts: [
      'Create an engineering sprint board with backlog, in-progress, review, and done columns with realistic tasks',
      'Show analytics dashboard with engineering KPI metrics',
    ],
    tags: ['kanban', 'analytics', 'engineering'],
  },
  {
    id: 'startup-dashboard',
    name: 'Startup Dashboard',
    description: 'KPI metrics, revenue analytics, and task management for early-stage startups.',
    icon: '⚡',
    category: 'Business',
    prompts: [
      'Show sales analytics dashboard with revenue metrics and growth charts for a startup',
      'Create a startup launch board with tasks organized by priority',
    ],
    tags: ['analytics', 'kanban', 'startup'],
  },
  {
    id: 'finance-workspace',
    name: 'Finance Workspace',
    description: 'Stock performance charts, market analysis, and financial notes.',
    icon: '📈',
    category: 'Finance',
    prompts: [
      'Show stock chart for NVDA TSLA AAPL with performance comparison',
      'Show analytics dashboard focused on financial performance metrics',
    ],
    tags: ['stock', 'analytics', 'finance'],
  },
  {
    id: 'deep-work-session',
    name: 'Deep Work Session',
    description: 'Focus timer, task board, and AI insights for maximum productivity.',
    icon: '🧠',
    category: 'Personal',
    prompts: [
      'Focus timer 25 minutes pomodoro',
      'Create a personal productivity board with today, this week, and someday columns',
      'Show AI productivity insights',
    ],
    tags: ['focusTimer', 'kanban', 'aiInsights'],
  },
  {
    id: 'research-workspace',
    name: 'Research Workspace',
    description: 'Notes, analytics, and organized research board for deep work sessions.',
    icon: '🔬',
    category: 'Research',
    prompts: [
      'Create a notes widget for research project documentation',
      'Create a research task board with literature review, experiments, and writing columns',
    ],
    tags: ['notes', 'kanban', 'research'],
  },
  {
    id: 'ai-analytics',
    name: 'AI Analytics Suite',
    description: 'Full analytics suite with AI insights, activity timeline and performance metrics.',
    icon: '🤖',
    category: 'AI',
    prompts: [
      'Show analytics dashboard with performance KPIs and 8-month trends',
      'Show AI productivity insights',
      'Activity timeline',
    ],
    tags: ['analytics', 'aiInsights', 'activityTimeline'],
  },
];
