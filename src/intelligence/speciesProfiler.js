/**
 * speciesProfiler.js - Expandable Species Database & Profiler for AFIE
 * Localized for Andhra Pradesh (AP), India Forestry & Allometric Ecosystems
 * 
 * Stores comprehensive biological, morphological, and allometric profiles
 * for forest tree species of Andhra Pradesh, India.
 */

export const SPECIES_DATABASE = {
  'neem': {
    id: 'neem',
    scientificName: 'Azadirachta indica',
    commonName: 'Neem (Vepa)',
    teluguName: 'Vepa (వేప)',
    woodDensity: 0.74, // g/cm^3
    annualHeightGrowthRate: 0.65, // m/yr
    annualDbhGrowthRate: 0.95, // cm/yr
    crownShape: 'Dense Spreading Spherical',
    typicalDbhRange: [25, 80], // cm
    typicalHeightRange: [10, 22], // m
    carbonFactor: 0.48,
    region: 'Andhra Pradesh (Widespread)',
    expectedBarkTexture: 'Dark grey-brown deeply fissured longitudinal',
    expectedCanopyShape: 'Dense round evergreen crown',
    nativeClimate: 'Tropical Dry / Semi-Arid',
    expectedBiomassEquation: 'Chave 2014',
    confidenceThreshold: 0.88
  },
  'banyan': {
    id: 'banyan',
    scientificName: 'Ficus benghalensis',
    commonName: 'Banyan (Marri)',
    teluguName: 'Marri (మర్రి)',
    woodDensity: 0.56,
    annualHeightGrowthRate: 0.40,
    annualDbhGrowthRate: 1.50,
    crownShape: 'Massive Spreading Umbrella with Prop Roots',
    typicalDbhRange: [60, 250],
    typicalHeightRange: [15, 30],
    carbonFactor: 0.47,
    region: 'Rayalaseema & Coastal Andhra',
    expectedBarkTexture: 'Smooth to shallowly fissured light grey',
    expectedCanopyShape: 'Immense wide umbrella',
    nativeClimate: 'Tropical Dry & Moist Deciduous',
    expectedBiomassEquation: 'Chave 2014',
    confidenceThreshold: 0.90
  },
  'peepal': {
    id: 'peepal',
    scientificName: 'Ficus religiosa',
    commonName: 'Sacred Fig / Peepal (Raavi)',
    teluguName: 'Raavi (రావి)',
    woodDensity: 0.52,
    annualHeightGrowthRate: 0.55,
    annualDbhGrowthRate: 1.30,
    crownShape: 'Spreading Heart-Leaf Dome',
    typicalDbhRange: [40, 160],
    typicalHeightRange: [15, 32],
    carbonFactor: 0.47,
    region: 'All AP Riverine & Village Zones',
    expectedBarkTexture: 'Smooth grey with peeling irregular scales',
    expectedCanopyShape: 'Wide spreading high canopy',
    nativeClimate: 'Tropical Deciduous',
    expectedBiomassEquation: 'Chave 2014',
    confidenceThreshold: 0.88
  },
  'mango': {
    id: 'mango',
    scientificName: 'Mangifera indica',
    commonName: 'Mango (Mamidi)',
    teluguName: 'Mamidi (మామిడి)',
    woodDensity: 0.65,
    annualHeightGrowthRate: 0.50,
    annualDbhGrowthRate: 0.90,
    crownShape: 'Dense Rounded Dome',
    typicalDbhRange: [30, 95],
    typicalHeightRange: [10, 24],
    carbonFactor: 0.49,
    region: 'Krishna, Chittoor & Godavari Belts',
    expectedBarkTexture: 'Thick dark grey/blackish with longitudinal fissures',
    expectedCanopyShape: 'Dense rounded evergreen dome',
    nativeClimate: 'Tropical Moist & Dry Agroforestry',
    expectedBiomassEquation: 'Chave 2014',
    confidenceThreshold: 0.89
  },
  'tamarind': {
    id: 'tamarind',
    scientificName: 'Tamarindus indica',
    commonName: 'Tamarind (Chinta)',
    teluguName: 'Chinta (చింత)',
    woodDensity: 0.90,
    annualHeightGrowthRate: 0.35,
    annualDbhGrowthRate: 0.55,
    crownShape: 'Spreading Dense Feathery Dome',
    typicalDbhRange: [35, 120],
    typicalHeightRange: [12, 28],
    carbonFactor: 0.50,
    region: 'Rayalaseema & Coastal Plains',
    expectedBarkTexture: 'Dark grey-brown rough fissured fibrous',
    expectedCanopyShape: 'Spreading feathery dome',
    nativeClimate: 'Semi-Arid Tropical',
    expectedBiomassEquation: 'Chave 2014',
    confidenceThreshold: 0.91
  },
  'amla': {
    id: 'amla',
    scientificName: 'Phyllanthus emblica',
    commonName: 'Indian Gooseberry / Amla (Usiri)',
    teluguName: 'Usiri (ఉసిరి)',
    woodDensity: 0.72,
    annualHeightGrowthRate: 0.45,
    annualDbhGrowthRate: 0.60,
    crownShape: 'Open Light Feathery',
    typicalDbhRange: [18, 50],
    typicalHeightRange: [8, 18],
    carbonFactor: 0.48,
    region: 'Nallamala & Eastern Ghats',
    expectedBarkTexture: 'Thin light grey flaking in irregular patches',
    expectedCanopyShape: 'Open feathery light canopy',
    nativeClimate: 'Tropical Dry Deciduous',
    expectedBiomassEquation: 'Chave 2014',
    confidenceThreshold: 0.86
  },
  'pongamia': {
    id: 'pongamia',
    scientificName: 'Pongamia pinnata',
    commonName: 'Pongamia / Indian Beech (Kanuga)',
    teluguName: 'Kanuga (కానుగ)',
    woodDensity: 0.68,
    annualHeightGrowthRate: 0.70,
    annualDbhGrowthRate: 1.00,
    crownShape: 'Dense Spreading Umbrella',
    typicalDbhRange: [25, 70],
    typicalHeightRange: [10, 22],
    carbonFactor: 0.48,
    region: 'Krishna & Godavari Deltas',
    expectedBarkTexture: 'Soft grey-brown smooth to shallowly cracked',
    expectedCanopyShape: 'Dense umbrella nitrogen-fixing crown',
    nativeClimate: 'Riparian & Coastal Subtropical',
    expectedBiomassEquation: 'Chave 2014',
    confidenceThreshold: 0.87
  },
  'jamun': {
    id: 'jamun',
    scientificName: 'Syzygium cumini',
    commonName: 'Jamun / Black Plum (Neredu)',
    teluguName: 'Neredu (నేరేడు)',
    woodDensity: 0.78,
    annualHeightGrowthRate: 0.60,
    annualDbhGrowthRate: 0.85,
    crownShape: 'Dense Oblong Crown',
    typicalDbhRange: [30, 110],
    typicalHeightRange: [14, 30],
    carbonFactor: 0.49,
    region: 'Godavari Valley & Papikonda',
    expectedBarkTexture: 'Rough dark grey with peeling rectangular plates',
    expectedCanopyShape: 'Dense oblong evergreen crown',
    nativeClimate: 'Tropical Moist Riparian',
    expectedBiomassEquation: 'Chave 2014',
    confidenceThreshold: 0.89
  },
  'arjun': {
    id: 'arjun',
    scientificName: 'Terminalia arjuna',
    commonName: 'Arjun Tree (Tella Maddhi)',
    teluguName: 'Tella Maddhi (తెల్ల మద్ది)',
    woodDensity: 0.84,
    annualHeightGrowthRate: 0.55,
    annualDbhGrowthRate: 0.95,
    crownShape: 'Large Spreading with Drooping Branches',
    typicalDbhRange: [40, 150],
    typicalHeightRange: [18, 35],
    carbonFactor: 0.50,
    region: 'Krishna & Penna Riverbanks',
    expectedBarkTexture: 'Smooth pinkish-grey flaking in large flat plates',
    expectedCanopyShape: 'High spreading buttressed crown',
    nativeClimate: 'Riparian Freshwater Moist',
    expectedBiomassEquation: 'Chave 2014',
    confidenceThreshold: 0.90
  },
  'red_sanders': {
    id: 'red_sanders',
    scientificName: 'Pterocarpus santalinus',
    commonName: 'Red Sanders (Rakta Chandanam)',
    teluguName: 'Rakta Chandanam (రక్త చందనం)',
    woodDensity: 1.05,
    annualHeightGrowthRate: 0.25,
    annualDbhGrowthRate: 0.40,
    crownShape: 'Compact Rounded Crown',
    typicalDbhRange: [20, 65],
    typicalHeightRange: [8, 18],
    carbonFactor: 0.52,
    region: 'Seshachalam Hills (Endemic to AP)',
    expectedBarkTexture: 'Blackish-brown with deep square fissures (crocodile bark)',
    expectedCanopyShape: 'Compact rounded hill crown',
    nativeClimate: 'Dry Deciduous Rocky Hills',
    expectedBiomassEquation: 'Chave 2014',
    confidenceThreshold: 0.94
  },
  'jackfruit': {
    id: 'jackfruit',
    scientificName: 'Artocarpus heterophyllus',
    commonName: 'Jackfruit (Panasa)',
    teluguName: 'Panasa (పనస)',
    woodDensity: 0.62,
    annualHeightGrowthRate: 0.50,
    annualDbhGrowthRate: 0.80,
    crownShape: 'Dense Evergreen Dome',
    typicalDbhRange: [25, 85],
    typicalHeightRange: [10, 24],
    carbonFactor: 0.48,
    region: 'Araku Valley & Agency Tracts',
    expectedBarkTexture: 'Dark reddish-brown rough bark',
    expectedCanopyShape: 'Dense rounded shiny-leaf dome',
    nativeClimate: 'Tropical Moist High Altitude',
    expectedBiomassEquation: 'Chave 2014',
    confidenceThreshold: 0.87
  },
  'custard_apple': {
    id: 'custard_apple',
    scientificName: 'Annona squamosa',
    commonName: 'Custard Apple (Sitaphal)',
    teluguName: 'Sitaphal (సీతాఫలం)',
    woodDensity: 0.58,
    annualHeightGrowthRate: 0.50,
    annualDbhGrowthRate: 0.65,
    crownShape: 'Open Irregular Shrubby Crown',
    typicalDbhRange: [12, 30],
    typicalHeightRange: [4, 8],
    carbonFactor: 0.46,
    region: 'Rayalaseema & Deccan Foothills',
    expectedBarkTexture: 'Thin brownish-grey with longitudinal fissures',
    expectedCanopyShape: 'Low branching irregular scrub crown',
    nativeClimate: 'Semi-Arid Scrub',
    expectedBiomassEquation: 'Chave 2014',
    confidenceThreshold: 0.85
  },
  'teak': {
    id: 'teak',
    scientificName: 'Tectona grandis',
    commonName: 'Teak (Teku)',
    teluguName: 'Teku (టేకు)',
    woodDensity: 0.66,
    annualHeightGrowthRate: 0.80,
    annualDbhGrowthRate: 1.20,
    crownShape: 'Open Umbellate',
    typicalDbhRange: [30, 95],
    typicalHeightRange: [15, 38],
    carbonFactor: 0.49,
    region: 'Papikonda & Nallamala Forests',
    expectedBarkTexture: 'Fibrous grey-brown longitudinal strips',
    expectedCanopyShape: 'Broad open canopy',
    nativeClimate: 'Tropical Moist & Dry Deciduous',
    expectedBiomassEquation: 'Chave 2014',
    confidenceThreshold: 0.90
  },
  'casuarina': {
    id: 'casuarina',
    scientificName: 'Casuarina equisetifolia',
    commonName: 'Casuarina (Sarugudu)',
    teluguName: 'Sarugudu (సరుగుడు)',
    woodDensity: 0.82,
    annualHeightGrowthRate: 1.40,
    annualDbhGrowthRate: 1.10,
    crownShape: 'Narrow Pyramidal / Conical',
    typicalDbhRange: [18, 55],
    typicalHeightRange: [15, 35],
    carbonFactor: 0.50,
    region: 'Coastal Andhra Shelterbelt (Bapatla-Chirala)',
    expectedBarkTexture: 'Rough peeling dark brown strips',
    expectedCanopyShape: 'Feathery needle-like branchlets',
    nativeClimate: 'Coastal Littoral & Dune',
    expectedBiomassEquation: 'Chave 2014',
    confidenceThreshold: 0.89
  },
  'sandalwood': {
    id: 'sandalwood',
    scientificName: 'Santalum album',
    commonName: 'Indian Sandalwood (Chandanam)',
    teluguName: 'Chandanam (చందనం)',
    woodDensity: 0.92,
    annualHeightGrowthRate: 0.30,
    annualDbhGrowthRate: 0.45,
    crownShape: 'Drooping Slender Canopy',
    typicalDbhRange: [15, 45],
    typicalHeightRange: [6, 15],
    carbonFactor: 0.50,
    region: 'Chittoor & Annamayya Reserves',
    expectedBarkTexture: 'Dark grey to reddish-black rough cracked',
    expectedCanopyShape: 'Slender drooping branches',
    nativeClimate: 'Tropical Dry Deciduous / Hemiparasitic',
    expectedBiomassEquation: 'Chave 2014',
    confidenceThreshold: 0.91
  },
  'mahua': {
    id: 'mahua',
    scientificName: 'Madhuca longifolia',
    commonName: 'Mahua (Ippa)',
    teluguName: 'Ippa (ఇప్ప)',
    woodDensity: 0.86,
    annualHeightGrowthRate: 0.45,
    annualDbhGrowthRate: 0.70,
    crownShape: 'Spreading Dense Rounded Crown',
    typicalDbhRange: [35, 100],
    typicalHeightRange: [12, 25],
    carbonFactor: 0.50,
    region: 'Araku & Visakha Tribal Belts',
    expectedBarkTexture: 'Cracked greyish-brown thick bark',
    expectedCanopyShape: 'Dense spreading large rounded dome',
    nativeClimate: 'Tropical Dry / Moist Deciduous',
    expectedBiomassEquation: 'Chave 2014',
    confidenceThreshold: 0.88
  },
  'generic_hardwood': {
    id: 'generic_hardwood',
    scientificName: 'Angiospermae spp.',
    commonName: 'Tropical Mixed Hardwood',
    woodDensity: 0.65,
    annualHeightGrowthRate: 0.50,
    annualDbhGrowthRate: 0.80,
    crownShape: 'Irregular Spreading',
    typicalDbhRange: [20, 90],
    typicalHeightRange: [10, 25],
    carbonFactor: 0.48,
    region: 'Andhra Pradesh Forest Reserves',
    expectedBarkTexture: 'Standard furrowed grey',
    expectedCanopyShape: 'Irregular broad crown',
    nativeClimate: 'Tropical Deciduous',
    expectedBiomassEquation: 'Chave 2014',
    confidenceThreshold: 0.82
  }
};

export class SpeciesProfiler {
  /**
   * Lookup species profile by ID or common/scientific name
   * @param {string} searchKey 
   * @returns {Object} Species profile object
   */
  getProfile(searchKey = 'neem') {
    if (!searchKey) return SPECIES_DATABASE['neem'];

    const key = searchKey.toLowerCase().trim().replace(/[\s-]+/g, '_');
    if (SPECIES_DATABASE[key]) return SPECIES_DATABASE[key];

    // Search by common or scientific or Telugu name substring
    const matched = Object.values(SPECIES_DATABASE).find(sp => 
      sp.commonName.toLowerCase().includes(key) ||
      sp.scientificName.toLowerCase().includes(key) ||
      (sp.teluguName && sp.teluguName.toLowerCase().includes(key)) ||
      key.includes(sp.id)
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
