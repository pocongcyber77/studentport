import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User,
  Student,
  Chapter,
  Subtopic,
  Competency,
  CompetencyProgress,
  AssessmentQuestion,
  AssessmentAttempt,
  AssessmentResponse,
  AuditLog,
  StudentReflection,
} from './types.js';
import { isPostgresEnabled, loadState, saveState } from './persist.js';

interface DatabaseSchema {
  users: User[];
  students: Student[];
  chapters: Chapter[];
  competencies: Competency[];
  subtopics: Subtopic[];
  competency_progress: CompetencyProgress[];
  questions: AssessmentQuestion[];
  attempts: AssessmentAttempt[];
  responses: AssessmentResponse[];
  audit_logs: AuditLog[];
  reflections: StudentReflection[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'learning_journey_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function generateInitialSeed(): DatabaseSchema {
  const now = new Date().toISOString();

  // Users
  const userTeacher: User = {
    id: 'u-teacher-1',
    email: 'guru.ratna@sekolah.id',
    name: 'Ibu Ratna Dewi, M.Pd.',
    role: 'teacher',
    password: 'password123',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    created_at: now,
    updated_at: now,
  };

  const userAdmin: User = {
    id: 'u-admin-1',
    email: 'admin@sekolah.id',
    name: 'Admin Kurikulum',
    role: 'admin',
    password: 'password123',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    created_at: now,
    updated_at: now,
  };

  const userBudi: User = {
    id: 'u-student-1',
    email: 'budi@sekolah.id',
    name: 'Budi Santoso',
    role: 'student',
    password: 'password123',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    created_at: now,
    updated_at: now,
  };

  const userSiti: User = {
    id: 'u-student-2',
    email: 'siti@sekolah.id',
    name: 'Siti Rahma',
    role: 'student',
    password: 'password123',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    created_at: now,
    updated_at: now,
  };

  const userAhmad: User = {
    id: 'u-student-3',
    email: 'ahmad@sekolah.id',
    name: 'Ahmad Fauzi',
    role: 'student',
    password: 'password123',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    created_at: now,
    updated_at: now,
  };

  const userDewi: User = {
    id: 'u-student-4',
    email: 'dewi@sekolah.id',
    name: 'Dewi Lestari',
    role: 'student',
    password: 'password123',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    created_at: now,
    updated_at: now,
  };

  const users: User[] = [userTeacher, userAdmin, userBudi, userSiti, userAhmad, userDewi];

  // Students profiles
  const studentBudi: Student = {
    id: 'std-1',
    user_id: userBudi.id,
    full_name: 'Budi Santoso',
    email: userBudi.email,
    grade: 'Kelas X',
    class_name: 'X-MIPA 1',
    created_at: now,
    updated_at: now,
  };

  const studentSiti: Student = {
    id: 'std-2',
    user_id: userSiti.id,
    full_name: 'Siti Rahma',
    email: userSiti.email,
    grade: 'Kelas X',
    class_name: 'X-MIPA 1',
    created_at: now,
    updated_at: now,
  };

  const studentAhmad: Student = {
    id: 'std-3',
    user_id: userAhmad.id,
    full_name: 'Ahmad Fauzi',
    email: userAhmad.email,
    grade: 'Kelas X',
    class_name: 'X-MIPA 1',
    created_at: now,
    updated_at: now,
  };

  const studentDewi: Student = {
    id: 'std-4',
    user_id: userDewi.id,
    full_name: 'Dewi Lestari',
    email: userDewi.email,
    grade: 'Kelas X',
    class_name: 'X-MIPA 2',
    created_at: now,
    updated_at: now,
  };

  const students: Student[] = [studentBudi, studentSiti, studentAhmad, studentDewi];

  // Chapters (Bab Kurikulum Matematika)
  const chap1: Chapter = {
    id: 'chap-1',
    code: 'BAB-1',
    title: 'Program Linear Dua Variabel',
    description: 'Sistem pertidaksamaan linear, grafik daerah himpunan penyelesaian, uji titik selidik, dan model optimasi nilai fungsi objektif.',
    sequence_order: 1,
    active: true,
    created_at: now,
    updated_at: now,
  };

  const chap2: Chapter = {
    id: 'chap-2',
    code: 'BAB-2',
    title: 'Matriks & Transformasi Aljabar',
    description: 'Pengantar ordo matriks, kesamaan matriks, operasi penjumlahan/perkalian matriks, determinan, dan invers matriks.',
    sequence_order: 2,
    active: true,
    created_at: now,
    updated_at: now,
  };

  const chapters: Chapter[] = [chap1, chap2];

  // Subtopik / Langkah Rinci Belajar (Micro-Skills)
  const subtopics: Subtopic[] = [
    // PRG-1 Subtopik
    {
      id: 'sub-1-1',
      competency_id: 'comp-1',
      code: '1.1',
      title: 'Metode Eliminasi & Substitusi SPLDV',
      remedial_guide: 'Samakan koefisien variabel sasaran dengan perkalian konstanta sebelum menjumlah/mengurangkan persamaan.',
      sequence_order: 1,
    },
    {
      id: 'sub-1-2',
      competency_id: 'comp-1',
      code: '1.2',
      title: 'Menentukan Titik Potong Garis Linear pada Bidang Cartesius',
      remedial_guide: 'Cari titik potong sumbu: jadikan x = 0 untuk sumbu Y, dan jadikan y = 0 untuk sumbu X.',
      sequence_order: 2,
    },

    // PRG-2 Subtopik (Langkah Menggambar Grafik Pertidaksamaan)
    {
      id: 'sub-2-1',
      competency_id: 'comp-2',
      code: '2.1',
      title: 'Menentukan Titik Potong Sumbu X dan Sumbu Y',
      remedial_guide: 'Buat tabel koordinat: cari nilai y saat x = 0, lalu cari nilai x saat y = 0 untuk menentukan dua titik garis pembatas.',
      sequence_order: 1,
    },
    {
      id: 'sub-2-2',
      competency_id: 'comp-2',
      code: '2.2',
      title: 'Pemilihan Jenis Garis Pembatas (Putus-putus vs Tegas)',
      remedial_guide: 'Perhatikan tanda: gunakan garis putus-putus untuk tanda ketidaksamaan murni (< atau >) dan garis tegas untuk tanda memuat sama dengan (≤ atau ≥).',
      sequence_order: 2,
    },
    {
      id: 'sub-2-3',
      competency_id: 'comp-2',
      code: '2.3',
      title: 'Uji Titik Selidik (0,0) untuk Penentuan Arah Arsiran',
      remedial_guide: 'Substitusi titik (0,0) ke pertidaksamaan. Jika hasilnya BENAR, arsir daerah yang memuat titik (0,0). Jika SALAH, arsir daerah seberang.',
      sequence_order: 3,
    },
    {
      id: 'sub-2-4',
      competency_id: 'comp-2',
      code: '2.4',
      title: 'Interpretasi Verbal Simbol Pertidaksamaan (≤, ≥, <, >)',
      remedial_guide: 'Kata "maksimum / tidak boleh lebih dari" setara dengan ≤. Kata "minimum / paling sedikit" setara dengan ≥.',
      sequence_order: 4,
    },

    // PRG-3 Subtopik
    {
      id: 'sub-3-1',
      competency_id: 'comp-3',
      code: '3.1',
      title: 'Menggambar Garis dan Daerah Bersih DHP',
      remedial_guide: 'Tarik garis lurus melewati dua titik potong sumbu koordinat lalu arsirlah daerah yang bernilai benar.',
      sequence_order: 1,
    },
    {
      id: 'sub-3-2',
      competency_id: 'comp-3',
      code: '3.2',
      title: 'Mengecek Keanggotaan Titik Uji pada Himpunan Penyelesaian',
      remedial_guide: 'Masukkan absis (x) dan ordinat (y) titik uji ke dalam pertidaksamaan, periksa apakah bernilai valid.',
      sequence_order: 2,
    },

    // PRG-4 Subtopik
    {
      id: 'sub-4-1',
      competency_id: 'comp-4',
      code: '4.1',
      title: 'Menentukan Irisan Gabungan Daerah SPTLDV',
      remedial_guide: 'Gambarlah seluruh garis pembatas dalam satu bidang koordinat lalu cari daerah yang terkena irisan semua syarat.',
      sequence_order: 1,
    },
    {
      id: 'sub-4-2',
      competency_id: 'comp-4',
      code: '4.2',
      title: 'Menentukan Titik-Titik Pojok Daerah Penyelesaian',
      remedial_guide: 'Titik pojok adalah titik potong antar garis batas pembatas DHP. Hitung koordinatnya menggunakan metode eliminasi/substitusi.',
      sequence_order: 2,
    },
  ];

  // Competencies (Initial Seed Data as per Section 31)
  const comp1: Competency = {
    id: 'comp-1',
    chapter_id: chap1.id,
    code: 'PRG-1',
    name: 'Prasyarat PLDV',
    description: 'Konsep dasar persamaan linear dua variabel, eliminasi/substitusi, dan garis pembatas pada koordinat Cartesius.',
    sequence_order: 1,
    prerequisite_id: null,
    mastery_threshold: 0.80, // 80% threshold
    subtopics: subtopics.filter(s => s.competency_id === 'comp-1'),
    active: true,
    created_at: now,
    updated_at: now,
  };

  const comp2: Competency = {
    id: 'comp-2',
    chapter_id: chap1.id,
    code: 'PRG-2',
    name: 'Makna Tanda & Menggambar Grafik',
    description: 'Interpretasi tanda <, >, ≤, ≥, langkah menggambar grafik, garis putus-putus vs tegas, dan uji titik selidik.',
    sequence_order: 2,
    prerequisite_id: comp1.id,
    mastery_threshold: 0.80,
    subtopics: subtopics.filter(s => s.competency_id === 'comp-2'),
    active: true,
    created_at: now,
    updated_at: now,
  };

  const comp3: Competency = {
    id: 'comp-3',
    chapter_id: chap1.id,
    code: 'PRG-3',
    name: 'Memahami PTLDV',
    description: 'Menentukan dan menggambar daerah himpunan penyelesaian dari suatu pertidaksamaan linear dua variabel secara mandiri.',
    sequence_order: 3,
    prerequisite_id: comp2.id,
    mastery_threshold: 0.80,
    subtopics: subtopics.filter(s => s.competency_id === 'comp-3'),
    active: true,
    created_at: now,
    updated_at: now,
  };

  const comp4: Competency = {
    id: 'comp-4',
    chapter_id: chap1.id,
    code: 'PRG-4',
    name: 'Memahami SPTLDV',
    description: 'Menganalisis irisan (gabungan) daerah penyelesaian sistem pertidaksamaan linear dua variabel beserta titik pojoknya.',
    sequence_order: 4,
    prerequisite_id: comp3.id,
    mastery_threshold: 0.80,
    subtopics: subtopics.filter(s => s.competency_id === 'comp-4'),
    active: true,
    created_at: now,
    updated_at: now,
  };

  const competencies: Competency[] = [comp1, comp2, comp3, comp4];

  // Questions for each competency
  const questions: AssessmentQuestion[] = [
    // PRG-1 Questions
    {
      id: 'q-prg1-1',
      competency_id: comp1.id,
      question_text: 'Diberikan sistem persamaan linear: 2x + y = 7 dan x - y = 2. Manakah pasangan nilai (x, y) yang merupakan solusi dari sistem tersebut?',
      option_a: 'x = 3 dan y = 1',
      option_b: 'x = 4 dan y = -1',
      option_c: 'x = 2 dan y = 3',
      option_d: 'x = 1 dan y = 5',
      correct_answer: 'A',
      explanation: 'Dengan metode eliminasi/penjumlahan: (2x + y) + (x - y) = 7 + 2 => 3x = 9 => x = 3. Substitusi x = 3 ke x - y = 2 => 3 - y = 2 => y = 1. Jadi (x, y) = (3, 1).',
      question_order: 1,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'q-prg1-2',
      competency_id: comp1.id,
      question_text: 'Persamaan garis 3x + 2y = 12 memotong sumbu-X di titik A dan sumbu-Y di titik B. Koordinat titik potong A dan B berturut-turut adalah...',
      option_a: '(0, 4) dan (6, 0)',
      option_b: '(4, 0) dan (0, 6)',
      option_c: '(6, 0) dan (0, 4)',
      option_d: '(3, 0) dan (0, 2)',
      correct_answer: 'B',
      explanation: 'Titik potong sumbu-X terjadi saat y = 0: 3x = 12 => x = 4 => (4, 0). Titik potong sumbu-Y saat x = 0: 2y = 12 => y = 6 => (0, 6).',
      question_order: 2,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'q-prg1-3',
      competency_id: comp1.id,
      question_text: 'Metode yang dilakukan dengan menyatakan salah satu variabel ke dalam bentuk variabel lain kemudian menggantikannya pada persamaan kedua disebut metode...',
      option_a: 'Metode Grafik',
      option_b: 'Metode Eliminasi murni',
      option_c: 'Metode Substitusi',
      option_d: 'Metode Matriks Determinan',
      correct_answer: 'C',
      explanation: 'Metode substitusi mengganti satu variabel dengan ekspresi variabel lain dari persamaan sebelumnya.',
      question_order: 3,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'q-prg1-4',
      competency_id: comp1.id,
      question_text: 'Bentuk umum persamaan linear dua variabel dengan variabel x dan y adalah...',
      option_a: 'ax² + by = c dengan a, b ≠ 0',
      option_b: 'ax + by = c dengan a, b ∈ bilangan real dan a, b tidak keduanya nol',
      option_c: 'ax + by + cz = d',
      option_d: 'y = mx² + c',
      correct_answer: 'B',
      explanation: 'Persamaan linear berderajat 1 terhadap kedua variabelnya: ax + by = c dengan a dan b tidak keduanya nol.',
      question_order: 4,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'q-prg1-5',
      competency_id: comp1.id,
      question_text: 'Jika 4x - 3y = 10 dan y = 2, berapakah nilai x yang memenuhi persamaan tersebut?',
      option_a: 'x = 3',
      option_b: 'x = 4',
      option_c: 'x = 2',
      option_d: 'x = 5',
      correct_answer: 'B',
      explanation: '4x - 3(2) = 10 => 4x - 6 = 10 => 4x = 16 => x = 4.',
      question_order: 5,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now,
    },

    // PRG-2 Questions
    {
      id: 'q-prg2-1',
      competency_id: comp2.id,
      question_text: 'Dalam menggambar grafik daerah pertidaksamaan linear dua variabel, tanda pertidaksamaan manakah yang garis pembatasnya digambar PUTUS-PUTUS (dashed line)?',
      option_a: '≤ dan ≥',
      option_b: '< dan >',
      option_c: 'Hanya tanda ≤',
      option_d: 'Hanya tanda =',
      correct_answer: 'B',
      explanation: 'Tanda ketidaksamaan murni (< atau >) tidak menyertakan garis batas sebagai bagian dari solusi, sehingga digambarkan sebagai garis putus-putus.',
      question_order: 1,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'q-prg2-2',
      competency_id: comp2.id,
      question_text: 'Kalimat matematis: "Jumlah kapasitas penumpang (p) dan barang (b) tidak boleh melebihi 100 kg" paling tepat dinyatakan dalam simbol pertidaksamaan...',
      option_a: 'p + b > 100',
      option_b: 'p + b ≥ 100',
      option_c: 'p + b ≤ 100',
      option_d: 'p + b < 100',
      correct_answer: 'C',
      explanation: '"Tidak boleh melebihi" berarti paling banyak 100 kg, dinotasikan dengan tanda "≤" (kurang dari atau sama dengan).',
      question_order: 2,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'q-prg2-3',
      competency_id: comp2.id,
      question_text: 'Diberikan pertidaksamaan 2x + 5y ≥ 10. Ketika dilakukan uji titik selidik (0, 0), diperoleh pernyataan "0 ≥ 10". Pernyataan ini bernilai SALAH. Kesimpulannya adalah...',
      option_a: 'Titik (0, 0) berada di dalam daerah himpunan penyelesaian',
      option_b: 'Titik (0, 0) tidak termasuk dalam daerah himpunan penyelesaian, sehingga arsiran menjauhi (0, 0)',
      option_c: 'Garis batas tidak memiliki solusi',
      option_d: 'Pertidaksamaan tersebut keliru dan harus dibalik',
      correct_answer: 'B',
      explanation: 'Karena uji titik (0, 0) menghasilkan pernyataan salah, maka (0,0) bukan penyelesaian, sehingga daerah yang diarsir adalah sisi yang tidak memuat (0, 0).',
      question_order: 3,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'q-prg2-4',
      competency_id: comp2.id,
      question_text: 'Tanda "≥" dibaca secara verbal dalam bahasa Indonesia yang tepat adalah...',
      option_a: 'Kurang dari atau sama dengan',
      option_b: 'Sama dengan atau mendekati',
      option_c: 'Lebih dari atau sama dengan',
      option_d: 'Bukan bagian dari',
      correct_answer: 'C',
      explanation: 'Simbol "≥" adalah "lebih dari atau sama dengan" (at least / minimum).',
      question_order: 4,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'q-prg2-5',
      competency_id: comp2.id,
      question_text: 'Pada grafik pertidaksamaan y > 2x - 1, apakah titik (1, 1) yang terletak tepat pada garis y = 2(1) - 1 = 1 merupakan anggota himpunan penyelesaian?',
      option_a: 'Ya, karena titik tersebut tepat di garis',
      option_b: 'Tidak, karena tanda pertidaksamaan adalah ">" tegas sehingga titik pada garis batas tidak termasuk',
      option_c: 'Ya, bila x positif',
      option_d: 'Tergantung kuadran Cartesius',
      correct_answer: 'B',
      explanation: 'Pada tanda ketidaksamaan tegas ">", titik-titik pada garis batas tidak memenuhi syarat karena 1 > 1 bernilai SALAH.',
      question_order: 5,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now,
    },

    // PRG-3 Questions
    {
      id: 'q-prg3-1',
      competency_id: comp3.id,
      question_text: 'Manakah titik di bawah ini yang merupakan anggota penyelesaian dari pertidaksamaan x + 2y ≤ 8 ?',
      option_a: '(5, 3)',
      option_b: '(2, 2)',
      option_c: '(6, 2)',
      option_d: '(4, 4)',
      correct_answer: 'B',
      explanation: 'Uji titik (2, 2): 2 + 2(2) = 2 + 4 = 6 ≤ 8 (BENAR). Pilihan A: 5 + 6 = 11 > 8 (Salah). Pilihan C: 6 + 4 = 10 > 8. Pilihan D: 4 + 8 = 12 > 8.',
      question_order: 1,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'q-prg3-2',
      competency_id: comp3.id,
      question_text: 'Daerah penyelesaian pertidaksamaan 3x - 2y < 6 dengan uji titik (0, 0) menghasilkan 0 < 6 (Benar). Bagaimana posisi daerah penyelesaian tersebut terhadap garis batas?',
      option_a: 'Memuat titik (0, 0) dengan garis batas putus-putus',
      option_b: 'Tidak memuat titik (0, 0) dengan garis batas putus-putus',
      option_c: 'Memuat titik (0, 0) dengan garis batas tegas',
      option_d: 'Hanya berada di Kuadran IV',
      correct_answer: 'A',
      explanation: 'Karena 0 < 6 bernilai benar, daerah penyelesaian memuat (0, 0). Tanda < tanpa sama dengan berarti garis batas putus-putus.',
      question_order: 2,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'q-prg3-3',
      competency_id: comp3.id,
      question_text: 'Garis batas untuk pertidaksamaan -2x + y ≤ 4 akan memotong sumbu-X dan sumbu-Y di titik...',
      option_a: '(-2, 0) dan (0, 4)',
      option_b: '(2, 0) dan (0, -4)',
      option_c: '(4, 0) dan (0, -2)',
      option_d: '(-4, 0) dan (0, 2)',
      correct_answer: 'A',
      explanation: 'Saat y = 0 => -2x = 4 => x = -2, maka (-2, 0). Saat x = 0 => y = 4, maka (0, 4).',
      question_order: 3,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'q-prg3-4',
      competency_id: comp3.id,
      question_text: 'Pertidaksamaan x ≥ 0 dan y ≥ 0 dalam konteks pemodelan matematika PTLDV menyatakan bahwa...',
      option_a: 'Variabel x dan y boleh bernilai negatif',
      option_b: 'Variabel x dan y bersifat non-negatif (daerah penyelesaian terbatas di Kuadran I atau sumbu positif)',
      option_c: 'Garis batas hanya terletak di sumbu-X',
      option_d: 'Solusi hanya ada di Kuadran III',
      correct_answer: 'B',
      explanation: 'Syarat x ≥ 0 dan y ≥ 0 disebut syarat non-negatif yang memastikan solusi riil berada di Kuadran I.',
      question_order: 4,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'q-prg3-5',
      competency_id: comp3.id,
      question_text: 'Perhatikan grafik pertidaksamaan linear $2x + 3y \\ge 12$. Manakah garis pembatas dan titik potong sumbu yang tepat pada bidang Cartesius?',
      option_a: 'Garis lurus tegas yang menghubungkan titik $(6, 0)$ dan $(0, 4)$',
      option_b: 'Garis putus-putus yang menghubungkan titik $(4, 0)$ dan $(0, 6)$',
      option_c: 'Garis lurus tegas yang menghubungkan titik $(3, 0)$ dan $(0, 2)$',
      option_d: 'Garis melengkung parabola melalui $(0, 0)$',
      correct_answer: 'A',
      explanation: 'Titik potong garis pembatas $2x + 3y = 12$: saat $y = 0 \\Rightarrow x = 6$, dan saat $x = 0 \\Rightarrow y = 4$. Karena memuat tanda "$\\ge$", garis pembatas digambar berupa garis tegas.',
      image_url: 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20280%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23f8fafc%22%2F%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid%22%20width%3D%2220%22%20height%3D%2220%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M%2020%200%20L%200%200%200%2020%22%20fill%3D%22none%22%20stroke%3D%22%23e2e8f0%22%20stroke-width%3D%220.8%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23grid)%22%2F%3E%3Cline%20x1%3D%2230%22%20y1%3D%22220%22%20x2%3D%22370%22%20y2%3D%22220%22%20stroke%3D%22%23334155%22%20stroke-width%3D%222%22%2F%3E%3Cpolygon%20points%3D%22375%2C220%20365%2C215%20365%2C225%22%20fill%3D%22%23334155%22%2F%3E%3Ctext%20x%3D%22370%22%20y%3D%22238%22%20fill%3D%22%23334155%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22bold%22%3EX%3C%2Ftext%3E%3Cline%20x1%3D%2270%22%20y1%3D%22250%22%20x2%3D%2270%22%20y2%3D%2230%22%20stroke%3D%22%23334155%22%20stroke-width%3D%222%22%2F%3E%3Cpolygon%20points%3D%2270%2C25%2065%2C35%2075%2C35%22%20fill%3D%22%23334155%22%2F%3E%3Ctext%20x%3D%2255%22%20y%3D%2235%22%20fill%3D%22%23334155%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22bold%22%3EY%3C%2Ftext%3E%3Ccircle%20cx%3D%22270%22%20cy%3D%22220%22%20r%3D%225%22%20fill%3D%22%23dc2626%22%2F%3E%3Ctext%20x%3D%22255%22%20y%3D%22240%22%20fill%3D%22%23dc2626%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22bold%22%3E(6%2C%200)%3C%2Ftext%3E%3Ccircle%20cx%3D%2270%22%20cy%3D%2290%22%20r%3D%225%22%20fill%3D%22%23dc2626%22%2F%3E%3Ctext%20x%3D%2220%22%20y%3D%2295%22%20fill%3D%22%23dc2626%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22bold%22%3E(0%2C%204)%3C%2Ftext%3E%3Cline%20x1%3D%2235%22%20y1%3D%2267%22%20x2%3D%22320%22%20y2%3D%22253%22%20stroke%3D%22%23059669%22%20stroke-width%3D%223%22%2F%3E%3Ctext%20x%3D%22180%22%20y%3D%22135%22%20fill%3D%22%23065f46%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20font-weight%3D%22bold%22%20transform%3D%22rotate(33%20180%2C135)%22%3E2x%20%2B%203y%20%3D%2012%3C%2Ftext%3E%3C%2Fsvg%3E',
      image_caption: 'Gambar 1. Titik potong garis pembatas 2x + 3y = 12 pada Bidang Koordinat Cartesius',
      question_order: 5,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now,
    },

    // PRG-4 Questions
    {
      id: 'q-prg4-1',
      competency_id: comp4.id,
      question_text: 'Diberikan sistem pertidaksamaan: x + y ≤ 4, x ≥ 0, y ≥ 0. Bentuk daerah himpunan penyelesaian pada bidang Cartesius adalah...',
      option_a: 'Persegi panjang di kuadran II',
      option_b: 'Segitiga siku-siku dengan titik-titik sudut di (0,0), (4,0), dan (0,4)',
      option_c: 'Trapesium siku-siku tak hingga',
      option_d: 'Garis lurus tunggal',
      correct_answer: 'B',
      explanation: 'Daerah dibatasi oleh sumbu-X (y ≥ 0), sumbu-Y (x ≥ 0), dan garis x + y = 4 di Kuadran I, membentuk segitiga siku-siku dengan titik pojok (0,0), (4,0), dan (0,4).',
      question_order: 1,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'q-prg4-2',
      competency_id: comp4.id,
      question_text: 'Daerah himpunan penyelesaian dari suatu Sistem Pertidaksamaan Linear Dua Variabel (SPTLDV) merupakan...',
      option_a: 'Irisan (perpotongan serentak) dari seluruh daerah penyelesaian pertidaksamaan penyusunnya',
      option_b: 'Gabungan tanpa batas dari semua daerah yang tidak diarsir',
      option_c: 'Hanya satu titik potong kedua garis batas',
      option_d: 'Semua titik di luar bidang koordinat',
      correct_answer: 'A',
      explanation: 'Penyelesaian sistem adalah irisan (interseksi) dari semua pertidaksamaan anggota sistem tersebut secara bersamaan.',
      question_order: 2,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'q-prg4-3',
      competency_id: comp4.id,
      question_text: 'Dua garis batas dari suatu SPTLDV adalah x + y = 5 dan 2x + y = 7. Koordinat titik potong kedua garis pembatas tersebut adalah...',
      option_a: '(1, 4)',
      option_b: '(2, 3)',
      option_c: '(3, 2)',
      option_d: '(4, 1)',
      correct_answer: 'B',
      explanation: 'Kurangkan kedua persamaan: (2x + y) - (x + y) = 7 - 5 => x = 2. Lalu y = 5 - 2 = 3. Jadi titik potongnya adalah (2, 3).',
      question_order: 3,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'q-prg4-4',
      competency_id: comp4.id,
      question_text: 'Jika daerah penyelesaian suatu SPTLDV memiliki titik-titik pojok (0, 0), (3, 0), (2, 2), dan (0, 4), maka nilai maksimum fungsi objektif f(x, y) = 4x + 3y adalah...',
      option_a: '12',
      option_b: '14',
      option_c: '15',
      option_d: '18',
      correct_answer: 'B',
      explanation: 'Uji titik pojok: f(0,0)=0; f(3,0)=4(3)+0=12; f(2,2)=4(2)+3(2)=8+6=14; f(0,4)=4(0)+3(4)=12. Nilai maksimum adalah 14 pada titik (2, 2).',
      question_order: 4,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'q-prg4-5',
      competency_id: comp4.id,
      question_text: 'Diberikan sistem: 2x + y ≤ 6, x + 2y ≤ 6, x ≥ 0, y ≥ 0. Manakah titik uji di bawah ini yang berada di DALAM daerah penyelesaian sistem tersebut?',
      option_a: '(1, 1)',
      option_b: '(3, 3)',
      option_c: '(0, 4)',
      option_d: '(4, 0)',
      correct_answer: 'A',
      explanation: 'Uji (1, 1): 2(1)+1 = 3 ≤ 6 (Benar) dan 1+2(1) = 3 ≤ 6 (Benar). Titik (3, 3) menghasilkan 9 > 6 (Salah). Titik (0,4) menghasilkan 8 > 6. Titik (4,0) menghasilkan 8 > 6.',
      question_order: 5,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now,
    },
  ];

