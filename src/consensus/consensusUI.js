/**
 * consensusUI.js - UI Dashboard, Heatmap & SVG Charts Visualizer for CMME
 * 
 * Renders:
 * 1. Live Progress Bar (Frame X of N, Early Convergence Alert)
 * 2. Frame Quality Heatmap (Green, Yellow, Red)
 * 3. 3 Interactive SVG Multi-Trace Line Charts (Height/DBH vs Frame, Conf vs Frame, Drift Trajectory)
 * 4. Statistical Metrics Table (Mean, Median, Mode, Weighted Mean, SD, CV%, 95% CIs)
 * 5. Auto-Retake Advisory & Explanation Trace
 * 6. CSV & JSON Exporters
 */

import { CMME } from './consensusEngine.js';

export class ConsensusUI {
  constructor() {
    this.container = null;
  }

  /**
   * Initialize and attach the CMME Consensus Dashboard panel to DOM container
   * @param {HTMLElement|string} parentSelector 
   */
  init(parentSelector = '#cmme-dashboard-container') {
    this.container = typeof parentSelector === 'string' ? document.querySelector(parentSelector) : parentSelector;
    if (!this.container) return;

    this.renderSkeleton();
    this.attachEventListeners();
    this.update();
  }

  /**
   * Render structural HTML skeleton
   */
  renderSkeleton() {
    this.container.innerHTML = `
      <div class="cmme-dashboard-card card p-4 mb-4 border-purple shadow-lg" style="background: #0b0f19; border: 1.5px solid #8a2be2;">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-gray">
          <div class="d-flex align-items-center gap-3">
            <span class="badge font-mono font-bold fs-6" style="background: #8a2be2; color: #fff;">CMME 1.0</span>
            <div>
              <h5 class="m-0 text-light font-bold tracking-wide">CONSENSUS MULTI-FRAME MEASUREMENT ENGINE</h5>
              <p class="m-0 text-muted small">Statistical Multi-Frame Consensus, Outlier Filtering & Convergence Engine</p>
            </div>
          </div>
          <div class="d-flex align-items-center gap-3">
            <div class="d-flex align-items-center gap-2">
              <span class="small font-mono text-muted">TARGET FRAMES:</span>
              <select id="cmme-target-frame-select" class="form-select form-select-sm bg-dark text-cyan border-purple font-mono" style="width: 80px;">
                <option value="5">5</option>
                <option value="10" selected>10</option>
                <option value="20">20</option>
              </select>
            </div>
            <button id="btn-trigger-cmme-scan" class="btn btn-sm btn-purple font-mono px-3 font-bold" style="background: #8a2be2; color: #fff; border: none;">
              ⚡ START MULTI-FRAME SCAN
            </button>
          </div>
        </div>

        <!-- Live Progress & Early Convergence Alert Banner -->
        <div id="cmme-progress-banner" class="p-3 mb-4 rounded bg-darker border-gray d-none">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="font-mono text-cyan font-bold" id="cmme-progress-lbl">COLLECTING MEASUREMENTS: FRAME 0 OF 10</span>
            <span class="font-mono text-purple font-bold" id="cmme-progress-pct">0%</span>
          </div>
          <div class="progress" style="height: 8px; background: rgba(255,255,255,0.1);">
            <div id="cmme-progress-bar" class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 0%; background: linear-gradient(90deg, #00f2fe, #8a2be2);"></div>
          </div>
          <div id="cmme-convergence-alert" class="small font-mono text-teal mt-2 d-none">
            ✓ EARLY CONVERGENCE DETECTED: Measurement variation stabilized early!
          </div>
        </div>

        <!-- Row 1: Consensus Score & Summary Badges -->
        <div class="row g-3 mb-4">
          <div class="col-md-3">
            <div class="p-3 bg-darker rounded border-gray text-center">
              <div class="small font-mono text-muted">CONSENSUS SCORE</div>
              <div class="fs-2 font-bold font-mono text-purple" id="cmme-consensus-score">98.6 / 100</div>
              <div class="small font-mono text-teal" id="cmme-consensus-status">RESEARCH VALIDATED</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="p-3 bg-darker rounded border-gray text-center">
              <div class="small font-mono text-muted">REPEATABILITY SCORE</div>
              <div class="fs-2 font-bold font-mono text-cyan" id="cmme-repeatability-score">96.4 / 100</div>
              <div class="small font-mono text-muted" id="cmme-repeatability-label">HIGH CONVERGENCE</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="p-3 bg-darker rounded border-gray text-center">
              <div class="small font-mono text-muted">FRAME ACCEPTANCE</div>
              <div class="fs-2 font-bold font-mono text-yellow" id="cmme-acceptance-ratio">9 / 10</div>
              <div class="small font-mono text-muted" id="cmme-rejected-count">1 REJECTED (MAD)</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="p-3 bg-darker rounded border-gray text-center">
              <div class="small font-mono text-muted">CONSENSUS HEIGHT</div>
              <div class="fs-2 font-bold font-mono text-green" id="cmme-consensus-height">15.24 m</div>
              <div class="small font-mono text-muted" id="cmme-height-sd">SD ±0.08 m</div>
            </div>
          </div>
        </div>

        <!-- Frame Quality Heatmap Grid -->
        <div class="mb-4 p-3 bg-darker rounded border-gray">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="text-purple font-mono m-0">FRAME QUALITY HEATMAP GRID</h6>
            <div class="d-flex gap-3 small font-mono">
              <span class="text-green">● Valid/Accepted</span>
              <span class="text-yellow">● Suspicious</span>
              <span class="text-danger">● Outlier/Rejected</span>
            </div>
          </div>
          <div id="cmme-heatmap-grid" class="d-flex flex-wrap gap-2 pt-2">
            <!-- Heatmap blocks rendered dynamically -->
          </div>
        </div>

        <!-- SVG Multi-Trace Line Charts (Height/DBH Trajectory & Confidence vs Frame) -->
        <div class="row g-4 mb-4">
          <div class="col-md-6">
            <div class="p-3 bg-darker rounded border-gray">
              <h6 class="text-cyan font-mono mb-2">HEIGHT & DBH TRAJECTORY VS FRAME</h6>
              <div class="d-flex justify-content-center" style="min-height: 180px;">
                <svg id="cmme-chart-height-svg" width="100%" height="180" viewBox="0 0 320 180"></svg>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-3 bg-darker rounded border-gray">
              <h6 class="text-yellow font-mono mb-2">CEPE CONFIDENCE & RELIABILITY VS FRAME</h6>
              <div class="d-flex justify-content-center" style="min-height: 180px;">
                <svg id="cmme-chart-conf-svg" width="100%" height="180" viewBox="0 0 320 180"></svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistical Summary Table -->
        <div class="mb-4">
          <h6 class="text-purple font-mono mb-2">CMME STATISTICAL CONSENSUS MATRIX</h6>
          <div class="table-responsive">
            <table class="table table-dark table-sm border-gray font-mono small mb-0 align-middle">
              <thead>
                <tr class="text-cyan">
                  <th>METRIC</th>
                  <th>WEIGHTED CONSENSUS</th>
                  <th>MEAN</th>
                  <th>MEDIAN</th>
                  <th>MODE</th>
                  <th>STD DEV (σ)</th>
                  <th>VAR (σ²)</th>
                  <th>CV %</th>
                  <th>95% CONF INTERVAL</th>
                </tr>
              </thead>
              <tbody id="cmme-stats-tbody">
                <!-- Rendered dynamically -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- Retake Advisory & Natural Language Explanation -->
        <div class="p-3 rounded mb-4" id="cmme-advisory-box" style="background: rgba(138,43,226,0.1); border: 1px solid #8a2be2;">
          <div class="d-flex align-items-center gap-2 mb-1">
            <span class="badge bg-purple text-light font-mono" id="cmme-advisory-badge">VALIDATED</span>
            <span class="font-bold font-mono text-purple" id="cmme-advisory-title">MEASUREMENT CONSENSUS VALIDATED</span>
          </div>
          <p class="m-0 text-light small font-mono" id="cmme-explanation-text">
            10 measurements collected (9 accepted, 1 rejected). Consensus height 15.24m (SD ±0.08m) with 98.2% confidence.
          </p>
        </div>

        <!-- Export Buttons -->
        <div class="d-flex gap-2 justify-content-end">
          <button id="btn-cmme-export-csv" class="btn btn-sm btn-outline-cyan font-mono">EXPORT CSV REPORT</button>
          <button id="btn-cmme-export-json" class="btn btn-sm btn-outline-purple font-mono">EXPORT TELEMETRY JSON</button>
        </div>
      </div>
    `;
  }

