/**
 * PORTA-TLS Trunk Centerline Fitting Module
 * Version 2.0 Architectural Baseline
 */

/**
 * Solve a 3x3 linear system of equations using Cramer's Rule
 */
function solve3x3(A, B) {
  const det = A[0][0]*(A[1][1]*A[2][2] - A[1][2]*A[2][1]) -
              A[0][1]*(A[1][0]*A[2][2] - A[1][2]*A[2][0]) +
              A[0][2]*(A[1][0]*A[2][1] - A[1][1]*A[2][0]);

  if (Math.abs(det) < 1e-7) return [0, 0, 0];

  const det0 = B[0]*(A[1][1]*A[2][2] - A[1][2]*A[2][1]) -
               A[0][1]*(B[1]*A[2][2] - A[1][2]*B[2]) +
               A[0][2]*(B[1]*A[2][1] - A[1][1]*B[2]);

  const det1 = A[0][0]*(B[1]*A[2][2] - A[1][2]*B[2]) -
               B[0]*(A[1][0]*A[2][2] - A[1][2]*A[2][0]) +
               A[0][2]*(A[1][0]*B[2] - B[1]*A[2][0]);

  const det2 = A[0][0]*(A[1][1]*B[2] - B[1]*A[2][1]) -
               A[0][1]*(A[1][0]*B[2] - B[1]*A[2][0]) +
               B[0]*(A[1][0]*A[2][1] - A[1][1]*A[2][0]);

  return [det0 / det, det1 / det, det2 / det];
}

/**
 * Fit a centerline to the trunk contour
 * @param {object[]} contour {y, leftX, rightX}[]
 * @returns {object} { fitType, points: {x, y}[], leanAngle, curvature, verticalDeviation }
 */
export function fitTrunkCenterline(contour) {
  if (!contour || contour.length < 3) {
    return { fitType: 'linear', points: [], leanAngle: 0.0, curvature: 0.0, verticalDeviation: 0.0 };
  }

  const n = contour.length;
  const pts = contour.map(c => ({ y: c.y, x: (c.leftX + c.rightX) / 2.0 }));

  // 1. Calculate Linear Least Squares
  let sumY = 0, sumX = 0, sumY2 = 0, sumXY = 0;
  for (let i = 0; i < n; i++) {
    sumY += pts[i].y;
    sumX += pts[i].x;
    sumY2 += pts[i].y * pts[i].y;
    sumXY += pts[i].x * pts[i].y;
  }

  const denom = n * sumY2 - sumY * sumY;
  let m = 0;
  let c = sumX / n;

  if (Math.abs(denom) > 1e-5) {
    m = (n * sumXY - sumX * sumY) / denom;
    c = (sumX - m * sumY) / n;
  }

  // Trunk lean angle: angle with the vertical axis (y)
  // dx/dy = m. The angle in radians is arctan(m).
  const leanAngleDeg = Math.atan(m) * (180.0 / Math.PI);

  // 2. Calculate Quadratic Least Squares: x = a*y^2 + b*y + d
  let sumY3 = 0, sumY4 = 0, sumXY2 = 0;
  for (let i = 0; i < n; i++) {
    const y = pts[i].y;
    const x = pts[i].x;
    sumY3 += y * y * y;
    sumY4 += y * y * y * y;
    sumXY2 += x * y * y;
  }

  const M_A = [
    [sumY4, sumY3, sumY2],
    [sumY3, sumY2, sumY],
    [sumY2, sumY,  n]
  ];
  const M_B = [sumXY2, sumXY, sumX];

  const [qa, qb, qc] = solve3x3(M_A, M_B);

  // Curvature: second derivative of fit is 2a
  const curvature = 2.0 * qa;

  // 3. Compute Vertical Deviation (variance of center x coordinates)
  const avgX = sumX / n;
  let sqDevSum = 0;
  for (let i = 0; i < n; i++) {
    sqDevSum += Math.pow(pts[i].x - avgX, 2);
  }
  const vertDev = Math.sqrt(sqDevSum / n);

  // 4. Select best fit: if curvature is high, return quadratic points, else linear
  const isCurved = Math.abs(curvature) > 0.0005;
  const fitType = isCurved ? 'quadratic' : 'linear';

  const fittedPts = pts.map(pt => {
    const fittedX = isCurved 
      ? (qa * pt.y * pt.y + qb * pt.y + qc)
      : (m * pt.y + c);
    return { x: parseFloat(fittedX.toFixed(1)), y: pt.y };
  });

  return {
    fitType,
    points: fittedPts,
    leanAngle: parseFloat(leanAngleDeg.toFixed(1)),
    curvature: parseFloat(Math.abs(curvature * 1000).toFixed(4)), // scaled for readability
    verticalDeviation: parseFloat(vertDev.toFixed(2))
  };
}
