/**
 * PORTA-TLS Publication-Grade Canvas Plotter (Flat Design Theme)
 * Version 2.0 Architectural Baseline
 */
import { calculateRegressionMetrics, calculateBlandAltman } from './statisticsEngine.js';

/**
 * Draw a regression plot (Ground Truth vs App Value) with trendline and R^2 label
 */
export function drawRegressionPlot(canvas, appValues, gtValues, title, unit = 'm') {
  if (!canvas || !appValues || appValues.length === 0) return;
  const ctx = canvas.getContext('2d');
  
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Styling system: Crisp Light Canvas Flat style
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#E5E7EB';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, w, h);

  const padLeft = 55;
  const padRight = 20;
  const padTop = 30;
  const padBottom = 40;

  const graphW = w - padLeft - padRight;
  const graphH = h - padTop - padBottom;

  // 1. Determine bounding ranges
  const maxVal = Math.max(...appValues, ...gtValues, 1.0) * 1.15;
  const minVal = 0.0;

  // Math coordinate conversion helpers
  const mapX = (val) => padLeft + ((val - minVal) / (maxVal - minVal)) * graphW;
  const mapY = (val) => padTop + graphH - ((val - minVal) / (maxVal - minVal)) * graphH;

  // 2. Draw Gridlines & Axes
  ctx.strokeStyle = '#F3F4F6';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let val = 0; val <= maxVal; val += maxVal / 5) {
    const x = mapX(val);
    const y = mapY(val);
    ctx.moveTo(x, padTop); ctx.lineTo(x, padTop + graphH);
    ctx.moveTo(padLeft, y); ctx.lineTo(padLeft + graphW, y);
  }
  ctx.stroke();

  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(padLeft, padTop); ctx.lineTo(padLeft, padTop + graphH);
  ctx.moveTo(padLeft, padTop + graphH); ctx.lineTo(padLeft + graphW, padTop + graphH);
  ctx.stroke();

  // 3. Draw Perfect Agreement Diagonal line (y = x)
  ctx.strokeStyle = '#9CA3AF';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(mapX(0), mapY(0));
  ctx.lineTo(mapX(maxVal * 0.9), mapY(maxVal * 0.9));
  ctx.stroke();
  ctx.setLineDash([]);

  // 4. Draw Scatter points (Primary Blue)
  ctx.fillStyle = '#3B82F6';
  for (let i = 0; i < appValues.length; i++) {
    const x = mapX(gtValues[i]);
    const y = mapY(appValues[i]);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // 5. Fit & Draw Linear Regression trendline: y = mX + c
  const n = appValues.length;
  let sumX = 0, sumY = 0, sumXX = 0, sumXY = 0;
  for (let i = 0; i < n; i++) {
    sumX += gtValues[i];
    sumY += appValues[i];
    sumXX += gtValues[i] * gtValues[i];
    sumXY += gtValues[i] * appValues[i];
  }
  const denom = n * sumXX - sumX * sumX;
  let m = 1;
  let intercept = 0;
  if (Math.abs(denom) > 1e-5) {
    m = (n * sumXY - sumX * sumY) / denom;
    intercept = (sumY - m * sumX) / n;
  }

  ctx.strokeStyle = '#F59E0B'; // Amber trendline
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(mapX(0), mapY(intercept));
  ctx.lineTo(mapX(maxVal * 0.9), mapY(m * (maxVal * 0.9) + intercept));
  ctx.stroke();

  // 6. Draw labels
  ctx.fillStyle = '#4B5563';
  ctx.font = '600 11px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`GROUND TRUTH (${unit})`, padLeft + graphW / 2, h - 8);

  ctx.save();
  ctx.translate(14, padTop + graphH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(`APPLICATION VALUE (${unit})`, 0, 0);
  ctx.restore();

  // Legend and R^2 stats
  const reg = calculateRegressionMetrics(appValues, gtValues);
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 12px "Outfit", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(title.toUpperCase(), padLeft + 12, padTop + 16);
  
  ctx.fillStyle = '#4B5563';
  ctx.font = '600 11px "JetBrains Mono", monospace';
  ctx.fillText(`R² = ${reg.r2.toFixed(3)}`, padLeft + 12, padTop + 32);
  ctx.fillText(`r  = ${reg.r.toFixed(3)}`, padLeft + 12, padTop + 46);
  ctx.fillText(`y  = ${m.toFixed(2)}x + ${intercept.toFixed(2)}`, padLeft + 12, padTop + 60);

  // Draw axis tick values
  ctx.fillStyle = '#6B7280';
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  for (let val = 0; val <= maxVal; val += maxVal / 4) {
    ctx.fillText(val.toFixed(1), padLeft - 8, mapY(val) + 3);
  }
  
  ctx.textAlign = 'center';
  for (let val = 0; val <= maxVal; val += maxVal / 4) {
    ctx.fillText(val.toFixed(1), mapX(val), padTop + graphH + 16);
  }
}

/**
 * Draw Bland-Altman agreement plot (Difference vs Average)
 */
export function drawBlandAltmanPlot(canvas, appValues, gtValues, title, unit = 'm') {
  if (!canvas || !appValues || appValues.length === 0) return;
  const ctx = canvas.getContext('2d');
  
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#E5E7EB';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, w, h);

  const padLeft = 55;
  const padRight = 20;
  const padTop = 30;
  const padBottom = 40;

  const graphW = w - padLeft - padRight;
  const graphH = h - padTop - padBottom;

  // Calculate points: average (X) and difference (Y)
  const pts = appValues.map((v, i) => ({
    avg: (v + gtValues[i]) / 2.0,
    diff: v - gtValues[i]
  }));

  const ba = calculateBlandAltman(appValues, gtValues);

  // Determine bounds
  const maxAvg = Math.max(...pts.map(p => p.avg), 1.0) * 1.15;
  const minAvg = 0.0;
  
  const absDiffs = pts.map(p => Math.abs(p.diff));
  const maxDiff = Math.max(...absDiffs, Math.abs(ba.upperAgreementLimit), 1.0) * 1.3;
  const minDiff = -maxDiff;

  const mapX = (val) => padLeft + ((val - minAvg) / (maxAvg - minAvg)) * graphW;
  const mapY = (val) => padTop + graphH - ((val - minDiff) / (maxDiff - minDiff)) * graphH;

  // Draw central zero line
  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padLeft, mapY(0));
  ctx.lineTo(padLeft + graphW, mapY(0));
  ctx.stroke();

  // Draw Bland-Altman mean Bias and Limits of Agreement
  ctx.strokeStyle = '#10B981'; // Emerald bias
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padLeft, mapY(ba.bias));
  ctx.lineTo(padLeft + graphW, mapY(ba.bias));
  ctx.stroke();

  ctx.strokeStyle = '#EF4444'; // Red limits
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(padLeft, mapY(ba.upperAgreementLimit));
  ctx.lineTo(padLeft + graphW, mapY(ba.upperAgreementLimit));
  ctx.moveTo(padLeft, mapY(ba.lowerAgreementLimit));
  ctx.lineTo(padLeft + graphW, mapY(ba.lowerAgreementLimit));
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw points
  ctx.fillStyle = '#3B82F6';
  for (let i = 0; i < pts.length; i++) {
    const x = mapX(pts[i].avg);
    const y = mapY(pts[i].diff);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Axes ticks
  ctx.fillStyle = '#6B7280';
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(ba.upperAgreementLimit.toFixed(2), padLeft - 8, mapY(ba.upperAgreementLimit) + 3);
  ctx.fillText(ba.bias.toFixed(2), padLeft - 8, mapY(ba.bias) + 3);
  ctx.fillText(ba.lowerAgreementLimit.toFixed(2), padLeft - 8, mapY(ba.lowerAgreementLimit) + 3);

  ctx.textAlign = 'center';
  for (let val = 0; val <= maxAvg; val += maxAvg / 4) {
    ctx.fillText(val.toFixed(1), mapX(val), padTop + graphH + 16);
  }

  // Label text
  ctx.fillStyle = '#4B5563';
  ctx.font = '600 11px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`MEAN OF MEASUREMENTS (${unit})`, padLeft + graphW / 2, h - 8);

  ctx.save();
  ctx.translate(14, padTop + graphH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(`DIFFERENCE (APP - GT ${unit})`, 0, 0);
  ctx.restore();

  // Annotations
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 12px "Outfit", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(title.toUpperCase(), padLeft + 12, padTop + 16);
  
  ctx.fillStyle = '#DC2626';
  ctx.font = '600 10px "JetBrains Mono", monospace';
  ctx.fillText(`+1.96 SD: ${ba.upperAgreementLimit.toFixed(3)}`, padLeft + 12, padTop + 32);
  ctx.fillStyle = '#059669';
  ctx.fillText(`BIAS: ${ba.bias.toFixed(3)}`, padLeft + 12, padTop + 46);
  ctx.fillStyle = '#DC2626';
  ctx.fillText(`-1.96 SD: ${ba.lowerAgreementLimit.toFixed(3)}`, padLeft + 12, padTop + 60);
}
