import { Upload, Type, Clock, Image, FileText, Sheet, FileJson, BarChart3, Printer, Palette, Presentation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDashboard } from '@/context/DashboardContext';
import { THEMES, FONTS, ThemeName } from '@/types/dashboard';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
  onImportFile: () => void;
  onImportText: () => void;
  onShowHistory: () => void;
  onExport: (format: string) => void;
}

export function Sidebar({ onImportFile, onImportText, onShowHistory, onExport }: SidebarProps) {
  const { theme, setTheme, font, setFont } = useDashboard();

  return (
    <aside className="w-52 border-r border-border bg-card/50 backdrop-blur-sm p-4 flex flex-col gap-4 overflow-y-auto animate-slide-in-left">
      <section className="animate-fade-in" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2.5 flex items-center gap-1.5">
          <Upload className="h-3 w-3" /> Importar
        </h3>
        <div className="flex flex-col gap-1">
          <Button variant="outline" size="sm" className="justify-start text-xs hover:bg-primary/5 hover:border-primary/30 transition-all duration-200" onClick={onImportFile}>
            <Upload className="h-3.5 w-3.5 mr-1.5" /> Enviar Arquivos
          </Button>
          <Button variant="outline" size="sm" className="justify-start text-xs hover:bg-primary/5 hover:border-primary/30 transition-all duration-200" onClick={onImportText}>
            <Type className="h-3.5 w-3.5 mr-1.5" /> Inserir por Texto
          </Button>
          <Button variant="outline" size="sm" className="justify-start text-xs hover:bg-primary/5 hover:border-primary/30 transition-all duration-200" onClick={onShowHistory}>
            <Clock className="h-3.5 w-3.5 mr-1.5" /> Histórico
          </Button>
        </div>
      </section>

      <Separator />

      <section className="animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
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
      </section>

      <Separator />

      <section className="animate-fade-in" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2.5 flex items-center gap-1.5">
          <Palette className="h-3 w-3" /> Tema
        </h3>
        <Select value={theme} onValueChange={(v) => setTheme(v as ThemeName)}>
          <SelectTrigger className="text-xs h-8">
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {THEMES[theme].colors.slice(0, 4).map((c, i) => (
                  <div key={i} className="h-2.5 w-2.5 rounded-full shadow-sm" style={{ backgroundColor: c }} />
                ))}
              </div>
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(THEMES).map(([key, val]) => (
              <SelectItem key={key} value={key} className="text-xs">
                <div className="flex items-center gap-2">
                  <span>{val.emoji}</span>
                  <div className="flex gap-0.5">
                    {val.colors.slice(0, 4).map((c, i) => (
                      <div key={i} className="h-2 w-2 rounded-full" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  {val.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <Separator />

      <section className="animate-fade-in" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2.5 flex items-center gap-1.5">
          <Type className="h-3 w-3" /> Fonte
        </h3>
        <Select value={font} onValueChange={setFont}>
          <SelectTrigger className="text-xs h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONTS.map(f => (
              <SelectItem key={f} value={f} className="text-xs">{f}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>
    </aside>
  );
}