  /**
   * Attach button listeners
   */
  attachEventListeners() {
    const targetSelect = this.container.querySelector('#cmme-target-frame-select');
    if (targetSelect) {
      targetSelect.addEventListener('change', (e) => {
        CMME.setTargetFrames(e.target.value);
      });
    }

    const btnScan = this.container.querySelector('#btn-trigger-cmme-scan');
    if (btnScan) {
      btnScan.addEventListener('click', () => {
        this.simulateMultiFrameScan();
      });
    }

    const btnCsv = this.container.querySelector('#btn-cmme-export-csv');
    if (btnCsv) {
      btnCsv.addEventListener('click', () => {
        const report = CMME.getLatestReport();
        if (report) CMME.telemetry.exportCSV(report);
      });
    }

    const btnJson = this.container.querySelector('#btn-cmme-export-json');
    if (btnJson) {
      btnJson.addEventListener('click', () => {
        const report = CMME.getLatestReport();
        if (report) CMME.telemetry.exportJSON(report);
      });
    }
  }

  /**
   * Simulate a multi-frame scan cycle (or update with real frames)
   */
  simulateMultiFrameScan() {
    CMME.collector.startCollection();
    const progressBanner = this.container.querySelector('#cmme-progress-banner');
    const progressBar = this.container.querySelector('#cmme-progress-bar');
    const progressLbl = this.container.querySelector('#cmme-progress-lbl');
    const progressPct = this.container.querySelector('#cmme-progress-pct');
    const convergenceAlert = this.container.querySelector('#cmme-convergence-alert');

    if (progressBanner) progressBanner.classList.remove('d-none');
    if (convergenceAlert) convergenceAlert.classList.add('d-none');

    const targetCount = CMME.collector.targetFrameCount;
    let step = 0;

    const interval = setInterval(() => {
      step++;

      // Generate synthetic frame telemetry building on AMSFE & CEPE
      const baseHeight = 15.20;
      const baseDbh = 42.5;
      const baseDist = 8.5;

      // Inject 1 outlier frame intentionally for demonstration
      const isOutlier = step === 5;
      const hNoise = isOutlier ? 7.6 : (Math.random() - 0.5) * 0.18;
      const dNoise = isOutlier ? 15.0 : (Math.random() - 0.5) * 0.4;
      const distNoise = isOutlier ? 4.0 : (Math.random() - 0.5) * 0.1;

      const amsfeFused = {
        height: Number((baseHeight + hNoise).toFixed(2)),
        distance: Number((baseDist + distNoise).toFixed(2)),
        dbh: Number((baseDbh + dNoise).toFixed(1)),
        biomass: 683 + Math.round(hNoise * 40),
        carbon: 1251 + Math.round(hNoise * 70),
        confidence: isOutlier ? 45.0 : 95.0 + (Math.random() * 3.0),
        uncertainty: 0.15,
        weights: { manual: 0.2, ai: 0.3, clinometer: 0.2, marker: 0.15, pointcloud: 0.15 }
      };

      const cepeReport = {
        confidencePct: isOutlier ? 48.0 : 96.0 + (Math.random() * 3.0),
        grade: { grade: isOutlier ? 'D' : 'Grade A+' },
        reliabilityIndex: isOutlier ? 42.0 : 94.5 + (Math.random() * 4.0)
      };

      const result = CMME.processFrame(amsfeFused, cepeReport);

      const pct = Math.round((step / targetCount) * 100);
      if (progressBar) progressBar.style.width = `${pct}%`;
      if (progressLbl) progressLbl.innerText = `COLLECTING MEASUREMENTS: FRAME ${step} OF ${targetCount}`;
      if (progressPct) progressPct.innerText = `${pct}%`;

      this.update();

      if (result.isConverged && step >= 5) {
        if (convergenceAlert) convergenceAlert.classList.remove('d-none');
        clearInterval(interval);
        setTimeout(() => {
          if (progressBanner) progressBanner.classList.add('d-none');
        }, 2000);
      } else if (step >= targetCount) {
        clearInterval(interval);
        setTimeout(() => {
          if (progressBanner) progressBanner.classList.add('d-none');
        }, 1500);
      }
    }, 180);
  }

