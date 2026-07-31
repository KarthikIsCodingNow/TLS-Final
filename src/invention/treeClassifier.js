/**
 * PORTA-TLS Tree Structural Quality Classifier
 * Version 1.0.0 (Patent Pending)
 * Computational Complexity: O(1) decision flow logic
 */

export const CLASSIFIER_ALGO_INFO = {
  version: '1.0.0',
  description: 'Trunk Straightness & Canopy Health Structural Classifier',
  assumptions: [
    'Quadratic polynomial fitting represents the curve deviation baseline of the trunk.',
    'Green chromaticity index (G_index) indicates live photosynthetic foliage canopy.'
  ],
  failureCases: [
    'Climbing vines wrapping the trunk misidentified as curved/deformed structures.',
    'Winter seasonal leaf loss flagged as dead/sparse forest canopy.'
  ]
};

/**
 * Classifies the structural shape of a tree based on CV contours, fits, and angles
 * @returns {object} { trunkType, canopyType, description }
 */
export function classifyTreeStructure(cvResult, leanAngleDeg) {
  let trunkType = 'Straight';
  let canopyType = 'Healthy';
  let desc = 'Nominal upright conifer/deciduous profile.';

  const absoluteLean = Math.abs(leanAngleDeg || 0.0);

  // 1. Evaluate Lean Angle
  if (absoluteLean > 12.0) {
    trunkType = 'Leaning Trunk';
    desc = `Severe tilt deviation of ${absoluteLean.toFixed(1)}° from vertical reference axis.`;
  }

  // 2. Evaluate Curvature
  if (cvResult && cvResult.success) {
    const curvature = Math.abs(cvResult.centerline?.curvature || 0.0);
    if (curvature > 0.008) {
      trunkType = 'Irregular / Curved Trunk';
      desc = 'Significant spine sweep deviation. Non-standard volume extrapolation required.';
    }

    // 3. Evaluate Forking
    if (cvResult.treeCues?.forkDetected) {
      trunkType = 'Forked Trunk';
      desc = 'Bifurcation identified within the middle third of the vertical segment.';
    }

    // 4. Canopy Health evaluation
    const greenIndex = cvResult.autoTop?.greenIndex || 0.5;
    if (greenIndex < 0.12) {
      canopyType = 'Dead / Decayed Tree';
      desc += ' Minimal green chlorophyll index detected in upper canopy.';
    } else if (greenIndex < 0.28) {
      canopyType = 'Sparse Canopy';
      desc += ' Reduced canopy density or partial occlusion.';
    }
  }

  return {
    trunkType,
    canopyType,
    description: desc
  };
}
