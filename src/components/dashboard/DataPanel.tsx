import { useState, useRef } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { DataSet, DataRow } from '@/types/dashboard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Type, Send, X } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface DataPanelProps {
  mode: 'file' | 'text' | 'history' | null;
  onClose: () => void;
}

export function DataPanel({ mode, onClose }: DataPanelProps) {
  const { addDataset, datasets, setActiveDataset, removeDataset } = useDashboard();
  const [textInput, setTextInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseTextData = (text: string, name: string) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return;

    let separator = '\t';
    if (!lines[0].includes('\t')) {
      separator = lines[0].includes(';') ? ';' : ',';
    }

    const headers = lines[0].split(separator).map(h => h.trim());
    const rows: DataRow[] = lines.slice(1).map(line => {
      const values = line.split(separator);
      const row: DataRow = {};
      headers.forEach((h, i) => {
        const val = values[i]?.trim() || '';
        const num = Number(val.replace(',', '.'));
        row[h] = isNaN(num) || val === '' ? val : num;
      });
      return row;
    });

    const dataset: DataSet = {
      id: crypto.randomUUID(),
      name,
      headers,
      rows,
      createdAt: new Date(),
    };
    addDataset(dataset);
    setTextInput('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'csv' || ext === 'txt') {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data.length > 0) {
            const headers = Object.keys(results.data[0] as object);
            const dataset: DataSet = {
              id: crypto.randomUUID(),
              name: file.name,
              headers,
              rows: results.data as DataRow[],
              createdAt: new Date(),
            };
            addDataset(dataset);
          }
        },
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const data = ev.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<DataRow>(sheet);
        if (jsonData.length > 0) {
          const headers = Object.keys(jsonData[0]);
          const dataset: DataSet = {
            id: crypto.randomUUID(),
            name: file.name,
            headers,
            rows: jsonData,
            createdAt: new Date(),
          };
          addDataset(dataset);
        }
      };
      reader.readAsBinaryString(file);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTextSubmit = () => {
    if (!textInput.trim()) return;
    parseTextData(textInput, `Dados inseridos ${new Date().toLocaleTimeString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  };

  if (!mode) return null;

  return (
    <div className="w-72 border-l border-border bg-card/50 backdrop-blur-sm p-4 flex flex-col animate-slide-in-right">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">
          {mode === 'file' && 'Enviar Arquivos'}
          {mode === 'text' && 'Inserir dados por texto'}
          {mode === 'history' && 'Histórico de Dados'}
        </h3>
        <Button variant="ghost" size="icon" className="h-6 w-6 hover:rotate-90 transition-transform duration-200" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {mode === 'file' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 animate-fade-in">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div
            className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 w-full group"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors group-hover:scale-110 transform duration-200" />
            <p className="text-xs text-muted-foreground">Clique para selecionar</p>
            <p className="text-xs text-muted-foreground mt-1">CSV, Excel (.xlsx, .xls)</p>
          </div>
        </div>
      )}

      {mode === 'text' && (
        <div className="flex-1 flex flex-col gap-3 animate-fade-in">
          <div className="flex-1 flex flex-col gap-2">
            <div className="bg-muted/30 rounded-xl p-4 text-center border border-border/50">
              <Type className="h-6 w-6 mx-auto mb-1.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Cole seus dados aqui, parte por parte.</p>
              <p className="text-[10px] text-muted-foreground mt-1">Ex: percentuais, tabelas, resultados de pesquisa...</p>
            </div>
          </div>
          <div className="relative">
            <Textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Cole seus dados aqui... (Enter para enviar, Shift+Enter para nova linha)"
              className="text-xs min-h-[80px] pr-10 resize-none rounded-xl"
            />
            <Button
              size="icon"
              className="absolute bottom-2 right-2 h-7 w-7 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              onClick={handleTextSubmit}
              disabled={!textInput.trim()}
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {mode === 'history' && (
        <div className="flex-1 overflow-y-auto animate-fade-in">
          {datasets.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center mt-8">Nenhum dado importado ainda.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {datasets.map((ds, index) => (
                <div
                  key={ds.id}
                  className="p-2.5 rounded-lg border border-border hover:bg-accent hover:border-primary/20 cursor-pointer text-xs transition-all duration-200 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                  onClick={() => setActiveDataset(ds)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-foreground">{ds.name}</p>
                      <p className="text-muted-foreground mt-0.5">{ds.rows.length} linhas • {ds.headers.length} colunas</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-50 hover:opacity-100"
                      onClick={(e) => { e.stopPropagation(); removeDataset(ds.id); }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
