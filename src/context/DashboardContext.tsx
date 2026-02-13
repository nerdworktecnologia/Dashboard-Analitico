import React, { createContext, useContext, useState, useCallback } from 'react';
import { DataSet, ChartType, ThemeName } from '@/types/dashboard';

interface DashboardState {
  datasets: DataSet[];
  activeDataset: DataSet | null;
  chartType: ChartType;
  theme: ThemeName;
  font: string;
  darkMode: boolean;
}

interface DashboardContextType extends DashboardState {
  addDataset: (dataset: DataSet) => void;
  setActiveDataset: (dataset: DataSet | null) => void;
  setChartType: (type: ChartType) => void;
  setTheme: (theme: ThemeName) => void;
  setFont: (font: string) => void;
  toggleDarkMode: () => void;
  removeDataset: (id: string) => void;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DashboardState>({
    datasets: [],
    activeDataset: null,
    chartType: 'bar',
    theme: 'powerbi',
    font: 'Inter (padrão)',
    darkMode: false,
  });

  const addDataset = useCallback((dataset: DataSet) => {
    setState(prev => ({
      ...prev,
      datasets: [dataset, ...prev.datasets],
      activeDataset: dataset,
    }));
  }, []);

  const setActiveDataset = useCallback((dataset: DataSet | null) => {
    setState(prev => ({ ...prev, activeDataset: dataset }));
  }, []);

  const setChartType = useCallback((chartType: ChartType) => {
    setState(prev => ({ ...prev, chartType }));
  }, []);

  const setTheme = useCallback((theme: ThemeName) => {
    setState(prev => ({ ...prev, theme }));
  }, []);

  const setFont = useCallback((font: string) => {
    setState(prev => ({ ...prev, font }));
  }, []);

  const toggleDarkMode = useCallback(() => {
    setState(prev => ({ ...prev, darkMode: !prev.darkMode }));
  }, []);

  const removeDataset = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      datasets: prev.datasets.filter(d => d.id !== id),
      activeDataset: prev.activeDataset?.id === id ? null : prev.activeDataset,
    }));
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        ...state,
        addDataset,
        setActiveDataset,
        setChartType,
        setTheme,
        setFont,
        toggleDarkMode,
        removeDataset,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
}
