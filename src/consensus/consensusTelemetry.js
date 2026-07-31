/**
 * consensusTelemetry.js - Telemetry & Research Exporter for CMME
 * 
 * Manages ring-buffer history of multi-frame consensus sessions and handles:
 * - CSV Export (frame-by-frame values + consensus summary)
 * - JSON Telemetry Export
 * - PDF Printable Report Data Generation
 */

export class ConsensusTelemetry {
  constructor(maxHistory = 50) {
    this.maxHistory = maxHistory;
    this.sessionHistory = [];
  }

  /**
   * Record a completed consensus session
   * @param {Object} consensusReport 
   */
  recordSession(consensusReport) {
    if (!consensusReport) return;
    this.sessionHistory.unshift(consensusReport);
    if (this.sessionHistory.length > this.maxHistory) {
      this.sessionHistory.pop();
    }
  }

  /**
   * Export frame-by-frame and consensus data to CSV file
   * @param {Object} consensusReport 
   */
  exportCSV(consensusReport) {
    if (!consensusReport) return;

    const rows = [];
    rows.push(['=== CMME CONSENSUS MULTI-FRAME MEASUREMENT REPORT ===']);
    rows.push([`Session ID`, consensusReport.sessionId]);
    rows.push([`Timestamp`, new Date(consensusReport.timestamp).toISOString()]);
    rows.push([`Consensus Score`, `${consensusReport.consensusScore} / 100`]);
    rows.push([`Repeatability Score`, `${consensusReport.repeatabilityScore} / 100`]);
    rows.push([`Accepted Frames`, `${consensusReport.summary.accepted} / ${consensusReport.summary.total}`]);
    rows.push([`Early Convergence`, consensusReport.repeatability.convergence?.hasConverged ? 'YES' : 'NO']);
    rows.push([]);

    rows.push(['=== FINAL CONSENSUS METRICS ===']);
    rows.push(['Metric', 'Consensus Value', 'Standard Deviation', '95% CI']);
    rows.push(['Height (m)', consensusReport.consensus.height, consensusReport.statistics.height.stdDev, consensusReport.statistics.height.ci95.label]);
    rows.push(['Distance (m)', consensusReport.consensus.distance, consensusReport.statistics.distance.stdDev, consensusReport.statistics.distance.ci95.label]);
    rows.push(['DBH (cm)', consensusReport.consensus.dbh, consensusReport.statistics.dbh.stdDev, consensusReport.statistics.dbh.ci95.label]);
    rows.push(['Biomass (kg)', consensusReport.consensus.biomass, consensusReport.statistics.biomass.stdDev, consensusReport.statistics.biomass.ci95.label]);
    rows.push(['Carbon (kg)', consensusReport.consensus.carbon, consensusReport.statistics.carbon.stdDev, consensusReport.statistics.carbon.ci95.label]);
    rows.push([]);

    rows.push(['=== INDIVIDUAL FRAME TELEMETRY ===']);
    rows.push(['Frame Index', 'Frame ID', 'Status', 'Height (m)', 'Distance (m)', 'DBH (cm)', 'Biomass (kg)', 'CEPE Conf (%)', 'Reliability', 'Rejection Reasons']);

    consensusReport.allFrames.forEach(f => {
      rows.push([
        f.frameIndex,
        f.frameId,
        f.status.toUpperCase(),
        f.dimensions.height,
        f.dimensions.distance,
        f.dimensions.dbh,
        f.dimensions.biomass,
        f.cepe.confidencePct,
        f.cepe.reliabilityIndex,
        f.rejectionReasons ? f.rejectionReasons.join(' | ') : 'None'
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CMME-Consensus-Report-${consensusReport.sessionId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Export complete session state to JSON file
   * @param {Object} consensusReport 
   */
  exportJSON(consensusReport) {
    if (!consensusReport) return;
    const jsonStr = JSON.stringify(consensusReport, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CMME-Consensus-Report-${consensusReport.sessionId}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
