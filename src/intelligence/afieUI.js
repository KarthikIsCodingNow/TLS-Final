/**
 * afieUI.js - UI Dashboard & SVG Visualizations for AFIE
 * 
 * Renders:
 * 1. Species & Environment Profile Cards
 * 2. Primary & Secondary Model Recommendation Badges
 * 3. Multi-Model Biomass Comparison SVG Bar Chart
 * 4. 1-Yr / 3-Yr / 5-Yr Growth Projection Table & SVG Trajectory Chart
 * 5. Species & Morphology Radar Fingerprint Charts
 * 6. Knowledge Rule Inferences & Actionable Recommendations List
 * 7. Decision Audit Log Table & CSV/JSON Export
 */

import { AFIE } from './adaptiveForestryEngine.js';

export class AfieUI {
  constructor() {
    this.container = null;
  }

  /**
   * Initialize and attach the AFIE Intelligence Dashboard panel to target DOM container
   * @param {HTMLElement|string} parentSelector 
   */
  init(parentSelector = '#afie-dashboard-container') {
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
      <div class="afie-dashboard-card card p-4 mb-4 border-teal shadow-lg" style="background: #09131d; border: 1.5px solid #00f2fe;">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-gray">
          <div class="d-flex align-items-center gap-3">
            <span class="badge font-mono font-bold fs-6" style="background: #00f2fe; color: #000;">AFIE 1.0</span>
            <div>
              <h5 class="m-0 text-light font-bold tracking-wide">ADAPTIVE FORESTRY INTELLIGENCE ENGINE</h5>
              <p class="m-0 text-muted small">Intelligent Multi-Model Biomass Fusion, Species Profiler & Growth Predictor</p>
            </div>
          </div>
          <div class="d-flex align-items-center gap-3">
            <div class="d-flex align-items-center gap-2">
              <span class="small font-mono text-muted">SPECIES:</span>
              <select id="afie-species-select" class="form-select form-select-sm bg-dark text-cyan border-teal font-mono" style="width: 220px;">
                <option value="neem" selected>Neem (Vepa) - A. indica</option>
                <option value="red_sanders">Red Sanders (Rakta Chandanam)</option>
                <option value="banyan">Banyan (Marri) - F. benghalensis</option>
                <option value="peepal">Peepal (Raavi) - F. religiosa</option>
                <option value="mango">Mango (Mamidi) - M. indica</option>
                <option value="tamarind">Tamarind (Chinta) - T. indica</option>
                <option value="amla">Amla (Usiri) - P. emblica</option>
                <option value="pongamia">Pongamia (Kanuga) - P. pinnata</option>
                <option value="jamun">Jamun (Neredu) - S. cumini</option>
                <option value="arjun">Arjun (Tella Maddhi) - T. arjuna</option>
                <option value="jackfruit">Jackfruit (Panasa) - A. heterophyllus</option>
                <option value="custard_apple">Custard Apple (Sitaphal)</option>
                <option value="teak">Teak (Teku) - T. grandis</option>
                <option value="casuarina">Casuarina (Sarugudu)</option>
                <option value="sandalwood">Sandalwood (Chandanam)</option>
                <option value="mahua">Mahua (Ippa) - M. longifolia</option>
                <option value="generic_hardwood">Generic AP Hardwood</option>
              </select>
            </div>
            <button id="btn-afie-recompute" class="btn btn-sm btn-cyan font-mono px-3 font-bold" style="background: #00f2fe; color: #000; border: none;">
              🧠 RE-EVALUATE INTELLIGENCE
            </button>
          </div>
        </div>

        <!-- Row 1: Species, Environment & Primary Model Summary -->
        <div class="row g-3 mb-4">
          <div class="col-md-4">
            <div class="p-3 bg-darker rounded border-gray h-100">
              <div class="small font-mono text-teal mb-1">SPECIES PROFILE</div>
              <h6 class="font-bold text-light m-0" id="afie-species-name">Teak (Tectona grandis)</h6>
              <div class="small text-muted font-mono mt-2" id="afie-wood-density">Wood Density: 0.65 g/cm³</div>
              <div class="small text-muted font-mono" id="afie-carbon-factor">Carbon Factor: 0.49</div>
              <div class="small text-muted font-mono" id="afie-species-region">Region: Tropical Asia</div>
            </div>
          </div>

          <div class="col-md-4">
            <div class="p-3 bg-darker rounded border-gray h-100">
              <div class="small font-mono text-cyan mb-1">ENVIRONMENT BIOME</div>
              <h6 class="font-bold text-light m-0" id="afie-biome-name">Tropical Moist Forest</h6>
              <div class="small text-muted font-mono mt-2" id="afie-climate-zone">Climate: Equatorial Humid</div>
              <div class="small text-muted font-mono" id="afie-gps-factors">Source: GPS Geo-Location</div>
              <div class="small text-muted font-mono" id="afie-biome-confidence">Classification Conf: 92.0%</div>
            </div>
          </div>

          <div class="col-md-4">
            <div class="p-3 bg-darker rounded border-gray h-100">
              <div class="small font-mono text-yellow mb-1">RECOMMENDED PRIMARY MODEL</div>
              <h6 class="font-bold text-yellow m-0" id="afie-primary-model">Chave et al. (2014)</h6>
              <div class="small text-muted font-mono mt-2" id="afie-model-agreement">Model Agreement: 97.2%</div>
              <div class="small text-muted font-mono" id="afie-equation-consistency">Equation Consistency: 100%</div>
              <div class="small text-muted font-mono" id="afie-biomass-confidence">Biomass Conf: 96.5%</div>
            </div>
          </div>
        </div>

        <!-- Multi-Model Biomass Comparison SVG Bar Chart -->
        <div class="mb-4 p-3 bg-darker rounded border-gray">
          <h6 class="text-teal font-mono mb-2">MULTI-MODEL BIOMASS COMPARISON & FUSION (KG)</h6>
          <div class="d-flex justify-content-center" style="min-height: 160px;">
            <svg id="afie-chart-biomass-svg" width="100%" height="160" viewBox="0 0 450 160"></svg>
          </div>
        </div>

        <!-- 1-Yr, 3-Yr, 5-Yr Growth Projection Table & Trajectory Chart -->
        <div class="row g-4 mb-4">
          <div class="col-md-6">
            <div class="p-3 bg-darker rounded border-gray h-100">
              <h6 class="text-cyan font-mono mb-3">MULTI-HORIZON GROWTH & CARBON PROJECTION</h6>
              <div class="table-responsive">
                <table class="table table-dark table-sm border-gray font-mono small mb-0 align-middle">
                  <thead>
                    <tr class="text-teal">
                      <th>HORIZON</th>
                      <th>HEIGHT</th>
                      <th>DBH</th>
                      <th>BIOMASS</th>
                      <th>CO₂ GAIN</th>
                    </tr>
                  </thead>
                  <tbody id="afie-growth-tbody">
                    <!-- Rendered dynamically -->
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="p-3 bg-darker rounded border-gray h-100">
              <h6 class="text-yellow font-mono mb-2">CARBON SEQUESTRATION TRAJECTORY (KG CO₂)</h6>
              <div class="d-flex justify-content-center" style="min-height: 160px;">
                <svg id="afie-chart-growth-svg" width="100%" height="160" viewBox="0 0 300 160"></svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Knowledge Engine Inferences & Recommendations -->
        <div class="row g-4 mb-4">
          <div class="col-md-6">
            <div class="p-3 bg-darker rounded border-gray h-100">
              <h6 class="text-purple font-mono mb-3">KNOWLEDGE ENGINE RULE INFERENCES</h6>
              <div id="afie-inferences-list" class="d-flex flex-column gap-2">
                <!-- Rendered dynamically -->
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="p-3 bg-darker rounded border-gray h-100">
              <h6 class="text-green font-mono mb-3">ACTIONABLE FIELD RECOMMENDATIONS</h6>
              <div id="afie-recommendations-list" class="d-flex flex-column gap-2">
                <!-- Rendered dynamically -->
              </div>
            </div>
          </div>
        </div>

        <!-- Immutable Decision Audit Log -->
        <div class="mb-4 p-3 bg-darker rounded border-gray">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="text-teal font-mono m-0">IMMUTABLE DECISION AUDIT LOG</h6>
            <button id="btn-afie-export-json" class="btn btn-sm btn-outline-cyan font-mono">EXPORT DECISION LOG JSON</button>
          </div>
          <div class="table-responsive" style="max-height: 150px; overflow-y: auto;">
            <table class="table table-dark table-sm border-gray font-mono small mb-0">
              <thead>
                <tr class="text-muted">
                  <th>LOG ID</th>
                  <th>TIMESTAMP</th>
                  <th>SPECIES</th>
                  <th>BIOME</th>
                  <th>PRIMARY MODEL</th>
                  <th>AGREEMENT %</th>
                </tr>
              </thead>
              <tbody id="afie-log-tbody">
                <!-- Rendered dynamically -->
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  }

