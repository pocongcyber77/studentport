import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LatexRenderer } from '../common/LatexRenderer';
import { EquationToolbar } from './EquationToolbar';
import { QuestionImageUploader } from './QuestionImageUploader';
import {
  FileQuestion,
  Plus,
  Filter,
  Edit2,
  Archive,
  Eye,
  Check,
  X,
  AlertCircle,
  Sparkles,
  Loader2,
  Image as ImageIcon,
  Maximize2,
  Code2,
  HelpCircle,
} from 'lucide-react';

type TargetField = 'text' | 'optA' | 'optB' | 'optC' | 'optD' | 'explanation';

export const QuestionBankView: React.FC = () => {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedComp, setSelectedComp] = useState<string>('');
  const [showArchived, setShowArchived] = useState<boolean>(false);

  // Question Modal state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formCompetencyId, setFormCompetencyId] = useState('');
  const [formText, setFormText] = useState('');
  const [formOptA, setFormOptA] = useState('');
  const [formOptB, setFormOptB] = useState('');
  const [formOptC, setFormOptC] = useState('');
  const [formOptD, setFormOptD] = useState('');
  const [formCorrect, setFormCorrect] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [formExplanation, setFormExplanation] = useState('');
  const [formImageUrl, setFormImageUrl] = useState<string | undefined>(undefined);
  const [formImageCaption, setFormImageCaption] = useState<string | undefined>(undefined);
  const [formOrder, setFormOrder] = useState<number>(1);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active focused field for equation insertion
  const [activeTarget, setActiveTarget] = useState<TargetField>('text');
  const [modalTab, setModalTab] = useState<'editor' | 'preview'>('editor');

  // Student Preview Modal state
  const [previewQuestion, setPreviewQuestion] = useState<any>(null);

  // Zoom lightbox modal for list view images
  const [zoomImageUrl, setZoomImageUrl] = useState<{ url: string; caption?: string } | null>(null);

  // Input refs for precise insertion
  const textareaTextRef = useRef<HTMLTextAreaElement | null>(null);
  const inputOptARef = useRef<HTMLInputElement | null>(null);
  const inputOptBRef = useRef<HTMLInputElement | null>(null);
  const inputOptCRef = useRef<HTMLInputElement | null>(null);
  const inputOptDRef = useRef<HTMLInputElement | null>(null);
  const textareaExplRef = useRef<HTMLTextAreaElement | null>(null);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (selectedComp) query.set('competency_id', selectedComp);
      if (showArchived) query.set('include_archived', 'true');

      const res = await fetch(`/api/teacher/questions?${query.toString()}`, {
        headers: { 'x-user-id': token || '' },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error('Error fetching questions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [token, selectedComp, showArchived]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormCompetencyId(data?.competencies?.[0]?.id || '');
    setFormText('');
    setFormOptA('');
    setFormOptB('');
    setFormOptC('');
    setFormOptD('');
    setFormCorrect('A');
    setFormExplanation('');
    setFormImageUrl(undefined);
    setFormImageCaption(undefined);
    setFormOrder((data?.questions?.length || 0) + 1);
    setActiveTarget('text');
    setModalTab('editor');
    setErrorMsg(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (q: any) => {
    setEditingId(q.id);
    setFormCompetencyId(q.competency_id);
    setFormText(q.question_text);
    setFormOptA(q.option_a);
    setFormOptB(q.option_b);
    setFormOptC(q.option_c);
    setFormOptD(q.option_d);
    setFormCorrect(q.correct_answer);
    setFormExplanation(q.explanation || '');
    setFormImageUrl(q.image_url || undefined);
    setFormImageCaption(q.image_caption || undefined);
    setFormOrder(q.question_order || 1);
    setActiveTarget('text');
    setModalTab('editor');
    setErrorMsg(null);
    setIsEditorOpen(true);
  };

  // Helper to insert equation snippet into the active target
  const handleInsertEquation = (snippet: string) => {
    if (activeTarget === 'text') {
      const el = textareaTextRef.current;
      if (el) {
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const newText = formText.substring(0, start) + snippet + formText.substring(end);
        setFormText(newText);
        setTimeout(() => {
          el.focus();
          el.setSelectionRange(start + snippet.length, start + snippet.length);
        }, 10);
      } else {
        setFormText((prev) => prev + snippet);
      }
    } else if (activeTarget === 'optA') {
      setFormOptA((prev) => prev + snippet);
    } else if (activeTarget === 'optB') {
      setFormOptB((prev) => prev + snippet);
    } else if (activeTarget === 'optC') {
      setFormOptC((prev) => prev + snippet);
    } else if (activeTarget === 'optD') {
      setFormOptD((prev) => prev + snippet);
    } else if (activeTarget === 'explanation') {
      const el = textareaExplRef.current;
      if (el) {
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const newText = formExplanation.substring(0, start) + snippet + formExplanation.substring(end);
        setFormExplanation(newText);
        setTimeout(() => {
          el.focus();
          el.setSelectionRange(start + snippet.length, start + snippet.length);
        }, 10);
      } else {
        setFormExplanation((prev) => prev + snippet);
      }
    }
  };

  const getTargetName = (target: TargetField): string => {
    switch (target) {
      case 'text':
        return 'Teks Soal';
      case 'optA':
        return 'Pilihan A';
      case 'optB':
        return 'Pilihan B';
      case 'optC':
        return 'Pilihan C';
      case 'optD':
        return 'Pilihan D';
      case 'explanation':
        return 'Penjelasan Miskonsepsi';
      default:
        return 'Teks Soal';
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCompetencyId || !formText || !formOptA || !formOptB || !formOptC || !formOptD) {
      setErrorMsg('Semua kolom teks soal dan pilihan A, B, C, D wajib diisi.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    const payload = {
      competency_id: formCompetencyId,
      question_text: formText,
      option_a: formOptA,
      option_b: formOptB,
      option_c: formOptC,
      option_d: formOptD,
      correct_answer: formCorrect,
      explanation: formExplanation,
      image_url: formImageUrl || undefined,
      image_caption: formImageCaption || undefined,
      question_order: formOrder,
    };

    try {
      const url = editingId ? `/api/teacher/questions/${editingId}` : '/api/teacher/questions';
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
        throw new Error(err.error || 'Gagal menyimpan soal.');
      }

      setIsEditorOpen(false);
      fetchQuestions();
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan.');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (id: string) => {
    if (
      !confirm(
        'Arsipkan soal ini? Soal tidak akan dimunculkan pada asesmen baru siswa, namun riwayat pengerjaan sebelumnya tetap aman.'
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/teacher/questions/${id}/archive`, {
        method: 'POST',
        headers: { 'x-user-id': token || '' },
      });
      if (res.ok) {
        fetchQuestions();
      }
    } catch (e) {
      console.error('Error archiving:', e);
    }
  };

  const questions = data?.questions || [];
  const competencies = data?.competencies || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileQuestion size={24} className="text-emerald-700" />
            Bank Soal Asesmen Formatif
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola butir soal formatif dilengkapi dukungan formula matematika LaTeX/KaTeX dan lampiran gambar ilustrasi.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-900/15 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Tambah Soal Baru</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-400" />
          <select
            value={selectedComp}
            onChange={(e) => setSelectedComp(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white"
          >
            <option value="">Semua Pos Kompetensi ({competencies.length})</option>
            {competencies.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span>Tampilkan Soal Diarsipkan</span>
        </label>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-emerald-700" />
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
          Belum ada butir soal dalam kategori ini.
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q: any) => (
            <div
              key={q.id}
              className={`rounded-2xl border p-5 bg-white shadow-xs transition-all ${
                !q.active
                  ? 'opacity-60 border-dashed bg-slate-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      {q.competency_code}
                    </span>
                    <span className="text-xs text-slate-400">Urutan #{q.question_order}</span>
                    {q.image_url && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <ImageIcon size={11} />
                        Ada Gambar
                      </span>
                    )}
                    {!q.active && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-200 text-slate-600 font-semibold">
                        Diarsipkan (Soft Deleted)
                      </span>
                    )}
                  </div>

                  {/* Question Text with LaTeX rendering */}
                  <div className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
                    <LatexRenderer text={q.question_text} />
                  </div>

                  {/* Question Image (if attached) */}
                  {q.image_url && (
                    <div className="pt-1">
                      <div className="inline-block relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-1.5 max-w-sm">
                        <img
                          src={q.image_url}
                          alt={q.image_caption || 'Ilustrasi Soal'}
                          className="max-h-40 w-auto rounded-lg object-contain cursor-pointer"
                          onClick={() =>
                            setZoomImageUrl({ url: q.image_url, caption: q.image_caption })
                          }
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setZoomImageUrl({ url: q.image_url, caption: q.image_caption })
                          }
                          className="absolute inset-1.5 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white gap-1 text-xs font-semibold rounded-lg transition cursor-pointer backdrop-blur-[1px]"
                        >
                          <Maximize2 size={14} />
                          <span>Perbesar Gambar</span>
                        </button>
                      </div>
                      {q.image_caption && (
                        <p className="text-xs text-slate-500 italic mt-1 font-serif">
                          {q.image_caption}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Options row preview with LaTeX rendering */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                    {(['a', 'b', 'c', 'd'] as const).map((opt) => {
                      const letter = opt.toUpperCase();
                      const isCorrect = q.correct_answer === letter;
                      return (
                        <div
                          key={opt}
                          className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-md font-bold text-[11px] flex items-center justify-center shrink-0 ${
                              isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="truncate">
                            <LatexRenderer text={q[`option_${opt}`]} />
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="text-xs text-slate-600 pt-1 flex items-start gap-1.5 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/60">
                      <Sparkles size={13} className="text-amber-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <strong className="text-slate-800">Miskonsepsi: </strong>
                        <LatexRenderer text={q.explanation} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col items-center sm:items-end gap-1.5 shrink-0 pt-2 sm:pt-0">
                  <button
                    onClick={() => setPreviewQuestion(q)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    <Eye size={13} />
                    <span>Preview Siswa</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(q)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold cursor-pointer"
                  >
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>

                  {q.active && (
                    <button
                      onClick={() => handleArchive(q.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 text-xs font-semibold cursor-pointer"
                    >
                      <Archive size={13} />
                      <span>Arsipkan</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Question Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-5 sm:p-7 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileQuestion size={20} className="text-emerald-700" />
                  <span>{editingId ? 'Edit Butir Soal Asesmen' : 'Tambah Butir Soal Baru'}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gunakan LaTeX untuk formula matematika (contoh: <code className="font-mono text-emerald-800">$2x + y \le 6$</code>) dan tambahkan gambar pendukung.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Tab switch between Editor & Live Preview */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setModalTab('editor')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                      modalTab === 'editor'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Editor Form
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalTab('preview')}
                    className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition cursor-pointer ${
                      modalTab === 'preview'
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Eye size={13} />
                    <span>Pratinjau Live</span>
                  </button>
                </div>

                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* TAB 1: Editor */}
            {modalTab === 'editor' && (
              <form onSubmit={handleSaveQuestion} className="space-y-5 text-xs sm:text-sm">
                {/* Pos & Urutan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Pos Kompetensi Sasaran *
                    </label>
                    <select
                      value={formCompetencyId}
                      onChange={(e) => setFormCompetencyId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:border-emerald-600"
                      required
                    >
                      {competencies.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.code} - {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Urutan Soal
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formOrder}
                      onChange={(e) => setFormOrder(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                {/* Equation & LaTeX Toolbar */}
                <EquationToolbar
                  onInsert={handleInsertEquation}
                  targetFieldName={getTargetName(activeTarget)}
                />

                {/* Target Field Quick Selector */}
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 border border-slate-200/80 p-2 rounded-xl text-xs">
                  <span className="font-semibold text-slate-600 mr-1">Target Sisipan Rumus:</span>
                  {(
                    [
                      { id: 'text', label: 'Teks Soal' },
                      { id: 'optA', label: 'Pilihan A' },
                      { id: 'optB', label: 'Pilihan B' },
                      { id: 'optC', label: 'Pilihan C' },
                      { id: 'optD', label: 'Pilihan D' },
                      { id: 'explanation', label: 'Penjelasan' },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTarget(t.id)}
                      className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer text-[11px] ${
                        activeTarget === t.id
                          ? 'bg-emerald-700 text-white font-bold shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Question Text */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">
                      Teks Pertanyaan / Soal *
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Gunakan $...$ untuk rumus inline atau $$...$$ untuk display
                    </span>
                  </div>
                  <textarea
                    ref={textareaTextRef}
                    rows={3}
                    value={formText}
                    onFocus={() => setActiveTarget('text')}
                    onChange={(e) => setFormText(e.target.value)}
                    placeholder="Contoh: Tentukan daerah himpunan penyelesaian dari sistem pertidaksamaan $2x + 3y \le 12$, $x \ge 0$, dan $y \ge 0$..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-600"
                    required
                  />

                  {/* Real-time micro preview of question text */}
                  {formText.trim() && (
                    <div className="mt-1.5 p-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 block mb-0.5">
                        Pratinjau Teks Soal:
                      </span>
                      <LatexRenderer text={formText} />
                    </div>
                  )}
                </div>

                {/* Image Uploader & Box */}
                <QuestionImageUploader
                  imageUrl={formImageUrl}
                  imageCaption={formImageCaption}
                  onImageChange={(url, cap) => {
                    setFormImageUrl(url);
                    setFormImageCaption(cap);
                  }}
                />

                {/* Options A, B, C, D */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-700">
                      Pilihan Jawaban & Kunci Konsep *
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Klik huruf lingkaran untuk menentukan kunci jawaban yang benar
                    </span>
                  </div>

                  {[
                    { letter: 'A', val: formOptA, set: setFormOptA, ref: inputOptARef, target: 'optA' as const },
                    { letter: 'B', val: formOptB, set: setFormOptB, ref: inputOptBRef, target: 'optB' as const },
                    { letter: 'C', val: formOptC, set: setFormOptC, ref: inputOptCRef, target: 'optC' as const },
                    { letter: 'D', val: formOptD, set: setFormOptD, ref: inputOptDRef, target: 'optD' as const },
                  ].map((item) => (
                    <div key={item.letter} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setFormCorrect(item.letter as any)}
                          className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 transition cursor-pointer border ${
                            formCorrect === item.letter
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                          }`}
                          title={formCorrect === item.letter ? 'Kunci Jawaban' : 'Klik untuk jadikan kunci'}
                        >
                          {item.letter}
                        </button>
                        <input
                          ref={item.ref}
                          type="text"
                          value={item.val}
                          onFocus={() => setActiveTarget(item.target)}
                          onChange={(e) => item.set(e.target.value)}
                          placeholder={`Pilihan ${item.letter} (bisa memuat LaTeX contoh: $(0, 4)$ atau $\\frac{3}{4}$)...`}
                          className={`flex-1 px-3 py-2 rounded-xl border text-xs sm:text-sm focus:outline-none ${
                            formCorrect === item.letter
                              ? 'border-emerald-300 bg-emerald-50/20'
                              : 'border-slate-200'
                          }`}
                          required
                        />
                        {formCorrect === item.letter && (
                          <span className="text-[11px] font-bold text-emerald-700 whitespace-nowrap hidden sm:inline">
                            Kunci Jawaban
                          </span>
                        )}
                      </div>

                      {/* Small inline preview if option has latex */}
                      {item.val.includes('$') && (
                        <div className="pl-10 text-[11px] text-slate-500">
                          <span className="text-slate-400 mr-1">Render:</span>
                          <LatexRenderer text={item.val} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Explanation */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">
                      Penjelasan Konsep & Telaah Miskonsepsi
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Tuliskan solusi langkah demi langkah dengan rumus LaTeX
                    </span>
                  </div>
                  <textarea
                    ref={textareaExplRef}
                    rows={2}
                    value={formExplanation}
                    onFocus={() => setActiveTarget('explanation')}
                    onChange={(e) => setFormExplanation(e.target.value)}
                    placeholder="Contoh: Garis batas $2x + 3y = 12$ memotong sumbu-X di $(6,0)$ dan sumbu-Y di $(0,4)$..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-600"
                  />
                  {formExplanation.trim() && (
                    <div className="mt-1.5 p-2 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs text-slate-700">
                      <span className="text-[10px] font-bold text-amber-800 block mb-0.5">
                        Pratinjau Penjelasan:
                      </span>
                      <LatexRenderer text={formExplanation} />
                    </div>
                  )}
                </div>

                {/* Submit Actions */}
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
                    {saving ? 'Menyimpan...' : 'Simpan Butir Soal'}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: Live Full Preview */}
            {modalTab === 'preview' && (
              <div className="space-y-5">
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl text-xs text-emerald-950 flex items-center gap-2">
                  <Sparkles size={16} className="text-emerald-700 shrink-0" />
                  <span>
                    Ini adalah simulasi visual bagaimana soal matematika Anda (beserta formula LaTeX dan gambar lampiran) akan terlihat oleh siswa saat mengerjakan asesmen.
                  </span>
                </div>

                <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-5">
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-100 pb-2">
                    <span className="font-bold text-emerald-800">
                      Soal Simulasi No. {formOrder}
                    </span>
                    <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                      Pilihan Ganda
                    </span>
                  </div>

                  {/* Rendered prompt */}
                  <div className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">
                    {formText ? (
                      <LatexRenderer text={formText} />
                    ) : (
                      <span className="text-slate-400 italic">Belum ada teks pertanyaan...</span>
                    )}
                  </div>

                  {/* Rendered image */}
                  {formImageUrl && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2 sm:p-3 text-center">
                      <img
                        src={formImageUrl}
                        alt={formImageCaption || 'Ilustrasi Soal'}
                        className="max-h-72 w-auto mx-auto rounded-xl object-contain"
                        referrerPolicy="no-referrer"
                      />
                      {formImageCaption && (
                        <p className="text-xs text-slate-600 italic mt-2 font-serif">
                          {formImageCaption}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Rendered options */}
                  <div className="space-y-2.5 pt-1">
                    {[
                      { l: 'A', text: formOptA },
                      { l: 'B', text: formOptB },
                      { l: 'C', text: formOptC },
                      { l: 'D', text: formOptD },
                    ].map((opt) => (
                      <div
                        key={opt.l}
                        className={`p-3.5 rounded-2xl border flex items-center gap-3 transition ${
                          formCorrect === opt.l
                            ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-500/20'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
                            formCorrect === opt.l
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {opt.l}
                        </span>
                        <div className="text-sm text-slate-800 flex-1">
                          {opt.text ? (
                            <LatexRenderer text={opt.text} />
                          ) : (
                            <span className="text-slate-300 italic">Pilihan {opt.l} kosong</span>
                          )}
                        </div>
                        {formCorrect === opt.l && (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Kunci Guru
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Rendered Explanation */}
                  {formExplanation && (
                    <div className="mt-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs sm:text-sm text-slate-800 space-y-1">
                      <div className="font-bold text-amber-900 flex items-center gap-1.5">
                        <Sparkles size={14} className="text-amber-600" />
                        <span>Pembahasan Guru & Ulasan Miskonsepsi:</span>
                      </div>
                      <div className="pt-1 text-slate-700 leading-relaxed">
                        <LatexRenderer text={formExplanation} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setModalTab('editor')}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
                  >
                    Kembali ke Form Editor
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveQuestion}
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {saving ? 'Menyimpan...' : 'Simpan Butir Soal Ini'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Student Preview Modal */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Pratinjau Tampilan Siswa
              </span>
              <button
                onClick={() => setPreviewQuestion(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-base font-semibold text-slate-900 leading-relaxed">
              <LatexRenderer text={previewQuestion.question_text} />
            </div>

            {/* Question Image (if attached) */}
            {previewQuestion.image_url && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center">
                <img
                  src={previewQuestion.image_url}
                  alt={previewQuestion.image_caption || 'Ilustrasi Soal'}
                  className="max-h-56 w-auto mx-auto rounded-xl object-contain cursor-pointer"
                  onClick={() =>
                    setZoomImageUrl({
                      url: previewQuestion.image_url,
                      caption: previewQuestion.image_caption,
                    })
                  }
                  referrerPolicy="no-referrer"
                />
                {previewQuestion.image_caption && (
                  <p className="text-xs text-slate-500 italic mt-1.5 font-serif">
                    {previewQuestion.image_caption}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2.5 pt-1">
              {(['a', 'b', 'c', 'd'] as const).map((opt) => (
                <div
                  key={opt}
                  className="p-3.5 rounded-2xl border border-slate-200 flex items-center gap-3 bg-white hover:bg-slate-50 transition cursor-pointer"
                >
                  <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
                    {opt.toUpperCase()}
                  </span>
                  <div className="text-sm text-slate-800">
                    <LatexRenderer text={previewQuestion[`option_${opt}`]} />
                  </div>
                </div>
              ))}
            </div>

            {/* Explanation box preview */}
            {previewQuestion.explanation && (
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-slate-700 space-y-1">
                <span className="font-bold text-amber-900 block">Kunci Penjelasan Konsep:</span>
                <LatexRenderer text={previewQuestion.explanation} />
              </div>
            )}

            <div className="text-center pt-2">
              <button
                onClick={() => setPreviewQuestion(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Zoom Image Modal */}
      {zoomImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs"
          onClick={() => setZoomImageUrl(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-900 text-xs sm:text-sm">
                {zoomImageUrl.caption || 'Detail Gambar Soal'}
              </span>
              <button
                type="button"
                onClick={() => setZoomImageUrl(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center justify-center p-2 bg-slate-50 rounded-2xl max-h-[70vh] overflow-auto">
              <img
                src={zoomImageUrl.url}
                alt={zoomImageUrl.caption || 'Gambar Soal'}
                className="max-h-[60vh] max-w-full object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setZoomImageUrl(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
