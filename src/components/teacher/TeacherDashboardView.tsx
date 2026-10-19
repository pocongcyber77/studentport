import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  GraduationCap,
  Users,
  CheckCircle2,
  TrendingUp,
  CircleDashed,
  Layers,
  ArrowRight,
  ClipboardList,
  BarChart3,
  Calendar,
  Sparkles,
  Loader2,
  UserCog,
  Brain,
} from 'lucide-react';

interface TeacherDashboardViewProps {
  onNavigateTab: (tab: string) => void;
  onSelectStudent?: (studentId: string) => void;
}

export const TeacherDashboardView: React.FC<TeacherDashboardViewProps> = ({
  onNavigateTab,
  onSelectStudent,
}) => {
  const { token, user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/teacher/dashboard', {
          headers: { 'x-user-id': token || '' },
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Error loading teacher dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 size={36} className="animate-spin text-rose-600 mb-2" />
        <span className="text-sm text-slate-500">Memuat data analitik kelas...</span>
      </div>
    );
  }

  if (!data) return null;

  const { total_students, total_competencies, total_attempts, distribution, competency_stats, recent_activities } = data;

  const totalPoints = distribution.total_checkpoints || 1;
  const pctAchieved = Math.round((distribution.achieved / totalPoints) * 100);
  const pctDeveloping = Math.round((distribution.developing / totalPoints) * 100);
  const pctNotStarted = Math.round((distribution.not_started / totalPoints) * 100);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Teacher Welcome Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1b4332] via-[#2d6a4f] to-[#1e4634] p-6 sm:p-8 text-white shadow-xl border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-lime-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/25 text-emerald-200 text-xs font-medium border border-emerald-400/35">
            <GraduationCap size={14} />
            <span>Portal Pendidik • Formative Assessment Mastery Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Dashboard Guru: {user?.name}
          </h1>
          <p className="text-emerald-100/90 text-xs sm:text-sm max-w-xl leading-relaxed">
            Pantau perkembangan penguasaan materi siswa secara formatif, identifikasi kebutuhan remediasi, dan kelola bank soal untuk memandu alur belajar.
          </p>
        </div>

        {/* Quick Nav Shortcut Buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigateTab('teacher-reflections')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition shadow-md shadow-teal-600/30 cursor-pointer"
          >
            <Brain size={15} />
            <span>Pantau Ruang Refleksi</span>
          </button>
          <button
            onClick={() => onNavigateTab('teacher-roles')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-md shadow-purple-600/30 cursor-pointer"
          >
            <UserCog size={15} />
            <span>Kelola Role & Pengguna</span>
          </button>
          <button
            onClick={() => onNavigateTab('teacher-analytics')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition shadow-md shadow-emerald-900/20 cursor-pointer"
          >
            <BarChart3 size={15} />
            <span>Heatmap Kelas</span>
          </button>
          <button
            onClick={() => onNavigateTab('teacher-questions')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition cursor-pointer"
          >
            <Layers size={15} />
            <span>Bank Soal</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users size={24} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Siswa Binaan</div>
            <div className="text-2xl font-extrabold text-slate-900">{total_students} Orang</div>
          </div>
        </div>

        {/* Status: Tercapai */}
        <div className="bg-white rounded-2xl border border-emerald-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Status Tercapai</div>
            <div className="text-2xl font-extrabold text-emerald-700">
              {distribution.achieved} <span className="text-xs font-normal text-slate-400">({pctAchieved}%)</span>
            </div>
          </div>
        </div>

        {/* Status: Sedang Berkembang */}
        <div className="bg-white rounded-2xl border border-amber-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Sedang Berkembang</div>
            <div className="text-2xl font-extrabold text-amber-700">
              {distribution.developing} <span className="text-xs font-normal text-slate-400">({pctDeveloping}%)</span>
            </div>
          </div>
        </div>

        {/* Total Submissions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <ClipboardList size={24} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Percobaan Asesmen</div>
            <div className="text-2xl font-extrabold text-slate-900">{total_attempts} Kali</div>
          </div>
        </div>
      </div>

      {/* Aggregate Distribution Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Distribusi Status Penguasaan Seluruh Siswa
            </h3>
            <p className="text-xs text-slate-500">
              Total {totalPoints} posisi pos kompetensi di seluruh siswa terdaftar.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Tercapai ({distribution.achieved})
            </span>
            <span className="flex items-center gap-1.5 text-amber-700">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Sedang Berkembang ({distribution.developing})
            </span>
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              Belum Dimulai ({distribution.not_started})
            </span>
          </div>
        </div>

        {/* Stacked Bar */}
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
          <div
            style={{ width: `${pctAchieved}%` }}
            className="bg-emerald-500 h-full transition-all duration-500"
            title={`Tercapai: ${pctAchieved}%`}
          />
          <div
            style={{ width: `${pctDeveloping}%` }}
            className="bg-amber-500 h-full transition-all duration-500"
            title={`Sedang Berkembang: ${pctDeveloping}%`}
          />
          <div
            style={{ width: `${pctNotStarted}%` }}
            className="bg-slate-300 h-full transition-all duration-500"
            title={`Belum Dimulai: ${pctNotStarted}%`}
          />
        </div>
      </div>

      {/* Growth Mindset Reflection Callout */}
      <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-white rounded-3xl border border-teal-200/90 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-teal-700/20">
            <Brain size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <span>Ruang Refleksi & Suara Hati Murid</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                Fitur Formatif
              </span>
            </h3>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              Lihat ragam emosi murid (Fixed vs Growth Mindset), kendala spesifik yang dihadapi pada tiap pos materi, rencana aksi nyata yang mereka pilih, dan berikan catatan apresiasi guru secara langsung.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('teacher-reflections')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm transition shadow-sm cursor-pointer shrink-0 self-start sm:self-center"
        >
          <span>Buka Semua Refleksi Murid</span>
          <ArrowRight size={15} />
        </button>
      </div>

      {/* Two-Column Grid: Competency Mastery Rates & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Competencies Mastery Overview (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Layers size={18} className="text-emerald-600" />
                Tingkat Penguasaan per Pos Kompetensi
              </h2>
              <p className="text-xs text-slate-500">
                Persentase siswa yang telah mencapai ambang batas (mastery threshold).
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('teacher-competencies')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
            >
              Kelola &gt;
            </button>
          </div>

          <div className="space-y-4 pt-1">
            {competency_stats.map((c: any) => (
              <div key={c.competency_id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {c.code}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{c.name}</span>
                  </div>
                  <span className="font-extrabold text-slate-800 text-sm">{c.mastery_rate}% Tercapai</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${c.mastery_rate}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Ambang Batas: <strong>{Math.round(c.threshold * 100)}%</strong></span>
                  <span>{c.achieved} Tercapai • {c.developing} Berkembang • {c.not_started} Belum Mulai</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Submissions (1 col) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar size={18} className="text-emerald-600" />
              Aktivitas Terbaru
            </h2>
            <button
              onClick={() => onNavigateTab('teacher-results')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
            >
              Semua &gt;
            </button>
          </div>

          <div className="space-y-3">
            {recent_activities.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Belum ada aktivitas asesmen.
              </div>
            ) : (
              recent_activities.map((act: any) => (
                <div
                  key={act.id}
                  onClick={() => onSelectStudent && onSelectStudent(act.student_id)}
                  className="p-3 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40 transition cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 truncate max-w-[140px]">
                      {act.student_name}
                    </span>
                    <StatusBadge status={act.mastery_status} size="sm" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-mono">{act.competency_code}</span>
                    <span>
                      {act.correct_count}/{act.question_count} ({act.percentage}%)
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
