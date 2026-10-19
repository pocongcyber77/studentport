import React, { useEffect, useState } from 'react';
import { AssessmentResult } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { LatexRenderer } from '../common/LatexRenderer';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  Compass,
  Sparkles,
  Check,
  X,
  Bot,
  Lightbulb,
  Maximize2,
  Image as ImageIcon,
} from 'lucide-react';

interface AssessmentResultViewProps {
  result: AssessmentResult;
  onBackToJourney: () => void;
  onRetry: () => void;
  onNextCheckpoint?: () => void;
}

// Helper untuk menghapus persentase dari ulasan formatif dan mempertahankan tahapnya
function formatFormativeFeedback(feedback?: string | null): string {
  if (!feedback) return '';
  return feedback
    // Hapus format kurung persentase seperti (80%), (60%), dll.
    .replace(/\s*\(\d+%\)/g, '')
    // Hapus kalimat seperti "dengan capaian 80%" atau "capaian 80%"
    .replace(/\s*(?:dengan\s+)?capaian\s+\d+%/gi, '')
    // Hapus "sebesar 80%"
    .replace(/\s*sebesar\s+\d+%/gi, '')
    // Ganti "ambang penguasaan 80% terpenuhi" menjadi "ambang penguasaan terpenuhi"
    .replace(/ambang\s+penguasaan\s+\d+%\s+terpenuhi/gi, 'ambang batas penguasaan terpenuhi')
    // Hapus persentase tersisa jika ada
    .replace(/\s*\b\d+%\b/g, '')
    // Bersihkan spasi ganda dan tanda baca gantung
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+\./g, '.')
    .replace(/\s+,/g, ',')
    .trim();
}

