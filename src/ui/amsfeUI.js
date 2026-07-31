/**
 * amsfeUI.js - User Interface & Interactive Visualizer for AMSFE
 * 
 * Renders:
 * 1. Collapsible AMSFE Dashboard Panel
 * 2. Sensor Quality Scores & Dynamic Weight Progress Bars
 * 3. Outlier Rejection Alert Badges
 * 4. Animated Data Flow Diagram (Sensors → AMSFE → Fused Telemetry)
 * 5. Rolling History Trajectory Chart
 */

import { AMSFE } from '../fusion/fusionEngine.js';
import { measurementHistoryEngine } from '../fusion/measurementHistory.js';
import { fusionTelemetryEngine } from '../fusion/fusionTelemetry.js';

export class AMSFEUI {
  constructor() {
    this.container = null;
    this.animationFrameId = null;
    this.flowOffset = 0;
  }

  /**
   * Initialize and attach the AMSFE Panel to the target DOM container
   * @param {HTMLElement|string} parentSelector 
   */
  init(parentSelector = '#amsfe-workspace-container') {
    this.container = typeof parentSelector === 'string' ? document.querySelector(parentSelector) : parentSelector;
    if (!this.container) return;

    this.renderSkeleton();
    this.startFlowAnimation();
    this.update();
  }

