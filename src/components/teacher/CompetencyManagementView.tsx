import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Layers,
  Plus,
  Edit2,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Sliders,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react';

export const CompetencyManagementView: React.FC = () => {
  const { token } = useAuth();
  const [competencies, setCompetencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal editor
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formOrder, setFormOrder] = useState<number>(1);
  const [formPrereqId, setFormPrereqId] = useState<string>('');
  const [formThreshold, setFormThreshold] = useState<number>(80);
  const [formActive, setFormActive] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchCompetencies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/teacher/competencies', {
        headers: { 'x-user-id': token || '' },
      });
      if (res.ok) {
        const json = await res.json();
        setCompetencies(json.competencies || []);
      }
    } catch (e) {
      console.error('Error fetching competencies:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetencies();
  }, [token]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormCode(`PRG-${competencies.length + 1}`);
    setFormName('');
    setFormDescription('');
    setFormOrder(competencies.length + 1);
    setFormPrereqId(competencies.length > 0 ? competencies[competencies.length - 1].id : '');
    setFormThreshold(80);
    setFormActive(true);
    setErrorMsg(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (comp: any) => {
    setEditingId(comp.id);
    setFormCode(comp.code);
    setFormName(comp.name);
    setFormDescription(comp.description);
    setFormOrder(comp.sequence_order);
    setFormPrereqId(comp.prerequisite_id || '');
    setFormThreshold(Math.round(comp.mastery_threshold * 100));
    setFormActive(comp.active);
    setErrorMsg(null);
    setIsEditorOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formName) {
      setErrorMsg('Kode dan nama kompetensi wajib diisi.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    const payload = {
      code: formCode.trim().toUpperCase(),
      name: formName.trim(),
      description: formDescription.trim(),
      sequence_order: Number(formOrder) || 1,
      prerequisite_id: formPrereqId || null,
      mastery_threshold: Number(formThreshold) / 100,
      active: formActive,
    };

    try {
      const url = editingId ? `/api/teacher/competencies/${editingId}` : '/api/teacher/competencies';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': token || '',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menyimpan kompetensi.');
      }

      setIsEditorOpen(false);
      fetchCompetencies();
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers size={24} className="text-emerald-700" />
            Pengelolaan Pos Kompetensi & Alur Belajar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Atur urutan checkpoint linear, prasyarat penguasaan, dan ambang batas (mastery threshold).
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-900/15 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Tambah Pos Kompetensi</span>
        </button>
      </div>

      {/* Visual Sequence Preview of the Journey */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-md border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={14} /> Pratinjau Alur Pembelajaran Aktif
          </span>
          <span className="text-xs text-slate-400">
            {competencies.filter(c => c.active).length} Pos Pembelajaran
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-200 font-bold text-xs border border-emerald-500/30">
            START
          </span>
          {competencies
            .filter(c => c.active)
            .sort((a, b) => a.sequence_order - b.sequence_order)
            .map((c) => (
              <React.Fragment key={c.id}>
                <ArrowRight size={14} className="text-slate-500" />
                <div className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-medium border border-slate-700 flex items-center gap-2">
                  <span className="font-mono text-emerald-400 font-bold">{c.code}</span>
                  <span>{c.name}</span>
                  <span className="text-[10px] text-slate-400">
                    ({Math.round(c.mastery_threshold * 100)}%)
                  </span>
                </div>
              </React.Fragment>
            ))}
          <ArrowRight size={14} className="text-slate-500" />
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-200 font-bold text-xs border border-emerald-500/30">
            FINISH
          </span>
        </div>
      </div>

      {/* Competencies List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-emerald-700" />
        </div>
      ) : (
        <div className="space-y-4">
          {competencies.map((comp) => (
            <div
              key={comp.id}
              className={`rounded-2xl border p-5 sm:p-6 bg-white shadow-xs transition-all ${
                !comp.active ? 'opacity-60 bg-slate-50 border-dashed' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {comp.code}
                    </span>
                    <span className="text-xs text-slate-400">Pos #{comp.sequence_order}</span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                        comp.active
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {comp.active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {comp.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                    {comp.description}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span>
                      Ambang Penguasaan (Mastery):{' '}
                      <strong className="text-slate-900 font-bold">
                        {Math.round(comp.mastery_threshold * 100)}%
                      </strong>
                    </span>
                    <span>
                      Prasyarat:{' '}
                      <strong className="text-slate-900 font-bold">
                        {comp.prerequisite ? `${comp.prerequisite.code} (${comp.prerequisite.name})` : 'None (Materi Fondasi)'}
                      </strong>
                    </span>
                    <span>
                      Soal Aktif:{' '}
                      <strong className="text-slate-900 font-bold">
                        {comp.active_questions} Butir
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="shrink-0 pt-2 sm:pt-0">
                  <button
                    onClick={() => handleOpenEdit(comp)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
                  >
                    <Edit2 size={13} />
                    <span>Konfigurasi</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">
                {editingId ? 'Konfigurasi Pos Kompetensi' : 'Tambah Pos Kompetensi Baru'}
              </h2>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Kode Pos *
                  </label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="PRG-1"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 uppercase font-mono text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Nomor Urut Perjalanan
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formOrder}
                    onChange={(e) => setFormOrder(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nama Kompetensi *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Misal: Memahami SPLDV / Pertidaksamaan"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Deskripsi / Capaian Pembelajaran
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Jelaskan ruang lingkup dan capaian kompetensi ini..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Kompetensi Prasyarat (Prerequisite)
                </label>
                <select
                  value={formPrereqId}
                  onChange={(e) => setFormPrereqId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Tidak Ada (Bisa diakses dari awal)</option>
                  {competencies
                    .filter((c) => c.id !== editingId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    Ambang Batas Penguasaan (Mastery Threshold)
                  </label>
                  <span className="font-bold text-emerald-700">{formThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={formThreshold}
                  onChange={(e) => setFormThreshold(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Siswa wajib menjawab benar minimal {formThreshold}% untuk berstatus "Tercapai".
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeToggle"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="activeToggle" className="font-medium text-slate-700 cursor-pointer">
                  Aktifkan pos ini dalam Learning Journey siswa
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-bold shadow-sm shadow-emerald-900/15 cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
