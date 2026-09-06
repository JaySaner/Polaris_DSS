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

      // Initialize map centered at Antarctic Southern Ocean gateway
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center: { lat: -70.0, lng: 50.0 }, // Southern Ocean sector
        zoom: 3,
        mapTypeId: 'satellite',
        backgroundColor: '#060B19',
        tilt: 0,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#091B33' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#060B19' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#93C5FD' }] },
        ],
      });

      mapInstanceRef.current = map;
      renderOverlays(map);
    };

    const renderOverlays = (map: any) => {
      // Clear old markers
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      if (polylineRef.current) polylineRef.current.setMap(null);

      // Add Research Station Markers
      ANTARCTIC_RESEARCH_STATIONS.forEach((stn) => {
        const marker = new window.google.maps.Marker({
          position: { lat: stn.coords.lat, lng: stn.coords.lon },
          map,
          title: `${stn.name} (${stn.country})`,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: stn.country === 'India' ? 8 : 5,
            fillColor: stn.country === 'India' ? '#FF9933' : '#38BDF8',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          },
        });

        marker.addListener('click', () => {
          onSelectStation(stn, 'dest');
        });
        markersRef.current.push(marker);
      });

      // Add Icebergs
      icebergs.forEach((berg) => {
        const marker = new window.google.maps.Marker({
          position: { lat: berg.currentPosition.lat, lng: berg.currentPosition.lon },
          map,
          title: `Iceberg ${berg.name} (Risk: ${berg.riskRating})`,
          icon: {
            path: 'M 0,-8 L 8,0 L 0,8 L -8,0 Z',
            scale: 1.2,
            fillColor: berg.riskRating === 'EXTREME' ? '#EF4444' : '#0EA5E9',
            fillOpacity: 0.9,
            strokeColor: '#FFFFFF',
            strokeWeight: 1.5,
          },
        });

        marker.addListener('click', () => {
          onSelectIceberg(berg);
        });
        markersRef.current.push(marker);
      });

      // Add Vessel Marker
      const vesselMarker = new window.google.maps.Marker({
        position: { lat: vessel.currentPosition.lat, lng: vessel.currentPosition.lon },
        map,
        title: `${vessel.name} (Cruising @ ${vessel.cruisingSpeedKnots} kts)`,
        icon: {
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6,
          rotation: vessel.currentHeadingDeg,
          fillColor: '#22C55E',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
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
          strokeColor: '#38BDF8',
          strokeOpacity: 0.9,
          strokeWeight: 4,
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
