import { BarChart3, Moon, Sun, Sparkles, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/context/DashboardContext';
import { useState } from 'react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { darkMode, toggleDarkMode } = useDashboard();
  const [title, setTitle] = useState('Dashboard Analítico – Uso de IA no Meio Acadêmico');
  const [subtitle, setSubtitle] = useState('Dados sigilosos pertencentes ao Douglas • Desenvolvido por Caroline Brand Studio');

  return (
    <header className="flex items-center justify-between px-6 py-3.5 bg-primary text-primary-foreground shadow-lg relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-primary/80" />
      <div className="flex items-center gap-3 relative z-10 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="text-primary-foreground hover:bg-primary-foreground/10 transition-all duration-200"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="p-1.5 bg-primary-foreground/10 rounded-lg">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-bold leading-tight tracking-tight bg-transparent border-none outline-none w-full text-primary-foreground placeholder:text-primary-foreground/40 hover:bg-primary-foreground/5 focus:bg-primary-foreground/10 rounded px-1 -ml-1 transition-colors"
            placeholder="Título do dashboard"
          />
          <div className="flex items-center gap-2 mt-0.5">
            <Sparkles className="h-3 w-3 opacity-60 flex-shrink-0" />
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="text-xs opacity-70 bg-transparent border-none outline-none w-full text-primary-foreground placeholder:text-primary-foreground/40 hover:bg-primary-foreground/5 focus:bg-primary-foreground/10 rounded px-1 -ml-1 transition-colors"
              placeholder="Descrição do dashboard"
            />
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
