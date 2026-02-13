import { useState, useCallback } from 'react';
import { DashboardProvider, useDashboard } from '@/context/DashboardContext';
import { Header } from '@/components/dashboard/Header';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { ChartArea } from '@/components/dashboard/ChartArea';
import { DataPanel } from '@/components/dashboard/DataPanel';
import { exportPNG, exportPDF, exportExcel, exportJSON, exportPowerBI, exportPBIT, handlePrint } from '@/utils/exportUtils';
import { toast } from '@/hooks/use-toast';

function DashboardContent() {
  const [panelMode, setPanelMode] = useState<'file' | 'text' | 'history' | null>(null);
  const { activeDataset, darkMode } = useDashboard();

  const handleExport = useCallback(async (format: string) => {
    if (format === 'print') {
      handlePrint();
      return;
    }

    try {
      switch (format) {
        case 'png': await exportPNG('chart-export-area'); break;
        case 'pdf': await exportPDF('chart-export-area'); break;
        case 'excel': await exportExcel(activeDataset); break;
        case 'json': exportJSON(activeDataset); break;
        case 'powerbi': exportPowerBI(activeDataset); break;
        case 'pbit': exportPBIT(activeDataset); break;
      }
      toast({ title: 'Exportado!', description: `Arquivo ${format.toUpperCase()} gerado com sucesso.` });
    } catch {
      toast({ title: 'Erro', description: 'Falha ao exportar.', variant: 'destructive' });
    }
  }, [activeDataset]);

  return (
    <div className={`h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
      <Header />
      <div className="flex flex-1 overflow-hidden bg-background">
        <Sidebar
          onImportFile={() => setPanelMode(panelMode === 'file' ? null : 'file')}
          onImportText={() => setPanelMode(panelMode === 'text' ? null : 'text')}
          onShowHistory={() => setPanelMode(panelMode === 'history' ? null : 'history')}
          onExport={handleExport}
        />
        <ChartArea />
        <DataPanel mode={panelMode} onClose={() => setPanelMode(null)} />
      </div>
    </div>
  );
}

export default function Index() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
