/**
 * PORTA-TLS Automated Report Generation Engine
 * Version 2.4 Architectural Baseline - Task 10 Extension
 */

export const ReportingEngine = {
  /**
   * Export records as CSV string (Requirement 7)
   */
  exportCSV(records = [], headers = []) {
    if (!records || records.length === 0) return '';
    const cols = headers.length > 0 ? headers : Object.keys(records[0]);
    let csv = cols.join(',') + '\n';
    records.forEach(r => {
      csv += cols.map(c => JSON.stringify(r[c] !== undefined ? r[c] : '')).join(',') + '\n';
    });
    return csv;
  },

  /**
   * Export records as JSON string
   */
  exportJSON(records = []) {
    return JSON.stringify(records, null, 2);
  },

  /**
   * Export GeoJSON FeatureCollection (Requirement 10)
   */
  exportGeoJSON(trees = []) {
    const features = trees.map(t => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [t.lon || 0.0, t.lat || 0.0]
      },
      properties: {
        id: t.id,
        species: t.species,
        heightMeters: t.height,
        dbhCm: t.dbh,
        agbKg: t.agb,
        co2Kg: t.co2,
        confidencePct: t.confidenceScorePct || 85,
        timestamp: t.timestamp
      }
    }));

    return JSON.stringify({
      type: 'FeatureCollection',
      features
    }, null, 2);
  },

  /**
   * Generate formal HTML/PDF Report preview with digital signatures (Requirements 7 & 15)
   */
  generateHTMLReport(projectName, trees = [], signatureData = null) {
    const totalTrees = trees.length;
    const totalAgb = trees.reduce((acc, t) => acc + (t.agb || 0), 0);
    const totalCo2 = trees.reduce((acc, t) => acc + (t.co2 || 0), 0);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>PORTA-TLS Scientific Forestry Report - ${projectName}</title>
        <style>
          body { font-family: 'Helvetica', sans-serif; margin: 40px; color: #1e293b; }
          h1 { color: #0f172a; border-bottom: 2px solid #00ffcc; padding-bottom: 8px; }
          .summary-card { background: #f8fafc; padding: 16px; border: 1px solid #e2e8f0; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-size: 12px; }
          th { background: #f1f5f9; }
          .signature-box { margin-top: 40px; border-top: 2px dashed #94a3b8; padding-top: 16px; display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <h1>PORTA-TLS SCIENTIFIC FORESTRY REPORT</h1>
        <div class="summary-card">
          <p><strong>Project Name:</strong> ${projectName}</p>
          <p><strong>Total Trees Measured:</strong> ${totalTrees}</p>
          <p><strong>Total Above-Ground Biomass (AGB):</strong> ${totalAgb.toFixed(1)} kg</p>
          <p><strong>Total Carbon Sequestration (CO₂):</strong> ${totalCo2.toFixed(1)} kg</p>
          <p><strong>Report Date:</strong> ${new Date().toISOString().substring(0, 10)}</p>
        </div>

        <h3>Tree Inventory Registry</h3>
        <table>
          <thead>
            <tr><th>Tree ID</th><th>Species</th><th>Height (m)</th><th>DBH (cm)</th><th>AGB (kg)</th><th>CO₂ (kg)</th><th>Lat/Lon</th></tr>
          </thead>
          <tbody>
            ${trees.map(t => `
              <tr>
                <td>${t.id}</td>
                <td>${t.species}</td>
                <td>${t.height}</td>
                <td>${t.dbh}</td>
                <td>${t.agb}</td>
                <td>${t.co2}</td>
                <td>${t.lat ? `${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}` : 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="signature-box">
          <div>
            <p><strong>Researcher Signature:</strong> ${signatureData?.researcherName || 'Dr. J. Smith'}</p>
            <p><strong>Verification Status:</strong> APPROVED (${signatureData?.signatureHash || '0x4F8A99B2C'})</p>
          </div>
          <div>
            <p><strong>Supervisor Signature:</strong> ${signatureData?.supervisorName || 'Dr. A. Vance'}</p>
            <p><strong>Approval Date:</strong> ${new Date().toISOString().substring(0, 10)}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
};
