import { BarChart3, BarChart, LineChart as LineIcon, PieChart as PieIcon, Activity, Target, CircleDot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/context/DashboardContext';
import { ChartType } from '@/types/dashboard';

const chartTypes: { type: ChartType; label: string; icon: React.ReactNode }[] = [
  { type: 'bar', label: 'Barras', icon: <BarChart3 className="h-4 w-4" /> },
  { type: 'column', label: 'Colunas', icon: <BarChart className="h-4 w-4" /> },
  { type: 'line', label: 'Linha', icon: <LineIcon className="h-4 w-4" /> },
  { type: 'area', label: 'Área', icon: <Activity className="h-4 w-4" /> },
  { type: 'pie', label: 'Pizza', icon: <PieIcon className="h-4 w-4" /> },
  { type: 'donut', label: 'Rosca', icon: <CircleDot className="h-4 w-4" /> },
  { type: 'radar', label: 'Radar', icon: <Target className="h-4 w-4" /> },
  { type: 'scatter', label: 'Scatter', icon: <CircleDot className="h-4 w-4" /> },
];

export function ChartTypeSelector() {
  const { chartType, setChartType } = useDashboard();

  return (
    <div className="flex flex-wrap gap-1">
      {chartTypes.map(({ type, label, icon }) => (
        <Button
          key={type}
          variant={chartType === type ? 'default' : 'outline'}
          size="sm"
          className="text-xs gap-1"
          onClick={() => setChartType(type)}
        >
          {icon} {label}
        </Button>
      ))}
    </div>
  );
}
