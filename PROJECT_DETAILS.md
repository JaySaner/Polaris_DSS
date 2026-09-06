# 🧭 Polaris DSS: Complete Project Specifications, Workflows & Technical Reference

## 📌 Project Overview
- **Project Name:** Polaris DSS (Antarctic Sea-Ice & Iceberg Navigation Decision Support System)
- **Friendly Name:** `Polaris DSS` | *Polar Iceberg & Sea-Ice Navigation System*
- **Problem Statement:** 26059 | *AI-Enabled Antarctic Sea-Ice, Iceberg Trajectory, and Navigation Decision Support System*
- **Institutional Context:** Ministry of Earth Sciences (**MoES**) / National Centre for Polar and Ocean Research (**NCPOR**)
- **Theme:** Transportation & Logistics (Antarctic Maritime Navigation & Safety)
- **Primary Missions Serviced:**
  - **Bharati Station:** Larsemann Hills, East Antarctica ($69.41^\circ\text{S}, 76.19^\circ\text{E}$)
  - **Maitri Station:** Princess Astrid Coast, Queen Maud Land ($70.77^\circ\text{S}, 11.73^\circ\text{E}$)
- **Target Vessels:** IMO Polar Code Class **PC1 to PC7** Vessels (e.g., R/V *ORV Sagar Nidhi*, Heavy Icebreakers, Polar Expeditions Supply Ships).

---

## 👥 Dual Operational Workflows

Polaris DSS features a dual-mode interface designed for two distinct user personas: **Ship Captains** (Navigators focused on rapid, low-cognitive-load decision making) and **Polar Researchers** (Scientists focused on high-resolution data analysis and model validation).

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                            POLARIS DSS ENGINE                               │
 └──────────────────────┬───────────────────────────────┬──────────────────────┘
                        │                               │
       🚢 SHIP CAPTAIN (NAVIGATOR) VIEW       🔬 POLAR RESEARCHER VIEW
       • 5–10 Second Decision Awareness       • Multi-Source Data Analysis
       • Safe Passage Corridor Focus          • 72h Predictive Scrubber
       • Reactive Hazard Rerouting            • XAI Risk Weight Matrix Tuning
       • Simplified Telemetry & CPA           • Ground-Truth Validation (MAE/RMSE)
