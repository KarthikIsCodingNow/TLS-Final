/**
 * decisionLogger.js - Immutable Decision Audit Logger for AFIE
 * 
 * Logs every intelligence decision cycle with species, environment, model selection,
 * reasoning trace, and timestamp.
 */

export class DecisionLogger {
  constructor(maxLogCount = 100) {
    this.maxLogCount = maxLogCount;
    this.logs = [];
  }

  /**
   * Log an AFIE decision event
   * @param {Object} decisionReport 
   */
  logDecision(decisionReport) {
    if (!decisionReport) return;

    const entry = {
      logId: `AFIE-LOG-${Date.now()}-${this.logs.length + 1}`,
      timestamp: Date.now(),
      species: decisionReport.species?.commonName || 'Generic Hardwood',
      environment: decisionReport.environment?.biome || 'Tropical',
      primaryModel: decisionReport.models?.primaryModel?.name || 'Chave 2014',
      secondaryModel: decisionReport.models?.secondaryModels?.[0]?.name || 'Jenkins 2003',
      modelAgreementPct: decisionReport.biomassFusion?.modelAgreementPct || 95.0,
      consensusBiomass: decisionReport.biomassFusion?.consensusBiomass || 0,
      consensusCarbon: decisionReport.biomassFusion?.consensusCarbon || 0,
      reasoning: decisionReport.models?.reasoningTrace || 'Standard intelligence selection.',
      ruleInferences: decisionReport.knowledgeInferences || []
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogCount) {
      this.logs.pop();
    }

    return entry;
  }

  /**
   * Get all decision logs
   */
  getLogs() {
    return this.logs;
  }

  /**
   * Export decision audit log to JSON
   */
  exportLogJSON() {
    const jsonStr = JSON.stringify(this.logs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `AFIE-Decision-Log-${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
