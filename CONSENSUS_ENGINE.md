# Consensus Multi-Frame Measurement Engine (CMME)

**Version**: 1.0.0-PROPRIETARY  
**Architecture Status**: Central Multi-Frame Statistical Consensus & Repeatability Subsystem for Porta-TLS  

---

## 1. Overview & Architectural Statement

The **Consensus Multi-Frame Measurement Engine (CMME)** is the third core architectural invention of Porta-TLS. CMME sits downstream of the **Adaptive Multi-Sensor Fusion Engine (AMSFE)** and the **Confidence & Error Prediction Engine (CEPE)**:

```
[ Viewfinder & Raw Sensor Telemetry ]
                 │
                 ▼
[ AMSFE: Adaptive Multi-Sensor Fusion Engine ]
  • Dynamic Sensor Weights (Manual, AI, Clinometer, Marker, LiDAR)
  • Outlier Filtering & Statistical Fusion
                 │
                 ▼
[ CEPE: Confidence & Error Prediction Engine ]
  • 17-Factor Quality Evaluator
  • Partial Derivative Error Propagation
  • 68%/95%/99% Gaussian Confidence Intervals & Letter Grades
                 │
                 ▼
==========================================================================
        CONSENSUS MULTI-FRAME MEASUREMENT ENGINE (CMME)
==========================================================================
  • Multi-Frame Data Collector (5, 10, 20 Frames)
  • Outlier Detector (MAD, Modified Z-Score Mi > 3.5, IQR Outer Fences)
  • Comprehensive Statistical Suite (Mean, Median, Mode, Weighted Mean, SD, CV%, SE, CIs)
  • Repeatability & Reproducibility Analysis Engine
  • Measurement Drift & Early Convergence Detector
  • Consensus Score (0 - 100) & Auto-Retake Advisory
                 │
                 ▼
[ STATISTICALLY VALIDATED FINAL CONSENSUS DISPLAY & EXPORT REPORT ]
```

---

## 2. Multi-Frame Collection Cycle

When a measurement is triggered, CMME automatically records **5**, **10**, or **20** independent telemetry frames. Each frame object captures:

- **Dimensions**: Height, Distance, DBH, Above Ground Biomass (AGB), Carbon ($\text{CO}_2$)
- **AMSFE Telemetry**: Active sensor weights $w_i$, uncertainty, rejected sensors
- **CEPE Telemetry**: Mathematical confidence %, Grade (`A+` to `D`), Reliability Index ($0\text{--}100$), quality factor breakdown
- **Context & Identification**: Frame ID, timestamp, pitch noise, HDOP, camera stability

---

## 3. Statistical Outlier Detection Framework

CMME applies three rigorous statistical filtering layers to exclude unstable frames before consensus calculation:

### 3.1 Median Absolute Deviation (MAD) & Modified Z-Score
For any metric dimension $X = \{x_1, x_2, \dots, x_N\}$:

$$\text{MAD} = \text{median}\left( |x_i - \tilde{x}| \right)$$

$$\text{Modified Z-Score } M_i = \frac{0.6745 \cdot |x_i - \tilde{x}|}{\text{MAD}}$$

**Rule**: Any frame with $M_i > 3.5$ is flagged as a statistical outlier and rejected (e.g. height spike of $22.8\text{m}$ when baseline is $15.2\text{m}$).

### 3.2 Interquartile Range (IQR) Outer Fences
$$\text{IQR} = Q_3 - Q_1$$

$$\text{Lower Fence} = Q_1 - 1.5 \cdot \text{IQR}, \quad \text{Upper Fence} = Q_3 + 1.5 \cdot \text{IQR}$$

**Rule**: Any reading outside $[\text{Lower Fence}, \text{Upper Fence}]$ is automatically excluded.

### 3.3 Quality & Reliability Floor Gating
Frames with CEPE Confidence $< 55.0\%$ or Reliability Index $< 50.0$ are rejected due to excessive motion blur or environmental turbulence.

---

## 4. Weighted Consensus Algorithm

CMME does not compute a simple arithmetic mean. It evaluates a **weighted consensus** $\mu_w$:

$$\mu_w = \frac{\sum_{i \in \text{Accepted}} W_i \cdot x_i}{\sum_{i \in \text{Accepted}} W_i}$$

Where the composite frame weight $W_i$ combines confidence and reliability:

$$W_i = \left( \frac{\text{Confidence}_i}{100} \right) \cdot \left( \frac{\text{Reliability}_i}{100} \right)$$

---

## 5. Statistical Analysis Suite

Across valid frames, CMME computes:

- **Weighted Mean** ($\mu_w$)
- **Arithmetic Mean** ($\mu$)
- **Median** ($\tilde{x}$)
- **Mode** ($\hat{x}$)
- **Sample Standard Deviation**: $\sigma = \sqrt{\frac{1}{N-1} \sum (x_i - \mu)^2}$
- **Sample Variance**: $\sigma^2$
- **Coefficient of Variation**: $\text{CV} = \left(\frac{\sigma}{\mu}\right) \cdot 100\%$
- **Standard Error**: $\text{SE} = \frac{\sigma}{\sqrt{N}}$
- **95% Confidence Interval**: $\mu_w \pm 1.96 \cdot \text{SE}$

---

## 6. Repeatability & Drift Analysis

### 6.1 Repeatability Score ($0\text{--}100$)
$$S_{\text{repeatability}} = 100 \cdot \exp\left( -0.15 \cdot \text{CV}_{\text{avg}} \right)$$

### 6.2 Reproducibility & Consistency Index ($0\text{--}100$)
$$\text{Consistency} = 0.50 \cdot S_{\text{repeatability}} + 0.50 \cdot \bar{R}_{\text{reliability}}$$

### 6.3 Linear Measurement Drift Slopes
Evaluates linear regression slope $m$ ($y = m \cdot x + b$) across frame index $x$:
- **Height Drift** ($\text{m / frame}$)
- **DBH Drift** ($\text{cm / frame}$)
- **Distance Drift** ($\text{m / frame}$)
- **Confidence Drift** ($\% \text{ / frame}$)

---

## 7. Early Convergence Detection

To optimize processing time, CMME monitors the rolling Coefficient of Variation $\text{CV}_N$ across the last 4 frames. 

If $\text{CV}_N < 0.8\%$ ($0.008$), the measurement series has converged into statistical stability. CMME triggers early stopping, halting collection at frame $N$ (e.g. after Frame 8 of 10) and displaying:
`✓ EARLY CONVERGENCE DETECTED: Measurement variation stabilized early!`

---

## 8. Consensus Score ($0\text{--}100$) & Retake Advisory

$$\text{Consensus Score} = 0.35 \cdot S_{\text{repeatability}} + 0.25 \cdot C_{\text{confidence}} + 0.20 \cdot \left(100 \cdot \frac{N_{\text{accepted}}}{N_{\text{total}}}\right) + 0.20 \cdot S_{\text{stability}}$$

### Auto-Retake Threshold
If $\text{Consensus Score} < 82.0$ or Rejected Frames $> 40\%$, CMME triggers an automatic **RETAKE ADVISORY** with actionable guidance (e.g., "*High frame rejection rate due to standoff motion jitter*").

---

## 9. Research Export & Telemetry

CMME exports complete structured dataset files:
- **CSV Export**: Includes session summary, consensus matrix, and frame-by-frame metrics + rejection reasons.
- **JSON Telemetry Export**: Full JSON object containing raw telemetry, weights, statistical vectors, and interval bounds.
