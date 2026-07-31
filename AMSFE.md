# Adaptive Multi-Sensor Fusion Engine (AMSFE)

**Version**: 1.0.0-PROPRIETARY  
**Architecture Status**: Authoritative Central Measurement Engine for Porta-TLS  

---

## 1. Overview & Architecture Statement

The **Adaptive Multi-Sensor Fusion Engine (AMSFE)** is the central measurement architecture of Porta-TLS. Instead of calculating isolated measurements independently across manual mode, AI CV mode, clinometer mode, reference marker mode, or LiDAR point clouds, **every measurement produced anywhere in Porta-TLS passes through AMSFE**.

```
                           +------------------------+
                           |     Camera & Video     |
                           +-----------+------------+
                                       |
  +---------------+--------------------+--------------------+---------------+
  |               |                    |                    |               |
  v               v                    v                    v               v
+----+     +--------------+   +------------------+   +------------+   +------------+
| AI |     | Edge/Contour |   | Manual Calipers  |   | Clinometer |   | Reference  |
| CV |     | Segmentation |   | & Override Dist  |   | IMU Pitch  |   | Marker 2D  |
+--+-+     +------+-------+   +--------+---------+   +-----+------+   +-----+------+
   |              |                    |                   |                |
   +--------------+--------------------+-------------------+----------------+
                                       |
                                       v
                     +------------------------------------+
                     |                GPS                 |
                     |         LiDAR Point Cloud          |
                     +-----------------+------------------+
                                       |
                                       v
                    ========================================
                    ADAPTIVE MULTI-SENSOR FUSION ENGINE (AMSFE)
                    ========================================
                                       |
                                       v
                    +--------------------------------------+
                    |          AUTHORITATIVE FUSED OUTPUT  |
                    |  • Fused Height (m)                  |
                    |  • Fused DBH (cm)                    |
                    |  • Fused Range / Distance (m)        |
                    |  • Dry Biomass (kg AGB)              |
                    |  • CO2 Sequestration (kg)            |
                    |  • System Confidence (%)             |
                    |  • Uncertainty Bounds (± sigma)      |
                    +--------------------------------------+
```

---

## 2. Fusion Execution Pipeline

The execution sequence follows an 8-stage pipeline:

1. **Measurement Collection**:
   Gathers standardized sensor object readings from all registered measurement sources:
   ```typescript
   interface SensorMeasurement {
     type: 'manual' | 'ai' | 'clinometer' | 'marker' | 'pointcloud' | 'gps' | string;
     height?: number;
     distance?: number;
     dbh?: number;
     confidence: number;
     timestamp: number;
     metadata?: Record<string, any>;
   }
   ```

2. **Quality Scoring**:
   Evaluates a dynamic 0.0 to 1.0 quality score per active sensor taking into account:
   - Camera IMU stability (pitch noise variance)
   - Ambient lighting quality
   - Image contour sharpness
   - AI confidence score
   - Bounding box aspect stability
   - GPS accuracy (meters)
   - Target distance penalty (optical blur past 15m)
   - Measurement freshness / age exponential decay (\(e^{-0.2 \cdot \Delta t}\))

3. **Validation & Normalization**:
   Rejects invalid, missing, or zero values and normalizes units into standard SI metric bounds (\(\text{meters}\), \(\text{centimeters}\), \(\text{seconds}\)).

4. **Statistical Outlier Detection (MAD & Modified Z-Score)**:
   Calculates the Median Absolute Deviation (MAD) across valid measurements:
   $$\text{MAD} = \text{median}\left(|x_i - \text{median}(x)|\right)$$
   Evaluates the Modified Z-Score for each candidate sensor measurement \(x_i\):
   $$M_i = \frac{0.6745 \cdot |x_i - \text{median}(x)|}{\text{MAD}}$$
   Any sensor measurement exhibiting \(M_i > 3.5\) is flagged as a statistical outlier and rejected prior to weight assignment.

5. **Adaptive Weight Computation**:
   Assigns dynamic weights \(w_i\) subject to \(\sum w_i = 1.0\).
   - **AI Confidence > 95%**: Boosts AI weight by \(+45\%\).
   - **Poor Lighting (<0.40)**: Penalizes AI weight by \(-45\%\).
   - **LiDAR Point Cloud Available**: Prioritizes point cloud weight by \(+60\%\).
   - **Reference Marker Detected**: Boosts marker weight by \(+40\%\).
   - **Recent Manual Calibration**: Increases manual caliper weight by \(+35\%\).

