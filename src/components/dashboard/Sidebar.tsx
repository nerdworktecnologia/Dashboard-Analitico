import { Image, FileText, Sheet, FileJson, BarChart3, Printer, Presentation, Maximize, Upload, Type, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
  collapsed: boolean;
  onImportFile: () => void;
  onImportText: () => void;
  onShowHistory: () => void;
  onExport: (format: string) => void;
  onPresent: () => void;
}

export function Sidebar({ collapsed, onImportFile, onImportText, onShowHistory, onExport, onPresent }: SidebarProps) {
  return (
    <aside
      className={`border-r border-border bg-card/50 backdrop-blur-sm p-4 flex flex-col gap-4 overflow-hidden transition-all duration-300 ease-in-out ${
        collapsed ? 'w-0 p-0 border-r-0 opacity-0' : 'w-52 opacity-100'
      }`}
    >
      <div className="min-w-[calc(13rem-2rem)] overflow-y-auto flex flex-col gap-4">
        <section>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2.5 flex items-center gap-1.5">
            <Upload className="h-3 w-3" /> Importar
          </h3>
          <div className="flex flex-col gap-1">
            <Button variant="outline" size="sm" className="w-full justify-start text-xs hover:bg-primary/5 hover:border-primary/30 transition-all duration-200" onClick={onImportFile}>
              <Upload className="h-3.5 w-3.5 mr-1.5" /> Enviar Arquivos
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-xs hover:bg-primary/5 hover:border-primary/30 transition-all duration-200" onClick={onImportText}>
              <Type className="h-3.5 w-3.5 mr-1.5" /> Inserir por Texto
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-xs hover:bg-primary/5 hover:border-primary/30 transition-all duration-200" onClick={onShowHistory}>
              <Clock className="h-3.5 w-3.5 mr-1.5" /> Histórico
            </Button>
          </div>
        </section>

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
      </div>
    </aside>
  );
}