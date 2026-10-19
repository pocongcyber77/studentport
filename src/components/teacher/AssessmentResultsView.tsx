import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  ClipboardList,
  Filter,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Search,
  Eye,
  Loader2,
} from 'lucide-react';

export const AssessmentResultsView: React.FC = () => {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedComp, setSelectedComp] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (selectedComp) query.set('competency_id', selectedComp);
        if (selectedStatus) query.set('status', selectedStatus);
        if (selectedClass) query.set('class_name', selectedClass);

        const res = await fetch(`/api/teacher/results?${query.toString()}`, {
          headers: { 'x-user-id': token || '' },
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error('Error fetching results:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token, selectedComp, selectedStatus, selectedClass]);

  const results = data?.results || [];
  const competencies = data?.competencies || [];
  const classes = data?.classes || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ClipboardList size={24} className="text-emerald-700" />
          Log Hasil & Riwayat Asesmen Siswa
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Rekaman seluruh pengerjaan formatif yang diserahkan oleh siswa.
        </p>
      </div>

      {/* Filter Row */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-400" />
          <select
            value={selectedComp}
            onChange={(e) => setSelectedComp(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white"
          >
            <option value="">Semua Kompetensi ({competencies.length})</option>
            {competencies.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white"
        >
          <option value="">Semua Status</option>
          <option value="ACHIEVED">Tercapai</option>
          <option value="DEVELOPING">Sedang Berkembang</option>
        </select>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white"
        >
          <option value="">Semua Kelas</option>
          {classes.map((cls: string) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
              <tr>
                <th className="py-3.5 px-5">Siswa & Kelas</th>
                <th className="py-3.5 px-4">Kompetensi</th>
                <th className="py-3.5 px-4 text-center">Hasil & Skor</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-5 text-right">Waktu Pengumpulan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Loader2 size={24} className="animate-spin text-emerald-700 mx-auto mb-2" />
                    <span>Memuat riwayat asesmen...</span>
                  </td>
                </tr>
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400 text-xs">
                    Tidak ada catatan asesmen yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                results.map((r: any) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">
                        {r.student_name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {r.class_name} • {r.student_email}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-xs font-bold text-emerald-700">
                        {r.competency_code}
                      </div>
                      <div className="text-xs text-slate-700">{r.competency_name}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        {r.correct_count} / {r.question_count}
                      </span>
                      <span className="text-xs text-slate-400 block font-mono">
                        ({r.percentage}%)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={r.mastery_status} size="sm" />
                    </td>
                    <td className="py-3.5 px-5 text-right text-xs text-slate-500">
                      {new Date(r.submitted_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
