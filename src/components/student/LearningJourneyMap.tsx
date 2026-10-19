import React from 'react';
import { StudentJourneySummary, JourneyCheckpoint } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { AnimatedMapExplorer } from './AnimatedMapExplorer';
import {
  Compass,
  CheckCircle2,
  Lock,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Trophy,
  Flag,
  BookOpen,
  Brain,
} from 'lucide-react';

interface LearningJourneyMapProps {
  journeyData: StudentJourneySummary;
  onSelectCompetency: (competencyId: string) => void;
  onStartAssessment: (competencyId: string) => void;
  onOpenGrowthMindset?: () => void;
}

export const LearningJourneyMap: React.FC<LearningJourneyMapProps> = ({
  journeyData,
  onSelectCompetency,
  onStartAssessment,
  onOpenGrowthMindset,
}) => {
  const { student, summary, checkpoints } = journeyData;

  const isAllAchieved = summary.total > 0 && summary.achieved === summary.total;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Student Welcome & Philosophy Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1b4332] via-[#2d6a4f] to-[#1e4634] text-white p-6 sm:p-8 shadow-xl border border-emerald-500/30">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-lime-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/25 border border-emerald-400/35 text-emerald-200 text-xs font-medium">
              <Compass size={14} />
              <span>Perjalanan Formatif Pribadi • {student.grade} ({student.class_name})</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Halo, {student.name}! 👋
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-sm max-w-xl leading-relaxed">
              Fokus pada pertumbuhan penguasaan konsepmu sendiri. Tidak ada nilai angka atau pemeringkatan—setiap langkah adalah proses belajar yang berharga.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-emerald-200 font-medium">
              <span className="flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                <span className="text-lime-300 font-bold">Progress</span> &gt; Ranking
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                <span className="text-lime-300 font-bold">Mastery</span> &gt; Score
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                <span className="text-lime-300 font-bold">Growth</span> &gt; Competition
              </span>
            </div>
          </div>

          {/* Quick Metrics Card (Without Numeric Percentage) */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 shrink-0 w-full md:w-72">
            <div className="flex items-center justify-between text-xs text-emerald-200 mb-2">
              <span className="font-semibold text-white">Status Perjalanan</span>
              <span className="font-bold text-white text-xs sm:text-sm">
                {summary.achieved} dari {summary.total} Pos Tercapai
              </span>
            </div>

            {/* Segmented Milestone Bar */}
            <div className="w-full bg-black/30 rounded-full h-2.5 overflow-hidden mb-4">
              <div
                className="bg-gradient-to-r from-emerald-400 to-teal-300 h-2.5 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${(summary.achieved / (summary.total || 1)) * 100}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl py-2 px-1">
                <div className="font-extrabold text-emerald-300 text-lg leading-none">
                  {summary.achieved}
                </div>
                <div className="text-[10px] text-emerald-200/80 mt-1">Tercapai</div>
              </div>
              <div className="bg-amber-500/20 border border-amber-400/30 rounded-xl py-2 px-1">
                <div className="font-extrabold text-amber-300 text-lg leading-none">
                  {summary.developing}
                </div>
                <div className="text-[10px] text-amber-200/80 mt-1">Berkembang</div>
              </div>
              <div className="bg-slate-500/20 border border-slate-400/30 rounded-xl py-2 px-1">
                <div className="font-extrabold text-slate-300 text-lg leading-none">
                  {summary.not_started}
                </div>
                <div className="text-[10px] text-slate-300/80 mt-1">Belum Mulai</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ILLUSTRATED ANIMATED MAP WITH MOVING CHARACTER */}
      <AnimatedMapExplorer
        checkpoints={checkpoints}
        onSelectCompetency={onSelectCompetency}
        onStartAssessment={onStartAssessment}
      />

      {/* Growth Mindset Reflection Callout Banner */}
      {onOpenGrowthMindset && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/60 rounded-3xl p-5 sm:p-6 border border-emerald-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-teal-600/20">
              <Brain size={22} />
            </div>
            <div className="space-y-0.5">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Merasa bingung atau ragu sebelum tes ulang?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Buka <strong>Ruang Refleksi & Growth Mindset</strong> untuk mengecek kesiapan diri dan merencanakan strategi belajar solutif mandiri!
              </p>
            </div>
          </div>

          <button
            onClick={onOpenGrowthMindset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-sm transition cursor-pointer self-start sm:self-auto shrink-0"
          >
            <span>Buka Ruang Refleksi</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Completion Celebration if all achieved */}
      {isAllAchieved && (
        <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-5 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Trophy size={26} className="text-amber-200" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Selamat! Semua Kompetensi Tercapai! 🎉</h3>
              <p className="text-emerald-100 text-xs sm:text-sm">
                Kamu telah menuntaskan seluruh pos pembelajaran dengan pemahaman konsep yang solid.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Visual Checkpoint Node Cards */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles size={20} className="text-emerald-600" />
              Daftar Pos Pembelajaran
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Klik pada pos kompetensi untuk membaca rincian materi atau memulai asesmen formatif.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 self-start sm:self-auto">
            <span className="font-medium text-slate-700">Tahapan:</span>
            <span>START</span>
            <ArrowRight size={12} />
            <span>PRG-1 s/d 4</span>
            <ArrowRight size={12} />
            <span>FINISH</span>
          </div>
        </div>

        {/* Linear Journey Nodes */}
        <div className="relative pl-6 sm:pl-10 space-y-8 before:absolute before:left-3 sm:before:left-5 before:top-4 before:bottom-4 before:w-1 before:bg-slate-200">
          {/* START Pin */}
          <div className="relative flex items-center gap-4">
            <div className="absolute -left-6 sm:-left-10 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-md border-4 border-white">
              <Flag size={14} />
            </div>
            <div className="text-xs font-semibold text-emerald-900 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              TITIK AWAL: Fondasi Pemahaman
            </div>
          </div>

          {/* Checkpoint Cards */}
          {checkpoints.map((checkpoint, index) => {
            const isCompleted = checkpoint.status === 'ACHIEVED';
            const isDeveloping = checkpoint.status === 'DEVELOPING';
            const isLocked = checkpoint.is_locked;

            return (
              <div key={checkpoint.competency_id} className="relative group">
                {/* Node indicator */}
                <div
                  className={`absolute -left-6 sm:-left-10 w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 border-4 border-white shadow-md ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isDeveloping
                      ? 'bg-amber-500 text-white ring-4 ring-amber-100'
                      : isLocked
                      ? 'bg-slate-300 text-slate-600'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={16} />
                  ) : isLocked ? (
                    <Lock size={14} />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Main Card (Percentages Removed) */}
                <div
                  className={`rounded-2xl border transition-all duration-200 p-5 sm:p-6 bg-white shadow-xs hover:shadow-md ${
                    isCompleted
                      ? 'border-emerald-200/80 hover:border-emerald-300'
                      : isDeveloping
                      ? 'border-amber-200 hover:border-amber-300 bg-amber-50/20'
                      : isLocked
                      ? 'border-slate-200 bg-slate-50/70 opacity-80'
                      : 'border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {checkpoint.code}
                        </span>
                        <StatusBadge status={checkpoint.status} size="sm" />
                        <span className="text-[11px] text-slate-400 font-medium">
                          Target: Penguasaan Konsep Mandiri
                        </span>
                      </div>

                      <h3
                        onClick={() => onSelectCompetency(checkpoint.competency_id)}
                        className="text-base sm:text-lg font-bold text-slate-900 hover:text-emerald-700 transition cursor-pointer"
                      >
                        {checkpoint.name}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                        {checkpoint.description}
                      </p>

                      {/* Last attempt status without numerical percentage */}
                      {checkpoint.last_attempt && (
                        <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
                          <span className="text-slate-500">Percobaan Terakhir:</span>
                          <span
                            className={`font-semibold px-2 py-0.5 rounded ${
                              checkpoint.last_attempt.mastery_status === 'ACHIEVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {checkpoint.last_attempt.mastery_status === 'ACHIEVED'
                              ? 'Tercapai (Kuasai Penuh)'
                              : 'Sedang Berkembang (Perlu Refleksi & Latihan)'}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            {new Date(checkpoint.last_attempt.submitted_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      )}

                      {/* Locked alert if prerequisite not satisfied */}
                      {isLocked && (
                        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 flex items-center gap-2">
                          <Lock size={13} className="shrink-0 text-amber-600" />
                          <span>
                            Prasyarat belum terpenuhi. Tuntaskan pos kompetensi sebelumnya untuk membuka pos ini.
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0">
                      <button
                        onClick={() => onSelectCompetency(checkpoint.competency_id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-emerald-700 px-3 py-2 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                      >
                        <BookOpen size={14} />
                        <span>Rincian Materi</span>
                      </button>

                      {isLocked ? (
                        <button
                          disabled
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl bg-slate-200 text-slate-400 cursor-not-allowed"
                        >
                          <Lock size={14} />
                          <span>Terkunci</span>
                        </button>
                      ) : isCompleted ? (
                        <button
                          onClick={() => onStartAssessment(checkpoint.competency_id)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs cursor-pointer"
                        >
                          <CheckCircle2 size={14} />
                          <span>Kaji Ulang (Latihan)</span>
                        </button>
                      ) : isDeveloping ? (
                        <div className="flex items-center gap-2">
                          {onOpenGrowthMindset && (
                            <button
                              onClick={onOpenGrowthMindset}
                              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition cursor-pointer"
                            >
                              <Brain size={13} />
                              <span>Refleksi</span>
                            </button>
                          )}
                          <button
                            onClick={() => onStartAssessment(checkpoint.competency_id)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition shadow-xs cursor-pointer"
                          >
                            <RotateCcw size={14} />
                            <span>Coba Lagi (Retry)</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onStartAssessment(checkpoint.competency_id)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition shadow-xs cursor-pointer"
                        >
                          <span>Mulai Asesmen</span>
                          <ArrowRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* FINISH Pin */}
          <div className="relative flex items-center gap-4 pt-2">
            <div
              className={`absolute -left-6 sm:-left-10 w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-md border-4 border-white ${
                isAllAchieved
                  ? 'bg-emerald-500 text-white animate-bounce'
                  : 'bg-slate-300 text-slate-600'
              }`}
            >
              <Trophy size={15} />
            </div>
            <div
              className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                isAllAchieved
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              TITIK AKHIR: Penguasaan Utuh Materi Program Linear
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
