import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Database,
  Table,
  Download,
  RotateCcw,
  Search,
  Code2,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';

export const DatabaseInspectorView: React.FC = () => {
  const { token, refreshUser } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTable, setActiveTable] = useState<string>('users');
  const [viewMode, setViewMode] = useState<'table' | 'json'>('table');
  const [search, setSearch] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [resetting, setResetting] = useState(false);

  const fetchDatabase = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/teacher/database', {
        headers: { 'x-user-id': token || '' },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error('Error fetching database:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabase();
  }, [token]);

  const handleDownloadJson = () => {
    if (!data?.database) return;
    const jsonStr = JSON.stringify(data.database, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learning_journey_db_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyJson = () => {
    if (!data?.database) return;
    const tableData = activeTable === 'all' ? data.database : data.database[activeTable];
    navigator.clipboard.writeText(JSON.stringify(tableData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetSeed = async () => {
    if (!confirm('Apakah Anda yakin ingin me-reset database ke data awal (seed default)? Seluruh percobaan dan perubahan terkini akan dikembalikan ke kondisi awal.')) {
      return;
    }

    setResetting(true);
    try {
      const res = await fetch('/api/teacher/database/reset', {
        method: 'POST',
        headers: { 'x-user-id': token || '' },
      });
      if (res.ok) {
        await fetchDatabase();
        await refreshUser();
        alert('Database berhasil di-reset ke kondisi awal!');
      }
    } catch (e) {
      console.error('Error resetting database:', e);
    } finally {
      setResetting(false);
    }
  };

  const tables = [
    { id: 'users', label: 'Users', count: data?.summary?.users_count || 0 },
    { id: 'students', label: 'Students', count: data?.summary?.students_count || 0 },
    { id: 'competencies', label: 'Competencies', count: data?.summary?.competencies_count || 0 },
    { id: 'competency_progress', label: 'Progress', count: data?.summary?.competency_progress_count || 0 },
    { id: 'questions', label: 'Questions (Bank Soal)', count: data?.summary?.questions_count || 0 },
    { id: 'attempts', label: 'Attempts (Asesmen)', count: data?.summary?.attempts_count || 0 },
    { id: 'responses', label: 'Responses', count: data?.summary?.responses_count || 0 },
    { id: 'audit_logs', label: 'Audit Logs', count: data?.summary?.audit_logs_count || 0 },
    { id: 'all', label: 'Full DB JSON', count: Object.keys(data?.database || {}).length },
  ];

  const currentRecords: any[] = activeTable === 'all'
    ? []
    : data?.database?.[activeTable] || [];

  const filteredRecords = currentRecords.filter((rec) => {
    if (!search) return true;
    const text = JSON.stringify(rec).toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const columns = currentRecords.length > 0 ? Object.keys(currentRecords[0]) : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Database size={24} className="text-emerald-700" />
            Database Explorer & Inspeksi Data
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Lihat struktur relasional, isi tabel, status persistensi berkas (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">/data/learning_journey_db.json</code>), dan unduh salinan basis data.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleCopyJson}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copied ? 'Tersalin!' : 'Salin JSON'}</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white text-xs font-semibold shadow-sm shadow-emerald-900/15 transition cursor-pointer"
          >
            <Download size={14} />
            <span>Unduh File DB</span>
          </button>

          <button
            onClick={handleResetSeed}
            disabled={resetting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
            title="Kembalikan seluruh data ke kondisi awal seed"
          >
            <RotateCcw size={14} className={resetting ? 'animate-spin' : ''} />
            <span>{resetting ? 'Mereset...' : 'Reset ke Seed'}</span>
          </button>
        </div>
      </div>

      {/* Table Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {tables.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setActiveTable(t.id);
              setSearch('');
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
              activeTable === t.id
                ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <span>{t.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                activeTable === t.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter and Mode Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Cari data dalam tabel ${activeTable}...`}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-center">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              viewMode === 'table' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tabel Kolom
          </button>
          <button
            onClick={() => setViewMode('json')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              viewMode === 'json' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Raw JSON
          </button>
        </div>
      </div>

      {/* Database Content Area */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-emerald-700 mb-2" />
          </div>
        ) : activeTable === 'all' || viewMode === 'json' ? (
          <div className="p-4 sm:p-6 bg-slate-900 text-slate-100 overflow-x-auto font-mono text-xs max-h-[600px] overflow-y-auto">
            <pre>
              {JSON.stringify(
                activeTable === 'all' ? data?.database : filteredRecords,
                null,
                2
              )}
            </pre>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Tidak ada baris data yang cocok dengan kriteria pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-3 w-12 text-center bg-slate-50">#</th>
                  {columns.map((col) => (
                    <th key={col} className="py-3 px-3 font-mono bg-slate-50 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 font-mono transition">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-normal">
                      {idx + 1}
                    </td>
                    {columns.map((col) => {
                      const val = row[col];
                      let displayVal = val;
                      if (val === null || val === undefined) displayVal = <span className="text-slate-300 italic">null</span>;
                      else if (typeof val === 'boolean') displayVal = val ? <span className="text-emerald-600 font-bold">true</span> : <span className="text-rose-600 font-bold">false</span>;
                      else if (typeof val === 'object') displayVal = JSON.stringify(val);
                      else if (String(val).length > 60) displayVal = `${String(val).slice(0, 60)}...`;

                      return (
                        <td key={col} className="py-2.5 px-3 text-slate-700 whitespace-nowrap max-w-xs truncate" title={String(val)}>
                          {displayVal}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schema / Architecture Summary Card */}
      <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200/70 p-5 text-xs text-emerald-950 space-y-2">
        <div className="font-bold flex items-center gap-1.5 text-emerald-900">
          <Database size={14} className="text-emerald-700" />
          <span>Informasi Arsitektur Database (Section 12 & 13 Spesifikasi):</span>
        </div>
        <p className="leading-relaxed text-emerald-900/80">
          Database menggunakan skema relasional terstruktur dengan persistensi atomik di berkas <code className="bg-white/80 px-1 py-0.5 rounded font-mono border border-emerald-200">/data/learning_journey_db.json</code>. Relasi: <span className="font-semibold">Users 1—1 Students</span>, <span className="font-semibold">Students 1—N Attempts</span>, <span className="font-semibold">Attempts 1—N Responses</span>, <span className="font-semibold">Competencies 1—N Questions</span>, dan <span className="font-semibold">Competency Progress (Unique: student_id, competency_id)</span>.
        </p>
      </div>
    </div>
  );
};
