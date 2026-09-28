# PORTA-TLS / TLSCAD: Scientific Synthetic Benchmark Dataset (Andhra Pradesh, India)
## 135-Case High-Fidelity Forest Testing Dataset for Mobile LiDAR / Inclinometer Biomass Allometry

> **Publication-Grade Ground Truth vs. Estimated Validation Protocol**  
> **Region**: Andhra Pradesh, India (Eastern Ghats, Rayalaseema, Godavari Basin & Coastal Coringa)  
> **Primary Allometric Standard**: Chave et al. (2014) Global Pan-Tropical Equation  
> **Carbon Factor Standard**: IPCC Good Practice Guidance ($C = AGB \times 0.50$, $CO_2 = C \times 3.667$)  
> **Wood Specific Gravity Standard**: Global Wood Density Database (Zanne et al., 2009; Chave et al., 2009; FSI Dehradun)

---

## 1. Executive Summary & Validation Benchmark Statistics

This synthetic benchmark replicates real-world ground conditions across 6 prominent forest zones of **Andhra Pradesh, India**, encompassing 17 native and endemic tree species (notably **Red Sanders / Rakta Chandanam**, which is strictly endemic to the Seshachalam Hills).

### Statistical Performance Across 135 Field Verification Cases

| Metric Dimension | Ground Truth Mean | Estimated Mean | Mean Bias (Error) | MAE | RMSE | Relative Error | Pearson $R^2$ |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Total Height ($H$)** | `16.82 m` | `16.86 m` | `+0.041 m` | **`0.24 m`** | **`0.29 m`** | **`1.49%`** | **`0.9979`** |
| **Trunk DBH ($D$)** | `53.7 cm` | `53.6 cm` | `-0.119 cm` | **`0.87 cm`** | **`1.11 cm`** | **`2.00%`** | **`0.9988`** |
| **Biomass ($AGB$)** | `2194.2 kg` | `2188.4 kg` | `-5.80 kg` | **`79.0 kg`** | **`133.0 kg`** | **`4.21%`** | **`0.9988`** |

### Quality Grade Classification

- **Grade A (Optimal Field Capture)**: **91 cases (67.4%)** — Height error $< 2.5\%$ and DBH error $< 3.0\%$.
- **Grade B (Nominal Field Capture)**: **34 cases (25.2%)** — Height error $< 5.0\%$ and DBH error $< 5.5\%$.
- **Grade C (Sub-Optimal Field Capture)**: **10 cases (7.4%)** — Occlusions, crown overlap, or steep pitch angles ($|\theta| > 55^\circ$).

---

## 2. Andhra Pradesh Native Tree Species & Wood Density Database

| Telugu Vernacular Name | Common English Name | Botanical Scientific Name | Family | Wood Specific Gravity ($\rho$) [g/cm³] | Typical Height (m) | Typical DBH (cm) | Endemic / Native Habitat in AP |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **Vepa (వేప)** | Neem | *Azadirachta indica* | Meliaceae | **0.74** | 12 – 22 | 30 – 80 | Widespread rural, agroforestry & dry deciduous |
| **Rakta Chandanam (రక్త చందనం)** | Red Sanders | *Pterocarpus santalinus* | Fabaceae | **1.05** | 8 – 18 | 22 – 60 | **Strictly Endemic** to Seshachalam Hills (Kadapa, Chittoor, Nellore) |
| **Marri (మర్రి)** | Banyan | *Ficus benghalensis* | Moraceae | **0.56** | 16 – 30 | 70 – 200+ | Sacred groves, avenues, Kadiri reserve forest |
| **Raavi (రావి)** | Sacred Fig / Peepal | *Ficus religiosa* | Moraceae | **0.52** | 18 – 32 | 50 – 140 | Riverine belts, temple forests, Eastern Ghats |
| **Mamidi (మామిడి)** | Mango | *Mangifera indica* | Anacardiaceae | **0.65** | 12 – 24 | 35 – 90 | Chittoor / Krishna orchards & Eastern Ghats ravines |
| **Chinta (చింత)** | Tamarind | *Tamarindus indica* | Fabaceae | **0.90** | 14 – 28 | 40 – 120 | Rayalaseema & coastal plains (high-density wood) |
| **Usiri (ఉసిరి)** | Indian Gooseberry / Amla | *Phyllanthus emblica* | Phyllanthaceae | **0.72** | 8 – 16 | 20 – 48 | Nallamala & Tirumala dry deciduous slopes |
| **Kanuga (కానుగ)** | Pongamia / Indian Beech | *Pongamia pinnata* | Fabaceae | **0.68** | 10 – 20 | 25 – 65 | Krishna & Godavari delta canals, riverbanks |
| **Neredu (నేరేడు)** | Jamun / Black Plum | *Syzygium cumini* | Myrtaceae | **0.78** | 14 – 28 | 40 – 95 | Godavari valley, Papikonda & riparian forests |
| **Tella Maddhi (తెల్ల మద్ది)** | Arjun Tree | *Terminalia arjuna* | Combretaceae | **0.84** | 18 – 34 | 55 – 140 | Krishna, Penna & Godavari riparian corridors |
| **Panasa (పనస)** | Jackfruit | *Artocarpus heterophyllus* | Moraceae | **0.62** | 11 – 22 | 30 – 80 | Araku Valley & Ananthagiri tribal agency belt |
| **Sitaphal (సీతాఫలం)** | Custard Apple | *Annona squamosa* | Annonaceae | **0.58** | 4 – 9 | 15 – 30 | Rocky Deccan scrub, Rayalaseema hill slopes |
| **Teku (టేకు)** | Teak | *Tectona grandis* | Lamiaceae | **0.66** | 16 – 35 | 35 – 95 | Papikonda & Nallamala moist deciduous forests |
| **Sarugudu (సరుగుడు)** | Casuarina | *Casuarina equisetifolia* | Casuarinaceae | **0.82** | 16 – 32 | 20 – 50 | Bapatla, Chirala & coastal shelterbelt plantations |
| **Chandanam (చందనం)** | Indian Sandalwood | *Santalum album* | Santalaceae | **0.92** | 7 – 15 | 20 – 42 | Chittoor, Kadapa & Annamayya reserve forests |
| **Ippa (ఇప్ప)** | Mahua / Butter Tree | *Madhuca longifolia* | Sapotaceae | **0.86** | 14 – 25 | 45 – 95 | Araku, Paderu & Rampachodavaram tribal areas |
| **Nalla Thumma (నల్ల తుమ్మ)** | Babul / Gum Arabic | *Vachellia nilotica* | Fabaceae | **0.83** | 8 – 15 | 20 – 48 | Semi-arid scrub plains of Rayalaseema |

---

## 3. Andhra Pradesh Field Research Sites

1. **Seshachalam Biosphere Reserve (Tirupati / Kadapa)**: `13.6821° N, 79.3514° E` — Red Sanders endemic hotspot, steep rocky sandstone terrain.
2. **Papikonda National Park (Godavari Valley / Rampa)**: `17.5214° N, 81.3812° E` — Tropical moist deciduous, dense Teak, Bamboo, and Jamun canopy.
3. **Nallamala Forest Reserve (Srisailam)**: `16.0712° N, 78.8723° E` — Dry deciduous quartzite plateau, Arjun riparian corridors.
4. **Araku Valley & Ananthagiri Hills (Visakhapatnam)**: `18.3312° N, 82.8741° E` — Highland agency tracts (900–1200m altitude), Jackfruit & Mahua orchards.
5. **Coringa Mangrove & Estuarine Reserve (Kakinada)**: `16.8912° N, 82.2514° E` — Godavari delta coastal fringes, Pongamia & Casuarina shelterbelts.
6. **Krishna River Basin Agro-Forestry Belt (Amaravati / Guntur)**: `16.5123° N, 80.6412° E` — Rich alluvial plains, commercial Mango, Neem & Tamarind stands.

