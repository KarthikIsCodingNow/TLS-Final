/**
 * speciesProfiler.js - Expandable Species Database & Profiler for AFIE
 * 
 * Stores comprehensive biological, morphological, and allometric profiles
 * for forest tree species worldwide.
 */

export const SPECIES_DATABASE = {
  'oak': {
    id: 'oak',
    scientificName: 'Quercus robur',
    commonName: 'English Oak / European Oak',
    woodDensity: 0.68, // g/cm^3
    annualHeightGrowthRate: 0.35, // m/yr
    annualDbhGrowthRate: 0.60, // cm/yr
    crownShape: 'Broad Round',
    typicalDbhRange: [25, 120], // cm
    typicalHeightRange: [12, 35], // m
    carbonFactor: 0.50,
    region: 'Temperate Europe & North America',
    expectedBarkTexture: 'Deeply fissured, thick grey-brown',
    expectedCanopyShape: 'Spreading dome',
    nativeClimate: 'Temperate',
    expectedBiomassEquation: 'Chave 2014',
    confidenceThreshold: 0.85
  },
  'pine': {
    id: 'pine',
    scientificName: 'Pinus sylvestris',
    commonName: 'Scots Pine',
    woodDensity: 0.51,
    annualHeightGrowthRate: 0.45,
    annualDbhGrowthRate: 0.70,
    crownShape: 'Conical / Pyramidal',
    typicalDbhRange: [20, 80],
    typicalHeightRange: [15, 35],
    carbonFactor: 0.51,
    region: 'Global Boreal & Temperate',
    expectedBarkTexture: 'Fissured orange-red upper trunk',
    expectedCanopyShape: 'Conical top',
    nativeClimate: 'Temperate / Boreal',
    expectedBiomassEquation: 'Jenkins 2003',
    confidenceThreshold: 0.88
  },
  'teak': {
    id: 'teak',
    scientificName: 'Tectona grandis',
    commonName: 'Teak',
    woodDensity: 0.65,
    annualHeightGrowthRate: 0.80,
    annualDbhGrowthRate: 1.20,
    crownShape: 'Open Umbellate',
    typicalDbhRange: [30, 100],
    typicalHeightRange: [15, 40],
    carbonFactor: 0.49,
    region: 'Tropical Asia & South America',
    expectedBarkTexture: 'Fibrous grey-brown strips',
    expectedCanopyShape: 'Broad open crown',
    nativeClimate: 'Tropical Moist',
    expectedBiomassEquation: 'Chave 2014',
    confidenceThreshold: 0.90
  },
  'eucalyptus': {
    id: 'eucalyptus',
    scientificName: 'Eucalyptus globulus',
    commonName: 'Tasmanian Blue Gum',
    woodDensity: 0.72,
    annualHeightGrowthRate: 1.20,
    annualDbhGrowthRate: 1.50,
    crownShape: 'Narrow Columnar',
    typicalDbhRange: [20, 110],
    typicalHeightRange: [20, 55],
    carbonFactor: 0.48,
    region: 'Australasia & Subtropical Plantations',
    expectedBarkTexture: 'Smooth peeling ribbon bark',
    expectedCanopyShape: 'High thin canopy',
    nativeClimate: 'Subtropical / Mediterranean',
    expectedBiomassEquation: 'Chave 2014',
    confidenceThreshold: 0.87
  },
  'neem': {
    id: 'neem',
    scientificName: 'Azadirachta indica',
    commonName: 'Neem Tree',
    woodDensity: 0.69,
    annualHeightGrowthRate: 0.60,
    annualDbhGrowthRate: 0.90,
    crownShape: 'Dense Spreading Spherical',
    typicalDbhRange: [20, 90],
    typicalHeightRange: [10, 25],
    carbonFactor: 0.47,
    region: 'South Asia & Tropical Africa',
    expectedBarkTexture: 'Dark grey fissured',
    expectedCanopyShape: 'Dense round evergreen crown',
    nativeClimate: 'Tropical Dry / Subtropical',
    expectedBiomassEquation: 'Chave 2014',
    confidenceThreshold: 0.86
  },
  'douglas_fir': {
    id: 'douglas_fir',
    scientificName: 'Pseudotsuga menziesii',
    commonName: 'Douglas Fir',
    woodDensity: 0.48,
    annualHeightGrowthRate: 0.75,
    annualDbhGrowthRate: 0.95,
    crownShape: 'Strict Pyramidal',
    typicalDbhRange: [30, 150],
    typicalHeightRange: [25, 75],
    carbonFactor: 0.51,
    region: 'Pacific Northwest America',
    expectedBarkTexture: 'Thick corky reddish-brown',
    expectedCanopyShape: 'Symmetrical cone',
    nativeClimate: 'Temperate Maritime',
    expectedBiomassEquation: 'Jenkins 2003',
    confidenceThreshold: 0.92
  },
  'generic_hardwood': {
    id: 'generic_hardwood',
    scientificName: 'Angiospermae spp.',
    commonName: 'Mixed Broadleaf Hardwood',
    woodDensity: 0.60,
    annualHeightGrowthRate: 0.40,
    annualDbhGrowthRate: 0.65,
    crownShape: 'Irregular Spreading',
    typicalDbhRange: [15, 100],
    typicalHeightRange: [10, 30],
    carbonFactor: 0.50,
    region: 'Global Temperate & Subtropical',
    expectedBarkTexture: 'Standard furrowed grey',
    expectedCanopyShape: 'Irregular broad crown',
    nativeClimate: 'Mixed Temperate',
    expectedBiomassEquation: 'Chave 2014',
    confidenceThreshold: 0.80
  },
  'generic_softwood': {
    id: 'generic_softwood',
    scientificName: 'Coniferophyta spp.',
    commonName: 'Mixed Conifer Softwood',
    woodDensity: 0.45,
    annualHeightGrowthRate: 0.55,
    annualDbhGrowthRate: 0.75,
    crownShape: 'Conical',
    typicalDbhRange: [15, 80],
    typicalHeightRange: [12, 35],
    carbonFactor: 0.51,
    region: 'Global Boreal & Alpine',
    expectedBarkTexture: 'Scaly brownish grey',
    expectedCanopyShape: 'Conical',
    nativeClimate: 'Boreal / Temperate',
    expectedBiomassEquation: 'Jenkins 2003',
    confidenceThreshold: 0.82
  }
};

export class SpeciesProfiler {
  /**
   * Lookup species profile by ID or common/scientific name
   * @param {string} searchKey 
   * @returns {Object} Species profile object
   */
  getProfile(searchKey = 'generic_hardwood') {
    if (!searchKey) return SPECIES_DATABASE['generic_hardwood'];

    const key = searchKey.toLowerCase().trim().replace(/[\s-]+/g, '_');
    if (SPECIES_DATABASE[key]) return SPECIES_DATABASE[key];

    // Search by common or scientific name substring
    const matched = Object.values(SPECIES_DATABASE).find(sp => 
      sp.commonName.toLowerCase().includes(key) ||
      sp.scientificName.toLowerCase().includes(key)
    );

    return matched || SPECIES_DATABASE['generic_hardwood'];
  }

  /**
   * Get all registered species profiles
   */
  getAllSpecies() {
    return Object.values(SPECIES_DATABASE);
  }

  /**
   * Expand species database dynamically
   * @param {string} id 
   * @param {Object} profile 
   */
  registerSpecies(id, profile) {
    if (id && profile) {
      SPECIES_DATABASE[id] = { ...profile, id };
    }
  }
}
