import { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import { useDashboard } from '@/context/DashboardContext';
import { THEMES } from '@/types/dashboard';
import { Upload } from 'lucide-react';
import { ChartTypeSelector } from './ChartTypeSelector';

export function ChartArea() {
  const { activeDataset, chartType, theme } = useDashboard();
  const colors = THEMES[theme].colors;

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
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
        <Upload className="h-16 w-16 opacity-30" />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-1">Bem-vindo ao Dashboard Analítico</h2>
          <p className="text-sm">Use o menu lateral para importar arquivos ou inserir dados por texto.</p>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    const processedData = chartData.map(row => {
      const processed: Record<string, any> = { ...row };
      dataKeys.forEach(k => {
        processed[k] = Number(processed[k]) || 0;
      });
      return processed;
    });

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={processedData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey={labelKey} type="category" width={120} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              {dataKeys.map((key, i) => (
                <Bar key={key} dataKey={key} fill={colors[i % colors.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'column':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={labelKey} tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              {dataKeys.map((key, i) => (
                <Bar key={key} dataKey={key} fill={colors[i % colors.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={labelKey} tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              {dataKeys.map((key, i) => (
                <Line key={key} type="monotone" dataKey={key} stroke={colors[i % colors.length]} strokeWidth={2} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={labelKey} tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              {dataKeys.map((key, i) => (
                <Area key={key} type="monotone" dataKey={key} fill={colors[i % colors.length]} stroke={colors[i % colors.length]} fillOpacity={0.3} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
      case 'donut': {
        const pieData = processedData.map((row, i) => ({
          name: String(row[labelKey]),
          value: Number(row[dataKeys[0]]) || 0,
        }));
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={150}
                innerRadius={chartType === 'donut' ? 80 : 0}
                label
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      }

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={processedData}>
              <PolarGrid />
              <PolarAngleAxis dataKey={labelKey} tick={{ fontSize: 10 }} />
              <PolarRadiusAxis />
              <Tooltip />
              <Legend />
              {dataKeys.map((key, i) => (
                <Radar key={key} name={key} dataKey={key} stroke={colors[i % colors.length]} fill={colors[i % colors.length]} fillOpacity={0.2} />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={dataKeys[0] || labelKey} name={dataKeys[0] || labelKey} />
              <YAxis dataKey={dataKeys[1] || dataKeys[0]} name={dataKeys[1] || dataKeys[0]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name="Dados" data={processedData} fill={colors[0]} />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      <ChartTypeSelector />
      <div id="chart-export-area" className="bg-card rounded-lg border border-border p-4 mt-4">
        <h3 className="text-sm font-semibold mb-4 text-foreground">{activeDataset.name}</h3>
        {renderChart()}
      </div>
    </div>
  );
}