  /**
   * Update UI elements from latest CMME report state
   */
  update() {
    let report = CMME.getLatestReport();

    // If no report yet, build mock report from current collector state
    if (!report && CMME.collector.getFrames().length > 0) {
      const frames = CMME.collector.getFrames();
      const outlierResult = CMME.outlierDetector.evaluateFrames(frames);
      const stats = CMME.statisticalAnalysis.analyze(outlierResult.acceptedFrames);
      const repeatability = CMME.repeatabilityEngine.evaluate(outlierResult.acceptedFrames, stats);
      report = CMME.finalizeConsensus(frames, outlierResult, stats, repeatability);
    }

    if (!report) {
      // Default initial mock report
      this.renderMockInitial();
      return;
    }

    // 1. Badges
    const scoreEl = this.container.querySelector('#cmme-consensus-score');
    if (scoreEl) scoreEl.innerText = `${report.consensusScore} / 100`;

    const repEl = this.container.querySelector('#cmme-repeatability-score');
    if (repEl) repEl.innerText = `${report.repeatabilityScore} / 100`;

    const accEl = this.container.querySelector('#cmme-acceptance-ratio');
    if (accEl) accEl.innerText = `${report.summary.accepted} / ${report.summary.total}`;

    const rejEl = this.container.querySelector('#cmme-rejected-count');
    if (rejEl) rejEl.innerText = `${report.summary.rejected} REJECTED (${report.summary.rejectionReasons || 'MAD/IQR'})`;

    const heightEl = this.container.querySelector('#cmme-consensus-height');
    if (heightEl) heightEl.innerText = `${report.consensus.height.toFixed(2)} m`;

    const sdEl = this.container.querySelector('#cmme-height-sd');
    if (sdEl) sdEl.innerText = `SD ±${report.statistics.height.stdDev.toFixed(2)} m`;

    // 2. Heatmap Grid
    this.renderHeatmap(report.allFrames);

    // 3. SVG Charts
    this.renderCharts(report.allFrames);

    // 4. Stats Table
    this.renderStatsTable(report.statistics);

    // 5. Retake Advisory & Explanation
    const advBadge = this.container.querySelector('#cmme-advisory-badge');
    const advTitle = this.container.querySelector('#cmme-advisory-title');
    const advText = this.container.querySelector('#cmme-explanation-text');
    const advBox = this.container.querySelector('#cmme-advisory-box');

    if (advBadge && report.retakeAdvisory) {
      advBadge.innerText = report.retakeAdvisory.recommended ? 'RETAKE ADVISORY' : 'VALIDATED';
      advBadge.className = `badge font-mono ${report.retakeAdvisory.recommended ? 'bg-danger' : 'bg-purple'}`;
      if (advTitle) advTitle.innerText = report.retakeAdvisory.action;
      if (advText) advText.innerText = report.explanation;
      if (advBox) {
        advBox.style.background = report.retakeAdvisory.recommended ? 'rgba(255, 75, 75, 0.15)' : 'rgba(138, 43, 226, 0.1)';
        advBox.style.borderColor = report.retakeAdvisory.recommended ? '#ff4b4b' : '#8a2be2';
      }
    }
  }

