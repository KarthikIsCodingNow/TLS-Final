# QuantumTree TLS — Terrestrial Laser Scanner Simulator

A deployable, high-fidelity mobile-friendly web application that simulates a Terrestrial Laser Scanner (TLS) for forestry telemetry. Point your device camera at a tree to detect its boundaries, estimate its trunk thickness (DBH) and height, differentiate it within a database, and calculate its Above-Ground Biomass (AGB) and corresponding ecological CO₂ absorption.

---

## Technical Specifications & Mathematical Models

### 1. Distance & Height Estimation (Clinometer Method)
The height of a tree ($H$) is calculated using sensor fusion from the device's tilt (accelerometer/gyroscope) and the observer's eye-height ($h_c$):

1. **Horizontal Distance ($D$)** is calculated by pointing the camera at the base of the trunk ($\theta_{base}$ below the horizontal plane):
   $$D = \frac{h_c}{\tan(|\theta_{base}|)}$$

2. **Total Height ($H$)** is calculated by locking the base angle ($\theta_{base}$) and top angle ($\theta_{top}$ pointing at the canopy tip):
   $$H = D \times (\tan(\theta_{top}) - \tan(\theta_{base}))$$

> [!NOTE]
> If device sensors are unavailable, the user can manually enter the physical distance ($D$) or use a reference marker for scaling.

### 2. Trunk Diameter (DBH) Estimation
Trunk thickness or Diameter at Breast Height (DBH) is estimated using the angular pixel width of the trunk guidelines and the camera's Horizontal Field of View ($\text{HFOV} \approx 60^\circ$):

$$\text{DBH (meters)} = 2 \times D \times \tan\left(\frac{w_{\text{trunk\_pixels}}}{W_{\text{frame\_pixels}}} \times \frac{\text{HFOV}}{2}\right)$$

### 3. Above-Ground Biomass (AGB) and CO₂ absorption
To translate dimensions to ecological metrics, we implement the pan-tropical allometric equation derived by **Chave et al. (2014)**:

$$AGB = 0.0673 \times (\rho \times \text{DBH}^2 \times H)^{0.976}$$

- $AGB$: Above Ground Dry Biomass in kilograms (kg)
- $\rho$: Dry Wood Density ($g/\text{cm}^3$)
- $\text{DBH}$: Trunk Diameter at Breast Height in centimeters ($\text{cm}$)
- $H$: Tree Height in meters ($m$)

**CO₂ Offset Equivalent:**
Approximately $50\%$ of dry biomass is stored Carbon ($C$). Using molecular weight ratios ($CO_2 / C \approx 3.67$):
$$\text{CO}_2 \text{ offset (kg)} = AGB \times 0.5 \times 3.67 \approx AGB \times 1.835$$

---

## Key Features

1. **Interactive Scanner HUD**: High-fidelity dashboard displaying live pitch angle, calculated ranges, and real-time vertical edge CV highlights.
2. **Real-time 3D LiDAR Visualizer**: Renders a spinning 3D particle point cloud simulating a terrestrial laser scanner.
3. **SPA Navigation Layout**:
   - **Dashboard**: High-level telemetry logs (Total dry biomass, carbon sequestration, and equivalency metrics).
   - **Inventory System**: Differentiates trees using ID, Species classification, GPS location, and thumbnail capture. Supports CSV downloads.
   - **Analytics Charts**: Renders scatter distributions (Height vs DBH) and species breakdown charts using Chart.js.

---

## Installation & Running Locally

Since the application uses browser APIs (Camera, Geolocation, DeviceOrientation), it **must be run on a secure server context** (`localhost` or `https://` domain) to activate camera streams and motion sensors.

### Quick Start with Node.js
If you have Node.js installed, run:
```bash
npx serve .
```
Open the provided local IP on your mobile browser (ensure your phone and computer are on the same Wi-Fi network).

### Quick Start with Python
Alternatively, start a local server using Python:
```bash
python -m http.server 8000
```
Open `http://localhost:8000` in your desktop browser, or input your computer's local IP address (e.g. `http://192.168.1.X:8000`) in your mobile browser.
# TLSCAD
