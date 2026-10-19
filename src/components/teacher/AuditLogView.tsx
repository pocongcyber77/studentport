import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  Calendar,
  User,
  Activity,
  CheckCircle2,
  FileText,
  Loader2,
} from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/teacher/audit-logs', {
          headers: { 'x-user-id': token || '' },
        });
        if (res.ok) {
          const json = await res.json();
          setLogs(json.logs || []);
        }
      } catch (e) {
        console.error('Error fetching audit logs:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldAlert size={24} className="text-emerald-700" />
          Log Audit & Transparansi Sistem (Section 27)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Catatan riwayat aktivitas penting: pengerjaan asesmen siswa, perubahan konfigurasi kompetensi, dan modifikasi bank soal.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-emerald-700" />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Belum ada catatan log audit.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log: any) => (
              <div key={log.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:bg-slate-50/50 transition">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {log.action}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      {log.actor_name}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase ${
                        log.actor_role === 'student'
                          ? 'bg-blue-100 text-blue-700'
                          : log.actor_role === 'teacher'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {log.actor_role}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 font-mono bg-slate-50 p-2 rounded-lg mt-1 border border-slate-100 overflow-x-auto max-w-xl">
                    {JSON.stringify(log.details)}
                  </div>
                </div>

                <div className="text-xs text-slate-400 shrink-0 flex items-center gap-1">
                  <Calendar size={13} />
                  <span>
                    {new Date(log.timestamp).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
