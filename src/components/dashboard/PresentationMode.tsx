import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChevronLeft, ChevronRight, X, Maximize } from 'lucide-react';
import { PRELOADED_CHARTS, PreloadedChart } from '@/data/preloadedCharts';
import { THEMES, ThemeName, ChartType } from '@/types/dashboard';
import { useDashboard } from '@/context/DashboardContext';

interface PresentationModeProps {
  onExit: () => void;
}

const tooltipStyle = {
  borderRadius: '8px',
  border: '1px solid #334155',
  boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
  fontSize: '13px',
  backgroundColor: '#1e293b',
  color: '#e2e8f0',
};

export function PresentationMode({ onExit }: PresentationModeProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { theme } = useDashboard();
  const colors = THEMES[theme].colors;
  const totalSlides = PRELOADED_CHARTS.length + 2; // title + charts + end

  const goNext = useCallback(() => {
    setCurrentSlide(s => Math.min(s + 1, totalSlides - 1));
  }, [totalSlides]);

  const goPrev = useCallback(() => {
    setCurrentSlide(s => Math.max(s - 1, 0));
  }, []);

  // Fullscreen API
  useEffect(() => {
    const el = document.documentElement;
    el.requestFullscreen?.().catch(() => {});
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'Escape') {
        onExit();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev, onExit]);

  // Handle fullscreen exit
  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement) {
        onExit();
      }
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, [onExit]);

  const renderChart = (chart: PreloadedChart, height: number) => {
    const { chartType: type, data, labelKey: lKey, dataKeys: dKeys } = chart;

    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" tick={{ fontSize: 14, fill: '#cbd5e1' }} />
              <YAxis dataKey={lKey} type="category" width={160} tick={{ fontSize: 13, fill: '#cbd5e1' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 14, color: '#cbd5e1' }} />
              {dKeys.map((key, i) => (
                <Bar key={key} dataKey={key} fill={colors[i % colors.length]} radius={[0, 6, 6, 0]} animationDuration={800} animationBegin={i * 150} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      case 'column':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey={lKey} tick={{ fontSize: 12, fill: '#cbd5e1' }} interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 14, fill: '#cbd5e1' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 14, color: '#cbd5e1' }} />
              {dKeys.map((key, i) => (
                <Bar key={key} dataKey={key} fill={colors[i % colors.length]} radius={[6, 6, 0, 0]} animationDuration={800} animationBegin={i * 150} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey={lKey} tick={{ fontSize: 12, fill: '#cbd5e1' }} />
              <YAxis tick={{ fontSize: 14, fill: '#cbd5e1' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 14, color: '#cbd5e1' }} />
              {dKeys.map((key, i) => (
                <Line key={key} type="monotone" dataKey={key} stroke={colors[i % colors.length]} strokeWidth={3} dot={{ r: 5 }} animationDuration={1200} />
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
                  <linearGradient key={key} id={`pres-grad-${key.replace(/[^a-zA-Z0-9]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.5} />
                    <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0.05} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey={lKey} tick={{ fontSize: 12, fill: '#cbd5e1' }} />
              <YAxis tick={{ fontSize: 14, fill: '#cbd5e1' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 14, color: '#cbd5e1' }} />
              {dKeys.map((key, i) => (
                <Area key={key} type="monotone" dataKey={key} fill={`url(#pres-grad-${key.replace(/[^a-zA-Z0-9]/g, '')})`} stroke={colors[i % colors.length]} strokeWidth={2.5} animationDuration={1000} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'pie':
      case 'donut': {
        const pieData = data.map(row => ({ name: String(row[lKey]), value: Number(row[dKeys[0]]) || 0 }));
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={pieData} dataKey="value" nameKey="name"
                cx="50%" cy="50%"
                outerRadius={height * 0.35}
                innerRadius={type === 'donut' ? height * 0.18 : 0}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ strokeWidth: 1, stroke: '#94a3b8' }}
                animationDuration={1000}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} stroke="#0f172a" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 14, color: '#cbd5e1' }} />
            </PieChart>
          </ResponsiveContainer>
        );
      }
      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RadarChart data={data}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey={lKey} tick={{ fontSize: 11, fill: '#cbd5e1' }} />
              <PolarRadiusAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 14, color: '#cbd5e1' }} />
              {dKeys.map((key, i) => (
                <Radar key={key} name={key} dataKey={key} stroke={colors[i % colors.length]} fill={colors[i % colors.length]} fillOpacity={0.2} strokeWidth={2.5} animationDuration={1000} />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        );
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey={dKeys[0] || lKey} name={dKeys[0] || lKey} tick={{ fontSize: 14, fill: '#cbd5e1' }} />
              <YAxis dataKey={dKeys[1] || dKeys[0]} name={dKeys[1] || dKeys[0]} tick={{ fontSize: 14, fill: '#cbd5e1' }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 14, color: '#cbd5e1' }} />
              <Scatter name="Dados" data={data} fill={colors[0]} animationDuration={1000} />
            </ScatterChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  const renderSlide = () => {
    // Title slide
    if (currentSlide === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center px-12 animate-fade-in">
          <h1 className="text-6xl font-bold text-white mb-6 tracking-tight">Dashboard Analítico</h1>
          <h2 className="text-3xl text-blue-300 mb-8">Uso de IA no Meio Acadêmico – UFMG</h2>
          <p className="text-xl text-slate-400">Dados de 1.508 discentes • 9 gráficos</p>
          <p className="text-lg text-slate-500 mt-4">{new Date().toLocaleDateString('pt-BR')}</p>
          <p className="text-sm text-slate-600 mt-12">Pressione → ou Espaço para avançar</p>
        </div>
      );
    }

    // End slide
    if (currentSlide === totalSlides - 1) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center px-12 animate-fade-in">
          <h1 className="text-6xl font-bold text-white mb-6">Obrigado!</h1>
          <h2 className="text-2xl text-blue-300">Dashboard Analítico – UFMG</h2>
          <p className="text-lg text-slate-500 mt-8">Pressione Esc para sair</p>
        </div>
      );
    }

    // Chart slides
    const chart = PRELOADED_CHARTS[currentSlide - 1];
    return (
      <div className="flex flex-col h-full px-12 py-8 animate-fade-in">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white">{chart.title}</h2>
          <p className="text-lg text-slate-400 mt-2">{chart.subtitle}</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-[90%] h-[70vh]">
            {renderChart(chart, window.innerHeight * 0.65)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-slate-900 flex flex-col cursor-none"
      style={{ cursor: 'none' }}
      onMouseMove={(e) => {
        const target = e.currentTarget;
        target.style.cursor = 'default';
        clearTimeout((target as any)._hideTimer);
        (target as any)._hideTimer = setTimeout(() => {
          target.style.cursor = 'none';
        }, 2000);
      }}
    >
      {/* Slide content */}
      <div className="flex-1 overflow-hidden" onClick={goNext}>
        {renderSlide()}
      </div>

      {/* Bottom bar */}
      <div className="h-12 flex items-center justify-between px-6 bg-slate-950/80 text-slate-400 text-sm">
        <button
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          className="flex items-center gap-1 hover:text-white transition-colors disabled:opacity-30"
          disabled={currentSlide === 0}
        >
          <ChevronLeft className="h-5 w-5" /> Anterior
        </button>

        <div className="flex items-center gap-3">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrentSlide(i); }}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentSlide ? 'w-6 bg-blue-400' : 'w-2 bg-slate-600 hover:bg-slate-500'
              }`}
            />
          ))}
          <span className="ml-3 text-xs">{currentSlide + 1} / {totalSlides}</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="flex items-center gap-1 hover:text-white transition-colors disabled:opacity-30"
            disabled={currentSlide === totalSlides - 1}
          >
            Próximo <ChevronRight className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onExit(); }}
            className="flex items-center gap-1 hover:text-red-400 transition-colors"
          >
            <X className="h-4 w-4" /> Sair
          </button>
        </div>
      </div>
    </div>
  );
}
