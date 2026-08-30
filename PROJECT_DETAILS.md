# 🧭 Polaris DSS: Complete Project Specifications & Feature Catalog

## 📌 Project Overview
- **Project Name:** Polaris DSS (Antarctic Sea-Ice & Iceberg Navigation Decision Support System)
- **Friendly Name:** `Polaris DSS` | *Polar Iceberg & Sea-Ice Navigation System*
- **Primary Domain:** Polar Maritime AI Navigation, Ice Hydrodynamics, Voyage Route Optimization
- **Institutional Context:** Developed for Antarctic Research Expeditions (Ministry of Earth Sciences - MoES / NCPOR) servicing expedition routes to **Bharati Station** (Larsemann Hills, 69.41°S 76.19°E) and **Maitri Station** (Princess Astrid Coast, 70.77°S 11.73°E).
- **Target Vessels:** IMO Polar Code Class PC1 to PC7 Vessels (e.g., R/V Bharati Expedition Vessels, Heavy Icebreakers, Polar Supply Ships).

---

## 🚀 Complete Feature Catalog

### 1. 🗺️ Dual-Engine Polar Interactive Map & Layer Controls
- **South Polar Stereographic Projection Canvas:** Custom high-performance 2D/3D Web Canvas optimized for high-latitude Antarctic navigation (-60°S to -75°S).
- **Google Maps Satellite Overlay:** One-click toggle between custom Polar Canvas and Google Maps Satellite view for shoreline and ice-shelf visual reference.
- **Categorized Map Overlays (13 Selectable Layers):**
  - 🧊 *Sea-Ice Concentration Heatmap (0-100% density grid)*
  - 🔮 *Predicted Sea-Ice Expansion (+72h forecast grid)*
  - 📍 *Iceberg Observation Fixes (Exact latitude/longitude fixes)*
  - ↗️ *Iceberg Drift Trajectory Vectors (Predicted drift lines)*
  - ⭕ *Positional Uncertainty Ellipses (Dynamic confidence zones)*
  - ⚠️ *Polar Navigation Risk Grid (Color-coded hazard cells)*
  - 🛣️ *Recommended Route Corridor (Active safe passage path)*
  - 🔀 *Alternative Route Corridors (Direct Great Circle & Express options)*
  - 🏛️ *Antarctic Research Station Markers (Bharati, Maitri, McMurdo, Rothera, etc.)*
  - 🚢 *Live Vessel Marker & Real-Time Heading Arrow*
  - 💨 *10m Wind Vector Field (Metocean surface winds)*
  - 🌊 *ACC Ocean Current Flow Vectors (Circumpolar current drag)*
  - 🌐 *Polar Latitude/Longitude Graticule Net*
- **Interactive Element Inspection:** Click any research station, iceberg observation, sea-ice grid cell, or route waypoint to trigger dedicated modal popups.

---

### 2. 🧊 Hydrodynamic Iceberg Trajectory Forecasting Engine
- **Physics-Based Drift Model:** Simulates iceberg movement using surface wind stress, ocean current drag, Coriolis force acceleration, and melt dynamics.
- **Multi-Horizon Forecasts:** Computes projected positions at **+24h, +48h, and +72h** horizons.
- **Dynamic Uncertainty Cones:** Visualizes expanding spatial error bounds (+2.4 NM at 24h to +8.5 NM at 72h).
- **Tabular & Pinnacled Iceberg Tracking:** Pre-loaded tracking for major tabular bergs (B-15, A-68, B-001, B-002, etc.).

---

### 3. 🎬 Iceberg Animation Player & Satellite Playback (NASA SCP)
- **Time-Lapse Trajectory Player:** Play, pause, step-forward, and scrub through historical and predicted iceberg positions.
- **Playback Speed Control:** Adjust animation speed (1x, 2x, 5x, 10x).
- **Physical Diagnostics Modal:** Displays iceberg length, width, area ($km^2$), draft ($m$), mass ($Mt$), drift speed ($knots$), heading ($^\circ$), Closest Point of Approach ($CPA$), and risk rating (*EXTREME, HIGH, MODERATE, LOW*).

---

