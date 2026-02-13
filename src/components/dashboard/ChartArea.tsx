import { useMemo, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import { useDashboard } from '@/context/DashboardContext';
import { THEMES, ChartType } from '@/types/dashboard';
import { Upload, LayoutGrid, Maximize2, X } from 'lucide-react';
import { ChartTypeSelector } from './ChartTypeSelector';
import { Button } from '@/components/ui/button';
import { PRELOADED_CHARTS, PreloadedChart } from '@/data/preloadedCharts';

const ALL_CHART_TYPES: ChartType[] = ['column', 'bar', 'line', 'area', 'pie', 'donut', 'radar', 'scatter'];

const tooltipStyle = {
  borderRadius: '8px',
  border: '1px solid hsl(var(--border))',
  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
  fontSize: '11px',
};

export function ChartArea() {
  const { activeDataset, chartType, theme } = useDashboard();
  const colors = THEMES[theme].colors;
  const [gridMode, setGridMode] = useState(false);
  const [expandedChart, setExpandedChart] = useState<ChartType | null>(null);
  const [showPreloaded, setShowPreloaded] = useState(true);
  const [expandedPreloaded, setExpandedPreloaded] = useState<string | null>(null);

  const chartData = useMemo(() => {
    if (!activeDataset) return [];
    return activeDataset.rows;
  }, [activeDataset]);

  const numericKeys = useMemo(() => {
    if (!activeDataset || !activeDataset.rows.length) return [];
    return activeDataset.headers.filter(h => {
      return activeDataset.rows.some(r => typeof r[h] === 'number' || !isNaN(Number(r[h])));
    });
  }, [activeDataset]);

  const labelKey = useMemo(() => {
    if (!activeDataset) return '';
    const nonNumeric = activeDataset.headers.find(h => !numericKeys.includes(h));
    return nonNumeric || activeDataset.headers[0] || '';
  }, [activeDataset, numericKeys]);

  const dataKeys = useMemo(() => {
    return numericKeys.filter(k => k !== labelKey).slice(0, 6);
  }, [numericKeys, labelKey]);

  // Render a chart given type, data, keys, and height
  const renderChartGeneric = (
    type: ChartType,
    data: Record<string, any>[],
    lKey: string,
    dKeys: string[],
    height: number = 300,
  ) => {
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey={lKey} type="category" width={110} tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              {dKeys.map((key, i) => (
                <Bar key={key} dataKey={key} fill={colors[i % colors.length]} radius={[0, 4, 4, 0]} animationDuration={800} animationBegin={i * 100} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'column':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey={lKey} tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              {dKeys.map((key, i) => (
                <Bar key={key} dataKey={key} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} animationDuration={800} animationBegin={i * 100} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey={lKey} tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              {dKeys.map((key, i) => (
                <Line key={key} type="monotone" dataKey={key} stroke={colors[i % colors.length]} strokeWidth={2.5} dot={{ r: 4 }} animationDuration={1200} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data}>
              <defs>
                {dKeys.map((key, i) => (
                  <linearGradient key={key} id={`grad-${key.replace(/[^a-zA-Z0-9]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0.05} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey={lKey} tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              {dKeys.map((key, i) => (
                <Area key={key} type="monotone" dataKey={key} fill={`url(#grad-${key.replace(/[^a-zA-Z0-9]/g, '')})`} stroke={colors[i % colors.length]} strokeWidth={2} animationDuration={1000} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
      case 'donut': {
        const pieData = data.map((row) => ({
          name: String(row[lKey]),
          value: Number(row[dKeys[0]]) || 0,
        }));
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={height * 0.32}
                innerRadius={type === 'donut' ? height * 0.18 : 0}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ strokeWidth: 1 }}
                animationDuration={1000}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} stroke="hsl(var(--background))" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        );
      }

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RadarChart data={data}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey={lKey} tick={{ fontSize: 8 }} />
              <PolarRadiusAxis tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              {dKeys.map((key, i) => (
                <Radar key={key} name={key} dataKey={key} stroke={colors[i % colors.length]} fill={colors[i % colors.length]} fillOpacity={0.15} strokeWidth={2} animationDuration={1000} />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey={dKeys[0] || lKey} name={dKeys[0] || lKey} tick={{ fontSize: 10 }} />
              <YAxis dataKey={dKeys[1] || dKeys[0]} name={dKeys[1] || dKeys[0]} tick={{ fontSize: 10 }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Scatter name="Dados" data={data} fill={colors[0]} animationDuration={1000} />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  // Render preloaded 9 charts
  if (showPreloaded && !activeDataset) {
    if (expandedPreloaded) {
      const chart = PRELOADED_CHARTS.find(c => c.id === expandedPreloaded)!;
      return (
        <div className="flex-1 p-5 overflow-auto animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-foreground">{chart.title}</h3>
              <p className="text-xs text-muted-foreground">{chart.subtitle}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setExpandedPreloaded(null)}>
              <X className="h-4 w-4 mr-1" /> Voltar ao Grid
            </Button>
          </div>
          <div id="chart-export-area" className="bg-card rounded-xl border border-border p-6 shadow-sm">
            {renderChartGeneric(chart.chartType, chart.data, chart.labelKey, chart.dataKeys, 500)}
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 p-5 overflow-auto">
        <div className="flex items-center justify-between mb-4 animate-fade-in">
          <div>
            <h3 className="text-base font-bold text-foreground">Análise – Uso de IA no Meio Acadêmico (UFMG)</h3>
            <p className="text-xs text-muted-foreground">9 gráficos • Dados de 1.508 discentes</p>
          </div>
        </div>
        <div id="chart-export-area" className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {PRELOADED_CHARTS.map((chart, index) => (
            <div
              key={chart.id}
              data-chart-id={chart.id}
              className="bg-card rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/30 group animate-slide-up cursor-pointer"
              style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}
              onClick={() => setExpandedPreloaded(chart.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-[11px] font-bold text-foreground leading-tight">{chart.title}</h4>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{chart.subtitle}</p>
                </div>
                <Maximize2 className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0" />
              </div>
              {renderChartGeneric(chart.chartType, chart.data, chart.labelKey, chart.dataKeys, 220)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // No active dataset and preloaded hidden
  if (!activeDataset) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-6 animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl scale-150" />
          <Upload className="h-20 w-20 opacity-20 relative" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Bem-vindo ao Dashboard Analítico</h2>
          <p className="text-sm max-w-md">Use o menu lateral para importar arquivos ou inserir dados por texto.</p>
        </div>
        <Button variant="outline" onClick={() => setShowPreloaded(true)}>
          Ver dados de demonstração (9 gráficos)
        </Button>
      </div>
    );
  }

  // Active dataset mode
  const processedData = chartData.map(row => {
    const processed: Record<string, any> = { ...row };
    dataKeys.forEach(k => {
      processed[k] = Number(processed[k]) || 0;
    });
    return processed;
  });

  const chartLabel = (type: ChartType) => {
    const labels: Record<ChartType, string> = {
      bar: 'Barras Horizontais', column: 'Colunas', line: 'Linha',
      area: 'Área', pie: 'Pizza', donut: 'Rosca', radar: 'Radar', scatter: 'Dispersão',
    };
    return labels[type];
  };

  if (expandedChart) {
    return (
      <div className="flex-1 p-6 overflow-auto animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">{chartLabel(expandedChart)}</h3>
          <Button variant="outline" size="sm" onClick={() => setExpandedChart(null)}>
            <X className="h-4 w-4 mr-1" /> Fechar
          </Button>
        </div>
        <div id="chart-export-area" className="bg-card rounded-xl border border-border p-6 shadow-sm">
          {renderChartGeneric(expandedChart, processedData, labelKey, dataKeys, 500)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-5 overflow-auto">
      <div className="flex items-center justify-between mb-4 animate-fade-in">
        <div>
          <h3 className="text-base font-bold text-foreground">{activeDataset.name}</h3>
          <p className="text-xs text-muted-foreground">{activeDataset.rows.length} linhas • {activeDataset.headers.length} colunas</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => { setShowPreloaded(true); }}
          >
            Ver 9 gráficos
          </Button>
          <Button
            variant={gridMode ? 'default' : 'outline'}
            size="sm"
            className="text-xs gap-1.5 transition-all duration-200"
            onClick={() => setGridMode(!gridMode)}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            {gridMode ? 'Grid Ativo' : 'Ver Todos'}
          </Button>
        </div>
      </div>

      {gridMode ? (
        <div id="chart-export-area" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {ALL_CHART_TYPES.map((type, index) => (
            <div
              key={type}
              className="bg-card rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/30 group animate-slide-up"
              style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">{chartLabel(type)}</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setExpandedChart(type)}
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              {renderChartGeneric(type, processedData, labelKey, dataKeys, 240)}
            </div>
          ))}
        </div>
      ) : (
        <div className="animate-fade-in">
          <ChartTypeSelector />
          <div id="chart-export-area" className="bg-card rounded-xl border border-border p-5 mt-4 shadow-sm transition-all duration-300">
            {renderChartGeneric(chartType, processedData, labelKey, dataKeys, 420)}
          </div>
        </div>
      )}
    </div>
  );
}