```

---

### 🚢 1. Ship Captain Workflow (Bridge Navigation Mode)

> **Core Principle:** *"CAPTAIN SEES THE DECISION, NOT THE COMPLEXITY."*
> The Captain must understand the current ice situation and route safety within **5 to 10 seconds**.

#### Step 1: Initial Situational Awareness & Unobstructed Map
- Upon opening the dashboard, the Captain sees an **unobstructed, clean Antarctic Polar Map** showing the vessel fix (*ORV Sagar Nidhi*), live iceberg positions, and sea-ice density.
- A concise guidance note in the Passage Planner panel prompts: *"Please select your target station & route options below to calculate and display the route on the map."*

#### Step 2: Destination Selection & Route Priority Configuration
- **Select Origin:** Pick departure location (default: *Current Fix: ORV Sagar Nidhi (Prydz Bay)* or Cape Town/Hobart/Punta Arenas).
- **Select Destination:** Click quick chips or dropdown to select target station (e.g., **🇮🇳 Bharati Station** or **🇮🇳 Maitri Station**).
- **Select Route Objective:** Choose navigation priority:
  - 🛡️ **Safety First:** Maximum ice avoidance, Lead/Polynya bypass, mandatory $CPA > 5\text{ NM}$.
  - 🧭 **Balanced Optimal:** Optimal trade-off between fuel efficiency, distance, and safety.
  - 🔥 **Fuel Saver:** ECO mode minimizing engine load against heavy pack ice.
  - ⚡ **Express Passage:** Direct high-speed transit for urgent missions.

#### Step 3: Passage Corridor Inspection & Fullscreen Navigation
- The AI pathfinding engine instantly computes candidates and displays the **Active Passage Corridor** banner at the top of the map.
- The Captain can expand the map into **100% Fullscreen Mode** using the top-right toolbar button (<kbd>id="btn-toggle-fullscreen"</kbd>) for immersive bridge display.
- Inspect key telemetry metrics on the bottom telemetry ribbon:
  - **Safety Index:** e.g., `65/100 (CAUTION)` or `85/100 (SAFE)`.
  - **Est. Fuel Burn:** e.g., `25.6% (218 kL)`.
  - **Transit ETA & Distance:** e.g., `2588 km (9.2 days)`.

#### Step 4: Reactive Surge Hazard & Instant Rerouting
- If a sudden iceberg drift surge occurs (or when simulated via the **Surge** trigger), the engine fires a high-priority warning: *"Iceberg B-001 Approaching Planned Route Corridor"*.
- The Captain can click **Recalculate Safe Corridor** or select an alternative route (*Route B*) from the top banner dropdown to bypass the hazard area safely.

---

### 🔬 2. Polar Researcher Workflow (Scientific Analysis Mode)

> **Core Principle:** *"DEEP DIAGNOSTICS, SATELLITE VALIDATION & MODEL TRANSPARENCY."*
> Scientists can inspect raw satellite feeds, physics model parameters, and tune machine learning weights.

#### Step 1: Mode Switch & Detailed Data Feeds Review
- Click the **Role Toggle** in the top header or vertical sidebar to switch to **Researcher View** (purple badge icon).
- Navigate to **Data Feeds Page** (`DataSourcesPage.tsx`) to check real-time satellite ingestion status for:
  - ESA Sentinel-1 SAR (Synthetic Aperture Radar)
  - NASA SCP Scatterometer Climate Record
  - AMSR2 Passive Microwave Sea Ice Concentration
  - NOAA GFS Metocean Wind/Wave models

#### Step 2: 72-Hour Predictive Sea-Ice & Iceberg Drift Scrubber
- Open the **72h Forecasts Page** (`ForecastPage.tsx`) or use the map time scrubber buttons (`0h`, `+6h`, `+12h`, `+24h`, `+48h`, `+72h`).
- Observe temporal sea-ice growth/decay, lead opening dynamics, and vector current drag effects on tabular icebergs.

#### Step 3: Satellite Animation & Iceberg Dossier Inspection
- Open the **Iceberg Tracker Page** (`IcebergTrackerPage.tsx`) or click any iceberg marker on the map to open the **Iceberg Modal**.
- Play historical & predicted drift trajectory animations (1x, 2x, 5x, 10x speeds).
- Review physical parameters: mass ($Mt$), area ($km^2$), draft ($m$), drift velocity ($kts$), and positional uncertainty ellipses (+2.4 NM to +8.5 NM).

#### Step 4: Explainable AI (XAI) Weight Matrix Tuning
- Navigate to the **Explainable AI Page** (`ExplainableAIPage.tsx`).
- Use interactive sliders to adjust hazard model weight factors:
  - *Sea-Ice Concentration Weight* ($0-100\%$)
  - *Iceberg Proximity & CPA Weight* ($0-100\%$)
  - *Ice Thickness & Ridging Weight* ($0-100\%$)
  - *Wind & Wave Drag Weight* ($0-100\%$)
- Observe real-time changes to candidate route safety scores and evaluate model sensitivity.

#### Step 5: Model Accuracy Validation (Ground-Truth Benchmarks)
- Navigate to **Model Performance Page** (`ModelPerformancePage.tsx`).
- Analyze model accuracy KPIs against satellite ground-truth:
  - *Iceberg Drift MAE:* $1.42\text{ NM}$
  - *Sea-Ice Concentration RMSE:* $4.8\%$
  - *Route ETA Variance:* $3.2\%$

---

## 🎛️ Comprehensive Catalog of System Inputs & Parameters

The table below lists all user inputs, selectable options, parameters, and interactive controls supported by Polaris DSS:

| Category | Input / Control | Options / Range | Functionality |
| :--- | :--- | :--- | :--- |
| **User Role** | Role Switcher Toggle | `Captain (Navigator)` \| `Researcher` | Switches UI complexity, telemetry density, and active toolsets |
| **Passage Origin** | Departure Dropdown | `Prydz Bay Fix`, `Cape Town`, `Hobart`, `Punta Arenas` | Sets starting coordinates for polar voyage pathfinding |
| **Destination** | Target Station Selection | `Bharati (IN)`, `Maitri (IN)`, `McMurdo (US)`, `Rothera (GB)` | Sets arrival waypoint for route calculation |
| **Quick Station** | Station Quick Chips | `IN Bharati`, `IN Maitri`, `US McMurdo`, `GB Rothera` | One-click instant destination selection buttons |
| **Routing Objective**| Objective Selector Cards | `Safety First`, `Balanced`, `Fuel Saver`, `Express` | Configures A* pathfinder cost function weights |
| **Active Route** | Top Banner Dropdown | `★ Route B (Safety Bypass)`, `Route A (Direct)` | Swaps active route on map and recalculates telemetry |
| **Map Provider** | Map Provider Toggle | `Polar Vector (Canvas)`, `Google Maps Satellite` | Switches basemap projection and satellite tile provider |
| **Map Layers** | Quick Layer Pills | `🧊 Sea Ice`, `▲ Icebergs`, `⤑ Drift Paths`, `🛡️ Risk Grid`, `🚢 Route`, `🛰️ Satellite` | Toggles individual visual overlay layers on the map |
| **Map Display** | Fullscreen Toggle Button | `Enter Fullscreen` / `Exit Fullscreen (Esc)` | Expands canvas/Google map to 100% monitor resolution |
| **Map Navigation** | Zoom & Center Buttons | `Zoom In (+)`, `Zoom Out (-)`, `Center Vessel`, `Reset Polar Center` | Controls polar map pan, zoom, and spatial extent |
| **Forecast Time** | Scrubber Time Horizon | `0h`, `+6h`, `+12h`, `+24h`, `+48h`, `+72h` | Scrubs predictive sea-ice and iceberg drift models |
| **Risk Matrix** | XAI Hazard Weight Sliders | `0% to 100%` for Sea Ice, CPA, Thickness, Wind/Waves | Customizes safety index formula weights |
| **Simulation** | Surge Trigger Button | `Surge (Simulate Hazard)` | Accelerates iceberg drift into corridor to test rerouting |
| **Vessel Specs** | Vessel Configuration Inputs| `Length (m)`, `Beam (m)`, `Draft (m)`, `Open Speed (kts)`, `Ice Class (PC1-PC7)` | Customizes vessel hydrodynamic & icebreaking parameters |

---

## 🚀 Complete Feature Catalog

### 1. 🗺️ Dual-Engine Polar Interactive Map
- **South Polar Stereographic Canvas:** Custom 2D Web Canvas tailored for Antarctic latitudes ($-60^\circ\text{S}$ to $-75^\circ\text{S}$).
- **Google Maps Satellite Integration:** Integrated Google Maps API Satellite mode with custom polar markers.
- **13 Interactive Layers:** Sea Ice, Predicted Ice, Icebergs, Trajectory Vectors, Uncertainty Cones, Risk Grid, Recommended Route, Alternative Routes, Stations, Vessel Fix, Wind Field, Current Drag, Graticule Net.

### 2. 🧊 Hydrodynamic Iceberg Drift Engine
- **Physics-Based Drift Modeling:** Ingestion of wind drag ($C_{10}$), ocean current drag ($C_w$), Coriolis deflection, and tabular iceberg geometry.
- **Uncertainty Ellipses:** Spatial confidence bounds expanding over time ($+2.4\text{ NM}$ at 24h to $+8.5\text{ NM}$ at 72h).

### 3. 🎬 Iceberg Animation Player (NASA SCP Data)
- **Time-Lapse Trajectory Playback:** Step through historical observations and predicted drift paths with variable speed controls ($1\text{x}$ to $10\text{x}$).

### 4. ❄️ Sea-Ice & Meteorological Predictive Scrubber
- **High-Resolution Concentration Grids:** $0\%$ to $100\%$ pack ice density visualization with thickness and lead openness estimations.

### 5. 🧭 Multi-Objective Route Optimization (Passage Planner)
- **A* Polar Pathfinding:** Computes collision-free corridors around ice fields and hazard polygons.
- **4 Optimization Modes:** *Safety First*, *Balanced*, *Fuel Saver*, *Express Passage*.

### 6. 📊 Side-by-Side Route Comparison & Analytics
- Multi-route comparison matrix evaluating distance ($NM$), transit time ($hrs$), fuel burn ($kL$), max ice density ($\%$), and $CPA$ ($NM$).

### 7. 🧠 Explainable AI (XAI) Navigation Risk Engine
- Transparent safety score calculation ($0-100$) with customizable hazard weight sliders.

### 8. 📈 AI Validation & Telemetry Benchmarks
- Real-time model accuracy metrics comparing AI predictions against satellite ground truth ($MAE = 1.42\text{ NM}$, $RMSE = 4.8\%$).

### 9. 📡 Active Satellite Data Feeds Monitor
- Operational tracker for ESA Sentinel-1 SAR, NASA SCP, AMSR2, NOAA GFS, and OSCAR currents.

### 10. 🚢 Polar Class Vessel Profile Management
- Customization of IMO Polar Code PC1–PC7 parameters, fuel burn curves, and icebreaking capability.

### 11. 🚨 Reactive Hazard Surge Scenario Simulator
- Instantaneous simulation of sudden iceberg surge events with dynamic alert triggers.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | React 19, TypeScript | Component architecture & strict type safety |
| **Build Tool** | Vite 6 | Fast HMR & optimized production bundling |
| **Styling** | Tailwind CSS v4 | Dark polar glassmorphic UI aesthetics |
| **Iconography** | Lucide React | Maritime, weather, and system UI icons |
| **Charts & Canvas** | Custom 2D Canvas API, Recharts | Polar stereographic map & telemetry analytics |
| **AI Integration** | `@google/genai` | Automated voyage summary & anomaly diagnostics |

---

## 📁 Repository Structure

```
PS2_iceberg/
├── PROJECT_DETAILS.md            # Complete project specs, workflows, inputs & architecture
├── README.md                     # Quick start & repository summary
├── package.json                  # Dependencies & npm scripts
├── src/
│   ├── App.tsx                   # Main layout container & state coordinator
│   ├── components/
│   │   ├── header/               # Top command header, polar clocks, role toggle
│   │   ├── sidebar/              # NavigationSidebar, passage planner, layer pills
│   │   ├── map/                  # AntarcticMap canvas & GoogleMapsAntarcticProvider
│   │   ├── modals/               # UserGuideModal, IcebergModal, SeaIceModal, WaypointModal
│   │   └── telemetry/            # VoyageTelemetryBar & dynamic alert ribbons
│   ├── data/                     # Antarctic station coordinates & iceberg default datasets
│   ├── pages/                    # 8 Operational Modules (Home, Tracker, Forecast, Routes, XAI, etc.)
│   ├── services/                 # Physics models, route pathfinder, risk engine
│   ├── types/                    # TypeScript interfaces (Vessel, Iceberg, Route, Risk)
│   └── utils/                    # Geodesic math & polar stereographic projection formulas
```

---

## ⚙️ How to Build & Run

```bash
# 1. Install dependencies
npm install

# 2. Launch dev server (Port 3001)
npm run dev

# 3. Type check & linting
npm run lint

# 4. Build production distribution
npm run build
```

---
*Polaris DSS — Supporting Safe Indian Antarctic Expeditions (NCPOR / MoES).*
