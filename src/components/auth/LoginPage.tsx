import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Compass,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface LoginPageProps {
  onForgotPassword: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onForgotPassword }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Masukkan alamat email dan kata sandi.');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await login(email.trim(), password);
    if (!result.success) {
      setError(result.error || 'Email atau kata sandi tidak valid.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-rose-950 to-stone-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-3 text-center">
        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-700 via-rose-600 to-pink-500 flex items-center justify-center text-white mx-auto shadow-xl shadow-rose-900/30">
          <Compass size={36} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Personal Learning Journey
        </h1>
        <p className="text-xs sm:text-sm text-rose-200">
          Platform Formative Assessment Berbasis Mastery Learning & Growth Mindset
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-100 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Masuk ke Portal</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Masuk sesuai akun Anda (Siswa, Guru, atau Admin Kurikulum).
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-xs text-rose-700 flex items-center gap-2.5">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Email Akun
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@sekolah.id"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-rose-500 transition"
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
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-rose-500 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-900/20 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Akun</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Isolation statement */}
        <div className="mt-4 text-center text-xs text-slate-400">
          <span>Sistem isolasi: akun murid hanya dapat melihat data perjalanannya sendiri.</span>
        </div>
      </div>
    </div>
  );
};
