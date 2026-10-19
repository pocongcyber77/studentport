import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (e) {
      console.warn('Failed to initialize GoogleGenAI client:', e);
    }
  }
  return aiClient;
}

export interface FeedbackContext {
  competencyCode: string;
  competencyName: string;
  studentName: string;
  correctCount: number;
  totalCount: number;
  percentage: number;
  masteryStatus: 'ACHIEVED' | 'DEVELOPING';
  incorrectQuestions: Array<{
    question: string;
    selectedAnswer: string;
    correctAnswer: string;
    explanation?: string;
  }>;
}

export async function generateRemediationFeedback(ctx: FeedbackContext): Promise<string> {
  const client = getAiClient();

  if (client) {
    try {
      const prompt = `
Anda adalah asisten pedagogi guru matematika yang ramah, memotivasi, dan berorientasi pada "Mastery Learning & Growth Mindset" (Progress > Ranking, Mastery > Score, Personal Journey).
Berikan analisis formatif dan rekomendasi belajar personal dalam Bahasa Indonesia untuk siswa bernama ${ctx.studentName}.

Data Asesmen:
- Kompetensi: ${ctx.competencyCode} - ${ctx.competencyName}
- Tahap Capaian: ${ctx.masteryStatus === 'ACHIEVED' ? 'Tahap Tercapai' : 'Tahap Sedang Berkembang'}
- Status: ${ctx.masteryStatus === 'ACHIEVED' ? 'Tercapai (Ambang batas penguasaan terpenuhi)' : 'Sedang Berkembang (Perlu penguatan konsep)'}

PANDUAN KHUSUS FORMATIF:
- JANGAN mencantumkan angka persentase (seperti "80%", "60%", dll.) maupun angka skor dalam ulasan.
- PERTAHANKAN penyebutan tahap capaian (seperti "Tahap Tercapai" atau "Tahap Sedang Berkembang").
- Fokuskan ulasan pada pemahaman konsep matematis, apresiasi proses belajar, serta langkah konkret penguatan materi.

${ctx.incorrectQuestions.length > 0 ? `Soal yang belum tepat dan penjelasannya:
${ctx.incorrectQuestions.map((q, idx) => `${idx + 1}. Soal: "${q.question}"\n   Jawaban Siswa: ${q.selectedAnswer}\n   Jawaban Benar: ${q.correctAnswer}\n   Miskonsepsi/Penjelasan: ${q.explanation || '-'}`).join('\n\n')}` : 'Semua soal dijawab dengan benar!'}

Tolong susun ulasan dalam 2-3 paragraf singkat dan ramah:
1. Apresiasi usaha siswa dan penegasan tahap belajarnya saat ini (Tahap Tercapai atau Tahap Sedang Berkembang).
2. Identifikasi miskonsepsi utama jika ada yang belum tepat (atau penguatan konsep jika sudah tercapai).
3. Langkah aksi konkret (tips belajar praktis atau materi yang perlu diulang sebelum mencoba lagi).
Gunakan nada suportif, tidak membandingkan dengan orang lain, dan tekankan bahwa kesalahan adalah bagian wajar dari proses belajar.
`;

      const aiPromise = client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));
      const response = await Promise.race([aiPromise, timeoutPromise]);

      if (response && (response as any).text) {
        return (response as any).text.trim();
      }
    } catch (err) {
      console.warn('Gemini API call failed, using rule-based feedback fallback:', err);
    }
  }

  // Graceful rule-based educational feedback fallback (in Indonesian)
  if (ctx.masteryStatus === 'ACHIEVED') {
    return `Luar biasa, ${ctx.studentName}! Kamu telah berhasil menguasai kompetensi ${ctx.competencyName} pada Tahap Tercapai. Pemahaman konsepmu sangat solid. Kamu dapat melanjutkan ke kompetensi berikutnya pada Learning Journey dengan percaya diri!`;
  } else {
    const errorHighlights = ctx.incorrectQuestions
      .map(q => q.explanation)
      .filter(Boolean)
      .slice(0, 2)
      .join(' ');

    return `Kerja bagus untuk usahamu hari ini, ${ctx.studentName}! Saat ini posisimu berada di Tahap Sedang Berkembang. ${errorHighlights ? `Fokus utama untuk perbaikan: ${errorHighlights}` : 'Pelajari kembali konsep dasar dan uji titik selidik.'} Luangkan waktu untuk mengkaji kembali materi, lalu silakan lakukan asesmen ulang (retry) untuk mencapai penguasaan maksimal!`;
  }
}

export async function generateGrowthMindsetCoaching(params: {
  studentName: string;
  competencyName?: string;
  feeling: string;
  challenge: string;
  actionPlan: string[];
  customAction?: string;
}): Promise<string> {
  const client = getAiClient();
  if (client) {
    try {
      const prompt = `
Anda adalah Guru dan Mentor Matematika yang ahli dalam Growth Mindset (Carol Dweck, Jo Boaler).
Seorang murid bernama ${params.studentName} sedang melakukan refleksi sebelum melakukan tes ulang (retry).

Data Refleksi Murid:
- Perasaan saat ini: "${params.feeling}"
- Materi/Kompetensi: ${params.competencyName || 'Matematika Program Linear'}
- Hal yang dirasa masih sulit / membuat ragu: "${params.challenge || 'Belum terbiasa dengan konsep grafik'}"
- Rencana aksi yang dipilih sebelum tes ulang: ${params.actionPlan.join(', ')}${params.customAction ? ` (${params.customAction})` : ''}

Tolong berikan pesan penguatan Growth Mindset yang hangat, ramah, dan memotivasi dalam 2 paragraf singkat (Bahasa Indonesia):
1. Normalisasikan rasa ragu/takut (tegaskan bahwa tidak ada yang namanya 'otak yang tidak berbakat matematika', dan rasa bingung adalah tanda sinapsis otak sedang meregangkan pemahaman baru).
2. Apresiasi rencana aksi yang dipilih murid dan beri dorongan optimis bahwa dengan strategi yang tepat, ia pasti siap menghadapi tes ulang dengan percaya diri.
`;

      const aiPromise = client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));
      const res = await Promise.race([aiPromise, timeoutPromise]);
      if (res && (res as any).text) {
        return (res as any).text.trim();
      }
    } catch (e) {
      console.warn('Gemini coaching fallback:', e);
    }
  }

  return `Hai ${params.studentName}, sangat wajar merasakan keraguan saat menghadapi konsep baru. Ingat prinsip neuroplastisitas: otak matematika bukanlah bawaan lahir, melainkan seperti otot yang bertumbuh setiap kali kamu bergulat dengan hal yang menantang! Rencana aksimu untuk "${params.actionPlan[0] || 'mengkaji kembali konsep'}" adalah langkah yang sangat cerdas. Ambil nafas, pelajari langkah demi langkah, dan kamu pasti bisa melangkah lebih jauh pada tes ulang ini!`;
}

