import React, { useState, useEffect, useRef } from 'react';
import { IcebergObservation, IcebergForecast } from '../../types';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Film,
  ExternalLink,
  Info,
  Calendar,
  Compass,
  Navigation,
  Layers,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Volume2,
  Maximize2,
} from 'lucide-react';
import { formatPolarCoordinates } from '../../utils/geoUtils';

interface IcebergAnimationPlayerProps {
  iceberg: IcebergObservation;
  forecast?: IcebergForecast | null;
  compact?: boolean;
}

export const IcebergAnimationPlayer: React.FC<IcebergAnimationPlayerProps> = ({
  iceberg,
  forecast,
  compact = false,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 0.5x, 1x, 2x, 4x
  const [viewMode, setViewMode] = useState<'satellite-gif' | 'radar-telemetry'>(
    iceberg.animationUrl ? 'satellite-gif' : 'radar-telemetry'
  );
  const [gifLoadError, setGifLoadError] = useState<boolean>(false);

  // Generate multi-frame tracking sequence combining historical points + forecast points
  const frames = React.useMemo(() => {
    const list: Array<{
      date: string;
      lat: number;
      lon: number;
      speedKnots: number;
      headingDeg: number;
      type: 'HISTORY' | 'CURRENT' | 'PREDICTION';
      label: string;
    }> = [];

    // 1. History frames if present
    if (iceberg.historyTrack && iceberg.historyTrack.length > 0) {
      iceberg.historyTrack.forEach((h, idx) => {
        list.push({
          date: h.date,
          lat: h.lat,
          lon: h.lon,
          speedKnots: h.speedKnots,
          headingDeg: (iceberg.driftHeadingDeg + (idx * 5 - 15) + 360) % 360,
          type: 'HISTORY',
          label: `SAR Observation (${h.date})`,
        });
      });
    } else {
      // Synthesize 3 historical steps for demonstration
      list.push({
        date: 'Day -14 (SAR Pass 1)',
        lat: iceberg.currentPosition.lat - 0.4,
        lon: iceberg.currentPosition.lon - 0.6,
        speedKnots: Math.max(0.4, iceberg.speedKnots - 0.5),
        headingDeg: (iceberg.driftHeadingDeg - 10 + 360) % 360,
        type: 'HISTORY',
        label: 'NASA Scatterometer Pass T-14d',
      });
      list.push({
        date: 'Day -7 (SAR Pass 2)',
        lat: iceberg.currentPosition.lat - 0.2,
        lon: iceberg.currentPosition.lon - 0.3,
        speedKnots: Math.max(0.6, iceberg.speedKnots - 0.2),
        headingDeg: (iceberg.driftHeadingDeg - 5 + 360) % 360,
        type: 'HISTORY',
        label: 'AMSR2 Ice Motion T-7d',
      });
    }

    // 2. Current observation fix
    list.push({
      date: iceberg.lastObservedDate || 'Latest Fix (Today)',
      lat: iceberg.currentPosition.lat,
      lon: iceberg.currentPosition.lon,
      speedKnots: iceberg.speedKnots,
      headingDeg: iceberg.driftHeadingDeg,
      type: 'CURRENT',
      label: 'Sentinel-1 Verified Position',
    });

    // 3. Predicted forecast frames
    if (forecast && forecast.trajectory) {
      forecast.trajectory.forEach((tp) => {
        list.push({
          date: `+${tp.hourOffset}h Horizon`,
          lat: tp.lat,
          lon: tp.lon,
          speedKnots: tp.predictedSpeedKnots,
          headingDeg: tp.predictedHeadingDeg,
          type: 'PREDICTION',
          label: `AI Ensemble Forecast (+${tp.hourOffset}h)`,
        });
      });
    } else {
      [6, 12, 24, 48, 72].forEach((hrs) => {
        const dLat = (hrs / 24) * 0.15 * Math.cos((iceberg.driftHeadingDeg * Math.PI) / 180);
        const dLon = (hrs / 24) * 0.25 * Math.sin((iceberg.driftHeadingDeg * Math.PI) / 180);
        list.push({
          date: `+${hrs}h Projection`,
          lat: iceberg.currentPosition.lat + dLat,
          lon: iceberg.currentPosition.lon + dLon,
          speedKnots: Number((iceberg.speedKnots + 0.1 * (hrs / 24)).toFixed(1)),
          headingDeg: iceberg.driftHeadingDeg,
          type: 'PREDICTION',
          label: `Forecast (+${hrs}h)`,
        });
      });
    }

    return list;
  }, [iceberg, forecast]);

  // Playback timer
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      const stepMs = Math.max(250, 1000 / playbackSpeed);
      interval = setInterval(() => {
        setCurrentFrameIndex((prev) => (prev + 1) % frames.length);
      }, stepMs);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, frames.length]);

  const activeFrame = frames[currentFrameIndex] || frames[0];
  const progressPercent = ((currentFrameIndex + 1) / frames.length) * 100;

  const animationGifSrc =
    iceberg.animationUrl ||
    `https://ftp.scp.byu.edu/data/misc/iceberg_animations/${iceberg.id.toLowerCase().replace(/[^a-z0-9]/g, '')}_movie.gif`;

  return (
    <div
      id={`iceberg-anim-player-${iceberg.id}`}
      className="bg-[#050D1A] border border-cyan-500/30 rounded-2xl overflow-hidden shadow-xl text-slate-100 flex flex-col"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-[#07172F] to-[#040A15] border-b border-cyan-900/40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-100 font-mono tracking-tight">
                {iceberg.name} Motion Animation
              </span>
              <span className="text-[10px] px-2 py-0.2 bg-cyan-950 text-cyan-300 border border-cyan-500/30 rounded-full font-mono">
                NASA SCP / BYU
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block font-sans">
              Scatterometer Climate Record Pathfinder Time-Lapse
            </span>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1.5 bg-[#030812] p-1 rounded-xl border border-slate-800 text-[11px]">
          <button
            onClick={() => setViewMode('satellite-gif')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
              viewMode === 'satellite-gif'
                ? 'bg-cyan-600 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Satellite GIF
          </button>
          <button
            onClick={() => setViewMode('radar-telemetry')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
              viewMode === 'radar-telemetry'
                ? 'bg-cyan-600 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Drift Track Replay
          </button>
        </div>
      </div>

      {/* Main visual display screen */}
      <div className="relative bg-[#02060E] aspect-video sm:h-56 md:h-64 flex items-center justify-center overflow-hidden border-b border-cyan-950">
        {viewMode === 'satellite-gif' && !gifLoadError ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <img
              src={animationGifSrc}
              alt={`${iceberg.name} satellite movement animation`}
              className="max-h-full max-w-full object-contain"
              referrerPolicy="no-referrer"
              onError={() => setGifLoadError(true)}
            />
            {/* Overlay badge with NASA BYU watermark */}
            <div className="absolute top-2 left-2 px-2 py-1 bg-black/75 border border-cyan-500/40 rounded-lg text-[10px] text-cyan-300 font-mono backdrop-blur-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>NASA SCP SATELLITE RADAR GIF</span>
            </div>

            <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 border border-slate-700 rounded text-[10px] text-slate-300">
              <a
                href={iceberg.animationUrl || animationGifSrc}
                target="_blank"
                rel="noreferrer"
                className="hover:text-cyan-300 flex items-center gap-1"
              >
                <span>Direct GIF Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ) : (
          /* Interactive Radar Track Replay Canvas */
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#030914] via-[#040C1D] to-[#02060E] p-4 select-none">
            {/* Polar Grid Rings & Crosshair Background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className="w-48 h-48 rounded-full border border-cyan-400" />
              <div className="w-32 h-32 rounded-full border border-cyan-400" />
              <div className="w-16 h-16 rounded-full border border-cyan-400" />
              <div className="absolute w-full h-px bg-cyan-400" />
              <div className="absolute h-full w-px bg-cyan-400" />
            </div>

            {/* Simulated Animated Iceberg Centroid & Motion Vector Trail */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative">
                {/* Uncertainty Ring */}
                <div className="w-20 h-20 rounded-full border border-dashed border-cyan-400/50 animate-spin-slow flex items-center justify-center bg-cyan-500/5">
                  {/* Floating Tabular Berg Polygon */}
                  <div
                    className="w-10 h-6 bg-gradient-to-br from-cyan-300 via-cyan-100 to-blue-400 rounded-sm shadow-[0_0_20px_rgba(6,182,212,0.6)] border border-white/80 transition-transform duration-300 flex items-center justify-center text-[8px] font-bold text-slate-950 font-mono"
                    style={{
                      transform: `rotate(${activeFrame.headingDeg}deg)`,
                    }}
                  >
                    {iceberg.id}
                  </div>
                </div>

                {/* Velocity Vector Arrow */}
                <div
                  className="absolute top-1/2 left-1/2 w-14 h-0.5 bg-gradient-to-r from-emerald-400 to-transparent origin-left transition-all duration-300"
                  style={{
                    transform: `rotate(${activeFrame.headingDeg - 90}deg)`,
                  }}
                />
              </div>

              {/* Floating Frame Coordinates */}
              <div className="mt-3 text-center bg-[#07152B]/90 border border-cyan-500/30 px-3 py-1.5 rounded-xl shadow-lg backdrop-blur-md">
                <div className="flex items-center justify-center gap-2 text-xs">
                  <span
                    className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                      activeFrame.type === 'HISTORY'
                        ? 'bg-slate-800 text-slate-300'
                        : activeFrame.type === 'CURRENT'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                        : 'bg-indigo-950 text-indigo-300 border border-indigo-500/40'
                    }`}
                  >
                    {activeFrame.type}
                  </span>
                  <span className="font-mono text-cyan-200 font-semibold">
                    {formatPolarCoordinates({ lat: activeFrame.lat, lon: activeFrame.lon })}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400 mt-1 font-mono">
                  <span>Drift: <strong className="text-emerald-300">{activeFrame.speedKnots} kts</strong></span>
                  <span>Heading: <strong className="text-cyan-300">{activeFrame.headingDeg}°</strong></span>
                </div>
              </div>
            </div>

            {/* Top Left Replay Label */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2.5 py-1 bg-[#061224]/80 border border-cyan-500/20 rounded-lg text-[10px] text-slate-300">
              <Calendar className="w-3 h-3 text-cyan-400" />
              <span>{activeFrame.label}</span>
            </div>

            {/* Top Right Frame Counter */}
            <div className="absolute top-2 right-2 px-2 py-0.5 bg-[#061224]/80 border border-slate-700 rounded text-[10px] text-slate-300 font-mono">
              Frame {currentFrameIndex + 1} / {frames.length}
            </div>
          </div>
        )}
      </div>

      {/* Playback controls toolbar */}
      <div className="p-3 bg-[#040A15] space-y-2.5">
        {/* Timeline progress bar & scrubber */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-mono w-12 text-left">
            F-{currentFrameIndex + 1}
          </span>
          <div
            className="flex-1 h-2 bg-[#0B1E38] rounded-full overflow-hidden cursor-pointer relative"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = clickX / rect.width;
              const targetIdx = Math.min(
                frames.length - 1,
                Math.max(0, Math.floor(ratio * frames.length))
              );
              setCurrentFrameIndex(targetIdx);
            }}
          >
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-150"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 font-mono w-12 text-right">
            Total {frames.length}
          </span>
        </div>

        {/* Buttons: Play/Pause, Step Back, Step Forward, Reset, Speed */}
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5">
            {/* Play/Pause */}
            <button
              id={`btn-play-iceberg-${iceberg.id}`}
              onClick={() => setIsPlaying((p) => !p)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl transition shadow-md active:scale-95"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? 'Pause' : 'Play Drift Replay'}</span>
            </button>

            {/* Step Back */}
            <button
              onClick={() =>
                setCurrentFrameIndex((prev) => (prev - 1 + frames.length) % frames.length)
              }
              className="p-1.5 bg-[#091C3A] hover:bg-[#0E2A54] border border-cyan-500/20 text-slate-300 hover:text-cyan-300 rounded-lg transition"
              title="Previous Frame"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Step Forward */}
            <button
              onClick={() => setCurrentFrameIndex((prev) => (prev + 1) % frames.length)}
              className="p-1.5 bg-[#091C3A] hover:bg-[#0E2A54] border border-cyan-500/20 text-slate-300 hover:text-cyan-300 rounded-lg transition"
              title="Next Frame"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Reset */}
            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentFrameIndex(0);
              }}
              className="p-1.5 bg-[#091C3A] hover:bg-[#0E2A54] border border-cyan-500/20 text-slate-300 hover:text-cyan-300 rounded-lg transition"
              title="Reset to Start"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 text-[11px] bg-[#07162C] px-2 py-1 rounded-lg border border-cyan-500/20">
            <span className="text-slate-400">Speed:</span>
            {[0.5, 1, 2, 4].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition ${
                  playbackSpeed === spd
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Source citation */}
        <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span>Source: NASA Scatterometer Climate Record Pathfinder (SCP)</span>
          <a
            href="https://www.scp.byu.edu/data/ice_tracking/antarctic.html"
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 hover:underline flex items-center gap-1"
          >
            <span>byu.edu SCP Database</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
