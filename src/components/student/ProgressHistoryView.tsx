import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  History,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

interface ProgressHistoryViewProps {
  onStartAssessment: (competencyId: string) => void;
  onSelectCompetency: (competencyId: string) => void;
}

export const ProgressHistoryView: React.FC<ProgressHistoryViewProps> = ({
  onStartAssessment,
  onSelectCompetency,
}) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/student/progress', {
          headers: { 'x-user-id': token || '' },
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error('Error fetching progress:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px]">
        <Loader2 size={32} className="animate-spin text-emerald-600 mb-2" />
        <span className="text-xs text-slate-500">Memuat riwayat progres belajar...</span>
      </div>
    );
  }

  if (!data) return null;

  const { student, competencies_progress, recent_attempts } = data;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <History size={24} className="text-emerald-600" />
          Riwayat Progres & Bukti Asesmen
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Rekaman perjalanan penguasaan kompetensi mandiri untuk {student.name} ({student.class_name}).
        </p>
      </div>

      {/* Competencies Progress Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {competencies_progress.map((item: any) => {
          const comp = item.competency;
          const status = item.status;

          return (
            <div
              key={comp.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {comp.code}
                  </span>
                  <StatusBadge status={status} size="sm" />
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-900 leading-snug">
                    {comp.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {comp.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Percobaan: <strong>{item.attempts_count}x</strong></span>
                  <span>Status: <strong>{status === 'ACHIEVED' ? 'Tercapai Penuh' : status === 'DEVELOPING' ? 'Perlu Latihan' : 'Belum Dimulai'}</strong></span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectCompetency(comp.id)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                >
                  Lihat Rincian
                </button>

                {status === 'DEVELOPING' ? (
                  <button
                    onClick={() => onStartAssessment(comp.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    <span>Coba Lagi (Retry)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onStartAssessment(comp.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    <span>Latihan</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Timeline of Recent Attempts */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Calendar size={18} className="text-emerald-600" />
          Aktivitas Asesmen Terkini
        </h2>

        {recent_attempts.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            Belum ada aktivitas asesmen yang tersimpan.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recent_attempts.map((att: any) => (
              <div key={att.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-700">
                      {att.competency_code}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {att.competency_name}
                    </span>
                    <StatusBadge status={att.mastery_status} size="sm" />
                  </div>
                  <div className="text-xs text-slate-400">
                    Diserahkan pada{' '}
                    {new Date(att.submitted_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-4 self-start sm:self-center">
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-800">
                      {att.correct_count} / {att.question_count}
                    </div>
                    <div className="text-[11px] text-slate-400">Konsep Tepat</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
