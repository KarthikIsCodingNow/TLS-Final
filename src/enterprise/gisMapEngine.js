/**
 * PORTA-TLS Canvas Interactive GIS Spatial Mapping Module
 * Version 2.4 Architectural Baseline - Task 10 Extension
 */

export const GISMapEngine = {
  /**
   * Render interactive spatial GIS map on canvas (Requirement 3)
   * @param {HTMLCanvasElement} canvas Target GIS map canvas
   * @param {Array<object>} trees Array of registered tree records
   * @param {object} options Map rendering options { mode: 'satellite'|'terrain', enableClustering: true, showHeatmap: false }
   */
  renderMap(canvas, trees = [], options = {}) {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // 1. Draw Map Background (Satellite Dark / Terrain Topo)
    const isSatellite = options.mode !== 'terrain';
    ctx.fillStyle = isSatellite ? '#0f172a' : '#1e293b';
    ctx.fillRect(0, 0, w, h);

    // Draw Grid Lines (Latitude/Longitude Mercator grid)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 50) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 50) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    if (!trees || trees.length === 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '12px "Share Tech Mono"';
      ctx.fillText('NO GPS RECORDED TREES IN ACTIVE INVENTORY', 20, 30);
      return;
    }

    // Determine bounding Lat/Lon extent
    const lats = trees.map(t => t.lat || 37.7749);
    const lons = trees.map(t => t.lon || -122.4194);
    let minLat = Math.min(...lats);
    let maxLat = Math.max(...lats);
    let minLon = Math.min(...lons);
    let maxLon = Math.max(...lons);

    if (maxLat === minLat) { maxLat += 0.001; minLat -= 0.001; }
    if (maxLon === minLon) { maxLon += 0.001; minLon -= 0.001; }

    const mapToCanvas = (lat, lon) => {
      const x = ((lon - minLon) / (maxLon - minLon)) * (w - 80) + 40;
      const y = h - (((lat - minLat) / (maxLat - minLat)) * (h - 80) + 40);
      return { x: Math.round(x), y: Math.round(y) };
    };

    // 2. Render Species Heatmap Layer (if enabled)
    if (options.showHeatmap) {
      trees.forEach(t => {
        const pt = mapToCanvas(t.lat || minLat, t.lon || minLon);
        const grad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, 45);
        grad.addColorStop(0, 'rgba(0, 255, 204, 0.35)');
        grad.addColorStop(1, 'rgba(0, 255, 204, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 45, 0, 2 * Math.PI);
        ctx.fill();
      });
    }

    // 3. Render Tree GPS Markers & Spatial Clusters
    const clusterRadius = 30;
    const clusters = [];

    trees.forEach(t => {
      const pt = mapToCanvas(t.lat || minLat, t.lon || minLon);
      if (options.enableClustering) {
        let addedToCluster = false;
        for (let c of clusters) {
          const dist = Math.hypot(c.x - pt.x, c.y - pt.y);
          if (dist < clusterRadius) {
            c.count++;
            c.trees.push(t);
            addedToCluster = true;
            break;
          }
        }
        if (!addedToCluster) {
          clusters.push({ x: pt.x, y: pt.y, count: 1, trees: [t] });
        }
      } else {
        clusters.push({ x: pt.x, y: pt.y, count: 1, trees: [t] });
      }
    });

    clusters.forEach(c => {
      ctx.fillStyle = c.count > 1 ? '#00ffcc' : '#38bdf8';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.count > 1 ? 12 : 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      if (c.count > 1) {
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${c.count}`, c.x, c.y + 3);
      }
    });

    // Map Legend & Telemetry
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px "Rajdhani"';
    ctx.textAlign = 'left';
    ctx.fillText(`GIS SPATIAL MAP — ${trees.length} TREES (${options.mode?.toUpperCase() || 'SATELLITE'})`, 15, 20);
  }
};
