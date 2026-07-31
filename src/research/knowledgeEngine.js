/**
 * PORTA-TLS Forestry Knowledge Engine
 * Task 11: Rule-based expert system for forestry recommendations & carbon insights.
 */

export class KnowledgeEngine {
  constructor() {
    this.name = 'KnowledgeEngine';
    this.version = 'v1.0.0-proprietary';
  }

  /**
   * Evaluate measurement state and return expert forestry insights
   */
  generateInsights(measurementState = {}) {
    const { species = 'Generic', height = 10, dbh = 25, pqi = 85, hDbhRatio = 0.6 } = measurementState;
    const insights = [];
    const recommendations = [];

    // Growth stage inference
    if (dbh < 15) {
      insights.push(`Young/juvenile stand stage for ${species}. Expected annual height growth: 0.5m - 1.2m/year.`);
    } else if (dbh < 45) {
      insights.push(`Mature merchantable timber stage. Canopy density optimal for carbon sequestration.`);
    } else {
      insights.push(`Old-growth/veteran tree candidate. High biodiversity and carbon storage value.`);
    }

    // Slenderness index diagnosis
    if (hDbhRatio > 1.2) {
      insights.push(`High slenderness ratio (H/DBH = ${hDbhRatio}). Increased risk of windthrow or snow breakage.`);
      recommendations.push('Consider thinning adjacent stand to promote lateral trunk radial growth.');
    }

    // PQI guidance
    if (pqi < 70) {
      recommendations.push('Scan quality below research threshold. Adjust camera angle to reduce backlighting and verify distance marker.');
    }

    // Carbon note
    const estCarbonTons = (height * Math.pow(dbh / 100, 2) * 0.45 * 0.5).toFixed(2);
    insights.push(`Estimated total sequestered carbon: ${estCarbonTons} tonnes CO2e.`);

    return {
      species,
      insights,
      recommendations,
      estimatedCarbonTons: estCarbonTons,
      expertSystemVersion: this.version
    };
  }
}
