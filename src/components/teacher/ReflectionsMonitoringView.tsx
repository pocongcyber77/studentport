import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StudentReflection } from '../../types';
import {
  Brain,
  Search,
  Filter,
  Users,
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Star,
  MessageSquareQuote,
  Send,
  Loader2,
  ExternalLink,
  ChevronRight,
  Heart,
  TrendingUp,
  Bookmark,
  Edit3,
  Check,
  X,
} from 'lucide-react';

interface ReflectionsMonitoringViewProps {
  onPreviewStudentJourney?: (studentUserId: string) => void;
}

interface StatsSummary {
  total_reflections: number;
  unique_students_count: number;
  average_readiness: number;
  feeling_distribution: Record<string, number>;
  top_actions: Record<string, number>;
}

export const ReflectionsMonitoringView: React.FC<ReflectionsMonitoringViewProps> = ({
  onPreviewStudentJourney,
}) => {
  const { token, user: currentUser } = useAuth();
  const [reflections, setReflections] = useState<StudentReflection[]>([]);
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [classesList, setClassesList] = useState<string[]>([]);
  const [competenciesList, setCompetenciesList] = useState<Array<{ id: string; code: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedCompetency, setSelectedCompetency] = useState('');
  const [selectedFeeling, setSelectedFeeling] = useState('');

  // Teacher feedback note modal / inline editing state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchReflections = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set('search', search);
      if (selectedClass) query.set('class_filter', selectedClass);
      if (selectedCompetency) query.set('competency_id', selectedCompetency);
      if (selectedFeeling) query.set('feeling_filter', selectedFeeling);

      const res = await fetch(`/api/teacher/reflections?${query.toString()}`, {
        headers: { 'x-user-id': token || '' },
      });

      if (res.ok) {
        const json = await res.json();
        setReflections(json.reflections || []);
        setStats(json.stats || null);
        setClassesList(json.classes || []);
        setCompetenciesList(json.competencies || []);
      }
    } catch (err) {
      console.error('Error fetching reflections for teacher:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReflections();
  }, [token, search, selectedClass, selectedCompetency, selectedFeeling]);

  const handleSaveTeacherNote = async (reflectionId: string) => {
    if (!noteInput.trim()) return;
    setSavingNote(true);
    try {
      const res = await fetch(`/api/teacher/reflections/${reflectionId}/note`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': token || '',
        },
        body: JSON.stringify({ note: noteInput.trim() }),
      });

      if (res.ok) {
        showToast('Catatan apresiasi guru berhasil disimpan untuk murid ini!');
        setEditingNoteId(null);
        setNoteInput('');
        fetchReflections();
      } else {
        const err = await res.json();
        showToast(err.error || 'Gagal menyimpan catatan.');
      }
    } catch (e: any) {
      showToast(e.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSavingNote(false);
    }
  };

  const startEditNote = (refl: StudentReflection) => {
    setEditingNoteId(refl.id);
    setNoteInput(refl.teacher_note || '');
  };

  const cancelEditNote = () => {
    setEditingNoteId(null);
    setNoteInput('');
  };

  const getFeelingBadge = (feelingText: string) => {
    const text = feelingText.toLowerCase();
    if (text.includes('tidak berbakat') || text.includes('bakat')) {
      return {
        icon: '😟',
        label: 'Fixed Mindset / Ragu Bakat',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
        bgCard: 'bg-rose-50/20 border-rose-200',
      };
    }
    if (text.includes('cemas') || text.includes('ragu')) {
      return {
        icon: '🤔',
        label: 'Cemas & Ragu Terhadap Rumus',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
        bgCard: 'bg-amber-50/20 border-amber-200',
      };
    }
    if (text.includes('otak') || text.includes('bertumbuh') || text.includes('proses')) {
      return {
        icon: '🌱',
        label: 'Otak Bertumbuh (Growth Mindset)',
        badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
        bgCard: 'bg-teal-50/20 border-teal-200',
      };
    }
    return {
      icon: '🚀',
      label: 'Yakin & Siap Berlatih Terarah',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      bgCard: 'bg-emerald-50/20 border-emerald-200',
    };
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1b4332] via-[#2d6a4f] to-[#1e4634] p-6 sm:p-8 text-white shadow-xl border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-lime-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/25 text-emerald-200 text-xs font-medium border border-emerald-400/35">
            <Brain size={14} />
            <span>Pantauan Metakognisi & Pertumbuhan Siswa</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Ruang Refleksi & Suara Hati Siswa
          </h1>
          <p className="text-emerald-100/90 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Dengarkan kejujuran perasaan murid saat menghadapi materi sulit, pelajari miskonsepsi yang mereka rasakan, pantau rencana aksi perbaikan mandirinya, dan berikan umpan balik yang menguatkan.
          </p>
        </div>

        <div className="relative z-10 shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center w-full md:w-56">
          <div className="text-[11px] text-emerald-200 uppercase font-semibold tracking-wider">
            Total Refleksi
          </div>
          <div className="text-3xl font-extrabold text-white mt-1">
            {stats?.total_reflections || 0}
          </div>
          <div className="text-xs text-emerald-200/90 mt-1">
            dari {stats?.unique_students_count || 0} murid aktif
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Metric Cards Summary */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold shrink-0">
              <Users size={22} />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Siswa Terlibat</div>
              <div className="text-xl font-extrabold text-slate-900">
                {stats.unique_students_count} Siswa
              </div>
              <div className="text-[11px] text-purple-700 font-medium mt-0.5">
                Memiliki refleksi tercatat
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold shrink-0">
              <Star size={22} className="fill-amber-400 text-amber-500" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Rata-rata Kesiapan Tes Ulang</div>
              <div className="text-xl font-extrabold text-slate-900 flex items-baseline gap-1.5">
                <span>{stats.average_readiness}</span>
                <span className="text-xs font-normal text-slate-400">/ 5 Skala Kesiapan</span>
              </div>
              <div className="text-[11px] text-amber-700 font-medium mt-0.5">
                Tingkat keyakinan mencoba lagi
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold shrink-0">
              <TrendingUp size={22} />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Aksi Perbaikan Paling Populer</div>
              <div className="text-sm font-bold text-slate-900 truncate max-w-[220px]">
                {Object.entries(stats.top_actions).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Kaji Ulang Materi'}
              </div>
              <div className="text-[11px] text-teal-700 font-medium mt-0.5">
                Komitmen belajar terbanyak
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama murid, kendala materi, atau kata kunci..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-600 transition"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-emerald-600"
          >
            <option value="">Semua Rombel/Kelas</option>
            {classesList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Competency Filter */}
          <select
            value={selectedCompetency}
            onChange={(e) => setSelectedCompetency(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-emerald-600 max-w-[200px] truncate"
          >
            <option value="">Semua Pos Kompetensi</option>
            {competenciesList.map((comp) => (
              <option key={comp.id} value={comp.id}>
                {comp.code} - {comp.name}
              </option>
            ))}
          </select>

          {/* Mindset Feeling Filter */}
          <select
            value={selectedFeeling}
            onChange={(e) => setSelectedFeeling(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-emerald-600"
          >
            <option value="">Semua Ragam Emosi</option>
            <option value="tidak berbakat">Fixed Mindset ("Tidak Berbakat")</option>
            <option value="cemas">Cemas & Ragu Rumus</option>
            <option value="bingung">Otak Sedang Bertumbuh</option>
            <option value="yakin">Yakin & Optimis</option>
          </select>

          {(search || selectedClass || selectedCompetency || selectedFeeling) && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedClass('');
                setSelectedCompetency('');
                setSelectedFeeling('');
              }}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer transition border border-rose-200"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Reflections List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 size={32} className="animate-spin text-emerald-600 mb-2" />
            <span className="text-xs sm:text-sm text-slate-500 font-medium">
              Memuat data refleksi murid...
            </span>
          </div>
        ) : reflections.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
            <Brain size={44} className="mx-auto text-slate-300 mb-3" />
            <div className="font-bold text-slate-800 text-sm sm:text-base">
              Belum ada refleksi yang cocok
            </div>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Tidak ditemukan data refleksi yang sesuai dengan pencarian atau filter yang dipilih.
            </p>
          </div>
        ) : (
          reflections.map((refl) => {
            const badge = getFeelingBadge(refl.mindset_feeling);
            const isEditing = editingNoteId === refl.id;

            return (
              <div
                key={refl.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden p-5 sm:p-6 space-y-4"
              >
                {/* Header: Student Profile & Competency Tag */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2d6a4f] via-[#40916c] to-[#74c69d] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      {refl.student_name ? refl.student_name.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                        <span>{refl.student_name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          {refl.student_class}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        {refl.student_email}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:self-center">
                    {/* Competency Pill */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
                      <Layers size={13} className="text-emerald-600" />
                      <span>{refl.competency_code ? `[${refl.competency_code}]` : ''} {refl.competency_name}</span>
                    </div>

                    {/* Date */}
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock size={12} />
                      <span>
                        {new Date(refl.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Shortcut to inspect student journey */}
                    {onPreviewStudentJourney && refl.student_user_id && (
                      <button
                        type="button"
                        onClick={() => onPreviewStudentJourney(refl.student_user_id!)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-700 hover:bg-emerald-50 border border-emerald-200 transition cursor-pointer"
                        title="Buka peta perjalanan belajar murid ini"
                      >
                        <ExternalLink size={12} />
                        <span className="hidden sm:inline">Peta Journey</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Section 1: Mindset Emotion Banner */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl shrink-0">{badge.icon}</span>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Kondisi Emosi & Keyakinan Belajar:
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                        "{refl.mindset_feeling}"
                      </div>
                    </div>
                  </div>

                  {/* Readiness stars */}
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500">
                      Kesiapan Tes Ulang:
                    </span>
                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <Star
                          key={lvl}
                          size={14}
                          className={lvl <= refl.readiness_level ? 'fill-amber-400 text-amber-500' : 'text-slate-200'}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-800 ml-1">
                      {refl.readiness_level}/5
                    </span>
                  </div>
                </div>

                {/* Section 2: Challenge / Misconception */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <AlertCircle size={14} className="text-amber-600" />
                    <span>Hambatan & Kendala Konsep yang Dihadapi Murid:</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-200/70 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                    {refl.challenge_description ? (
                      <p>"{refl.challenge_description}"</p>
                    ) : (
                      <p className="italic text-slate-400">Murid tidak menuliskan penjelasan kendala spesifik.</p>
                    )}
                  </div>
                </div>

                {/* Section 3: Action Plan Checklist */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>Rencana Aksi Nyata yang Dipilih Murid untuk Memperbaiki Diri:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {refl.action_plan.map((act, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium"
                      >
                        <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </div>
                    ))}
                    {refl.custom_action_text && (
                      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-900 font-medium sm:col-span-2">
                        <Sparkles size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>Inisiatif Tambahan Murid:</strong> "{refl.custom_action_text}"
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 4: AI Coaching Response */}
                {refl.ai_coaching_feedback && (
                  <div className="p-4 rounded-2xl bg-teal-50/40 border border-teal-200/80 space-y-1.5">
                    <div className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-teal-600" />
                      <span>Respons Bimbingan Otomatis (Growth Mindset Mentor):</span>
                    </div>
                    <p className="text-xs sm:text-sm text-teal-950 leading-relaxed font-normal italic">
                      "{refl.ai_coaching_feedback}"
                    </p>
                  </div>
                )}

                {/* Section 5: Teacher's Personal Appreciation & Note */}
                <div className="pt-2 border-t border-slate-100">
                  {isEditing ? (
                    <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                          <MessageSquareQuote size={15} className="text-purple-600" />
                          <span>Tuliskan Catatan Apresiasi / Penguatan Guru:</span>
                        </span>
                        <button
                          type="button"
                          onClick={cancelEditNote}
                          className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        >
                          <X size={15} />
                        </button>
                      </div>

                      <textarea
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                        placeholder="Contoh: Hebat sekali atas kejujuran refleksimu! Besok kita diskusikan bersama saat sesi konsultasi..."
                        rows={3}
                        className="w-full p-3 rounded-xl border border-purple-300 text-xs sm:text-sm bg-white focus:outline-none focus:border-purple-600 transition"
                      />

                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={cancelEditNote}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          disabled={savingNote || !noteInput.trim()}
                          onClick={() => handleSaveTeacherNote(refl.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          {savingNote ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                          <span>Kirim Catatan Guru</span>
                        </button>
                      </div>
                    </div>
                  ) : refl.teacher_note ? (
                    <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200/90 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <MessageSquareQuote size={15} className="text-purple-700 shrink-0" />
                          <span className="text-xs font-bold text-purple-950">
                            Catatan Guru ({refl.teacher_note_by || 'Guru Mata Pelajaran'}):
                          </span>
                          {refl.teacher_note_at && (
                            <span className="text-[10px] text-purple-600 font-medium">
                              • {new Date(refl.teacher_note_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-purple-950 pl-6 leading-relaxed font-medium">
                          "{refl.teacher_note}"
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => startEditNote(refl)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold text-purple-700 hover:bg-purple-100/70 border border-purple-200 transition cursor-pointer self-start sm:self-auto shrink-0"
                      >
                        <Edit3 size={13} />
                        <span>Edit Catatan</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 italic">
                        Belum ada catatan langsung dari guru untuk refleksi ini.
                      </span>
                      <button
                        type="button"
                        onClick={() => startEditNote(refl)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-semibold border border-purple-200 transition cursor-pointer"
                      >
                        <MessageSquareQuote size={14} className="text-purple-600" />
                        <span>Beri Umpan Balik Guru</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