  /**
   * Attach button & selector listeners
   */
  attachEventListeners() {
    const speciesSelect = this.container.querySelector('#afie-species-select');
    if (speciesSelect) {
      speciesSelect.addEventListener('change', (e) => {
        AFIE.processIntelligence({ speciesId: e.target.value });
        this.update();
      });
    }

    const btnReeval = this.container.querySelector('#btn-afie-recompute');
    if (btnReeval) {
      btnReeval.addEventListener('click', () => {
        const currentSp = this.container.querySelector('#afie-species-select')?.value || 'teak';
        AFIE.processIntelligence({ speciesId: currentSp });
        this.update();
      });
    }

    const btnJson = this.container.querySelector('#btn-afie-export-json');
    if (btnJson) {
      btnJson.addEventListener('click', () => {
        AFIE.decisionLogger.exportLogJSON();
      });
    }
  }

  /**
   * Update UI elements from latest AFIE report state
   */
  update() {
    let report = AFIE.getLatestReport();

    if (!report) {
      report = AFIE.processIntelligence({ speciesId: 'teak' });
    }

    if (!report) return;

    // 1. Species & Environment
    const spName = this.container.querySelector('#afie-species-name');
    if (spName) spName.innerText = `${report.species.commonName} (${report.species.scientificName})`;

    const woodDens = this.container.querySelector('#afie-wood-density');
    if (woodDens) woodDens.innerText = `Wood Density: ${report.species.woodDensity} g/cm³`;

    const carbFact = this.container.querySelector('#afie-carbon-factor');
    if (carbFact) carbFact.innerText = `Carbon Factor: ${report.species.carbonFactor}`;

    const spReg = this.container.querySelector('#afie-species-region');
    if (spReg) spReg.innerText = `Region: ${report.species.region}`;

    const biomeName = this.container.querySelector('#afie-biome-name');
    if (biomeName) biomeName.innerText = `${report.environment.biome} Forest`;

    const climateZone = this.container.querySelector('#afie-climate-zone');
    if (climateZone) climateZone.innerText = `Climate: ${report.environment.climateZone}`;

    // 2. Primary Model & Fusion Stats
    const priModel = this.container.querySelector('#afie-primary-model');
    if (priModel) priModel.innerText = report.models.primaryModel.name;

    const modAgr = this.container.querySelector('#afie-model-agreement');
    if (modAgr) modAgr.innerText = `Model Agreement: ${report.biomassFusion.modelAgreementPct}%`;

    const eqCon = this.container.querySelector('#afie-equation-consistency');
    if (eqCon) eqCon.innerText = `Equation Consistency: ${report.biomassFusion.equationConsistencyPct}%`;

    const bioConf = this.container.querySelector('#afie-biomass-confidence');
    if (bioConf) bioConf.innerText = `Biomass Conf: ${report.biomassFusion.biomassConfidencePct}%`;

    // 3. Multi-Model Biomass SVG Bar Chart
    this.renderBiomassChart(report.biomassFusion.models);

    // 4. Growth Projection Table & Graph
    this.renderGrowthTable(report.growthProjections);
    this.renderGrowthChart(report.growthProjections);

    // 5. Inferences & Recommendations
    this.renderInferences(report.knowledgeInferences);
    this.renderRecommendations(report.recommendations);

    // 6. Decision Log Table
    this.renderLogTable(AFIE.decisionLogger.getLogs());
  }

