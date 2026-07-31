/**
 * PORTA-TLS Self-Validating Measurement Engine
 * Task 11: Automated self-validation, scan comparison, and outlier rejection.
 */

export class SelfValidatingEngine {
  constructor() {
    this.name = 'SelfValidatingEngine';
    this.version = 'v1.0.0-proprietary';
  }

  /**
   * Validate measurement against physical rules and previous scan history
   */
  validateMeasurement(measurement = {}, history = []) {
    const { height = 0, dbh = 0, biomass = 0 } = measurement;
    const flags = [];
    let isValid = true;

    // Physical bound checks
    if (height <= 0.5 || height > 120.0) {
      isValid = false;
      flags.push(`Height out of bounds: ${height}m (allowed: 0.5m - 120m)`);
    }

    if (dbh <= 2.0 || dbh > 450.0) {
      isValid = false;
      flags.push(`DBH out of bounds: ${dbh}cm (allowed: 2cm - 450cm)`);
    }

    if (biomass < 0 || biomass > 50000) {
      isValid = false;
      flags.push(`Biomass out of bounds: ${biomass}kg`);
    }

    // Historical repeat scan comparison check
    if (history && history.length > 0) {
      const lastScan = history[history.length - 1];
      const heightDelta = Math.abs(height - lastScan.height);
      const dbhDelta = Math.abs(dbh - lastScan.dbh);

      if (heightDelta > 15.0) { // Unrealistic height jump between scans (>15m)
        isValid = false;
        flags.push(`Unrealistic height delta from previous scan: ${heightDelta.toFixed(2)}m`);
      }

      if (dbhDelta > 30.0) { // Unrealistic DBH jump between scans (>30cm)
        isValid = false;
        flags.push(`Unrealistic DBH delta from previous scan: ${dbhDelta.toFixed(1)}cm`);
      }
    }

    return {
      isValid,
      flags,
      validatedAt: new Date().toISOString(),
      validationMethod: 'SELF_VALIDATING_BOUNDS_AND_DELTA'
    };
  }
}
