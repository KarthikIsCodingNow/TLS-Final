/**
 * PORTA-TLS Summary Chart Renderers (Monochrome theme)
 * Version 2.0 Architectural Baseline
 */
import { Logger } from '../core/logger.js';

/**
 * Render species biomass accumulation bar chart via Chart.js
 * @param {HTMLCanvasElement} canvas The destination canvas
 * @param {object[]} trees The list of trees
 * @param {any} currentChartInstance The existing chart instance to destroy (if any)
 * @returns {any} The new Chart instance
 */
export function renderSpeciesBiomassChart(canvas, trees, currentChartInstance) {
  Logger.info('Updating species biomass chart');
  
  if (!canvas) {
    Logger.warn('Dashboard species chart canvas reference not provided');
    return null;
  }

  if (typeof Chart === 'undefined') {
    Logger.error('Chart.js library not loaded. Ensure CDN script exists in index.html.');
    return null;
  }

  // Aggregate biomass (AGB) per taxonomic family species
  const stats = {};
  trees.forEach(t => {
    if (!stats[t.species]) stats[t.species] = 0.0;
    stats[t.species] += t.agb;
  });

  const labels = Object.keys(stats);
  const biomassData = labels.map(l => stats[l]);

  // Clean up existing instance
  if (currentChartInstance) {
    Logger.debug('Destroying old species chart instance');
    currentChartInstance.destroy();
  }

  // Create new chart instance
  return new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Sum Dry Biomass (kg AGB)',
        data: biomassData,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        borderColor: '#ffffff',
        borderWidth: 1,
        borderRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.07)' },
          ticks: { color: '#ffffff', font: { family: 'Share Tech Mono' } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.07)' },
          ticks: { color: '#ffffff', font: { family: 'Share Tech Mono' } }
        }
      },
      plugins: {
        legend: {
          labels: { color: '#ffffff', font: { family: 'Share Tech Mono' } }
        }
      }
    }
  });
}
