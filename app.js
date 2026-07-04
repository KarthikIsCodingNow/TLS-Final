const state = {
  trees: [],
  currentTab: 'dashboard',
  gps: {
    lat: null,
    lon: null,
    accuracy: null,
    status: 'LOCATING...'
  },
  camera: {
    stream: null,
    active: false,
    facingMode: 'environment',
    imageLoaded: false,
    uploadedImage: null
  },
  measurementMode: 'clinometer', // clinometer | manual | reference
  activeView: 'camera', // camera | lidar
  clinometer: {
    pitch: 0,
    baseAngle: null,
    topAngle: null,
    cameraHeight: 1.5, // meters
    distance: 5.0,
    height: 0.0
  },
  calibration: {
    left: 35,   // % from left
    right: 65,  // % from left
    top: 15,    // % from top
    base: 85    // % from top
  },
  calibrationHistory: [], // stack of previous calibration states for undo
  lidar: {
    spin: true,
    noise: false,
    points: [],
    rotationAngle: 0
  },
  charts: {
    species: null
  },
  edgeDetectionEnabled: true
};

const SPECIES_REGISTRY = {
  Oak: { name: 'Quercus (Oak)', density: 0.75 },
  Pine: { name: 'Pinus (Pine)', density: 0.45 },
  Maple: { name: 'Acer (Maple)', density: 0.65 },
  Birch: { name: 'Betula (Birch)', density: 0.60 },
  Eucalyptus: { name: 'Eucalyptus', density: 0.80 },
  Teak: { name: 'Teak', density: 0.66 }
};

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  // 1. Initialize clean slate registry
  loadInventory();

  // 2. Setup router
  setupRouter();

  // 3. Telemetry GPS
  setupGPS();

  // 4. Listeners setup
  setupEventListeners();

  // 5. Build touch-drag bindings on viewport canvas
  const canvas = document.getElementById('scanner-canvas');
  setupCanvasDragHandlers(canvas);

  // 6. Init Lidar
  initLidar();

  // 7. Render Charts
  renderDashboardCharts();

  lucide.createIcons();
  generateNextTreeId();

  // 8. Run loop animations
  requestAnimationFrame(scanRenderLoop);
  requestAnimationFrame(lidarRenderLoop);
}

/* ==========================================================================
   SPA ROUTER & COLLAPSIBLE MENU
   ========================================================================== */
function setupRouter() {
  const navItems = document.querySelectorAll('.nav-item, .mobile-nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = item.getAttribute('data-tab');
      switchTab(tab);
    });
  });

  const hash = window.location.hash.replace('#', '');
  if (['dashboard', 'scanner', 'inventory'].includes(hash)) {
    switchTab(hash);
  } else {
    switchTab('dashboard');
  }

  document.getElementById('add-tree-shortcut-btn').addEventListener('click', () => switchTab('scanner'));
  document.getElementById('btn-goto-inventory').addEventListener('click', () => switchTab('inventory'));
}