---

## 4. Trigonometric & Allometric Mathematical Formulations

### 4.1 Trigonometric Total Height via Phone Inclinometer
From horizontal distance $D$ (measured via LiDAR / ToF sensor or optical pinhole scaling) and camera perspective height $h_{\text{cam}} = 1.50\text{ m}$:
$$\theta_{\text{base}} = \arctan\left(-\frac{h_{\text{cam}}}{D}\right), \quad \theta_{\text{top}} = \arctan\left(\frac{H - h_{\text{cam}}}{D}\right)$$
$$H_{\text{est}} = D \cdot \left[\tan(\theta_{\text{top}}) - \tan(\theta_{\text{base}})\right]$$

### 4.2 Pantropical Biomass Equation (Chave et al., 2014)
$$\text{AGB} = 0.0673 \times \left(\rho \times \text{DBH}^2 \times H\right)^{0.976}$$
Where:
- $\text{AGB}$: Above-Ground Biomass in dry kilograms ($\text{kg}$)
- $\rho$: Wood specific gravity in $\text{g/cm}^3$ (dry mass / fresh volume)
- $\text{DBH}$: Diameter at breast height ($1.30\text{ m}$) in centimeters ($\text{cm}$)
- $H$: Total tree height in meters ($\text{m}$)

### 4.3 Equivalent Atmospheric Carbon Dioxide Sequestered
$$\text{Carbon} = \text{AGB} \times 0.50, \quad \text{CO}_2\text{ Eq} = \text{Carbon} \times \left(\frac{44}{12}\right) \approx \text{AGB} \times 1.8333\text{ kg}$$

---

## 5. Complete 135-Case Benchmark Dataset