  /**
   * Render Multi-Model Biomass SVG Bar Chart
   */
  renderBiomassChart(models) {
    const svg = this.container.querySelector('#afie-chart-biomass-svg');
    if (!svg || !models) return;

    const maxAgb = Math.max(...models.map(m => m.agb), 100);

    svg.innerHTML = models.map((m, i) => {
      const x = 30 + i * 82;
      const barH = (m.agb / maxAgb) * 110;
      const y = 130 - barH;
      const color = m.isPrimary ? '#00f2fe' : '#8a2be2';

      return `
        <rect x="${x}" y="${y}" width="45" height="${barH}" rx="3" fill="${color}" opacity="0.85" />
        <text x="${x + 22}" y="${y - 6}" fill="#fff" font-size="10" text-anchor="middle" font-family="monospace">${m.agb}kg</text>
        <text x="${x + 22}" y="148" fill="#888" font-size="9" text-anchor="middle" font-family="monospace">${m.name.split(' ')[0]}</text>
      `;
    }).join('');
  }

  /**
   * Render Growth Table
   */
  renderGrowthTable(projections) {
    const tbody = this.container.querySelector('#afie-growth-tbody');
    if (!tbody || !projections) return;

    const list = [projections.horizon1Yr, projections.horizon3Yr, projections.horizon5Yr];

    tbody.innerHTML = list.map(p => `
      <tr>
        <td class="text-cyan font-bold">${p.label}</td>
        <td>${p.height} m</td>
        <td>${p.dbh} cm</td>
        <td class="text-yellow">${p.biomass} kg</td>
        <td class="text-green">+${p.carbonGain} kg</td>
      </tr>
    `).join('');
  }

