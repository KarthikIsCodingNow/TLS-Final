/**
 * knowledgeEngine.js - Rule-Based Knowledge Engine for AFIE
 * 
 * Executes IF-THEN expert rules across measurement, morphology, species,
 * and environmental telemetry to output intelligent inferences.
 */

export class KnowledgeEngine {
  /**
   * Evaluate expert rules
   * @param {Object} context - { speciesProfile, morphology, cmmeConsensus, envProfile }
   * @returns {Array<Object>} List of evaluated rule inference objects
   */
  evaluateRules(context) {
    const inferences = [];
    const { speciesProfile, morphology, cmmeConsensus, envProfile } = context;

    // Rule 1: Missing Species Handling
    if (!speciesProfile || speciesProfile.id === 'generic_hardwood') {
      inferences.push({
        ruleId: 'K-RULE-001',
        condition: 'Species Unspecified or Default',
        action: 'Estimated density (0.60 g/cm³) from generic regional hardwood profile.',
        importance: 'Medium'
      });
    }

    // Rule 2: Point Cloud Availability
    if (context.hasPointCloud) {
      inferences.push({
        ruleId: 'K-RULE-002',
        condition: 'LiDAR 3D Point Cloud Available',
        action: 'Increased biomass model confidence score by +5.0% due to explicit 3D canopy volume.',
        importance: 'High'
      });
    }

    // Rule 3: Slenderness Risk
    if (morphology && morphology.slendernessRatio > 80) {
      inferences.push({
        ruleId: 'K-RULE-003',
        condition: `Slenderness Ratio (${morphology.slendernessRatio}) > 80.0`,
        action: 'Flagged high windthrow susceptibility; recommended canopy stabilization audit.',
        importance: 'High'
      });
    }

    // Rule 4: Consensus Quality Gating
    if (cmmeConsensus && cmmeConsensus.confidencePct < 85.0) {
      inferences.push({
        ruleId: 'K-RULE-004',
        condition: `Consensus Confidence (${cmmeConsensus.confidencePct}%) < 85.0%`,
        action: 'Recommended manual calibration tape check or secondary reference marker scan.',
        importance: 'High'
      });
    }

    // Rule 5: Environment Biome Match
    if (envProfile && envProfile.biome === 'Urban Tree') {
      inferences.push({
        ruleId: 'K-RULE-005',
        condition: 'Environment Classified as Urban Park / Street',
        action: 'Applied McHale open-grown crown biomass adjustment factor.',
        importance: 'Medium'
      });
    }

    return inferences;
  }
}
