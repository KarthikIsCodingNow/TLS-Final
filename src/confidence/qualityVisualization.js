/**
 * qualityVisualization.js - UI Renderer & Radar Fingerprint Chart for CEPE
 * 
 * Renders:
 * 1. Measurement Quality Report Panel & Letter Grade Badge
 * 2. 9-Axis SVG/Canvas Radar (Spider) Visual Fingerprint Chart
 * 3. 17-Factor Live Quality Diagnostics Table
 * 4. Error Contributors Breakdown Chart
 * 5. 68% / 95% / 99% Confidence Intervals Table
 * 6. Natural Language Explanations & Actionable Recommendations
 */

import { CEPE } from './confidenceEngine.js';

export class QualityVisualizationUI {
  constructor() {
    this.container = null;
  }

  /**
   * Initialize and attach the CEPE Quality Report Panel to target container
   * @param {HTMLElement|string} parentSelector 
   */
  init(parentSelector = '#cepe-quality-report-container') {
    this.container = typeof parentSelector === 'string' ? document.querySelector(parentSelector) : parentSelector;
    if (!this.container) return;

    this.renderSkeleton();
    this.update();
  }

  /**
   * Render structural skeleton
   */
  renderSkeleton() {
    this.container.innerHTML = `
      <div class="cepe-report-card card p-4 mb-4 border-cyan shadow-lg">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div class="d-flex align-items-center gap-3">
            <span class="badge bg-cyan text-dark font-mono font-bold fs-6">CEPE 1.0</span>
            <div>
              <h5 class="m-0 text-light font-bold tracking-wide">MEASUREMENT QUALITY REPORT & DIAGNOSTICS</h5>
              <p class="m-0 text-muted small">Scientific Uncertainty Prediction & Error Propagation Engine</p>
            </div>
          </div>
          <div class="d-flex align-items-center gap-3">
            <div class="text-end">
              <div class="small text-muted font-mono">RELIABILITY INDEX</div>
              <div class="fs-4 font-bold text-teal font-mono" id="cepe-reliability-idx">94.8 / 100</div>
            </div>
            <div class="badge-grade p-2 px-3 rounded text-center" id="cepe-grade-badge" style="background: rgba(0,242,254,0.15); border: 1.5px solid #00f2fe;">
              <div class="fs-2 font-bold text-cyan font-mono" id="cepe-grade-val">A+</div>
              <div class="small font-mono text-cyan" id="cepe-grade-lbl" style="font-size: 10px;">RESEARCH GRADE</div>
            </div>
          </div>
        </div>

        <!-- Row 1: Radar Chart (Spider Fingerprint) & Error Contributors -->
        <div class="row g-4 mb-4">
          <!-- Left: 9-Axis Quality Radar Chart -->
          <div class="col-md-6 text-center">
            <div class="p-3 bg-darker rounded border-gray h-100">
              <h6 class="text-cyan font-mono mb-2">9-AXIS QUALITY SPIDER RADAR FINGERPRINT</h6>
              <div class="d-flex justify-content-center align-items-center" style="min-height: 220px;">
                <svg id="cepe-radar-svg" width="260" height="220" viewBox="0 0 260 220" style="background: transparent;">
                  <!-- Dynamic Radar SVG -->
                </svg>
              </div>
            </div>
          </div>

          <!-- Right: Error Contributors Breakdown -->
          <div class="col-md-6">
            <div class="p-3 bg-darker rounded border-gray h-100">
              <h6 class="text-yellow font-mono mb-3">TOP UNCERTAINTY CONTRIBUTORS</h6>
              <div id="cepe-error-contributors-list" class="d-flex flex-column gap-2">
                <!-- Rendered dynamically -->
              </div>
            </div>
          </div>
        </div>

        <!-- Row 2: 68% / 95% / 99% Confidence Intervals Table -->
        <div class="mb-4">
          <h6 class="text-teal font-mono mb-2">GAUSSIAN CONFIDENCE INTERVALS (± UNCERTAINTY BOUNDS)</h6>
          <div class="table-responsive">
            <table class="table table-dark table-sm border-gray font-mono small mb-0 align-middle">
              <thead>
                <tr class="text-cyan">
                  <th>METRIC</th>
                  <th>ESTIMATED VALUE</th>
                  <th>EXPECTED ERROR</th>
                  <th>68% CONF (±1.0σ)</th>
                  <th>95% CONF (±1.96σ)</th>
                  <th>99% CONF (±2.58σ)</th>
                </tr>
              </thead>
              <tbody id="cepe-intervals-tbody">
                <!-- Rendered dynamically -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- Row 3: Explanations Trace & Recommendations -->
        <div class="row g-4">
          <!-- Left: Measurement Explanations -->
          <div class="col-md-6">
            <div class="p-3 bg-dark-card rounded border-gray h-100">
              <h6 class="text-light font-mono mb-2">MEASUREMENT EXPLANATION TRACE</h6>
              <div id="cepe-explanations-box" class="small">
                <!-- Rendered dynamically -->
              </div>
            </div>
          </div>

          <!-- Right: Quality Recommendations -->
          <div class="col-md-6">
            <div class="p-3 bg-dark-card rounded border-gray h-100">
              <h6 class="text-teal font-mono mb-2">ACTIONABLE QUALITY RECOMMENDATIONS</h6>
              <div id="cepe-recommendations-list" class="d-flex flex-column gap-2 small">
                <!-- Rendered dynamically -->
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Update UI state with latest CEPE evaluation payload
   */
  update() {
    const report = CEPE.getLastEvaluation();
    if (!report || !this.container) return;

    // 1. Reliability & Grade
    const relElem = this.container.querySelector('#cepe-reliability-idx');
    if (relElem) relElem.innerText = `${report.reliabilityIndex} / 100`;

    const gradeVal = this.container.querySelector('#cepe-grade-val');
    const gradeLbl = this.container.querySelector('#cepe-grade-lbl');
    const gradeBadge = this.container.querySelector('#cepe-grade-badge');

    if (gradeVal && report.grade) {
      gradeVal.innerText = report.grade.grade;
      gradeVal.style.color = report.grade.color;
    }
    if (gradeLbl && report.grade) gradeLbl.innerText = report.grade.label;
    if (gradeBadge && report.grade) gradeBadge.style.borderColor = report.grade.color;

    // 2. 9-Axis Radar SVG Chart
    this.renderRadarSVG(report.qualityFactors);

    // 3. Error Contributors
    const contribList = this.container.querySelector('#cepe-error-contributors-list');
    if (contribList) {
      const list = report.errorContributors || [];
      contribList.innerHTML = list.map(item => `
        <div>
          <div class="d-flex justify-content-between text-light font-mono small mb-1">
            <span>${item.factor}</span>
            <span class="text-yellow font-bold">${item.percentage}%</span>
          </div>
          <div class="progress" style="height: 6px; background: rgba(255,255,255,0.1);">
            <div class="progress-bar bg-warning" style="width: ${item.percentage}%;"></div>
          </div>
        </div>
      `).join('');
    }

    // 4. Confidence Intervals Table
    const tbody = this.container.querySelector('#cepe-intervals-tbody');
    if (tbody) {
      const ci = report.confidenceIntervals || {};
      const rows = [
        { label: 'HEIGHT (m)', key: 'height', unit: 'm' },
        { label: 'RANGE (m)', key: 'distance', unit: 'm' },
        { label: 'DBH (cm)', key: 'dbh', unit: 'cm' },
        { label: 'BIOMASS (kg)', key: 'biomass', unit: 'kg' },
        { label: 'CARBON (kg)', key: 'carbon', unit: 'kg' }
      ];

      tbody.innerHTML = rows.map(r => {
        const item = ci[r.key] || { value: 0, sigma: 0, ci68: { label: '±0' }, ci95: { label: '±0' }, ci99: { label: '±0' } };
        return `
          <tr>
            <td class="text-cyan font-bold">${r.label}</td>
            <td class="text-light">${item.value} ${r.unit}</td>
            <td class="text-yellow">±${item.sigma} ${r.unit}</td>
            <td class="text-teal">${item.ci68.label} ${r.unit}</td>
            <td class="text-teal-light">${item.ci95.label} ${r.unit}</td>
            <td class="text-muted">${item.ci99.label} ${r.unit}</td>
          </tr>
        `;
      }).join('');
    }

    // 5. Explanations Trace
    const expBox = this.container.querySelector('#cepe-explanations-box');
    if (expBox) {
      const pos = (report.explanations?.positive || []).map(p => `<div class="text-teal mb-1">✓ ${p}</div>`).join('');
      const neg = (report.explanations?.negative || []).map(n => `<div class="text-red mb-1">⚠ ${n}</div>`).join('');
      expBox.innerHTML = `${pos}${neg || '<div class="text-muted">No negative quality factors detected.</div>'}`;
    }

    // 6. Recommendations
    const recsList = this.container.querySelector('#cepe-recommendations-list');
    if (recsList) {
      const recs = report.recommendations || [];
      recsList.innerHTML = recs.map(rec => `
        <div class="p-2 rounded bg-darker border-gray d-flex justify-content-between align-items-center">
          <span class="text-light font-mono">• ${rec.action}</span>
          <span class="badge bg-teal text-dark font-mono">${rec.impact}</span>
        </div>
      `).join('');
    }
  }

  /**
   * Render SVG 9-Axis Spider Radar Chart
   */
  renderRadarSVG(factors = {}) {
    const svg = this.container ? this.container.querySelector('#cepe-radar-svg') : null;
    if (!svg) return;

    const axes = [
      { name: 'Lighting', val: factors.lightingQuality || 0.85 },
      { name: 'Stability', val: factors.cameraStability || 0.92 },
      { name: 'Tracking', val: factors.bboxStability || 0.90 },
      { name: 'Sensors', val: factors.deviceOrientationStability || 0.88 },
      { name: 'Calibration', val: factors.manualCalibAccuracy || 0.95 },
      { name: 'Distance', val: factors.distanceReliability || 1.0 },
      { name: 'Visibility', val: factors.treeVisibility || 0.80 },
      { name: 'AI', val: factors.aiConfidence || 0.94 },
      { name: 'GPS', val: factors.gpsAccuracy || 0.80 }
    ];

    const cx = 130;
    const cy = 110;
    const radius = 80;
    const totalAxes = axes.length;

    // Build grid polygons (100%, 75%, 50%, 25%)
    const rings = [1.0, 0.75, 0.50, 0.25].map(r => {
      const points = axes.map((_, i) => {
        const angle = (i * 2 * Math.PI / totalAxes) - Math.PI / 2;
        const x = cx + radius * r * Math.cos(angle);
        const y = cy + radius * r * Math.sin(angle);
        return `${x},${y}`;
      }).join(' ');
      return `<polygon points="${points}" fill="none" stroke="#2a3b50" stroke-width="1" />`;
    }).join('');

    // Build axis lines & labels
    const axisElements = axes.map((axis, i) => {
      const angle = (i * 2 * Math.PI / totalAxes) - Math.PI / 2;
      const x2 = cx + radius * Math.cos(angle);
      const y2 = cy + radius * Math.sin(angle);

      const labelX = cx + (radius + 16) * Math.cos(angle);
      const labelY = cy + (radius + 16) * Math.sin(angle) + 3;

      return `
        <line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="#2a3b50" stroke-width="1" />
        <text x="${labelX}" y="${labelY}" text-anchor="middle" fill="#8b9bb4" font-size="8" font-family="monospace">${axis.name}</text>
      `;
    }).join('');

    // Build data polygon
    const dataPoints = axes.map((axis, i) => {
      const angle = (i * 2 * Math.PI / totalAxes) - Math.PI / 2;
      const r = radius * Math.max(0.1, Math.min(1.0, axis.val));
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');

    svg.innerHTML = `
      ${rings}
      ${axisElements}
      <polygon points="${dataPoints}" fill="rgba(0, 242, 254, 0.25)" stroke="#00f2fe" stroke-width="2" />
    `;
  }
}

export const qualityVisualizationUI = new QualityVisualizationUI();
