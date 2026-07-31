/**
 * PORTA-TLS Scientific Wood Density & Species Database
 * Version 2.3 Architectural Baseline - Task 9 Extension
 */

export const SPECIES_WOOD_DATABASE = [
  {
    commonName: 'Oak',
    scientificName: 'Quercus robur',
    densityGcm3: 0.75,
    typicalHeightM: 25.0,
    typicalDbhCm: 60.0,
    region: 'North America / Europe',
    biome: 'Temperate Broadleaf',
    growthRate: 'Slow',
    family: 'Fagaceae'
  },
  {
    commonName: 'Pine',
    scientificName: 'Pinus sylvestris',
    densityGcm3: 0.45,
    typicalHeightM: 30.0,
    typicalDbhCm: 45.0,
    region: 'Global Boreal / Temperate',
    biome: 'Coniferous Forest',
    growthRate: 'Fast',
    family: 'Pinaceae'
  },
  {
    commonName: 'Maple',
    scientificName: 'Acer saccharum',
    densityGcm3: 0.65,
    typicalHeightM: 28.0,
    typicalDbhCm: 50.0,
    region: 'North America',
    biome: 'Hardwood Temperate',
    growthRate: 'Moderate',
    family: 'Sapindaceae'
  },
  {
    commonName: 'Birch',
    scientificName: 'Betula pendula',
    densityGcm3: 0.60,
    typicalHeightM: 20.0,
    typicalDbhCm: 35.0,
    region: 'Eurasia / North America',
    biome: 'Boreal / Cold Temperate',
    growthRate: 'Moderate',
    family: 'Betulaceae'
  },
  {
    commonName: 'Eucalyptus',
    scientificName: 'Eucalyptus globulus',
    densityGcm3: 0.80,
    typicalHeightM: 45.0,
    typicalDbhCm: 80.0,
    region: 'Australasia / South America',
    biome: 'Subtropical / Mediterranean',
    growthRate: 'Very Fast',
    family: 'Myrtaceae'
  },
  {
    commonName: 'Teak',
    scientificName: 'Tectona grandis',
    densityGcm3: 0.66,
    typicalHeightM: 35.0,
    typicalDbhCm: 70.0,
    region: 'South / Southeast Asia',
    biome: 'Tropical Dry / Moist Forest',
    growthRate: 'Moderate',
    family: 'Lamiaceae'
  },
  {
    commonName: 'Redwood',
    scientificName: 'Sequoia sempervirens',
    densityGcm3: 0.42,
    typicalHeightM: 85.0,
    typicalDbhCm: 250.0,
    region: 'Pacific Coast North America',
    biome: 'Temperate Rainforest',
    growthRate: 'Fast',
    family: 'Cupressaceae'
  },
  {
    commonName: 'Mahogany',
    scientificName: 'Swietenia macrophylla',
    densityGcm3: 0.54,
    typicalHeightM: 40.0,
    typicalDbhCm: 90.0,
    region: 'Neotropics Central/South America',
    biome: 'Tropical Rainforest',
    growthRate: 'Moderate',
    family: 'Meliaceae'
  },
  {
    commonName: 'Douglas Fir',
    scientificName: 'Pseudotsuga menziesii',
    densityGcm3: 0.51,
    typicalHeightM: 55.0,
    typicalDbhCm: 110.0,
    region: 'Western North America',
    biome: 'Montane Coniferous',
    growthRate: 'Fast',
    family: 'Pinaceae'
  },
  {
    commonName: 'Cedar',
    scientificName: 'Cedrus libani',
    densityGcm3: 0.48,
    typicalHeightM: 32.0,
    typicalDbhCm: 65.0,
    region: 'Mediterranean / Middle East',
    biome: 'Montane Mediterranean',
    growthRate: 'Slow',
    family: 'Pinaceae'
  },
  {
    commonName: 'Balsa',
    scientificName: 'Ochroma pyramidale',
    densityGcm3: 0.16,
    typicalHeightM: 22.0,
    typicalDbhCm: 40.0,
    region: 'Tropical Americas',
    biome: 'Humid Lowland Tropical',
    growthRate: 'Ultra Fast',
    family: 'Malvaceae'
  },
  {
    commonName: 'Cypress',
    scientificName: 'Taxodium distichum',
    densityGcm3: 0.52,
    typicalHeightM: 30.0,
    typicalDbhCm: 75.0,
    region: 'Southeastern USA Swamps',
    biome: 'Wetland / Floodplain',
    growthRate: 'Moderate',
    family: 'Cupressaceae'
  }
];

export function getSpeciesData(commonName) {
  return SPECIES_WOOD_DATABASE.find(s => s.commonName.toLowerCase() === (commonName || '').toLowerCase()) || {
    commonName: commonName || 'Generic Hardwood',
    scientificName: 'Plantae Incertae Sedis',
    densityGcm3: 0.50,
    typicalHeightM: 20.0,
    typicalDbhCm: 40.0,
    region: 'Global',
    biome: 'General Forest',
    growthRate: 'Moderate',
    family: 'Unknown'
  };
}
