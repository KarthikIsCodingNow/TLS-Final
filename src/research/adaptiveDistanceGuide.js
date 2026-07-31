/**
 * PORTA-TLS Adaptive Standoff Distance Guide Engine
 * Version 2.3 Architectural Baseline - Task 9 Extension
 */

/**
 * Calculate optimal camera standoff distance and issue user guidance (Requirement 11)
 * @param {number} currentDist Measured distance (m)
 * @param {number} estimatedHeight Measured height (m)
 * @param {number} vfovDeg Vertical field of view (deg)
 */
export function evaluateStandoffDistance(currentDist = 5.0, estimatedHeight = 12.0, vfovDeg = 45.0) {
  const vfovRad = (vfovDeg * Math.PI) / 180.0;
  
  // Ideal distance keeps tree taking up ~70% of vertical field of view
  const optimalDist = estimatedHeight / (2.0 * Math.tan(vfovRad / 2.0) * 0.70);

  let status = 'Optimal';
  let badgeColor = '#00ffcc';
  let userInstruction = 'Optimal Standoff Distance';

  if (currentDist < optimalDist * 0.65) {
    status = 'Too Close';
    badgeColor = '#ffaa00';
    userInstruction = 'Too Close - Step Back';
  } else if (currentDist > optimalDist * 1.40) {
    status = 'Too Far';
    badgeColor = '#ff9900';
    userInstruction = 'Too Far - Move Forward';
  }

  return {
    status,
    userInstruction,
    badgeColor,
    optimalDistM: parseFloat(optimalDist.toFixed(1)),
    currentDistM: parseFloat(currentDist.toFixed(1))
  };
}
