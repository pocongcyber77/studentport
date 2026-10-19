import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

interface ForgotPasswordModalProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSent(true);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-rose-950 to-stone-950 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
        <button
          onClick={onBackToLogin}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Halaman Login</span>
        </button>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">Pemulihan Kata Sandi</h2>
          <p className="text-xs text-slate-500">
            Masukkan alamat email yang terdaftar untuk menerima tautan simulasi reset kata sandi.
          </p>
        </div>

        {sent ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-3">
            <CheckCircle2 size={32} className="text-emerald-600 mx-auto" />
            <h3 className="font-bold text-slate-900 text-sm">Tautan Terkirim!</h3>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Tautan simulasi reset kata sandi telah dikirimkan ke <strong>{email}</strong>.
            </p>
            <button
              onClick={onBackToLogin}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs cursor-pointer"
            >
              Kembali & Masuk
            </button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Email Siswa / Guru
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="budi@sekolah.id"
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
              {loading ? 'Mengirim...' : 'Kirim Tautan Pemulihan'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
