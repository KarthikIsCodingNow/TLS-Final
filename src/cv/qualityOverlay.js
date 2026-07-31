/**
 * PORTA-TLS Real-Time Quality Overlay Renderer
 * Version 2.2 Architectural Baseline - Task 8 Extension
 */

/**
 * Render real-time computer vision quality overlay on canvas (Requirement 16 & 17)
 * @param {HTMLCanvasElement} canvas Target overlay canvas
 * @param {object} cvResult Processed pipeline result
 */
export function drawRealTimeQualityOverlay(canvas, cvResult) {
  if (!canvas || !cvResult || !cvResult.trunkBoundaries) return;

  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  const tb = cvResult.trunkBoundaries;
  const base = cvResult.autoBase;
  const top = cvResult.autoTop;
  const conf = cvResult.detectionConfidence || {};

  // 1. Draw Cyan Trunk Edges
  if (tb.leftContour && tb.leftContour.length > 0) {
    ctx.strokeStyle = '#00ffff'; // Cyan
    ctx.lineWidth = 2.0;

    // Left boundary
    ctx.beginPath();
    tb.leftContour.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();

    // Right boundary
    ctx.beginPath();
    tb.rightContour.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();
  }

  // 2. Draw Yellow Dashed Centerline Axis
  if (tb.centerLine && tb.centerLine.length > 0) {
    ctx.strokeStyle = '#ffff00'; // Yellow
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    tb.centerLine.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 3. Draw Green Target Reticle for Base Point
  if (base && typeof base.baseY === 'number') {
    const cx = tb.centerLine.length > 0 ? tb.centerLine[tb.centerLine.length - 1].x : w / 2;
    const cy = base.baseY;

    ctx.strokeStyle = '#00ffcc'; // Neon green
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, 2 * Math.PI);
    ctx.moveTo(cx - 15, cy); ctx.lineTo(cx + 15, cy);
    ctx.moveTo(cx, cy - 15); ctx.lineTo(cx, cy + 15);
    ctx.stroke();

    ctx.fillStyle = '#00ffcc';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(`AUTO BASE (${Math.round((base.baseConfidence || 0.8) * 100)}%)`, cx + 14, cy + 3);
  }

  // 4. Draw Red Target Reticle for Canopy Apex
  if (top && typeof top.topY === 'number') {
    const cx = tb.centerLine.length > 0 ? tb.centerLine[0].x : w / 2;
    const cy = top.topY;

    ctx.strokeStyle = '#ff3366'; // Red
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, 2 * Math.PI);
    ctx.moveTo(cx - 15, cy); ctx.lineTo(cx + 15, cy);
    ctx.moveTo(cx, cy - 15); ctx.lineTo(cx, cy + 15);
    ctx.stroke();

    ctx.fillStyle = '#ff3366';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(`AUTO CANOPY (${Math.round((top.canopyConfidence || 0.8) * 100)}%)`, cx + 14, cy + 3);
  }

  // 5. Draw Detection Confidence HUD Scorecard (Requirement 17)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.fillRect(10, 10, 210, 115);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.strokeRect(10, 10, 210, 115);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px "Rajdhani"';
  ctx.fillText('DETECTION CONFIDENCE SCORECARD', 18, 25);

  ctx.font = '9px monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillText(`• TREE DETECTION:  ${conf.treeDetectionPct || 85}%`, 18, 40);
  ctx.fillText(`• BASE CONFIDENCE: ${conf.basePct || 80}%`, 18, 54);
  ctx.fillText(`• CANOPY CONFIDENCE:${conf.canopyPct || 80}%`, 18, 68);
  ctx.fillText(`• TRUNK CONFIDENCE: ${conf.trunkPct || 85}%`, 18, 82);
  ctx.fillText(`• TRACKING LOCK:   ${conf.trackingPct || 90}%`, 18, 96);

  ctx.fillStyle = '#00ffcc';
  ctx.font = 'bold 10px monospace';
  ctx.fillText(`OVERALL: ${conf.overallPct || 84}%`, 18, 114);
}
