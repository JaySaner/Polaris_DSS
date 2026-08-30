import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  GeoCoordinate,
  MapLayerVisibility,
  IcebergObservation,
  IcebergForecast,
  CandidateRoute,
  VesselProfile,
  SeaIceGridPoint,
  RiskGridCell,
  ResearchStation,
  RouteWaypoint,
} from '../../types';
import {
  projectSouthPolarStereographic,
  unprojectSouthPolarStereographic,
  formatPolarCoordinates,
  calculateHaversineDistanceKm,
} from '../../utils/geoUtils';
import {
  ANTARCTIC_COASTLINE_COORDS,
  ANTARCTIC_RESEARCH_STATIONS,
} from '../../data/antarcticData';
import { icebergTrajectoryModel } from '../../services/icebergTrajectoryModel';
import { seaIceModel } from '../../services/seaIceModel';
import {
  Navigation,
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  AlertTriangle,
  Info,
  Shield,
  Anchor,
  Wind,
  Waves,
  Eye,
  Sliders,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Crosshair,
  Ship,
} from 'lucide-react';

interface AntarcticMapProps {
  layers: MapLayerVisibility;
  onToggleLayer: (layerKey: keyof MapLayerVisibility) => void;
  vessel: VesselProfile;
  icebergs: IcebergObservation[];
  activeRoute: CandidateRoute | null;
  allRoutes: CandidateRoute[];
  seaIceGrid: SeaIceGridPoint[];
  riskGrid: RiskGridCell[];
  selectedHorizon: number; // 0, 6, 12, 24, 48, 72
  onSelectStation: (station: ResearchStation, role: 'start' | 'dest') => void;
  onSelectIceberg: (berg: IcebergObservation, forecast: IcebergForecast) => void;
  onSelectSeaIcePoint: (point: SeaIceGridPoint) => void;
  onSelectWaypoint: (waypoint: RouteWaypoint) => void;
  mapProviderType: 'antarctic-polar' | 'google-maps-satellite';
}