### 4. ❄️ Sea-Ice & Meteorological Predictive Scrubber (72h Forecasts)
- **Sea-Ice Concentration (SIC) Heatmap:** High-resolution spatial grid rendering ice density from 0% (open water) to 100% (heavy fast ice).
- **Thickness & Ridge Modeling:** Calculates estimated ice thickness ($m$), lead openness, and ridging severity.
- **72h Timeline Scrubber:** Interactive buttons (`0h`, `+6h`, `+12h`, `+24h`, `+48h`, `+72h`) with auto-play forecast simulation.
- **Metocean Vector Field Overlay:** Synchronized 10m wind speed/direction and ocean current vectors.
- **Sea-Ice Inspection Modal:** Click any grid point to view concentration, surface temperature ($^\circ C$), salinity, snow depth, and vessel ice-class suitability.

---

### 5. 🧭 Multi-Objective Route Optimization Engine (Passage Planner)
- **A* Polar Pathfinding Algorithm:** Calculates collision-free maritime routes through dynamic ice fields.
- **4 Selectable Routing Objectives:**
  - 🛡️ **Safety First (IMO PC5 Lead Bypass):** Maximum ice avoidance, prioritizes polynyas/leads, maintains mandatory $CPA > 5\text{ NM}$ from icebergs.
  - 🧭 **Balanced Optimal (Recommended):** Evaluates optimal trade-off between fuel efficiency, distance, and safety rating.
  - 🔥 **Fuel Saver (ECO Mode):** Minimizes fuel consumption ($L/hr$) by avoiding heavy ice resistance and leveraging ocean currents.
  - ⚡ **Fastest Express Passage:** Direct Great Circle transit for urgent medical/logistics missions when ice cover permits.
- **Dynamic Departure & Destination Selection:** Choose departure ports (*Prydz Bay Fix, Cape Town, Hobart, Punta Arenas*) and destination stations (*Bharati, Maitri, McMurdo, Rothera*) with one-click quick chips.

---

### 6. 📊 Route Comparison & Safety Analytics
- **Side-by-Side Route Metrics:** Comprehensive analytics comparing Route A (Direct), Route B (Safety Bypass), and Route C (Express Speed).
- **Key Metrics Evaluated:** Total Distance ($NM$), Estimated Transit Time ($hours$), Bunker Fuel Consumption ($tons$), Max Sea-Ice Concentration ($\%$), Minimum Berg $CPA$ ($NM$), and Overall Safety Index ($0-100$).
- **Interactive Waypoint Breakdown Modal:** View individual leg waypoints with coordinates, segment length, target speed, local ice density, and nautical notes.

---

### 7. 🧠 Explainable AI (XAI) Navigation Risk Engine
- **Transparent Safety Scoring Matrix:** Calculates overall voyage safety score ($0-100$) based on weighted hazard parameters:
  - *Sea-Ice Concentration Weight*
  - *Iceberg Proximity & CPA Weight*
  - *Ice Thickness & Ridging Weight*
  - *Wind & Sea State Severity Weight*
- **Interactive Risk Weight Sliders:** Navigators can custom-tune risk weight priorities and observe instantaneous score updates across candidate routes.
- **Color-Coded Risk Grid Overlay:** Visual map grid colored Green ($0-30$ low risk), Yellow ($31-60$ moderate caution), and Red ($61-100$ extreme hazard).

---

### 8. 📈 AI Validation & Telemetry Performance Metrics
- **Ground-Truth Validation:** Real-time benchmark metrics comparing AI drift model predictions against satellite ground truth.
- **Key Performance Indicators (KPIs):**
  - *Iceberg Trajectory Error (MAE in NM)*
  - *Sea-Ice Concentration RMSE (%)*
  - *Route ETA Variance (%)*
  - *Hazard Detection Recall Rate (%)*
- **Live Event Telemetry Log:** Stream log recording satellite passes, sensor updates, and model recalibrations.

---

### 9. 📡 Active Satellite Data Feeds Monitor
- **Satellite Feed Ingestion Tracker:** Real-time operational status, latency, coverage, and spatial resolution for key satellite feeds:
  - 🛰️ *NASA SCP (Scatterometer Climate Record)*
  - 🛰️ *ESA Sentinel-1 SAR (Synthetic Aperture Radar)*
  - 🛰️ *AMSR2 Passive Microwave Sea Ice Feed*
  - 🌤️ *NOAA/NCEP GFS Metocean Model*
  - 🌊 *OSCAR Ocean Surface Current Analysis*

---

