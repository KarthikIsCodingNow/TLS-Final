/**
 * PORTA-TLS Summary Chart Renderers (Vibrant Flat Design Theme)
 * Version 2.0 Architectural Baseline
 */
import { Logger } from '../core/logger.js';

// Flat Design vibrant palette for species categories
const FLAT_PALETTE = [
  '#3B82F6', // Digital Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#6366F1', // Indigo
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#8B5CF6', // Purple
  '#F97316'  // Orange
];

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
  const biomassData = labels.map(l => Math.round(stats[l] * 10) / 10);
  const bgColors = labels.map((_, idx) => FLAT_PALETTE[idx % FLAT_PALETTE.length]);

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
        backgroundColor: bgColors,
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false },
          ticks: { 
            color: '#4B5563', 
            font: { family: "'Outfit', sans-serif", weight: '600', size: 12 } 
          }
        },
        y: {
          grid: { color: '#E5E7EB', borderDash: [4, 4] },
          ticks: { 
            color: '#6B7280', 
            font: { family: "'Outfit', sans-serif", size: 11 },
            callback: (val) => val >= 1000 ? (val / 1000).toFixed(1) + 't' : val + ' kg'
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#111827',
          titleFont: { family: "'Outfit', sans-serif", weight: 'bold' },
          bodyFont: { family: "'JetBrains Mono', monospace" },
          padding: 12,
          cornerRadius: 6,
          callbacks: {
            label: (ctx) => ` Biomass: ${ctx.raw.toLocaleString()} kg AGB`
          }
        }
      }
    }
  });
}
