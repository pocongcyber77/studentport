import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  X,
  User,
  Layers,
  Calendar,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
} from 'lucide-react';

interface StudentDetailModalProps {
  studentId: string;
  onClose: () => void;
  onPreviewAsStudent: (userId: string) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  studentId,
  onClose,
  onPreviewAsStudent,
}) => {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/teacher/students/${studentId}`, {
          headers: { 'x-user-id': token || '' },
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error('Error fetching student detail:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [studentId, token]);

  if (!studentId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2d6a4f] via-[#40916c] to-[#74c69d] text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-emerald-900/15">
              {data?.student?.full_name?.charAt(0) || 'S'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {data?.student?.full_name || 'Rincian Siswa'}
              </h2>
              <div className="text-xs text-slate-500">
                {data?.student?.class_name} • {data?.student?.email}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {data?.student?.user_id && (
              <button
                onClick={() => {
                  onClose();
                  onPreviewAsStudent(data.student.user_id);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold cursor-pointer border border-emerald-200/60"
              >
                <ExternalLink size={13} />
                <span>Lihat Perjalanan Siswa</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-emerald-700" />
          </div>
        ) : !data ? (
          <div className="py-8 text-center text-slate-400">Data tidak ditemukan.</div>
        ) : (
          <div className="space-y-6">
            {/* Competency Mastery Cards */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Layers size={16} className="text-emerald-700" />
                Status Per Pos Kompetensi
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.competencies.map((c: any) => (
                  <div
                    key={c.competency.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-700">
                        {c.competency.code}
                      </span>
                      <StatusBadge status={c.status} size="sm" />
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      {c.competency.name}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center justify-between pt-1">
                      <span>Percobaan: <strong>{c.attempts_count}x</strong></span>
                      {c.last_updated_at && (
                        <span>
                          {new Date(c.last_updated_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assessment History Logs */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Clock size={16} className="text-emerald-700" />
                Seluruh Percobaan Asesmen ({data.all_attempts.length})
              </h3>
              {data.all_attempts.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 bg-slate-50 rounded-2xl">
                  Siswa ini belum pernah mengirimkan asesmen.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {data.all_attempts.map((att: any) => (
                    <div
                      key={att.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-900">
                          {att.competency_code} - {att.competency_name}
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          {new Date(att.submitted_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-slate-800">
                          {att.correct_count}/{att.question_count} ({att.percentage}%)
                        </span>
                        <StatusBadge status={att.mastery_status} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
