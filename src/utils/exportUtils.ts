import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
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
  const powerBIModel = {
    name: 'Dashboard Analítico – Uso de IA no Meio Acadêmico (UFMG)',
    compatibilityLevel: 1500,
    model: {
      culture: 'pt-BR',
      tables: PRELOADED_CHARTS.map(chart => ({
        name: chart.title.replace(/^\d+\.\s*/, '').substring(0, 50),
        columns: [
          { name: chart.labelKey, dataType: 'String', sourceColumn: chart.labelKey },
          ...chart.dataKeys.map(k => ({
            name: k,
            dataType: 'Double',
            sourceColumn: k,
            summarizeBy: 'sum',
          })),
        ],
        partitions: [{
          name: 'Data',
          source: { type: 'embedded' },
        }],
        rows: chart.data,
      })),
      relationships: [],
    },
    dataSources: [{
      name: 'EmbeddedData',
      connectionString: 'Provider=Microsoft.AnalysisServices;Data Source=$Embedded$',
      type: 'structured',
    }],
    visualizations: PRELOADED_CHARTS.map((chart, i) => ({
      id: `visual_${i + 1}`,
      type: chart.chartType === 'pie' || chart.chartType === 'donut' ? 'pieChart' :
            chart.chartType === 'bar' ? 'barChart' :
            chart.chartType === 'line' ? 'lineChart' :
            chart.chartType === 'area' ? 'areaChart' :
            chart.chartType === 'radar' ? 'radarChart' :
            chart.chartType === 'scatter' ? 'scatterChart' : 'clusteredBarChart',
      title: chart.title,
      table: chart.title.replace(/^\d+\.\s*/, '').substring(0, 50),
      category: chart.labelKey,
      values: chart.dataKeys,
      position: {
        x: (i % 3) * 400,
        y: Math.floor(i / 3) * 320,
        width: 380,
        height: 300,
      },
    })),
  };
  const blob = new Blob([JSON.stringify(powerBIModel, null, 2)], { type: 'application/json' });
  saveAs(blob, 'dashboard-analitico-ufmg-powerbi.json');
}

export async function exportPBIT(dataset: DataSet | null) {
  const zip = new JSZip();

  // DataModelSchema - the core of a .pbit file
  const dataModelSchema = {
    name: 'Dashboard Analítico – IA no Meio Acadêmico',
    compatibilityLevel: 1500,
    model: {
      culture: 'pt-BR',
      dataAccessOptions: { legacyRedirects: true, returnErrorValuesAsNull: true },
      defaultPowerBIDataSourceVersion: '2.0',
      tables: PRELOADED_CHARTS.map(chart => {
        const tableName = chart.title.replace(/^\d+\.\s*/, '').substring(0, 50);
        return {
          name: tableName,
          columns: [
            { name: chart.labelKey, dataType: 'string', sourceColumn: chart.labelKey, summarizeBy: 'none' },
            ...chart.dataKeys.map(k => ({
              name: k,
              dataType: 'double',
              sourceColumn: k,
              summarizeBy: 'sum',
              formatString: '0.00',
            })),
          ],
          partitions: [{
            name: tableName,
            mode: 'import',
            source: {
              type: 'm',
              expression: [
                `let`,
                `    Source = Table.FromRows(Json.Document(Binary.Decompress(Binary.FromText("${btoa(JSON.stringify(chart.data))}", BinaryEncoding.Base64), Compression.Deflate)), type table [${[chart.labelKey, ...chart.dataKeys].map(k => `#"${k}" = text`).join(', ')}])`,
                `in`,
                `    Source`,
              ],
            },
          }],
          measures: chart.dataKeys.map(k => ({
            name: `Total ${k}`,
            expression: `SUM('${tableName}'[${k}])`,
          })),
        };
      }),
      annotations: [
        { name: 'PBI_QueryOrder', value: JSON.stringify(PRELOADED_CHARTS.map((_, i) => i)) },
        { name: 'PBIDesktopVersion', value: '2.128.0.0' },
      ],
    },
  };

  // Add files to ZIP (mimicking .pbit structure)
  zip.file('DataModelSchema', JSON.stringify(dataModelSchema, null, 2));
  zip.file('[Content_Types].xml',
    '<?xml version="1.0" encoding="utf-8"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="json" ContentType="application/json" />' +
    '<Override PartName="/DataModelSchema" ContentType="application/json" />' +
    '<Override PartName="/DiagramState" ContentType="application/json" />' +
    '</Types>'
  );
  zip.file('DiagramState', JSON.stringify({ version: '1.0', diagrams: [] }));
  zip.file('Version', '2.128.0.0');

  const content = await zip.generateAsync({ type: 'blob', mimeType: 'application/x-pbit' });
  saveAs(content, 'dashboard-analitico-ufmg.pbit');
}

export function handlePrint() {
  window.print();
}
