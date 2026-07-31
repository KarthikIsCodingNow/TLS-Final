/**
 * PORTA-TLS Automatic Tree Trunk Extractor
 * Version 2.2 Architectural Baseline - Task 8 Extension
 */

/**
 * Extract vertical parallel trunk boundaries, centerline, and average width
 * @param {Uint8Array} edgeMap Binary edge map (255 for edge, 0 for background)
 * @param {number} w Frame width
 * @param {number} h Frame height
 * @param {object} bounds Searching region bounds { leftPct, rightPct, topPct, basePct }
 */
export function extractTrunkBoundaries(edgeMap, w, h, bounds) {
  const minX = Math.floor((bounds.leftPct / 100) * w);
  const maxX = Math.ceil((bounds.rightPct / 100) * w);
  const minY = Math.floor((bounds.topPct / 100) * h);
  const maxY = Math.ceil((bounds.basePct / 100) * h);

  const leftContour = [];
  const rightContour = [];
  const centerLine = [];
  const widths = [];

  let validRowCount = 0;

  for (let y = minY; y <= maxY; y += 2) {
    let firstEdge = -1;
    let lastEdge = -1;

    for (let x = minX; x <= maxX; x++) {
      if (edgeMap[y * w + x] === 255) {
        if (firstEdge === -1) firstEdge = x;
        lastEdge = x;
      }
    }

    if (firstEdge !== -1 && lastEdge !== -1 && (lastEdge - firstEdge) >= 8) {
      leftContour.push({ x: firstEdge, y });
      rightContour.push({ x: lastEdge, y });
      
      const cx = (firstEdge + lastEdge) / 2;
      centerLine.push({ x: cx, y });

      widths.push(lastEdge - firstEdge);
      validRowCount++;
    }
  }

  if (widths.length === 0) {
    return {
      success: false,
      leftContour: [],
      rightContour: [],
      centerLine: [],
      avgWidthPx: 0,
      confidence: 0.0
    };
  }

  // Calculate average width and variance
  const avgWidthPx = widths.reduce((a, b) => a + b, 0) / widths.length;
  const widthVariance = widths.reduce((a, b) => a + Math.pow(b - avgWidthPx, 2), 0) / widths.length;
  const widthStdDev = Math.sqrt(widthVariance);

  // Evaluate parallel edge symmetry score and vertical continuity ratio
  const expectedRows = (maxY - minY) / 2;
  const continuityRatio = validRowCount / (expectedRows || 1);
  const widthConsistencyScore = Math.max(0, 1.0 - (widthStdDev / (avgWidthPx || 1)));

  const trunkConfidence = parseFloat((0.6 * continuityRatio + 0.4 * widthConsistencyScore).toFixed(2));

  return {
    success: trunkConfidence >= 0.35,
    leftContour,
    rightContour,
    centerLine,
    avgWidthPx: parseFloat(avgWidthPx.toFixed(1)),
    confidence: trunkConfidence
  };
}
