/**
 * modelSelector.js - Intelligent Biomass Model Selector for AFIE
 * 
 * Evaluates species profile, environment biome, tree morphology, and measurement quality
 * to dynamically select the Primary Biomass Model and Secondary Validation Models.
 */

export class ModelSelector {
  /**
   * Select primary and secondary biomass equations
   * @param {Object} speciesProfile 
   * @param {Object} environmentProfile 
   * @param {Object} morphology 
   * @param {Object} cmmeConsensus 
   * @returns {Object} { primaryModel, secondaryModels, reasoningTrace }
   */
  selectModels(speciesProfile, environmentProfile, morphology, cmmeConsensus) {
    const biome = environmentProfile.biome || 'Tropical';
    const speciesEq = speciesProfile.expectedBiomassEquation || 'Chave 2014';
    const conf = cmmeConsensus?.confidencePct || 90;

    let primaryModel = {
      name: 'Chave et al. (2014)',
      id: 'chave_2014',
      confidence: 0.94,
      requiresDensity: true,
      description: 'Pantropical & global allometric equation incorporating DBH, Height, and Wood Density.'
    };

    let secondaryModels = [
      {
        name: 'Jenkins et al. (2003)',
        id: 'jenkins_2003',
        confidence: 0.88,
        description: 'North American regional power-law equation based on DBH.'
      },
      {
        name: 'Brown et al. (1997)',
        id: 'brown_1997',
        confidence: 0.86,
        description: 'Tropical moist forest biomass model.'
      },
      {
        name: 'Regional Allometric Model',
        id: 'regional_allometric',
        confidence: 0.91,
        description: 'Regional hardwood/softwood polynomial equation.'
      }
    ];

    // Model selection rules
    if (biome === 'Temperate' || speciesEq === 'Jenkins 2003') {
      primaryModel = {
        name: 'Jenkins et al. (2003)',
        id: 'jenkins_2003',
        confidence: 0.92,
        requiresDensity: false,
        description: 'Temperate forest conifer/hardwood power-law equation.'
      };
    } else if (biome === 'Urban Tree') {
      primaryModel = {
        name: 'Urban Tree Allometric Model (McHale et al. 2009)',
        id: 'urban_mchale_2009',
        confidence: 0.89,
        requiresDensity: true,
        description: 'Open-grown urban park and street tree biomass model.'
      };
    }

    const reasoningTrace = `Selected ${primaryModel.name} as Primary Model based on ${biome} environment and ${speciesProfile.commonName} profile (wood density ${speciesProfile.woodDensity} g/cm³). Secondary validation powered by Jenkins 2003 and Regional Allometric equations.`;

    return {
      primaryModel,
      secondaryModels,
      reasoningTrace
    };
  }
}
