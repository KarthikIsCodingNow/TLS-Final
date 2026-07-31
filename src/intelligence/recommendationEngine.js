/**
 * recommendationEngine.js - Intelligent Field Recommendation Engine for AFIE
 * 
 * Generates context-aware, actionable advice for field foresters.
 */

export class RecommendationEngine {
  /**
   * Generate actionable recommendation array
   * @param {Object} context 
   * @returns {Array<Object>} List of recommendation items
   */
  generateRecommendations(context) {
    const recommendations = [];
    const { cepeReport, cmmeConsensus, morphology, envContext } = context;

    const conf = cmmeConsensus?.confidencePct || cepeReport?.confidencePct || 85;

    if (conf < 90) {
      recommendations.push({
        id: 'REC-001',
        title: 'Use Reference Marker',
        text: 'Attach a known 10cm reference marker to trunk base to lock optical scale.',
        priority: 'High',
        actionType: 'CALIBRATION'
      });

      recommendations.push({
        id: 'REC-002',
        title: 'Move 2 Meters Closer',
        text: 'Standoff distance is optimal at 6-10m. Move closer to improve trunk edge contrast.',
        priority: 'High',
        actionType: 'POSITION'
      });
    }

    if (cmmeConsensus?.summary?.rejected > 2) {
      recommendations.push({
        id: 'REC-003',
        title: 'Capture Additional Multi-Frame Cycles',
        text: 'High pitch motion detected. Re-trigger a 20-frame consensus scan while holding steady.',
        priority: 'Medium',
        actionType: 'SCAN'
      });
    }

    if (envContext?.lightingQuality && envContext.lightingQuality < 0.70) {
      recommendations.push({
        id: 'REC-004',
        title: 'Improve Camera Lighting',
        text: 'Ambient light is low. Enable flash torch overlay or reposition relative to direct sun.',
        priority: 'Medium',
        actionType: 'LIGHTING'
      });
    }

    if (!context.hasPointCloud) {
      recommendations.push({
        id: 'REC-005',
        title: 'Capture LiDAR Point Cloud',
        text: 'Enable simulated ToF LiDAR point cloud to measure 3D canopy volume directly.',
        priority: 'Low',
        actionType: 'FEATURE'
      });
    }

    return recommendations;
  }
}
