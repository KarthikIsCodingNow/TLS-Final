/**
 * PORTA-TLS Publication-Grade Canvas Plotter
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

  // Styling system: Monochrome CAD Console style
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#222222';
  ctx.lineWidth = 1;
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
  ctx.strokeStyle = '#181818';
  ctx.beginPath();
  for (let val = 0; val <= maxVal; val += maxVal / 5) {
    const x = mapX(val);
    const y = mapY(val);
    // Vertical grid
    ctx.moveTo(x, padTop); ctx.lineTo(x, padTop + graphH);
    // Horizontal grid
    ctx.moveTo(padLeft, y); ctx.lineTo(padLeft + graphW, y);
  }
  ctx.stroke();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padLeft, padTop); ctx.lineTo(padLeft, padTop + graphH);
  ctx.moveTo(padLeft, padTop + graphH); ctx.lineTo(padLeft + graphW, padTop + graphH);
  ctx.stroke();

  // 3. Draw Perfect Agreement Diagonal line (y = x)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(mapX(0), mapY(0));
  ctx.lineTo(mapX(maxVal * 0.9), mapY(maxVal * 0.9));
  ctx.stroke();
  ctx.setLineDash([]);

  // 4. Draw Scatter points
  ctx.fillStyle = '#00ff66';
  for (let i = 0; i < appValues.length; i++) {
    const x = mapX(gtValues[i]);
    const y = mapY(appValues[i]);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#000000';
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

  ctx.strokeStyle = '#ffff00';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(mapX(0), mapY(intercept));
  ctx.lineTo(mapX(maxVal * 0.9), mapY(m * (maxVal * 0.9) + intercept));
  ctx.stroke();

  // 6. Draw labels
  ctx.fillStyle = '#ffffff';
  ctx.font = '10px "Share Tech Mono"';
  ctx.textAlign = 'center';
  ctx.fillText(`GROUND TRUTH (${unit})`, padLeft + graphW / 2, h - 8);

  ctx.save();
  ctx.translate(12, padTop + graphH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(`APPLICATION VALUE (${unit})`, 0, 0);
  ctx.restore();

  // Legend and R^2 stats
  const reg = calculateRegressionMetrics(appValues, gtValues);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px "Rajdhani"';
  ctx.textAlign = 'left';
  ctx.fillText(title.toUpperCase(), padLeft + 10, padTop + 15);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '10px "Share Tech Mono"';
  ctx.fillText(`R² = ${reg.r2.toFixed(3)}`, padLeft + 10, padTop + 28);
  ctx.fillText(`r  = ${reg.r.toFixed(3)} (Pearson)`, padLeft + 10, padTop + 38);
  ctx.fillText(`y  = ${m.toFixed(2)}x + ${intercept.toFixed(2)}`, padLeft + 10, padTop + 48);

  // Draw axis tick values
  ctx.fillStyle = '#888888';
  ctx.textAlign = 'right';
  for (let val = 0; val <= maxVal; val += maxVal / 4) {
    ctx.fillText(val.toFixed(1), padLeft - 6, mapY(val) + 3);
  }
  
  ctx.textAlign = 'center';
  for (let val = 0; val <= maxVal; val += maxVal / 4) {
    ctx.fillText(val.toFixed(1), mapX(val), padTop + graphH + 14);
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

  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#222222';
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
  ctx.strokeStyle = '#222222';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padLeft, mapY(0));
  ctx.lineTo(padLeft + graphW, mapY(0));
  ctx.stroke();

  // Draw Bland-Altman mean Bias and Limits of Agreement
  ctx.strokeStyle = '#00ffcc';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(padLeft, mapY(ba.bias));
  ctx.lineTo(padLeft + graphW, mapY(ba.bias));
  ctx.stroke();

  ctx.strokeStyle = '#ff3366';
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(padLeft, mapY(ba.upperAgreementLimit));
  ctx.lineTo(padLeft + graphW, mapY(ba.upperAgreementLimit));
  ctx.moveTo(padLeft, mapY(ba.lowerAgreementLimit));
  ctx.lineTo(padLeft + graphW, mapY(ba.lowerAgreementLimit));
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw points
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < pts.length; i++) {
    const x = mapX(pts[i].avg);
    const y = mapY(pts[i].diff);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.stroke();
  }

  // Axes ticks
  ctx.fillStyle = '#888888';
  ctx.font = '8px "Share Tech Mono"';
  ctx.textAlign = 'right';
  ctx.fillText(ba.upperAgreementLimit.toFixed(2), padLeft - 6, mapY(ba.upperAgreementLimit) + 3);
  ctx.fillText(ba.bias.toFixed(2), padLeft - 6, mapY(ba.bias) + 3);
  ctx.fillText(ba.lowerAgreementLimit.toFixed(2), padLeft - 6, mapY(ba.lowerAgreementLimit) + 3);

  ctx.textAlign = 'center';
  for (let val = 0; val <= maxAvg; val += maxAvg / 4) {
    ctx.fillText(val.toFixed(1), mapX(val), padTop + graphH + 14);
  }

  // Label text
  ctx.fillStyle = '#ffffff';
  ctx.font = '10px "Share Tech Mono"';
  ctx.textAlign = 'center';
  ctx.fillText(`MEAN OF MEASUREMENTS (${unit})`, padLeft + graphW / 2, h - 8);

  ctx.save();
  ctx.translate(12, padTop + graphH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(`DIFFERENCE (APP - GT ${unit})`, 0, 0);
  ctx.restore();

  // Annotations
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px "Rajdhani"';
  ctx.textAlign = 'left';
  ctx.fillText(title.toUpperCase(), padLeft + 10, padTop + 15);
  ctx.fillStyle = '#ff3366';
  ctx.font = '9px "Share Tech Mono"';
  ctx.fillText(`+1.96 SD: ${ba.upperAgreementLimit.toFixed(3)}`, padLeft + 10, padTop + 27);
  ctx.fillStyle = '#00ffcc';
  ctx.fillText(`BIAS: ${ba.bias.toFixed(3)}`, padLeft + 10, padTop + 37);
  ctx.fillStyle = '#ff3366';
  ctx.fillText(`-1.96 SD: ${ba.lowerAgreementLimit.toFixed(3)}`, padLeft + 10, padTop + 47);
}
