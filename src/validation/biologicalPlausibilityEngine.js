/**
 * PORTA-TLS Biological Plausibility Engine
 * Task 11: Forestry rule engine for biological sanity checks and species constraints.
 */

export class BiologicalPlausibilityEngine {
  constructor() {
    this.name = 'BiologicalPlausibilityEngine';
    this.version = 'v1.0.0-proprietary';

    // Species rule database
    this.speciesDatabase = {
      'Pinus sylvestris': { maxH: 45, maxDbh: 120, typicalHDbhRatio: [0.4, 1.2] },
      'Quercus robur': { maxH: 40, maxDbh: 300, typicalHDbhRatio: [0.2, 0.8] },
      'Eucalyptus globulus': { maxH: 70, maxDbh: 200, typicalHDbhRatio: [0.5, 1.5] },
      'Picea abies': { maxH: 55, maxDbh: 150, typicalHDbhRatio: [0.5, 1.4] },
      'Tectona grandis': { maxH: 40, maxDbh: 180, typicalHDbhRatio: [0.3, 0.9] },
      'Generic': { maxH: 80, maxDbh: 400, typicalHDbhRatio: [0.1, 2.0] }
    };
  }

  /**
   * Evaluate biological plausibility of a tree measurement
   */
  evaluatePlausibility(species = 'Generic', height = 0, dbhCm = 0) {
    const rules = this.speciesDatabase[species] || this.speciesDatabase['Generic'];
    const dbhM = dbhCm / 100;
    const hDbhRatio = dbhM > 0 ? height / dbhM : 0;

    const warnings = [];
    let plausibilityScore = 100;

    if (height > rules.maxH) {
      warnings.push(`Height ${height}m exceeds species max height of ${rules.maxH}m`);
      plausibilityScore -= 30;
    }

    if (dbhCm > rules.maxDbh) {
      warnings.push(`DBH ${dbhCm}cm exceeds species max DBH of ${rules.maxDbh}cm`);
      plausibilityScore -= 30;
    }

    if (hDbhRatio < rules.typicalHDbhRatio[0] || hDbhRatio > rules.typicalHDbhRatio[1]) {
      warnings.push(`Slenderness ratio (H/DBH = ${hDbhRatio.toFixed(2)}) is outside typical range [${rules.typicalHDbhRatio[0]}, ${rules.typicalHDbhRatio[1]}]`);
      plausibilityScore -= 20;
    }

    plausibilityScore = Math.max(0, plausibilityScore);

    return {
      isBiologicallyPlausible: plausibilityScore >= 60,
      plausibilityScore,
      hDbhRatio: Number(hDbhRatio.toFixed(2)),
      warnings,
      speciesEvaluated: species
    };
  }
}
