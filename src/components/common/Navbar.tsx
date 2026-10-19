import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Compass,
  GraduationCap,
  Users,
  FileQuestion,
  Layers,
  BarChart3,
  History,
  UserCircle,
  LogOut,
  ChevronDown,
  Sparkles,
  ClipboardList,
  ShieldAlert,
  Database,
  Brain,
  UserCog,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange }) => {
  const { user, demoAccounts, switchUser, logout } = useAuth();
  const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) return null;

  const isTeacherOrAdmin = user.role === 'teacher' || user.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs backdrop-blur-md bg-white/95">
      {/* Demo Account Switcher Ribbon - Only visible to Teacher or Admin */}
      {isTeacherOrAdmin && (
        <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Mode Pendidik
              </span>
              <span className="text-slate-400 hidden sm:inline">
                Login saat ini: <strong className="text-white font-medium">{user.name}</strong> ({user.role === 'teacher' ? 'Guru' : 'Admin Kurikulum'})
              </span>
            </div>

            <div className="relative">
              <button
                onClick={() => setIsDemoMenuOpen(!isDemoMenuOpen)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer border border-slate-700"
              >
                <span>Pratinjau Akun Persona (Guru/Admin/Siswa)</span>
                <ChevronDown size={13} className={`transition-transform ${isDemoMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDemoMenuOpen && (
                <div
                  className="absolute right-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 text-slate-800"
                  onClick={() => setIsDemoMenuOpen(false)}
                >
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Pilih Akun Simulasi
                  </div>
                  {demoAccounts.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => switchUser(acc.id)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 transition cursor-pointer ${
                        acc.id === user.id ? 'bg-emerald-50/80 font-semibold text-emerald-800' : 'text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-slate-900">{acc.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {acc.role === 'student'
                            ? `Siswa (${acc.student_profile?.class_name || 'Kelas X'})`
                            : acc.role === 'teacher'
                            ? 'Guru Mata Pelajaran'
                            : 'Admin Kurikulum'}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase ${
                          acc.role === 'student'
                            ? 'bg-blue-100 text-blue-700'
                            : acc.role === 'teacher'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {acc.role}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onTabChange(isTeacherOrAdmin ? 'teacher-dashboard' : 'journey')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2d6a4f] via-[#40916c] to-[#74c69d] flex items-center justify-center text-white shadow-md shadow-emerald-900/15 group-hover:scale-105 transition-transform">
                <Compass size={22} className="text-white" />
              </div>
              <div>
                <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                  Personal Learning Journey
                </span>
                <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                  <Sparkles size={11} /> Mastery-Based Formative Assessment
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {!isTeacherOrAdmin ? (
              <>
                <button
                  onClick={() => onTabChange('journey')}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                    currentTab === 'journey'
                      ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Compass size={17} />
                  <span>Perjalanan Belajar</span>
                </button>
                <button
                  onClick={() => onTabChange('student-mindset')}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                    currentTab === 'student-mindset'
                      ? 'bg-teal-50 text-teal-800 font-semibold ring-1 ring-teal-300'
                      : 'text-teal-700 hover:text-teal-900 hover:bg-teal-50/70 font-medium'
                  }`}
                >
                  <Brain size={17} className="text-teal-600" />
                  <span>Refleksi & Mindset</span>
                </button>
                <button
                  onClick={() => onTabChange('student-progress')}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                    currentTab === 'student-progress'
                      ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <History size={17} />
                  <span>Riwayat Progres</span>
                </button>
                <button
                  onClick={() => onTabChange('student-profile')}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                    currentTab === 'student-profile'
                      ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <UserCircle size={17} />
                  <span>Profil Siswa</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onTabChange('teacher-dashboard')}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs xl:text-sm font-medium transition cursor-pointer ${
                    currentTab === 'teacher-dashboard'
                      ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <GraduationCap size={16} />
                  <span>Dashboard Guru</span>
                </button>
                <button
                  onClick={() => onTabChange('teacher-students')}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs xl:text-sm font-medium transition cursor-pointer ${
                    currentTab === 'teacher-students'
                      ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Users size={16} />
                  <span>Daftar Siswa</span>
                </button>
                <button
                  onClick={() => onTabChange('teacher-results')}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs xl:text-sm font-medium transition cursor-pointer ${
                    currentTab === 'teacher-results'
                      ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ClipboardList size={16} />
                  <span>Hasil Asesmen</span>
                </button>
                <button
                  onClick={() => onTabChange('teacher-reflections')}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs xl:text-sm font-medium transition cursor-pointer ${
                    currentTab === 'teacher-reflections'
                      ? 'bg-teal-50 text-teal-800 font-semibold border border-teal-200/80 ring-1 ring-teal-300'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Brain size={16} className="text-teal-600" />
                  <span>Ruang Refleksi</span>
                </button>
                <button
                  onClick={() => onTabChange('teacher-questions')}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs xl:text-sm font-medium transition cursor-pointer ${
                    currentTab === 'teacher-questions'
                      ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileQuestion size={16} />
                  <span>Bank Soal</span>
                </button>
                <button
                  onClick={() => onTabChange('teacher-competencies')}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs xl:text-sm font-medium transition cursor-pointer ${
                    currentTab === 'teacher-competencies'
                      ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Layers size={16} />
                  <span>Kompetensi</span>
                </button>
                <button
                  onClick={() => onTabChange('teacher-analytics')}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs xl:text-sm font-medium transition cursor-pointer ${
                    currentTab === 'teacher-analytics'
                      ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 size={16} />
                  <span>Heatmap Kelas</span>
                </button>
                <button
                  onClick={() => onTabChange('teacher-audit')}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs xl:text-sm font-medium transition cursor-pointer ${
                    currentTab === 'teacher-audit'
                      ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ShieldAlert size={16} />
                  <span>Audit</span>
                </button>
                <button
                  onClick={() => onTabChange('teacher-roles')}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs xl:text-sm font-medium transition cursor-pointer ${
                    currentTab === 'teacher-roles'
                      ? 'bg-purple-600 text-white font-semibold shadow-xs'
                      : 'text-purple-700 hover:text-purple-900 hover:bg-purple-50 font-semibold'
                  }`}
                >
                  <UserCog size={16} />
                  <span>Kelola Role</span>
                </button>
                <button
                  onClick={() => onTabChange('teacher-database')}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs xl:text-sm font-medium transition cursor-pointer ${
                    currentTab === 'teacher-database'
                      ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                      : 'text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 font-semibold'
                  }`}
                >
                  <Database size={16} />
                  <span>Database</span>
                </button>
              </>
            )}
          </nav>

          {/* User Profile Info & Logout */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-white"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#2d6a4f] to-[#74c69d] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="text-left">
                <div className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[130px]">
                  {user.name}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {user.role === 'student' ? user.student_profile?.class_name || 'Siswa' : 'Tenaga Pendidik'}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Keluar"
              className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
            >
              <LogOut size={18} />
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-100 flex flex-col gap-1">
            {!isTeacherOrAdmin ? (
              <>
                <button
                  onClick={() => {
                    onTabChange('journey');
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-3 py-2 text-left text-sm font-medium rounded-lg text-slate-700 hover:bg-emerald-50"
                >
                  Perjalanan Belajar
                </button>
                <button
                  onClick={() => {
                    onTabChange('student-mindset');
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-3 py-2 text-left text-sm font-medium rounded-lg text-teal-800 bg-teal-50 hover:bg-teal-100"
                >
                  Refleksi & Mindset (Pre-Retry)
                </button>
                <button
                  onClick={() => {
                    onTabChange('student-progress');
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-3 py-2 text-left text-sm font-medium rounded-lg text-slate-700 hover:bg-emerald-50"
                >
                  Riwayat Progres
                </button>
                <button
                  onClick={() => {
                    onTabChange('student-profile');
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-3 py-2 text-left text-sm font-medium rounded-lg text-slate-700 hover:bg-emerald-50"
                >
                  Profil Siswa
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    onTabChange('teacher-dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-3 py-2 text-left text-sm font-medium rounded-lg text-slate-700 hover:bg-emerald-50"
                >
                  Dashboard Guru
                </button>
                <button
                  onClick={() => {
                    onTabChange('teacher-students');
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-3 py-2 text-left text-sm font-medium rounded-lg text-slate-700 hover:bg-emerald-50"
                >
                  Daftar Siswa
                </button>
                <button
                  onClick={() => {
                    onTabChange('teacher-results');
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-3 py-2 text-left text-sm font-medium rounded-lg text-slate-700 hover:bg-emerald-50"
                >
                  Hasil Asesmen
                </button>
                <button
                  onClick={() => {
                    onTabChange('teacher-reflections');
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-3 py-2 text-left text-sm font-medium rounded-lg text-teal-800 bg-teal-50 font-semibold"
                >
                  Ruang Refleksi Siswa
                </button>
                <button
                  onClick={() => {
                    onTabChange('teacher-questions');
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-3 py-2 text-left text-sm font-medium rounded-lg text-slate-700 hover:bg-emerald-50"
                >
                  Bank Soal
                </button>
                <button
                  onClick={() => {
                    onTabChange('teacher-competencies');
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-3 py-2 text-left text-sm font-medium rounded-lg text-slate-700 hover:bg-emerald-50"
                >
                  Kelola Kompetensi
                </button>
                <button
                  onClick={() => {
                    onTabChange('teacher-analytics');
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-3 py-2 text-left text-sm font-medium rounded-lg text-slate-700 hover:bg-emerald-50"
                >
                  Heatmap Kelas
                </button>
              </>
            )}
            <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between px-3">
              <span className="text-xs text-slate-500 font-medium">{user.name}</span>
              <button onClick={logout} className="text-xs text-emerald-700 font-semibold">
                Keluar
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
