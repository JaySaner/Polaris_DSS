import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import {
  VesselProfile,
  IcebergObservation,
  CandidateRoute,
  ResearchStation,
} from '../../types';
import { ANTARCTIC_RESEARCH_STATIONS } from '../../data/antarcticData';

interface GoogleMapsAntarcticProps {
  apiKey: string;
  vessel: VesselProfile;
  icebergs: IcebergObservation[];
  activeRoute: CandidateRoute | null;
  onSelectStation: (station: ResearchStation, role: 'start' | 'dest') => void;
  onSelectIceberg: (berg: IcebergObservation) => void;
  onToggleMapProvider?: () => void;
}

declare global {
  interface Window {
    google?: any;
    initGooglePolarMap?: () => void;
  }
}

export const GoogleMapsAntarcticProvider: React.FC<GoogleMapsAntarcticProps> = ({
  apiKey,
  vessel,
  icebergs,
  activeRoute,
  onSelectStation,
  onSelectIceberg,
  onToggleMapProvider,
}) => {
  const outerContainerRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const handleToggleFullscreen = () => {
    const elem = outerContainerRef.current;
    if (!elem) return;

    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) elem.requestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  };

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  useEffect(() => {
    if (!apiKey) return;

    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initMap();
        return;
      }

      window.initGooglePolarMap = () => {
        initMap();
      };

      const existingScript = document.getElementById('google-maps-script');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGooglePolarMap&libraries=geometry`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
    };

    const initMap = () => {
      if (!mapContainerRef.current || !window.google) return;

      // Initialize map centered at Antarctic Prydz Bay / Southern Ocean transit zone
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center: { lat: -66.5, lng: 70.0 }, // Prydz Bay / Bharati corridor
        zoom: 4,
        mapTypeId: 'satellite',
        backgroundColor: '#030712',
        tilt: 0,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: false,
      });

      mapInstanceRef.current = map;
      renderOverlays(map);
    };

    const renderOverlays = (map: any) => {
      // Clear old markers
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      if (polylineRef.current) polylineRef.current.setMap(null);

      const infoWindow = new window.google.maps.InfoWindow();

      // Add Research Station Markers
      ANTARCTIC_RESEARCH_STATIONS.forEach((stn) => {
        const isIndian = stn.country === 'India';
        const marker = new window.google.maps.Marker({
          position: { lat: stn.coords.lat, lng: stn.coords.lon },
          map,
          title: `${stn.name} (${stn.country})`,
          label: isIndian ? { text: `★ ${stn.name}`, color: '#FFD700', fontSize: '11px', fontWeight: 'bold' } : undefined,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: isIndian ? 9 : 5,
            fillColor: isIndian ? '#FF9933' : '#38BDF8',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          },
        });

        marker.addListener('click', () => {
          infoWindow.setContent(`
            <div style="color: #0f172a; padding: 4px; font-family: sans-serif; max-width: 220px;">
              <h3 style="margin: 0; font-size: 13px; font-weight: 800; color: #1e293b;">${stn.name}</h3>
              <p style="margin: 2px 0 6px 0; font-size: 10px; color: #64748b; font-weight: 700;">Operator: ${stn.operator} (${stn.country})</p>
              <p style="margin: 0; font-size: 11px; line-height: 1.3;">${stn.description}</p>
              <div style="margin-top: 6px; font-size: 10px; font-weight: bold; color: #2563eb;">Coords: ${stn.coords.lat.toFixed(2)}°S, ${stn.coords.lon.toFixed(2)}°E</div>
            </div>
          `);
          infoWindow.open(map, marker);
          onSelectStation(stn, 'dest');
        });
        markersRef.current.push(marker);
      });

      // Add Icebergs
      icebergs.forEach((berg) => {
        const isExtreme = berg.riskRating === 'EXTREME';
        const isHigh = berg.riskRating === 'HIGH';
        const marker = new window.google.maps.Marker({
          position: { lat: berg.currentPosition.lat, lng: berg.currentPosition.lon },
          map,
          title: `${berg.name} (Risk: ${berg.riskRating})`,
          label: isExtreme || isHigh ? { text: `🧊 ${berg.id}`, color: '#FFFFFF', fontSize: '10px', fontWeight: 'bold' } : undefined,
          icon: {
            path: 'M 0,-8 L 8,0 L 0,8 L -8,0 Z',
            scale: isExtreme ? 1.6 : isHigh ? 1.3 : 1.0,
            fillColor: isExtreme ? '#EF4444' : isHigh ? '#F59E0B' : '#0EA5E9',
            fillOpacity: 0.95,
            strokeColor: '#FFFFFF',
            strokeWeight: 1.8,
          },
        });

        marker.addListener('click', () => {
          infoWindow.setContent(`
            <div style="color: #0f172a; padding: 4px; font-family: sans-serif; max-width: 230px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; font-size: 12px; font-weight: 800;">${berg.name}</h3>
                <span style="font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: ${isExtreme ? '#fee2e2' : '#fef3c7'}; color: ${isExtreme ? '#b91c1c' : '#b45309'};">${berg.riskRating} RISK</span>
              </div>
              <p style="margin: 4px 0; font-size: 11px; font-weight: 600;">Dimensions: ${berg.lengthKm} x ${berg.widthKm} km</p>
              <p style="margin: 0; font-size: 11px; font-weight: 600; color: #059669;">Drift Speed: ${berg.speedKnots} kts @ ${berg.driftHeadingDeg}°</p>
              <p style="margin: 4px 0 0 0; font-size: 10px; color: #64748b;">Source: ${berg.dataSource}</p>
            </div>
          `);
          infoWindow.open(map, marker);
          onSelectIceberg(berg);
        });
        markersRef.current.push(marker);
      });

      // Add Vessel Marker
      const vesselMarker = new window.google.maps.Marker({
        position: { lat: vessel.currentPosition.lat, lng: vessel.currentPosition.lon },
        map,
        title: `${vessel.name} (Cruising @ ${vessel.cruisingSpeedKnots} kts)`,
        label: { text: `🚢 ${vessel.name.split('/')[0].trim()}`, color: '#4ADE80', fontSize: '11px', fontWeight: 'bold' },
        icon: {
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 7,
          rotation: vessel.currentHeadingDeg,
          fillColor: '#22C55E',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
      });

      vesselMarker.addListener('click', () => {
        infoWindow.setContent(`
          <div style="color: #0f172a; padding: 4px; font-family: sans-serif; max-width: 220px;">
            <h3 style="margin: 0; font-size: 13px; font-weight: 800; color: #166534;">🚢 ${vessel.name}</h3>
            <p style="margin: 2px 0 4px 0; font-size: 10px; color: #64748b; font-weight: 700;">Ice Class: ${vessel.iceClass} | CallSign: ${vessel.callSign}</p>
            <p style="margin: 0; font-size: 11px; font-weight: 600;">Speed: ${vessel.cruisingSpeedKnots} kts | Heading: ${vessel.currentHeadingDeg}°</p>
            <p style="margin: 4px 0 0 0; font-size: 10px; color: #3b82f6; font-weight: 700;">Fix: ${vessel.currentPosition.lat.toFixed(2)}°S, ${vessel.currentPosition.lon.toFixed(2)}°E</p>
          </div>
        `);
        infoWindow.open(map, vesselMarker);
      });

      markersRef.current.push(vesselMarker);

      // Add Recommended Route Line
      if (activeRoute && activeRoute.waypoints.length > 0) {
        const pathCoords = activeRoute.waypoints.map((wp) => ({
          lat: wp.lat,
          lng: wp.lon,
        }));

        const polyline = new window.google.maps.Polyline({
          path: pathCoords,
          geodesic: true,
          strokeColor: '#10B981',
          strokeOpacity: 0.95,
          strokeWeight: 5,
          map,
        });
        polylineRef.current = polyline;
      }
    };

    loadGoogleMaps();

    if (mapInstanceRef.current) {
      renderOverlays(mapInstanceRef.current);
    }
  }, [apiKey, vessel, icebergs, activeRoute]);

  return (
    <div id="google-maps-polar-container" ref={outerContainerRef} className="relative w-full h-full min-h-[480px]">
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <div className="bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 px-3 py-1.5 rounded-xl text-xs font-mono text-cyan-300 shadow-xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Google Maps Satellite Polar View</span>
        </div>
        {onToggleMapProvider && (
          <button
            onClick={onToggleMapProvider}
            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xl transition flex items-center gap-1.5 active:scale-95"
          >
            <span>Switch to Polar Map</span>
          </button>
        )}
      </div>

      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={handleToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Open Fullscreen Map'}
          className="p-2 bg-slate-900/90 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl shadow-xl backdrop-blur-md transition active:scale-95"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4 text-cyan-400" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
