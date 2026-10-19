import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StudentReflection, JourneyCheckpoint } from '../../types';
import {
  Sparkles,
  Brain,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  ArrowRight,
  Send,
  Heart,
  Bot,
  Calendar,
  Layers,
  Check,
  Loader2,
} from 'lucide-react';

interface GrowthMindsetReflectionViewProps {
  checkpoints: JourneyCheckpoint[];
  onStartAssessment: (competencyId: string) => void;
}

export const GrowthMindsetReflectionView: React.FC<GrowthMindsetReflectionViewProps> = ({
  checkpoints,
  onStartAssessment,
}) => {
  const { token, user } = useAuth();

  // Developing competencies are prime candidates for retry reflection
  const developingComp = checkpoints.find(c => c.status === 'DEVELOPING') || checkpoints[0];

  const [selectedCompId, setSelectedCompId] = useState<string>(developingComp?.competency_id || '');
  const [feeling, setFeeling] = useState<string>('Ragu dan cemas saat melihat rumus baru');
  const [challengeText, setChallengeText] = useState<string>('');
  const [selectedActions, setSelectedActions] = useState<string[]>([
    'Membaca kembali rangkuman konsep & catatan contoh soal',
    'Mencoba uji titik selidik mandiri di kertas buram',
  ]);
  const [customAction, setCustomAction] = useState<string>('');
  const [readiness, setReadiness] = useState<number>(4);

  const [saving, setSaving] = useState(false);
  const [coachingResult, setCoachingResult] = useState<string | null>(null);
  const [reflectionsHistory, setReflectionsHistory] = useState<StudentReflection[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Math Anxiety / Belief options
  const feelingOptions = [
    {
      id: 'bakat',
      title: 'Merasa "aku memang tidak berbakat matematika"',
      icon: '😟',
      color: 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/40',
      description: 'Sering merasa bahwa orang lain cepat paham karena bakat, sementara diriku sulit.',
    },
    {
      id: 'cemas',
      title: 'Ragu dan cemas saat melihat rumus atau tanda baru',
      icon: '🤔',
      color: 'border-amber-200 hover:border-amber-400 bg-amber-50/30',
      description: 'Takut salah saat mencoba, merasa tidak percaya diri dengan jawaban sendiri.',
    },
    {
      id: 'proses',
      title: 'Mulai paham bahwa rasa bingung itu tanda otak sedang bertumbuh',
      icon: '🌱',
      color: 'border-teal-200 hover:border-teal-400 bg-teal-50/30',
      description: 'Menyadari konsep "The Power of YET": aku belum bisa SEKARANG, tapi pasti bisa jika berlatih.',
    },
    {
      id: 'percaya',
      title: 'Yakin bahwa latihan terarah akan membuatku menguasai konsep',
      icon: '🚀',
      color: 'border-lime-300 hover:border-lime-400 bg-lime-50/40',
      description: 'Melihat kesalahan sebagai peta petunjuk untuk memperbaiki strategi belajar.',
    },
  ];

  // Action checklist options
  const defaultActionOptions = [
    'Membaca kembali rangkuman konsep & catatan contoh soal',
    'Mencoba uji titik selidik mandiri di kertas buram',
    'Menandai perbedaan garis putus-putus (<, >) vs garis tegas (≤, ≥)',
    'Menonton kembali penjelasan video / modul langkah demi langkah',
    'Berdiskusi dengan teman sebaya atau menanyakan bagian ragu ke guru',
    'Mengerjakan 2 latihan mandiri secara perlahan tanpa terburu-buru',
  ];

  const fetchReflections = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/student/reflections', {
        headers: { 'x-user-id': token || '' },
      });
      if (res.ok) {
        const json = await res.json();
        setReflectionsHistory(json.reflections || []);
      }
    } catch (e) {
      console.error('Error fetching reflections:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchReflections();
  }, [token]);

  const toggleAction = (actionText: string) => {
    if (selectedActions.includes(actionText)) {
      setSelectedActions(selectedActions.filter(a => a !== actionText));
    } else {
      setSelectedActions([...selectedActions, actionText]);
    }
  };

  const handleSaveReflection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeling || selectedActions.length === 0) {
      alert('Pilih perasaan mindset dan minimal 1 aksi nyata yang akan dilakukan.');
      return;
    }

    setSaving(true);
    setCoachingResult(null);

    try {
      const res = await fetch('/api/student/reflections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': token || '',
        },
        body: JSON.stringify({
          competency_id: selectedCompId || null,
          mindset_feeling: feeling,
          challenge_description: challengeText,
          action_plan: selectedActions,
          custom_action_text: customAction,
          readiness_level: readiness,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCoachingResult(data.reflection?.ai_coaching_feedback || 'Refleksi berhasil disimpan!');
        fetchReflections();
      }
    } catch (e) {
      console.error('Error saving reflection:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Hero Growth Mindset Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1b4332] via-[#2d6a4f] to-[#1e4634] text-white p-6 sm:p-8 shadow-xl border border-emerald-500/30">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-lime-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/25 border border-emerald-400/35 text-emerald-200 text-xs font-semibold">
            <Brain size={15} />
            <span>Growth Mindset & Refleksi Metakognisi</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Ruang Refleksi: Mengubah "Aku Tidak Bisa" Menjadi "Aku Belum Bisa"
          </h1>

          <p className="text-emerald-100/90 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Tidak ada yang namanya 'otak matematika sejak lahir'. Otakmu seperti otot: ia bertumbuh paling pesat saat kamu menghadapi kebingungan, merefleksikan kesalahan, dan mencoba strategi baru.
          </p>

          <div className="pt-2 flex flex-wrap gap-3 text-xs text-emerald-200 font-medium">
            <span className="bg-white/10 px-3 py-1 rounded-lg">✨ The Power of "YET" (Belum)</span>
            <span className="bg-white/10 px-3 py-1 rounded-lg">🧠 Kesalahan = Otak Bertumbuh</span>
            <span className="bg-white/10 px-3 py-1 rounded-lg">🎯 Refleksi Sebelum Tes Ulang</span>
          </div>
        </div>
      </div>

      {/* Bagian 1: Asesmen Keyakinan & Perasaan Diri Terhadap Matematika */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            Langkah 1 • Kenali Perasaanmu
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
            Apakah kamu saat ini masih merasa "tidak bisa matematika"?
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pilihlah pernyataan yang paling mewakili kondisimu saat ini. Jujur pada diri sendiri adalah awal kemajuan sejati.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {feelingOptions.map((opt) => {
            const isSelected = feeling === opt.title;
            return (
              <div
                key={opt.id}
                onClick={() => setFeeling(opt.title)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${opt.color} ${
                  isSelected ? 'ring-2 ring-emerald-500 shadow-md border-emerald-600 bg-white' : ''
                }`}
              >
                <span className="text-2xl shrink-0 mt-0.5">{opt.icon}</span>
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                    {opt.title}
                  </div>
                  <div className="text-[11px] text-slate-600 leading-relaxed">
                    {opt.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fact box on Neuroplasticity */}
        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 flex items-start gap-3 text-xs text-emerald-950">
          <Lightbulb size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-bold text-emerald-900">Fakta Riset Neurosains:</strong> Ketika kamu merasa bingung dan berusaha mencari solusinya, neuron di otakmu sedang menyambungkan cabang-cabang sinapsis baru. Jangan biarkan perasaan "aku tidak bisa" menghentikanmu—tambahkan kata <em>"belum"</em> di belakangnya!
          </div>
        </div>
      </div>

      {/* Bagian 2: Lembar Refleksi & Rencana Solusi Sebelum Tes Ulang */}
      <form onSubmit={handleSaveReflection} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            Langkah 2 • Rencana Aksi Solutif
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
            Refleksi & Rencana Tindakan Sebelum Tes Ulang (Pre-Retry Action Plan)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Sebelum menekan tombol coba lagi, tentukan bagian apa yang perlu dipelajari ulang dan strategi apa yang akan kamu gunakan.
          </p>
        </div>

        {/* Competency Target Selection */}
        <div>
          <label className="font-semibold text-slate-800 text-xs sm:text-sm block mb-1">
            Pos Kompetensi yang Sedang Direfleksikan / Akan Diulang:
          </label>
          <select
            value={selectedCompId}
            onChange={(e) => setSelectedCompId(e.target.value)}
            className="w-full sm:w-80 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:border-emerald-500"
          >
            {checkpoints.map((c) => (
              <option key={c.competency_id} value={c.competency_id}>
                {c.code} - {c.name} ({c.status === 'ACHIEVED' ? 'Tercapai' : c.status === 'DEVELOPING' ? 'Sedang Berkembang' : 'Belum Dimulai'})
              </option>
            ))}
          </select>
        </div>

        {/* What was confusing / misconception */}
        <div>
          <label className="font-semibold text-slate-800 text-xs sm:text-sm block mb-1">
            Konsep atau bagian mana yang kemarin terasa paling membingungkan?
          </label>
          <textarea
            rows={2}
            value={challengeText}
            onChange={(e) => setChallengeText(e.target.value)}
            placeholder="Misal: Saya masih ragu kapan garis grafik harus putus-putus atau garis tegas saat uji titik selidik..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Action Checklist */}
        <div className="space-y-2.5">
          <label className="font-semibold text-slate-800 text-xs sm:text-sm block">
            Solusi konkret apa yang sudah atau akan kamu lakukan sebelum tes ulang? (Pilih minimal 1)
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {defaultActionOptions.map((actionText) => {
              const isChecked = selectedActions.includes(actionText);
              return (
                <div
                  key={actionText}
                  onClick={() => toggleAction(actionText)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-center gap-3 text-xs ${
                    isChecked
                      ? 'bg-emerald-50/90 border-emerald-400 text-emerald-950 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                      isChecked ? 'bg-emerald-700 border-emerald-700 text-white' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isChecked && <Check size={13} strokeWidth={3} />}
                  </div>
                  <span className="flex-1 leading-snug">{actionText}</span>
                </div>
              );
            })}
          </div>

          <div className="pt-1">
            <input
              type="text"
              value={customAction}
              onChange={(e) => setCustomAction(e.target.value)}
              placeholder="Tambahkan solusi belajarmu sendiri jika ada..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Readiness Scale */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-semibold text-slate-800 text-xs sm:text-sm">
              Tingkat Kesiapan Mental untuk Mencoba Lagi:
            </label>
            <span className="font-bold text-emerald-800 text-xs sm:text-sm">
              Skala {readiness} dari 5
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={readiness}
            onChange={(e) => setReadiness(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-700 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1">
            <span>1: Masih Ragu</span>
            <span>3: Cukup Siap</span>
            <span>5: Sangat Siap & Percaya Diri</span>
          </div>
        </div>

        {/* Submit Reflection */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-900/15 transition cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Menyimpan & Menganalisis...</span>
              </>
            ) : (
              <>
                <Send size={15} />
                <span>Simpan Catatan Refleksi</span>
              </>
            )}
          </button>

          {selectedCompId && (
            <button
              type="button"
              onClick={() => onStartAssessment(selectedCompId)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              <span>Mulai Tes Ulang Sekarang 🚀</span>
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </form>

      {/* AI Coaching Response Card */}
      {coachingResult && (
        <div className="rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50 border border-emerald-200/90 p-6 sm:p-7 shadow-xs space-y-3 animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-2.5 text-emerald-950 font-bold text-sm sm:text-base">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles size={18} />
            </div>
            <span>Umpan Balik Penguatan Refleksi Belajar (Growth Mindset)</span>
          </div>
          <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed whitespace-pre-line pl-10">
            {coachingResult}
          </p>
        </div>
      )}

      {/* Bagian 3: Riwayat Catatan Jurnal Refleksi Siswa */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar size={18} className="text-emerald-600" />
            Jurnal Jejak Refleksi Belajar ({reflectionsHistory.length})
          </h2>
          <span className="text-xs text-slate-400">Bukti perkembangan metakognisi mandiri</span>
        </div>

        {loadingHistory ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Memuat catatan jurnal...
          </div>
        ) : reflectionsHistory.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Belum ada catatan refleksi yang tersimpan.
          </div>
        ) : (
          <div className="space-y-3">
            {reflectionsHistory.map((refl) => (
              <div
                key={refl.id}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">
                      {refl.competency_code ? `${refl.competency_code} - ${refl.competency_name}` : 'Refleksi Umum'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                      Kesiapan: {refl.readiness_level}/5
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px]">
                    {new Date(refl.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="text-slate-700">
                  <span className="text-slate-400">Kondisi Rasa:</span>{' '}
                  <strong className="text-slate-800">{refl.mindset_feeling}</strong>
                </div>

                {refl.challenge_description && (
                  <div className="text-slate-600 italic">
                    "{refl.challenge_description}"
                  </div>
                )}

                <div className="pt-1 flex flex-wrap gap-1.5">
                  {refl.action_plan.map((act, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 text-[10px]">
                      ✓ {act}
                    </span>
                  ))}
                </div>

                {refl.ai_coaching_feedback && (
                  <div className="mt-2 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 text-[11px] leading-relaxed">
                    <strong className="font-semibold text-emerald-950">Catatan Penguatan:</strong> {refl.ai_coaching_feedback}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