export const AntarcticMap: React.FC<AntarcticMapProps> = ({
  layers,
  onToggleLayer,
  vessel,
  icebergs,
  activeRoute,
  allRoutes,
  seaIceGrid,
  riskGrid,
  selectedHorizon,
  onSelectStation,
  onSelectIceberg,
  onSelectSeaIcePoint,
  onSelectWaypoint,
  mapProviderType,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredCoords, setHoveredCoords] = useState<GeoCoordinate | null>(null);
  const [hoveredItem, setHoveredItem] = useState<{ title: string; subtitle: string; x: number; y: number } | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 800, height: 600 });
  const [showLegend, setShowLegend] = useState<boolean>(true);

  // Resize observer for responsive canvas
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: Math.floor(entry.contentRect.width),
          height: Math.floor(entry.contentRect.height),
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const centerX = dimensions.width / 2 + pan.x;
  const centerY = dimensions.height / 2 + pan.y;
  const baseRadius = (Math.min(dimensions.width, dimensions.height) * 0.44) * zoom;

  // Iceberg forecasts computed for all active icebergs
  const icebergForecasts = useMemo(() => {
    return icebergs.map((b) => ({
      observation: b,
      forecast: icebergTrajectoryModel.predictTrajectory(
        b,
        activeRoute ? activeRoute.waypoints : undefined,
        vessel.currentPosition
      ),
    }));
  }, [icebergs, activeRoute, vessel]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    // 1. Clear & Background: Deep Polar Ocean Abyss
    ctx.fillStyle = '#040914';
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    // Ocean Ring Gradient
    const oceanGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, baseRadius * 1.1);
    oceanGrad.addColorStop(0, '#07152D');
    oceanGrad.addColorStop(0.5, '#0A1C3C');
    oceanGrad.addColorStop(0.85, '#061327');
    oceanGrad.addColorStop(1, '#030814');
    ctx.fillStyle = oceanGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius * 1.04, 0, Math.PI * 2);
    ctx.fill();

    // 2. Graticule Lat/Lon Grid
    if (layers.graticule) {
      drawGraticule(ctx, centerX, centerY, baseRadius);
    }

    // 3. Sea Ice Layer (Current or Forecast Heatmap)
    if (layers.seaIce || layers.predictedSeaIce) {
      drawSeaIceHeatmap(ctx, seaIceGrid, centerX, centerY, baseRadius, selectedHorizon);
    }

    // 4. Dynamic Risk Grid Layer
    if (layers.navigationRiskGrid) {
      drawRiskGrid(ctx, riskGrid, centerX, centerY, baseRadius);
    }

    // 5. Ocean Currents & Wind Vectors
    if (layers.oceanCurrents) {
      drawCurrentVectors(ctx, centerX, centerY, baseRadius);
    }
    if (layers.windVectors) {
      drawWindVectors(ctx, centerX, centerY, baseRadius);
    }

    // 6. Antarctic Coastline & Glacial Ice Shelves
    drawAntarcticaLandmass(ctx, centerX, centerY, baseRadius);

    // 7. Alternative & Active Routes
    if (layers.alternativeRoutes && allRoutes.length > 0) {
      allRoutes.forEach((route) => {
        if (!route.isRecommended) {
          drawRoute(ctx, route, centerX, centerY, baseRadius, false);
        }
      });
    }
    if (layers.recommendedRoute && activeRoute) {
      drawRoute(ctx, activeRoute, centerX, centerY, baseRadius, true);
    }

    // 8. Iceberg Trajectories & Uncertainty Cones
    if (layers.predictedIcebergTrajectories) {
      icebergForecasts.forEach(({ forecast }) => {
        drawIcebergTrajectory(ctx, forecast, centerX, centerY, baseRadius, layers.uncertaintyCones);
      });
    }

    // 9. Iceberg Markers
    if (layers.icebergs) {
      icebergs.forEach((b) => {
        drawIcebergMarker(ctx, b, centerX, centerY, baseRadius);
      });
    }

    // 10. Research Stations
    if (layers.researchStations) {
      ANTARCTIC_RESEARCH_STATIONS.forEach((station) => {
        drawStationMarker(ctx, station, centerX, centerY, baseRadius);
      });
    }

    // 11. Vessel Marker
    if (layers.vessel) {
      drawVesselMarker(ctx, vessel, centerX, centerY, baseRadius);
    }

    // 12. Compass Rose & Scale Bar
    drawCompassAndLegend(ctx, dimensions.width, dimensions.height);

  }, [
    dimensions,
    centerX,
    centerY,
    baseRadius,
    zoom,
    pan,
    layers,
    seaIceGrid,
    riskGrid,
    icebergs,
    icebergForecasts,
    activeRoute,
    allRoutes,
    vessel,
    selectedHorizon,
  ]);

  // Helper: Draw Graticule
  const drawGraticule = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);

    const lats = [-80, -70, -65, -60, -55];
    lats.forEach((lat) => {
      const proj = projectSouthPolarStereographic({ lat, lon: 0 }, cx, cy, r, -50.0);
      const rad = Math.hypot(proj.x - cx, proj.y - cy);
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.font = '9px monospace';
      ctx.fillText(`${Math.abs(lat)}°S`, cx + rad + 4, cy - 2);
    });

    for (let lon = 0; lon < 360; lon += 30) {
      const proj = projectSouthPolarStereographic({ lat: -50, lon }, cx, cy, r, -50.0);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(proj.x, proj.y);
      ctx.stroke();

      ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
      ctx.font = '8px monospace';
      const label = lon === 0 ? '0° PM' : lon === 180 ? '180°' : lon > 180 ? `${360 - lon}°W` : `${lon}°E`;
      ctx.fillText(label, proj.x + 3, proj.y - 3);
    }
    ctx.restore();
  };

  // Helper: Draw Antarctica Landmass & Ice Shelves
  const drawAntarcticaLandmass = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
    ctx.save();
    if (ANTARCTIC_COASTLINE_COORDS.length === 0) return;

    // Glowing ice shelf edge
    ctx.shadowColor = 'rgba(56, 189, 248, 0.4)';
    ctx.shadowBlur = 15;

    ctx.beginPath();
    ANTARCTIC_COASTLINE_COORDS.forEach((coord, idx) => {
      const proj = projectSouthPolarStereographic(coord, cx, cy, r, -50.0);
      if (idx === 0) ctx.moveTo(proj.x, proj.y);
      else ctx.lineTo(proj.x, proj.y);
    });
    ctx.closePath();

    // Glacial Ice Sheet Gradient
    const iceGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, r * 0.7);
    iceGrad.addColorStop(0, '#FFFFFF'); // Plateau ice
    iceGrad.addColorStop(0.5, '#E0F2FE');
    iceGrad.addColorStop(0.85, '#BAE6FD');
    iceGrad.addColorStop(1, '#7DD3FC');
    ctx.fillStyle = iceGrad;
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Inner contour ring
    ctx.strokeStyle = 'rgba(14, 165, 233, 0.25)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.15, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EAST ANTARCTICA', cx + r * 0.25, cy + r * 0.1);
    ctx.fillText('WEST ANTARCTICA', cx - r * 0.25, cy - r * 0.1);
    ctx.fillText('SOUTH POLE (90°S)', cx, cy + 14);

    // Center Crosshair
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy);
    ctx.lineTo(cx + 6, cy);
    ctx.moveTo(cx, cy - 6);
    ctx.lineTo(cx, cy + 6);
    ctx.stroke();

    ctx.restore();
  };

  // Helper: Draw Sea-Ice Heatmap
  const drawSeaIceHeatmap = (
    ctx: CanvasRenderingContext2D,
    grid: SeaIceGridPoint[],
    cx: number,
    cy: number,
    r: number,
    horizon: number
  ) => {
    ctx.save();
    grid.forEach((pt) => {
      const p = projectSouthPolarStereographic(pt, cx, cy, r, -50.0);
      if (!p.isVisible) return;

      let conc = pt.currentConcentration;
      if (horizon === 6) conc = pt.forecast6h;
      else if (horizon === 12) conc = pt.forecast12h;
      else if (horizon === 24) conc = pt.forecast24h;
      else if (horizon === 48) conc = pt.forecast48h;
      else if (horizon === 72) conc = pt.forecast72h;

      if (conc < 5) return;

      const size = Math.max(7, 13 * (r / 300));
      let color = 'rgba(56, 189, 248, 0.15)';
      if (conc > 80) color = 'rgba(255, 255, 255, 0.8)';
      else if (conc > 60) color = 'rgba(186, 230, 253, 0.6)';
      else if (conc > 35) color = 'rgba(56, 189, 248, 0.45)';
      else if (conc > 15) color = 'rgba(14, 165, 233, 0.3)';

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  };

  // Helper: Draw Dynamic Risk Grid
  const drawRiskGrid = (
    ctx: CanvasRenderingContext2D,
    grid: RiskGridCell[],
    cx: number,
    cy: number,
    r: number
  ) => {
    ctx.save();
    grid.forEach((cell) => {
      const p = projectSouthPolarStereographic(cell, cx, cy, r, -50.0);
      if (!p.isVisible || cell.overallRisk < 15) return;

      const size = Math.max(8, 14 * (r / 300));
      let fillColor = 'rgba(34, 197, 94, 0.25)';
      let strokeColor = 'rgba(34, 197, 94, 0.4)';

      if (cell.riskCategory === 'EXTREME') {
        fillColor = 'rgba(239, 68, 68, 0.55)';
        strokeColor = 'rgba(239, 68, 68, 0.85)';
      } else if (cell.riskCategory === 'HIGH') {
        fillColor = 'rgba(249, 115, 22, 0.45)';
        strokeColor = 'rgba(249, 115, 22, 0.75)';
      } else if (cell.riskCategory === 'MODERATE') {
        fillColor = 'rgba(234, 179, 8, 0.35)';
        strokeColor = 'rgba(234, 179, 8, 0.65)';
      } else if (cell.riskCategory === 'LOW') {
        fillColor = 'rgba(56, 189, 248, 0.25)';
        strokeColor = 'rgba(56, 189, 248, 0.5)';
      }

      ctx.fillStyle = fillColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(p.x - size / 2, p.y - size / 2, size, size);
      ctx.fill();
      ctx.stroke();
    });
    ctx.restore();
  };

  // Helper: Draw Ocean Currents Vector arrows
  const drawCurrentVectors = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
    ctx.save();
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.4)';
    ctx.fillStyle = 'rgba(96, 165, 250, 0.4)';
    ctx.lineWidth = 1.2;

    for (let lon = -180; lon < 180; lon += 45) {
      const lat = -58;
      const p = projectSouthPolarStereographic({ lat, lon }, cx, cy, r, -50.0);
      if (!p.isVisible) continue;

      const pNext = projectSouthPolarStereographic({ lat, lon: lon + 10 }, cx, cy, r, -50.0);
      const angle = Math.atan2(pNext.y - p.y, pNext.x - p.x);

      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + Math.cos(angle) * 16, p.y + Math.sin(angle) * 16);
      ctx.stroke();
    }
    ctx.restore();
  };

  // Helper: Draw Wind Vectors
  const drawWindVectors = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
    ctx.save();
    ctx.strokeStyle = 'rgba(167, 243, 208, 0.35)';
    ctx.lineWidth = 1.0;
    ctx.setLineDash([2, 3]);

    for (let lon = -160; lon < 180; lon += 60) {
      const lat = -64;
      const p = projectSouthPolarStereographic({ lat, lon }, cx, cy, r, -50.0);
      if (!p.isVisible) continue;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8, 0, Math.PI * 1.5);
      ctx.stroke();
    }
    ctx.restore();
  };

  // Helper: Draw Routes
  const drawRoute = (
    ctx: CanvasRenderingContext2D,
    route: CandidateRoute,
    cx: number,
    cy: number,
    r: number,
    isRecommended: boolean
  ) => {
    if (route.waypoints.length === 0) return;
    ctx.save();

    const pts = route.waypoints.map((wp) => projectSouthPolarStereographic(wp, cx, cy, r, -50.0));

    // Outer luminous glow for recommended route
    if (isRecommended) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 9;
      ctx.beginPath();
      pts.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    }

    // Main route line
    ctx.beginPath();
    pts.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });

    if (isRecommended) {
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 3.5;
      ctx.setLineDash([]);
    } else {
      ctx.strokeStyle = route.id.includes('direct') ? 'rgba(239, 68, 68, 0.75)' : 'rgba(234, 179, 8, 0.75)';
      ctx.lineWidth = 2.0;
      ctx.setLineDash([6, 4]);
    }
    ctx.stroke();

    // Waypoint dots
    pts.forEach((p, idx) => {
      ctx.fillStyle = isRecommended ? '#F8FAFC' : '#94A3B8';
      ctx.beginPath();
      ctx.arc(p.x, p.y, isRecommended ? 3.5 : 2.5, 0, Math.PI * 2);
      ctx.fill();

      if (idx % 6 === 0 || idx === pts.length - 1) {
        ctx.fillStyle = '#E2E8F0';
        ctx.font = '8px monospace';
        ctx.fillText(`WP${idx}`, p.x + 5, p.y - 4);
      }
    });

    ctx.restore();
  };

  // Helper: Draw Iceberg Trajectory
  const drawIcebergTrajectory = (
    ctx: CanvasRenderingContext2D,
    forecast: IcebergForecast,
    cx: number,
    cy: number,
    r: number,
    showCones: boolean
  ) => {
    ctx.save();
    const curr = projectSouthPolarStereographic(forecast.currentPosition, cx, cy, r, -50.0);

    ctx.strokeStyle = 'rgba(244, 63, 94, 0.8)';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(curr.x, curr.y);

    forecast.trajectory.forEach((tp) => {
      const p = projectSouthPolarStereographic(tp, cx, cy, r, -50.0);
      ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    forecast.trajectory.forEach((tp) => {
      const p = projectSouthPolarStereographic(tp, cx, cy, r, -50.0);

      if (showCones) {
        const coneRadiusPx = (tp.confidenceRadiusKm / 500) * r * zoom;
        ctx.fillStyle = 'rgba(244, 63, 94, 0.12)';
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(6, coneRadiusPx), 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      ctx.fillStyle = '#FB7185';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      ctx.fill();

      if (tp.hourOffset === 24 || tp.hourOffset === 48 || tp.hourOffset === 72) {
        ctx.fillStyle = '#FDA4AF';
        ctx.font = '8px monospace';
        ctx.fillText(`+${tp.hourOffset}h`, p.x + 4, p.y - 3);
      }
    });

    ctx.restore();
  };

  // Helper: Draw Iceberg Marker
  const drawIcebergMarker = (
    ctx: CanvasRenderingContext2D,
    berg: IcebergObservation,
    cx: number,
    cy: number,
    r: number
  ) => {
    ctx.save();
    const p = projectSouthPolarStereographic(berg.currentPosition, cx, cy, r, -50.0);
    if (!p.isVisible) return;

    if (berg.riskRating === 'HIGH' || berg.riskRating === 'EXTREME') {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
      ctx.stroke();
    }

    const sz = Math.max(6, Math.min(14, (berg.lengthKm / 30) * 12));
    ctx.fillStyle = berg.riskRating === 'EXTREME' ? '#EF4444' : '#38BDF8';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - sz);
    ctx.lineTo(p.x + sz, p.y);
    ctx.lineTo(p.x, p.y + sz * 0.8);
    ctx.lineTo(p.x - sz, p.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    const driftRad = ((berg.driftHeadingDeg - 90) * Math.PI) / 180;
    const arrowLen = Math.max(12, berg.speedKnots * 8);
    ctx.strokeStyle = '#F43F5E';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + Math.cos(driftRad) * arrowLen, p.y + Math.sin(driftRad) * arrowLen);
    ctx.stroke();

    ctx.fillStyle = '#F1F5F9';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(`${berg.id}`, p.x + sz + 3, p.y + 3);

    ctx.restore();
  };

  // Helper: Draw Research Station
  const drawStationMarker = (
    ctx: CanvasRenderingContext2D,
    stn: ResearchStation,
    cx: number,
    cy: number,
    r: number
  ) => {
    ctx.save();
    const p = projectSouthPolarStereographic(stn.coords, cx, cy, r, -50.0);
    if (!p.isVisible) return;

    const isIndianStation = stn.country === 'India';

    if (isIndianStation) {
      ctx.fillStyle = '#FF9933';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#FEF08A';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(`★ ${stn.name}`, p.x + 8, p.y + 3);
    } else {
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#94A3B8';
      ctx.font = '9px sans-serif';
      ctx.fillText(stn.name.replace(' Station', '').replace(' Research', ''), p.x + 6, p.y + 3);
    }
    ctx.restore();
  };

  // Helper: Draw Vessel Marker
  const drawVesselMarker = (
    ctx: CanvasRenderingContext2D,
    v: VesselProfile,
    cx: number,
    cy: number,
    r: number
  ) => {
    ctx.save();
    const p = projectSouthPolarStereographic(v.currentPosition, cx, cy, r, -50.0);
    if (!p.isVisible) return;

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 16, 0, Math.PI * 2);
    ctx.stroke();

    const headingRad = ((v.currentHeadingDeg - 90) * Math.PI) / 180;
    ctx.translate(p.x, p.y);
    ctx.rotate(headingRad);

    ctx.fillStyle = '#22C55E';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(11, 0);
    ctx.lineTo(-7, 6);
    ctx.lineTo(-4, 0);
    ctx.lineTo(-7, -6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.rotate(-headingRad);
    ctx.translate(-p.x, -p.y);

    ctx.fillStyle = '#4ADE80';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText(`🚢 ${v.name.split('/')[0]}`, p.x + 12, p.y - 6);
    ctx.fillStyle = '#94A3B8';
    ctx.font = '8px monospace';
    ctx.fillText(`${v.cruisingSpeedKnots} kts | HDG ${v.currentHeadingDeg}°`, p.x + 12, p.y + 6);

    ctx.restore();
  };

  // Helper: Draw Compass Rose & Map Scale
  const drawCompassAndLegend = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.save();
    const compassX = w - 45;
    const compassY = 45;

    ctx.fillStyle = 'rgba(7, 19, 38, 0.9)';
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(compassX, compassY, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('90°S', compassX, compassY + 3);
    ctx.fillStyle = '#94A3B8';
    ctx.font = '7px monospace';
    ctx.fillText('EPSG:3031', compassX, compassY + 12);
    ctx.fillText('POLAR', compassX, compassY - 8);

    // Scale bar
    const scaleX = w - 160;
    const scaleY = h - 25;
    ctx.fillStyle = 'rgba(7, 19, 38, 0.9)';
    ctx.fillRect(scaleX - 10, scaleY - 14, 150, 24);
    ctx.strokeStyle = '#0284C7';
    ctx.strokeRect(scaleX - 10, scaleY - 14, 150, 24);

    ctx.fillStyle = '#38BDF8';
    ctx.fillRect(scaleX, scaleY - 3, 60, 4);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(scaleX + 60, scaleY - 3, 60, 4);

    ctx.fillStyle = '#E2E8F0';
    ctx.font = '8px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('0', scaleX, scaleY - 6);
    ctx.fillText('500 km', scaleX + 50, scaleY - 6);
    ctx.fillText('1000 km', scaleX + 110, scaleY - 6);

    ctx.restore();
  };

  // Mouse Interaction Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }

    const geo = unprojectSouthPolarStereographic(mouseX, mouseY, centerX, centerY, baseRadius, -50.0);
    setHoveredCoords(geo);

    // Check hit test for Icebergs
    let hit: { title: string; subtitle: string; x: number; y: number } | null = null;
    for (const b of icebergs) {
      const p = projectSouthPolarStereographic(b.currentPosition, centerX, centerY, baseRadius, -50.0);
      if (Math.hypot(p.x - mouseX, p.y - mouseY) < 18) {
        hit = {
          title: `Iceberg: ${b.name}`,
          subtitle: `Risk: ${b.riskRating} | Length: ${b.lengthKm}km | Speed: ${b.speedKnots} kts`,
          x: mouseX,
          y: mouseY,
        };
        break;
      }
    }

    // Check hit test for Stations
    if (!hit) {
      for (const stn of ANTARCTIC_RESEARCH_STATIONS) {
        const p = projectSouthPolarStereographic(stn.coords, centerX, centerY, baseRadius, -50.0);
        if (Math.hypot(p.x - mouseX, p.y - mouseY) < 14) {
          hit = {
            title: `Station: ${stn.name}`,
            subtitle: `${stn.country} | Type: ${stn.type} | Operator: ${stn.operator}`,
            x: mouseX,
            y: mouseY,
          };
          break;
        }
      }
    }

    setHoveredItem(hit);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    setZoom((prev) => Math.min(4.5, Math.max(0.6, prev * zoomFactor)));
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check Icebergs
    for (const b of icebergs) {
      const p = projectSouthPolarStereographic(b.currentPosition, centerX, centerY, baseRadius, -50.0);
      if (Math.hypot(p.x - mouseX, p.y - mouseY) < 18) {
        const forecast = icebergTrajectoryModel.predictTrajectory(b, activeRoute?.waypoints, vessel.currentPosition);
        onSelectIceberg(b, forecast);
        return;
      }
    }

    // Check Stations
    for (const stn of ANTARCTIC_RESEARCH_STATIONS) {
      const p = projectSouthPolarStereographic(stn.coords, centerX, centerY, baseRadius, -50.0);
      if (Math.hypot(p.x - mouseX, p.y - mouseY) < 14) {
        onSelectStation(stn, 'dest');
        return;
      }
    }

    // Check Waypoints
    if (activeRoute) {
      for (const wp of activeRoute.waypoints) {
        const p = projectSouthPolarStereographic(wp, centerX, centerY, baseRadius, -50.0);
        if (Math.hypot(p.x - mouseX, p.y - mouseY) < 10) {
          onSelectWaypoint(wp);
          return;
        }
      }
    }
  };

  const handleResetView = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  const handleCenterVessel = () => {
    const p = projectSouthPolarStereographic(
      vessel.currentPosition,
      dimensions.width / 2,
      dimensions.height / 2,
      Math.min(dimensions.width, dimensions.height) * 0.44,
      -50.0
    );
    setPan({
      x: dimensions.width / 2 - p.x,
      y: dimensions.height / 2 - p.y,
    });
    setZoom(1.8);
  };

  const handleFitRoute = () => {
    if (activeRoute && activeRoute.waypoints.length > 0) {
      const lats = [vessel.currentPosition.lat, ...activeRoute.waypoints.map((w) => w.lat)];
      const lons = [vessel.currentPosition.lon, ...activeRoute.waypoints.map((w) => w.lon)];
      const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
      const avgLon = lons.reduce((a, b) => a + b, 0) / lons.length;
      const p = projectSouthPolarStereographic(
        { lat: avgLat, lon: avgLon },
        dimensions.width / 2,
        dimensions.height / 2,
        Math.min(dimensions.width, dimensions.height) * 0.44,
        -50.0
      );
      setPan({
        x: dimensions.width / 2 - p.x,
        y: dimensions.height / 2 - p.y,
      });
      setZoom(1.5);
    } else {
      handleCenterVessel();
    }
  };

  return (
    <div
      id="antarctic-map-container"
      ref={containerRef}
      className="relative w-full h-full min-h-0 flex-1 bg-[#040914] overflow-hidden select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onClick={handleClick}
      style={{ cursor: isDragging ? 'grabbing' : 'crosshair' }}
    >
      <canvas
        id="antarctic-polar-canvas"
        ref={canvasRef}
        className="w-full h-full block"
        style={{ width: dimensions.width, height: dimensions.height }}
      />

      {/* Floating HUD: Polar Coordinates & Telemetry */}
      <div
        id="map-telemetry-badge"
        className="absolute top-3 left-3 z-10 flex items-center gap-2 px-2.5 py-1 bg-[#071326]/90 border border-cyan-500/30 rounded-xl backdrop-blur-md text-xs text-slate-100 shadow-xl"
      >
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#38bdf8]" />
        <span className="text-cyan-300 font-bold text-[10px] tracking-wide">EPSG:3031 POLAR</span>
        <span className="text-slate-600">|</span>
        <span className="font-mono text-slate-200 text-xs">
          {hoveredCoords ? formatPolarCoordinates(hoveredCoords) : '68°30\'S, 076°00\'E (Prydz Bay)'}
        </span>
        <span className="text-slate-600 hidden sm:inline">|</span>
        <span className="text-slate-400 font-mono text-xs hidden sm:inline">ZOOM: {zoom.toFixed(1)}x</span>
      </div>

      {/* Top Right Map Controls Toolbar */}
      <div
        id="map-controls-toolbar"
        className="absolute top-3 right-3 z-10 flex flex-col gap-1 bg-[#071326]/90 border border-cyan-500/30 p-1 rounded-xl backdrop-blur-md shadow-xl"
      >
        <button
          id="btn-zoom-in"
          title="Zoom In (+)"
          onClick={(e) => {
            e.stopPropagation();
            setZoom((z) => Math.min(4.5, z * 1.25));
          }}
          className="p-1.5 text-slate-300 hover:text-cyan-300 hover:bg-[#0B1E38] rounded-lg transition"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          id="btn-zoom-out"
          title="Zoom Out (-)"
          onClick={(e) => {
            e.stopPropagation();
            setZoom((z) => Math.max(0.5, z * 0.8));
          }}
          className="p-1.5 text-slate-300 hover:text-cyan-300 hover:bg-[#0B1E38] rounded-lg transition"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          id="btn-fit-route"
          title="Fit Active Route to Screen"
          onClick={(e) => {
            e.stopPropagation();
            handleFitRoute();
          }}
          className="p-1.5 text-slate-300 hover:text-cyan-300 hover:bg-[#0B1E38] rounded-lg transition"
        >
          <Navigation className="w-4 h-4 text-cyan-400" />
        </button>
        <button
          id="btn-center-vessel"
          title="Center on Ship Position"
          onClick={(e) => {
            e.stopPropagation();
            handleCenterVessel();
          }}
          className="p-1.5 text-slate-300 hover:text-emerald-300 hover:bg-[#0B1E38] rounded-lg transition"
        >
          <Ship className="w-4 h-4 text-emerald-400" />
        </button>
        <button
          id="btn-reset-map"
          title="Reset South Polar Center"
          onClick={(e) => {
            e.stopPropagation();
            handleResetView();
          }}
          className="p-1.5 text-slate-300 hover:text-cyan-300 hover:bg-[#0B1E38] rounded-lg transition"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Interactive Map Legend (Expandable) */}
      <div
        id="map-legend-panel"
        className="absolute bottom-3 right-3 z-10 bg-[#071326]/95 border border-cyan-500/30 rounded-xl backdrop-blur-md shadow-2xl p-2.5 max-w-xs text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between cursor-pointer gap-3 pb-1 border-b border-cyan-900/30"
          onClick={() => setShowLegend(!showLegend)}
        >
          <span className="font-bold text-cyan-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            Polar Map Legend
          </span>
          {showLegend ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-400" />}
        </div>

        {showLegend && (
          <div className="space-y-2 pt-2 text-[10px]">
            {/* Sea Ice Scale Bar */}
            <div className="space-y-1">
              <span className="text-slate-400 block font-semibold">Sea-Ice Concentration (%):</span>
              <div className="h-2 w-full rounded-full bg-gradient-to-r from-transparent via-[#38BDF8] to-white border border-slate-700" />
              <div className="flex justify-between text-slate-400 font-mono text-[9px]">
                <span>0% Open</span>
                <span>40% Close</span>
                <span>100% Pack</span>
              </div>
            </div>

            {/* Iceberg & Route Legend Items */}
            <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-sm" />
                <span>Critical Berg</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 bg-cyan-400 rounded-sm" />
                <span>Monitored Berg</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="h-0.5 w-3 bg-cyan-400 inline-block" />
                <span>Safe Passage</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="h-0.5 w-3 bg-amber-400 border-dashed inline-block" />
                <span>Alt Corridor</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                <span>🇮🇳 Indian Station</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                <span>🚢 Ship Fix</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Layer Filter Buttons on Map Bottom Left */}
      <div
        id="map-layer-pills"
        className="absolute bottom-3 left-3 z-10 flex flex-wrap items-center gap-1.5 bg-[#071326]/90 border border-cyan-500/30 p-1.5 rounded-xl backdrop-blur-md text-xs shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider px-1">LAYERS:</span>
        <button
          id="layer-toggle-sea-ice"
          onClick={() => onToggleLayer('seaIce')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
            layers.seaIce
              ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
              : 'bg-[#050D1A] text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <span>🧊 Sea Ice</span>
        </button>
        <button
          id="layer-toggle-icebergs"
          onClick={() => onToggleLayer('icebergs')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
            layers.icebergs
              ? 'bg-rose-500/20 text-rose-200 border border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
              : 'bg-[#050D1A] text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <span>▲ Icebergs</span>
        </button>
        <button
          id="layer-toggle-trajectories"
          onClick={() => onToggleLayer('predictedIcebergTrajectories')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
            layers.predictedIcebergTrajectories
              ? 'bg-purple-500/20 text-purple-200 border border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
              : 'bg-[#050D1A] text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <span>⤑ Drift Paths</span>
        </button>
        <button
          id="layer-toggle-risk-grid"
          onClick={() => onToggleLayer('navigationRiskGrid')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
            layers.navigationRiskGrid
              ? 'bg-amber-500/20 text-amber-200 border border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.2)]'
              : 'bg-[#050D1A] text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span>Risk Grid</span>
        </button>
        <button
          id="layer-toggle-route"
          onClick={() => onToggleLayer('recommendedRoute')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
            layers.recommendedRoute
              ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
              : 'bg-[#050D1A] text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <span>🚢 Route</span>
        </button>
      </div>

      {/* Hover Info Tooltip */}
      {hoveredItem && (
        <div
          id="map-hover-tooltip"
          className="absolute z-20 pointer-events-none bg-[#071326]/95 border border-cyan-400/60 p-2.5 rounded-xl shadow-2xl text-xs max-w-xs backdrop-blur-md"
          style={{ left: hoveredItem.x + 14, top: hoveredItem.y - 14 }}
        >
          <div className="font-bold text-cyan-300">{hoveredItem.title}</div>
          <div className="text-[11px] text-slate-200 mt-0.5">{hoveredItem.subtitle}</div>
          <div className="text-[10px] text-slate-400 mt-1 italic">Click to inspect telemetry details</div>
        </div>
      )}
    </div>
  );
};
