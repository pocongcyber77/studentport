import React, { useState, useEffect } from 'react';
import { SanitizedQuestion, AssessmentResult } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { LatexRenderer } from '../common/LatexRenderer';
import {
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  Send,
  AlertCircle,
  Loader2,
  Check,
  Compass,
  Maximize2,
  X,
  Image as ImageIcon,
} from 'lucide-react';

interface AssessmentRunnerProps {
  competencyId: string;
  onCancel: () => void;
  onCompleted: (result: AssessmentResult) => void;
}

export const AssessmentRunner: React.FC<AssessmentRunnerProps> = ({
  competencyId,
  onCancel,
  onCompleted,
}) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [competencyMeta, setCompetencyMeta] = useState<any>(null);
  const [questions, setQuestions] = useState<SanitizedQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [startTime] = useState<string>(() => new Date().toISOString());
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [zoomImageUrl, setZoomImageUrl] = useState<{ url: string; caption?: string } | null>(null);

  useEffect(() => {
    async function loadAssessment() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/student/assessments/${competencyId}`, {
          headers: {
            'x-user-id': token || '',
          },
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Gagal memuat asesmen.');
        }
        const data = await res.json();
        setCompetencyMeta(data.competency);
        setQuestions(data.questions);
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan jaringan.');
      } finally {
        setLoading(false);
      }
    }
    loadAssessment();
  }, [competencyId, token]);

  const handleSelectAnswer = (questionId: string, choice: 'A' | 'B' | 'C' | 'D') => {
    setResponses(prev => ({
      ...prev,
      [questionId]: choice,
    }));
  };

  const answeredCount = Object.keys(responses).length;
  const totalCount = questions.length;
  const isAllAnswered = answeredCount === totalCount;

  const handleSubmitAttempt = async () => {
    setSubmitting(true);
    setShowConfirmModal(false);
    setError(null);
    try {
      const res = await fetch('/api/student/attempts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': token || '',
        },
        body: JSON.stringify({
          competency_id: competencyId,
          responses,
          started_at: startTime,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Jawaban belum berhasil disimpan. Silakan coba lagi.');
      }

      const resultData: AssessmentResult = await res.json();
      onCompleted(resultData);
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim asesmen. Periksa koneksi Anda.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 space-y-4">
        <Loader2 size={36} className="animate-spin text-emerald-600" />
        <p className="text-slate-600 text-sm font-medium">Menyiapkan soal asesmen formatif...</p>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white rounded-2xl border border-rose-200 p-8 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Kendala Memuat Asesmen</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{error}</p>
        <button
          onClick={onCancel}
          className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition cursor-pointer"
        >
          Kembali ke Learning Journey
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            title="Kembali"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {competencyMeta?.code}
              </span>
              <span className="text-xs text-slate-400">• Formative Assessment</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {competencyMeta?.name}
            </h2>
          </div>
        </div>

        {/* Progress counter (tanpa persentase) */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="text-right">
            <div className="text-xs text-slate-500">Progress Pengerjaan</div>
            <div className="text-sm font-bold text-slate-800">
              {answeredCount} dari {totalCount} Soal
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 font-semibold">
            <HelpCircle size={18} />
          </div>
        </div>
      </div>

      {/* Question Index Pills Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="text-xs font-semibold text-slate-500 mb-2">Navigasi Nomor Soal:</div>
        <div className="flex flex-wrap gap-2">
          {questions.map((q, idx) => {
            const isAnswered = !!responses[q.id];
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer border ${
                  isCurrent
                    ? 'bg-emerald-700 text-white border-emerald-700 ring-2 ring-emerald-200'
                    : isAnswered
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-100 pb-3">
            <span className="font-semibold text-emerald-800">
              Soal Nomor {currentIndex + 1} dari {totalCount}
            </span>
            <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
              Pilihan Ganda Tunggal
            </span>
          </div>

          {/* Question Text */}
          <div className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed">
            <LatexRenderer text={currentQuestion.question_text} />
          </div>

          {/* Question Image (if present) */}
          {currentQuestion.image_url && (
            <div className="my-3 rounded-2xl border border-slate-200 bg-slate-50 p-2.5 sm:p-3 text-center">
              <div className="relative inline-block group">
                <img
                  src={currentQuestion.image_url}
                  alt={currentQuestion.image_caption || 'Ilustrasi Soal'}
                  className="max-h-64 sm:max-h-80 w-auto mx-auto rounded-xl object-contain cursor-pointer"
                  onClick={() =>
                    setZoomImageUrl({
                      url: currentQuestion.image_url!,
                      caption: currentQuestion.image_caption,
                    })
                  }
                  referrerPolicy="no-referrer"
                />
                <button
                  type="button"
                  onClick={() =>
                    setZoomImageUrl({
                      url: currentQuestion.image_url!,
                      caption: currentQuestion.image_caption,
                    })
                  }
                  className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white gap-1.5 text-xs font-semibold rounded-xl transition cursor-pointer backdrop-blur-[1px]"
                >
                  <Maximize2 size={16} />
                  <span>Perbesar Gambar</span>
                </button>
              </div>
              {currentQuestion.image_caption && (
                <p className="text-xs text-slate-600 italic mt-2 font-serif">
                  {currentQuestion.image_caption}
                </p>
              )}
            </div>
          )}

          {/* Options A, B, C, D */}
          <div className="space-y-3 pt-2">
            {(['A', 'B', 'C', 'D'] as const).map((letter) => {
              const optionKey = `option_${letter.toLowerCase()}` as keyof SanitizedQuestion;
              const optionText = currentQuestion[optionKey] as string;
              const isSelected = responses[currentQuestion.id] === letter;

              return (
                <button
                  key={letter}
                  type="button"
                  onClick={() => handleSelectAnswer(currentQuestion.id, letter)}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-150 flex items-start gap-4 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/90 border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {letter}
                  </div>
                  <div className="flex-1 text-sm sm:text-base text-slate-800 leading-relaxed font-normal pt-0.5">
                    <LatexRenderer text={optionText} />
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 self-center">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Navigation within test */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              currentIndex === 0
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 cursor-pointer'
            }`}
          >
            <ArrowLeft size={16} />
            <span>Sebelumnya</span>
          </button>

          <div className="flex items-center gap-3">
            {currentIndex < totalCount - 1 ? (
              <button
                onClick={() => setCurrentIndex(prev => Math.min(totalCount - 1, prev + 1))}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition shadow-xs cursor-pointer"
              >
                <span>Selanjutnya</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={() => setShowConfirmModal(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <Send size={15} />
                <span>Selesai & Kumpulkan</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal before submission */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto">
              <Compass size={26} />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-900">
                Kumpulkan Asesmen Formatif?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Jawabanmu akan langsung diperiksa secara otomatis untuk menentukan status penguasaan kompetensi ini.
              </p>
            </div>

            {/* Warning if unanswered */}
            {!isAllAnswered ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 flex items-start gap-3">
                <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Perhatian:</strong> Masih ada{' '}
                  <span className="font-bold underline text-amber-900">
                    {totalCount - answeredCount} soal
                  </span>{' '}
                  yang belum kamu jawab. Soal yang tidak dijawab akan dihitung salah.
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-800 flex items-center gap-2">
                <Check size={16} className="text-emerald-600 shrink-0" />
                <span>Seluruh {totalCount} soal telah kamu jawab.</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                Cek Lagi
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitAttempt}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-md shadow-emerald-900/15 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>Ya, Kumpulkan</span>
                )}
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
