import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Compass,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Check,
  UserCheck,
} from 'lucide-react';

interface LoginModalProps {
  onForgotPassword: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onForgotPassword }) => {
  const { login, demoAccounts, switchUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Masukkan alamat email.');
      return;
    }
    setLoading(true);
    setError(null);
    const success = await login(email);
    if (!success) {
      setError('Email tidak terdaftar dalam sistem simulasi.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-rose-950 to-stone-950 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-700 via-rose-600 to-pink-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-rose-900/30">
            <Compass size={32} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Personal Learning Journey
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Platform Formative Assessment Berbasis Mastery Learning
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Pengguna
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@sekolah.id"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-rose-500"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Kata Sandi
              </label>
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-[11px] text-rose-700 hover:underline cursor-pointer"
              >
                Lupa kata sandi?
              </button>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-rose-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-900/20 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Memverifikasi...' : 'Masuk ke Akun'}
          </button>
        </form>

        {/* 1-Click Quick Demo Accounts */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="text-xs font-bold text-slate-600 flex items-center justify-between">
            <span>Atau Masuk 1-Klik Akun Simulasi:</span>
            <span className="text-[10px] text-rose-700 font-mono">Demo Ready</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => switchUser('u-student-1')}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-rose-400 hover:bg-rose-50/50 text-left transition cursor-pointer"
            >
              <div className="text-xs font-bold text-slate-900">Budi Santoso</div>
              <div className="text-[10px] text-slate-500">Siswa (X-MIPA 1)</div>
            </button>

            <button
              onClick={() => switchUser('u-student-2')}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-rose-400 hover:bg-rose-50/50 text-left transition cursor-pointer"
            >
              <div className="text-xs font-bold text-slate-900">Siti Rahma</div>
              <div className="text-[10px] text-slate-500">Siswa (3 Tercapai)</div>
            </button>

            <button
              onClick={() => switchUser('u-teacher-1')}
              className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/30 hover:bg-purple-50 text-left transition cursor-pointer"
            >
              <div className="text-xs font-bold text-purple-900">Ibu Ratna Dewi</div>
              <div className="text-[10px] text-purple-600">Guru Matematika</div>
            </button>

            <button
              onClick={() => switchUser('u-admin-1')}
              className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50 text-left transition cursor-pointer"
            >
              <div className="text-xs font-bold text-emerald-900">Admin Kurikulum</div>
              <div className="text-[10px] text-emerald-600">Hak Akses Penuh</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