export const AssessmentResultView: React.FC<AssessmentResultViewProps> = ({
  result,
  onBackToJourney,
  onRetry,
  onNextCheckpoint,
}) => {
  const { competency, result: metrics, detailed_responses } = result;
  const isAchieved = metrics.mastery_status === 'ACHIEVED';
  const [zoomImageUrl, setZoomImageUrl] = useState<{ url: string; caption?: string } | null>(null);

  // Trigger celebratory confetti if mastery reached!
  useEffect(() => {
    if (isAchieved) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#06b6d4', '#6366f1', '#fbbf24'],
        });
      } catch (e) {
        console.log('Confetti trigger omitted', e);
      }
    }
  }, [isAchieved]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Result Hero Header Card */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border shadow-lg transition-all ${
          isAchieved
            ? 'bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 border-emerald-600/30 text-white'
            : 'bg-gradient-to-br from-amber-900 via-amber-800 to-slate-900 border-amber-600/30 text-white'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white/10 text-white border border-white/20">
                {competency.code}
              </span>
              <span className="text-xs text-slate-200">
                Target: Penguasaan Konsep Mandiri
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {competency.name}
            </h1>

            {/* Student-facing Status as the Primary Output */}
            <div className="pt-1 flex items-center gap-3">
              <StatusBadge status={metrics.mastery_status} size="lg" />
              <span className="text-xs sm:text-sm text-slate-200">
                {isAchieved
                  ? 'Kompetensi tercapai. Ambang batas penguasaan terpenuhi.'
                  : 'Kompetensi sedang berkembang. Pelajari kembali bagian yang belum dikuasai.'}
              </span>
            </div>
          </div>

          {/* Formative Metric Box without numerical ratio 3/5, retaining status and stage */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 text-center shrink-0 w-full sm:w-64 flex flex-col justify-center items-center">
            <div className="text-xs text-slate-200 uppercase font-semibold tracking-wider mb-2">
              Status Capaian
            </div>
            <div className={`px-4 py-2.5 rounded-2xl font-extrabold text-base sm:text-lg flex items-center justify-center gap-2 shadow-xs ${
              isAchieved
                ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40'
                : 'bg-amber-500/30 text-amber-200 border border-amber-400/40'
            }`}>
              {isAchieved ? (
                <CheckCircle2 size={20} className="text-emerald-300 shrink-0" />
              ) : (
                <AlertTriangle size={20} className="text-amber-300 shrink-0" />
              )}
              <span>{isAchieved ? 'Tercapai' : 'Sedang Berkembang'}</span>
            </div>
            <div className="text-xs text-slate-200 mt-2 font-medium">
              Tahap: <span className="font-bold text-white">{isAchieved ? 'Tahap Tercapai' : 'Tahap Sedang Berkembang'}</span>
            </div>
          </div>
        </div>

        {/* Quick action buttons row in hero */}
        <div className="mt-6 pt-6 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onBackToJourney}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <Compass size={16} />
            <span>Kembali ke Learning Journey</span>
          </button>

          <div className="flex items-center gap-3">
            {!isAchieved && (
              <span className="text-xs text-amber-200 italic hidden sm:inline">
                Luangkan waktu berefleksi sebelum mencoba lagi 💡
              </span>
            )}

            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white text-slate-900 hover:bg-slate-100 transition shadow-sm cursor-pointer"
            >
              <RotateCcw size={15} />
              <span>Coba Lagi (Retry)</span>
            </button>

            {isAchieved && onNextCheckpoint && (
              <button
                onClick={onNextCheckpoint}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-white transition shadow-sm cursor-pointer"
              >
                <span>Pos Selanjutnya</span>
                <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AI Pedagogical Remediation & Feedback Layer */}
      {metrics.ai_feedback && (
        <div className="rounded-3xl bg-emerald-50/80 border border-emerald-200/90 p-6 sm:p-7 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm sm:text-base">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles size={18} />
            </div>
            <span>Ulasan Formatif & Rekomendasi Belajar</span>
          </div>
          <div className="text-xs sm:text-sm text-emerald-950 leading-relaxed whitespace-pre-line pl-10 font-normal">
            {formatFormativeFeedback(metrics.ai_feedback)}
          </div>
        </div>
      )}

      {/* Detailed Question Review */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Lightbulb size={20} className="text-amber-500" />
            Pembahasan & Telaah Miskonsepsi
          </h2>
          <span className="text-xs text-slate-500">
            {metrics.correct_count} Benar • {metrics.question_count - metrics.correct_count} Perlu Dipelajari
          </span>
        </div>

        <div className="space-y-4">
          {detailed_responses.map((item, index) => {
            const isCorrect = item.is_correct;

            return (
              <div
                key={item.question_id}
                className={`rounded-2xl border p-5 sm:p-6 transition-all ${
                  isCorrect
                    ? 'bg-white border-slate-200'
                    : 'bg-rose-50/20 border-rose-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Soal {index + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <Check size={12} strokeWidth={3} />
                        Benar
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                        <X size={12} strokeWidth={3} />
                        Perlu Diperbaiki
                      </span>
                    )}
                  </div>
                </div>

                {/* Question */}
                <div className="text-sm sm:text-base font-medium text-slate-900 mb-3 leading-relaxed">
                  <LatexRenderer text={item.question_text} />
                </div>

                {/* Question Image (if attached) */}
                {item.image_url && (
                  <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-2 sm:p-2.5 inline-block text-left">
                    <div className="relative inline-block group">
                      <img
                        src={item.image_url}
                        alt={item.image_caption || 'Ilustrasi Soal'}
                        className="max-h-48 sm:max-h-56 w-auto rounded-lg object-contain cursor-pointer"
                        onClick={() =>
                          setZoomImageUrl({
                            url: item.image_url!,
                            caption: item.image_caption,
                          })
                        }
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setZoomImageUrl({
                            url: item.image_url!,
                            caption: item.image_caption,
                          })
                        }
                        className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white gap-1 text-xs font-semibold rounded-lg transition cursor-pointer backdrop-blur-[1px]"
                      >
                        <Maximize2 size={14} />
                        <span>Perbesar</span>
                      </button>
                    </div>
                    {item.image_caption && (
                      <p className="text-[11px] text-slate-500 italic mt-1 font-serif">
                        {item.image_caption}
                      </p>
                    )}
                  </div>
                )}

                {/* Option review */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                  {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                    const text = item.options[letter];
                    const wasSelected = item.selected_answer === letter;
                    const isKey = item.correct_answer === letter;

                    let cardStyle = 'bg-slate-50 border-slate-200 text-slate-700';
                    if (isKey) {
                      cardStyle = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold ring-1 ring-emerald-400/30';
                    } else if (wasSelected && !isCorrect) {
                      cardStyle = 'bg-rose-50 border-rose-300 text-rose-900 ring-1 ring-rose-400/30';
                    }

                    return (
                      <div
                        key={letter}
                        className={`p-3 rounded-xl border flex items-start gap-2.5 ${cardStyle}`}
                      >
                        <span
                          className={`w-5 h-5 rounded-md font-bold text-[11px] flex items-center justify-center shrink-0 ${
                            isKey
                              ? 'bg-emerald-600 text-white'
                              : wasSelected
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {letter}
                        </span>
                        <div className="flex-1 leading-snug">
                          <LatexRenderer text={text} />
                          {wasSelected && (
                            <span className="ml-1.5 text-[11px] font-normal text-slate-500 italic">
                              (Jawabanmu)
                            </span>
                          )}
                          {isKey && (
                            <span className="ml-1.5 text-[11px] font-bold text-emerald-700">
                              ✓ Kunci Konsep
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {item.explanation && (
                  <div className="mt-4 p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs text-slate-800 leading-relaxed flex items-start gap-2.5">
                    <Sparkles size={15} className="text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <strong className="text-amber-950 font-bold block mb-1">
                        Pembahasan & Telaah Miskonsepsi:
                      </strong>
                      <LatexRenderer text={item.explanation} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

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