  /**
   * Render initial state
   */
  renderMockInitial() {
    this.renderHeatmap([
      { frameIndex: 1, status: 'valid', cepe: { confidencePct: 96.5 } },
      { frameIndex: 2, status: 'valid', cepe: { confidencePct: 97.1 } },
      { frameIndex: 3, status: 'valid', cepe: { confidencePct: 96.8 } },
      { frameIndex: 4, status: 'suspicious', cepe: { confidencePct: 88.2 } },
      { frameIndex: 5, status: 'rejected', cepe: { confidencePct: 48.0 } },
      { frameIndex: 6, status: 'valid', cepe: { confidencePct: 97.4 } },
      { frameIndex: 7, status: 'valid', cepe: { confidencePct: 96.9 } },
      { frameIndex: 8, status: 'valid', cepe: { confidencePct: 97.2 } },
      { frameIndex: 9, status: 'valid', cepe: { confidencePct: 97.5 } },
      { frameIndex: 10, status: 'valid', cepe: { confidencePct: 97.8 } }
    ]);
  }

  /**
   * Render Frame Quality Heatmap Grid
   */
  renderHeatmap(frames) {
    const grid = this.container.querySelector('#cmme-heatmap-grid');
    if (!grid) return;

    grid.innerHTML = frames.map(f => {
      let bg = '#38ef7d'; // Valid
      let border = '#11998e';
      let statusLbl = 'VALID';

      if (f.status === 'rejected') {
        bg = '#ff4b4b';
        border = '#c0392b';
        statusLbl = 'REJECTED';
      } else if (f.status === 'suspicious') {
        bg = '#f1c40f';
        border = '#d35400';
        statusLbl = 'SUSPICIOUS';
      }

      return `
        <div class="p-2 rounded text-center font-mono" style="flex: 1; min-width: 60px; background: rgba(255,255,255,0.05); border: 1.5px solid ${border};">
          <div class="small text-muted">F${f.frameIndex}</div>
          <div class="font-bold" style="color: ${bg}; font-size: 11px;">${statusLbl}</div>
          <div class="small text-muted" style="font-size: 9px;">${f.cepe?.confidencePct ? f.cepe.confidencePct.toFixed(0) + '%' : ''}</div>
        </div>
      `;
    }).join('');
  }

