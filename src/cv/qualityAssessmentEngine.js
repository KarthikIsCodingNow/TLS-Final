/**
 * PORTA-TLS Automatic Scan Quality Assessment & Multi-Tree Filter Engine
 * Version 2.2 Architectural Baseline - Task 8 Extension
 */

/**
 * Validate overall automatic tree measurement quality (Requirement 15)
 * @param {object} trunkBoundaries Extracted trunk boundaries
 * @param {object} baseResult Base detection result
 * @param {object} canopyResult Canopy detection result
 * @param {object} motionResult Inter-frame motion result
 * @param {object} lightingResult Lighting quality result
 * @param {number} frameWidth Canvas width
 */
export function performAutomaticQualityCheck(
  trunkBoundaries,
  baseResult,
  canopyResult,
  motionResult,
  lightingResult,
  frameWidth
) {
  const issues = [];
  let isPassed = true;

  if (motionResult && motionResult.isExcessiveMotion) {
    issues.push('Camera unstable - Excessive shaking');
    isPassed = false;
  }

  if (lightingResult && (lightingResult.classification === 'Very Poor' || lightingResult.classification === 'Low Light')) {
    issues.push('Insufficient lighting quality');
    isPassed = false;
  }

  if (!trunkBoundaries || !trunkBoundaries.success) {
    issues.push('Trunk boundaries unresolved');
    isPassed = false;
  } else {
    const widthRatio = (trunkBoundaries.avgWidthPx || 0) / (frameWidth || 640);
    if (widthRatio > 0.75) {
      issues.push('Tree too close - Fill ratio > 75%');
      isPassed = false;
    } else if (widthRatio < 0.02) {
      issues.push('Tree too far - Move closer');
      isPassed = false;
    }
  }

  if (baseResult && baseResult.isUncertain) {
    issues.push('Base location uncertain');
  }

  return {
    isPassed,
    primaryWarning: issues.length > 0 ? issues[0] : null,
    allIssues: issues
  };
}
