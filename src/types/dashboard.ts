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

export type ThemeName = 'academico' | 'corporativo' | 'minimalista' | 'vibrante';

export interface ThemeConfig {
  name: string;
  colors: string[];
}

export const THEMES: Record<ThemeName, ThemeConfig> = {
  academico: {
    name: 'Acadêmico',
    colors: ['#1e3a5f', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],
  },
  corporativo: {
    name: 'Corporativo',
    colors: ['#0f172a', '#334155', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'],
  },
  minimalista: {
    name: 'Minimalista',
    colors: ['#18181b', '#3f3f46', '#71717a', '#a1a1aa', '#d4d4d8', '#e4e4e7'],
  },
  vibrante: {
    name: 'Vibrante',
    colors: ['#dc2626', '#ea580c', '#eab308', '#16a34a', '#2563eb', '#9333ea'],
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