function switchTab(tabId) {
  state.currentTab = tabId;
  window.location.hash = tabId;

  document.querySelectorAll('.view-section').forEach(view => {
    view.classList.remove('active');
  });
  const activeView = document.getElementById(`${tabId}-view`);
  if (activeView) activeView.classList.add('active');

  document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(item => {
    if (item.getAttribute('data-tab') === tabId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Auto-close menu on tablet/mobile selection
  const sidebar = document.querySelector('.sidebar');
  if (sidebar && sidebar.classList.contains('active')) {
    sidebar.classList.remove('active');
  }

  const pageTitle = document.getElementById('page-title');
  const pageSubtitle = document.getElementById('page-subtitle');
  
  switch(tabId) {
    case 'dashboard':
      pageTitle.innerText = 'TELEMETRY DASHBOARD';
      pageSubtitle.innerText = 'Monochrome raw spatial forest logs.';
      updateDashboardTelemetry();
      renderDashboardCharts();
      stopCamera();
      break;
    case 'scanner':
      pageTitle.innerText = 'QUANTUM TLS SCANNER';
      pageSubtitle.innerText = 'Viewport dragging. Collapsible overlays.';
      startCamera();
      break;
    case 'inventory':
      pageTitle.innerText = 'TREE REGISTRY';
      pageSubtitle.innerText = 'Indexed physical tree structures.';
      renderInventoryTable();
      stopCamera();
      break;
  }
}

/* ==========================================================================
   GPS TELEMETRY
   ========================================================================== */
function setupGPS() {
  const gpsDisplay = document.getElementById('gps-display');
  const gpsDot = document.querySelector('.gps-dot');

  if (!navigator.geolocation) {
    state.gps.status = 'NOT SUPPORTED';
    gpsDisplay.innerText = 'UNSUPPORTED';
    gpsDot.classList.remove('active');
    return;
  }

  navigator.geolocation.watchPosition(
    (position) => {
      state.gps.lat = position.coords.latitude;
      state.gps.lon = position.coords.longitude;
      state.gps.accuracy = position.coords.accuracy;
      state.gps.status = 'CONNECTED';
      gpsDisplay.innerText = `${state.gps.lat.toFixed(5)}, ${state.gps.lon.toFixed(5)}`;
      gpsDot.classList.add('active');
    },
    (err) => {
      state.gps.status = 'MOCK POSITION';
      state.gps.lat = 41.21318;
      state.gps.lon = -124.00462;
      gpsDisplay.innerText = `41.21318, -124.00462 (MOCK)`;
      gpsDot.classList.add('active');
    },
    { enableHighAccuracy: true }
  );
}

/* ==========================================================================
   DYNAMIC VIEWPORT ASPECT RATIO SIZING (NO SKEWING)
   ========================================================================== */
function adjustViewportAspectRatio() {
  const container = document.getElementById('video-container');
  if (!container) return;

  const video = document.getElementById('camera-feed');
  const img = state.camera.uploadedImage;
  
  let rawW = 0;
  let rawH = 0;

  if (state.camera.active && video && video.videoWidth && video.videoHeight) {
    rawW = video.videoWidth;
    rawH = video.videoHeight;
  } else if (state.camera.imageLoaded && img && img.naturalWidth && img.naturalHeight) {
    rawW = img.naturalWidth;
    rawH = img.naturalHeight;
  }

  if (rawW > 0 && rawH > 0) {
    const aspect = rawH / rawW;
    const clientW = container.clientWidth;
    
    // Set container height dynamically
    container.style.height = (clientW * aspect) + 'px';
  }
}

/* ==========================================================================
   CAMERA CONTROL
   ========================================================================== */
async function startCamera() {
  if (state.camera.active) return;
  const video = document.getElementById('camera-feed');
  const fallback = document.getElementById('camera-fallback');

  try {
    const constraints = {
      video: { facingMode: state.camera.facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    };
    state.camera.stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = state.camera.stream;
    video.style.display = 'block';
    fallback.style.display = 'none';
    state.camera.active = true;
    state.camera.imageLoaded = false;
    
    // Listen for metadata load to adjust aspect ratio right away
    video.onloadedmetadata = () => {
      adjustViewportAspectRatio();
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }
  } catch (err) {
    console.warn('Camera inaccessible, loading static fallback:', err);
    video.style.display = 'none';
    fallback.style.display = 'flex';
    state.camera.active = false;
  }
}

function stopCamera() {
  if (!state.camera.active) return;
  const video = document.getElementById('camera-feed');
  if (video && video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }
  state.camera.active = false;
  window.removeEventListener('deviceorientation', handleOrientation);
}

function handleOrientation(e) {
  let pitch = 0;
  if (e.beta !== null) {
    pitch = e.beta - 90; // vertical calibration
  }
  state.clinometer.pitch = Math.max(-90, Math.min(90, pitch));
  document.querySelectorAll('#hud-pitch').forEach(el => {
    el.innerText = `${state.clinometer.pitch.toFixed(1)}°`;
  });
  calculateTreeDimensions();
}

/* ==========================================================================
   DIRECT VIEWPORT TOUCH DRAG CALIPERS
   ========================================================================== */
function setupCanvasDragHandlers(canvas) {
  let activeGuide = null;

  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // Scale pixel coords based on canvas size
    const mx = ((clientX - rect.left) / rect.width) * canvas.width;
    const my = ((clientY - rect.top) / rect.height) * canvas.height;
    return { x: mx, y: my };
  }

  function handleStart(e) {
    if (!state.camera.active && !state.camera.imageLoaded) return;

    const pos = getMousePos(e);
    const w = canvas.width;
    const h = canvas.height;

    const leftX = w * (state.calibration.left / 100);
    const rightX = w * (state.calibration.right / 100);
    const topY = h * (state.calibration.top / 100);
    const baseY = h * (state.calibration.base / 100);

    const grabRange = 25; // touch tolerance in pixels

    const dLeft = Math.abs(pos.x - leftX);
    const dRight = Math.abs(pos.x - rightX);
    const dTop = Math.abs(pos.y - topY);
    const dBase = Math.abs(pos.y - baseY);

    const guides = [
      { key: 'left', dist: dLeft },
      { key: 'right', dist: dRight },
      { key: 'top', dist: dTop },
      { key: 'base', dist: dBase }
    ];

    guides.sort((a, b) => a.dist - b.dist);

    if (guides[0].dist < grabRange) {
      activeGuide = guides[0].key;
      pushCalibrationState(); // save current state before moving line
      e.preventDefault();
    }
  }

  function handleMove(e) {
    if (!activeGuide) return;

    const pos = getMousePos(e);
    const w = canvas.width;
    const h = canvas.height;

    if (activeGuide === 'left') {
      const pct = (pos.x / w) * 100;
      state.calibration.left = Math.max(0, Math.min(state.calibration.right - 2, pct));
    } else if (activeGuide === 'right') {
      const pct = (pos.x / w) * 100;
      state.calibration.right = Math.max(state.calibration.left + 2, Math.min(100, pct));
    } else if (activeGuide === 'top') {
      const pct = (pos.y / h) * 100;
      state.calibration.top = Math.max(0, Math.min(state.calibration.base - 2, pct));
    } else if (activeGuide === 'base') {
      const pct = (pos.y / h) * 100;
      state.calibration.base = Math.max(state.calibration.top + 2, Math.min(100, pct));
    }

    calculateTreeDimensions();
    
    // Regenerate Lidar points dynamically
    const dbh = parseFloat(document.getElementById('hud-dbh').innerText) || 20;
    generateLidarPoints(state.clinometer.height, dbh);
    
    e.preventDefault();
  }

  function handleEnd() {
    activeGuide = null;
  }

  canvas.addEventListener('mousedown', handleStart);
  canvas.addEventListener('mousemove', handleMove);
  window.addEventListener('mouseup', handleEnd);

  canvas.addEventListener('touchstart', handleStart, { passive: false });
  canvas.addEventListener('touchmove', handleMove, { passive: false });
  window.addEventListener('touchend', handleEnd);
}

/* ==========================================================================
   CALIBRATION UNDO STATE STACK
   ========================================================================== */
function pushCalibrationState() {
  state.calibrationHistory.push({ ...state.calibration });
  
  if (state.calibrationHistory.length > 15) {
    state.calibrationHistory.shift();
  }
  document.getElementById('btn-undo-calib').disabled = false;
}

function undoCalibration() {
  if (state.calibrationHistory.length > 0) {
    const prevState = state.calibrationHistory.pop();
    state.calibration = { ...prevState };

    calculateTreeDimensions();
    
    const dbh = parseFloat(document.getElementById('hud-dbh').innerText) || 20;
    generateLidarPoints(state.clinometer.height, dbh);

    if (state.calibrationHistory.length === 0) {
      document.getElementById('btn-undo-calib').disabled = true;
    }
  }
}

/* ==========================================================================
   MATHEMATICAL CALCULATIONS
   ========================================================================== */
function calculateTreeDimensions() {
  const mode = state.measurementMode;
  let height = 0.0;
  let distance = state.clinometer.distance;
  let dbh = 0.0;

  if (mode === 'clinometer') {
    const baseRad = state.clinometer.baseAngle * (Math.PI / 180);
    const topRad = state.clinometer.topAngle * (Math.PI / 180);
    const camH = 1.5; // defaults eye-level

    if (state.clinometer.baseAngle !== null && state.clinometer.baseAngle < 0) {
      distance = camH / Math.tan(Math.abs(baseRad));
      state.clinometer.distance = distance;
    }

    if (state.clinometer.baseAngle !== null && state.clinometer.topAngle !== null) {
      height = distance * (Math.tan(topRad) - Math.tan(baseRad));
    } else if (state.clinometer.baseAngle !== null) {
      const liveTopRad = state.clinometer.pitch * (Math.PI / 180);
      height = distance * (Math.tan(liveTopRad) - Math.tan(baseRad));
    }
  } 
  else if (mode === 'reference') {
    const refSizeCm = parseFloat(document.getElementById('reference-size').value) || 29.7;
    const refDist = parseFloat(document.getElementById('reference-dist').value) || 5.0;
    distance = refDist;
    state.clinometer.distance = distance;

    const span = Math.abs(state.calibration.base - state.calibration.top);
    if (span > 1) {
      const scale = (refSizeCm / 100) / span;
      height = 100 * scale;
    }
  } 
  else if (mode === 'manual') {
    const manualDist = parseFloat(document.getElementById('manual-distance').value) || 5.0;
    distance = manualDist;
    state.clinometer.distance = distance;

    const vfov = 45 * (Math.PI / 180);
    const frameH = 2 * distance * Math.tan(vfov / 2);
    const spanFraction = (state.calibration.base - state.calibration.top) / 100;
    height = frameH * spanFraction;
  }

  height = Math.max(0.1, height);
  state.clinometer.height = height;

  // DBH trigonometry formula
  const hfov = 60 * (Math.PI / 180);
  const frameW = 2 * distance * Math.tan(hfov / 2);
  const spanW = (state.calibration.right - state.calibration.left) / 100;
  dbh = Math.max(1.0, (frameW * spanW) * 100);

  // Update stats table and HUD
  document.querySelectorAll('#hud-dist').forEach(el => el.innerText = `${distance.toFixed(1)}m`);
  document.querySelectorAll('#hud-height').forEach(el => el.innerText = `${height.toFixed(2)}m`);
  document.querySelectorAll('#hud-dbh').forEach(el => el.innerText = `${dbh.toFixed(1)}cm`);

  // Compute AGB Biomass & Carbon
  calculateBiomassAndCarbon(height, dbh);
}

function calculateBiomassAndCarbon(height, dbh) {
  const species = document.getElementById('tree-species').value;
  let density = 0.50;

  if (species === 'Custom') {
    density = parseFloat(document.getElementById('custom-density').value) || 0.50;
  } else if (SPECIES_REGISTRY[species]) {
    density = SPECIES_REGISTRY[species].density;
  }

  const agb = 0.0673 * Math.pow((density * Math.pow(dbh, 2) * height), 0.976);
  const co2 = agb * 0.5 * 3.67;

  document.querySelectorAll('#live-agb').forEach(el => el.innerText = agb.toFixed(1));
  document.querySelectorAll('#live-co2').forEach(el => el.innerText = co2.toFixed(1));
}

/* ==========================================================================
   REAL-TIME SCAN BUFFER DRAW LOOPS
   ========================================================================== */
function scanRenderLoop() {
  if (state.currentTab !== 'scanner' || state.activeView !== 'camera') {
    requestAnimationFrame(scanRenderLoop);
    return;
  }

  const video = document.getElementById('camera-feed');
  const canvas = document.getElementById('scanner-canvas');
  const ctx = canvas.getContext('2d');

  if (state.camera.active && video.readyState === video.HAVE_ENOUGH_DATA) {
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      adjustViewportAspectRatio(); // recalculate aspect on change
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (state.edgeDetectionEnabled) {
      applyMonochromeEdgeEnhancement(canvas, ctx);
    }
  } else if (state.camera.imageLoaded && state.camera.uploadedImage) {
    const img = state.camera.uploadedImage;
    if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      adjustViewportAspectRatio();
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    if (state.edgeDetectionEnabled) {
      applyMonochromeEdgeEnhancement(canvas, ctx);
    }
  }

  drawCADCalipers(canvas, ctx);
  requestAnimationFrame(scanRenderLoop);
}

function applyMonochromeEdgeEnhancement(canvas, ctx) {
  const w = canvas.width;
  const h = canvas.height;
  const dw = 320;
  const dh = Math.round(320 * (h / w));
  
  const offscreen = document.createElement('canvas');
  offscreen.width = dw;
  offscreen.height = dh;
  const octx = offscreen.getContext('2d');
  octx.drawImage(canvas, 0, 0, dw, dh);
  const data = octx.getImageData(0, 0, dw, dh).data;
  const edgeBuffer = octx.createImageData(dw, dh);
  const edgeData = edgeBuffer.data;

  for (let y = 0; y < dh; y++) {
    for (let x = 1; x < dw - 1; x++) {
      const idx = (y * dw + x) * 4;
      const idxLeft = (y * dw + (x - 1)) * 4;
      const idxRight = (y * dw + (x + 1)) * 4;

      const l = 0.3 * data[idx] + 0.59 * data[idx+1] + 0.11 * data[idx+2];
      const lLeft = 0.3 * data[idxLeft] + 0.59 * data[idxLeft+1] + 0.11 * data[idxLeft+2];
      const lRight = 0.3 * data[idxRight] + 0.59 * data[idxRight+1] + 0.11 * data[idxRight+2];

      const edge = Math.abs(lRight - lLeft);
      const val = edge > 15 ? Math.min(255, edge * 2.5) : 0;

      edgeData[idx] = 255;
      edgeData[idx+1] = 255;
      edgeData[idx+2] = 255;
      edgeData[idx+3] = val > 0 ? 100 : 0;
    }
  }

  octx.putImageData(edgeBuffer, 0, 0);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.drawImage(offscreen, 0, 0, w, h);
  ctx.restore();
}

function drawCADCalipers(canvas, ctx) {
  const w = canvas.width;
  const h = canvas.height;

  const leftX = w * (state.calibration.left / 100);
  const rightX = w * (state.calibration.right / 100);
  const topY = h * (state.calibration.top / 100);
  const baseY = h * (state.calibration.base / 100);

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  
  ctx.beginPath();
  ctx.setLineDash([4, 4]);
  ctx.moveTo(leftX, 0); ctx.lineTo(leftX, h);
  ctx.moveTo(rightX, 0); ctx.lineTo(rightX, h);
  ctx.moveTo(0, topY); ctx.lineTo(w, topY);
  ctx.moveTo(0, baseY); ctx.lineTo(w, baseY);
  ctx.stroke();
  ctx.setLineDash([]); 

  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.strokeRect(leftX, topY, rightX - leftX, baseY - topY);

  ctx.fillStyle = '#000000';
  ctx.fillRect(leftX + 4, topY + 4, 60, 14);
  ctx.strokeStyle = '#ffffff';
  ctx.strokeRect(leftX + 4, topY + 4, 60, 14);
  ctx.fillStyle = '#ffffff';
  ctx.font = '9px monospace';
  ctx.fillText('TRUNK REG', leftX + 8, topY + 14);
}

/* ==========================================================================
   3D LIDAR SIMULATOR
   ========================================================================== */
function initLidar() {
  generateLidarPoints(6.0, 30.0);
}

function generateLidarPoints(height, dbh) {
  const points = [];
  const rTrunk = dbh / 200;
  const trunkH = height * 0.35;
  const pointQty = 500;

  const trunkQty = Math.round(pointQty * 0.4);
  for (let i = 0; i < trunkQty; i++) {
    const py = Math.random() * trunkH;
    const angle = Math.random() * Math.PI * 2;
    const px = Math.cos(angle) * rTrunk;
    const pz = Math.sin(angle) * rTrunk;
    points.push({ x: px, y: py, z: pz, type: 'trunk' });
  }

  const canopyQty = Math.round(pointQty * 0.6);
  const canopyH = height - trunkH;
  for (let i = 0; i < canopyQty; i++) {
    const yFract = Math.random();
    const py = trunkH + (yFract * canopyH);
    const maxR = height * 0.22;
    const rCanopy = (1 - yFract) * maxR;
    const angle = Math.random() * Math.PI * 2;
    const px = Math.cos(angle) * rCanopy;
    const pz = Math.sin(angle) * rCanopy;
    points.push({ x: px, y: py, z: pz, type: 'foliage' });
  }

  state.lidar.points = points;
}

function lidarRenderLoop() {
  if (state.currentTab !== 'scanner' || state.activeView !== 'lidar') {
    requestAnimationFrame(lidarRenderLoop);
    return;
  }

  const canvas = document.getElementById('lidar-canvas');
  const ctx = canvas.getContext('2d');
  
  // Set dimensions based on current container size
  const w = canvas.width = canvas.parentElement.clientWidth;
  const h = canvas.height = canvas.parentElement.clientHeight;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  for (let i = 20; i < w; i += 20) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
  }
  for (let i = 20; i < h; i += 20) {
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
  }

  if (state.lidar.spin) {
    state.lidar.rotationAngle += 0.012;
  }

  const points = state.lidar.points;
  const angle = state.lidar.rotationAngle;
  const sinA = Math.sin(angle);
  const cosA = Math.cos(angle);

  const fov = 260;
  const cameraDist = 8;
  const cx = w / 2;
  const cy = h - 40;

  const projected = points.map(pt => {
    const rotX = pt.x * cosA - pt.z * sinA;
    const rotZ = pt.x * sinA + pt.z * cosA;
    const scale = 25;
    
    const sx = rotX * scale;
    const sy = pt.y * scale;
    const sz = rotZ * scale;

    const zDepth = sz + (cameraDist * scale);
    const px = cx + (sx * fov) / zDepth;
    const py = cy - (sy * fov) / zDepth;

    return { x: px, y: py, z: zDepth, type: pt.type };
  });

  projected.sort((a, b) => b.z - a.z);

  projected.forEach(pt => {
    if (pt.y < 0 || pt.y > h || pt.x < 0 || pt.x > w) return;
    const size = Math.max(1, 90 / pt.z);

    if (pt.type === 'trunk') {
      ctx.fillStyle = 'rgba(150, 150, 150, 0.6)';
    } else {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.3, 200 / pt.z)})`;
    }

    ctx.beginPath();
    ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame(lidarRenderLoop);
}

/* ==========================================================================
   EVENT HANDLERS & LISTENERS
   ========================================================================== */
function setupEventListeners() {
  // 1. Collapsible Hamburger Menu Listeners
  const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
  const btnCloseSidebar = document.getElementById('btn-close-sidebar');
  const sidebar = document.querySelector('.sidebar');
  const appContainer = document.querySelector('.app-container');

  btnToggleSidebar.addEventListener('click', () => {
    // If screen is wider than 1024px, toggle desktop grid collapse. Else, toggle mobile drawer slide-in
    if (window.innerWidth > 1024) {
      appContainer.classList.toggle('sidebar-collapsed');
    } else {
      sidebar.classList.toggle('active');
    }
  });

  btnCloseSidebar.addEventListener('click', () => {
    sidebar.classList.remove('active');
  });

  // Window resize to align viewport aspect ratio
  window.addEventListener('resize', () => {
    if (state.camera.active) {
      adjustViewportAspectRatio();
    } else if (state.camera.imageLoaded && state.camera.uploadedImage) {
      adjustViewportAspectRatio();
    }
  });

  // 2. Viewport switching (Camera vs 3D LiDAR)
  const btnToggleView = document.getElementById('btn-toggle-view');
  btnToggleView.addEventListener('click', () => {
    const cameraFeed = document.getElementById('camera-feed');
    const scannerCanvas = document.getElementById('scanner-canvas');
    const lidarCanvas = document.getElementById('lidar-canvas');

    if (state.activeView === 'camera') {
      state.activeView = 'lidar';
      cameraFeed.style.display = 'none';
      scannerCanvas.style.display = 'none';
      lidarCanvas.style.display = 'block';
      btnToggleView.classList.add('active');
    } else {
      state.activeView = 'camera';
      if (state.camera.active) {
        cameraFeed.style.display = 'block';
      }
      scannerCanvas.style.display = 'block';
      lidarCanvas.style.display = 'none';
      btnToggleView.classList.remove('active');
    }
    adjustViewportAspectRatio(); // force layout sync
  });

  // 3. Switch Mode
  const btnToggleMethod = document.getElementById('btn-toggle-method');
  btnToggleMethod.addEventListener('click', () => {
    const label = document.getElementById('hud-active-mode-label');
    const clinoWrap = document.getElementById('clinometer-controls-wrapper');
    const manualWrap = document.getElementById('manual-distance-wrapper');
    const refWrap = document.getElementById('reference-marker-wrapper');

    if (state.measurementMode === 'clinometer') {
      state.measurementMode = 'manual';
      label.innerText = 'MANUAL DIST';
      clinoWrap.style.display = 'none';
      manualWrap.style.display = 'block';
      refWrap.style.display = 'none';
    } else if (state.measurementMode === 'manual') {
      state.measurementMode = 'reference';
      label.innerText = 'REF MARKER';
      clinoWrap.style.display = 'none';
      manualWrap.style.display = 'none';
      refWrap.style.display = 'block';
    } else {
      state.measurementMode = 'clinometer';
      label.innerText = 'CLINOMETER';
      clinoWrap.style.display = 'block';
      manualWrap.style.display = 'none';
      refWrap.style.display = 'none';
    }
    calculateTreeDimensions();
  });

  // 4. Clinometer lock / reset
  const btnLockBase = document.getElementById('btn-lock-base');
  const btnLockTop = document.getElementById('btn-lock-top');
  const btnResetAngles = document.getElementById('btn-reset-angles');

  btnLockBase.addEventListener('click', () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().catch(console.error);
    }
    state.clinometer.baseAngle = state.clinometer.pitch;
    document.getElementById('base-angle-val').innerText = `${state.clinometer.baseAngle.toFixed(1)}°`;
    btnLockBase.disabled = true;
    btnLockTop.disabled = false;
    calculateTreeDimensions();
  });

  btnLockTop.addEventListener('click', () => {
    state.clinometer.topAngle = state.clinometer.pitch;
    document.getElementById('top-angle-val').innerText = `${state.clinometer.topAngle.toFixed(1)}°`;
    btnLockTop.disabled = true;
    calculateTreeDimensions();
    generateLidarPoints(state.clinometer.height, parseFloat(document.getElementById('hud-dbh').innerText) || 20);
  });

  btnResetAngles.addEventListener('click', () => {
    state.clinometer.baseAngle = null;
    state.clinometer.topAngle = null;
    document.getElementById('base-angle-val').innerText = '--';
    document.getElementById('top-angle-val').innerText = '--';
    btnLockBase.disabled = false;
    btnLockTop.disabled = true;
    calculateTreeDimensions();
  });

  // 5. Calibration Undo
  document.getElementById('btn-undo-calib').addEventListener('click', undoCalibration);

  // 6. CV Edges Switch
  const btnToggleCV = document.getElementById('btn-toggle-cv');
  btnToggleCV.addEventListener('click', () => {
    state.edgeDetectionEnabled = !state.edgeDetectionEnabled;
    btnToggleCV.classList.toggle('active');
  });

  // 7. Image Fallback
  const fileInput = document.getElementById('image-upload');
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        state.camera.uploadedImage = img;
        state.camera.imageLoaded = true;
        document.getElementById('camera-fallback').style.display = 'none';
        document.getElementById('camera-feed').style.display = 'none';

        // default manual distance fallback
        state.measurementMode = 'manual';
        document.getElementById('hud-active-mode-label').innerText = 'MANUAL DIST';
        document.getElementById('clinometer-controls-wrapper').style.display = 'none';
        document.getElementById('manual-distance-wrapper').style.display = 'block';
        document.getElementById('reference-marker-wrapper').style.display = 'none';

        adjustViewportAspectRatio();
        calculateTreeDimensions();
        generateLidarPoints(state.clinometer.height, parseFloat(document.getElementById('hud-dbh').innerText) || 20);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  // 8. Inputs / Settings changes
  document.getElementById('manual-distance').addEventListener('input', calculateTreeDimensions);
  document.getElementById('reference-size').addEventListener('input', calculateTreeDimensions);
  document.getElementById('reference-dist').addEventListener('input', calculateTreeDimensions);

  const speciesSelect = document.getElementById('tree-species');
  speciesSelect.addEventListener('change', () => {
    const grp = document.getElementById('custom-density-group');
    if (speciesSelect.value === 'Custom') {
      grp.style.display = 'block';
    } else {
      grp.style.display = 'none';
    }
    calculateTreeDimensions();
  });

  const densitySlider = document.getElementById('custom-density');
  densitySlider.addEventListener('input', () => {
    document.getElementById('val-custom-density').innerText = densitySlider.value;
    calculateTreeDimensions();
  });

  // 9. Save Index Scan
  document.getElementById('btn-save-tree').addEventListener('click', (e) => {
    e.preventDefault();
    saveTreeRecord();
  });

  // 10. Registry list actions
  document.getElementById('inventory-search').addEventListener('input', renderInventoryTable);
  document.getElementById('species-filter').addEventListener('change', renderInventoryTable);
  document.getElementById('btn-export-csv').addEventListener('click', exportInventoryToCSV);
  document.getElementById('btn-clear-inventory').addEventListener('click', clearInventoryDatabase);

  // 11. Modal close
  document.getElementById('btn-close-modal').addEventListener('click', () => {
    document.getElementById('tree-detail-modal').classList.remove('active');
  });
}

/* ==========================================================================
   LOCAL STORAGE PERSISTENCE (EMPTY STATE)
   ========================================================================== */
function loadInventory() {
  try {
    const raw = localStorage.getItem('qt_tls_inventory');
    if (raw) {
      state.trees = JSON.parse(raw);
    } else {
      state.trees = [];
      saveInventoryToStorage();
    }
  } catch (err) {
    console.error('Failed loading storage:', err);
    state.trees = [];
  }
}

function saveInventoryToStorage() {
  try {
    localStorage.setItem('qt_tls_inventory', JSON.stringify(state.trees));
  } catch (err) {
    console.error('Failed saving storage:', err);
  }
}

function generateNextTreeId() {
  let max = 0;
  state.trees.forEach(t => {
    const match = t.id.match(/^TR-(\d+)$/);
    if (match) {
      const num = parseInt(match[1]);
      if (num > max) max = num;
    }
  });
  document.getElementById('tree-name').value = `TR-${String(max + 1).padStart(3, '0')}`;
}

function saveTreeRecord() {
  const treeId = document.getElementById('tree-name').value.trim();
  const species = document.getElementById('tree-species').value;
  const dbh = parseFloat(document.getElementById('hud-dbh').innerText);
  const height = state.clinometer.height;
  const agb = parseFloat(document.getElementById('live-agb').innerText);
  const co2 = parseFloat(document.getElementById('live-co2').innerText);

  if (!treeId) {
    alert('Please enter a Tree ID.');
    return;
  }

  if (state.trees.some(t => t.id.toLowerCase() === treeId.toLowerCase())) {
    alert(`Tree ID ${treeId} already exists in database.`);
    return;
  }

  // Draw snapshot thumbnail
  const canvas = document.getElementById('scanner-canvas');
  let thumb = null;
  if (canvas && (state.camera.active || state.camera.imageLoaded)) {
    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = 80;
    thumbCanvas.height = 60;
    const tctx = thumbCanvas.getContext('2d');
    tctx.drawImage(canvas, 0, 0, 80, 60);
    thumb = thumbCanvas.toDataURL('image/jpeg', 0.6);
  }

  const record = {
    id: treeId,
    species: species,
    height: parseFloat(height.toFixed(2)),
    dbh: parseFloat(dbh.toFixed(1)),
    agb: parseFloat(agb.toFixed(1)),
    co2: parseFloat(co2.toFixed(1)),
    lat: state.gps.lat,
    lon: state.gps.lon,
    timestamp: new Date().toISOString(),
    image: thumb
  };

  state.trees.unshift(record);
  saveInventoryToStorage();

  alert(`Recorded scan as ID: ${treeId}`);
  generateNextTreeId();
  updateDashboardTelemetry();
  switchTab('inventory');
}

window.deleteTreeRecord = function(treeId) {
  if (confirm(`Confirm permanent deletion of ${treeId}?`)) {
    state.trees = state.trees.filter(t => t.id !== treeId);
    saveInventoryToStorage();
    renderInventoryTable();
    updateDashboardTelemetry();
  }
};

function clearInventoryDatabase() {
  if (confirm('Purge all logged tree registry records?')) {
    state.trees = [];
    saveInventoryToStorage();
    renderInventoryTable();
    updateDashboardTelemetry();
  }
}

/* ==========================================================================
   UI DATA RENDERING
   ========================================================================== */
function updateDashboardTelemetry() {
  const count = state.trees.length;
  let biomass = 0.0;
  let co2 = 0.0;

  state.trees.forEach(t => {
    biomass += t.agb;
    co2 += t.co2;
  });

  const avg = count > 0 ? co2 / count : 0.0;

  document.getElementById('stat-tree-count').innerText = count;
  document.getElementById('stat-total-biomass').innerText = biomass.toFixed(1);
  document.getElementById('stat-total-co2').innerText = co2.toFixed(1);
  document.getElementById('stat-avg-co2').innerText = avg.toFixed(1);

  // Equivalents
  document.getElementById('eq-driving').innerText = `${(co2 * 4.0).toFixed(1)} km`;
  document.getElementById('eq-phones').innerText = Math.round(co2 * 121.0).toLocaleString();
  document.getElementById('eq-flights').innerText = (co2 * 0.002).toFixed(3);

  // Recent 5 rows
  const tbody = document.getElementById('dashboard-recent-table').querySelector('tbody');
  tbody.innerHTML = '';

  const recent = state.trees.slice(0, 5);
  if (recent.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="8">No logs loaded. Go to the Laser Scanner to index a tree.</td></tr>`;
    return;
  }

  recent.forEach(t => {
    const time = new Date(t.timestamp).toLocaleTimeString();
    const loc = (t.lat && t.lon) ? `${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}` : 'Offline GPS';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${t.id}</strong></td>
      <td>${t.species}</td>
      <td>${t.height.toFixed(2)}m</td>
      <td>${t.dbh.toFixed(1)}cm</td>
      <td>${t.agb.toFixed(1)}kg</td>
      <td style="text-decoration:underline;">${t.co2.toFixed(1)}kg</td>
      <td>${loc}</td>
      <td style="color:var(--text-dimmed);">${time}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderInventoryTable() {
  const query = document.getElementById('inventory-search').value.toLowerCase();
  const filter = document.getElementById('species-filter').value;
  const tbody = document.getElementById('inventory-table-body');
  tbody.innerHTML = '';

  const filtered = state.trees.filter(t => {
    const matchesSearch = t.id.toLowerCase().includes(query) || t.species.toLowerCase().includes(query);
    const matchesFilter = filter === 'All' || t.species.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="10">No records found. Run a Laser Scan.</td></tr>`;
    return;
  }

  filtered.forEach(t => {
    const date = new Date(t.timestamp).toLocaleDateString();
    const gps = (t.lat && t.lon) ? `<a class="gps-link-btn" target="_blank" href="https://www.google.com/maps/search/?api=1&query=${t.lat},${t.lon}">${t.lat.toFixed(5)}, ${t.lon.toFixed(5)}</a>` : 'Offline';
    const img = t.image ? `<img class="table-thumb" src="${t.image}">` : `<div class="table-thumb" style="display:flex;align-items:center;justify-content:center;"><i data-lucide="trees" style="width:14px;color:var(--text-dimmed);"></i></div>`;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${img}</td>
      <td><strong>${t.id}</strong></td>
      <td><span class="badge">${t.species}</span></td>
      <td>${t.height.toFixed(2)}m</td>
      <td>${t.dbh.toFixed(1)}cm</td>
      <td>${t.agb.toFixed(1)}kg</td>
      <td style="font-weight:700;">${t.co2.toFixed(1)}kg</td>
      <td>${gps}</td>
      <td style="color:var(--text-dimmed);">${date}</td>
      <td class="actions-col">
        <div class="action-buttons">
          <button class="btn-icon btn-sm" onclick="showTreeDetails('${t.id}')">
            <i data-lucide="eye" style="width:12px;height:12px;"></i>
          </button>
          <button class="btn-icon btn-sm" onclick="deleteTreeRecord('${t.id}')" style="color:var(--text-dimmed);">
            <i data-lucide="trash-2" style="width:12px;height:12px;"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
  lucide.createIcons();
}

window.showTreeDetails = function(treeId) {
  const tree = state.trees.find(t => t.id === treeId);
  if (!tree) return;

  document.getElementById('modal-tree-id').innerText = tree.id;
  document.getElementById('modal-tree-species').innerText = tree.species;
  
  const density = SPECIES_REGISTRY[tree.species] ? SPECIES_REGISTRY[tree.species].density : 0.50;
  document.getElementById('modal-tree-density').innerText = density.toFixed(2);
  
  document.getElementById('modal-tree-height').innerText = `${tree.height.toFixed(2)} m`;
  document.getElementById('modal-tree-dbh').innerText = `${tree.dbh.toFixed(1)} cm`;
  document.getElementById('modal-tree-agb').innerText = `${tree.agb.toFixed(1)} kg`;
  document.getElementById('modal-tree-co2').innerText = `${tree.co2.toFixed(1)} kg`;

  if (tree.lat && tree.lon) {
    document.getElementById('modal-tree-gps').innerText = `${tree.lat.toFixed(6)}, ${tree.lon.toFixed(6)}`;
  } else {
    document.getElementById('modal-tree-gps').innerText = 'GPS coordinates unavailable';
  }

  const imgEl = document.getElementById('modal-tree-image');
  if (tree.image) {
    imgEl.src = tree.image;
    imgEl.style.display = 'block';
  } else {
    imgEl.src = '';
    imgEl.style.display = 'none';
  }

  document.getElementById('tree-detail-modal').classList.add('active');
  lucide.createIcons();
};

/* ==========================================================================
   EXPORT & UTILS
   ========================================================================== */
function exportInventoryToCSV() {
  if (state.trees.length === 0) {
    alert('Database empty.');
    return;
  }

  const headers = ['Tree ID', 'Species', 'Height (m)', 'DBH (cm)', 'AGB (kg)', 'CO2 (kg)', 'Lat', 'Lon', 'Timestamp'];
  let csv = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n';
  
  state.trees.forEach(t => {
    csv += `"${t.id}","${t.species}",${t.height},${t.dbh},${t.agb},${t.co2},${t.lat||''},${t.lon||''},"${t.timestamp}"\n`;
  });

  const uri = encodeURI(csv);
  const link = document.createElement('a');
  link.setAttribute('href', uri);
  link.setAttribute('download', `QT_TLS_Registry_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* ==========================================================================
   CHARTS (MONOCHROME REDESIGN)
   ========================================================================== */
function renderDashboardCharts() {
  if (state.currentTab !== 'dashboard') return;
  const canvas = document.getElementById('dashboardSpeciesChart');
  if (!canvas) return;

  const stats = {};
  state.trees.forEach(t => {
    if (!stats[t.species]) stats[t.species] = 0.0;
    stats[t.species] += t.agb;
  });

  const labels = Object.keys(stats);
  const biomassData = labels.map(l => stats[l]);

  if (state.charts.species) {
    state.charts.species.destroy();
  }

  state.charts.species = new Chart(canvas, {
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
