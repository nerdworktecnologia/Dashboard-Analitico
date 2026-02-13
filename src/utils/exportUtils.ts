import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { DataSet } from '@/types/dashboard';
import { PRELOADED_CHARTS } from '@/data/preloadedCharts';

export async function exportPNG(elementId: string) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const dataUrl = await toPng(el, { backgroundColor: '#ffffff' });
  saveAs(dataUrl, 'dashboard-graficos.png');
}

export async function exportPDF(elementId: string) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const dataUrl = await toPng(el, { backgroundColor: '#ffffff', pixelRatio: 2 });
  const pdf = new jsPDF('landscape', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  // Title page
  pdf.setFontSize(20);
  pdf.setTextColor(30, 58, 95);
  pdf.text('Dashboard Analítico', pdfWidth / 2, 40, { align: 'center' });
  pdf.setFontSize(14);
  pdf.text('Uso de IA no Meio Acadêmico – UFMG', pdfWidth / 2, 52, { align: 'center' });
  pdf.setFontSize(10);
  pdf.setTextColor(100);
  pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, pdfWidth / 2, 64, { align: 'center' });
  pdf.text('Dados de 1.508 discentes • 9 gráficos', pdfWidth / 2, 72, { align: 'center' });

  // Dashboard screenshot page
  pdf.addPage('landscape');
  const imgProps = pdf.getImageProperties(dataUrl);
  const imgAspect = imgProps.width / imgProps.height;
  const pageAspect = pdfWidth / pdfHeight;
  let drawW = pdfWidth - 20;
  let drawH = drawW / imgAspect;
  if (drawH > pdfHeight - 20) {
    drawH = pdfHeight - 20;
    drawW = drawH * imgAspect;
  }
  const x = (pdfWidth - drawW) / 2;
  const y = (pdfHeight - drawH) / 2;
  pdf.addImage(dataUrl, 'PNG', x, y, drawW, drawH);

  pdf.save('dashboard-analitico-ufmg.pdf');
}

export function exportExcel(dataset: DataSet | null) {
  const wb = XLSX.utils.book_new();

  // Always export all 9 preloaded charts
  PRELOADED_CHARTS.forEach((chart) => {
    const sheetData = chart.data.map(row => {
      const clean: Record<string, any> = {};
      clean[chart.labelKey] = row[chart.labelKey];
      chart.dataKeys.forEach(k => {
        clean[k] = row[k];
      });
      return clean;
    });
    const ws = XLSX.utils.json_to_sheet(sheetData);

    // Auto-size columns
    const colWidths = Object.keys(sheetData[0] || {}).map(key => ({
      wch: Math.max(key.length, ...sheetData.map(r => String(r[key] ?? '').length)) + 2,
    }));
    ws['!cols'] = colWidths;

    // Sheet name max 31 chars
    const name = chart.title.replace(/^\d+\.\s*/, '').substring(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, name);
  });

  // Also add custom dataset if available
  if (dataset) {
    const ws = XLSX.utils.json_to_sheet(dataset.rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Dados Importados');
  }

  // Add summary sheet
  const summaryData = PRELOADED_CHARTS.map(c => ({
    'Gráfico': c.title,
    'Subtítulo': c.subtitle,
    'Tipo': c.chartType,
    'Registros': c.data.length,
    'Colunas': c.dataKeys.join(', '),
  }));
  const summaryWs = XLSX.utils.json_to_sheet(summaryData);
  summaryWs['!cols'] = [{ wch: 45 }, { wch: 40 }, { wch: 10 }, { wch: 10 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumo');

  XLSX.writeFile(wb, 'dashboard-analitico-ufmg.xlsx');
}

export function exportJSON(dataset: DataSet | null) {
  const allData = {
    title: 'Dashboard Analítico – Uso de IA no Meio Acadêmico',
    generatedAt: new Date().toISOString(),
    charts: PRELOADED_CHARTS.map(c => ({
      id: c.id,
      title: c.title,
      subtitle: c.subtitle,
      chartType: c.chartType,
      labelKey: c.labelKey,
      dataKeys: c.dataKeys,
      data: c.data,
    })),
    ...(dataset ? { customData: { name: dataset.name, rows: dataset.rows } } : {}),
  };
  const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
  saveAs(blob, 'dashboard-analitico-ufmg.json');
}

export function exportPowerBI(dataset: DataSet | null) {
  // Export a Power BI-ready Excel file with all charts as separate sheets
  const wb = XLSX.utils.book_new();

  PRELOADED_CHARTS.forEach((chart) => {
    const sheetData = chart.data.map(row => {
      const clean: Record<string, any> = {};
      clean[chart.labelKey] = row[chart.labelKey];
      chart.dataKeys.forEach(k => {
        clean[k] = row[k];
      });
      return clean;
    });
    const ws = XLSX.utils.json_to_sheet(sheetData);

    const colWidths = Object.keys(sheetData[0] || {}).map(key => ({
      wch: Math.max(key.length, ...sheetData.map(r => String(r[key] ?? '').length)) + 2,
    }));
    ws['!cols'] = colWidths;

    const name = chart.title.replace(/^\d+\.\s*/, '').substring(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, name);
  });

  if (dataset) {
    const ws = XLSX.utils.json_to_sheet(dataset.rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Dados Importados');
  }

  // Summary
  const summaryData = PRELOADED_CHARTS.map(c => ({
    'Gráfico': c.title,
    'Subtítulo': c.subtitle,
    'Tipo': c.chartType,
    'Registros': c.data.length,
    'Colunas': c.dataKeys.join(', '),
  }));
  const summaryWs = XLSX.utils.json_to_sheet(summaryData);
  summaryWs['!cols'] = [{ wch: 45 }, { wch: 40 }, { wch: 10 }, { wch: 10 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumo');

  XLSX.writeFile(wb, 'dashboard-powerbi-ufmg.xlsx');
}

export function exportPBIT(dataset: DataSet | null) {
  // Export all data as a single consolidated CSV that Power BI can import directly
  const allRows: Record<string, any>[] = [];

  PRELOADED_CHARTS.forEach((chart) => {
    chart.data.forEach(row => {
      const entry: Record<string, any> = {
        'Gráfico': chart.title,
        'Tipo': chart.chartType,
      };
      entry[chart.labelKey] = row[chart.labelKey];
      chart.dataKeys.forEach(k => {
        entry[k] = row[k];
      });
      allRows.push(entry);
    });
  });

  const ws = XLSX.utils.json_to_sheet(allRows);
  const csv = XLSX.utils.sheet_to_csv(ws, { FS: ';' });
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, 'dashboard-analitico-ufmg.csv');
}

export function handlePrint() {
  window.print();
}
