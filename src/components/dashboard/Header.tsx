import { BarChart3, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/context/DashboardContext';

export function Header() {
  const { darkMode, toggleDarkMode, activeDataset } = useDashboard();

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-primary text-primary-foreground">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6" />
        <div>
          <h1 className="text-lg font-bold leading-tight">
            Dashboard Analítico – Uso de IA no Meio Acadêmico
          </h1>
          <p className="text-xs opacity-80">
            {activeDataset ? activeDataset.name : 'Dados de demonstração'} • Modelo Power BI
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleDarkMode}
        className="text-primary-foreground hover:bg-primary-foreground/10"
      >
        {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>
    </header>
  );
}