| Case ID | Species (Vernacular – Botanical) | Wood Density $\rho$ | Dist (m) | Base Ang (°) | Top Ang (°) | GT H (m) | Est H (m) | H Err (%) | GT DBH (cm) | Est DBH (cm) | DBH Err (%) | GT AGB (kg) | Est AGB (kg) | Est CO₂ (kg) | Conf | Grade | Site (Andhra Pradesh) |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **TLS-AP-001** | Neem (Vepa) – Azadirachta indica | `0.74` | `20.2` | `-4.2` | `36.6` | `16.48` | `16.32` | `0.97%` | `42.2` | `43.5` | `3.08%` | `1150.1` | `1208.7` | `2216.0` | `0.85` | `Grade B` | Nallamala Forest Reserve |
| **TLS-AP-002** | Red Sanders (Rakta Chandanam) – Pterocarpus santalinus | `1.05` | `11.7` | `-7.3` | `42.7` | `12.30` | `12.29` | `0.08%` | `51.4` | `51.1` | `0.58%` | `1787.5` | `1765.8` | `3237.3` | `0.90` | `Grade A` | Seshachalam Biosphere Reserve |
| **TLS-AP-003** | Banyan (Marri) – Ficus benghalensis | `0.56` | `18.2` | `-4.7` | `48.2` | `21.85` | `22.00` | `0.69%` | `73.5` | `73.6` | `0.14%` | `3408.3` | `3440.3` | `6307.2` | `0.88` | `Grade A` | Seshachalam Biosphere Reserve |
| **TLS-AP-004** | Sacred Fig / Peepal (Raavi) – Ficus religiosa | `0.52` | `6.4` | `-13.2` | `69.1` | `18.25` | `18.44` | `1.04%` | `78.8` | `79.1` | `0.38%` | `3046.8` | `3100.7` | `5684.6` | `0.94` | `Grade A` | Nallamala Forest Reserve |
| **TLS-AP-005** | Mango (Mamidi) – Mangifera indica | `0.65` | `13.1` | `-6.5` | `49.1` | `16.63` | `16.71` | `0.48%` | `40.5` | `39.2` | `3.21%` | `943.5` | `889.5` | `1630.8` | `0.88` | `Grade B` | Seshachalam Biosphere Reserve |
| **TLS-AP-006** | Tamarind (Chinta) – Tamarindus indica | `0.90` | `10.7` | `-8.0` | `61.6` | `21.25` | `21.42` | `0.80%` | `101.7` | `101.8` | `0.10%` | `9934.6` | `10031.3` | `18390.7` | `0.93` | `Grade A` | Krishna River Basin Agro-Forestry Belt |
| **TLS-AP-007** | Indian Gooseberry / Amla (Usiri) – Phyllanthus emblica | `0.72` | `6.7` | `-12.6` | `50.8` | `9.71` | `9.58` | `1.34%` | `39.4` | `38.5` | `2.28%` | `584.4` | `551.3` | `1010.7` | `0.92` | `Grade A` | Seshachalam Biosphere Reserve |
| **TLS-AP-008** | Pongamia / Indian Beech (Kanuga) – Pongamia pinnata | `0.68` | `9.6` | `-8.9` | `55.1` | `15.28` | `15.38` | `0.65%` | `60.4` | `58.7` | `2.81%` | `1980.8` | `1885.4` | `3456.6` | `0.90` | `Grade A` | Coringa Estuarine & Mangrove Belt |
| **TLS-AP-009** | Jamun / Black Plum (Neredu) – Syzygium cumini | `0.78` | `21.9` | `-3.9` | `48.5` | `26.26` | `26.24` | `0.08%` | `40.0` | `41.1` | `2.75%` | `1718.5` | `1810.6` | `3319.4` | `0.88` | `Grade A` | Papikonda National Park |
| **TLS-AP-010** | Arjun Tree (Tella Maddhi) – Terminalia arjuna | `0.84` | `11.9` | `-7.2` | `63.4` | `25.24` | `24.92` | `1.27%` | `61.3` | `59.8` | `2.45%` | `4089.5` | `3848.2` | `7055.0` | `0.89` | `Grade A` | Nallamala Forest Reserve |
| **TLS-AP-011** | Jackfruit (Panasa) – Artocarpus heterophyllus | `0.62` | `7.8` | `-10.9` | `53.3` | `11.98` | `12.27` | `2.42%` | `62.4` | `62.1` | `0.48%` | `1521.1` | `1542.5` | `2827.9` | `0.91` | `Grade A` | Araku Valley & Ananthagiri Hills |
| **TLS-AP-012** | Custard Apple (Sitaphal) – Annona squamosa | `0.58` | `10.3` | `-8.3` | `31.8` | `7.88` | `7.64` | `3.05%` | `27.6` | `23.7` | `14.13%` | `192.7` | `138.8` | `254.5` | `0.85` | `Grade C` | Nallamala Forest Reserve |
| **TLS-AP-013** | Teak (Teku) – Tectona grandis | `0.66` | `12.6` | `-6.8` | `53.5` | `18.53` | `18.60` | `0.38%` | `69.9` | `70.6` | `1.00%` | `3088.6` | `3160.8` | `5794.8` | `0.88` | `Grade A` | Papikonda National Park |
| **TLS-AP-014** | Casuarina (Sarugudu) – Casuarina equisetifolia | `0.82` | `14.4` | `-5.9` | `56.8` | `23.52` | `23.24` | `1.19%` | `45.3` | `45.0` | `0.66%` | `2066.0` | `2015.6` | `3695.3` | `0.90` | `Grade A` | Coringa Estuarine & Mangrove Belt |
| **TLS-AP-015** | Indian Sandalwood (Chandanam) – Santalum album | `0.92` | `14.7` | `-5.8` | `38.2` | `13.08` | `13.24` | `1.22%` | `20.0` | `21.9` | `9.50%` | `264.3` | `319.3` | `585.4` | `0.88` | `Grade C` | Seshachalam Biosphere Reserve |
| **TLS-AP-016** | Mahua / Butter Tree (Ippa) – Madhuca longifolia | `0.86` | `15.5` | `-5.5` | `49.9` | `19.88` | `19.90` | `0.10%` | `87.5` | `87.6` | `0.11%` | `6639.6` | `6660.9` | `12211.7` | `0.89` | `Grade A` | Araku Valley & Ananthagiri Hills |
| **TLS-AP-017** | Babul (Nalla Thumma) – Vachellia nilotica | `0.83` | `20.1` | `-4.3` | `23.5` | `10.23` | `10.46` | `2.25%` | `43.5` | `43.9` | `0.92%` | `857.0` | `891.6` | `1634.6` | `0.88` | `Grade A` | Nallamala Forest Reserve |
| **TLS-AP-018** | Neem (Vepa) – Azadirachta indica | `0.74` | `9.7` | `-8.8` | `55.5` | `15.64` | `15.81` | `1.09%` | `67.3` | `66.3` | `1.49%` | `2718.0` | `2667.7` | `4890.8` | `0.91` | `Grade A` | Krishna River Basin Agro-Forestry Belt |
| **TLS-AP-019** | Red Sanders (Rakta Chandanam) – Pterocarpus santalinus | `1.05` | `11.3` | `-7.6` | `42.5` | `11.86` | `11.91` | `0.42%` | `28.0` | `26.1` | `6.79%` | `527.1` | `461.4` | `845.9` | `0.88` | `Grade C` | Seshachalam Biosphere Reserve |
| **TLS-AP-020** | Banyan (Marri) – Ficus benghalensis | `0.56` | `15.6` | `-5.5` | `58.9` | `27.40` | `27.18` | `0.80%` | `87.5` | `87.0` | `0.57%` | `5974.4` | `5861.6` | `10746.3` | `0.90` | `Grade A` | Seshachalam Biosphere Reserve |
| **TLS-AP-021** | Sacred Fig / Peepal (Raavi) – Ficus religiosa | `0.52` | `18.1` | `-4.7` | `55.3` | `27.65` | `28.01` | `1.30%` | `100.0` | `101.0` | `1.00%` | `7276.6` | `7513.6` | `13774.9` | `0.88` | `Grade A` | Papikonda National Park |
| **TLS-AP-022** | Mango (Mamidi) – Mangifera indica | `0.65` | `6.6` | `-12.8` | `71.3` | `20.95` | `21.24` | `1.38%` | `82.7` | `81.9` | `0.97%` | `4762.8` | `4736.4` | `8683.4` | `0.93` | `Grade A` | Krishna River Basin Agro-Forestry Belt |
| **TLS-AP-023** | Tamarind (Chinta) – Tamarindus indica | `0.90` | `7.4` | `-11.5` | `70.2` | `22.08` | `22.67` | `2.67%` | `46.5` | `47.0` | `1.08%` | `2238.6` | `2345.4` | `4299.9` | `0.89` | `Grade B` | Seshachalam Biosphere Reserve |
| **TLS-AP-024** | Indian Gooseberry / Amla (Usiri) – Phyllanthus emblica | `0.72` | `14.3` | `-6.0` | `35.1` | `11.54` | `11.72` | `1.56%` | `38.8` | `38.5` | `0.77%` | `671.2` | `671.2` | `1230.5` | `0.89` | `Grade A` | Nallamala Forest Reserve |
| **TLS-AP-025** | Pongamia / Indian Beech (Kanuga) – Pongamia pinnata | `0.68` | `8.0` | `-10.6` | `59.0` | `14.80` | `14.59` | `1.42%` | `49.7` | `50.9` | `2.41%` | `1312.2` | `1355.7` | `2485.5` | `0.93` | `Grade A` | Coringa Estuarine & Mangrove Belt |
| **TLS-AP-026** | Jamun / Black Plum (Neredu) – Syzygium cumini | `0.78` | `18.3` | `-4.7` | `54.0` | `26.73` | `26.97` | `0.90%` | `91.0` | `90.4` | `0.66%` | `8699.6` | `8663.2` | `15882.5` | `0.88` | `Grade A` | Coringa Estuarine & Mangrove Belt |
| **TLS-AP-027** | Arjun Tree (Tella Maddhi) – Terminalia arjuna | `0.84` | `21.2` | `-4.0` | `54.9` | `31.66` | `32.13` | `1.48%` | `119.4` | `120.8` | `1.17%` | `18746.6` | `19455.9` | `35669.2` | `0.86` | `Grade A` | Papikonda National Park |
| **TLS-AP-028** | Jackfruit (Panasa) – Artocarpus heterophyllus | `0.62` | `6.3` | `-13.4` | `67.7` | `16.87` | `16.73` | `0.83%` | `59.0` | `58.8` | `0.34%` | `1904.4` | `1876.5` | `3440.3` | `0.91` | `Grade A` | Araku Valley & Ananthagiri Hills |
| **TLS-AP-029** | Custard Apple (Sitaphal) – Annona squamosa | `0.58` | `7.0` | `-12.1` | `30.0` | `5.54` | `5.49` | `0.90%` | `19.1` | `19.3` | `1.05%` | `66.6` | `67.4` | `123.6` | `0.90` | `Grade A` | Nallamala Forest Reserve |
| **TLS-AP-030** | Teak (Teku) – Tectona grandis | `0.66` | `13.5` | `-6.3` | `58.5` | `23.53` | `23.77` | `1.02%` | `44.9` | `45.3` | `0.89%` | `1643.5` | `1688.9` | `3096.3` | `0.88` | `Grade A` | Papikonda National Park |
| **TLS-AP-031** | Casuarina (Sarugudu) – Casuarina equisetifolia | `0.82` | `8.2` | `-10.4` | `70.2` | `24.29` | `23.85` | `1.81%` | `32.3` | `33.0` | `2.17%` | `1101.6` | `1128.4` | `2068.7` | `0.89` | `Grade A` | Krishna River Basin Agro-Forestry Belt |
| **TLS-AP-032** | Indian Sandalwood (Chandanam) – Santalum album | `0.92` | `12.1` | `-7.1` | `44.7` | `13.48` | `13.54` | `0.45%` | `30.8` | `29.4` | `4.55%` | `632.3` | `579.9` | `1063.1` | `0.89` | `Grade B` | Seshachalam Biosphere Reserve |
| **TLS-AP-033** | Mahua / Butter Tree (Ippa) – Madhuca longifolia | `0.86` | `13.6` | `-6.3` | `52.1` | `18.99` | `19.57` | `3.05%` | `54.1` | `53.2` | `1.66%` | `2483.9` | `2475.5` | `4538.4` | `0.89` | `Grade B` | Araku Valley & Ananthagiri Hills |
| **TLS-AP-034** | Babul (Nalla Thumma) – Vachellia nilotica | `0.83` | `20.2` | `-4.2` | `17.4` | `7.83` | `8.02` | `2.43%` | `30.0` | `29.9` | `0.33%` | `319.7` | `325.1` | `596.0` | `0.85` | `Grade A` | Nallamala Forest Reserve |
| **TLS-AP-035** | Neem (Vepa) – Azadirachta indica | `0.74` | `8.2` | `-10.4` | `61.6` | `16.68` | `16.66` | `0.12%` | `38.0` | `37.9` | `0.26%` | `948.4` | `942.4` | `1727.7` | `0.94` | `Grade A` | Nallamala Forest Reserve |
| **TLS-AP-036** | Red Sanders (Rakta Chandanam) – Pterocarpus santalinus | `1.05` | `12.4` | `-6.9` | `43.9` | `13.42` | `12.90` | `3.87%` | `35.4` | `35.8` | `1.13%` | `939.8` | `924.3` | `1694.6` | `0.90` | `Grade B` | Seshachalam Biosphere Reserve |
| **TLS-AP-037** | Banyan (Marri) – Ficus benghalensis | `0.56` | `17.0` | `-5.0` | `45.5` | `18.79` | `18.94` | `0.80%` | `169.0` | `171.0` | `1.18%` | `14942.9` | `15409.1` | `28250.0` | `0.88` | `Grade A` | Krishna River Basin Agro-Forestry Belt |
| **TLS-AP-038** | Sacred Fig / Peepal (Raavi) – Ficus religiosa | `0.52` | `18.1` | `-4.7` | `47.8` | `21.44` | `21.11` | `1.54%` | `92.2` | `92.8` | `0.65%` | `4844.7` | `4832.7` | `8859.9` | `0.90` | `Grade A` | Nallamala Forest Reserve |
| **TLS-AP-039** | Mango (Mamidi) – Mangifera indica | `0.65` | `16.5` | `-5.2` | `34.1` | `12.67` | `13.04` | `2.92%` | `36.8` | `35.5` | `3.53%` | `600.2` | `575.4` | `1054.9` | `0.87` | `Grade B` | Seshachalam Biosphere Reserve |
| **TLS-AP-040** | Tamarind (Chinta) – Tamarindus indica | `0.90` | `21.4` | `-4.0` | `42.8` | `21.32` | `21.97` | `3.05%` | `74.0` | `73.6` | `0.54%` | `5357.9` | `5459.2` | `10008.5` | `0.87` | `Grade B` | Seshachalam Biosphere Reserve |
| **TLS-AP-041** | Indian Gooseberry / Amla (Usiri) – Phyllanthus emblica | `0.72` | `16.4` | `-5.2` | `37.1` | `13.91` | `14.19` | `2.01%` | `42.4` | `41.7` | `1.65%` | `957.8` | `945.4` | `1733.2` | `0.90` | `Grade A` | Seshachalam Biosphere Reserve |
| **TLS-AP-042** | Pongamia / Indian Beech (Kanuga) – Pongamia pinnata | `0.68` | `16.6` | `-5.2` | `35.6` | `13.40` | `13.35` | `0.37%` | `49.1` | `48.2` | `1.83%` | `1163.0` | `1117.7` | `2049.1` | `0.91` | `Grade A` | Coringa Estuarine & Mangrove Belt |
| **TLS-AP-043** | Jamun / Black Plum (Neredu) – Syzygium cumini | `0.78` | `8.0` | `-10.6` | `68.6` | `21.95` | `22.47` | `2.37%` | `60.1` | `61.0` | `1.50%` | `3193.8` | `3363.8` | `6167.0` | `0.93` | `Grade A` | Coringa Estuarine & Mangrove Belt |
| **TLS-AP-044** | Arjun Tree (Tella Maddhi) – Terminalia arjuna | `0.84` | `9.8` | `-8.7` | `65.6` | `23.13` | `22.81` | `1.38%` | `124.0` | `125.9` | `1.53%` | `14856.1` | `15097.1` | `27678.0` | `0.90` | `Grade A` | Papikonda National Park |
| **TLS-AP-045** | Jackfruit (Panasa) – Artocarpus heterophyllus | `0.62` | `19.3` | `-4.4` | `42.2` | `18.97` | `18.90` | `0.37%` | `55.5` | `55.3` | `0.36%` | `1895.1` | `1875.1` | `3437.7` | `0.89` | `Grade A` | Araku Valley & Ananthagiri Hills |
| **TLS-AP-046** | Custard Apple (Sitaphal) – Annona squamosa | `0.58` | `15.4` | `-5.6` | `18.8` | `6.75` | `6.81` | `0.89%` | `16.5` | `17.1` | `3.64%` | `60.7` | `65.6` | `120.3` | `0.86` | `Grade B` | Seshachalam Biosphere Reserve |
| **TLS-AP-047** | Teak (Teku) – Tectona grandis | `0.66` | `20.9` | `-4.1` | `45.0` | `22.40` | `22.01` | `1.74%` | `81.4` | `79.7` | `2.09%` | `5003.5` | `4719.9` | `8653.2` | `0.87` | `Grade A` | Nallamala Forest Reserve |
| **TLS-AP-048** | Casuarina (Sarugudu) – Casuarina equisetifolia | `0.82` | `15.3` | `-5.6` | `59.8` | `27.82` | `27.93` | `0.40%` | `29.0` | `28.4` | `2.07%` | `1019.0` | `982.1` | `1800.5` | `0.91` | `Grade A` | Coringa Estuarine & Mangrove Belt |
| **TLS-AP-049** | Indian Sandalwood (Chandanam) – Santalum album | `0.92` | `18.3` | `-4.7` | `16.5` | `6.93` | `7.15` | `3.17%` | `21.9` | `21.8` | `0.46%` | `169.7` | `173.4` | `317.9` | `0.86` | `Grade B` | Seshachalam Biosphere Reserve |
| **TLS-AP-050** | Mahua / Butter Tree (Ippa) – Madhuca longifolia | `0.86` | `8.4` | `-10.1` | `61.3` | `16.84` | `17.05` | `1.25%` | `53.4` | `55.6` | `4.12%` | `2153.6` | `2358.5` | `4323.9` | `0.92` | `Grade B` | Araku Valley & Ananthagiri Hills |
| **TLS-AP-051** | Babul (Nalla Thumma) – Vachellia nilotica | `0.83` | `11.2` | `-7.6` | `30.2` | `8.02` | `7.87` | `1.87%` | `26.7` | `27.9` | `4.49%` | `260.7` | `278.8` | `511.1` | `0.88` | `Grade B` | Nallamala Forest Reserve |
| **TLS-AP-052** | Neem (Vepa) – Azadirachta indica | `0.74` | `7.5` | `-11.3` | `61.0` | `15.05` | `15.49` | `2.92%` | `69.3` | `69.3` | `0.00%` | `2771.9` | `2850.9` | `5226.7` | `0.93` | `Grade B` | Seshachalam Biosphere Reserve |
| **TLS-AP-053** | Red Sanders (Rakta Chandanam) – Pterocarpus santalinus | `1.05` | `11.0` | `-7.8` | `47.3` | `13.44` | `13.79` | `2.60%` | `35.1` | `34.4` | `1.99%` | `925.7` | `912.6` | `1673.1` | `0.92` | `Grade B` | Seshachalam Biosphere Reserve |
| **TLS-AP-054** | Banyan (Marri) – Ficus benghalensis | `0.56` | `13.8` | `-6.2` | `59.0` | `24.51` | `24.75` | `0.98%` | `155.5` | `156.5` | `0.64%` | `16462.8` | `16829.4` | `30853.9` | `0.91` | `Grade A` | Seshachalam Biosphere Reserve |
| **TLS-AP-055** | Sacred Fig / Peepal (Raavi) – Ficus religiosa | `0.52` | `21.4` | `-4.0` | `52.6` | `29.50` | `28.98` | `1.76%` | `103.9` | `102.5` | `1.35%` | `8352.5` | `7994.2` | `14656.0` | `0.86` | `Grade A` | Krishna River Basin Agro-Forestry Belt |
| **TLS-AP-056** | Mango (Mamidi) – Mangifera indica | `0.65` | `19.3` | `-4.4` | `41.4` | `18.49` | `17.97` | `2.81%` | `71.4` | `71.7` | `0.42%` | `3165.0` | `3103.4` | `5689.6` | `0.86` | `Grade B` | Araku Valley & Ananthagiri Hills |
| **TLS-AP-057** | Tamarind (Chinta) – Tamarindus indica | `0.90` | `13.7` | `-6.2` | `48.1` | `16.77` | `16.95` | `1.07%` | `68.5` | `67.9` | `0.88%` | `3645.6` | `3621.1` | `6638.7` | `0.90` | `Grade A` | Seshachalam Biosphere Reserve |
| **TLS-AP-058** | Indian Gooseberry / Amla (Usiri) – Phyllanthus emblica | `0.72` | `18.9` | `-4.5` | `22.8` | `9.44` | `9.60` | `1.69%` | `41.5` | `42.9` | `3.37%` | `629.2` | `682.4` | `1251.1` | `0.86` | `Grade B` | Seshachalam Biosphere Reserve |
| **TLS-AP-059** | Pongamia / Indian Beech (Kanuga) – Pongamia pinnata | `0.68` | `8.1` | `-10.5` | `64.0` | `18.11` | `18.57` | `2.54%` | `52.2` | `54.1` | `3.64%` | `1758.6` | `1932.4` | `3542.7` | `0.91` | `Grade B` | Coringa Estuarine & Mangrove Belt |
| **TLS-AP-060** | Jamun / Black Plum (Neredu) – Syzygium cumini | `0.78` | `17.5` | `-4.9` | `38.1` | `15.20` | `14.85` | `2.30%` | `59.5` | `59.6` | `0.17%` | `2187.9` | `2145.8` | `3934.0` | `0.88` | `Grade A` | Coringa Estuarine & Mangrove Belt |
| **TLS-AP-061** | Arjun Tree (Tella Maddhi) – Terminalia arjuna | `0.84` | `6.6` | `-12.8` | `75.7` | `27.46` | `27.00` | `1.68%` | `58.1` | `57.4` | `1.20%` | `3999.0` | `3841.7` | `7043.1` | `0.93` | `Grade A` | Nallamala Forest Reserve |
| **TLS-AP-062** | Jackfruit (Panasa) – Artocarpus heterophyllus | `0.62` | `15.9` | `-5.4` | `44.7` | `17.22` | `17.54` | `1.86%` | `62.9` | `61.0` | `3.02%` | `2201.5` | `2111.2` | `3870.5` | `0.87` | `Grade B` | Araku Valley & Ananthagiri Hills |
| **TLS-AP-063** | Custard Apple (Sitaphal) – Annona squamosa | `0.58` | `16.0` | `-5.4` | `18.1` | `6.72` | `6.21` | `7.59%` | `17.7` | `16.5` | `6.78%` | `69.3` | `55.9` | `102.5` | `0.86` | `Grade C` | Seshachalam Biosphere Reserve |
| **TLS-AP-064** | Teak (Teku) – Tectona grandis | `0.66` | `7.1` | `-11.9` | `73.2` | `24.95` | `25.35` | `1.60%` | `65.6` | `62.9` | `4.12%` | `3647.8` | `3413.0` | `6257.2` | `0.92` | `Grade B` | Papikonda National Park |
| **TLS-AP-065** | Casuarina (Sarugudu) – Casuarina equisetifolia | `0.82` | `17.5` | `-4.9` | `48.3` | `21.16` | `21.36` | `0.95%` | `28.0` | `29.7` | `6.07%` | `728.5` | `824.9` | `1512.3` | `0.89` | `Grade C` | Coringa Estuarine & Mangrove Belt |
| **TLS-AP-066** | Indian Sandalwood (Chandanam) – Santalum album | `0.92` | `15.8` | `-5.4` | `23.8` | `8.47` | `8.52` | `0.59%` | `26.2` | `26.1` | `0.38%` | `293.0` | `292.5` | `536.3` | `0.90` | `Grade A` | Seshachalam Biosphere Reserve |
| **TLS-AP-067** | Mahua / Butter Tree (Ippa) – Madhuca longifolia | `0.86` | `11.2` | `-7.6` | `55.0` | `17.52` | `17.32` | `1.14%` | `85.6` | `85.7` | `0.12%` | `5622.9` | `5573.0` | `10217.2` | `0.89` | `Grade A` | Araku Valley & Ananthagiri Hills |
| **TLS-AP-068** | Babul (Nalla Thumma) – Vachellia nilotica | `0.83` | `19.4` | `-4.4` | `27.5` | `11.60` | `11.49` | `0.95%` | `37.2` | `36.6` | `1.61%` | `713.9` | `685.2` | `1256.2` | `0.87` | `Grade A` | Seshachalam Biosphere Reserve |
| **TLS-AP-069** | Neem (Vepa) – Azadirachta indica | `0.74` | `7.5` | `-11.3` | `63.3` | `16.41` | `16.70` | `1.77%` | `39.6` | `38.1` | `3.79%` | `1011.7` | `954.4` | `1749.7` | `0.92` | `Grade B` | Nallamala Forest Reserve |
| **TLS-AP-070** | Red Sanders (Rakta Chandanam) – Pterocarpus santalinus | `1.05` | `9.4` | `-9.1` | `51.8` | `13.44` | `13.68` | `1.79%` | `31.2` | `32.6` | `4.49%` | `735.5` | `815.3` | `1494.7` | `0.90` | `Grade B` | Seshachalam Biosphere Reserve |
| **TLS-AP-071** | Banyan (Marri) – Ficus benghalensis | `0.56` | `12.5` | `-6.8` | `60.1` | `23.27` | `23.14` | `0.56%` | `112.4` | `113.4` | `0.89%` | `8304.9` | `8403.7` | `15406.8` | `0.88` | `Grade A` | Nallamala Forest Reserve |
| **TLS-AP-072** | Sacred Fig / Peepal (Raavi) – Ficus religiosa | `0.52` | `13.8` | `-6.2` | `61.0` | `26.38` | `26.19` | `0.72%` | `64.6` | `65.4` | `1.24%` | `2961.9` | `3012.6` | `5523.1` | `0.91` | `Grade A` | Krishna River Basin Agro-Forestry Belt |
| **TLS-AP-073** | Mango (Mamidi) – Mangifera indica | `0.65` | `8.5` | `-10.0` | `62.9` | `18.08` | `18.47` | `2.16%` | `47.8` | `46.4` | `2.93%` | `1414.8` | `1363.1` | `2499.0` | `0.90` | `Grade A` | Krishna River Basin Agro-Forestry Belt |
| **TLS-AP-074** | Tamarind (Chinta) – Tamarindus indica | `0.90` | `19.2` | `-4.5` | `50.1` | `24.48` | `24.46` | `0.08%` | `100.8` | `98.7` | `2.08%` | `11209.6` | `10749.7` | `19707.8` | `0.87` | `Grade A` | Seshachalam Biosphere Reserve |
| **TLS-AP-075** | Indian Gooseberry / Amla (Usiri) – Phyllanthus emblica | `0.72` | `9.5` | `-9.0` | `41.8` | `10.00` | `9.88` | `1.20%` | `35.2` | `34.3` | `2.56%` | `482.6` | `453.5` | `831.4` | `0.90` | `Grade A` | Seshachalam Biosphere Reserve |
| **TLS-AP-076** | Pongamia / Indian Beech (Kanuga) – Pongamia pinnata | `0.68` | `15.1` | `-5.7` | `46.9` | `17.62` | `17.53` | `0.51%` | `35.1` | `35.7` | `1.71%` | `789.0` | `811.5` | `1487.8` | `0.91` | `Grade A` | Coringa Estuarine & Mangrove Belt |
| **TLS-AP-077** | Jamun / Black Plum (Neredu) – Syzygium cumini | `0.78` | `14.4` | `-5.9` | `58.0` | `24.57` | `24.80` | `0.94%` | `61.5` | `61.5` | `0.00%` | `3729.2` | `3763.3` | `6899.4` | `0.89` | `Grade A` | Coringa Estuarine & Mangrove Belt |
| **TLS-AP-078** | Arjun Tree (Tella Maddhi) – Terminalia arjuna | `0.84` | `17.1` | `-5.0` | `57.7` | `28.60` | `28.56` | `0.14%` | `57.7` | `57.8` | `0.17%` | `4105.3` | `4113.5` | `7541.4` | `0.90` | `Grade A` | Nallamala Forest Reserve |
| **TLS-AP-079** | Jackfruit (Panasa) – Artocarpus heterophyllus | `0.62` | `19.9` | `-4.3` | `37.6` | `16.82` | `17.42` | `3.57%` | `57.9` | `58.8` | `1.55%` | `1830.4` | `1952.0` | `3578.7` | `0.88` | `Grade B` | Araku Valley & Ananthagiri Hills |
| **TLS-AP-080** | Custard Apple (Sitaphal) – Annona squamosa | `0.58` | `20.7` | `-4.1` | `16.2` | `7.53` | `7.26` | `3.59%` | `21.8` | `23.2` | `6.42%` | `116.3` | `126.7` | `232.3` | `0.86` | `Grade C` | Nallamala Forest Reserve |
| **TLS-AP-081** | Teak (Teku) – Tectona grandis | `0.66` | `11.4` | `-7.5` | `60.3` | `21.47` | `21.42` | `0.23%` | `79.6` | `80.0` | `0.50%` | `4595.6` | `4630.2` | `8488.7` | `0.89` | `Grade A` | Nallamala Forest Reserve |
| **TLS-AP-082** | Casuarina (Sarugudu) – Casuarina equisetifolia | `0.82` | `13.6` | `-6.3` | `55.4` | `21.19` | `21.24` | `0.24%` | `43.6` | `45.0` | `3.21%` | `1731.7` | `1846.2` | `3384.7` | `0.89` | `Grade B` | Krishna River Basin Agro-Forestry Belt |
| **TLS-AP-083** | Indian Sandalwood (Chandanam) – Santalum album | `0.92` | `12.7` | `-6.7` | `29.9` | `8.81` | `8.70` | `1.25%` | `31.0` | `31.3` | `0.97%` | `422.8` | `425.5` | `780.1` | `0.89` | `Grade A` | Seshachalam Biosphere Reserve |
| **TLS-AP-084** | Mahua / Butter Tree (Ippa) – Madhuca longifolia | `0.86` | `14.9` | `-5.7` | `49.9` | `19.22` | `19.21` | `0.05%` | `62.3` | `64.6` | `3.69%` | `3310.3` | `3551.3` | `6510.7` | `0.88` | `Grade B` | Papikonda National Park |
| **TLS-AP-085** | Babul (Nalla Thumma) – Vachellia nilotica | `0.83` | `18.7` | `-4.6` | `29.6` | `12.11` | `12.21` | `0.83%` | `29.5` | `30.5` | `3.39%` | `473.5` | `509.4` | `933.9` | `0.89` | `Grade B` | Nallamala Forest Reserve |
| **TLS-AP-086** | Neem (Vepa) – Azadirachta indica | `0.74` | `13.1` | `-6.5` | `52.7` | `18.67` | `18.40` | `1.45%` | `34.2` | `35.0` | `2.34%` | `861.9` | `888.9` | `1629.6` | `0.90` | `Grade A` | Krishna River Basin Agro-Forestry Belt |
| **TLS-AP-087** | Red Sanders (Rakta Chandanam) – Pterocarpus santalinus | `1.05` | `18.4` | `-4.7` | `37.3` | `15.50` | `15.23` | `1.74%` | `26.6` | `26.3` | `1.13%` | `619.2` | `595.3` | `1091.4` | `0.87` | `Grade A` | Seshachalam Biosphere Reserve |
| **TLS-AP-088** | Banyan (Marri) – Ficus benghalensis | `0.56` | `10.1` | `-8.4` | `67.0` | `25.32` | `25.15` | `0.67%` | `125.6` | `125.9` | `0.24%` | `11201.0` | `11179.5` | `20495.8` | `0.90` | `Grade A` | Krishna River Basin Agro-Forestry Belt |
| **TLS-AP-089** | Sacred Fig / Peepal (Raavi) – Ficus religiosa | `0.52` | `12.6` | `-6.8` | `60.4` | `23.64` | `23.50` | `0.59%` | `84.1` | `84.8` | `0.83%` | `4453.6` | `4500.1` | `8250.2` | `0.92` | `Grade A` | Papikonda National Park |
| **TLS-AP-090** | Mango (Mamidi) – Mangifera indica | `0.65` | `12.5` | `-6.8` | `53.7` | `18.50` | `18.51` | `0.05%` | `58.8` | `58.7` | `0.17%` | `2167.7` | `2161.7` | `3963.1` | `0.92` | `Grade A` | Seshachalam Biosphere Reserve |
| **TLS-AP-091** | Tamarind (Chinta) – Tamarindus indica | `0.90` | `10.3` | `-8.3` | `54.7` | `16.04` | `15.88` | `1.00%` | `95.5` | `96.2` | `0.73%` | `6677.3` | `6707.2` | `12296.5` | `0.89` | `Grade A` | Nallamala Forest Reserve |
| **TLS-AP-092** | Indian Gooseberry / Amla (Usiri) – Phyllanthus emblica | `0.72` | `17.8` | `-4.8` | `19.0` | `7.62` | `7.70` | `1.05%` | `41.9` | `42.0` | `0.24%` | `520.1` | `527.9` | `967.8` | `0.87` | `Grade A` | Seshachalam Biosphere Reserve |
| **TLS-AP-093** | Pongamia / Indian Beech (Kanuga) – Pongamia pinnata | `0.68` | `20.0` | `-4.3` | `30.5` | `13.29` | `13.19` | `0.75%` | `56.5` | `55.4` | `1.95%` | `1517.4` | `1449.6` | `2657.6` | `0.86` | `Grade A` | Krishna River Basin Agro-Forestry Belt |
| **TLS-AP-094** | Jamun / Black Plum (Neredu) – Syzygium cumini | `0.78` | `10.0` | `-8.5` | `58.3` | `17.70` | `17.65` | `0.28%` | `66.0` | `65.6` | `0.61%` | `3107.9` | `3062.8` | `5615.1` | `0.91` | `Grade A` | Papikonda National Park |
| **TLS-AP-095** | Arjun Tree (Tella Maddhi) – Terminalia arjuna | `0.84` | `19.4` | `-4.4` | `54.0` | `28.25` | `28.55` | `1.06%` | `56.5` | `55.0` | `2.65%` | `3893.2` | `3732.3` | `6842.6` | `0.89` | `Grade A` | Nallamala Forest Reserve |
| **TLS-AP-096** | Jackfruit (Panasa) – Artocarpus heterophyllus | `0.62` | `15.4` | `-5.6` | `38.5` | `13.74` | `14.02` | `2.04%` | `57.8` | `56.1` | `2.94%` | `1497.4` | `1440.8` | `2641.5` | `0.90` | `Grade A` | Araku Valley & Ananthagiri Hills |
| **TLS-AP-097** | Custard Apple (Sitaphal) – Annona squamosa | `0.58` | `15.9` | `-5.4` | `16.4` | `6.17` | `5.66` | `8.27%` | `16.3` | `15.8` | `3.07%` | `54.3` | `47.0` | `86.2` | `0.86` | `Grade C` | Nallamala Forest Reserve |
| **TLS-AP-098** | Teak (Teku) – Tectona grandis | `0.66` | `8.1` | `-10.5` | `74.6` | `30.95` | `31.54` | `1.91%` | `47.5` | `46.2` | `2.74%` | `2397.1` | `2312.9` | `4240.3` | `0.91` | `Grade A` | Nallamala Forest Reserve |
| **TLS-AP-099** | Casuarina (Sarugudu) – Casuarina equisetifolia | `0.82` | `21.4` | `-4.0` | `51.5` | `28.45` | `28.51` | `0.21%` | `28.8` | `29.1` | `1.04%` | `1027.6` | `1050.7` | `1926.3` | `0.87` | `Grade A` | Krishna River Basin Agro-Forestry Belt |
| **TLS-AP-100** | Indian Sandalwood (Chandanam) – Santalum album | `0.92` | `18.6` | `-4.6` | `18.4` | `7.69` | `7.51` | `2.34%` | `20.9` | `20.3` | `2.87%` | `171.5` | `158.3` | `290.2` | `0.89` | `Grade A` | Seshachalam Biosphere Reserve |
| **TLS-AP-101** | Mahua / Butter Tree (Ippa) – Madhuca longifolia | `0.86` | `6.6` | `-12.8` | `64.4` | `15.29` | `15.55` | `1.70%` | `89.5` | `89.0` | `0.56%` | `5370.6` | `5400.4` | `9900.7` | `0.92` | `Grade A` | Papikonda National Park |
| **TLS-AP-102** | Babul (Nalla Thumma) – Vachellia nilotica | `0.83` | `12.7` | `-6.7` | `42.0` | `12.94` | `12.96` | `0.15%` | `26.9` | `27.3` | `1.49%` | `421.9` | `434.8` | `797.1` | `0.91` | `Grade A` | Nallamala Forest Reserve |
| **TLS-AP-103** | Neem (Vepa) – Azadirachta indica | `0.74` | `8.9` | `-9.6` | `63.6` | `19.41` | `19.23` | `0.93%` | `68.9` | `70.3` | `2.03%` | `3513.2` | `3620.8` | `6638.1` | `0.92` | `Grade A` | Seshachalam Biosphere Reserve |
| **TLS-AP-104** | Red Sanders (Rakta Chandanam) – Pterocarpus santalinus | `1.05` | `21.4` | `-4.0` | `32.7` | `15.23` | `14.98` | `1.64%` | `38.7` | `37.4` | `3.36%` | `1265.4` | `1164.8` | `2135.5` | `0.85` | `Grade B` | Seshachalam Biosphere Reserve |
| **TLS-AP-105** | Banyan (Marri) – Ficus benghalensis | `0.56` | `12.0` | `-7.1` | `53.7` | `17.81` | `18.06` | `1.40%` | `167.0` | `168.7` | `1.02%` | `13856.0` | `14326.2` | `26264.7` | `0.91` | `Grade A` | Krishna River Basin Agro-Forestry Belt |
| **TLS-AP-106** | Sacred Fig / Peepal (Raavi) – Ficus religiosa | `0.52` | `9.4` | `-9.1` | `70.5` | `28.09` | `28.48` | `1.39%` | `114.3` | `113.6` | `0.61%` | `9592.4` | `9606.5` | `17611.9` | `0.92` | `Grade A` | Krishna River Basin Agro-Forestry Belt |
| **TLS-AP-107** | Mango (Mamidi) – Mangifera indica | `0.65` | `11.3` | `-7.6` | `50.7` | `15.33` | `15.21` | `0.78%` | `50.8` | `50.5` | `0.59%` | `1356.3` | `1330.5` | `2439.3` | `0.92` | `Grade A` | Araku Valley & Ananthagiri Hills |
| **TLS-AP-108** | Tamarind (Chinta) – Tamarindus indica | `0.90` | `9.9` | `-8.6` | `61.8` | `19.93` | `20.42` | `2.46%` | `88.0` | `87.4` | `0.68%` | `7035.7` | `7108.9` | `13033.0` | `0.91` | `Grade A` | Krishna River Basin Agro-Forestry Belt |
| **TLS-AP-109** | Indian Gooseberry / Amla (Usiri) – Phyllanthus emblica | `0.72` | `10.7` | `-8.0` | `46.3` | `12.70` | `12.94` | `1.89%` | `24.1` | `25.0` | `3.73%` | `290.9` | `318.3` | `583.6` | `0.91` | `Grade B` | Nallamala Forest Reserve |
| **TLS-AP-110** | Pongamia / Indian Beech (Kanuga) – Pongamia pinnata | `0.68` | `15.0` | `-5.7` | `32.8` | `11.16` | `11.26` | `0.90%` | `58.0` | `59.3` | `2.24%` | `1346.7` | `1418.6` | `2600.8` | `0.88` | `Grade A` | Krishna River Basin Agro-Forestry Belt |
| **TLS-AP-111** | Jamun / Black Plum (Neredu) – Syzygium cumini | `0.78` | `13.1` | `-6.5` | `50.4` | `17.31` | `17.77` | `2.66%` | `89.4` | `88.6` | `0.89%` | `5499.1` | `5543.5` | `10163.1` | `0.91` | `Grade B` | Papikonda National Park |
| **TLS-AP-112** | Arjun Tree (Tella Maddhi) – Terminalia arjuna | `0.84` | `19.5` | `-4.4` | `53.2` | `27.57` | `27.77` | `0.73%` | `106.8` | `106.4` | `0.37%` | `13175.0` | `13171.4` | `24147.6` | `0.90` | `Grade A` | Krishna River Basin Agro-Forestry Belt |
| **TLS-AP-113** | Jackfruit (Panasa) – Artocarpus heterophyllus | `0.62` | `7.1` | `-11.9` | `63.5` | `15.77` | `15.64` | `0.82%` | `55.1` | `52.3` | `5.08%` | `1560.3` | `1397.9` | `2562.8` | `0.91` | `Grade B` | Araku Valley & Ananthagiri Hills |
| **TLS-AP-114** | Custard Apple (Sitaphal) – Annona squamosa | `0.58` | `12.3` | `-7.0` | `25.2` | `7.30` | `7.21` | `1.23%` | `16.4` | `17.0` | `3.66%` | `64.7` | `68.6` | `125.8` | `0.87` | `Grade B` | Seshachalam Biosphere Reserve |
| **TLS-AP-115** | Teak (Teku) – Tectona grandis | `0.66` | `10.5` | `-8.1` | `60.6` | `20.15` | `20.34` | `0.94%` | `65.6` | `66.8` | `1.83%` | `2961.1` | `3096.0` | `5676.0` | `0.90` | `Grade A` | Nallamala Forest Reserve |
| **TLS-AP-116** | Casuarina (Sarugudu) – Casuarina equisetifolia | `0.82` | `10.2` | `-8.4` | `69.3` | `28.51` | `28.03` | `1.68%` | `42.3` | `42.4` | `0.24%` | `2180.7` | `2154.7` | `3950.3` | `0.89` | `Grade A` | Krishna River Basin Agro-Forestry Belt |
| **TLS-AP-117** | Indian Sandalwood (Chandanam) – Santalum album | `0.92` | `14.1` | `-6.1` | `31.3` | `10.08` | `10.11` | `0.30%` | `32.9` | `32.2` | `2.13%` | `541.5` | `520.8` | `954.8` | `0.89` | `Grade A` | Seshachalam Biosphere Reserve |
| **TLS-AP-118** | Mahua / Butter Tree (Ippa) – Madhuca longifolia | `0.86` | `6.4` | `-13.2` | `72.7` | `22.08` | `22.50` | `1.90%` | `57.6` | `57.3` | `0.52%` | `3252.2` | `3278.9` | `6011.3` | `0.91` | `Grade A` | Araku Valley & Ananthagiri Hills |
| **TLS-AP-119** | Babul (Nalla Thumma) – Vachellia nilotica | `0.83` | `15.1` | `-5.7` | `39.9` | `14.12` | `13.49` | `4.46%` | `22.2` | `20.3` | `8.56%` | `315.8` | `253.6` | `464.9` | `0.86` | `Grade C` | Seshachalam Biosphere Reserve |
| **TLS-AP-120** | Neem (Vepa) – Azadirachta indica | `0.74` | `9.2` | `-9.3` | `63.6` | `20.05` | `20.75` | `3.49%` | `32.6` | `32.2` | `1.23%` | `841.5` | `849.4` | `1557.2` | `0.89` | `Grade B` | Seshachalam Biosphere Reserve |
| **TLS-AP-121** | Red Sanders (Rakta Chandanam) – Pterocarpus santalinus | `1.05` | `13.8` | `-6.2` | `46.2` | `15.88` | `15.98` | `0.63%` | `31.4` | `30.3` | `3.50%` | `876.5` | `822.6` | `1508.1` | `0.89` | `Grade B` | Seshachalam Biosphere Reserve |
| **TLS-AP-122** | Banyan (Marri) – Ficus benghalensis | `0.56` | `12.4` | `-6.9` | `63.3` | `26.12` | `25.90` | `0.84%` | `143.1` | `143.3` | `0.14%` | `14894.3` | `14812.2` | `27155.7` | `0.90` | `Grade A` | Krishna River Basin Agro-Forestry Belt |
| **TLS-AP-123** | Sacred Fig / Peepal (Raavi) – Ficus religiosa | `0.52` | `20.3` | `-4.2` | `44.5` | `21.46` | `21.66` | `0.93%` | `103.9` | `104.8` | `0.87%` | `6122.6` | `6283.2` | `11519.2` | `0.86` | `Grade A` | Nallamala Forest Reserve |
| **TLS-AP-124** | Mango (Mamidi) – Mangifera indica | `0.65` | `7.3` | `-11.6` | `68.9` | `20.46` | `20.38` | `0.39%` | `79.5` | `79.3` | `0.25%` | `4309.0` | `4271.5` | `7831.1` | `0.90` | `Grade A` | Seshachalam Biosphere Reserve |
| **TLS-AP-125** | Tamarind (Chinta) – Tamarindus indica | `0.90` | `8.8` | `-9.7` | `56.6` | `14.86` | `14.81` | `0.34%` | `51.0` | `50.4` | `1.18%` | `1821.5` | `1774.0` | `3252.3` | `0.92` | `Grade A` | Krishna River Basin Agro-Forestry Belt |
| **TLS-AP-126** | Indian Gooseberry / Amla (Usiri) – Phyllanthus emblica | `0.72` | `22.0` | `-3.9` | `20.1` | `9.55` | `9.74` | `1.99%` | `38.7` | `37.9` | `2.07%` | `555.2` | `543.4` | `996.2` | `0.86` | `Grade A` | Seshachalam Biosphere Reserve |
| **TLS-AP-127** | Pongamia / Indian Beech (Kanuga) – Pongamia pinnata | `0.68` | `9.7` | `-8.8` | `44.1` | `10.91` | `11.13` | `2.02%` | `47.5` | `47.7` | `0.42%` | `892.0` | `917.0` | `1681.2` | `0.91` | `Grade A` | Coringa Estuarine & Mangrove Belt |
| **TLS-AP-128** | Jamun / Black Plum (Neredu) – Syzygium cumini | `0.78` | `10.9` | `-7.8` | `51.3` | `15.09` | `14.55` | `3.58%` | `79.8` | `79.0` | `1.00%` | `3853.1` | `3646.0` | `6684.3` | `0.88` | `Grade B` | Coringa Estuarine & Mangrove Belt |
| **TLS-AP-129** | Arjun Tree (Tella Maddhi) – Terminalia arjuna | `0.84` | `20.9` | `-4.1` | `39.7` | `18.83` | `18.75` | `0.42%` | `127.9` | `128.1` | `0.16%` | `12911.5` | `12897.2` | `23644.9` | `0.88` | `Grade A` | Papikonda National Park |
| **TLS-AP-130** | Jackfruit (Panasa) – Artocarpus heterophyllus | `0.62` | `11.7` | `-7.3` | `58.2` | `20.37` | `20.30` | `0.34%` | `63.7` | `63.6` | `0.16%` | `2658.5` | `2641.5` | `4842.8` | `0.90` | `Grade A` | Araku Valley & Ananthagiri Hills |
| **TLS-AP-131** | Custard Apple (Sitaphal) – Annona squamosa | `0.58` | `9.4` | `-9.1` | `21.5` | `5.20` | `4.89` | `5.96%` | `14.7` | `13.9` | `5.44%` | `37.5` | `31.7` | `58.1` | `0.89` | `Grade C` | Nallamala Forest Reserve |
| **TLS-AP-132** | Teak (Teku) – Tectona grandis | `0.66` | `7.9` | `-10.8` | `65.6` | `18.95` | `19.42` | `2.48%` | `66.1` | `66.2` | `0.15%` | `2830.5` | `2907.6` | `5330.6` | `0.90` | `Grade A` | Nallamala Forest Reserve |
| **TLS-AP-133** | Casuarina (Sarugudu) – Casuarina equisetifolia | `0.82` | `19.8` | `-4.3` | `53.4` | `28.18` | `28.52` | `1.21%` | `44.0` | `41.6` | `5.45%` | `2328.4` | `2111.5` | `3871.1` | `0.88` | `Grade B` | Coringa Estuarine & Mangrove Belt |
| **TLS-AP-134** | Indian Sandalwood (Chandanam) – Santalum album | `0.92` | `11.0` | `-7.8` | `45.9` | `12.87` | `12.79` | `0.62%` | `25.7` | `27.3` | `6.23%` | `424.4` | `474.6` | `870.1` | `0.90` | `Grade C` | Seshachalam Biosphere Reserve |
| **TLS-AP-135** | Mahua / Butter Tree (Ippa) – Madhuca longifolia | `0.86` | `21.5` | `-4.0` | `45.4` | `23.31` | `23.22` | `0.39%` | `45.8` | `45.8` | `0.00%` | `2191.9` | `2183.6` | `4003.3` | `0.87` | `Grade A` | Araku Valley & Ananthagiri Hills |

---

## 6. How to Load and Execute this Benchmark in PORTA-TLS

1. Launch the web application via `npm run dev` and navigate to **PORTA-TLS** in your browser.
2. Click **LOAD 135 BENCHMARK** in either the **INVENTORY LOG** toolbar or the **ACCURACY & FIELD VALIDATION** control panel.
3. Observe:
   - All 135 Andhra Pradesh testing cases populate into the Tree Registry.
   - The validation engine automatically plots the **Measured vs. Ground Truth Linear Regression** ($R^2 = 0.9979$) and **Bland-Altman Error Residual Scatter Plot**.
   - The Dashboard **BIOMASS ACCUMULATION BY SPECIES** bar chart renders the carbon distribution across Neem, Red Sanders, Banyan, Peepal, Mango, Tamarind, Arjun, and other Andhra Pradesh native species.
4. Export the localized dataset as publication-ready **CSV** or **GeoJSON** with authentic GPS coordinates mapped directly to Andhra Pradesh forest reserves.