  /**
   * Render the main skeleton structure
   */
  renderSkeleton() {
    this.container.innerHTML = `
      <div class="amsfe-panel card p-4 mb-4 border-teal shadow-lg">
        <!-- Header & Toggle Bar -->
        <div class="d-flex justify-content-between align-items-center mb-3 cursor-pointer" id="amsfe-header-toggle">
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-teal text-dark font-mono font-bold">AMSFE 1.0</span>
            <h5 class="m-0 text-cyan font-bold tracking-wide">ADAPTIVE MULTI-SENSOR FUSION ENGINE</h5>
          </div>
          <div class="d-flex align-items-center gap-3">
            <span class="text-muted small" id="amsfe-latency-badge">Latency: 0.0ms</span>
            <span class="text-teal small font-mono" id="amsfe-status-badge">● LIVE FUSION ACTIVE</span>
            <button class="btn btn-sm btn-outline-teal" id="amsfe-collapse-btn">Collapse ▲</button>
          </div>
        </div>

        <div id="amsfe-body-content">
          <!-- Flow Diagram Visualizer -->
          <div class="amsfe-flow-box p-3 bg-darker rounded mb-4 border-gray text-center">
            <div class="small text-muted mb-2 font-mono text-uppercase">Live Multi-Sensor Data Stream Flow</div>
            <svg id="amsfe-flow-svg" width="100%" height="110" viewBox="0 0 800 110" style="background: transparent;">
              <!-- Dynamic SVG flow diagram rendered in updateFlowSVG() -->
            </svg>
          </div>

          <!-- Grid Row: Sensor Scores & Weights -->
          <div class="row g-3 mb-4">
            <!-- Left: Dynamic Sensor Quality Scores -->
            <div class="col-md-6">
              <div class="p-3 bg-dark-card rounded border-gray h-100">
                <h6 class="text-teal font-mono mb-3">SENSOR QUALITY SCORES (DYNAMIC 0–100%)</h6>
                <div id="amsfe-quality-list" class="d-flex flex-column gap-2">
                  <!-- Rendered dynamically -->
                </div>
              </div>
            </div>

            <!-- Right: Adaptive Weights Distribution -->
            <div class="col-md-6">
              <div class="p-3 bg-dark-card rounded border-gray h-100">
                <h6 class="text-yellow font-mono mb-3">ADAPTIVE SENSOR WEIGHTS (∑ w_i = 1.0)</h6>
                <div id="amsfe-weights-list" class="d-flex flex-column gap-2">
                  <!-- Rendered dynamically -->
                </div>
              </div>
            </div>
          </div>

          <!-- Rejected Sensors & Outlier Alert Bar -->
          <div class="p-3 bg-darker rounded mb-4 border-red-subtle" id="amsfe-rejection-banner">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <span class="text-red font-bold font-mono">OUTLIER REJECTION FILTER (MAD / MODIFIED Z-SCORE):</span>
                <span class="ms-2 text-light" id="amsfe-rejection-text">None (All active sensors aligned)</span>
              </div>
              <span class="badge bg-secondary font-mono" id="amsfe-rejection-count">0 Rejected</span>
            </div>
          </div>

          <!-- Bottom Row: Fused Metrics & History Sparkline -->
          <div class="row g-3">
            <div class="col-md-4">
              <div class="p-3 bg-teal-subtle rounded border-teal">
                <div class="small text-muted font-mono">FUSED HEIGHT</div>
                <div class="fs-3 font-bold text-teal font-mono" id="amsfe-fused-height">0.00 m</div>
                <div class="small text-muted" id="amsfe-height-uncert">± 0.00m uncertainty</div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="p-3 bg-cyan-subtle rounded border-cyan">
                <div class="small text-muted font-mono">FUSED DBH</div>
                <div class="fs-3 font-bold text-cyan font-mono" id="amsfe-fused-dbh">0.0 cm</div>
                <div class="small text-muted" id="amsfe-dbh-uncert">± 0.0cm uncertainty</div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="p-3 bg-yellow-subtle rounded border-yellow">
                <div class="small text-muted font-mono">SYSTEM CONFIDENCE</div>
                <div class="fs-3 font-bold text-yellow font-mono" id="amsfe-fused-conf">0.0 %</div>
                <div class="small text-muted" id="amsfe-conf-level">High Precision Fused</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Attach collapse listener
    const toggleBtn = this.container.querySelector('#amsfe-collapse-btn');
    const headerToggle = this.container.querySelector('#amsfe-header-toggle');
    const bodyContent = this.container.querySelector('#amsfe-body-content');

    const toggleHandler = () => {
      const isHidden = bodyContent.style.display === 'none';
      bodyContent.style.display = isHidden ? 'block' : 'none';
      toggleBtn.innerText = isHidden ? 'Collapse ▲' : 'Expand ▼';
    };

    if (toggleBtn) toggleBtn.addEventListener('click', toggleHandler);
  }

  /**
   * Update the UI state with current AMSFE fused results
   */
  update() {
    const result = AMSFE.getLastResult();
    if (!result || !this.container) return;

    // 1. Latency & Status
    const latencyElem = this.container.querySelector('#amsfe-latency-badge');
    if (latencyElem) latencyElem.innerText = `Latency: ${result.latencyMs || 0.5}ms`;

    // 2. Quality Scores List
    const qualityContainer = this.container.querySelector('#amsfe-quality-list');
    if (qualityContainer) {
      const scores = result.sensorBreakdown || { manual: 92, ai: 95, clinometer: 90, marker: 96, pointcloud: 99 };
      qualityContainer.innerHTML = Object.entries(scores).map(([type, pct]) => `
        <div>
          <div class="d-flex justify-content-between small font-mono mb-1 text-light">
            <span class="text-uppercase">${type} SENSOR</span>
            <span>${pct.toFixed(1)}%</span>
          </div>
          <div class="progress" style="height: 6px; background: rgba(255,255,255,0.1);">
            <div class="progress-bar bg-teal" role="progressbar" style="width: ${pct}%;"></div>
          </div>
        </div>
      `).join('');
    }

    // 3. Adaptive Weights List
    const weightsContainer = this.container.querySelector('#amsfe-weights-list');
    if (weightsContainer) {
      const weights = result.weights || { ai: 0.26, manual: 0.21, marker: 0.29, clinometer: 0.18, pointcloud: 0.06 };
      weightsContainer.innerHTML = Object.entries(weights).map(([type, w]) => {
        const pct = (w * 100).toFixed(1);
        return `
          <div>
            <div class="d-flex justify-content-between small font-mono mb-1 text-light">
              <span class="text-uppercase">${type} WEIGHT</span>
              <span class="text-yellow font-bold">w = ${w.toFixed(2)} (${pct}%)</span>
            </div>
            <div class="progress" style="height: 6px; background: rgba(255,255,255,0.1);">
              <div class="progress-bar bg-warning" role="progressbar" style="width: ${pct}%;"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    // 4. Outlier Rejection Alert
    const rejectionText = this.container.querySelector('#amsfe-rejection-text');
    const rejectionCount = this.container.querySelector('#amsfe-rejection-count');
    const rejectedList = result.rejectedMeasurements || [];

    if (rejectionText && rejectionCount) {
      if (rejectedList.length === 0) {
        rejectionText.innerText = 'None (All sensor inputs aligned)';
        rejectionText.className = 'ms-2 text-teal-light';
        rejectionCount.innerText = '0 Rejected';
        rejectionCount.className = 'badge bg-success font-mono';
      } else {
        const descriptions = rejectedList.map(r => `${r.type.toUpperCase()} (${r.field}: ${r.value})`).join(', ');
        rejectionText.innerText = `REJECTED: ${descriptions}`;
        rejectionText.className = 'ms-2 text-danger font-bold';
        rejectionCount.innerText = `${rejectedList.length} REJECTED`;
        rejectionCount.className = 'badge bg-danger font-mono';
      }
    }

    // 5. Fused Results Cards
    const hElem = this.container.querySelector('#amsfe-fused-height');
    const hUncert = this.container.querySelector('#amsfe-height-uncert');
    if (hElem) hElem.innerText = `${(result.height || 0).toFixed(2)} m`;
    if (hUncert) hUncert.innerText = `± ${(result.uncertainty || 0.05).toFixed(2)}m uncertainty`;

    const dElem = this.container.querySelector('#amsfe-fused-dbh');
    const dUncert = this.container.querySelector('#amsfe-dbh-uncert');
    if (dElem) dElem.innerText = `${(result.dbh || 0).toFixed(1)} cm`;
    if (dUncert) dUncert.innerText = `± ${((result.uncertainty || 0.05) * 10).toFixed(1)}cm uncertainty`;

    const cElem = this.container.querySelector('#amsfe-fused-conf');
    if (cElem) cElem.innerText = `${((result.confidence || 0.95) * 100).toFixed(1)} %`;

    // 6. Update Flow Diagram SVG
    this.renderFlowSVG(result);
  }

