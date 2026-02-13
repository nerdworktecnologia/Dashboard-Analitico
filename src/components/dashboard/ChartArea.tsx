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

const ALL_CHART_TYPES: ChartType[] = ['column', 'bar', 'line', 'area', 'pie', 'donut', 'radar', 'scatter'];

export function ChartArea() {
  const { activeDataset, chartType, theme } = useDashboard();
  const colors = THEMES[theme].colors;
  const [gridMode, setGridMode] = useState(false);
  const [expandedChart, setExpandedChart] = useState<ChartType | null>(null);

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
        <div className="flex gap-3 mt-2">
          <div className="flex items-center gap-2 text-xs bg-muted/60 rounded-full px-4 py-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            CSV, Excel, texto tabulado
          </div>
        </div>
      </div>
    );
  }

  const processedData = chartData.map(row => {
    const processed: Record<string, any> = { ...row };
    dataKeys.forEach(k => {
      processed[k] = Number(processed[k]) || 0;
    });
    return processed;
  });

  const pieData = processedData.map((row) => ({
    name: String(row[labelKey]),
    value: Number(row[dataKeys[0]]) || 0,
  }));

  const renderChart = (type: ChartType, height: number = 300) => {
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={processedData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey={labelKey} type="category" width={100} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }} />
              <Legend />
              {dataKeys.map((key, i) => (
                <Bar key={key} dataKey={key} fill={colors[i % colors.length]} radius={[0, 4, 4, 0]} animationDuration={800} animationBegin={i * 100} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'column':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey={labelKey} tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }} />
              <Legend />
              {dataKeys.map((key, i) => (
                <Bar key={key} dataKey={key} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} animationDuration={800} animationBegin={i * 100} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey={labelKey} tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }} />
              <Legend />
              {dataKeys.map((key, i) => (
                <Line key={key} type="monotone" dataKey={key} stroke={colors[i % colors.length]} strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} animationDuration={1200} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={processedData}>
              <defs>
                {dataKeys.map((key, i) => (
                  <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0.05} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey={labelKey} tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }} />
              <Legend />
              {dataKeys.map((key, i) => (
                <Area key={key} type="monotone" dataKey={key} fill={`url(#gradient-${key})`} stroke={colors[i % colors.length]} strokeWidth={2} animationDuration={1000} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
      case 'donut':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={height * 0.35}
                innerRadius={type === 'donut' ? height * 0.2 : 0}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ strokeWidth: 1 }}
                animationDuration={1000}
                animationBegin={0}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} stroke="hsl(var(--background))" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RadarChart data={processedData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey={labelKey} tick={{ fontSize: 9 }} />
              <PolarRadiusAxis tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }} />
              <Legend />
              {dataKeys.map((key, i) => (
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
              <XAxis dataKey={dataKeys[0] || labelKey} name={dataKeys[0] || labelKey} tick={{ fontSize: 10 }} />
              <YAxis dataKey={dataKeys[1] || dataKeys[0]} name={dataKeys[1] || dataKeys[0]} tick={{ fontSize: 10 }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }} />
              <Legend />
              <Scatter name="Dados" data={processedData} fill={colors[0]} animationDuration={1000} />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const chartLabel = (type: ChartType) => {
    const labels: Record<ChartType, string> = {
      bar: 'Barras Horizontais', column: 'Colunas', line: 'Linha',
      area: 'Área', pie: 'Pizza', donut: 'Rosca', radar: 'Radar', scatter: 'Dispersão',
    };
    return labels[type];
  };

  // Expanded single chart overlay
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
          {renderChart(expandedChart, 500)}
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
              {renderChart(type, 240)}
            </div>
          ))}
        </div>
      ) : (
        <div className="animate-fade-in">
          <ChartTypeSelector />
          <div id="chart-export-area" className="bg-card rounded-xl border border-border p-5 mt-4 shadow-sm transition-all duration-300">
            {renderChart(chartType, 420)}
          </div>
        </div>
      )}
    </div>
  );
}
