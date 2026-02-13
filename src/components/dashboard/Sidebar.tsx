import { Image, FileText, Sheet, FileJson, BarChart3, Printer, Presentation, Maximize, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

interface SidebarProps {
  onImportFile: () => void;
  onImportText: () => void;
  onShowHistory: () => void;
  onExport: (format: string) => void;
  onPresent: () => void;
}

export function Sidebar({ onImportFile, onImportText, onShowHistory, onExport, onPresent }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <aside className="w-10 border-r border-border bg-card/50 backdrop-blur-sm flex flex-col items-center py-2 gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCollapsed(false)} title="Abrir menu">
          <PanelLeftOpen className="h-4 w-4" />
        </Button>
      </aside>
    );
  }

  return (
    <aside className="w-52 border-r border-border bg-card/50 backdrop-blur-sm p-4 flex flex-col gap-4 overflow-y-auto animate-slide-in-left">
      <div className="flex items-center justify-end">
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCollapsed(true)} title="Fechar menu">
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>

      {/* Seção Importar desabilitada para aprovação do cliente */}

      <Separator />

      <section>
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2.5 flex items-center gap-1.5">
          <FileText className="h-3 w-3" /> Exportar
        </h3>
        <div className="grid grid-cols-2 gap-1">
          <Button variant="outline" size="sm" className="text-xs hover:bg-primary/5 hover:border-primary/30 transition-all duration-200" onClick={() => onExport('png')}>
            <Image className="h-3.5 w-3.5 mr-1" /> PNG
          </Button>
          <Button variant="outline" size="sm" className="text-xs hover:bg-primary/5 hover:border-primary/30 transition-all duration-200" onClick={() => onExport('pdf')}>
            <FileText className="h-3.5 w-3.5 mr-1" /> PDF
          </Button>
          <Button variant="outline" size="sm" className="text-xs hover:bg-primary/5 hover:border-primary/30 transition-all duration-200" onClick={() => onExport('excel')}>
            <Sheet className="h-3.5 w-3.5 mr-1" /> Excel
          </Button>
          <Button variant="outline" size="sm" className="text-xs hover:bg-primary/5 hover:border-primary/30 transition-all duration-200" onClick={() => onExport('json')}>
            <FileJson className="h-3.5 w-3.5 mr-1" /> JSON
          </Button>
          <Button variant="outline" size="sm" className="text-xs hover:bg-primary/5 hover:border-primary/30 transition-all duration-200" onClick={() => onExport('powerbi')}>
            <BarChart3 className="h-3.5 w-3.5 mr-1" /> Power BI
          </Button>
          <Button variant="outline" size="sm" className="text-xs hover:bg-primary/5 hover:border-primary/30 transition-all duration-200" onClick={() => onExport('pbit')}>
            <FileText className="h-3.5 w-3.5 mr-1" /> CSV
          </Button>
        </div>
        <Button variant="outline" size="sm" className="w-full mt-1 text-xs hover:bg-primary/5 hover:border-primary/30 transition-all duration-200" onClick={() => onExport('pptx')}>
          <Presentation className="h-3.5 w-3.5 mr-1" /> PowerPoint
        </Button>
        <Button variant="outline" size="sm" className="w-full mt-1 text-xs hover:bg-primary/5 hover:border-primary/30 transition-all duration-200" onClick={() => onExport('print')}>
          <Printer className="h-3.5 w-3.5 mr-1" /> Imprimir A4
        </Button>

        <Separator className="my-2" />

        <Button variant="default" size="sm" className="w-full text-xs gap-1.5" onClick={onPresent}>
          <Maximize className="h-3.5 w-3.5" /> Apresentar Fullscreen
        </Button>
      </section>

    </aside>
  );
}