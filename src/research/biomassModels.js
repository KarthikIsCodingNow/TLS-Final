/**
 * PORTA-TLS Published Allometric Biomass Models Library
 * Version 2.3 Architectural Baseline - Task 9 Extension
 */

export const BIOMASS_MODELS = {
  'chave2014': {
    id: 'chave2014',
    name: 'Chave et al. (2014) Pantropical Model',
    citation: 'Chave et al. (2014) Global Change Biology',
    calculate: (dbhCm, heightM, woodDensity) => {
      // AGB = 0.0673 * (rho * DBH^2 * H)^0.976
      const agb = 0.0673 * Math.pow((woodDensity * Math.pow(dbhCm, 2) * heightM), 0.976);
      return parseFloat(agb.toFixed(2));
    }
  },
  'jenkins2003': {
    id: 'jenkins2003',
    name: 'Jenkins et al. (2003) North American Hardwood/Softwood',
    citation: 'Jenkins et al. (2003) Forest Science',
    calculate: (dbhCm) => {
      // AGB = exp(beta0 + beta1 * ln(DBH))
      const beta0 = -2.4800;
      const beta1 = 2.4835;
      const agb = Math.exp(beta0 + beta1 * Math.log(dbhCm));
      return parseFloat(agb.toFixed(2));
    }
  },
  'brown1997': {
    id: 'brown1997',
    name: 'Brown et al. (1997) Tropical Moist Forest Model',
    citation: 'Brown (1997) FAO Forestry Paper 134',
    calculate: (dbhCm) => {
      // AGB = 42.69 - 12.80 * DBH + 1.242 * DBH^2
      const agb = 42.69 - (12.80 * dbhCm) + (1.242 * Math.pow(dbhCm, 2));
      return parseFloat(Math.max(1.0, agb).toFixed(2));
    }
  }
};

/**
 * Select best allometric biomass model based on species & region
 */
export function selectBiomassModel(modelId = 'chave2014') {
  return BIOMASS_MODELS[modelId] || BIOMASS_MODELS['chave2014'];
}
