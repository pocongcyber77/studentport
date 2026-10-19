import React from 'react';
import { JourneyCheckpoint } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { motion } from 'motion/react';
import {
  Compass,
  CheckCircle2,
  Lock,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Trophy,
  Flag,
  MapPin,
  Bot,
} from 'lucide-react';

interface AnimatedMapExplorerProps {
  checkpoints: JourneyCheckpoint[];
  onSelectCompetency: (competencyId: string) => void;
  onStartAssessment: (competencyId: string) => void;
}

export const AnimatedMapExplorer: React.FC<AnimatedMapExplorerProps> = ({
  checkpoints,
  onSelectCompetency,
  onStartAssessment,
}) => {
  // Find current active position of the student:
  // First checkpoint that is DEVELOPING, or first NOT_STARTED, or if all completed, at FINISH
  const developingIndex = checkpoints.findIndex(c => c.status === 'DEVELOPING');
  const notStartedIndex = checkpoints.findIndex(c => c.status === 'NOT_STARTED');
  const allAchieved = checkpoints.length > 0 && checkpoints.every(c => c.status === 'ACHIEVED');

  let activeIndex = 0;
  if (allAchieved) {
    activeIndex = checkpoints.length; // at FINISH
  } else if (developingIndex !== -1) {
    activeIndex = developingIndex;
  } else if (notStartedIndex !== -1) {
    activeIndex = notStartedIndex;
  }

  // Waypoints for our path (coordinates in percentage of map width and height)
  // Checkpoints: 0 (START), 1 (PRG-1), 2 (PRG-2), 3 (PRG-3), 4 (PRG-4), 5 (FINISH)
  const waypointPositions = [
    { x: 10, y: 75, label: 'START' },
    { x: 26, y: 35, label: 'PRG-1' },
    { x: 48, y: 70, label: 'PRG-2' },
    { x: 70, y: 32, label: 'PRG-3' },
    { x: 86, y: 68, label: 'PRG-4' },
    { x: 94, y: 25, label: 'FINISH' },
  ];

  // Map activeIndex to coordinates:
  // activeIndex 0 -> PRG-1 (waypoint index 1)
  // activeIndex 1 -> PRG-2 (waypoint index 2)
  // activeIndex 2 -> PRG-3 (waypoint index 3)
  // activeIndex 3 -> PRG-4 (waypoint index 4)
  // activeIndex >= 4 -> FINISH (waypoint index 5)
  const characterTargetIndex = allAchieved ? 5 : Math.min(activeIndex + 1, 4);
  const currentCoords = waypointPositions[characterTargetIndex] || waypointPositions[1];

  const currentActiveCheckpoint = activeIndex < checkpoints.length ? checkpoints[activeIndex] : null;

  return (
    <div className="bg-gradient-to-b from-[#1b3d2b] via-slate-950 to-[#183928] rounded-3xl p-5 sm:p-8 text-white shadow-xl border border-emerald-800/40 overflow-hidden relative">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-lime-400/15 rounded-full blur-3xl pointer-events-none" />

      {/* Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 relative z-10">
        <div>
          <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Compass size={14} className="text-emerald-400" />
            Peta Petualangan Konsep Matematika
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Posisi Penjelajahanmu Saat Ini
          </h2>
        </div>

        {/* Character status tag */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-emerald-200 self-start sm:self-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span>
            {allAchieved
              ? 'Tuntas di Pos FINISH! Selamat!'
              : currentActiveCheckpoint
              ? `Sedang di Pos: ${currentActiveCheckpoint.code} (${currentActiveCheckpoint.status === 'DEVELOPING' ? 'Sedang Berkembang' : 'Siap Dikuasai'})`
              : 'Menjelajah...'}
          </span>
        </div>
      </div>

      {/* Interactive Illustrated Trail Map Canvas */}
      <div className="relative w-full h-[320px] sm:h-[360px] bg-slate-950/60 rounded-2xl border border-emerald-900/60 p-4 overflow-hidden shadow-inner">
        {/* SVG Decorative Path Connecting Waypoints */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="trailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#bef264" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#34d399" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.9" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Dotted path curve */}
          <path
            d="M 10 75 Q 18 45 26 35 T 48 70 T 70 32 T 86 68 T 94 25"
            fill="none"
            stroke="url(#trailGradient)"
            strokeWidth="1.2"
            strokeDasharray="2, 2"
            filter="url(#glow)"
          />
        </svg>

        {/* START Point (Waypoint 0) */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
          style={{ left: `${waypointPositions[0].x}%`, top: `${waypointPositions[0].y}%` }}
        >
          <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center shadow-md">
            <Flag size={14} />
          </div>
          <span className="text-[10px] font-bold text-emerald-300 mt-1">START</span>
        </div>

        {/* Checkpoint Nodes along the path */}
        {checkpoints.map((cp, idx) => {
          const pos = waypointPositions[idx + 1] || waypointPositions[1];
          const isAchieved = cp.status === 'ACHIEVED';
          const isDeveloping = cp.status === 'DEVELOPING';
          const isLocked = cp.is_locked;
          const isCurrentTarget = characterTargetIndex === idx + 1;

          return (
            <div
              key={cp.competency_id}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              onClick={() => onSelectCompetency(cp.competency_id)}
            >
              {/* Outer pulsing ring for active node */}
              {isCurrentTarget && (
                <div className="absolute -inset-2 rounded-full bg-emerald-500/30 animate-ping pointer-events-none" />
              )}

              {/* Station Node Disk */}
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-bold text-xs sm:text-sm border-2 transition-all duration-300 shadow-lg ${
                  isAchieved
                    ? 'bg-emerald-500 text-white border-emerald-300 ring-4 ring-emerald-500/20'
                    : isDeveloping
                    ? 'bg-amber-500 text-white border-amber-300 ring-4 ring-amber-500/30 animate-pulse-subtle'
                    : isLocked
                    ? 'bg-slate-800 text-slate-500 border-slate-700 opacity-60'
                    : 'bg-emerald-600 text-white border-emerald-300'
                }`}
              >
                {isAchieved ? (
                  <CheckCircle2 size={18} />
                ) : isLocked ? (
                  <Lock size={15} />
                ) : (
                  <span>{cp.code}</span>
                )}
              </div>

              {/* Node Label Card */}
              <div className="mt-1 text-center bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 rounded-md border border-slate-700/80">
                <span className="text-[11px] font-bold text-white block truncate max-w-[80px] sm:max-w-[110px]">
                  {cp.name}
                </span>
                <span className="text-[9px] text-slate-300">
                  {cp.status === 'ACHIEVED'
                    ? 'Tercapai'
                    : cp.status === 'DEVELOPING'
                    ? 'Berkembang'
                    : isLocked
                    ? 'Terkunci'
                    : 'Tersedia'}
                </span>
              </div>
            </div>
          );
        })}

        {/* FINISH Point (Waypoint 5) */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
          style={{ left: `${waypointPositions[5].x}%`, top: `${waypointPositions[5].y}%` }}
        >
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg border-2 ${
              allAchieved
                ? 'bg-emerald-500 text-white border-emerald-300 ring-4 ring-emerald-400/40 animate-bounce'
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}
          >
            <Trophy size={18} />
          </div>
          <span className="text-[10px] font-bold text-emerald-300 mt-1">FINISH</span>
        </div>

        {/* ANIMATED CHARACTER THAT MOVES ON THE MAP */}
        <motion.div
          className="absolute -translate-x-1/2 -translate-y-full z-30 pointer-events-none"
          initial={false}
          animate={{
            left: `${currentCoords.x}%`,
            top: `${currentCoords.y - 12}%`,
          }}
          transition={{
            type: 'spring',
            stiffness: 80,
            damping: 15,
          }}
        >
          {/* Speech Bubble above character */}
          <div className="bg-white text-slate-900 px-3 py-1.5 rounded-xl shadow-xl text-[11px] font-semibold flex items-center gap-1.5 whitespace-nowrap mb-2 animate-bounce border border-emerald-200">
            <span className="text-amber-500 text-xs">⭐</span>
            <span>
              {allAchieved
                ? 'Kita berhasil menuntaskan semua pos! 🎉'
                : currentActiveCheckpoint?.status === 'DEVELOPING'
                ? `Fokus menaklukkan ${currentActiveCheckpoint.code}! 💪`
                : `Petualangan di ${currentActiveCheckpoint?.code || 'Peta'}! 🚀`}
            </span>
          </div>

          {/* Animated Illustrated Avatar SVG */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 mx-auto filter drop-shadow-xl">
            {/* Pulsing beacon below feet */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-2.5 bg-emerald-500/40 rounded-full blur-xs animate-pulse" />

            <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
              {/* Explorer Hat */}
              <ellipse cx="32" cy="18" rx="16" ry="4" fill="#f59e0b" />
              <path d="M22 18 C22 10 42 10 42 18 Z" fill="#d97706" />

              {/* Head */}
              <circle cx="32" cy="24" r="10" fill="#fde68a" />

              {/* Eyes */}
              <circle cx="29" cy="23" r="1.5" fill="#1e293b" />
              <circle cx="35" cy="23" r="1.5" fill="#1e293b" />

              {/* Cheerful Smile */}
              <path d="M29 27 Q32 30 35 27" stroke="#b45309" strokeWidth="1.2" strokeLinecap="round" />

              {/* Backpack */}
              <rect x="20" y="32" width="6" height="14" rx="2" fill="#ef4444" />

              {/* Body / Explorer Vest */}
              <path d="M24 32 Q32 30 40 32 L39 46 Q32 48 25 46 Z" fill="#4f46e5" />
              <path d="M28 32 L28 46 M36 32 L36 46" stroke="#fbbf24" strokeWidth="1" />

              {/* Explorer Compass badge on chest */}
              <circle cx="32" cy="38" r="3" fill="#ffffff" />
              <polygon points="32,36 34,39 30,39" fill="#ef4444" />

              {/* Arms waving */}
              <path d="M24 35 L17 40" stroke="#fde68a" strokeWidth="3" strokeLinecap="round" />
              <path d="M40 35 L47 30" stroke="#fde68a" strokeWidth="3" strokeLinecap="round" />

              {/* Legs walking */}
              <rect x="27" y="46" width="3.5" height="10" rx="1.5" fill="#334155" />
              <rect x="33.5" y="46" width="3.5" height="10" rx="1.5" fill="#1e293b" />

              {/* Boots */}
              <ellipse cx="28.5" cy="56" rx="3" ry="1.5" fill="#78350f" />
              <ellipse cx="35" cy="56" rx="3" ry="1.5" fill="#78350f" />
            </svg>
          </div>
        </motion.div>
      </div>

      {/* Action footer for active checkpoint */}
      {currentActiveCheckpoint && !allAchieved && (
        <div className="mt-4 pt-4 border-t border-emerald-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-300">Pos aktif saat ini:</span>
            <span className="font-bold text-sm text-white">
              {currentActiveCheckpoint.code} - {currentActiveCheckpoint.name}
            </span>
            <StatusBadge status={currentActiveCheckpoint.status} size="sm" />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectCompetency(currentActiveCheckpoint.competency_id)}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition cursor-pointer"
            >
              Rincian Materi
            </button>

            {currentActiveCheckpoint.status === 'DEVELOPING' ? (
              <button
                onClick={() => onStartAssessment(currentActiveCheckpoint.competency_id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>Coba Lagi Pos Ini (Retry)</span>
              </button>
            ) : (
              <button
                onClick={() => onStartAssessment(currentActiveCheckpoint.competency_id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                <span>Mulai Asesmen</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