  /**
   * Render SVG Multi-Trace Line Charts
   */
  renderCharts(frames) {
    if (!frames || frames.length === 0) return;

    // SVG 1: Height vs Frame
    const heightSvg = this.container.querySelector('#cmme-chart-height-svg');
    if (heightSvg) {
      const points = frames.map((f, i) => {
        const x = 20 + i * (280 / Math.max(1, frames.length - 1));
        const y = 150 - Math.min(130, Math.max(10, (f.dimensions.height - 10) * 12));
        return `${x},${y}`;
      }).join(' ');

      heightSvg.innerHTML = `
        <polyline points="${points}" fill="none" stroke="#00f2fe" stroke-width="2.5" />
        ${frames.map((f, i) => {
          const x = 20 + i * (280 / Math.max(1, frames.length - 1));
          const y = 150 - Math.min(130, Math.max(10, (f.dimensions.height - 10) * 12));
          const color = f.status === 'rejected' ? '#ff4b4b' : '#00f2fe';
          return `<circle cx="${x}" cy="${y}" r="4" fill="${color}" />`;
        }).join('')}
      `;
    }

    // SVG 2: Confidence vs Frame
    const confSvg = this.container.querySelector('#cmme-chart-conf-svg');
    if (confSvg) {
      const points = frames.map((f, i) => {
        const x = 20 + i * (280 / Math.max(1, frames.length - 1));
        const y = 160 - ((f.cepe.confidencePct / 100) * 130);
        return `${x},${y}`;
      }).join(' ');

      confSvg.innerHTML = `
        <polyline points="${points}" fill="none" stroke="#8a2be2" stroke-width="2.5" />
        ${frames.map((f, i) => {
          const x = 20 + i * (280 / Math.max(1, frames.length - 1));
          const y = 160 - ((f.cepe.confidencePct / 100) * 130);
          const color = f.status === 'rejected' ? '#ff4b4b' : '#8a2be2';
          return `<circle cx="${x}" cy="${y}" r="4" fill="${color}" />`;
        }).join('')}
      `;
    }
  }

  /**
   * Render Statistical Matrix Table
   */
  renderStatsTable(stats) {
    const tbody = this.container.querySelector('#cmme-stats-tbody');
    if (!tbody || !stats) return;

    const rows = [
      { name: 'Height (m)', key: 'height' },
      { name: 'Distance (m)', key: 'distance' },
      { name: 'DBH (cm)', key: 'dbh' },
      { name: 'Biomass (kg)', key: 'biomass' },
      { name: 'Carbon (kg)', key: 'carbon' }
    ];

    tbody.innerHTML = rows.map(r => {
      const s = stats[r.key] || {};
      return `
        <tr>
          <td class="font-bold text-light">${r.name}</td>
          <td class="text-cyan font-bold">${s.weightedMean || 0}</td>
          <td>${s.mean || 0}</td>
          <td>${s.median || 0}</td>
          <td>${s.mode || 0}</td>
          <td>${s.stdDev || 0}</td>
          <td>${s.variance || 0}</td>
          <td>${s.cvPct || 0}%</td>
          <td class="text-teal">${s.ci95?.label || '±0.00'}</td>
        </tr>
      `;
    }).join('');
  }
}

// Export Singleton Instance
export const consensusUI = new ConsensusUI();
