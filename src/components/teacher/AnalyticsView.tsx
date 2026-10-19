import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  BarChart3,
  Download,
  Printer,
  Users,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  FileSpreadsheet,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/teacher/analytics', {
          headers: { 'x-user-id': token || '' },
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error('Error fetching analytics:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const exportCSV = () => {
    if (!data?.heatmap) return;

    const headers = ['Nama Siswa', 'Kelas'];
    const comps = data.heatmap[0]?.competencies || [];
    comps.forEach((c: any) => headers.push(c.code));

    const rows = data.heatmap.map((row: any) => {
      const line = [row.student_name, row.class_name];
      row.competencies.forEach((c: any) => {
        line.push(c.status);
      });
      return line.join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `analitik_learning_journey_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[350px]">
        <Loader2 size={32} className="animate-spin text-emerald-700 mb-2" />
      </div>
    );
  }

  if (!data) return null;

  const { heatmap, remediation_groups } = data;
  const competenciesHeader = heatmap[0]?.competencies || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Title & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 size={24} className="text-emerald-700" />
            Heatmap & Analitik Kebutuhan Belajar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Visualisasi status penguasaan seluruh siswa dan pemetaan kelompok siswa yang memerlukan remediasi.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Download size={14} />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white text-xs font-semibold shadow-sm shadow-emerald-900/15 transition cursor-pointer"
          >
            <Printer size={14} />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* Heatmap Matrix Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Matriks Heatmap Penguasaan Siswa x Pos Kompetensi
            </h2>
            <p className="text-xs text-slate-500">
              Peta visual komparatif status: Hijau (Tercapai), Kuning (Sedang Berkembang), Abu-abu (Belum Dimulai).
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="flex items-center gap-1 text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Tercapai
            </span>
            <span className="flex items-center gap-1 text-amber-700">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Berkembang
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Belum Mulai
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
              <tr>
                <th className="py-3.5 px-5">Nama Siswa</th>
                <th className="py-3.5 px-4">Kelas</th>
                {competenciesHeader.map((c: any) => (
                  <th key={c.competency_id} className="py-3.5 px-4 text-center">
                    <span className="font-mono">{c.code}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {heatmap.map((row: any) => (
                <tr key={row.student_id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-5 font-bold text-slate-900 text-xs sm:text-sm">
                    {row.student_name}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-500">
                    {row.class_name}
                  </td>
                  {row.competencies.map((compItem: any) => {
                    const st = compItem.status;
                    const pct = compItem.percentage;

                    let cellStyle = 'bg-slate-100 text-slate-500 border-slate-200';
                    let dot = 'bg-slate-300';
                    if (st === 'ACHIEVED') {
                      cellStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                      dot = 'bg-emerald-500';
                    } else if (st === 'DEVELOPING') {
                      cellStyle = 'bg-amber-50 text-amber-800 border-amber-200';
                      dot = 'bg-amber-500';
                    }

                    return (
                      <td key={compItem.competency_id} className="py-3 px-4 text-center">
                        <div
                          className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-semibold ${cellStyle}`}
                          title={`${row.student_name}: ${st}${pct !== null ? ` (${pct}%)` : ''}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${dot}`} />
                          <span>
                            {st === 'ACHIEVED' ? 'Tercapai' : st === 'DEVELOPING' ? 'Berkembang' : 'Belum Mulai'}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Remediation Target Groups (Section 22: Students developing a selected competency) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            Kelompok Sasaran Remediasi & Bimbingan Khusus
          </h2>
          <p className="text-xs text-slate-500">
            Daftar siswa yang saat ini berstatus <strong>Sedang Berkembang</strong> pada masing-masing pos kompetensi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {remediation_groups.map((group: any) => (
            <div
              key={group.competency_id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {group.code}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">{group.name}</h3>
                </div>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  {group.developing_count} Siswa
                </span>
              </div>

              {group.students.length === 0 ? (
                <div className="py-4 text-center text-xs text-emerald-600 bg-emerald-50/50 rounded-xl flex items-center justify-center gap-1.5 font-medium">
                  <CheckCircle2 size={14} />
                  <span>Tidak ada siswa yang tertahan di tahap ini!</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {group.students.map((std: any) => (
                    <div
                      key={std.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div className="font-semibold text-slate-800">
                        {std.name} <span className="text-slate-400 font-normal">({std.class_name})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-700">
                          {std.latest_score}%
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {std.submitted_at
                            ? new Date(std.submitted_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                              })
                            : '-'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
