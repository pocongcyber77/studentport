import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  RotateCcw,
  Play,
  Calendar,
  Layers,
  Sparkles,
  HelpCircle,
  Loader2,
} from 'lucide-react';

interface CompetencyDetailViewProps {
  competencyId: string;
  onBack: () => void;
  onStartAssessment: (competencyId: string) => void;
}

export const CompetencyDetailView: React.FC<CompetencyDetailViewProps> = ({
  competencyId,
  onBack,
  onStartAssessment,
}) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/student/competencies/${competencyId}`, {
          headers: { 'x-user-id': token || '' },
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Error fetching competency detail:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [competencyId, token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px]">
        <Loader2 size={32} className="animate-spin text-emerald-600 mb-2" />
        <span className="text-xs text-slate-500">Memuat rincian kompetensi...</span>
      </div>
    );
  }

  if (!data || !data.competency) {
    return (
      <div className="p-8 text-center text-slate-500">
        Data kompetensi tidak ditemukan.
      </div>
    );
  }

  const { competency, student_status, is_locked, prerequisite, attempts, total_questions } = data;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="text-xs font-semibold text-slate-400">
          Learning Journey / Rincian Pos Kompetensi
        </span>
      </div>

      {/* Main Competency Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                {competency.code}
              </span>
              <StatusBadge status={student_status} size="md" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {competency.name}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              {competency.description}
            </p>
          </div>

          {/* Action button */}
          <div className="shrink-0 pt-2 sm:pt-0">
            {is_locked ? (
              <button
                disabled
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 text-slate-400 text-xs sm:text-sm font-semibold cursor-not-allowed"
              >
                <Lock size={16} />
                <span>Prasyarat Belum Lengkap</span>
              </button>
            ) : student_status === 'ACHIEVED' ? (
              <button
                onClick={() => onStartAssessment(competency.id)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition shadow-sm cursor-pointer"
              >
                <CheckCircle2 size={16} />
                <span>Kaji Ulang (Latihan)</span>
              </button>
            ) : student_status === 'DEVELOPING' ? (
              <button
                onClick={() => onStartAssessment(competency.id)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold transition shadow-md shadow-amber-600/20 cursor-pointer animate-pulse-subtle"
              >
                <RotateCcw size={16} />
                <span>Coba Lagi (Retry)</span>
              </button>
            ) : (
              <button
                onClick={() => onStartAssessment(competency.id)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold transition shadow-md shadow-emerald-900/15 cursor-pointer"
              >
                <Play size={16} />
                <span>Mulai Asesmen Formatif</span>
              </button>
            )}
          </div>
        </div>

        {/* Competency Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 block font-medium">Standar Penguasaan:</span>
            <span className="text-sm font-bold text-slate-800">
              Penguasaan Konsep Mandiri
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 block font-medium">Bank Soal Aktif:</span>
            <span className="text-sm font-bold text-slate-800">
              {total_questions} Soal Pilihan Ganda
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 block font-medium">Kompetensi Prasyarat:</span>
            <span className="text-sm font-bold text-slate-800">
              {prerequisite ? `${prerequisite.code} (${prerequisite.status})` : 'Tidak Ada (Materi Fondasi)'}
            </span>
          </div>
        </div>
      </div>

      {/* Attempts History for this Competency */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers size={18} className="text-emerald-600" />
            Riwayat Percobaan Asesmen ({attempts.length})
          </h2>
          <span className="text-xs text-slate-400">Semua riwayat pengerjaan tetap tersimpan</span>
        </div>

        {attempts.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            Belum ada riwayat pengerjaan asesmen untuk kompetensi ini.
          </div>
        ) : (
          <div className="space-y-3">
            {attempts.map((att: any, idx: number) => {
              const isMet = att.mastery_status === 'ACHIEVED';

              return (
                <div
                  key={att.id}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        Percobaan #{attempts.length - idx}
                      </span>
                      <StatusBadge status={att.mastery_status} size="sm" />
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Calendar size={13} />
                      {new Date(att.submitted_at).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    {att.ai_feedback && (
                      <p className="text-xs text-slate-600 line-clamp-2 pt-1 italic">
                        "{att.ai_feedback}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-base sm:text-lg font-extrabold text-slate-900">
                        {att.correct_count} / {att.question_count}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Konsep Tepat
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
