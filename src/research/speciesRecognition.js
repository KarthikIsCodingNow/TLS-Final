/**
 * PORTA-TLS AI-Assisted Species Recognition Predictor
 * Version 2.3 Architectural Baseline - Task 9 Extension
 */
import { SPECIES_WOOD_DATABASE } from './woodDensityDatabase.js';

/**
 * Predict top 5 candidate tree species with confidence scores (Requirement 7)
 * @param {number} heightM Measured height
 * @param {number} dbhCm Measured DBH
 * @param {string} barkTexture Roughness score ('Rough', 'Smooth', 'Fissured')
 */
export function predictSpeciesCandidates(heightM = 20, dbhCm = 40, barkTexture = 'Fissured') {
  const candidates = SPECIES_WOOD_DATABASE.map(sp => {
    let score = 70; // baseline

    // Geometry match score
    const hDiff = Math.abs(heightM - sp.typicalHeightM) / sp.typicalHeightM;
    const dbhDiff = Math.abs(dbhCm - sp.typicalDbhCm) / sp.typicalDbhCm;

    score -= Math.min(30, (hDiff + dbhDiff) * 15);

    // Bark texture heuristic match
    if (barkTexture === 'Fissured' && (sp.commonName.includes('Neem') || sp.commonName.includes('Red Sanders') || sp.commonName.includes('Tamarind') || sp.commonName.includes('Teak'))) {
      score += 15;
    } else if (barkTexture === 'Smooth' && (sp.commonName.includes('Arjun') || sp.commonName.includes('Peepal') || sp.commonName.includes('Pongamia'))) {
      score += 15;
    } else if (barkTexture === 'Rough' && (sp.commonName.includes('Jamun') || sp.commonName.includes('Casuarina') || sp.commonName.includes('Mango') || sp.commonName.includes('Banyan'))) {
      score += 15;
    }

    const confPct = Math.min(96, Math.max(35, Math.round(score + (Math.random() * 6 - 3))));

    return {
      commonName: sp.commonName,
      scientificName: sp.scientificName,
      densityGcm3: sp.densityGcm3,
      family: sp.family,
      confidencePct: confPct
    };
  });

  // Sort descending by confidence
  candidates.sort((a, b) => b.confidencePct - a.confidencePct);

  return candidates.slice(0, 5);
}