6. **Weighted Statistical Fusion**:
   Computes the final fused metric \(\hat{X}_{\text{fused}}\):
   $$\hat{X}_{\text{fused}} = \frac{\sum_{i=1}^N w_i \cdot x_i}{\sum_{i=1}^N w_i}$$

7. **Uncertainty Propagation & Confidence Estimation**:
   Computes system standard error and variance propagation:
   $$\sigma_{\text{fused}} = \sqrt{\sum_{i=1}^N w_i^2 \cdot (1 - Q_i)^2}$$
   Overall system confidence \(C_{\text{fused}} = \frac{\sum w_i Q_i}{\sum w_i}\).

8. **Biomass & Carbon Sequestration Recalculation**:
   Applies Chave et al. (2014) pantropical allometric equations on fused dimensions:
   $$\text{AGB} = 0.0673 \cdot \left(\rho \cdot \text{DBH}_{\text{fused}}^2 \cdot H_{\text{fused}}\right)^{0.976}$$
   $$\text{CO}_2 = \text{AGB} \cdot 0.5 \cdot 3.67$$

---

## 3. Dynamic Reliability Scoring

Each measurement source is dynamically assigned a score between `0.01` and `0.99`.

| Sensor Source | Primary Scoring Dependencies | Target Baseline |
| :--- | :--- | :--- |
| **Manual Calipers** | User verification, calibration recency, age decay | `0.92` (92%) |
| **AI Detection** | COCO-SSD probability, bbox stability, ambient lighting, sharpness | `0.95` (95%) |
| **Clinometer** | IMU pitch noise, camera stability, distance range penalty | `0.90` (90%) |
| **Reference Marker** | Image sharpness, lighting quality, marker scale match | `0.96` (96%) |
| **Point Cloud** | LiDAR point density (pts/\(m^2\)), distance penalty, IMU stability | `0.99` (99%) |

---

## 4. Outlier Rejection Example

Suppose the following height measurements are produced by the active sensors:
- **Manual Tape**: \(18.2\text{ m}\)
- **AI Bounding Box**: \(18.5\text{ m}\)
- **Clinometer Pitch**: \(17.9\text{ m}\)
- **Point Cloud Noise Spike**: \(38.6\text{ m}\)

**Calculations**:
- \(\text{Median}(H) = 18.2\text{ m}\)
- \(\text{MAD} = \text{Median}(|18.2-18.2|, |18.5-18.2|, |17.9-18.2|, |38.6-18.2|) = 0.30\text{ m}\)
- Modified Z-Score for Point Cloud (\(38.6\text{ m}\)):
  $$M_{\text{pointcloud}} = \frac{0.6745 \cdot |38.6 - 18.2|}{0.30} = 45.86 \gg 3.5$$
- **Outcome**: The Point Cloud noise spike of \(38.6\text{ m}\) is automatically rejected. The remaining aligned sensors fuse cleanly to \(18.22\text{ m}\).

---

## 5. Authoritative Final Output Schema

```json
{
  "height": 18.22,
  "distance": 8.50,
  "dbh": 42.6,
  "biomass": 784.50,
  "carbon": 1439.55,
  "confidence": 0.9450,
  "uncertainty": 0.0420,
  "sensorBreakdown": {
    "manual": 92.0,
    "ai": 95.0,
    "clinometer": 90.0,
    "marker": 96.0,
    "pointcloud": 99.0
  },
  "weights": {
    "ai": 0.26,
    "manual": 0.21,
    "marker": 0.29,
    "clinometer": 0.18,
    "pointcloud": 0.06
  },
  "rejectedMeasurements": [],
  "timestamp": 1785420000000,
  "latencyMs": 0.45,
  "activeSensorCount": 5
}
```

---

## 6. Extending AMSFE with New Sensors

To register a new sensor source (e.g. `ultrasonic`, `stereo_camera`, `drone_lidar`):

```javascript
import { AMSFE } from './src/fusion/fusionEngine.js';

// Register custom sensor plugin
AMSFE.registerSensor('ultrasonic', {
  name: 'Ultrasonic Distance Sensor',
  read: () => {
    return {
      type: 'ultrasonic',
      distance: 8.42,
      confidence: 0.91,
      timestamp: Date.now()
    };
  }
});
```

No changes to the central fusion math or UI visualizers are required!
