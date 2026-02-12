import { BarChart3, Moon, Sun, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/context/DashboardContext';

export function Header() {
  const { darkMode, toggleDarkMode, activeDataset } = useDashboard();

  return (
    <header className="flex items-center justify-between px-6 py-3.5 bg-primary text-primary-foreground shadow-lg relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-primary/80" />
      <div className="flex items-center gap-3 relative z-10">
        <div className="p-1.5 bg-primary-foreground/10 rounded-lg">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold leading-tight tracking-tight">
            Dashboard Analítico – Uso de IA no Meio Acadêmico
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <Sparkles className="h-3 w-3 opacity-60" />
            <p className="text-xs opacity-70">
              {activeDataset ? activeDataset.name : 'Dados de demonstração'} • Modelo Power BI
            </p>
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleDarkMode}
        className="relative z-10 text-primary-foreground hover:bg-primary-foreground/10 transition-all duration-300 hover:rotate-12"
      >
        {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>
    </header>
  );
}
