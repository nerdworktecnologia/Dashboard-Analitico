import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { DataSet } from '@/types/dashboard';
import { PRELOADED_CHARTS } from '@/data/preloadedCharts';

export async function exportPNG(elementId: string) {
  // Export each chart individually as separate PNG files
  for (const chart of PRELOADED_CHARTS) {
    const chartEl = document.querySelector(`[data-chart-id="${chart.id}"]`) as HTMLElement;
    if (!chartEl) continue;
    try {
      const dataUrl = await toPng(chartEl, { backgroundColor: '#ffffff', pixelRatio: 2 });
      const safeName = chart.title.replace(/[^a-zA-Z0-9À-ú\s]/g, '').trim().replace(/\s+/g, '-');
      saveAs(dataUrl, `${safeName}.png`);
    } catch (err) {
      console.warn(`Failed to export chart ${chart.id}`, err);
    }
  }

  // Also export the full dashboard as one combined PNG
  const el = document.getElementById(elementId);
  if (!el) return;
  const dataUrl = await toPng(el, { backgroundColor: '#ffffff', pixelRatio: 2 });
  saveAs(dataUrl, 'dashboard-completo.png');
}

export async function exportPDF(elementId: string) {
  const pdf = new jsPDF('landscape', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  // Title page
  pdf.setFontSize(28);
  pdf.setTextColor(30, 58, 95);
  pdf.text('Dashboard Analítico', pdfWidth / 2, 55, { align: 'center' });
  pdf.setFontSize(18);
  pdf.text('Uso de IA no Meio Acadêmico – UFMG', pdfWidth / 2, 70, { align: 'center' });
  pdf.setFontSize(12);
  pdf.setTextColor(100);
  pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, pdfWidth / 2, 90, { align: 'center' });
  pdf.text('Dados de 1.508 discentes • 9 gráficos', pdfWidth / 2, 100, { align: 'center' });

  // One page per chart
  for (const chart of PRELOADED_CHARTS) {
    pdf.addPage('landscape');
    
    // Chart title
    pdf.setFontSize(16);
    pdf.setTextColor(30, 58, 95);
    pdf.text(chart.title, 15, 18);
    pdf.setFontSize(10);
    pdf.setTextColor(120);
    pdf.text(chart.subtitle, 15, 26);

    // Try to capture chart element image
    const chartEl = document.querySelector(`[data-chart-id="${chart.id}"]`) as HTMLElement;
    if (chartEl) {
      try {
        const dataUrl = await toPng(chartEl, { backgroundColor: '#ffffff', pixelRatio: 2 });
        const imgProps = pdf.getImageProperties(dataUrl);
        const imgAspect = imgProps.width / imgProps.height;
        const margin = 15;
        let drawW = pdfWidth - margin * 2;
        let drawH = drawW / imgAspect;
        const maxH = pdfHeight - 35 - margin;
        if (drawH > maxH) {
          drawH = maxH;
          drawW = drawH * imgAspect;
        }
        const x = (pdfWidth - drawW) / 2;
        pdf.addImage(dataUrl, 'PNG', x, 32, drawW, drawH);
      } catch {
        pdf.setFontSize(12);
        pdf.setTextColor(150);
        pdf.text('Gráfico não pôde ser capturado.', pdfWidth / 2, pdfHeight / 2, { align: 'center' });
      }
    }
  }

  pdf.save('dashboard-mestrado-ufmg.pdf');
}

export function exportExcel(dataset: DataSet | null) {
  const wb = XLSX.utils.book_new();

  // Dashboard summary as first sheet
  const dashData: any[][] = [
    ['Dashboard Analítico – Uso de IA no Meio Acadêmico (UFMG)'],
    [`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`],
    [''],
    ['Nº', 'Gráfico', 'Subtítulo', 'Tipo', 'Registros', 'Colunas de Dados'],
  ];
  PRELOADED_CHARTS.forEach((c, i) => {
    dashData.push([i + 1, c.title, c.subtitle, c.chartType, c.data.length, c.dataKeys.join(', ')]);
  });
  dashData.push(['']);
  dashData.push(['⬇ Cada gráfico possui sua própria aba com os dados completos abaixo.']);

  // Add data tables inline for each chart
  PRELOADED_CHARTS.forEach((chart) => {
    dashData.push(['']);
    dashData.push([`📊 ${chart.title}`]);
    dashData.push([chart.subtitle]);
    const headers = [chart.labelKey, ...chart.dataKeys];
    dashData.push(headers);
    chart.data.forEach(row => {
      dashData.push([row[chart.labelKey], ...chart.dataKeys.map(k => row[k])]);
    });
  });

  const dashWs = XLSX.utils.aoa_to_sheet(dashData);
  dashWs['!cols'] = [{ wch: 6 }, { wch: 45 }, { wch: 45 }, { wch: 12 }, { wch: 10 }, { wch: 45 }];
  dashWs['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
  ];
  XLSX.utils.book_append_sheet(wb, dashWs, 'Dashboard');

  // Individual data sheets
  PRELOADED_CHARTS.forEach((chart) => {
    const sheetData = chart.data.map(row => {
      const clean: Record<string, any> = {};
      clean[chart.labelKey] = row[chart.labelKey];
      chart.dataKeys.forEach(k => { clean[k] = row[k]; });
      return clean;
    });
    const ws = XLSX.utils.json_to_sheet(sheetData);
    const colWidths = Object.keys(sheetData[0] || {}).map(key => ({
      wch: Math.max(key.length, ...sheetData.map(r => String(r[key] ?? '').length)) + 2,
    }));
    ws['!cols'] = colWidths;
    const name = chart.title.replace(/^\d+\.\s*/, '').replace(/[:\\/?*\[\]]/g, '-').substring(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, name);
  });

  if (dataset) {
    const ws = XLSX.utils.json_to_sheet(dataset.rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Dados Importados');
  }

  const b64 = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
  const byteChars = atob(b64);
  const byteArray = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteArray[i] = byteChars.charCodeAt(i);
  }
  const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, 'dashboard-analitico-ufmg.xlsx');

  // Also export the dashboard as PNG alongside
  const el = document.getElementById('chart-export-area');
  if (el) {
    toPng(el, { backgroundColor: '#ffffff', pixelRatio: 2 }).then(dataUrl => {
      saveAs(dataUrl, 'dashboard-graficos.png');
    }).catch(() => {});
  }
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

    const name = chart.title.replace(/^\d+\.\s*/, '').replace(/[:\\/?*\[\]]/g, '-').substring(0, 31);
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

  const b64 = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
  const byteChars = atob(b64);
  const byteArray = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteArray[i] = byteChars.charCodeAt(i);
  }
  const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, 'dashboard-powerbi-ufmg.xlsx');
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