  /**
   * Render SVG Flow Diagram (Sensors → AMSFE Core → Results)
   */
  renderFlowSVG(result) {
    const svg = this.container ? this.container.querySelector('#amsfe-flow-svg') : null;
    if (!svg) return;

    const sensorTypes = Object.keys(result.sensorBreakdown || { manual: 92, ai: 95, clinometer: 90, marker: 96, pointcloud: 99 });
    const numSensors = sensorTypes.length || 4;

    const sensorNodes = sensorTypes.map((st, i) => {
      const y = 15 + i * (80 / Math.max(1, numSensors - 1));
      const quality = result.sensorBreakdown[st] || 90;
      return `
        <g transform="translate(60, ${y})">
          <rect x="-50" y="-10" width="100" height="20" rx="4" fill="#1a2332" stroke="#00f2fe" stroke-width="1.5" />
          <text x="0" y="4" text-anchor="middle" fill="#00f2fe" font-size="10" font-family="monospace" font-weight="bold">${st.toUpperCase()} (${quality.toFixed(0)}%)</text>
        </g>
        <!-- Flow Line to AMSFE -->
        <path d="M 110 ${y} C 250 ${y}, 250 55, 380 55" stroke="#00f2fe" stroke-width="1.5" fill="none" stroke-dasharray="4 4" stroke-dashoffset="${-this.flowOffset}" />
      `;
    }).join('');

    const confPct = ((result.confidence || 0.95) * 100).toFixed(1);

    svg.innerHTML = `
      <!-- Left: Sensors Column -->
      ${sensorNodes}

      <!-- Center: AMSFE Central Core -->
      <g transform="translate(420, 55)">
        <polygon points="0,-35 45,0 0,35 -45,0" fill="#0d1b2a" stroke="#ffb703" stroke-width="2.5" />
        <text x="0" y="-4" text-anchor="middle" fill="#ffb703" font-size="11" font-family="monospace" font-weight="bold">AMSFE</text>
        <text x="0" y="10" text-anchor="middle" fill="#ffffff" font-size="9" font-family="monospace">CORE</text>
      </g>

      <!-- Flow Line from AMSFE to Output -->
      <path d="M 465 55 L 680 55" stroke="#ffb703" stroke-width="2" fill="none" stroke-dasharray="6 4" stroke-dashoffset="${-this.flowOffset * 1.5}" />

      <!-- Right: Fused Results Output -->
      <g transform="translate(730, 55)">
        <rect x="-50" y="-25" width="100" height="50" rx="6" fill="#14213d" stroke="#00f2fe" stroke-width="2" />
        <text x="0" y="-6" text-anchor="middle" fill="#00f2fe" font-size="11" font-family="monospace" font-weight="bold">FUSED RESULT</text>
        <text x="0" y="12" text-anchor="middle" fill="#ffb703" font-size="11" font-family="monospace" font-weight="bold">${confPct}% CONF</text>
      </g>
    `;
  }

  /**
   * Continuous animation loop for flow lines
   */
  startFlowAnimation() {
    const animate = () => {
      this.flowOffset = (this.flowOffset + 0.5) % 100;
      this.renderFlowSVG(AMSFE.getLastResult());
      this.animationFrameId = requestAnimationFrame(animate);
    };
    animate();
  }

  /**
   * Cleanup animation loop
   */
  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}

export const amsfeUI = new AMSFEUI();