  // Seed Attempts & Progress to reflect realistic scenario
  // Budi Santoso:
  // - PRG-1: Attempted with 100% (5/5) => ACHIEVED
  // - PRG-2: Attempted with 60% (3/5) => DEVELOPING
  // - PRG-3: NOT_STARTED
  // - PRG-4: NOT_STARTED

  const attempt1Budi: AssessmentAttempt = {
    id: 'att-budi-1',
    student_id: studentBudi.id,
    competency_id: comp1.id,
    started_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    submitted_at: new Date(Date.now() - 86400000 * 2 + 180000).toISOString(),
    correct_count: 5,
    question_count: 5,
    percentage: 100,
    mastery_status: 'ACHIEVED',
    ai_feedback: 'Luar biasa! Pemahamanmu terhadap konsep prasyarat eliminasi, substitusi, dan bentuk umum PLDV sudah sangat matang. Kamu siap melanjutkan ke Makna Tanda Pertidaksamaan.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  };

  const attempt2Budi: AssessmentAttempt = {
    id: 'att-budi-2',
    student_id: studentBudi.id,
    competency_id: comp2.id,
    started_at: new Date(Date.now() - 86400000).toISOString(),
    submitted_at: new Date(Date.now() - 86400000 + 240000).toISOString(),
    correct_count: 3,
    question_count: 5,
    percentage: 60,
    mastery_status: 'DEVELOPING',
    ai_feedback: 'Kompetensi sedang berkembang. Kamu sudah memahami pembacaan simbol verbal, namun perlu memperkuat konsep garis putus-putus pada tanda ketidaksamaan murni (<, >) serta uji titik selidik. Jangan ragu untuk mencoba kembali!',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  };

  // Siti Rahma:
  // PRG-1 (ACHIEVED 100%), PRG-2 (ACHIEVED 80%), PRG-3 (ACHIEVED 100%), PRG-4 (DEVELOPING 60%)
  const attempt1Siti: AssessmentAttempt = {
    id: 'att-siti-1',
    student_id: studentSiti.id,
    competency_id: comp1.id,
    started_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    submitted_at: new Date(Date.now() - 86400000 * 3 + 200000).toISOString(),
    correct_count: 5,
    question_count: 5,
    percentage: 100,
    mastery_status: 'ACHIEVED',
    ai_feedback: 'Penguasaan konsep sangat baik. Siap melangkah ke tahap berikutnya.',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  };

  const attempt2Siti: AssessmentAttempt = {
    id: 'att-siti-2',
    student_id: studentSiti.id,
    competency_id: comp2.id,
    started_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    submitted_at: new Date(Date.now() - 86400000 * 2 + 190000).toISOString(),
    correct_count: 4,
    question_count: 5,
    percentage: 80,
    mastery_status: 'ACHIEVED',
    ai_feedback: 'Kompetensi tercapai pada tahap penguasaan mandiri. Siap melanjutkan ke pos berikutnya.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  };

  const attempt3Siti: AssessmentAttempt = {
    id: 'att-siti-3',
    student_id: studentSiti.id,
    competency_id: comp3.id,
    started_at: new Date(Date.now() - 86400000).toISOString(),
    submitted_at: new Date(Date.now() - 86400000 + 220000).toISOString(),
    correct_count: 5,
    question_count: 5,
    percentage: 100,
    mastery_status: 'ACHIEVED',
    ai_feedback: 'Hebat! Pemahaman daerah himpunan penyelesaian PTLDV dan uji titik selidik sangat akurat.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  };

  const attempt4Siti: AssessmentAttempt = {
    id: 'att-siti-4',
    student_id: studentSiti.id,
    competency_id: comp4.id,
    started_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    submitted_at: new Date(Date.now() - 3600000 * 5 + 300000).toISOString(),
    correct_count: 3,
    question_count: 5,
    percentage: 60,
    mastery_status: 'DEVELOPING',
    ai_feedback: 'Sedang berkembang. Teliti kembali irisan beberapa garis pembatas dan perhitungan titik potong eliminasi.',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  };

  const attempts: AssessmentAttempt[] = [
    attempt1Budi,
    attempt2Budi,
    attempt1Siti,
    attempt2Siti,
    attempt3Siti,
    attempt4Siti,
  ];

  // Competency Progress
  const competency_progress: CompetencyProgress[] = [
    // Budi
    {
      id: 'cp-budi-1',
      student_id: studentBudi.id,
      competency_id: comp1.id,
      status: 'ACHIEVED',
      last_attempt_id: attempt1Budi.id,
      last_updated_at: attempt1Budi.submitted_at,
      created_at: attempt1Budi.created_at,
      updated_at: attempt1Budi.submitted_at,
    },
    {
      id: 'cp-budi-2',
      student_id: studentBudi.id,
      competency_id: comp2.id,
      status: 'DEVELOPING',
      last_attempt_id: attempt2Budi.id,
      last_updated_at: attempt2Budi.submitted_at,
      created_at: attempt2Budi.created_at,
      updated_at: attempt2Budi.submitted_at,
    },
    {
      id: 'cp-budi-3',
      student_id: studentBudi.id,
      competency_id: comp3.id,
      status: 'NOT_STARTED',
      last_attempt_id: null,
      last_updated_at: now,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'cp-budi-4',
      student_id: studentBudi.id,
      competency_id: comp4.id,
      status: 'NOT_STARTED',
      last_attempt_id: null,
      last_updated_at: now,
      created_at: now,
      updated_at: now,
    },

    // Siti
    {
      id: 'cp-siti-1',
      student_id: studentSiti.id,
      competency_id: comp1.id,
      status: 'ACHIEVED',
      last_attempt_id: attempt1Siti.id,
      last_updated_at: attempt1Siti.submitted_at,
      created_at: attempt1Siti.created_at,
      updated_at: attempt1Siti.submitted_at,
    },
    {
      id: 'cp-siti-2',
      student_id: studentSiti.id,
      competency_id: comp2.id,
      status: 'ACHIEVED',
      last_attempt_id: attempt2Siti.id,
      last_updated_at: attempt2Siti.submitted_at,
      created_at: attempt2Siti.created_at,
      updated_at: attempt2Siti.submitted_at,
    },
    {
      id: 'cp-siti-3',
      student_id: studentSiti.id,
      competency_id: comp3.id,
      status: 'ACHIEVED',
      last_attempt_id: attempt3Siti.id,
      last_updated_at: attempt3Siti.submitted_at,
      created_at: attempt3Siti.created_at,
      updated_at: attempt3Siti.submitted_at,
    },
    {
      id: 'cp-siti-4',
      student_id: studentSiti.id,
      competency_id: comp4.id,
      status: 'DEVELOPING',
      last_attempt_id: attempt4Siti.id,
      last_updated_at: attempt4Siti.submitted_at,
      created_at: attempt4Siti.created_at,
      updated_at: attempt4Siti.submitted_at,
    },

    // Ahmad (all not started except PRG-1 developing)
    {
      id: 'cp-ahmad-1',
      student_id: studentAhmad.id,
      competency_id: comp1.id,
      status: 'DEVELOPING',
      last_attempt_id: null,
      last_updated_at: now,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'cp-ahmad-2',
      student_id: studentAhmad.id,
      competency_id: comp2.id,
      status: 'NOT_STARTED',
      last_attempt_id: null,
      last_updated_at: now,
      created_at: now,
      updated_at: now,
    },

    // Dewi (all achieved)
    {
      id: 'cp-dewi-1',
      student_id: studentDewi.id,
      competency_id: comp1.id,
      status: 'ACHIEVED',
      last_attempt_id: null,
      last_updated_at: now,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'cp-dewi-2',
      student_id: studentDewi.id,
      competency_id: comp2.id,
      status: 'ACHIEVED',
      last_attempt_id: null,
      last_updated_at: now,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'cp-dewi-3',
      student_id: studentDewi.id,
      competency_id: comp3.id,
      status: 'ACHIEVED',
      last_attempt_id: null,
      last_updated_at: now,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'cp-dewi-4',
      student_id: studentDewi.id,
      competency_id: comp4.id,
      status: 'ACHIEVED',
      last_attempt_id: null,
      last_updated_at: now,
      created_at: now,
      updated_at: now,
    },
  ];

  // Responses for attempt1Budi (5/5)
  const responses: AssessmentResponse[] = [
    {
      id: 'resp-1',
      attempt_id: attempt1Budi.id,
      student_id: studentBudi.id,
      question_id: 'q-prg1-1',
      selected_answer: 'A',
      is_correct: true,
      answered_at: attempt1Budi.submitted_at,
    },
    {
      id: 'resp-2',
      attempt_id: attempt1Budi.id,
      student_id: studentBudi.id,
      question_id: 'q-prg1-2',
      selected_answer: 'B',
      is_correct: true,
      answered_at: attempt1Budi.submitted_at,
    },
    {
      id: 'resp-3',
      attempt_id: attempt1Budi.id,
      student_id: studentBudi.id,
      question_id: 'q-prg1-3',
      selected_answer: 'C',
      is_correct: true,
      answered_at: attempt1Budi.submitted_at,
    },
    {
      id: 'resp-4',
      attempt_id: attempt1Budi.id,
      student_id: studentBudi.id,
      question_id: 'q-prg1-4',
      selected_answer: 'B',
      is_correct: true,
      answered_at: attempt1Budi.submitted_at,
    },
    {
      id: 'resp-5',
      attempt_id: attempt1Budi.id,
      student_id: studentBudi.id,
      question_id: 'q-prg1-5',
      selected_answer: 'B',
      is_correct: true,
      answered_at: attempt1Budi.submitted_at,
    },

    // Budi attempt 2 on PRG-2 (3/5)
    {
      id: 'resp-6',
      attempt_id: attempt2Budi.id,
      student_id: studentBudi.id,
      question_id: 'q-prg2-1',
      selected_answer: 'A', // Incorrect (A instead of B)
      is_correct: false,
      answered_at: attempt2Budi.submitted_at,
    },
    {
      id: 'resp-7',
      attempt_id: attempt2Budi.id,
      student_id: studentBudi.id,
      question_id: 'q-prg2-2',
      selected_answer: 'C',
      is_correct: true,
      answered_at: attempt2Budi.submitted_at,
    },
    {
      id: 'resp-8',
      attempt_id: attempt2Budi.id,
      student_id: studentBudi.id,
      question_id: 'q-prg2-3',
      selected_answer: 'A', // Incorrect (A instead of B)
      is_correct: false,
      answered_at: attempt2Budi.submitted_at,
    },
    {
      id: 'resp-9',
      attempt_id: attempt2Budi.id,
      student_id: studentBudi.id,
      question_id: 'q-prg2-4',
      selected_answer: 'C',
      is_correct: true,
      answered_at: attempt2Budi.submitted_at,
    },
    {
      id: 'resp-10',
      attempt_id: attempt2Budi.id,
      student_id: studentBudi.id,
      question_id: 'q-prg2-5',
      selected_answer: 'B',
      is_correct: true,
      answered_at: attempt2Budi.submitted_at,
    },
  ];

  const audit_logs: AuditLog[] = [
    {
      id: 'log-1',
      timestamp: now,
      actor_user_id: userTeacher.id,
      actor_name: userTeacher.name,
      actor_role: 'teacher',
      action: 'SYSTEM_INIT',
      details: { message: 'Inisialisasi sistem Personal Learning Journey dan modul Matematika SPLDV/SPTLDV' },
    },
  ];

  const reflections: StudentReflection[] = [
    {
      id: 'refl-budi-1',
      student_id: studentBudi.id,
      competency_id: comp2.id,
      mindset_feeling: 'Ragu tapi Mau Berusaha',
      challenge_description: 'Masih sering terbalik membedakan kapan garis batas harus putus-putus atau garis tegas saat uji titik selidik.',
      action_plan: [
        'Mengkaji kembali catatan uji titik (0,0)',
        'Membuat rangkuman visual perbedaan tanda <, > vs ≤, ≥',
        'Mencoba 2 latihan mandiri sebelum tes ulang'
      ],
      custom_action_text: 'Saya menggambar ulang grafik contoh soal untuk memastikan letak daerah arsiran.',
      readiness_level: 4,
      ai_coaching_feedback: 'Langkah refleksi yang luar biasa, Budi! Menyadari kebingungan pada garis putus-putus vs tegas adalah awal penguasaan sejati. Otakmu sedang bertumbuh!',
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
  ];

  return {
    users,
    students,
    chapters,
    competencies,
    subtopics,
    competency_progress,
    questions,
    attempts,
    responses,
    audit_logs,
    reflections,
  };
}

function normalizeSchema(parsed: DatabaseSchema): DatabaseSchema {
  if (!parsed.reflections) parsed.reflections = [];
  if (!parsed.audit_logs) parsed.audit_logs = [];
  if (!parsed.chapters || parsed.chapters.length === 0 || !parsed.subtopics || parsed.subtopics.length === 0) {
    const seed = generateInitialSeed();
    parsed.chapters = seed.chapters;
    parsed.subtopics = seed.subtopics;
    for (const c of parsed.competencies) {
      if (!c.chapter_id) c.chapter_id = 'chap-1';
      c.subtopics = parsed.subtopics.filter((s: Subtopic) => s.competency_id === c.id);
    }
    for (const q of parsed.questions) {
      if (!q.chapter_id) q.chapter_id = 'chap-1';
      const seedQ = seed.questions.find((sq: AssessmentQuestion) => sq.id === q.id);
      if (seedQ) {
        q.subtopic_id = seedQ.subtopic_id;
        q.subtopic_title = seedQ.subtopic_title;
      }
    }
  }
  return parsed;
}

class Database {
  private data: DatabaseSchema;
  private initPromise: Promise<void>;
  private writeChain: Promise<void> = Promise.resolve();

  constructor() {
    this.data = generateInitialSeed();
    this.initPromise = this.initialize();
  }

  public async ready(): Promise<void> {
    await this.initPromise;
    await this.writeChain;
  }

  private async initialize(): Promise<void> {
    if (isPostgresEnabled()) {
      const loaded = await loadState();
      if (loaded && typeof loaded === 'object') {
        this.data = normalizeSchema(loaded as DatabaseSchema);
        console.log('[DB] Loaded state from Postgres (Neon).');
        return;
      }
      this.data = generateInitialSeed();
      await saveState(this.data);
      console.log('[DB] Seeded new state into Postgres (Neon).');
      return;
    }

    this.data = this.loadDataFromFile();
    console.log('[DB] Using local JSON file store.');
  }

  private loadDataFromFile(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = normalizeSchema(JSON.parse(raw) as DatabaseSchema);
        this.saveToFile(parsed);
        return parsed;
      }
    } catch (e) {
      console.warn('Gagal membaca DB file, membuat database baru:', e);
    }
    const seed = generateInitialSeed();
    this.saveToFile(seed);
    return seed;
  }

  private saveToFile(data?: DatabaseSchema): void {
    if (data) {
      this.data = data;
    }
    try {
      const tempPath = `${DB_FILE}.${Date.now()}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Error saving database file:', err);
    }
  }

  public saveData(data?: DatabaseSchema): void {
    if (data) {
      this.data = data;
    }
    if (!isPostgresEnabled()) {
      this.saveToFile();
      return;
    }
    const snapshot = this.data;
    this.writeChain = this.writeChain
      .then(() => saveState(snapshot))
      .catch((err) => {
        console.error('Error saving database to Postgres:', err);
      });
  }

  public resetToSeed(): void {
    const seed = generateInitialSeed();
    this.saveData(seed);
  }

  // --- Users & Students ---
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public updateUserRole(userId: string, newRole: 'student' | 'teacher' | 'admin'): User | undefined {
    const user = this.getUserById(userId);
    if (!user) return undefined;

    user.role = newRole;
    user.updated_at = new Date().toISOString();

    // If assigned to student and doesn't have student record, create one
    if (newRole === 'student') {
      const existingStudent = this.getStudentByUserId(userId);
      if (!existingStudent) {
        const newStudent: Student = {
          id: `std-${crypto.randomUUID()}`,
          user_id: user.id,
          full_name: user.name,
          email: user.email,
          grade: 'Kelas X',
          class_name: 'X-MIPA 1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        this.data.students.push(newStudent);
      }
    }

    this.saveData();
    return user;
  }

  public updateUser(
    userId: string,
    params: {
      name?: string;
      email?: string;
      role?: 'student' | 'teacher' | 'admin';
      password?: string;
      grade?: string;
      class_name?: string;
    }
  ): User | undefined {
    const user = this.getUserById(userId);
    if (!user) return undefined;

    const now = new Date().toISOString();
    if (params.name) user.name = params.name.trim();
    if (params.email) user.email = params.email.trim().toLowerCase();
    if (params.password) user.password = params.password;
    if (params.role) user.role = params.role;
    user.updated_at = now;

    let std = this.getStudentByUserId(userId);
    if (user.role === 'student') {
      if (!std) {
        std = {
          id: `std-${crypto.randomUUID()}`,
          user_id: user.id,
          full_name: user.name,
          email: user.email,
          grade: params.grade || 'Kelas X',
          class_name: params.class_name || 'X-MIPA 1',
          created_at: now,
          updated_at: now,
        };
        this.data.students.push(std);
      } else {
        if (params.name) std.full_name = params.name.trim();
        if (params.email) std.email = params.email.trim().toLowerCase();
        if (params.grade) std.grade = params.grade;
        if (params.class_name) std.class_name = params.class_name;
        std.updated_at = now;
      }
    } else if (std) {
      if (params.name) std.full_name = params.name.trim();
      if (params.email) std.email = params.email.trim().toLowerCase();
      std.updated_at = now;
    }

    this.saveData();
    return user;
  }

  public createUser(params: {
    name: string;
    email: string;
    role: 'student' | 'teacher' | 'admin';
    password?: string;
    grade?: string;
    class_name?: string;
  }): User {
    const now = new Date().toISOString();
    const newUser: User = {
      id: `u-${crypto.randomUUID()}`,
      name: params.name,
      email: params.email,
      role: params.role,
      password: params.password || 'password123',
      created_at: now,
      updated_at: now,
    };
    this.data.users.push(newUser);

    if (params.role === 'student') {
      const newStudent: Student = {
        id: `std-${crypto.randomUUID()}`,
        user_id: newUser.id,
        full_name: newUser.name,
        email: newUser.email,
        grade: params.grade || 'Kelas X',
        class_name: params.class_name || 'X-MIPA 1',
        created_at: now,
        updated_at: now,
      };
      this.data.students.push(newStudent);
    }

    this.saveData();
    return newUser;
  }

  public resetUserPassword(userId: string, newPassword?: string): boolean {
    const user = this.getUserById(userId);
    if (!user) return false;
    user.password = newPassword || 'password123';
    user.updated_at = new Date().toISOString();
    this.saveData();
    return true;
  }

  public getStudents(): Student[] {
    return this.data.students;
  }

  public getStudentById(id: string): Student | undefined {
    return this.data.students.find(s => s.id === id);
  }

  public getStudentByUserId(userId: string): Student | undefined {
    return this.data.students.find(s => s.user_id === userId);
  }

  // --- Chapters (Bab Kurikulum) ---
  public getChapters(onlyActive: boolean = false): Chapter[] {
    if (!this.data.chapters) this.data.chapters = [];
    return [...this.data.chapters]
      .filter(ch => onlyActive ? ch.active : true)
      .sort((a, b) => a.sequence_order - b.sequence_order);
  }

  public getChapterById(id: string): Chapter | undefined {
    if (!this.data.chapters) this.data.chapters = [];
    return this.data.chapters.find(ch => ch.id === id);
  }

  public createChapter(chapter: Omit<Chapter, 'id' | 'created_at' | 'updated_at'>): Chapter {
    if (!this.data.chapters) this.data.chapters = [];
    const now = new Date().toISOString();
    const newChapter: Chapter = {
      ...chapter,
      id: `chap-${crypto.randomUUID()}`,
      created_at: now,
      updated_at: now,
    };
    this.data.chapters.push(newChapter);
    this.saveData();
    return newChapter;
  }

  public updateChapter(id: string, updates: Partial<Chapter>): Chapter | undefined {
    const chapter = this.getChapterById(id);
    if (!chapter) return undefined;
    Object.assign(chapter, updates, { updated_at: new Date().toISOString() });
    this.saveData();
    return chapter;
  }

  // --- Subtopics (Langkah Rinci Belajar / Micro-Skills) ---
  public getSubtopics(competencyId?: string): Subtopic[] {
    if (!this.data.subtopics) this.data.subtopics = [];
    return this.data.subtopics
      .filter(s => competencyId ? s.competency_id === competencyId : true)
      .sort((a, b) => a.sequence_order - b.sequence_order);
  }

  public getSubtopicById(id: string): Subtopic | undefined {
    if (!this.data.subtopics) this.data.subtopics = [];
    return this.data.subtopics.find(s => s.id === id);
  }

  public createSubtopic(subtopic: Omit<Subtopic, 'id'>): Subtopic {
    if (!this.data.subtopics) this.data.subtopics = [];
    const newSubtopic: Subtopic = {
      ...subtopic,
      id: `sub-${crypto.randomUUID()}`,
    };
    this.data.subtopics.push(newSubtopic);

    // Also update parent competency's subtopics list
    const comp = this.getCompetencyById(subtopic.competency_id);
    if (comp) {
      if (!comp.subtopics) comp.subtopics = [];
      comp.subtopics.push(newSubtopic);
    }

    this.saveData();
    return newSubtopic;
  }

  public updateSubtopic(id: string, updates: Partial<Subtopic>): Subtopic | undefined {
    const sub = this.getSubtopicById(id);
    if (!sub) return undefined;
    Object.assign(sub, updates);

    // Sync in competency
    const comp = this.getCompetencyById(sub.competency_id);
    if (comp && comp.subtopics) {
      const idx = comp.subtopics.findIndex(s => s.id === id);
      if (idx !== -1) Object.assign(comp.subtopics[idx], updates);
    }

    this.saveData();
    return sub;
  }

  // --- Competencies ---
  public getCompetencies(): Competency[] {
    return [...this.data.competencies].sort((a, b) => a.sequence_order - b.sequence_order);
  }

  public getCompetencyById(id: string): Competency | undefined {
    return this.data.competencies.find(c => c.id === id);
  }

  public createCompetency(comp: Omit<Competency, 'id' | 'created_at' | 'updated_at'>): Competency {
    const now = new Date().toISOString();
    const newComp: Competency = {
      ...comp,
      id: `comp-${crypto.randomUUID()}`,
      created_at: now,
      updated_at: now,
    };
    this.data.competencies.push(newComp);
    this.saveData();
    return newComp;
  }

  public updateCompetency(id: string, updates: Partial<Competency>): Competency | undefined {
    const comp = this.getCompetencyById(id);
    if (!comp) return undefined;
    Object.assign(comp, updates, { updated_at: new Date().toISOString() });
    this.saveData();
    return comp;
  }

  // --- Questions ---
  public getQuestions(competencyId?: string, onlyActive: boolean = true, chapterId?: string, subtopicId?: string): AssessmentQuestion[] {
    return this.data.questions.filter(q => {
      if (competencyId && q.competency_id !== competencyId) return false;
      if (chapterId && q.chapter_id && q.chapter_id !== chapterId) return false;
      if (subtopicId && q.subtopic_id !== subtopicId) return false;
      if (onlyActive && !q.active) return false;
      return true;
    }).sort((a, b) => a.question_order - b.question_order);
  }

  public getQuestionById(id: string): AssessmentQuestion | undefined {
    return this.data.questions.find(q => q.id === id);
  }

  public createQuestion(q: Omit<AssessmentQuestion, 'id' | 'created_at' | 'updated_at'>): AssessmentQuestion {
    const now = new Date().toISOString();
    const newQ: AssessmentQuestion = {
      ...q,
      id: `q-${crypto.randomUUID()}`,
      created_at: now,
      updated_at: now,
    };
    this.data.questions.push(newQ);
    this.saveData();
    return newQ;
  }

  public updateQuestion(id: string, updates: Partial<AssessmentQuestion>): AssessmentQuestion | undefined {
    const q = this.getQuestionById(id);
    if (!q) return undefined;
    Object.assign(q, updates, { updated_at: new Date().toISOString() });
    this.saveData();
    return q;
  }

  public archiveQuestion(id: string): boolean {
    const q = this.getQuestionById(id);
    if (!q) return false;
    q.active = false;
    q.updated_at = new Date().toISOString();
    this.saveData();
    return true;
  }

  // --- Progress ---
  public getCompetencyProgress(studentId: string, competencyId?: string): CompetencyProgress[] {
    return this.data.competency_progress.filter(cp => {
      if (cp.student_id !== studentId) return false;
      if (competencyId && cp.competency_id !== competencyId) return false;
      return true;
    });
  }

  public getSingleCompetencyProgress(studentId: string, competencyId: string): CompetencyProgress | undefined {
    return this.data.competency_progress.find(
      cp => cp.student_id === studentId && cp.competency_id === competencyId
    );
  }

  public upsertCompetencyProgress(
    studentId: string,
    competencyId: string,
    status: 'NOT_STARTED' | 'DEVELOPING' | 'ACHIEVED',
    lastAttemptId?: string
  ): CompetencyProgress {
    const now = new Date().toISOString();
    let record = this.getSingleCompetencyProgress(studentId, competencyId);
    if (record) {
      record.status = status;
      if (lastAttemptId) record.last_attempt_id = lastAttemptId;
      record.last_updated_at = now;
      record.updated_at = now;
    } else {
      record = {
        id: `cp-${crypto.randomUUID()}`,
        student_id: studentId,
        competency_id: competencyId,
        status,
        last_attempt_id: lastAttemptId || null,
        last_updated_at: now,
        created_at: now,
        updated_at: now,
      };
      this.data.competency_progress.push(record);
    }
    this.saveData();
    return record;
  }

  // --- Attempts & Responses ---
  public getAttempts(studentId?: string, competencyId?: string): AssessmentAttempt[] {
    return this.data.attempts.filter(a => {
      if (studentId && a.student_id !== studentId) return false;
      if (competencyId && a.competency_id !== competencyId) return false;
      return true;
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getAttemptById(id: string): AssessmentAttempt | undefined {
    return this.data.attempts.find(a => a.id === id);
  }

  public createAttempt(attempt: Omit<AssessmentAttempt, 'id' | 'created_at'>): AssessmentAttempt {
    const now = new Date().toISOString();
    const newAttempt: AssessmentAttempt = {
      ...attempt,
      id: `att-${crypto.randomUUID()}`,
      created_at: now,
    };
    this.data.attempts.push(newAttempt);
    this.saveData();
    return newAttempt;
  }

  public updateAttempt(id: string, updates: Partial<AssessmentAttempt>): AssessmentAttempt | undefined {
    const att = this.getAttemptById(id);
    if (!att) return undefined;
    Object.assign(att, updates);
    this.saveData();
    return att;
  }

  public getResponsesByAttemptId(attemptId: string): AssessmentResponse[] {
    return this.data.responses.filter(r => r.attempt_id === attemptId);
  }

  public createResponses(responsesList: Omit<AssessmentResponse, 'id'>[]): AssessmentResponse[] {
    const created: AssessmentResponse[] = responsesList.map(r => ({
      ...r,
      id: `resp-${crypto.randomUUID()}`,
    }));
    this.data.responses.push(...created);
    this.saveData();
    return created;
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLog[] {
    return [...this.data.audit_logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public addAuditLog(actorUserId: string, actorName: string, actorRole: any, action: string, details: Record<string, unknown>): AuditLog {
    const log: AuditLog = {
      id: `log-${crypto.randomUUID()}`,
      timestamp: new Date().toISOString(),
      actor_user_id: actorUserId,
      actor_name: actorName,
      actor_role: actorRole,
      action,
      details,
    };
    this.data.audit_logs.push(log);
    this.saveData();
    return log;
  }

  public getReflections(studentId?: string): StudentReflection[] {
    if (!this.data.reflections) this.data.reflections = [];
    return this.data.reflections
      .filter(r => (studentId ? r.student_id === studentId : true))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public createReflection(reflection: Omit<StudentReflection, 'id' | 'created_at'>): StudentReflection {
    if (!this.data.reflections) this.data.reflections = [];
    const now = new Date().toISOString();
    const newRefl: StudentReflection = {
      ...reflection,
      id: `refl-${crypto.randomUUID()}`,
      created_at: now,
    };
    this.data.reflections.push(newRefl);
    this.saveData();
    return newRefl;
  }

  public updateReflectionTeacherNote(id: string, note: string, teacherName: string): StudentReflection | null {
    if (!this.data.reflections) this.data.reflections = [];
    const idx = this.data.reflections.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.data.reflections[idx].teacher_note = note;
    this.data.reflections[idx].teacher_note_by = teacherName;
    this.data.reflections[idx].teacher_note_at = new Date().toISOString();
    this.saveData();
    return this.data.reflections[idx];
  }

  public getRawData(): DatabaseSchema {
    return this.data;
  }
}

export const db = new Database();
