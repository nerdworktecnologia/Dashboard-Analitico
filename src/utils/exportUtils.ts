import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { DataSet } from '@/types/dashboard';

export async function exportPNG(elementId: string) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const dataUrl = await toPng(el, { backgroundColor: '#ffffff' });
  saveAs(dataUrl, 'grafico.png');
}

export async function exportPDF(elementId: string) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const dataUrl = await toPng(el, { backgroundColor: '#ffffff' });
  const pdf = new jsPDF('landscape', 'mm', 'a4');
  const imgProps = pdf.getImageProperties(dataUrl);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  pdf.addImage(dataUrl, 'PNG', 0, 10, pdfWidth, pdfHeight);
  pdf.save('grafico.pdf');
}

export function exportExcel(dataset: DataSet) {
  const ws = XLSX.utils.json_to_sheet(dataset.rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Dados');
  XLSX.writeFile(wb, `${dataset.name}.xlsx`);
}

export function exportJSON(dataset: DataSet) {
  const blob = new Blob([JSON.stringify(dataset.rows, null, 2)], { type: 'application/json' });
  saveAs(blob, `${dataset.name}.json`);
}

export function exportPowerBI(dataset: DataSet) {
  const powerBIModel = {
    name: dataset.name,
    tables: [{
      name: 'Dados',
      columns: dataset.headers.map(h => ({
        name: h,
        dataType: typeof dataset.rows[0]?.[h] === 'number' ? 'int64' : 'string',
      })),
      rows: dataset.rows,
    }],
  };
  const blob = new Blob([JSON.stringify(powerBIModel, null, 2)], { type: 'application/json' });
  saveAs(blob, `${dataset.name}_powerbi.json`);
}

export function exportPBIT(dataset: DataSet) {
  const template = {
    version: '1.0',
    dataModel: {
      tables: [{
        name: dataset.name,
        columns: dataset.headers.map(h => ({
          name: h,
          dataType: typeof dataset.rows[0]?.[h] === 'number' ? 'Double' : 'String',
        })),
      }],
    },
    dataSources: [{
      name: 'Imported Data',
      connectionString: 'embedded',
    }],
  };
  const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
  saveAs(blob, `${dataset.name}.pbit.json`);
}

export function handlePrint() {
  window.print();
}
