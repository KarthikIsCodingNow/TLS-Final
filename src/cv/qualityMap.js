/**
 * PORTA-TLS Spatial Measurement Quality Map
 * Version 2.0 Architectural Baseline
 */

/**
 * Render semi-transparent reliability zones onto the viewfinder canvas
 * @param {CanvasRenderingContext2D} ctx Viewport canvas context
 * @param {number} w Canvas width
 * @param {number} h Canvas height
 * @param {object} bounds Caliper bounds
 * @param {object[]} contour Trunk edge contour coordinates
 */
export function drawMeasurementQualityMap(ctx, w, h, bounds, contour) {
  if (!contour || contour.length === 0) {
    // Fallback: draw static grids if no contour is active
    const leftX = w * (bounds.leftPct / 100);
    const rightX = w * (bounds.rightPct / 100);
    const topY = h * (bounds.topPct / 100);
    const baseY = h * (bounds.basePct / 100);

    ctx.save();
    ctx.fillStyle = 'rgba(255, 0, 0, 0.15)'; // red background
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(0, 255, 100, 0.15)'; // green target box
    ctx.fillRect(leftX, topY, rightX - leftX, baseY - topY);
    ctx.restore();
    return;
  }

  const leftX = w * (bounds.leftPct / 100);
  const rightX = w * (bounds.rightPct / 100);
  const topY = h * (bounds.topPct / 100);
  const baseY = h * (bounds.basePct / 100);

  ctx.save();

  // 1. Draw Red background for the entire scene (Low confidence)
  ctx.fillStyle = 'rgba(255, 0, 0, 0.12)';
  ctx.fillRect(0, 0, w, h);

  // 2. Draw Yellow zones (caliper bounding zone)
  ctx.fillStyle = 'rgba(255, 200, 0, 0.15)';
  ctx.fillRect(leftX - 8, topY, (rightX - leftX) + 16, baseY - topY);

  // 3. Draw Green reliable zone following the segmented trunk contour
  ctx.beginPath();
  // Trace left edge from top to base
  ctx.moveTo(contour[0].leftX + 4, contour[0].y);
  for (let i = 1; i < contour.length; i++) {
    ctx.lineTo(contour[i].leftX + 4, contour[i].y);
  }
  // Trace right edge back to top
  for (let i = contour.length - 1; i >= 0; i--) {
    ctx.lineTo(contour[i].rightX - 4, contour[i].y);
  }
  ctx.closePath();
  
  ctx.fillStyle = 'rgba(0, 255, 100, 0.22)';
  ctx.fill();

  ctx.restore();
}