  /**
   * Render Growth SVG Trajectory Chart
   */
  renderGrowthChart(projections) {
    const svg = this.container.querySelector('#afie-chart-growth-svg');
    if (!svg || !projections) return;

    const list = [
      { year: 0, carbon: projections.horizon1Yr.carbon - projections.annualSequestrationRate },
      { year: 1, carbon: projections.horizon1Yr.carbon },
      { year: 3, carbon: projections.horizon3Yr.carbon },
      { year: 5, carbon: projections.horizon5Yr.carbon }
    ];

    const maxC = list[3].carbon;
    const minC = list[0].carbon;
    const range = maxC - minC || 1;

    const points = list.map((item, i) => {
      const x = 25 + i * 80;
      const y = 140 - ((item.carbon - minC) / range) * 110;
      return `${x},${y}`;
    }).join(' ');

    svg.innerHTML = `
      <polyline points="${points}" fill="none" stroke="#38ef7d" stroke-width="2.5" />
      ${list.map((item, i) => {
        const x = 25 + i * 80;
        const y = 140 - ((item.carbon - minC) / range) * 110;
        return `
          <circle cx="${x}" cy="${y}" r="4" fill="#38ef7d" />
          <text x="${x}" y="${y - 8}" fill="#38ef7d" font-size="9" text-anchor="middle" font-family="monospace">${item.carbon.toFixed(0)}kg</text>
          <text x="${x}" y="155" fill="#888" font-size="9" text-anchor="middle" font-family="monospace">Yr ${item.year}</text>
        `;
      }).join('')}
    `;
  }

  /**
   * Render Knowledge Inferences List
   */
  renderInferences(inferences) {
    const list = this.container.querySelector('#afie-inferences-list');
    if (!list || !inferences) return;

    list.innerHTML = inferences.map(inf => `
      <div class="p-2 rounded bg-dark border-gray font-mono small">
        <div class="d-flex justify-content-between text-purple font-bold">
          <span>${inf.ruleId}: ${inf.condition}</span>
          <span class="badge bg-purple text-light">${inf.importance}</span>
        </div>
        <div class="text-light mt-1">${inf.action}</div>
      </div>
    `).join('');
  }

  /**
   * Render Actionable Recommendations List
   */
  renderRecommendations(recs) {
    const list = this.container.querySelector('#afie-recommendations-list');
    if (!list || !recs) return;

    list.innerHTML = recs.map(r => `
      <div class="p-2 rounded bg-dark border-gray font-mono small">
        <div class="d-flex justify-content-between text-green font-bold">
          <span>${r.title}</span>
          <span class="badge bg-green text-dark">${r.priority}</span>
        </div>
        <div class="text-muted mt-1">${r.text}</div>
      </div>
    `).join('');
  }

  /**
   * Render Decision Log Table
   */
  renderLogTable(logs) {
    const tbody = this.container.querySelector('#afie-log-tbody');
    if (!tbody || !logs) return;

    tbody.innerHTML = logs.map(l => `
      <tr>
        <td class="text-teal">${l.logId}</td>
        <td>${new Date(l.timestamp).toLocaleTimeString()}</td>
        <td>${l.species}</td>
        <td>${l.environment}</td>
        <td class="text-cyan">${l.primaryModel}</td>
        <td class="text-yellow">${l.modelAgreementPct}%</td>
      </tr>
    `).join('');
  }
}

// Export Singleton Instance
export const afieUI = new AfieUI();
