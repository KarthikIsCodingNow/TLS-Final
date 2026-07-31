/**
 * PORTA-TLS Cached DOM Selectors
 * Version 2.0 Architectural Baseline
 */

export const DOM = {
  // Page headers and overall shells
  get pageTitle() { return document.getElementById('page-title'); },
  get pageSubtitle() { return document.getElementById('page-subtitle'); },
  get appContainer() { return document.querySelector('.app-container'); },
  get sidebar() { return document.querySelector('.sidebar'); },
  get navItems() { return document.querySelectorAll('.nav-item, .mobile-nav-item'); },
  get viewSections() { return document.querySelectorAll('.view-section'); },
  
  // Sidebar actions
  get btnToggleSidebar() { return document.getElementById('btn-toggle-sidebar'); },
  get btnCloseSidebar() { return document.getElementById('btn-close-sidebar'); },
  get gpsDisplay() { return document.getElementById('gps-display'); },
  get gpsDot() { return document.querySelector('.gps-dot'); },

  // Header options
  get chkResearchMode() { return document.getElementById('chk-research-mode'); },

  // Dashboard Stats & Charts
  get statTreeCount() { return document.getElementById('stat-tree-count'); },
  get statTotalBiomass() { return document.getElementById('stat-total-biomass'); },
  get statTotalCo2() { return document.getElementById('stat-total-co2'); },
  get statAvgCo2() { return document.getElementById('stat-avg-co2'); },
  get eqDriving() { return document.getElementById('eq-driving'); },
  get eqPhones() { return document.getElementById('eq-phones'); },
  get eqFlights() { return document.getElementById('eq-flights'); },
  get speciesChartCanvas() { return document.getElementById('dashboardSpeciesChart'); },
  get dashboardRecentTableBody() { return document.querySelector('#dashboard-recent-table tbody'); },
  get btnAddTreeShortcut() { return document.getElementById('add-tree-shortcut-btn'); },
  get btnGotoInventory() { return document.getElementById('btn-goto-inventory'); },

  // Scanner Viewport & Video Controls
  get videoContainer() { return document.getElementById('video-container'); },
  get cameraFeed() { return document.getElementById('camera-feed'); },
  get scannerCanvas() { return document.getElementById('scanner-canvas'); },
  get lidarCanvas() { return document.getElementById('lidar-canvas'); },
  get cameraFallback() { return document.getElementById('camera-fallback'); },
  get imageUpload() { return document.getElementById('image-upload'); },

  // Scanner Viewport Actions
  get btnToggleView() { return document.getElementById('btn-toggle-view'); },
  get btnToggleMethod() { return document.getElementById('btn-toggle-method'); },
  get btnLockBase() { return document.getElementById('btn-lock-base'); },
  get btnLockTop() { return document.getElementById('btn-lock-top'); },
  get btnResetAngles() { return document.getElementById('btn-reset-angles'); },
  get btnUndoCalib() { return document.getElementById('btn-undo-calib'); },
  get btnToggleCv() { return document.getElementById('btn-toggle-cv'); },
  get btnSaveTree() { return document.getElementById('btn-save-tree'); },
  get btnHudLidar() { return document.getElementById('btn-hud-lidar'); },
  get btnHudOverrideDist() { return document.getElementById('btn-hud-override-dist'); },
  get hudOverrideDistVal() { return document.getElementById('hud-override-dist-val'); },
  
  // Angle labels on Scanner Viewport
  get baseAngleVal() { return document.getElementById('base-angle-val'); },
  get topAngleVal() { return document.getElementById('top-angle-val'); },
  get hudActiveModeLabel() { return document.getElementById('hud-active-mode-label'); },

  // Scanner Settings & Inputs
  get treeName() { return document.getElementById('tree-name'); },
  get treeSpecies() { return document.getElementById('tree-species'); },
  get customDensityGroup() { return document.getElementById('custom-density-group'); },
  get customDensityRange() { return document.getElementById('custom-density'); },
  get valCustomDensity() { return document.getElementById('val-custom-density'); },
  get cameraHeight() { return document.getElementById('camera-height'); },
  get groundSlope() { return document.getElementById('ground-slope'); },
  get chkOverrideDist() { return document.getElementById('chk-override-dist'); },
  get inpOverrideDist() { return document.getElementById('inp-override-dist'); },
  get overrideDistInputWrapper() { return document.getElementById('override-dist-input-wrapper'); },
  get manualDistanceWrapper() { return document.getElementById('manual-distance-wrapper'); },
  get manualDistance() { return document.getElementById('manual-distance'); },
  get referenceMarkerWrapper() { return document.getElementById('reference-marker-wrapper'); },
  get referenceSize() { return document.getElementById('reference-size'); },
  get referenceDist() { return document.getElementById('reference-dist'); },
  get lidarUploadWrapper() { return document.getElementById('lidar-upload-wrapper'); },
  get lidarFile() { return document.getElementById('lidar-file'); },
  get btnResetLidar() { return document.getElementById('btn-reset-lidar'); },
  get lidarFileStatus() { return document.getElementById('lidar-file-status'); },

  // IMU Filters & Sampling
  get pitchFilterMode() { return document.getElementById('pitch-filter-mode'); },
  get sampleFrameCount() { return document.getElementById('sample-frame-count'); },
  get btnTriggerSampling() { return document.getElementById('btn-trigger-sampling'); },
  get samplingProgressContainer() { return document.getElementById('sampling-progress-container'); },
  get samplingProgressPct() { return document.getElementById('sampling-progress-pct'); },
  get samplingProgressBar() { return document.getElementById('sampling-progress-bar'); },

  // Developer Diagnostics Panel
  get toggleDiagnostics() { return document.getElementById('toggle-diagnostics'); },
  get diagnosticsChevron() { return document.getElementById('diagnostics-chevron'); },
  get diagnosticsContent() { return document.getElementById('diagnostics-content'); },
  get diagCamFps() { return document.getElementById('diag-cam-fps'); },
  get diagAiFps() { return document.getElementById('diag-ai-fps'); },
  get diagRawPitch() { return document.getElementById('diag-raw-pitch'); },
  get diagFiltPitch() { return document.getElementById('diag-filt-pitch'); },
  get diagActiveEngine() { return document.getElementById('diag-active-engine'); },
  get diagCalibHfov() { return document.getElementById('diag-calib-hfov'); },
  get diagCalibVfov() { return document.getElementById('diag-calib-vfov'); },
  get diagDistErr() { return document.getElementById('diag-dist-err'); },
  get diagHeightErr() { return document.getElementById('diag-height-err'); },
  get diagDbhErr() { return document.getElementById('diag-dbh-err'); },
  get diagAgbErr() { return document.getElementById('diag-agb-err'); },
  get btnExportDiagnostics() { return document.getElementById('btn-export-diagnostics'); },

  // Scanner HUD Telemetry printout labels
  get hudPitchAll() { return document.querySelectorAll('#hud-pitch'); },
  get hudDistAll() { return document.querySelectorAll('#hud-dist'); },
  get hudHeightAll() { return document.querySelectorAll('#hud-height'); },
  get hudDbhAll() { return document.querySelectorAll('#hud-dbh'); },
  get liveAgbAll() { return document.querySelectorAll('#live-agb'); },
  get liveCo2All() { return document.querySelectorAll('#live-co2'); },

  // AI Scanner view
  get autoVideoContainer() { return document.getElementById('auto-video-container'); },
  get autoCameraFeed() { return document.getElementById('auto-camera-feed'); },
  get autoScannerCanvas() { return document.getElementById('auto-scanner-canvas'); },
  get autoLoadingOverlay() { return document.getElementById('auto-loading-overlay'); },
  get autoCameraFallback() { return document.getElementById('auto-camera-fallback'); },

  // AI Scanner controls
  get btnAutoToggleTracking() { return document.getElementById('btn-auto-toggle-tracking'); },
  get btnAutoToggleCv() { return document.getElementById('btn-auto-toggle-cv'); },
  get btnAutoSaveTree() { return document.getElementById('btn-auto-save-tree'); },
  get btnAutoHudLidar() { return document.getElementById('btn-auto-hud-lidar'); },
  get btnAutoHudDist() { return document.getElementById('btn-auto-hud-dist'); },
  get autoHudOverrideDistVal() { return document.getElementById('auto-hud-override-dist-val'); },
  
  // AI Settings & Inputs
  get autoTreeName() { return document.getElementById('auto-tree-name'); },
  get autoTreeSpecies() { return document.getElementById('auto-tree-species'); },
  get autoCustomDensityGroup() { return document.getElementById('auto-custom-density-group'); },
  get autoCustomDensityRange() { return document.getElementById('auto-custom-density'); },
  get autoValCustomDensity() { return document.getElementById('auto-val-custom-density'); },
  get autoTargetFilter() { return document.getElementById('auto-target-filter'); },
  get autoCameraHeight() { return document.getElementById('auto-camera-height'); },
  get autoConfidenceRange() { return document.getElementById('auto-confidence'); },
  get valAutoConfidence() { return document.getElementById('val-auto-confidence'); },
  get autoChkOverrideDist() { return document.getElementById('auto-chk-override-dist'); },
  get autoInpOverrideDist() { return document.getElementById('auto-inp-override-dist'); },
  get autoOverrideDistInputWrapper() { return document.getElementById('auto-override-dist-input-wrapper'); },

  // AI HUD Telemetry printouts
  get autoHudClass() { return document.getElementById('auto-hud-class'); },
  get autoHudDist() { return document.getElementById('auto-hud-dist'); },
  get autoHudHeight() { return document.getElementById('auto-hud-height'); },
  get autoHudDbh() { return document.getElementById('auto-hud-dbh'); },
  get autoLiveAgb() { return document.getElementById('auto-live-agb'); },
  get autoLiveCo2() { return document.getElementById('auto-live-co2'); },

  // Tree Registry table
  get inventorySearch() { return document.getElementById('inventory-search'); },
  get speciesFilter() { return document.getElementById('species-filter'); },
  get btnExportCsv() { return document.getElementById('btn-export-csv'); },
  get btnClearInventory() { return document.getElementById('btn-clear-inventory'); },
  get inventoryTableBody() { return document.getElementById('inventory-table-body'); },

  // Tree detail modal
  get treeDetailModal() { return document.getElementById('tree-detail-modal'); },
  get btnCloseModal() { return document.getElementById('btn-close-modal'); },
  get modalTreeId() { return document.getElementById('modal-tree-id'); },
  get modalTreeSpecies() { return document.getElementById('modal-tree-species'); },
  get modalTreeDensity() { return document.getElementById('modal-tree-density'); },
  get modalTreeHeight() { return document.getElementById('modal-tree-height'); },
  get modalTreeDbh() { return document.getElementById('modal-tree-dbh'); },
  get modalTreeAgb() { return document.getElementById('modal-tree-agb'); },
  get modalTreeCo2() { return document.getElementById('modal-tree-co2'); },
  get modalTreeGps() { return document.getElementById('modal-tree-gps'); },
  get modalTreeImage() { return document.getElementById('modal-tree-image'); },

  // Camera calibration form selectors
  get calibrationForm() { return document.getElementById('calibration-form'); },
  get calHfov() { return document.getElementById('cal-hfov'); },
  get calVfov() { return document.getElementById('cal-vfov'); },
  get calSensorW() { return document.getElementById('cal-sensor-w'); },
  get calSensorH() { return document.getElementById('cal-sensor-h'); },
  get calFocalLen() { return document.getElementById('cal-focal-len'); },
  get calCameraH() { return document.getElementById('cal-camera-h'); },
  get btnSaveCalibration() { return document.getElementById('btn-save-calibration'); },
  get btnResetCalibration() { return document.getElementById('btn-reset-calibration'); },

  // Visual Debugging & Edge Selectors
  get edgeKernelSelect() { return document.getElementById('edge-kernel-select'); },
  get hudGuidanceAlerts() { return document.getElementById('hud-guidance-alerts'); },
  get chkDbgMask() { return document.getElementById('chk-dbg-mask'); },
  get chkDbgEdges() { return document.getElementById('chk-dbg-edges'); },
  get chkDbgCenterline() { return document.getElementById('chk-dbg-centerline'); },
  get chkDbgPoly() { return document.getElementById('chk-dbg-poly'); },
  get chkDbgPoints() { return document.getElementById('chk-dbg-points'); },
  get chkDbgQualityMap() { return document.getElementById('chk-dbg-quality-map'); },
  get chkDbgTracking() { return document.getElementById('chk-dbg-tracking'); },

  // Validation Mode Selectors
  get chkValidationMode() { return document.getElementById('chk-validation-mode'); },
  get expProject() { return document.getElementById('exp-project'); },
  get expSite() { return document.getElementById('exp-site'); },
  get expOperator() { return document.getElementById('exp-operator'); },
  get expWeather() { return document.getElementById('exp-weather'); },
  get btnStartExp() { return document.getElementById('btn-start-exp'); },
  get btnEndExp() { return document.getElementById('btn-end-exp'); },
  
  get valGtHeight() { return document.getElementById('val-gt-height'); },
  get valGtDbh() { return document.getElementById('val-gt-dbh'); },
  
  get canvasRegression() { return document.getElementById('canvas-regression'); },
  get canvasBlandAltman() { return document.getElementById('canvas-bland-altman'); },
  
  get btnExportValData() { return document.getElementById('btn-export-val-data'); },
  get btnPrintValReport() { return document.getElementById('btn-print-val-report'); },
  get btnClearValDb() { return document.getElementById('btn-clear-val-db'); },
  
  get valStatRmseHeight() { return document.getElementById('val-stat-rmse-height'); },
  get valStatRmseDbh() { return document.getElementById('val-stat-rmse-dbh'); },
  get valStatBiasHeight() { return document.getElementById('val-stat-bias-height'); },
  get valStatBiasDbh() { return document.getElementById('val-stat-bias-dbh'); },
  get valStatRepeatability() { return document.getElementById('val-stat-repeatability'); },

  // Invention / Patent Mode Selectors
  get chkPatentMode() { return document.getElementById('chk-patent-mode'); },
  get explainabilityList() { return document.getElementById('explainability-list'); },
  get mriGauge() { return document.getElementById('mri-gauge'); },
  get tcsGauge() { return document.getElementById('tcs-gauge'); },
  get trunkClassifier() { return document.getElementById('trunk-classifier-type'); },
  get canopyClassifier() { return document.getElementById('canopy-classifier-type'); },
  get diagnosticsStatusList() { return document.getElementById('diagnostics-status-list'); },
  get learningStatsReadout() { return document.getElementById('learning-stats-readout'); },
  get btnExportPatentLogs() { return document.getElementById('btn-export-patent-logs'); },

  // Enterprise SaaS Selectors
  get selUserRole() { return document.getElementById('sel-user-role'); },
  get gisMapCanvas() { return document.getElementById('gis-map-canvas'); },
  get selGisMode() { return document.getElementById('sel-gis-mode'); },
  get chkGisHeatmap() { return document.getElementById('chk-gis-heatmap'); },
  get btnForceSync() { return document.getElementById('btn-force-sync'); },
  get syncStatusBadge() { return document.getElementById('sync-status-badge'); },
  get syncPendingCount() { return document.getElementById('sync-pending-count'); },
  get selBiomassPlugin() { return document.getElementById('sel-biomass-plugin'); },
  get auditConsoleOutput() { return document.getElementById('audit-console-output'); },
  get btnExportAuditLogs() { return document.getElementById('btn-export-audit-logs'); },

  // Task 7 Calibration & Scientific Analysis Selectors
  get wizDist() { return document.getElementById('wiz-dist'); },
  get wizWidth() { return document.getElementById('wiz-width'); },
  get wizHeight() { return document.getElementById('wiz-height'); },
  get btnRunFovWizard() { return document.getElementById('btn-run-fov-wizard'); },
  get wizResultReadout() { return document.getElementById('wiz-result-readout'); },
  get wizResHfov() { return document.getElementById('wiz-res-hfov'); },
  get wizResVfov() { return document.getElementById('wiz-res-vfov'); },
  get btnZeroImu() { return document.getElementById('btn-zero-imu'); },
  get btnProfileNoise() { return document.getElementById('btn-profile-noise'); },
  get biasPitchVal() { return document.getElementById('bias-pitch-val'); },
  get biasRollVal() { return document.getElementById('bias-roll-val'); },
  get biasCompassVal() { return document.getElementById('bias-compass-val'); },
  get noisePitchVal() { return document.getElementById('noise-pitch-val'); },
  get noiseRollVal() { return document.getElementById('noise-roll-val'); },
  get noiseYawVal() { return document.getElementById('noise-yaw-val'); },
  get diagSensStability() { return document.getElementById('diag-sens-stability'); },
  get diagAngleQuality() { return document.getElementById('diag-angle-quality'); },
  get diagLightingSharpness() { return document.getElementById('diag-lighting-sharpness'); },
  get sensDistPct() { return document.getElementById('sens-dist-pct'); },
  get sensPitchPct() { return document.getElementById('sens-pitch-pct'); },
  get sensHfovPct() { return document.getElementById('sens-hfov-pct'); },
  get sensAlignPct() { return document.getElementById('sens-align-pct'); },

  // Task 8 Advanced CV Selectors
  get chkAutoCaliperSnap() { return document.getElementById('chk-auto-caliper-snap'); },
  get chkDbgQualityOverlay() { return document.getElementById('chk-dbg-quality-overlay'); },

  // Task 9 Scientific Forestry Selectors
  get selDevicePreset() { return document.getElementById('sel-device-preset'); },
  get selBiomassModel() { return document.getElementById('sel-biomass-model'); },
  get selDbhGeometry() { return document.getElementById('sel-dbh-geometry'); },
  get selMeasurementMode() { return document.getElementById('sel-measurement-mode'); },

  // Task 10 Enterprise Selectors
  get btnExportGeojson() { return document.getElementById('btn-export-geojson'); }
};
