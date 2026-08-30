# 🧭 Polaris DSS: Antarctic Iceberg & Sea-Ice Navigation System

**Polaris DSS** is an AI-powered Decision Support System designed for polar research vessels and icebreakers navigating the Antarctic Southern Ocean (Prydz Bay, Larsemann Hills, Bharati/Maitri Stations).

## 🚀 Key Features

- 🧊 **Iceberg Trajectory Forecasting**: Multi-horizon (24h, 48h, 72h) hydrodynamic drift predictions with dynamic uncertainty ellipses.
- 🗺️ **Polar Stereographic Interactive Canvas**: Dual map engines (High-performance Canvas Stereographic projection & Google Maps Satellite overlay).
- 🛣️ **Multi-Objective Route Optimization**: Evaluates direct vs. safety lead-following routes based on ice thickness, vessel Polar Class ratings, and Closest Point of Approach (CPA).
- 🧠 **Explainable AI Hazard Engine**: Transparent risk scoring matrix calculating sea-ice concentration, iceberg intercept risk, and weather vectors.
- ⚡ **Hazard Surge Simulation**: Real-time simulation of sudden iceberg drift spikes to test dynamic route recalculations.

## 🛠️ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run local dev server (Port 3000)
npm run dev

# 3. Build for production
npm run build
```

---
*Developed for Polar Research & Expeditions (MoES / NCPOR).*

