/**
 * PORTA-TLS Automatic Reference Target Detector
 * Version 2.0 Architectural Baseline
 */

/**
 * Scan frame for rectangular targets matching standard references (A4 Paper, Card, Survey board)
 * @param {ImageData} imgData Input camera frame
 * @param {string} targetType 'card' (8.56x5.4cm) or 'a4' (29.7x21.0cm)
 * @returns {object} { found: boolean, scalePxPerCm: number, rotationDeg: number, bbox: number[] }
 */
export function detectReferenceTarget(imgData, targetType = 'card') {
  const w = imgData.width;
  const h = imgData.height;
  const data = imgData.data;

  // Expected aspect ratios: card (1.58), a4 (1.41), board (1.0)
  const targetRatio = targetType === 'card' ? 1.586 : (targetType === 'a4' ? 1.414 : 1.0);
  const sizeCm = targetType === 'card' ? 8.56 : (targetType === 'a4' ? 29.7 : 30.0);

  // Fast downsampled bounding-box checker for high-contrast white rectangles
  let bestCandidate = null;
  let bestScore = 0;

  const yStep = Math.max(1, Math.floor(h / 30));
  const xStep = Math.max(1, Math.floor(w / 30));

  // Find bounding contours by simple threshold scans
  for (let y = yStep; y < h - yStep; y += yStep * 2) {
    let segmentStartX = -1;
    for (let x = xStep; x < w - xStep; x += xStep) {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx+1];
      const b = data[idx+2];

      // White/highly contrasting target
      const isWhite = (r > 180 && g > 180 && b > 180);

      if (isWhite && segmentStartX === -1) {
        segmentStartX = x;
      } else if (!isWhite && segmentStartX !== -1) {
        const segW = x - segmentStartX;
        if (segW > 20 && segW < w * 0.5) {
          // Trace vertically to find height
          let segH = 0;
          for (let ty = y; ty < h; ty += 4) {
            const tidx = (ty * w + Math.floor(segmentStartX + segW / 2)) * 4;
            if (data[tidx] < 140) {
              segH = ty - y;
              break;
            }
          }

          if (segH > 15 && segH < h * 0.5) {
            const aspect = segW / segH;
            const ratioDiff = Math.abs(aspect - targetRatio);
            
            if (ratioDiff < 0.25) {
              const score = 1.0 - ratioDiff;
              if (score > bestScore) {
                bestScore = score;
                bestCandidate = {
                  bbox: [segmentStartX, y, segW, segH],
                  aspect
                };
              }
            }
          }
        }
        segmentStartX = -1;
      }
    }
  }

  if (bestCandidate) {
    const [bx, by, bw, bh] = bestCandidate.bbox;
    // Calculate pixels per cm based on the longest dimension
    const pxLen = bw > bh ? bw : bh;
    const scale = pxLen / sizeCm;

    // Simulate simple perspective rotation
    const rotation = (bestCandidate.aspect - targetRatio) * 45.0;

    return {
      found: true,
      scalePxPerCm: parseFloat(scale.toFixed(3)),
      rotationDeg: parseFloat(rotation.toFixed(1)),
      bbox: [bx, by, bw, bh]
    };
  }

  // Support stub for QR / ArUco markers
  return {
    found: false,
    scalePxPerCm: 0.0,
    rotationDeg: 0.0,
    bbox: [0, 0, 0, 0]
  };
}
