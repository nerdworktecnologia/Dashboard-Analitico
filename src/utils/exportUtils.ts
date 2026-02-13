import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
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

  pdf.setFontSize(20);
  pdf.setTextColor(30, 58, 95);
  pdf.text('Dashboard Analítico', pdfWidth / 2, 40, { align: 'center' });
  pdf.setFontSize(14);
  pdf.text('Uso de IA no Meio Acadêmico – UFMG', pdfWidth / 2, 52, { align: 'center' });
  pdf.setFontSize(10);
  pdf.setTextColor(100);
  pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, pdfWidth / 2, 64, { align: 'center' });
  pdf.text('Dados de 1.508 discentes • 9 gráficos', pdfWidth / 2, 72, { align: 'center' });

  pdf.addPage('landscape');
  const imgProps = pdf.getImageProperties(dataUrl);
  const imgAspect = imgProps.width / imgProps.height;
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

async function captureChartImages(): Promise<{ title: string; base64: string }[]> {
  const images: { title: string; base64: string }[] = [];
  
  // Try to capture individual chart cards from the grid
  const chartCards = document.querySelectorAll('[data-chart-id]');
  
  if (chartCards.length > 0) {
    for (let i = 0; i < chartCards.length; i++) {
      const card = chartCards[i] as HTMLElement;
      try {
        const dataUrl = await toPng(card, { backgroundColor: '#ffffff', pixelRatio: 2 });
        const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
        images.push({ title: PRELOADED_CHARTS[i]?.title || `Gráfico ${i + 1}`, base64 });
      } catch {
        // skip failed captures
      }
    }
  }
  
  // Fallback: capture the entire chart area
  if (images.length === 0) {
    const el = document.getElementById('chart-export-area');
    if (el) {
      const dataUrl = await toPng(el, { backgroundColor: '#ffffff', pixelRatio: 2 });
      const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
      images.push({ title: 'Dashboard Completo', base64 });
    }
  }
  
  return images;
}

export async function exportExcel(dataset: DataSet | null) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Dashboard Analítico UFMG';
  wb.created = new Date();

  // ---- Dashboard sheet with chart images ----
  const dashWs = wb.addWorksheet('Dashboard', {
    properties: { defaultColWidth: 15 },
  });

  // Title row
  dashWs.mergeCells('A1:L1');
  const titleCell = dashWs.getCell('A1');
  titleCell.value = 'Dashboard Analítico – Uso de IA no Meio Acadêmico (UFMG)';
  titleCell.font = { size: 16, bold: true, color: { argb: 'FF1E3A5F' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  dashWs.getRow(1).height = 35;

  // Subtitle
  dashWs.mergeCells('A2:L2');
  const subCell = dashWs.getCell('A2');
  subCell.value = `Gerado em: ${new Date().toLocaleDateString('pt-BR')} • 1.508 discentes • 9 gráficos`;
  subCell.font = { size: 10, color: { argb: 'FF666666' } };
  subCell.alignment = { horizontal: 'center' };

  // Capture and embed chart images
  const chartImages = await captureChartImages();
  
  const COLS_PER_CHART = 4; // each chart spans 4 columns
  const CHARTS_PER_ROW = 3;
  let currentRow = 4;

  for (let i = 0; i < chartImages.length; i++) {
    const col = (i % CHARTS_PER_ROW) * COLS_PER_CHART;
    const row = currentRow + Math.floor(i / CHARTS_PER_ROW) * 20;

    // Chart title
    const titleCellRef = dashWs.getCell(row, col + 1);
    titleCellRef.value = chartImages[i].title;
    titleCellRef.font = { size: 10, bold: true, color: { argb: 'FF1E3A5F' } };

    // Add image
    const imageId = wb.addImage({
      base64: chartImages[i].base64,
      extension: 'png',
    });

    dashWs.addImage(imageId, {
      tl: { col: col, row: row },
      ext: { width: 420, height: 280 },
    });
  }

  // ---- Data sheets for each chart ----
  PRELOADED_CHARTS.forEach((chart) => {
    const name = chart.title.replace(/^\d+\.\s*/, '').substring(0, 31);
    const ws = wb.addWorksheet(name);

    // Header row with styling
    const headers = [chart.labelKey, ...chart.dataKeys];
    const headerRow = ws.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
      cell.alignment = { horizontal: 'center' };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
      };
    });

    // Data rows
    chart.data.forEach((row, idx) => {
      const values = [row[chart.labelKey], ...chart.dataKeys.map(k => row[k])];
      const dataRow = ws.addRow(values);
      if (idx % 2 === 0) {
        dataRow.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F4F8' } };
        });
      }
    });

    // Auto-size columns
    ws.columns.forEach((col) => {
      let maxLen = 10;
      col.eachCell?.({ includeEmpty: false }, (cell) => {
        const len = String(cell.value ?? '').length;
        if (len > maxLen) maxLen = len;
      });
      col.width = maxLen + 4;
    });
  });

  // Custom dataset
  if (dataset) {
    const ws = wb.addWorksheet('Dados Importados');
    if (dataset.rows.length > 0) {
      ws.addRow(Object.keys(dataset.rows[0]));
      dataset.rows.forEach(row => ws.addRow(Object.values(row)));
    }
  }

  // Summary sheet
  const summaryWs = wb.addWorksheet('Resumo');
  const sHeaders = ['Gráfico', 'Subtítulo', 'Tipo', 'Registros', 'Colunas'];
  const sHeaderRow = summaryWs.addRow(sHeaders);
  sHeaderRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
  });
  PRELOADED_CHARTS.forEach(c => {
    summaryWs.addRow([c.title, c.subtitle, c.chartType, c.data.length, c.dataKeys.join(', ')]);
  });
  summaryWs.columns = [{ width: 45 }, { width: 40 }, { width: 10 }, { width: 10 }, { width: 40 }];

  // Write file
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, 'dashboard-analitico-ufmg.xlsx');
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
