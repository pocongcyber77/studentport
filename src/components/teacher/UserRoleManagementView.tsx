import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  UserCog,
  ShieldCheck,
  UserPlus,
  Users,
  GraduationCap,
  KeyRound,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Edit2,
  Save,
  Check,
} from 'lucide-react';

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  grade?: string;
  class_name?: string;
  created_at: string;
}

export const UserRoleManagementView: React.FC = () => {
  const { token, user: currentUser, refreshUser } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('');

  // Notification toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [formGrade, setFormGrade] = useState('Kelas X');
  const [formClass, setFormClass] = useState('X-MIPA 1');
  const [formPassword, setFormPassword] = useState('password123');
  const [savingUser, setSavingUser] = useState(false);

  // Edit User Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [editGrade, setEditGrade] = useState('Kelas X');
  const [editClass, setEditClass] = useState('X-MIPA 1');
  const [editPassword, setEditPassword] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/teacher/users-management', {
        headers: { 'x-user-id': token || '' },
      });
      if (res.ok) {
        const json = await res.json();
        setUsers(json.users || []);
      }
    } catch (e) {
      console.error('Error fetching users:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleRoleChange = async (userId: string, newRole: 'student' | 'teacher' | 'admin') => {
    try {
      const res = await fetch(`/api/teacher/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': token || '',
        },
        body: JSON.stringify({ new_role: newRole }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('success', data.message);
        fetchUsers();
        if (userId === currentUser?.id) {
          refreshUser();
        }
      } else {
        showToast('error', data.error || 'Gagal mengubah role.');
      }
    } catch (e: any) {
      showToast('error', e.message || 'Terjadi kesalahan sistem.');
    }
  };

  const handleOpenEditModal = (u: ManagedUser) => {
    setEditingUserId(u.id);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditRole(u.role);
    setEditGrade(u.grade || 'Kelas X');
    setEditClass(u.class_name && u.class_name !== '-' ? u.class_name : 'X-MIPA 1');
    setEditPassword('');
    setIsEditModalOpen(true);
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId || !editName.trim() || !editEmail.trim()) {
      showToast('error', 'Nama dan email tidak boleh kosong.');
      return;
    }

    setSavingEdit(true);
    try {
      const payload: Record<string, any> = {
        name: editName.trim(),
        email: editEmail.trim(),
        role: editRole,
        grade: editGrade,
        class_name: editRole === 'student' ? editClass.trim() : undefined,
      };
      if (editPassword.trim()) {
        payload.password = editPassword.trim();
      }

      const res = await fetch(`/api/teacher/users/${editingUserId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': token || '',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('success', data.message || 'Perubahan data berhasil disimpan.');
        setIsEditModalOpen(false);
        fetchUsers();
        if (editingUserId === currentUser?.id) {
          refreshUser();
        }
      } else {
        showToast('error', data.error || 'Gagal menyimpan perubahan.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Terjadi kesalahan saat menyimpan.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleResetPassword = async (userId: string, userName: string) => {
    if (!confirm(`Reset kata sandi untuk ${userName} menjadi 'password123'?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/teacher/users/${userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': token || '',
        },
        body: JSON.stringify({ new_password: 'password123' }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('success', data.message);
      } else {
        showToast('error', data.error || 'Gagal mereset kata sandi.');
      }
    } catch (e: any) {
      showToast('error', e.message || 'Terjadi kesalahan sistem.');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      showToast('error', 'Nama dan email wajib diisi.');
      return;
    }

    setSavingUser(true);
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
          role: formRole,
          password: formPassword || 'password123',
          grade: formRole === 'student' ? formGrade : undefined,
          class_name: formRole === 'student' ? formClass : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('success', data.message || 'Pengguna baru berhasil ditambahkan.');
        setIsAddModalOpen(false);
        setFormName('');
        setFormEmail('');
        fetchUsers();
      } else {
        showToast('error', data.error || 'Gagal membuat pengguna.');
      }
    } catch (e: any) {
      showToast('error', e.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSavingUser(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !selectedRoleFilter || u.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  const studentsCount = users.filter((u) => u.role === 'student').length;
  const teachersCount = users.filter((u) => u.role === 'teacher').length;
  const adminsCount = users.filter((u) => u.role === 'admin').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Title & Role Isolation Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCog size={24} className="text-purple-600" />
            Manajemen Pengguna & Pengaturan Hak Akses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Wewenang Guru dan Admin untuk menambah peserta didik atau guru baru, serta memperbarui dan menyimpan data akun.
          </p>
        </div>

        <button
          onClick={() => {
            setFormName('');
            setFormEmail('');
            setFormRole('student');
            setFormGrade('Kelas X');
            setFormClass('X-MIPA 1');
            setFormPassword('password123');
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/20 transition cursor-pointer self-start sm:self-auto"
        >
          <UserPlus size={16} />
          <span>Tambah Peserta / Guru Baru</span>
        </button>
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

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Users size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Total Akun</div>
            <div className="text-xl font-extrabold text-slate-900">{users.length} Orang</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <GraduationCap size={20} />
          </div>
          <div>
            <div className="text-xs text-blue-500 font-medium">Akun Siswa / Murid</div>
            <div className="text-xl font-extrabold text-blue-900">{studentsCount} Siswa</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-purple-100 p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="text-xs text-purple-500 font-medium">Guru Pendidik</div>
            <div className="text-xl font-extrabold text-purple-900">{teachersCount} Guru</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <UserCog size={20} />
          </div>
          <div>
            <div className="text-xs text-emerald-500 font-medium">Admin Kurikulum</div>
            <div className="text-xl font-extrabold text-emerald-900">{adminsCount} Admin</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau email pengguna..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-purple-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 bg-white focus:outline-none focus:border-purple-500"
          >
            <option value="">Semua Peran (Role)</option>
            <option value="student">Hanya Siswa</option>
            <option value="teacher">Hanya Guru</option>
            <option value="admin">Hanya Admin</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-purple-600 mb-2" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Tidak ada pengguna yang cocok dengan kriteria pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <tr>
                  <th className="py-3.5 px-5">Nama & Email</th>
                  <th className="py-3.5 px-4">Role Saat Ini</th>
                  <th className="py-3.5 px-4">Kelas / Satuan</th>
                  <th className="py-3.5 px-4">Hak Akses Cepat</th>
                  <th className="py-3.5 px-5 text-right">Aksi Pengguna</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const isCurrent = u.id === currentUser?.id;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                          <span>{u.name}</span>
                          {isCurrent && (
                            <span className="px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200">
                              Anda
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                            u.role === 'student'
                              ? 'bg-blue-100 text-blue-800'
                              : u.role === 'teacher'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {u.role === 'student' ? 'Siswa' : u.role === 'teacher' ? 'Guru' : 'Admin'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-600 font-medium">
                        {u.role === 'student' ? `${u.grade} - ${u.class_name}` : 'Tenaga Pendidik'}
                      </td>

                      {/* Fast Role selection dropdown with save feedback */}
                      <td className="py-3.5 px-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold bg-white focus:outline-none focus:border-purple-600 transition"
                        >
                          <option value="student">Siswa</option>
                          <option value="teacher">Guru</option>
                          <option value="admin">Admin Kurikulum</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-5 text-right space-x-1.5">
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 text-xs font-semibold transition cursor-pointer border border-slate-200 hover:border-purple-200"
                          title="Edit nama, email, kelas, atau role"
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleResetPassword(u.id, u.name)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
                          title="Reset kata sandi menjadi 'password123'"
                        >
                          <KeyRound size={13} />
                          <span className="hidden sm:inline">Reset Password</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal 1: Tambah Peserta Didik atau Guru Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] my-auto flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header - Pinned Top with Quick Cancel & Save */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 shrink-0 bg-white">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus size={18} className="text-purple-600" />
                  <span>Tambah Peserta / Guru Baru</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Isi data akun lalu tekan tombol Simpan (Save) atau Batal (Cancel).
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
                  form="add-user-form"
                  disabled={savingUser}
                  className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 transition flex items-center gap-1.5"
                >
                  {savingUser ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  <span>Simpan</span>
                </button>
              </div>
            </div>

            {/* Scrollable Form Body with Pinned Sticky Footer */}
            <form id="add-user-form" onSubmit={handleCreateUser} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
                {/* Role Selector Tabs */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5">
                    Peran Akun (Role) *
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setFormRole('student')}
                      className={`py-2 px-3 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        formRole === 'student'
                          ? 'bg-white text-blue-800 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <GraduationCap size={14} />
                      <span>Murid/Siswa</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormRole('teacher')}
                      className={`py-2 px-3 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        formRole === 'teacher'
                          ? 'bg-white text-purple-800 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <ShieldCheck size={14} />
                      <span>Guru</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormRole('admin')}
                      className={`py-2 px-3 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        formRole === 'admin'
                          ? 'bg-white text-emerald-800 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <UserCog size={14} />
                      <span>Admin</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder={formRole === 'student' ? 'Contoh: Budi Pratama' : 'Contoh: Ibu Rina Wati, M.Pd.'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-purple-600"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Alamat Email *
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder={formRole === 'student' ? 'budi@sekolah.id' : 'rina.guru@sekolah.id'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-purple-600"
                    required
                  />
                </div>

                {formRole === 'student' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Tingkat Kelas
                      </label>
                      <select
                        value={formGrade}
                        onChange={(e) => setFormGrade(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:border-purple-600"
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
                        value={formClass}
                        onChange={(e) => setFormClass(e.target.value)}
                        placeholder="X-MIPA 1"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Kata Sandi Awal
                  </label>
                  <input
                    type="text"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="password123"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-purple-600 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Standar kata sandi akun baru: <code className="font-semibold">password123</code>
                  </span>
                </div>

                {/* In-Body Action Confirmation */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500">
                    Perubahan langsung disimpan ke basis data pengguna.
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
                      disabled={savingUser}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
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
                  disabled={savingUser}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm transition shadow-md shadow-purple-900/20 cursor-pointer disabled:opacity-50"
                >
                  {savingUser ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Simpan Akun Baru (Save)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Murid / Guru (Simpan Perubahan) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] my-auto flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header - Pinned Top */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 shrink-0 bg-white">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Edit2 size={18} className="text-purple-600" />
                  <span>Edit Data Pengguna</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ubah data akun lalu klik Simpan (Save) atau Batal (Cancel).
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
                  form="edit-user-form"
                  disabled={savingEdit}
                  className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 transition flex items-center gap-1.5"
                >
                  {savingEdit ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  <span>Simpan</span>
                </button>
              </div>
            </div>

            {/* Scrollable Form Body with Pinned Sticky Footer */}
            <form id="edit-user-form" onSubmit={handleSaveEditUser} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-purple-600"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Alamat Email *
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-purple-600"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Peran (Role) *
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:border-purple-600"
                  >
                    <option value="student">Siswa / Murid</option>
                    <option value="teacher">Guru</option>
                    <option value="admin">Admin Kurikulum</option>
                  </select>
                </div>

                {editRole === 'student' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Tingkat
                      </label>
                      <select
                        value={editGrade}
                        onChange={(e) => setEditGrade(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:border-purple-600"
                      >
                        <option value="Kelas X">Kelas X</option>
                        <option value="Kelas XI">Kelas XI</option>
                        <option value="Kelas XII">Kelas XII</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Kelas
                      </label>
                      <input
                        type="text"
                        value={editClass}
                        onChange={(e) => setEditClass(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Ubah Kata Sandi (Kosongkan bila tidak diubah)
                  </label>
                  <input
                    type="text"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Ketik kata sandi baru..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-purple-600 font-mono"
                  />
                </div>

                {/* In-Body Action Confirmation */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500">
                    Perubahan langsung disimpan ke basis data pengguna.
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
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
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
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm transition shadow-md shadow-purple-900/20 cursor-pointer disabled:opacity-50"
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
