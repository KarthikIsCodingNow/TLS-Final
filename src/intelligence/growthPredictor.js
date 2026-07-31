/**
 * growthPredictor.js - Multi-Horizon Growth & Carbon Sequestration Predictor for AFIE
 * 
 * Projects tree dimensions (Height, DBH, Biomass, Carbon) across 1-Year, 3-Year,
 * and 5-Year horizons based on species annual growth rates and environmental coefficients.
 */

export class GrowthPredictor {
  /**
   * Predict future tree growth and carbon storage trajectory
   * @param {number} currentHeight - Current height (m)
   * @param {number} currentDbh - Current DBH (cm)
   * @param {number} currentBiomass - Current Biomass (kg)
   * @param {number} currentCarbon - Current CO2 Carbon (kg)
   * @param {Object} speciesProfile - Annual growth rates
   * @returns {Object} { horizon1Yr, horizon3Yr, horizon5Yr, annualSequestrationRate }
   */
  predictGrowth(currentHeight = 15.0, currentDbh = 40.0, currentBiomass = 680, currentCarbon = 1250, speciesProfile = {}) {
    const hRate = speciesProfile.annualHeightGrowthRate || 0.40; // m/yr
    const dbhRate = speciesProfile.annualDbhGrowthRate || 0.65; // cm/yr
    const rho = speciesProfile.woodDensity || 0.60;

    const horizons = [1, 3, 5].map(years => {
      const projHeight = Number((currentHeight + hRate * years).toFixed(2));
      const projDbh = Number((currentDbh + dbhRate * years).toFixed(1));
      
      // Re-estimate future biomass using Chave formula
      const projBiomass = Number((0.0673 * Math.pow(rho * Math.pow(projDbh, 2) * projHeight, 0.976)).toFixed(1));
      const projCarbon = Number((projBiomass * 0.50 * 3.67).toFixed(1));
      const carbonGain = Number((projCarbon - currentCarbon).toFixed(1));

      return {
        years,
        label: `${years} ${years === 1 ? 'Year' : 'Years'} Projection`,
        height: projHeight,
        dbh: projDbh,
        biomass: projBiomass,
        carbon: projCarbon,
        carbonGain
      };
    });

    const annualSequestrationRate = Number(((horizons[0].carbon - currentCarbon)).toFixed(1));

    return {
      horizon1Yr: horizons[0],
      horizon3Yr: horizons[1],
      horizon5Yr: horizons[2],
      annualSequestrationRate,
      growthRates: {
        heightRatePerYr: hRate,
        dbhRatePerYr: dbhRate
      }
    };
  }
}
