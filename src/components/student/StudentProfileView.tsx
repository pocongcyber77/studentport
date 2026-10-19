import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  UserCircle,
  Mail,
  GraduationCap,
  School,
  ShieldCheck,
  Calendar,
  Loader2,
} from 'lucide-react';

export const StudentProfileView: React.FC = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/student/profile', {
          headers: { 'x-user-id': token || '' },
        });
        if (res.ok) {
          const json = await res.json();
          setProfile(json);
        }
      } catch (e) {
        console.error('Failed to load profile:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[350px]">
        <Loader2 size={32} className="animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!profile) return null;

  const { user, student } = profile;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <UserCircle size={24} className="text-emerald-600" />
          Profil Siswa
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Informasi identitas akun dan hak akses personal.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-4">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-emerald-50"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#2d6a4f] via-[#40916c] to-[#74c69d] text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-emerald-900/15">
              {user.name.charAt(0)}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-slate-900">{student?.full_name || user.name}</h2>
            <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5 mt-0.5">
              <ShieldCheck size={14} />
              <span>Akses Terisolasi: Siswa Mandiri</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-sm">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Mail size={13} /> Email Terdaftar
            </span>
            <span className="font-semibold text-slate-800">{user.email}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <GraduationCap size={13} /> Jenjang & Kelas
            </span>
            <span className="font-semibold text-slate-800">
              {student ? `${student.grade} - ${student.class_name}` : 'Kelas X'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <School size={13} /> Institusi
            </span>
            <span className="font-semibold text-slate-800">SMA Negeri 1 Pembelajaran</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Calendar size={13} /> Terdaftar Sejak
            </span>
            <span className="font-semibold text-slate-800">Tahun Ajaran Aktif</span>
          </div>
        </div>

        {/* Security & Isolation statement */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 leading-relaxed space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-emerald-900">
            <ShieldCheck size={14} className="text-emerald-600" />
            Prinsip Privasi & Isolasi Siswa (Section 15 Specification):
          </div>
          <p className="text-emerald-900/90">
            Sistem menjamin data asesmenmu tidak dapat dilihat atau diubah oleh siswa lain. Perjalanan belajar ini dirancang khusus untuk mengamati pertumbuhanmu sendiri tanpa kompetisi atau pemeringkatan.
          </p>
        </div>
      </div>
    </div>
  );
};
