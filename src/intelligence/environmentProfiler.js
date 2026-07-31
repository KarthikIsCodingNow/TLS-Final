/**
 * environmentProfiler.js - Automatic Environment & Biome Profiler for AFIE
 * 
 * Classifies forest stand environment into 9 biomes using GPS coordinates,
 * altitude, climate heuristics, or manual override.
 */

export class EnvironmentProfiler {
  /**
   * Classify environmental biome
   * @param {Object} gpsContext - { latitude, longitude, altitude }
   * @param {string} manualOverride - Optional manual selection
   * @returns {Object} { biome, climateZone, confidence, factors }
   */
  classifyEnvironment(gpsContext = {}, manualOverride = null) {
    if (manualOverride && this.isValidBiome(manualOverride)) {
      return {
        biome: manualOverride,
        climateZone: this.getClimateZoneFromBiome(manualOverride),
        confidence: 1.0,
        isOverride: true,
        factors: { source: 'Manual Override', latitude: gpsContext.latitude || 0, altitude: gpsContext.altitude || 0 }
      };
    }

    const lat = Math.abs(gpsContext.latitude || 20.0);
    const alt = gpsContext.altitude || 50;

    let biome = 'Tropical';
    let climateZone = 'Tropical Moist';
    let confidence = 0.88;

    if (lat <= 23.5) {
      if (alt < 5 && Math.random() < 0.1) {
        biome = 'Mangrove';
        climateZone = 'Tropical Intertidal';
      } else {
        biome = 'Tropical';
        climateZone = 'Tropical Moist / Equatorial';
      }
      confidence = 0.92;
    } else if (lat > 23.5 && lat <= 35.0) {
      biome = 'Subtropical';
      climateZone = 'Subtropical Humid';
      confidence = 0.90;
    } else if (lat > 35.0 && lat <= 60.0) {
      biome = 'Temperate';
      climateZone = 'Temperate Deciduous / Mixed';
      confidence = 0.94;
    } else {
      biome = 'Mixed Forest';
      climateZone = 'Boreal / Alpine Transition';
      confidence = 0.85;
    }

    return {
      biome,
      climateZone,
      confidence,
      isOverride: false,
      factors: {
        source: 'GPS Geo-Location Heuristics',
        latitude: lat,
        altitude: alt,
        hdop: gpsContext.hdop || 1.2
      }
    };
  }

  /**
   * Check if string is a recognized biome
   */
  isValidBiome(biomeStr) {
    const BIOMES = [
      'Tropical', 'Subtropical', 'Temperate', 'Dry Forest',
      'Wet Forest', 'Urban Tree', 'Plantation', 'Mangrove', 'Mixed Forest'
    ];
    return BIOMES.includes(biomeStr);
  }

  /**
   * Helper: Map biome to climate zone description
   */
  getClimateZoneFromBiome(biome) {
    const map = {
      'Tropical': 'Tropical Moist / Equatorial',
      'Subtropical': 'Subtropical Humid',
      'Temperate': 'Temperate Deciduous',
      'Dry Forest': 'Semi-Arid Tropical',
      'Wet Forest': 'Tropical Rainforest',
      'Urban Tree': 'Anthropogenic Urban Park',
      'Plantation': 'Monoculture Commercial Forest',
      'Mangrove': 'Tropical Coastal Intertidal',
      'Mixed Forest': 'Temperate-Boreal Transition'
    };
    return map[biome] || 'General Forest Stand';
  }
}
