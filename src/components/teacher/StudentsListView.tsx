import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  Users,
  Search,
  Filter,
  Eye,
  ArrowRight,
  ExternalLink,
  Calendar,
  Sparkles,
  Loader2,
  UserCog,
  UserPlus,
  Edit2,
  Save,
  CheckCircle2,
  AlertCircle,
  X,
  GraduationCap,
} from 'lucide-react';

interface StudentsListViewProps {
  onSelectStudentDetail: (studentId: string) => void;
  onPreviewStudentJourney: (studentUserId: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const StudentsListView: React.FC<StudentsListViewProps> = ({
  onSelectStudentDetail,
  onPreviewStudentJourney,
  onNavigateTab,
}) => {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  // Toast notification
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Add Student Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formGrade, setFormGrade] = useState('Kelas X');
  const [formClass, setFormClass] = useState('X-MIPA 1');
  const [formPassword, setFormPassword] = useState('password123');
  const [savingStudent, setSavingStudent] = useState(false);

  // Edit Student Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editGrade, setEditGrade] = useState('Kelas X');
  const [editClass, setEditClass] = useState('X-MIPA 1');
  const [savingEdit, setSavingEdit] = useState(false);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set('search', search);
      if (selectedClass) query.set('class_filter', selectedClass);

      const res = await fetch(`/api/teacher/students?${query.toString()}`, {
        headers: { 'x-user-id': token || '' },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error('Error fetching students:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [token, search, selectedClass]);

  const handleOpenAddModal = () => {
    setFormName('');
    setFormEmail('');
    setFormGrade('Kelas X');
    setFormClass(selectedClass || 'X-MIPA 1');
    setFormPassword('password123');
    setIsAddModalOpen(true);
  };

  const handleSaveNewStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      showToast('error', 'Nama dan email siswa wajib diisi.');
      return;
    }

    setSavingStudent(true);
    try {
      const res = await fetch('/api/teacher/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': token || '',
        },
        body: JSON.stringify({
          name: formName.trim(),
          email: formEmail.trim(),
          role: 'student',
          password: formPassword || 'password123',
          grade: formGrade,
          class_name: formClass.trim() || 'X-MIPA 1',
        }),
      });

      const resData = await res.json();
      if (res.ok) {
        showToast('success', resData.message || 'Siswa baru berhasil ditambahkan.');
        setIsAddModalOpen(false);
        fetchStudents();
      } else {
        showToast('error', resData.error || 'Gagal menambahkan siswa.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSavingStudent(false);
    }
  };

  const handleOpenEditModal = (std: any) => {
    setEditingUserId(std.user_id);
    setEditName(std.full_name);
    setEditEmail(std.email || '');
    setEditGrade(std.grade || 'Kelas X');
    setEditClass(std.class_name || 'X-MIPA 1');
    setIsEditModalOpen(true);
  };

  const handleSaveEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId || !editName.trim() || !editEmail.trim()) {
      showToast('error', 'Nama dan email siswa wajib diisi.');
      return;
    }

    setSavingEdit(true);
    try {
      const res = await fetch(`/api/teacher/users/${editingUserId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': token || '',
        },
        body: JSON.stringify({
          name: editName.trim(),
          email: editEmail.trim(),
          role: 'student',
          grade: editGrade,
          class_name: editClass.trim(),
        }),
      });

      const resData = await res.json();
      if (res.ok) {
        showToast('success', resData.message || 'Data siswa berhasil diperbarui.');
        setIsEditModalOpen(false);
        fetchStudents();
      } else {
        showToast('error', resData.error || 'Gagal menyimpan perubahan.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Terjadi kesalahan saat menyimpan.');
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[350px]">
        <Loader2 size={32} className="animate-spin text-emerald-700 mb-2" />
      </div>
    );
  }

  const students = data?.students || [];
  const classes = data?.classes || [];
  const competencies = data?.competencies || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users size={24} className="text-emerald-700" />
            Daftar & Matriks Perkembangan Siswa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau status capaian per kompetensi, tambah peserta didik baru, dan perbarui data murid.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-900/15 transition cursor-pointer"
          >
            <UserPlus size={16} />
            <span>Tambah Siswa / Peserta Baru</span>
          </button>

          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('teacher-roles')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer"
            >
              <UserCog size={16} className="text-purple-600" />
              <span>Manajemen Pengguna</span>
            </button>
          )}
        </div>
      </div>

      {/* Toast alert */}
      {toast && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs sm:text-sm animate-in fade-in ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau email siswa..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={15} className="text-slate-400 shrink-0" />
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-emerald-500 bg-white"
          >
            <option value="">Semua Kelas ({classes.length})</option>
            {classes.map((cls: string) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
              <tr>
                <th className="py-4 px-5">Nama Siswa</th>
                <th className="py-4 px-3">Kelas</th>
                {competencies.map((comp: any) => (
                  <th key={comp.id} className="py-4 px-3 text-center">
                    <span className="font-mono">{comp.code}</span>
                  </th>
                ))}
                <th className="py-4 px-4 text-center">Tuntas</th>
                <th className="py-4 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={competencies.length + 4} className="py-8 text-center text-slate-400 text-xs">
                    Tidak ditemukan data siswa yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                students.map((std: any) => (
                  <tr key={std.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-900">{std.full_name}</div>
                      <div className="text-xs text-slate-400">{std.email}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {std.class_name}
                      </span>
                    </td>
                    {competencies.map((comp: any) => {
                      const st = std.progress[comp.id] || 'NOT_STARTED';
                      return (
                        <td key={comp.id} className="py-3.5 px-3 text-center">
                          <StatusBadge status={st} size="sm" showIcon={false} />
                        </td>
                      );
                    })}
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800 text-xs">
                      {std.stats.achieved} / {std.stats.total}
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditModal(std)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-semibold transition cursor-pointer border border-slate-200"
                        title="Edit data siswa"
                      >
                        <Edit2 size={13} />
                        <span className="hidden md:inline">Edit</span>
                      </button>

                      <button
                        onClick={() => onSelectStudentDetail(std.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs transition cursor-pointer border border-emerald-200/50"
                      >
                        <Eye size={13} />
                        <span>Rincian</span>
                      </button>

                      <button
                        onClick={() => onPreviewStudentJourney(std.user_id)}
                        title="Buka tampilan Journey siswa ini"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition cursor-pointer"
                      >
                        <ExternalLink size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Tambah Siswa Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] my-auto flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header - Pinned Top with Quick Cancel & Save */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 shrink-0 bg-white">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus size={18} className="text-emerald-700" />
                  <span>Tambah Siswa / Peserta Baru</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Isi data siswa lalu klik tombol Simpan (Save) atau Batal (Cancel).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition flex items-center gap-1"
                >
                  <X size={13} />
                  <span>Batal</span>
                </button>
                <button
                  type="submit"
                  form="add-student-form"
                  disabled={savingStudent}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 transition flex items-center gap-1.5"
                >
                  {savingStudent ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  <span>Simpan</span>
                </button>
              </div>
            </div>

            {/* Scrollable Form Body with Pinned Sticky Footer */}
            <form id="add-student-form" onSubmit={handleSaveNewStudent} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Nama Lengkap Siswa *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Contoh: Muhammad Rizki"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Alamat Email Siswa *
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="rizki@sekolah.id"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Tingkat
                    </label>
                    <select
                      value={formGrade}
                      onChange={(e) => setFormGrade(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:border-emerald-600"
                    >
                      <option value="Kelas X">Kelas X</option>
                      <option value="Kelas XI">Kelas XI</option>
                      <option value="Kelas XII">Kelas XII</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Rombel / Kelas *
                    </label>
                    <input
                      type="text"
                      value={formClass}
                      onChange={(e) => setFormClass(e.target.value)}
                      placeholder="X-MIPA 1"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Kata Sandi Awal
                  </label>
                  <input
                    type="text"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="password123"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-600 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Standar kata sandi: <code className="font-semibold">password123</code>
                  </span>
                </div>

                {/* In-Body Action Confirmation */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500">
                    Siswa baru akan langsung terdaftar di sistem.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={savingStudent}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Save size={14} />
                      <span>Simpan (Save)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ALWAYS PINNED FOOTER: Cancel and Save Buttons */}
              <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <X size={15} />
                  <span>Batal (Cancel)</span>
                </button>

                <button
                  type="submit"
                  disabled={savingStudent}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-bold text-xs sm:text-sm transition shadow-md shadow-emerald-900/15 cursor-pointer disabled:opacity-50"
                >
                  {savingStudent ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Simpan Siswa Baru (Save)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Data Siswa */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] my-auto flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header - Pinned Top */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 shrink-0 bg-white">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Edit2 size={18} className="text-emerald-700" />
                  <span>Edit Data Siswa</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ubah data siswa lalu tekan tombol Simpan (Save) atau Batal (Cancel).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition flex items-center gap-1"
                >
                  <X size={13} />
                  <span>Batal</span>
                </button>
                <button
                  type="submit"
                  form="edit-student-form"
                  disabled={savingEdit}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 transition flex items-center gap-1.5"
                >
                  {savingEdit ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  <span>Simpan</span>
                </button>
              </div>
            </div>

            {/* Scrollable Form Body with Pinned Sticky Footer */}
            <form id="edit-student-form" onSubmit={handleSaveEditStudent} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Nama Lengkap Siswa *
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Alamat Email Siswa *
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Tingkat
                    </label>
                    <select
                      value={editGrade}
                      onChange={(e) => setEditGrade(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:border-emerald-600"
                    >
                      <option value="Kelas X">Kelas X</option>
                      <option value="Kelas XI">Kelas XI</option>
                      <option value="Kelas XII">Kelas XII</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Rombel / Kelas
                    </label>
                    <input
                      type="text"
                      value={editClass}
                      onChange={(e) => setEditClass(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-600"
                      required
                    />
                  </div>
                </div>

                {/* In-Body Action Confirmation */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500">
                    Perubahan data langsung diperbarui di database.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={savingEdit}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Save size={14} />
                      <span>Simpan (Save)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ALWAYS PINNED FOOTER: Cancel and Save Buttons */}
              <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <X size={15} />
                  <span>Batal (Cancel)</span>
                </button>

                <button
                  type="submit"
                  disabled={savingEdit}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-bold text-xs sm:text-sm transition shadow-md shadow-emerald-900/15 cursor-pointer disabled:opacity-50"
                >
                  {savingEdit ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Simpan Perubahan (Save)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
