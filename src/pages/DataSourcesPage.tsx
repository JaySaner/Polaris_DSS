import React from 'react';
import { Database, CheckCircle2 } from 'lucide-react';

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
    <div id="data-sources-page" className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-4 md:p-6 overflow-y-auto space-y-5 font-sans">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-400 shadow-sm">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Polar Earth Observation & Sensor Ingestion Pipeline
              </h2>
              <span className="text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full font-mono font-semibold">
                Unified Scientific Data Feed
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Automated ingestion, spatial-temporal interpolation, and feature extraction pipeline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-xl shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-xs font-mono">ALL 5 FEEDS SYNCHRONIZED</span>
        </div>
      </div>

      {/* Grid: 5 Feeds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {feeds.map((feed) => (
          <div
            key={feed.name}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-3 shadow-sm flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">{feed.name}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-full font-mono font-bold">
                  {feed.status}
                </span>
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{feed.agency}</div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Sensor Payload</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{feed.sensor}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Resolution & Grid</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{feed.resolution}</span>
                </div>
              </div>

              <div className="space-y-1 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Pass Cadence:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-mono">{feed.cadence}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pipeline Ingestion Latency:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">{feed.latency}</span>
                </div>
              </div>

              <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/20 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-700 dark:text-slate-300 font-semibold block text-[11px]">Primary Parameters:</span>
                <span className="mt-0.5 block leading-relaxed">{feed.parameters}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 flex items-center justify-between font-mono">
              <span>Protocol: OGC WMS / NetCDF4 / GeoTIFF</span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold">Live Streaming</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
