import PptxGenJS from 'pptxgenjs';
import { toPng } from 'html-to-image';
import { PRELOADED_CHARTS } from '@/data/preloadedCharts';

export async function exportPowerPoint() {
  console.log('[PPTX] Starting export...');
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Dashboard Analítico UFMG';
  pptx.subject = 'Uso de IA no Meio Acadêmico';
  pptx.title = 'Dashboard Analítico – Uso de IA no Meio Acadêmico (UFMG)';

  // Title slide
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: '1E3A5F' };
  titleSlide.addText('Dashboard Analítico', {
    x: 0.5, y: 1.5, w: 12.33, h: 1.5,
    fontSize: 44, fontFace: 'Arial', color: 'FFFFFF', bold: true, align: 'center',
  });
  titleSlide.addText('Uso de IA no Meio Acadêmico – UFMG', {
    x: 0.5, y: 3.0, w: 12.33, h: 1,
    fontSize: 24, fontFace: 'Arial', color: 'B0C4DE', align: 'center',
  });
  titleSlide.addText(
    `Dados de 1.508 discentes • 9 gráficos\n${new Date().toLocaleDateString('pt-BR')}`,
    {
      x: 0.5, y: 4.5, w: 12.33, h: 1,
      fontSize: 16, fontFace: 'Arial', color: '8899AA', align: 'center',
    }
  );

  // One slide per chart
  for (const chart of PRELOADED_CHARTS) {
    const slide = pptx.addSlide();
    slide.background = { color: 'FFFFFF' };

    // Title bar as colored rectangle
    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: 13.33, h: 0.8,
      fill: { color: '1E3A5F' },
    });
    slide.addText(chart.title, {
      x: 0.5, y: 0.1, w: 12.33, h: 0.6,
      fontSize: 20, fontFace: 'Arial', color: 'FFFFFF', bold: true,
    });
    slide.addText(chart.subtitle, {
      x: 0.5, y: 0.85, w: 12.33, h: 0.4,
      fontSize: 12, fontFace: 'Arial', color: '666666', italic: true,
    });

    // Try to capture the individual chart element as image
    const chartEl = document.querySelector(`[data-chart-id="${chart.id}"]`) as HTMLElement;
    if (chartEl) {
      try {
        const dataUrl = await toPng(chartEl, { backgroundColor: '#ffffff', pixelRatio: 2 });
        slide.addImage({
          data: dataUrl,
          x: 0.5, y: 1.4, w: 12.33, h: 5.5,
        });
      } catch (err) {
        console.warn('Failed to capture chart image, using table fallback', err);
        addDataTable(slide, chart);
      }
    } else {
      addDataTable(slide, chart);
    }
  }

  // End slide
  const endSlide = pptx.addSlide();
  endSlide.background = { color: '1E3A5F' };
  endSlide.addText('Obrigado!', {
    x: 0.5, y: 2.5, w: 12.33, h: 1.5,
    fontSize: 44, fontFace: 'Arial', color: 'FFFFFF', bold: true, align: 'center',
  });
  endSlide.addText('Dashboard Analítico – UFMG', {
    x: 0.5, y: 4.2, w: 12.33, h: 1,
    fontSize: 18, fontFace: 'Arial', color: 'B0C4DE', align: 'center',
  });

  console.log('[PPTX] Writing file...');
  await pptx.writeFile({ fileName: 'dashboard-mestrado-ufmg.pptx' });
  console.log('[PPTX] Export complete!');
}

function addDataTable(slide: any, chart: typeof PRELOADED_CHARTS[0]) {
  const headers = [chart.labelKey, ...chart.dataKeys];
  const rows = [
    headers.map(h => ({
      text: h,
      options: { bold: true, fontSize: 10, color: 'FFFFFF', fill: { color: '1E3A5F' } },
    })),
    ...chart.data.map((row, i) =>
      headers.map(h => ({
        text: String(row[h] ?? ''),
        options: { fontSize: 10, fill: { color: i % 2 === 0 ? 'F0F4F8' : 'FFFFFF' } },
      }))
    ),
  ];

  slide.addTable(rows, {
    x: 0.5, y: 1.5, w: 12.33,
    border: { pt: 0.5, color: 'CCCCCC' },
    colW: headers.map(() => 12.33 / headers.length),
  });
}
