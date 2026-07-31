/**
 * PORTA-TLS Adaptive DBH Geometry Engine
 * Version 2.3 Architectural Baseline - Task 9 Extension
 */

/**
 * Calculate trunk DBH based on cross-section geometry model (Requirement 8)
 * @param {string} geometryType 'circular' | 'elliptical' | 'irregular' | 'multistem'
 * @param {number} d1 Major diameter / width 1 (cm)
 * @param {number} d2 Minor diameter / width 2 (cm)
 * @param {Array<number>} stemDiameters Diameters of individual stems for multi-stem trunks
 */
export function calculateAdaptiveDbh(geometryType = 'circular', d1 = 30.0, d2 = 30.0, stemDiameters = []) {
  let equivalentDbh = d1;
  let minDbh = Math.min(d1, d2);
  let maxDbh = Math.max(d1, d2);
  let avgDbh = (d1 + d2) / 2;

  switch (geometryType) {
    case 'elliptical':
      // Geometric mean equivalent area: D_eq = sqrt(d1 * d2)
      equivalentDbh = Math.sqrt(d1 * d2);
      break;

    case 'irregular':
      // Arithmetic mean diameter
      equivalentDbh = (d1 + d2) / 2;
      break;

    case 'multistem':
      // Sum of basal area equivalent diameter: D_eq = sqrt( sum(d_i^2) )
      if (stemDiameters && stemDiameters.length > 0) {
        const sumSq = stemDiameters.reduce((acc, val) => acc + Math.pow(val, 2), 0);
        equivalentDbh = Math.sqrt(sumSq);
        minDbh = Math.min(...stemDiameters);
        maxDbh = Math.max(...stemDiameters);
        avgDbh = stemDiameters.reduce((a, b) => a + b, 0) / stemDiameters.length;
      } else {
        equivalentDbh = Math.sqrt(Math.pow(d1, 2) + Math.pow(d2, 2));
      }
      break;

    case 'circular':
    default:
      equivalentDbh = d1;
      break;
  }

  return {
    geometryType,
    equivalentDbh: parseFloat(equivalentDbh.toFixed(1)),
    minDbh: parseFloat(minDbh.toFixed(1)),
    maxDbh: parseFloat(maxDbh.toFixed(1)),
    avgDbh: parseFloat(avgDbh.toFixed(1))
  };
}
