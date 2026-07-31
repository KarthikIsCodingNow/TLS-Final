/**
 * PORTA-TLS Patent & Research Workspace UI
 * Task 11: UI rendering engine for patent documentation, PQI, consensus, and versioned registries.
 */

import { proprietaryPipeline } from '../engines/proprietaryPipeline.js';
import { versionedEngineRegistry } from '../core/versionedEngineRegistry.js';
import { PatentDocEngine } from '../research/patentDocEngine.js';

export class PatentUI {
  constructor() {
    this.patentDocEngine = new PatentDocEngine();
    this.currentPipelineResult = null;
  }

  /**
   * Render Patent Workspace inside target container
   */
  render(container) {
    if (!container) return;

    // Run pipeline once to fetch baseline
    this.currentPipelineResult = proprietaryPipeline.executePipeline({});
    const res = this.currentPipelineResult.summary;

    const manifest = versionedEngineRegistry.getEngineManifest();

    container.innerHTML = `
      <div class="patent-workspace-container" style="padding: 20px; color: #e0e0e0; font-family: monospace;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; padding-bottom: 15px; margin-bottom: 20px;">
          <div>
            <h2 style="margin: 0; color: #4af6c6; font-size: 1.5rem; letter-spacing: 1px;">PATENT & INNOVATION WORKSPACE</h2>
            <p style="margin: 5px 0 0 0; color: #888; font-size: 0.85rem;">Task 11 Proprietary Measurement Engine & Scientific Patent Framework</p>
          </div>
          <button id="btn-run-pipeline" style="background: #4af6c6; color: #000; font-weight: bold; border: none; padding: 10px 18px; border-radius: 4px; cursor: pointer;">
            EXECUTE 13-STAGE PROPRIETARY PIPELINE
          </button>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
          <!-- Left Column: PQI & Validation Score -->
          <div style="background: #111; border: 1px solid #222; border-radius: 6px; padding: 18px;">
            <h3 style="margin-top: 0; color: #00d2ff; font-size: 1.1rem;">PROPRIETARY METRICS (PQI & VALIDATION)</h3>
            
            <div style="display: flex; gap: 20px; margin: 15px 0;">
              <div style="flex: 1; background: #1a1a1a; padding: 15px; border-radius: 4px; text-align: center; border-left: 4px solid #4af6c6;">
                <div style="font-size: 0.75rem; color: #aaa;">PORTA QUALITY INDEX (PQI)</div>
                <div id="pqi-value-display" style="font-size: 2.2rem; font-weight: bold; color: #4af6c6; margin: 5px 0;">${res.pqiScore.pqi} / 100</div>
                <div id="pqi-rating-display" style="font-size: 0.8rem; color: #888;">${res.pqiScore.rating}</div>
              </div>

              <div style="flex: 1; background: #1a1a1a; padding: 15px; border-radius: 4px; text-align: center; border-left: 4px solid #00d2ff;">
                <div style="font-size: 0.75rem; color: #aaa;">PROPRIETARY VALIDATION SCORE</div>
                <div id="val-value-display" style="font-size: 2.2rem; font-weight: bold; color: #00d2ff; margin: 5px 0;">${res.valScore.validationScore} / 100</div>
                <div id="val-status-display" style="font-size: 0.8rem; color: #888;">${res.valScore.status}</div>
              </div>
            </div>

            <!-- Digital Fingerprint -->
            <div style="background: #161616; padding: 12px; border-radius: 4px; border: 1px dashed #333; margin-top: 15px;">
              <div style="font-size: 0.75rem; color: #aaa; margin-bottom: 4px;">DIGITAL MEASUREMENT FINGERPRINT (SHA-256 EQUIV)</div>
              <div id="fingerprint-display" style="font-size: 0.85rem; color: #ffca28; word-break: break-all;">${res.fingerprint.fingerprint}</div>
            </div>
          </div>

          <!-- Right Column: Versioned Engine Registry -->
          <div style="background: #111; border: 1px solid #222; border-radius: 6px; padding: 18px;">
            <h3 style="margin-top: 0; color: #ffca28; font-size: 1.1rem;">VERSIONED COMPUTATIONAL ENGINES</h3>
            <div style="max-height: 220px; overflow-y: auto;">
              <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
                <thead>
                  <tr style="border-bottom: 1px solid #333; text-align: left; color: #888;">
                    <th style="padding: 6px;">ENGINE NAME</th>
                    <th style="padding: 6px;">VERSION</th>
                    <th style="padding: 6px;">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  ${manifest.map(item => `
                    <tr style="border-bottom: 1px solid #222;">
                      <td style="padding: 6px; color: #fff;">${item.name}</td>
                      <td style="padding: 6px; color: #4af6c6;">${item.version}</td>
                      <td style="padding: 6px; color: #00d2ff;">${item.metadata.patentStatus || 'ACTIVE'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 13-Stage Pipeline Execution Trace -->
        <div style="background: #111; border: 1px solid #222; border-radius: 6px; padding: 18px; margin-bottom: 25px;">
          <h3 style="margin-top: 0; color: #4af6c6; font-size: 1.1rem;">13-STAGE PROPRIETARY PIPELINE EXECUTION TRACE</h3>
          <div id="pipeline-trace-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px; max-height: 260px; overflow-y: auto; padding-right: 5px;">
            ${this.currentPipelineResult.stageTrace.map(st => `
              <div style="background: #181818; border: 1px solid #282828; padding: 10px; border-radius: 4px;">
                <div style="font-size: 0.75rem; color: #4af6c6; font-weight: bold;">STAGE ${st.stage}: ${st.name.toUpperCase()}</div>
                <div style="font-size: 0.75rem; color: #888; margin-top: 4px;">Output: ${JSON.stringify(st.output).substring(0, 75)}...</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Patent Specification Generator Action -->
        <div style="background: #111; border: 1px solid #222; border-radius: 6px; padding: 18px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h4 style="margin: 0; color: #fff;">AUTOMATED PATENT DOCUMENTATION GENERATOR</h4>
            <p style="margin: 4px 0 0 0; color: #888; font-size: 0.8rem;">Draft structured patent specification, equations, novel claims, and flow charts.</p>
          </div>
          <button id="btn-export-patent-doc" style="background: #00d2ff; color: #000; font-weight: bold; border: none; padding: 10px 18px; border-radius: 4px; cursor: pointer;">
            DOWNLOAD PATENT SPECIFICATION DRAFT (.MD)
          </button>
        </div>
      </div>
    `;

    this.attachEvents(container);
  }

  attachEvents(container) {
    const btnRun = container.querySelector('#btn-run-pipeline');
    if (btnRun) {
      btnRun.addEventListener('click', () => {
        this.currentPipelineResult = proprietaryPipeline.executePipeline({
          lightingLux: Math.floor(Math.random() * 400 + 300)
        });
        this.render(container);
      });
    }

    const btnExport = container.querySelector('#btn-export-patent-doc');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        const patentMd = this.patentDocEngine.generatePatentDocument();
        const blob = new Blob([patentMd], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PORTA_TLS_Patent_Specification_${new Date().toISOString().split('T')[0]}.md`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }
  }
}

export const patentUI = new PatentUI();