### 10. 🚢 Polar Class Vessel Profile Management
- **IMO Polar Code (PC1 - PC7) Support:** Default profile tuned for R/V Bharati Expedition Vessel (Polar Class PC5).
- **Customizable Vessel Parameters:**
  - Length ($m$), Beam ($m$), Draft ($m$), Displacement ($Tons$)
  - Open Water Cruising Speed vs Icebreaking Speed ($Knots$)
  - Max Ice Thickness Capability ($m$)
  - Fuel Burn Rates ($L/hr$) under varying ice loads
  - Hull Reinforcement & Engine Output ($kW$)

---

### 11. 🚨 Reactive Hazard Surge Simulation Engine
- **"Simulate Berg Drift Surge" Button:** One-click scenario simulator that accelerates an iceberg (+1.2 knots) and redirects it into the active vessel corridor.
- **Dynamic Reroute Banner:** Immediately fires a high-priority critical alert, invalidates unsafe routes, and auto-switches active navigation to the safe lead bypass corridor.

---

### 12. ⏱️ Synchronized Telemetry Clocks & UI Guidance
- **Dual Polar Clocks:** Synchronized UTC clock alongside Indian Antarctic Station Time (**STN UTC+5:00** for Bharati & Maitri).
- **Interactive UI Guide Modal:** Built-in modal popup explaining map navigation, layer controls, color definitions, and system usage.
- **IMO Polar Code Compliance Footer:** Real-time regulatory compliance indicator.

---

## 🛠️ Technology Stack & Dependencies

| Layer | Technology / Library | Purpose |
| :--- | :--- | :--- |
| **UI Framework** | React 19, TypeScript | Reactive component architecture & strict typing |
| **Build System** | Vite 6 | Lightning-fast HMR and bundling |
| **Styling** | Tailwind CSS v4 | Dark-mode polar aesthetic, custom glassmorphism |
| **Icons** | Lucide React | Crisp maritime & meteorological UI iconography |
| **Visualizations** | Recharts, Custom Canvas API | Real-time telemetry charts & polar map canvas |
| **AI Integration** | Google GenAI SDK (`@google/genai`) | Automated voyage summaries & anomaly narrative generation |

---

## 📁 Repository Structure

```
PS2_iceberg/
├── PROJECT_DETAILS.md            # Comprehensive project documentation & complete feature catalog
├── README.md                     # Quick start & repository overview
├── index.html                    # HTML entry point with Polaris DSS tab title & metadata
├── package.json                  # NPM dependencies & scripts (polaris-dss-antarctic-navigator)
├── tsconfig.json                 # TypeScript compiler configuration
├── vite.config.ts                # Vite build settings
└── src/
    ├── App.tsx                   # Core layout, tab state, & route calculation pipeline
    ├── components/
    │   ├── header/               # Header command bar, synchronized polar clocks, UI Guide trigger
    │   ├── sidebar/              # Passage planner, layer controls, forecast scrubber, vessel specs
    │   ├── map/                  # Antarctic stereographic map canvas & satellite provider
    │   ├── modals/               # UserGuideModal, IcebergModal, SeaIceModal, WaypointModal
    │   └── telemetry/            # Telemetry status ribbons & alert notifications
    ├── data/                     # Antarctic station coordinates & iceberg default datasets
    ├── pages/                    # 8 Core Operational Modules
    │   ├── HomeDashboard.tsx     # Main tactical voyage map view
    │   ├── IcebergTrackerPage.tsx# Satellite iceberg animation & drift details
    │   ├── ForecastPage.tsx      # 72h sea-ice & weather forecast grids
    │   ├── RouteAnalysisPage.tsx # Route A vs B vs C comparison & safety metrics
    │   ├── ExplainableAIPage.tsx # Interactive risk weight matrix tuning
    │   ├── ModelPerformancePage.tsx # Model accuracy validation & telemetry metrics
    │   ├── DataSourcesPage.tsx   # Active satellite feed ingestion status
    │   └── VesselProfilePage.tsx # Polar Class vessel parameters & hull specs
    ├── services/                 # Physics models, risk engine, & route optimizer
    ├── types/                    # Core TypeScript definitions (Vessel, Iceberg, Route, Risk)
    └── utils/                    # Geodesic math, polar stereographic projections
```

---

## ⚙️ How to Run & Verify

```bash
# 1. Install Node modules
npm install

# 2. Start local development server (Port 3000)
npm run dev

# 3. Verify TypeScript types
npm run lint

# 4. Build production bundle
npm run build
```

---
*Polaris DSS — Supporting Safe Indian Antarctic Expeditions (NCPOR / MoES).*
