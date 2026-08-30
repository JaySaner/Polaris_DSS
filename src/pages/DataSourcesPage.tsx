import React from 'react';
import { Database, Radio, CheckCircle2, RefreshCw, Cpu, Server, Activity, Shield, Sparkles } from 'lucide-react';

export const DataSourcesPage: React.FC = () => {
  const feeds = [
    {
      name: 'AMSR2 Microwave Sea-Ice Radiometer',
      agency: 'JAXA / NSIDC',
      sensor: 'Advanced Microwave Scanning Radiometer 2 (89 GHz)',
      resolution: '6.25 km polar stereographic grid',
      cadence: 'Daily 12-hour polar swath passes',
      status: 'OPERATIONAL',
      latency: '45 mins',
      parameters: 'Sea-ice concentration (0-100%), sea-ice extent, brightness temperature',
    },
    {
      name: 'Sentinel-1 SAR Polar Radar',
      agency: 'ESA / Copernicus Polar Services',
      sensor: 'C-Band Synthetic Aperture Radar (Extra-Wide Swath)',
      resolution: '50m high-resolution dual-polarization (HH+HV)',
      cadence: '1-3 days repeat orbit over Antarctic coastline',
      status: 'OPERATIONAL',
      latency: '2.5 hours',
      parameters: 'Iceberg detection & bounding polygons, leads, ice shelf calving front',
    },
    {
      name: 'U.S. National Ice Center (US NIC) Iceberg Tracking',
      agency: 'NOAA / US Navy / USCG',
      sensor: 'Scatterometer, SAR & Optical Multispectral Synthesis',
      resolution: 'Tabular tracking (> 10 NM² threshold)',
      cadence: 'Weekly & event-driven calving updates',
      status: 'OPERATIONAL',
      latency: '4 hours',
      parameters: 'Iceberg ID (A-series, B-series), length, width, coordinates, calving source',
    },
    {
      name: 'ECMWF ERA5 & Integrated Forecasting System (IFS)',
      agency: 'ECMWF',
      sensor: 'Numerical Weather Prediction Global Reanalysis',
      resolution: '0.25° spatial grid / 1-hour temporal',
      cadence: '6-hourly model runs (+0h to +240h)',
      status: 'OPERATIONAL',
      latency: '1.2 hours',
      parameters: '10m u/v wind vectors, 2m air temperature, mean sea level pressure, snowfall',
    },
    {
      name: 'HYCOM & CMEMS Global Ocean Physics Reanalysis',
      agency: 'Mercator Ocean / NOAA',
      sensor: 'Data-Assimilative Hybrid Coordinate Ocean Model',
      resolution: '1/12° (~9 km) global grid',
      cadence: 'Daily forecast updates',
      status: 'OPERATIONAL',
      latency: '3 hours',
      parameters: 'Zonal/meridional ocean velocity vectors, Sea Surface Temperature (SST), mixed layer depth',
    },
  ];

  return (
    <div id="data-sources-page" className="flex-1 bg-[#040914] text-slate-100 p-4 md:p-6 overflow-y-auto space-y-5">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-900/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-900/40 border border-cyan-400/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-slate-100 tracking-tight">
                Polar Earth Observation & Sensor Ingestion Pipeline
              </h2>
              <span className="text-[10px] bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-mono">
                Unified Scientific Data Feed
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated ingestion, spatial-temporal interpolation, and feature extraction pipeline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#071326] border border-emerald-500/30 rounded-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <span className="text-emerald-300 font-bold text-xs font-mono">ALL 5 FEEDS SYNCHRONIZED</span>
        </div>
      </div>

      {/* Grid: 5 Feeds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {feeds.map((feed) => (
          <div
            key={feed.name}
            className="bg-[#071326]/95 border border-cyan-500/20 p-4 rounded-2xl space-y-3 shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-cyan-900/30 pb-2">
                <span className="font-bold text-slate-100 text-sm tracking-tight">{feed.name}</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                  {feed.status}
                </span>
              </div>
              <div className="text-xs text-cyan-400 font-semibold">{feed.agency}</div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#050D1A] p-2.5 rounded-xl border border-cyan-500/20">
                  <span className="text-slate-400 block text-[10px]">Sensor Payload</span>
                  <span className="text-slate-200 font-semibold">{feed.sensor}</span>
                </div>
                <div className="bg-[#050D1A] p-2.5 rounded-xl border border-cyan-500/20">
                  <span className="text-slate-400 block text-[10px]">Resolution & Grid</span>
                  <span className="text-slate-200 font-semibold">{feed.resolution}</span>
                </div>
              </div>

              <div className="space-y-1 text-xs bg-[#050D1A] p-3 rounded-xl border border-cyan-500/20">
                <div className="flex justify-between">
                  <span className="text-slate-400">Pass Cadence:</span>
                  <span className="text-slate-200 font-mono">{feed.cadence}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pipeline Ingestion Latency:</span>
                  <span className="text-emerald-400 font-bold font-mono">{feed.latency}</span>
                </div>
              </div>

              <div className="text-xs text-slate-400 bg-[#050D1A]/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-300 font-semibold block text-[11px]">Primary Parameters:</span>
                <span className="mt-0.5 block leading-relaxed">{feed.parameters}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-cyan-900/30 text-xs text-slate-500 flex items-center justify-between">
              <span>Protocol: OGC WMS / NetCDF4 / GeoTIFF</span>
              <span className="text-cyan-400 font-semibold">Live Streaming</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
