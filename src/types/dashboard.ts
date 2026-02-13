export type ChartType = 'bar' | 'column' | 'line' | 'area' | 'pie' | 'donut' | 'radar' | 'scatter';

export interface DataRow {
  [key: string]: string | number;
}

export interface DataSet {
  id: string;
  name: string;
  headers: string[];
  rows: DataRow[];
  createdAt: Date;
}

export type ThemeName =
  | 'academico'
  | 'corporativo'
  | 'minimalista'
  | 'vibrante'
  | 'oceano'
  | 'floresta'
  | 'sunset'
  | 'pastel'
  | 'neon'
  | 'monocromatico'
  | 'powerbi'
  | 'tableau';

export interface ThemeConfig {
  name: string;
  emoji: string;
  colors: string[];
}

export const THEMES: Record<ThemeName, ThemeConfig> = {
  academico: {
    name: 'Acadêmico',
    emoji: '🎓',
    colors: ['#1e3a5f', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],
  },
  corporativo: {
    name: 'Corporativo',
    emoji: '💼',
    colors: ['#0f172a', '#334155', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'],
  },
  powerbi: {
    name: 'Power BI',
    emoji: '📊',
    colors: ['#01b8aa', '#374649', '#fd625e', '#f2c80f', '#5f6b6d', '#8ad4eb'],
  },
  tableau: {
    name: 'Tableau',
    emoji: '📈',
    colors: ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc948'],
  },
  oceano: {
    name: 'Oceano',
    emoji: '🌊',
    colors: ['#0c4a6e', '#0369a1', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd'],
  },
  floresta: {
    name: 'Floresta',
    emoji: '🌿',
    colors: ['#14532d', '#166534', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'],
  },
  sunset: {
    name: 'Pôr do Sol',
    emoji: '🌅',
    colors: ['#7c2d12', '#c2410c', '#f97316', '#fb923c', '#fdba74', '#fed7aa'],
  },
  pastel: {
    name: 'Pastel',
    emoji: '🎨',
    colors: ['#f9a8d4', '#a5b4fc', '#86efac', '#fde68a', '#c4b5fd', '#fbcfe8'],
  },
  vibrante: {
    name: 'Vibrante',
    emoji: '⚡',
    colors: ['#dc2626', '#ea580c', '#eab308', '#16a34a', '#2563eb', '#9333ea'],
  },
  neon: {
    name: 'Neon',
    emoji: '💡',
    colors: ['#06b6d4', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'],
  },
  monocromatico: {
    name: 'Monocromático',
    emoji: '⬛',
    colors: ['#18181b', '#3f3f46', '#71717a', '#a1a1aa', '#d4d4d8', '#e4e4e7'],
  },
  minimalista: {
    name: 'Minimalista',
    emoji: '✨',
    colors: ['#1e293b', '#475569', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9'],
  },
};

export const FONTS = [
  'Inter (padrão)',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Source Sans Pro',
];
