/**
 * PORTA-TLS Uncertainty Error Propagation Engine
 * Version 2.0 Architectural Baseline
 */
import { CONFIG } from '../core/config.js';

/**
 * Propagate Height and DBH uncertainties to AGB Biomass dry weight
 * Formula: sigma_AGB = AGB * 0.976 * sqrt((sigma_H / H)^2 + 4 * (sigma_DBH / DBH)^2)
 */
export function propagateBiomassUncertainty(height, dbh, heightError, dbhError, density) {
  if (height <= 0.0 || dbh <= 0.0) {
    return { agbError: 0.0, co2Error: 0.0 };
  }

  // Calculate AGB dry weight
  const agb = 0.0673 * Math.pow((density * Math.pow(dbh, 2) * height), 0.976);
  const p = 0.976;

  // Fractional variance propagation
  const fractionalVar = Math.pow(heightError / height, 2) + 4.0 * Math.pow(dbhError / dbh, 2);
  const agbError = agb * p * Math.sqrt(fractionalVar);

  // Carbon and CO2 equivalent propagation
  // CO2 = AGB * 0.5 * 3.67 = 1.835 * AGB
  const co2Error = 1.835 * agbError;

  return {
    agbError: parseFloat(agbError.toFixed(2)),
    co2Error: parseFloat(co2Error.toFixed(2))
  };
}

/**
 * Convert standard deviation to relative error percentage
 */
export function calculateRelativeError(value, error) {
  if (!value || value <= 0.0) return 0;
  return parseFloat(((error / value) * 100.0).toFixed(1));
}
