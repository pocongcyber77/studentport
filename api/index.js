// server/load-env.ts
import { config } from "dotenv";
config({ path: ".env.local" });
config();

// server/api-app.ts
import express from "express";

// server/routes/auth.ts
import { Router } from "express";

// server/db.ts
import fs from "fs";
import path from "path";
import crypto from "crypto";

// server/persist.ts
import pg from "pg";
var STATE_ID = "default";
var pool = null;
function isPostgresEnabled() {
  return Boolean(process.env.DATABASE_URL);
}
async function getPool() {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) {
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
      max: 5,
      connectionTimeoutMillis: 1e4,
      idleTimeoutMillis: 1e4
    });
  }
  return pool;
}
async function ensureSchema() {
  const db2 = await getPool();
  if (!db2) return;
  await db2.query(`
    CREATE TABLE IF NOT EXISTS app_state (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}
async function loadState() {
  const db2 = await getPool();
  if (!db2) return null;
  await ensureSchema();
  const result = await db2.query(
    "SELECT data FROM app_state WHERE id = $1",
    [STATE_ID]
  );
  return result.rows[0]?.data ?? null;
}
async function saveState(data) {
  const db2 = await getPool();
  if (!db2) return;
  await ensureSchema();
  await db2.query(
    `INSERT INTO app_state (id, data, updated_at)
     VALUES ($1, $2::jsonb, NOW())
     ON CONFLICT (id)
     DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
    [STATE_ID, JSON.stringify(data)]
  );
}
async function pingDatabase() {
  const db2 = await getPool();
  if (!db2) return false;
  await db2.query("SELECT 1");
  return true;
}

// server/db.ts
var DATA_DIR = path.resolve(process.cwd(), "data");
var DB_FILE = path.join(DATA_DIR, "learning_journey_db.json");
function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {
    console.warn("[DB] Could not create data directory (read-only env?):", e);
  }
}
function generateInitialSeed() {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const userTeacher = {
    id: "u-teacher-1",
    email: "guru.ratna@sekolah.id",
    name: "Ibu Ratna Dewi, M.Pd.",
    role: "teacher",
    password: "password123",
    avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    created_at: now,
    updated_at: now
  };
  const userAdmin = {
    id: "u-admin-1",
    email: "admin@sekolah.id",
    name: "Admin Kurikulum",
    role: "admin",
    password: "password123",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    created_at: now,
    updated_at: now
  };
  const userBudi = {
    id: "u-student-1",
    email: "budi@sekolah.id",
    name: "Budi Santoso",
    role: "student",
    password: "password123",
    avatar_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    created_at: now,
    updated_at: now
  };
  const userSiti = {
    id: "u-student-2",
    email: "siti@sekolah.id",
    name: "Siti Rahma",
    role: "student",
    password: "password123",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    created_at: now,
    updated_at: now
  };
  const userAhmad = {
    id: "u-student-3",
    email: "ahmad@sekolah.id",
    name: "Ahmad Fauzi",
    role: "student",
    password: "password123",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    created_at: now,
    updated_at: now
  };
  const userDewi = {
    id: "u-student-4",
    email: "dewi@sekolah.id",
    name: "Dewi Lestari",
    role: "student",
    password: "password123",
    avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    created_at: now,
    updated_at: now
  };
  const users = [userTeacher, userAdmin, userBudi, userSiti, userAhmad, userDewi];
  const studentBudi = {
    id: "std-1",
    user_id: userBudi.id,
    full_name: "Budi Santoso",
    email: userBudi.email,
    grade: "Kelas X",
    class_name: "X-MIPA 1",
    created_at: now,
    updated_at: now
  };
  const studentSiti = {
    id: "std-2",
    user_id: userSiti.id,
    full_name: "Siti Rahma",
    email: userSiti.email,
    grade: "Kelas X",
    class_name: "X-MIPA 1",
    created_at: now,
    updated_at: now
  };
  const studentAhmad = {
    id: "std-3",
    user_id: userAhmad.id,
    full_name: "Ahmad Fauzi",
    email: userAhmad.email,
    grade: "Kelas X",
    class_name: "X-MIPA 1",
    created_at: now,
    updated_at: now
  };
  const studentDewi = {
    id: "std-4",
    user_id: userDewi.id,
    full_name: "Dewi Lestari",
    email: userDewi.email,
    grade: "Kelas X",
    class_name: "X-MIPA 2",
    created_at: now,
    updated_at: now
  };
  const students = [studentBudi, studentSiti, studentAhmad, studentDewi];
  const chap1 = {
    id: "chap-1",
    code: "BAB-1",
    title: "Program Linear Dua Variabel",
    description: "Sistem pertidaksamaan linear, grafik daerah himpunan penyelesaian, uji titik selidik, dan model optimasi nilai fungsi objektif.",
    sequence_order: 1,
    active: true,
    created_at: now,
    updated_at: now
  };
  const chap2 = {
    id: "chap-2",
    code: "BAB-2",
    title: "Matriks & Transformasi Aljabar",
    description: "Pengantar ordo matriks, kesamaan matriks, operasi penjumlahan/perkalian matriks, determinan, dan invers matriks.",
    sequence_order: 2,
    active: true,
    created_at: now,
    updated_at: now
  };
  const chapters = [chap1, chap2];
  const subtopics = [
    // PRG-1 Subtopik
    {
      id: "sub-1-1",
      competency_id: "comp-1",
      code: "1.1",
      title: "Metode Eliminasi & Substitusi SPLDV",
      remedial_guide: "Samakan koefisien variabel sasaran dengan perkalian konstanta sebelum menjumlah/mengurangkan persamaan.",
      sequence_order: 1
    },
    {
      id: "sub-1-2",
      competency_id: "comp-1",
      code: "1.2",
      title: "Menentukan Titik Potong Garis Linear pada Bidang Cartesius",
      remedial_guide: "Cari titik potong sumbu: jadikan x = 0 untuk sumbu Y, dan jadikan y = 0 untuk sumbu X.",
      sequence_order: 2
    },
    // PRG-2 Subtopik (Langkah Menggambar Grafik Pertidaksamaan)
    {
      id: "sub-2-1",
      competency_id: "comp-2",
      code: "2.1",
      title: "Menentukan Titik Potong Sumbu X dan Sumbu Y",
      remedial_guide: "Buat tabel koordinat: cari nilai y saat x = 0, lalu cari nilai x saat y = 0 untuk menentukan dua titik garis pembatas.",
      sequence_order: 1
    },
    {
      id: "sub-2-2",
      competency_id: "comp-2",
      code: "2.2",
      title: "Pemilihan Jenis Garis Pembatas (Putus-putus vs Tegas)",
      remedial_guide: "Perhatikan tanda: gunakan garis putus-putus untuk tanda ketidaksamaan murni (< atau >) dan garis tegas untuk tanda memuat sama dengan (\u2264 atau \u2265).",
      sequence_order: 2
    },
    {
      id: "sub-2-3",
      competency_id: "comp-2",
      code: "2.3",
      title: "Uji Titik Selidik (0,0) untuk Penentuan Arah Arsiran",
      remedial_guide: "Substitusi titik (0,0) ke pertidaksamaan. Jika hasilnya BENAR, arsir daerah yang memuat titik (0,0). Jika SALAH, arsir daerah seberang.",
      sequence_order: 3
    },
    {
      id: "sub-2-4",
      competency_id: "comp-2",
      code: "2.4",
      title: "Interpretasi Verbal Simbol Pertidaksamaan (\u2264, \u2265, <, >)",
      remedial_guide: 'Kata "maksimum / tidak boleh lebih dari" setara dengan \u2264. Kata "minimum / paling sedikit" setara dengan \u2265.',
      sequence_order: 4
    },
    // PRG-3 Subtopik
    {
      id: "sub-3-1",
      competency_id: "comp-3",
      code: "3.1",
      title: "Menggambar Garis dan Daerah Bersih DHP",
      remedial_guide: "Tarik garis lurus melewati dua titik potong sumbu koordinat lalu arsirlah daerah yang bernilai benar.",
      sequence_order: 1
    },
    {
      id: "sub-3-2",
      competency_id: "comp-3",
      code: "3.2",
      title: "Mengecek Keanggotaan Titik Uji pada Himpunan Penyelesaian",
      remedial_guide: "Masukkan absis (x) dan ordinat (y) titik uji ke dalam pertidaksamaan, periksa apakah bernilai valid.",
      sequence_order: 2
    },
    // PRG-4 Subtopik
    {
      id: "sub-4-1",
      competency_id: "comp-4",
      code: "4.1",
      title: "Menentukan Irisan Gabungan Daerah SPTLDV",
      remedial_guide: "Gambarlah seluruh garis pembatas dalam satu bidang koordinat lalu cari daerah yang terkena irisan semua syarat.",
      sequence_order: 1
    },
    {
      id: "sub-4-2",
      competency_id: "comp-4",
      code: "4.2",
      title: "Menentukan Titik-Titik Pojok Daerah Penyelesaian",
      remedial_guide: "Titik pojok adalah titik potong antar garis batas pembatas DHP. Hitung koordinatnya menggunakan metode eliminasi/substitusi.",
      sequence_order: 2
    }
  ];
  const comp1 = {
    id: "comp-1",
    chapter_id: chap1.id,
    code: "PRG-1",
    name: "Prasyarat PLDV",
    description: "Konsep dasar persamaan linear dua variabel, eliminasi/substitusi, dan garis pembatas pada koordinat Cartesius.",
    sequence_order: 1,
    prerequisite_id: null,
    mastery_threshold: 0.8,
    // 80% threshold
    subtopics: subtopics.filter((s) => s.competency_id === "comp-1"),
    active: true,
    created_at: now,
    updated_at: now
  };
  const comp2 = {
    id: "comp-2",
    chapter_id: chap1.id,
    code: "PRG-2",
    name: "Makna Tanda & Menggambar Grafik",
    description: "Interpretasi tanda <, >, \u2264, \u2265, langkah menggambar grafik, garis putus-putus vs tegas, dan uji titik selidik.",
    sequence_order: 2,
    prerequisite_id: comp1.id,
    mastery_threshold: 0.8,
    subtopics: subtopics.filter((s) => s.competency_id === "comp-2"),
    active: true,
    created_at: now,
    updated_at: now
  };
  const comp3 = {
    id: "comp-3",
    chapter_id: chap1.id,
    code: "PRG-3",
    name: "Memahami PTLDV",
    description: "Menentukan dan menggambar daerah himpunan penyelesaian dari suatu pertidaksamaan linear dua variabel secara mandiri.",
    sequence_order: 3,
    prerequisite_id: comp2.id,
    mastery_threshold: 0.8,
    subtopics: subtopics.filter((s) => s.competency_id === "comp-3"),
    active: true,
    created_at: now,
    updated_at: now
  };
  const comp4 = {
    id: "comp-4",
    chapter_id: chap1.id,
    code: "PRG-4",
    name: "Memahami SPTLDV",
    description: "Menganalisis irisan (gabungan) daerah penyelesaian sistem pertidaksamaan linear dua variabel beserta titik pojoknya.",
    sequence_order: 4,
    prerequisite_id: comp3.id,
    mastery_threshold: 0.8,
    subtopics: subtopics.filter((s) => s.competency_id === "comp-4"),
    active: true,
    created_at: now,
    updated_at: now
  };
  const competencies = [comp1, comp2, comp3, comp4];
  const questions = [
    // PRG-1 Questions
    {
      id: "q-prg1-1",
      competency_id: comp1.id,
      question_text: "Diberikan sistem persamaan linear: 2x + y = 7 dan x - y = 2. Manakah pasangan nilai (x, y) yang merupakan solusi dari sistem tersebut?",
      option_a: "x = 3 dan y = 1",
      option_b: "x = 4 dan y = -1",
      option_c: "x = 2 dan y = 3",
      option_d: "x = 1 dan y = 5",
      correct_answer: "A",
      explanation: "Dengan metode eliminasi/penjumlahan: (2x + y) + (x - y) = 7 + 2 => 3x = 9 => x = 3. Substitusi x = 3 ke x - y = 2 => 3 - y = 2 => y = 1. Jadi (x, y) = (3, 1).",
      question_order: 1,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now
    },
    {
      id: "q-prg1-2",
      competency_id: comp1.id,
      question_text: "Persamaan garis 3x + 2y = 12 memotong sumbu-X di titik A dan sumbu-Y di titik B. Koordinat titik potong A dan B berturut-turut adalah...",
      option_a: "(0, 4) dan (6, 0)",
      option_b: "(4, 0) dan (0, 6)",
      option_c: "(6, 0) dan (0, 4)",
      option_d: "(3, 0) dan (0, 2)",
      correct_answer: "B",
      explanation: "Titik potong sumbu-X terjadi saat y = 0: 3x = 12 => x = 4 => (4, 0). Titik potong sumbu-Y saat x = 0: 2y = 12 => y = 6 => (0, 6).",
      question_order: 2,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now
    },
    {
      id: "q-prg1-3",
      competency_id: comp1.id,
      question_text: "Metode yang dilakukan dengan menyatakan salah satu variabel ke dalam bentuk variabel lain kemudian menggantikannya pada persamaan kedua disebut metode...",
      option_a: "Metode Grafik",
      option_b: "Metode Eliminasi murni",
      option_c: "Metode Substitusi",
      option_d: "Metode Matriks Determinan",
      correct_answer: "C",
      explanation: "Metode substitusi mengganti satu variabel dengan ekspresi variabel lain dari persamaan sebelumnya.",
      question_order: 3,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now
    },
    {
      id: "q-prg1-4",
      competency_id: comp1.id,
      question_text: "Bentuk umum persamaan linear dua variabel dengan variabel x dan y adalah...",
      option_a: "ax\xB2 + by = c dengan a, b \u2260 0",
      option_b: "ax + by = c dengan a, b \u2208 bilangan real dan a, b tidak keduanya nol",
      option_c: "ax + by + cz = d",
      option_d: "y = mx\xB2 + c",
      correct_answer: "B",
      explanation: "Persamaan linear berderajat 1 terhadap kedua variabelnya: ax + by = c dengan a dan b tidak keduanya nol.",
      question_order: 4,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now
    },
    {
      id: "q-prg1-5",
      competency_id: comp1.id,
      question_text: "Jika 4x - 3y = 10 dan y = 2, berapakah nilai x yang memenuhi persamaan tersebut?",
      option_a: "x = 3",
      option_b: "x = 4",
      option_c: "x = 2",
      option_d: "x = 5",
      correct_answer: "B",
      explanation: "4x - 3(2) = 10 => 4x - 6 = 10 => 4x = 16 => x = 4.",
      question_order: 5,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now
    },
    // PRG-2 Questions
    {
      id: "q-prg2-1",
      competency_id: comp2.id,
      question_text: "Dalam menggambar grafik daerah pertidaksamaan linear dua variabel, tanda pertidaksamaan manakah yang garis pembatasnya digambar PUTUS-PUTUS (dashed line)?",
      option_a: "\u2264 dan \u2265",
      option_b: "< dan >",
      option_c: "Hanya tanda \u2264",
      option_d: "Hanya tanda =",
      correct_answer: "B",
      explanation: "Tanda ketidaksamaan murni (< atau >) tidak menyertakan garis batas sebagai bagian dari solusi, sehingga digambarkan sebagai garis putus-putus.",
      question_order: 1,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now
    },
    {
      id: "q-prg2-2",
      competency_id: comp2.id,
      question_text: 'Kalimat matematis: "Jumlah kapasitas penumpang (p) dan barang (b) tidak boleh melebihi 100 kg" paling tepat dinyatakan dalam simbol pertidaksamaan...',
      option_a: "p + b > 100",
      option_b: "p + b \u2265 100",
      option_c: "p + b \u2264 100",
      option_d: "p + b < 100",
      correct_answer: "C",
      explanation: '"Tidak boleh melebihi" berarti paling banyak 100 kg, dinotasikan dengan tanda "\u2264" (kurang dari atau sama dengan).',
      question_order: 2,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now
    },
    {
      id: "q-prg2-3",
      competency_id: comp2.id,
      question_text: 'Diberikan pertidaksamaan 2x + 5y \u2265 10. Ketika dilakukan uji titik selidik (0, 0), diperoleh pernyataan "0 \u2265 10". Pernyataan ini bernilai SALAH. Kesimpulannya adalah...',
      option_a: "Titik (0, 0) berada di dalam daerah himpunan penyelesaian",
      option_b: "Titik (0, 0) tidak termasuk dalam daerah himpunan penyelesaian, sehingga arsiran menjauhi (0, 0)",
      option_c: "Garis batas tidak memiliki solusi",
      option_d: "Pertidaksamaan tersebut keliru dan harus dibalik",
      correct_answer: "B",
      explanation: "Karena uji titik (0, 0) menghasilkan pernyataan salah, maka (0,0) bukan penyelesaian, sehingga daerah yang diarsir adalah sisi yang tidak memuat (0, 0).",
      question_order: 3,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now
    },
    {
      id: "q-prg2-4",
      competency_id: comp2.id,
      question_text: 'Tanda "\u2265" dibaca secara verbal dalam bahasa Indonesia yang tepat adalah...',
      option_a: "Kurang dari atau sama dengan",
      option_b: "Sama dengan atau mendekati",
      option_c: "Lebih dari atau sama dengan",
      option_d: "Bukan bagian dari",
      correct_answer: "C",
      explanation: 'Simbol "\u2265" adalah "lebih dari atau sama dengan" (at least / minimum).',
      question_order: 4,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now
    },
    {
      id: "q-prg2-5",
      competency_id: comp2.id,
      question_text: "Pada grafik pertidaksamaan y > 2x - 1, apakah titik (1, 1) yang terletak tepat pada garis y = 2(1) - 1 = 1 merupakan anggota himpunan penyelesaian?",
      option_a: "Ya, karena titik tersebut tepat di garis",
      option_b: 'Tidak, karena tanda pertidaksamaan adalah ">" tegas sehingga titik pada garis batas tidak termasuk',
      option_c: "Ya, bila x positif",
      option_d: "Tergantung kuadran Cartesius",
      correct_answer: "B",
      explanation: 'Pada tanda ketidaksamaan tegas ">", titik-titik pada garis batas tidak memenuhi syarat karena 1 > 1 bernilai SALAH.',
      question_order: 5,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now
    },
    // PRG-3 Questions
    {
      id: "q-prg3-1",
      competency_id: comp3.id,
      question_text: "Manakah titik di bawah ini yang merupakan anggota penyelesaian dari pertidaksamaan x + 2y \u2264 8 ?",
      option_a: "(5, 3)",
      option_b: "(2, 2)",
      option_c: "(6, 2)",
      option_d: "(4, 4)",
      correct_answer: "B",
      explanation: "Uji titik (2, 2): 2 + 2(2) = 2 + 4 = 6 \u2264 8 (BENAR). Pilihan A: 5 + 6 = 11 > 8 (Salah). Pilihan C: 6 + 4 = 10 > 8. Pilihan D: 4 + 8 = 12 > 8.",
      question_order: 1,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now
    },
    {
      id: "q-prg3-2",
      competency_id: comp3.id,
      question_text: "Daerah penyelesaian pertidaksamaan 3x - 2y < 6 dengan uji titik (0, 0) menghasilkan 0 < 6 (Benar). Bagaimana posisi daerah penyelesaian tersebut terhadap garis batas?",
      option_a: "Memuat titik (0, 0) dengan garis batas putus-putus",
      option_b: "Tidak memuat titik (0, 0) dengan garis batas putus-putus",
      option_c: "Memuat titik (0, 0) dengan garis batas tegas",
      option_d: "Hanya berada di Kuadran IV",
      correct_answer: "A",
      explanation: "Karena 0 < 6 bernilai benar, daerah penyelesaian memuat (0, 0). Tanda < tanpa sama dengan berarti garis batas putus-putus.",
      question_order: 2,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now
    },
    {
      id: "q-prg3-3",
      competency_id: comp3.id,
      question_text: "Garis batas untuk pertidaksamaan -2x + y \u2264 4 akan memotong sumbu-X dan sumbu-Y di titik...",
      option_a: "(-2, 0) dan (0, 4)",
      option_b: "(2, 0) dan (0, -4)",
      option_c: "(4, 0) dan (0, -2)",
      option_d: "(-4, 0) dan (0, 2)",
      correct_answer: "A",
      explanation: "Saat y = 0 => -2x = 4 => x = -2, maka (-2, 0). Saat x = 0 => y = 4, maka (0, 4).",
      question_order: 3,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now
    },
    {
      id: "q-prg3-4",
      competency_id: comp3.id,
      question_text: "Pertidaksamaan x \u2265 0 dan y \u2265 0 dalam konteks pemodelan matematika PTLDV menyatakan bahwa...",
      option_a: "Variabel x dan y boleh bernilai negatif",
      option_b: "Variabel x dan y bersifat non-negatif (daerah penyelesaian terbatas di Kuadran I atau sumbu positif)",
      option_c: "Garis batas hanya terletak di sumbu-X",
      option_d: "Solusi hanya ada di Kuadran III",
      correct_answer: "B",
      explanation: "Syarat x \u2265 0 dan y \u2265 0 disebut syarat non-negatif yang memastikan solusi riil berada di Kuadran I.",
      question_order: 4,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now
    },
    {
      id: "q-prg3-5",
      competency_id: comp3.id,
      question_text: "Perhatikan grafik pertidaksamaan linear $2x + 3y \\ge 12$. Manakah garis pembatas dan titik potong sumbu yang tepat pada bidang Cartesius?",
      option_a: "Garis lurus tegas yang menghubungkan titik $(6, 0)$ dan $(0, 4)$",
      option_b: "Garis putus-putus yang menghubungkan titik $(4, 0)$ dan $(0, 6)$",
      option_c: "Garis lurus tegas yang menghubungkan titik $(3, 0)$ dan $(0, 2)$",
      option_d: "Garis melengkung parabola melalui $(0, 0)$",
      correct_answer: "A",
      explanation: 'Titik potong garis pembatas $2x + 3y = 12$: saat $y = 0 \\Rightarrow x = 6$, dan saat $x = 0 \\Rightarrow y = 4$. Karena memuat tanda "$\\ge$", garis pembatas digambar berupa garis tegas.',
      image_url: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20280%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23f8fafc%22%2F%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid%22%20width%3D%2220%22%20height%3D%2220%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M%2020%200%20L%200%200%200%2020%22%20fill%3D%22none%22%20stroke%3D%22%23e2e8f0%22%20stroke-width%3D%220.8%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23grid)%22%2F%3E%3Cline%20x1%3D%2230%22%20y1%3D%22220%22%20x2%3D%22370%22%20y2%3D%22220%22%20stroke%3D%22%23334155%22%20stroke-width%3D%222%22%2F%3E%3Cpolygon%20points%3D%22375%2C220%20365%2C215%20365%2C225%22%20fill%3D%22%23334155%22%2F%3E%3Ctext%20x%3D%22370%22%20y%3D%22238%22%20fill%3D%22%23334155%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22bold%22%3EX%3C%2Ftext%3E%3Cline%20x1%3D%2270%22%20y1%3D%22250%22%20x2%3D%2270%22%20y2%3D%2230%22%20stroke%3D%22%23334155%22%20stroke-width%3D%222%22%2F%3E%3Cpolygon%20points%3D%2270%2C25%2065%2C35%2075%2C35%22%20fill%3D%22%23334155%22%2F%3E%3Ctext%20x%3D%2255%22%20y%3D%2235%22%20fill%3D%22%23334155%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22bold%22%3EY%3C%2Ftext%3E%3Ccircle%20cx%3D%22270%22%20cy%3D%22220%22%20r%3D%225%22%20fill%3D%22%23dc2626%22%2F%3E%3Ctext%20x%3D%22255%22%20y%3D%22240%22%20fill%3D%22%23dc2626%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22bold%22%3E(6%2C%200)%3C%2Ftext%3E%3Ccircle%20cx%3D%2270%22%20cy%3D%2290%22%20r%3D%225%22%20fill%3D%22%23dc2626%22%2F%3E%3Ctext%20x%3D%2220%22%20y%3D%2295%22%20fill%3D%22%23dc2626%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22bold%22%3E(0%2C%204)%3C%2Ftext%3E%3Cline%20x1%3D%2235%22%20y1%3D%2267%22%20x2%3D%22320%22%20y2%3D%22253%22%20stroke%3D%22%23059669%22%20stroke-width%3D%223%22%2F%3E%3Ctext%20x%3D%22180%22%20y%3D%22135%22%20fill%3D%22%23065f46%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20font-weight%3D%22bold%22%20transform%3D%22rotate(33%20180%2C135)%22%3E2x%20%2B%203y%20%3D%2012%3C%2Ftext%3E%3C%2Fsvg%3E",
      image_caption: "Gambar 1. Titik potong garis pembatas 2x + 3y = 12 pada Bidang Koordinat Cartesius",
      question_order: 5,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now
    },
    // PRG-4 Questions
    {
      id: "q-prg4-1",
      competency_id: comp4.id,
      question_text: "Diberikan sistem pertidaksamaan: x + y \u2264 4, x \u2265 0, y \u2265 0. Bentuk daerah himpunan penyelesaian pada bidang Cartesius adalah...",
      option_a: "Persegi panjang di kuadran II",
      option_b: "Segitiga siku-siku dengan titik-titik sudut di (0,0), (4,0), dan (0,4)",
      option_c: "Trapesium siku-siku tak hingga",
      option_d: "Garis lurus tunggal",
      correct_answer: "B",
      explanation: "Daerah dibatasi oleh sumbu-X (y \u2265 0), sumbu-Y (x \u2265 0), dan garis x + y = 4 di Kuadran I, membentuk segitiga siku-siku dengan titik pojok (0,0), (4,0), dan (0,4).",
      question_order: 1,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now
    },
    {
      id: "q-prg4-2",
      competency_id: comp4.id,
      question_text: "Daerah himpunan penyelesaian dari suatu Sistem Pertidaksamaan Linear Dua Variabel (SPTLDV) merupakan...",
      option_a: "Irisan (perpotongan serentak) dari seluruh daerah penyelesaian pertidaksamaan penyusunnya",
      option_b: "Gabungan tanpa batas dari semua daerah yang tidak diarsir",
      option_c: "Hanya satu titik potong kedua garis batas",
      option_d: "Semua titik di luar bidang koordinat",
      correct_answer: "A",
      explanation: "Penyelesaian sistem adalah irisan (interseksi) dari semua pertidaksamaan anggota sistem tersebut secara bersamaan.",
      question_order: 2,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now
    },
    {
      id: "q-prg4-3",
      competency_id: comp4.id,
      question_text: "Dua garis batas dari suatu SPTLDV adalah x + y = 5 dan 2x + y = 7. Koordinat titik potong kedua garis pembatas tersebut adalah...",
      option_a: "(1, 4)",
      option_b: "(2, 3)",
      option_c: "(3, 2)",
      option_d: "(4, 1)",
      correct_answer: "B",
      explanation: "Kurangkan kedua persamaan: (2x + y) - (x + y) = 7 - 5 => x = 2. Lalu y = 5 - 2 = 3. Jadi titik potongnya adalah (2, 3).",
      question_order: 3,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now
    },
    {
      id: "q-prg4-4",
      competency_id: comp4.id,
      question_text: "Jika daerah penyelesaian suatu SPTLDV memiliki titik-titik pojok (0, 0), (3, 0), (2, 2), dan (0, 4), maka nilai maksimum fungsi objektif f(x, y) = 4x + 3y adalah...",
      option_a: "12",
      option_b: "14",
      option_c: "15",
      option_d: "18",
      correct_answer: "B",
      explanation: "Uji titik pojok: f(0,0)=0; f(3,0)=4(3)+0=12; f(2,2)=4(2)+3(2)=8+6=14; f(0,4)=4(0)+3(4)=12. Nilai maksimum adalah 14 pada titik (2, 2).",
      question_order: 4,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now
    },
    {
      id: "q-prg4-5",
      competency_id: comp4.id,
      question_text: "Diberikan sistem: 2x + y \u2264 6, x + 2y \u2264 6, x \u2265 0, y \u2265 0. Manakah titik uji di bawah ini yang berada di DALAM daerah penyelesaian sistem tersebut?",
      option_a: "(1, 1)",
      option_b: "(3, 3)",
      option_c: "(0, 4)",
      option_d: "(4, 0)",
      correct_answer: "A",
      explanation: "Uji (1, 1): 2(1)+1 = 3 \u2264 6 (Benar) dan 1+2(1) = 3 \u2264 6 (Benar). Titik (3, 3) menghasilkan 9 > 6 (Salah). Titik (0,4) menghasilkan 8 > 6. Titik (4,0) menghasilkan 8 > 6.",
      question_order: 5,
      active: true,
      created_by: userTeacher.id,
      created_at: now,
      updated_at: now
    }
  ];
  const attempt1Budi = {
    id: "att-budi-1",
    student_id: studentBudi.id,
    competency_id: comp1.id,
    started_at: new Date(Date.now() - 864e5 * 2).toISOString(),
    submitted_at: new Date(Date.now() - 864e5 * 2 + 18e4).toISOString(),
    correct_count: 5,
    question_count: 5,
    percentage: 100,
    mastery_status: "ACHIEVED",
    ai_feedback: "Luar biasa! Pemahamanmu terhadap konsep prasyarat eliminasi, substitusi, dan bentuk umum PLDV sudah sangat matang. Kamu siap melanjutkan ke Makna Tanda Pertidaksamaan.",
    created_at: new Date(Date.now() - 864e5 * 2).toISOString()
  };
  const attempt2Budi = {
    id: "att-budi-2",
    student_id: studentBudi.id,
    competency_id: comp2.id,
    started_at: new Date(Date.now() - 864e5).toISOString(),
    submitted_at: new Date(Date.now() - 864e5 + 24e4).toISOString(),
    correct_count: 3,
    question_count: 5,
    percentage: 60,
    mastery_status: "DEVELOPING",
    ai_feedback: "Kompetensi sedang berkembang. Kamu sudah memahami pembacaan simbol verbal, namun perlu memperkuat konsep garis putus-putus pada tanda ketidaksamaan murni (<, >) serta uji titik selidik. Jangan ragu untuk mencoba kembali!",
    created_at: new Date(Date.now() - 864e5).toISOString()
  };
  const attempt1Siti = {
    id: "att-siti-1",
    student_id: studentSiti.id,
    competency_id: comp1.id,
    started_at: new Date(Date.now() - 864e5 * 3).toISOString(),
    submitted_at: new Date(Date.now() - 864e5 * 3 + 2e5).toISOString(),
    correct_count: 5,
    question_count: 5,
    percentage: 100,
    mastery_status: "ACHIEVED",
    ai_feedback: "Penguasaan konsep sangat baik. Siap melangkah ke tahap berikutnya.",
    created_at: new Date(Date.now() - 864e5 * 3).toISOString()
  };
  const attempt2Siti = {
    id: "att-siti-2",
    student_id: studentSiti.id,
    competency_id: comp2.id,
    started_at: new Date(Date.now() - 864e5 * 2).toISOString(),
    submitted_at: new Date(Date.now() - 864e5 * 2 + 19e4).toISOString(),
    correct_count: 4,
    question_count: 5,
    percentage: 80,
    mastery_status: "ACHIEVED",
    ai_feedback: "Kompetensi tercapai pada tahap penguasaan mandiri. Siap melanjutkan ke pos berikutnya.",
    created_at: new Date(Date.now() - 864e5 * 2).toISOString()
  };
  const attempt3Siti = {
    id: "att-siti-3",
    student_id: studentSiti.id,
    competency_id: comp3.id,
    started_at: new Date(Date.now() - 864e5).toISOString(),
    submitted_at: new Date(Date.now() - 864e5 + 22e4).toISOString(),
    correct_count: 5,
    question_count: 5,
    percentage: 100,
    mastery_status: "ACHIEVED",
    ai_feedback: "Hebat! Pemahaman daerah himpunan penyelesaian PTLDV dan uji titik selidik sangat akurat.",
    created_at: new Date(Date.now() - 864e5).toISOString()
  };
  const attempt4Siti = {
    id: "att-siti-4",
    student_id: studentSiti.id,
    competency_id: comp4.id,
    started_at: new Date(Date.now() - 36e5 * 5).toISOString(),
    submitted_at: new Date(Date.now() - 36e5 * 5 + 3e5).toISOString(),
    correct_count: 3,
    question_count: 5,
    percentage: 60,
    mastery_status: "DEVELOPING",
    ai_feedback: "Sedang berkembang. Teliti kembali irisan beberapa garis pembatas dan perhitungan titik potong eliminasi.",
    created_at: new Date(Date.now() - 36e5 * 5).toISOString()
  };
  const attempts = [
    attempt1Budi,
    attempt2Budi,
    attempt1Siti,
    attempt2Siti,
    attempt3Siti,
    attempt4Siti
  ];
  const competency_progress = [
    // Budi
    {
      id: "cp-budi-1",
      student_id: studentBudi.id,
      competency_id: comp1.id,
      status: "ACHIEVED",
      last_attempt_id: attempt1Budi.id,
      last_updated_at: attempt1Budi.submitted_at,
      created_at: attempt1Budi.created_at,
      updated_at: attempt1Budi.submitted_at
    },
    {
      id: "cp-budi-2",
      student_id: studentBudi.id,
      competency_id: comp2.id,
      status: "DEVELOPING",
      last_attempt_id: attempt2Budi.id,
      last_updated_at: attempt2Budi.submitted_at,
      created_at: attempt2Budi.created_at,
      updated_at: attempt2Budi.submitted_at
    },
    {
      id: "cp-budi-3",
      student_id: studentBudi.id,
      competency_id: comp3.id,
      status: "NOT_STARTED",
      last_attempt_id: null,
      last_updated_at: now,
      created_at: now,
      updated_at: now
    },
    {
      id: "cp-budi-4",
      student_id: studentBudi.id,
      competency_id: comp4.id,
      status: "NOT_STARTED",
      last_attempt_id: null,
      last_updated_at: now,
      created_at: now,
      updated_at: now
    },
    // Siti
    {
      id: "cp-siti-1",
      student_id: studentSiti.id,
      competency_id: comp1.id,
      status: "ACHIEVED",
      last_attempt_id: attempt1Siti.id,
      last_updated_at: attempt1Siti.submitted_at,
      created_at: attempt1Siti.created_at,
      updated_at: attempt1Siti.submitted_at
    },
    {
      id: "cp-siti-2",
      student_id: studentSiti.id,
      competency_id: comp2.id,
      status: "ACHIEVED",
      last_attempt_id: attempt2Siti.id,
      last_updated_at: attempt2Siti.submitted_at,
      created_at: attempt2Siti.created_at,
      updated_at: attempt2Siti.submitted_at
    },
    {
      id: "cp-siti-3",
      student_id: studentSiti.id,
      competency_id: comp3.id,
      status: "ACHIEVED",
      last_attempt_id: attempt3Siti.id,
      last_updated_at: attempt3Siti.submitted_at,
      created_at: attempt3Siti.created_at,
      updated_at: attempt3Siti.submitted_at
    },
    {
      id: "cp-siti-4",
      student_id: studentSiti.id,
      competency_id: comp4.id,
      status: "DEVELOPING",
      last_attempt_id: attempt4Siti.id,
      last_updated_at: attempt4Siti.submitted_at,
      created_at: attempt4Siti.created_at,
      updated_at: attempt4Siti.submitted_at
    },
    // Ahmad (all not started except PRG-1 developing)
    {
      id: "cp-ahmad-1",
      student_id: studentAhmad.id,
      competency_id: comp1.id,
      status: "DEVELOPING",
      last_attempt_id: null,
      last_updated_at: now,
      created_at: now,
      updated_at: now
    },
    {
      id: "cp-ahmad-2",
      student_id: studentAhmad.id,
      competency_id: comp2.id,
      status: "NOT_STARTED",
      last_attempt_id: null,
      last_updated_at: now,
      created_at: now,
      updated_at: now
    },
    // Dewi (all achieved)
    {
      id: "cp-dewi-1",
      student_id: studentDewi.id,
      competency_id: comp1.id,
      status: "ACHIEVED",
      last_attempt_id: null,
      last_updated_at: now,
      created_at: now,
      updated_at: now
    },
    {
      id: "cp-dewi-2",
      student_id: studentDewi.id,
      competency_id: comp2.id,
      status: "ACHIEVED",
      last_attempt_id: null,
      last_updated_at: now,
      created_at: now,
      updated_at: now
    },
    {
      id: "cp-dewi-3",
      student_id: studentDewi.id,
      competency_id: comp3.id,
      status: "ACHIEVED",
      last_attempt_id: null,
      last_updated_at: now,
      created_at: now,
      updated_at: now
    },
    {
      id: "cp-dewi-4",
      student_id: studentDewi.id,
      competency_id: comp4.id,
      status: "ACHIEVED",
      last_attempt_id: null,
      last_updated_at: now,
      created_at: now,
      updated_at: now
    }
  ];
  const responses = [
    {
      id: "resp-1",
      attempt_id: attempt1Budi.id,
      student_id: studentBudi.id,
      question_id: "q-prg1-1",
      selected_answer: "A",
      is_correct: true,
      answered_at: attempt1Budi.submitted_at
    },
    {
      id: "resp-2",
      attempt_id: attempt1Budi.id,
      student_id: studentBudi.id,
      question_id: "q-prg1-2",
      selected_answer: "B",
      is_correct: true,
      answered_at: attempt1Budi.submitted_at
    },
    {
      id: "resp-3",
      attempt_id: attempt1Budi.id,
      student_id: studentBudi.id,
      question_id: "q-prg1-3",
      selected_answer: "C",
      is_correct: true,
      answered_at: attempt1Budi.submitted_at
    },
    {
      id: "resp-4",
      attempt_id: attempt1Budi.id,
      student_id: studentBudi.id,
      question_id: "q-prg1-4",
      selected_answer: "B",
      is_correct: true,
      answered_at: attempt1Budi.submitted_at
    },
    {
      id: "resp-5",
      attempt_id: attempt1Budi.id,
      student_id: studentBudi.id,
      question_id: "q-prg1-5",
      selected_answer: "B",
      is_correct: true,
      answered_at: attempt1Budi.submitted_at
    },
    // Budi attempt 2 on PRG-2 (3/5)
    {
      id: "resp-6",
      attempt_id: attempt2Budi.id,
      student_id: studentBudi.id,
      question_id: "q-prg2-1",
      selected_answer: "A",
      // Incorrect (A instead of B)
      is_correct: false,
      answered_at: attempt2Budi.submitted_at
    },
    {
      id: "resp-7",
      attempt_id: attempt2Budi.id,
      student_id: studentBudi.id,
      question_id: "q-prg2-2",
      selected_answer: "C",
      is_correct: true,
      answered_at: attempt2Budi.submitted_at
    },
    {
      id: "resp-8",
      attempt_id: attempt2Budi.id,
      student_id: studentBudi.id,
      question_id: "q-prg2-3",
      selected_answer: "A",
      // Incorrect (A instead of B)
      is_correct: false,
      answered_at: attempt2Budi.submitted_at
    },
    {
      id: "resp-9",
      attempt_id: attempt2Budi.id,
      student_id: studentBudi.id,
      question_id: "q-prg2-4",
      selected_answer: "C",
      is_correct: true,
      answered_at: attempt2Budi.submitted_at
    },
    {
      id: "resp-10",
      attempt_id: attempt2Budi.id,
      student_id: studentBudi.id,
      question_id: "q-prg2-5",
      selected_answer: "B",
      is_correct: true,
      answered_at: attempt2Budi.submitted_at
    }
  ];
  const audit_logs = [
    {
      id: "log-1",
      timestamp: now,
      actor_user_id: userTeacher.id,
      actor_name: userTeacher.name,
      actor_role: "teacher",
      action: "SYSTEM_INIT",
      details: { message: "Inisialisasi sistem Personal Learning Journey dan modul Matematika SPLDV/SPTLDV" }
    }
  ];
  const reflections = [
    {
      id: "refl-budi-1",
      student_id: studentBudi.id,
      competency_id: comp2.id,
      mindset_feeling: "Ragu tapi Mau Berusaha",
      challenge_description: "Masih sering terbalik membedakan kapan garis batas harus putus-putus atau garis tegas saat uji titik selidik.",
      action_plan: [
        "Mengkaji kembali catatan uji titik (0,0)",
        "Membuat rangkuman visual perbedaan tanda <, > vs \u2264, \u2265",
        "Mencoba 2 latihan mandiri sebelum tes ulang"
      ],
      custom_action_text: "Saya menggambar ulang grafik contoh soal untuk memastikan letak daerah arsiran.",
      readiness_level: 4,
      ai_coaching_feedback: "Langkah refleksi yang luar biasa, Budi! Menyadari kebingungan pada garis putus-putus vs tegas adalah awal penguasaan sejati. Otakmu sedang bertumbuh!",
      created_at: new Date(Date.now() - 36e5 * 12).toISOString()
    }
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
    reflections
  };
}
function normalizeSchema(parsed) {
  if (!parsed.reflections) parsed.reflections = [];
  if (!parsed.audit_logs) parsed.audit_logs = [];
  if (!parsed.chapters || parsed.chapters.length === 0 || !parsed.subtopics || parsed.subtopics.length === 0) {
    const seed = generateInitialSeed();
    parsed.chapters = seed.chapters;
    parsed.subtopics = seed.subtopics;
    for (const c of parsed.competencies) {
      if (!c.chapter_id) c.chapter_id = "chap-1";
      c.subtopics = parsed.subtopics.filter((s) => s.competency_id === c.id);
    }
    for (const q of parsed.questions) {
      if (!q.chapter_id) q.chapter_id = "chap-1";
      const seedQ = seed.questions.find((sq) => sq.id === q.id);
      if (seedQ) {
        q.subtopic_id = seedQ.subtopic_id;
        q.subtopic_title = seedQ.subtopic_title;
      }
    }
  }
  return parsed;
}
var Database = class {
  constructor() {
    this.writeChain = Promise.resolve();
    this.data = generateInitialSeed();
    this.initPromise = this.initialize();
  }
  async ready() {
    await this.initPromise;
    await this.writeChain;
  }
  async initialize() {
    if (isPostgresEnabled()) {
      const loaded = await loadState();
      if (loaded && typeof loaded === "object") {
        this.data = normalizeSchema(loaded);
        console.log("[DB] Loaded state from Postgres (Neon).");
        return;
      }
      this.data = generateInitialSeed();
      await saveState(this.data);
      console.log("[DB] Seeded new state into Postgres (Neon).");
      return;
    }
    this.data = this.loadDataFromFile();
    console.log("[DB] Using local JSON file store.");
  }
  loadDataFromFile() {
    ensureDataDir();
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = normalizeSchema(JSON.parse(raw));
        this.saveToFile(parsed);
        return parsed;
      }
    } catch (e) {
      console.warn("Gagal membaca DB file, membuat database baru:", e);
    }
    const seed = generateInitialSeed();
    this.saveToFile(seed);
    return seed;
  }
  saveToFile(data) {
    if (data) {
      this.data = data;
    }
    try {
      const tempPath = `${DB_FILE}.${Date.now()}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), "utf-8");
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error("Error saving database file:", err);
    }
  }
  saveData(data) {
    if (data) {
      this.data = data;
    }
    if (!isPostgresEnabled()) {
      this.saveToFile();
      return;
    }
    const snapshot = this.data;
    this.writeChain = this.writeChain.then(() => saveState(snapshot)).catch((err) => {
      console.error("Error saving database to Postgres:", err);
    });
  }
  resetToSeed() {
    const seed = generateInitialSeed();
    this.saveData(seed);
  }
  // --- Users & Students ---
  getUsers() {
    return this.data.users;
  }
  getUserById(id) {
    return this.data.users.find((u) => u.id === id);
  }
  getUserByEmail(email) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }
  updateUserRole(userId, newRole) {
    const user = this.getUserById(userId);
    if (!user) return void 0;
    user.role = newRole;
    user.updated_at = (/* @__PURE__ */ new Date()).toISOString();
    if (newRole === "student") {
      const existingStudent = this.getStudentByUserId(userId);
      if (!existingStudent) {
        const newStudent = {
          id: `std-${crypto.randomUUID()}`,
          user_id: user.id,
          full_name: user.name,
          email: user.email,
          grade: "Kelas X",
          class_name: "X-MIPA 1",
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        this.data.students.push(newStudent);
      }
    }
    this.saveData();
    return user;
  }
  updateUser(userId, params) {
    const user = this.getUserById(userId);
    if (!user) return void 0;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    if (params.name) user.name = params.name.trim();
    if (params.email) user.email = params.email.trim().toLowerCase();
    if (params.password) user.password = params.password;
    if (params.role) user.role = params.role;
    user.updated_at = now;
    let std = this.getStudentByUserId(userId);
    if (user.role === "student") {
      if (!std) {
        std = {
          id: `std-${crypto.randomUUID()}`,
          user_id: user.id,
          full_name: user.name,
          email: user.email,
          grade: params.grade || "Kelas X",
          class_name: params.class_name || "X-MIPA 1",
          created_at: now,
          updated_at: now
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
  createUser(params) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const newUser = {
      id: `u-${crypto.randomUUID()}`,
      name: params.name,
      email: params.email,
      role: params.role,
      password: params.password || "password123",
      created_at: now,
      updated_at: now
    };
    this.data.users.push(newUser);
    if (params.role === "student") {
      const newStudent = {
        id: `std-${crypto.randomUUID()}`,
        user_id: newUser.id,
        full_name: newUser.name,
        email: newUser.email,
        grade: params.grade || "Kelas X",
        class_name: params.class_name || "X-MIPA 1",
        created_at: now,
        updated_at: now
      };
      this.data.students.push(newStudent);
    }
    this.saveData();
    return newUser;
  }
  resetUserPassword(userId, newPassword) {
    const user = this.getUserById(userId);
    if (!user) return false;
    user.password = newPassword || "password123";
    user.updated_at = (/* @__PURE__ */ new Date()).toISOString();
    this.saveData();
    return true;
  }
  getStudents() {
    return this.data.students;
  }
  getStudentById(id) {
    return this.data.students.find((s) => s.id === id);
  }
  getStudentByUserId(userId) {
    return this.data.students.find((s) => s.user_id === userId);
  }
  // --- Chapters (Bab Kurikulum) ---
  getChapters(onlyActive = false) {
    if (!this.data.chapters) this.data.chapters = [];
    return [...this.data.chapters].filter((ch) => onlyActive ? ch.active : true).sort((a, b) => a.sequence_order - b.sequence_order);
  }
  getChapterById(id) {
    if (!this.data.chapters) this.data.chapters = [];
    return this.data.chapters.find((ch) => ch.id === id);
  }
  createChapter(chapter) {
    if (!this.data.chapters) this.data.chapters = [];
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const newChapter = {
      ...chapter,
      id: `chap-${crypto.randomUUID()}`,
      created_at: now,
      updated_at: now
    };
    this.data.chapters.push(newChapter);
    this.saveData();
    return newChapter;
  }
  updateChapter(id, updates) {
    const chapter = this.getChapterById(id);
    if (!chapter) return void 0;
    Object.assign(chapter, updates, { updated_at: (/* @__PURE__ */ new Date()).toISOString() });
    this.saveData();
    return chapter;
  }
  // --- Subtopics (Langkah Rinci Belajar / Micro-Skills) ---
  getSubtopics(competencyId) {
    if (!this.data.subtopics) this.data.subtopics = [];
    return this.data.subtopics.filter((s) => competencyId ? s.competency_id === competencyId : true).sort((a, b) => a.sequence_order - b.sequence_order);
  }
  getSubtopicById(id) {
    if (!this.data.subtopics) this.data.subtopics = [];
    return this.data.subtopics.find((s) => s.id === id);
  }
  createSubtopic(subtopic) {
    if (!this.data.subtopics) this.data.subtopics = [];
    const newSubtopic = {
      ...subtopic,
      id: `sub-${crypto.randomUUID()}`
    };
    this.data.subtopics.push(newSubtopic);
    const comp = this.getCompetencyById(subtopic.competency_id);
    if (comp) {
      if (!comp.subtopics) comp.subtopics = [];
      comp.subtopics.push(newSubtopic);
    }
    this.saveData();
    return newSubtopic;
  }
  updateSubtopic(id, updates) {
    const sub = this.getSubtopicById(id);
    if (!sub) return void 0;
    Object.assign(sub, updates);
    const comp = this.getCompetencyById(sub.competency_id);
    if (comp && comp.subtopics) {
      const idx = comp.subtopics.findIndex((s) => s.id === id);
      if (idx !== -1) Object.assign(comp.subtopics[idx], updates);
    }
    this.saveData();
    return sub;
  }
  // --- Competencies ---
  getCompetencies() {
    return [...this.data.competencies].sort((a, b) => a.sequence_order - b.sequence_order);
  }
  getCompetencyById(id) {
    return this.data.competencies.find((c) => c.id === id);
  }
  createCompetency(comp) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const newComp = {
      ...comp,
      id: `comp-${crypto.randomUUID()}`,
      created_at: now,
      updated_at: now
    };
    this.data.competencies.push(newComp);
    this.saveData();
    return newComp;
  }
  updateCompetency(id, updates) {
    const comp = this.getCompetencyById(id);
    if (!comp) return void 0;
    Object.assign(comp, updates, { updated_at: (/* @__PURE__ */ new Date()).toISOString() });
    this.saveData();
    return comp;
  }
  // --- Questions ---
  getQuestions(competencyId, onlyActive = true, chapterId, subtopicId) {
    return this.data.questions.filter((q) => {
      if (competencyId && q.competency_id !== competencyId) return false;
      if (chapterId && q.chapter_id && q.chapter_id !== chapterId) return false;
      if (subtopicId && q.subtopic_id !== subtopicId) return false;
      if (onlyActive && !q.active) return false;
      return true;
    }).sort((a, b) => a.question_order - b.question_order);
  }
  getQuestionById(id) {
    return this.data.questions.find((q) => q.id === id);
  }
  createQuestion(q) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const newQ = {
      ...q,
      id: `q-${crypto.randomUUID()}`,
      created_at: now,
      updated_at: now
    };
    this.data.questions.push(newQ);
    this.saveData();
    return newQ;
  }
  updateQuestion(id, updates) {
    const q = this.getQuestionById(id);
    if (!q) return void 0;
    Object.assign(q, updates, { updated_at: (/* @__PURE__ */ new Date()).toISOString() });
    this.saveData();
    return q;
  }
  archiveQuestion(id) {
    const q = this.getQuestionById(id);
    if (!q) return false;
    q.active = false;
    q.updated_at = (/* @__PURE__ */ new Date()).toISOString();
    this.saveData();
    return true;
  }
  // --- Progress ---
  getCompetencyProgress(studentId, competencyId) {
    return this.data.competency_progress.filter((cp) => {
      if (cp.student_id !== studentId) return false;
      if (competencyId && cp.competency_id !== competencyId) return false;
      return true;
    });
  }
  getSingleCompetencyProgress(studentId, competencyId) {
    return this.data.competency_progress.find(
      (cp) => cp.student_id === studentId && cp.competency_id === competencyId
    );
  }
  upsertCompetencyProgress(studentId, competencyId, status, lastAttemptId) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
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
        updated_at: now
      };
      this.data.competency_progress.push(record);
    }
    this.saveData();
    return record;
  }
  // --- Attempts & Responses ---
  getAttempts(studentId, competencyId) {
    return this.data.attempts.filter((a) => {
      if (studentId && a.student_id !== studentId) return false;
      if (competencyId && a.competency_id !== competencyId) return false;
      return true;
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
  getAttemptById(id) {
    return this.data.attempts.find((a) => a.id === id);
  }
  createAttempt(attempt) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const newAttempt = {
      ...attempt,
      id: `att-${crypto.randomUUID()}`,
      created_at: now
    };
    this.data.attempts.push(newAttempt);
    this.saveData();
    return newAttempt;
  }
  updateAttempt(id, updates) {
    const att = this.getAttemptById(id);
    if (!att) return void 0;
    Object.assign(att, updates);
    this.saveData();
    return att;
  }
  getResponsesByAttemptId(attemptId) {
    return this.data.responses.filter((r) => r.attempt_id === attemptId);
  }
  createResponses(responsesList) {
    const created = responsesList.map((r) => ({
      ...r,
      id: `resp-${crypto.randomUUID()}`
    }));
    this.data.responses.push(...created);
    this.saveData();
    return created;
  }
  // --- Audit Logs ---
  getAuditLogs() {
    return [...this.data.audit_logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  addAuditLog(actorUserId, actorName, actorRole, action, details) {
    const log = {
      id: `log-${crypto.randomUUID()}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      actor_user_id: actorUserId,
      actor_name: actorName,
      actor_role: actorRole,
      action,
      details
    };
    this.data.audit_logs.push(log);
    this.saveData();
    return log;
  }
  getReflections(studentId) {
    if (!this.data.reflections) this.data.reflections = [];
    return this.data.reflections.filter((r) => studentId ? r.student_id === studentId : true).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
  createReflection(reflection) {
    if (!this.data.reflections) this.data.reflections = [];
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const newRefl = {
      ...reflection,
      id: `refl-${crypto.randomUUID()}`,
      created_at: now
    };
    this.data.reflections.push(newRefl);
    this.saveData();
    return newRefl;
  }
  updateReflectionTeacherNote(id, note, teacherName) {
    if (!this.data.reflections) this.data.reflections = [];
    const idx = this.data.reflections.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    this.data.reflections[idx].teacher_note = note;
    this.data.reflections[idx].teacher_note_by = teacherName;
    this.data.reflections[idx].teacher_note_at = (/* @__PURE__ */ new Date()).toISOString();
    this.saveData();
    return this.data.reflections[idx];
  }
  getRawData() {
    return this.data;
  }
};
var db = new Database();

// server/routes/auth.ts
var authRouter = Router();
function getAuthenticatedUser(req) {
  const authHeader = req.headers["authorization"];
  let userId = req.headers["x-user-id"];
  if (!userId && authHeader && authHeader.startsWith("Bearer ")) {
    userId = authHeader.replace("Bearer ", "").trim();
  }
  if (!userId && req.cookies && req.cookies.user_id) {
    userId = req.cookies.user_id;
  }
  if (!userId) {
    return null;
  }
  const user = db.getUserById(userId);
  return user || null;
}
authRouter.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email dan kata sandi wajib diisi." });
    return;
  }
  let loginEmail = String(email).trim();
  if (!loginEmail.includes("@")) {
    loginEmail = `${loginEmail}@sekolah.id`;
  }
  const user = db.getUserByEmail(loginEmail);
  if (!user) {
    res.status(401).json({ error: "Akun dengan email ini tidak ditemukan." });
    return;
  }
  const expectedPassword = user.password || "password123";
  if (password !== expectedPassword && password !== "password123") {
    res.status(401).json({ error: "Kata sandi tidak sesuai. (Kata sandi default: password123)" });
    return;
  }
  db.addAuditLog(user.id, user.name, user.role, "USER_LOGIN", { email: user.email });
  res.json({
    message: "Login berhasil",
    token: user.id,
    // ID acts as session token in demo
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar_url: user.avatar_url,
      student_profile: user.role === "student" ? db.getStudentByUserId(user.id) : null
    }
  });
});
authRouter.get("/me", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    res.status(401).json({ error: "Sesi tidak valid" });
    return;
  }
  let studentProfile = null;
  if (user.role === "student") {
    studentProfile = db.getStudentByUserId(user.id);
  }
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar_url: user.avatar_url,
      student_profile: studentProfile
    }
  });
});
authRouter.post("/switch-user", (req, res) => {
  const { userId } = req.body;
  const user = db.getUserById(userId);
  if (!user) {
    res.status(404).json({ error: "Pengguna tidak ditemukan" });
    return;
  }
  res.json({
    message: `Beralih ke akun ${user.name} (${user.role})`,
    token: user.id,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar_url: user.avatar_url,
      student_profile: user.role === "student" ? db.getStudentByUserId(user.id) : null
    }
  });
});
authRouter.get("/demo-accounts", (_req, res) => {
  const users = db.getUsers().map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    student_profile: u.role === "student" ? db.getStudentByUserId(u.id) : null
  }));
  res.json({ users });
});
authRouter.post("/logout", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (user) {
    db.addAuditLog(user.id, user.name, user.role, "USER_LOGOUT", {});
  }
  res.json({ message: "Logout berhasil" });
});
authRouter.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  const user = db.getUserByEmail(email);
  if (!user) {
    res.status(404).json({ error: "Email tidak terdaftar dalam sistem." });
    return;
  }
  res.json({
    message: "Tautan reset kata sandi telah dikirimkan ke email Anda (Simulasi).",
    token: "reset-sim-token-12345"
  });
});
authRouter.post("/reset-password", (_req, res) => {
  res.json({
    message: "Kata sandi Anda berhasil diperbarui. Silakan login kembali."
  });
});

// server/routes/student.ts
import { Router as Router2 } from "express";

// server/gemini.ts
import { GoogleGenAI } from "@google/genai";
var aiClient = null;
function getAiClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
    } catch (e) {
      console.warn("Failed to initialize GoogleGenAI client:", e);
    }
  }
  return aiClient;
}
async function generateRemediationFeedback(ctx) {
  const client = getAiClient();
  if (client) {
    try {
      const prompt = `
Anda adalah asisten pedagogi guru matematika yang ramah, memotivasi, dan berorientasi pada "Mastery Learning & Growth Mindset" (Progress > Ranking, Mastery > Score, Personal Journey).
Berikan analisis formatif dan rekomendasi belajar personal dalam Bahasa Indonesia untuk siswa bernama ${ctx.studentName}.

Data Asesmen:
- Kompetensi: ${ctx.competencyCode} - ${ctx.competencyName}
- Tahap Capaian: ${ctx.masteryStatus === "ACHIEVED" ? "Tahap Tercapai" : "Tahap Sedang Berkembang"}
- Status: ${ctx.masteryStatus === "ACHIEVED" ? "Tercapai (Ambang batas penguasaan terpenuhi)" : "Sedang Berkembang (Perlu penguatan konsep)"}

PANDUAN KHUSUS FORMATIF:
- JANGAN mencantumkan angka persentase (seperti "80%", "60%", dll.) maupun angka skor dalam ulasan.
- PERTAHANKAN penyebutan tahap capaian (seperti "Tahap Tercapai" atau "Tahap Sedang Berkembang").
- Fokuskan ulasan pada pemahaman konsep matematis, apresiasi proses belajar, serta langkah konkret penguatan materi.

${ctx.incorrectQuestions.length > 0 ? `Soal yang belum tepat dan penjelasannya:
${ctx.incorrectQuestions.map((q, idx) => `${idx + 1}. Soal: "${q.question}"
   Jawaban Siswa: ${q.selectedAnswer}
   Jawaban Benar: ${q.correctAnswer}
   Miskonsepsi/Penjelasan: ${q.explanation || "-"}`).join("\n\n")}` : "Semua soal dijawab dengan benar!"}

Tolong susun ulasan dalam 2-3 paragraf singkat dan ramah:
1. Apresiasi usaha siswa dan penegasan tahap belajarnya saat ini (Tahap Tercapai atau Tahap Sedang Berkembang).
2. Identifikasi miskonsepsi utama jika ada yang belum tepat (atau penguatan konsep jika sudah tercapai).
3. Langkah aksi konkret (tips belajar praktis atau materi yang perlu diulang sebelum mencoba lagi).
Gunakan nada suportif, tidak membandingkan dengan orang lain, dan tekankan bahwa kesalahan adalah bagian wajar dari proses belajar.
`;
      const aiPromise = client.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt
      });
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 4e3));
      const response = await Promise.race([aiPromise, timeoutPromise]);
      if (response && response.text) {
        return response.text.trim();
      }
    } catch (err) {
      console.warn("Gemini API call failed, using rule-based feedback fallback:", err);
    }
  }
  if (ctx.masteryStatus === "ACHIEVED") {
    return `Luar biasa, ${ctx.studentName}! Kamu telah berhasil menguasai kompetensi ${ctx.competencyName} pada Tahap Tercapai. Pemahaman konsepmu sangat solid. Kamu dapat melanjutkan ke kompetensi berikutnya pada Learning Journey dengan percaya diri!`;
  } else {
    const errorHighlights = ctx.incorrectQuestions.map((q) => q.explanation).filter(Boolean).slice(0, 2).join(" ");
    return `Kerja bagus untuk usahamu hari ini, ${ctx.studentName}! Saat ini posisimu berada di Tahap Sedang Berkembang. ${errorHighlights ? `Fokus utama untuk perbaikan: ${errorHighlights}` : "Pelajari kembali konsep dasar dan uji titik selidik."} Luangkan waktu untuk mengkaji kembali materi, lalu silakan lakukan asesmen ulang (retry) untuk mencapai penguasaan maksimal!`;
  }
}
async function generateGrowthMindsetCoaching(params) {
  const client = getAiClient();
  if (client) {
    try {
      const prompt = `
Anda adalah Guru dan Mentor Matematika yang ahli dalam Growth Mindset (Carol Dweck, Jo Boaler).
Seorang murid bernama ${params.studentName} sedang melakukan refleksi sebelum melakukan tes ulang (retry).

Data Refleksi Murid:
- Perasaan saat ini: "${params.feeling}"
- Materi/Kompetensi: ${params.competencyName || "Matematika Program Linear"}
- Hal yang dirasa masih sulit / membuat ragu: "${params.challenge || "Belum terbiasa dengan konsep grafik"}"
- Rencana aksi yang dipilih sebelum tes ulang: ${params.actionPlan.join(", ")}${params.customAction ? ` (${params.customAction})` : ""}

Tolong berikan pesan penguatan Growth Mindset yang hangat, ramah, dan memotivasi dalam 2 paragraf singkat (Bahasa Indonesia):
1. Normalisasikan rasa ragu/takut (tegaskan bahwa tidak ada yang namanya 'otak yang tidak berbakat matematika', dan rasa bingung adalah tanda sinapsis otak sedang meregangkan pemahaman baru).
2. Apresiasi rencana aksi yang dipilih murid dan beri dorongan optimis bahwa dengan strategi yang tepat, ia pasti siap menghadapi tes ulang dengan percaya diri.
`;
      const aiPromise = client.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt
      });
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 4e3));
      const res = await Promise.race([aiPromise, timeoutPromise]);
      if (res && res.text) {
        return res.text.trim();
      }
    } catch (e) {
      console.warn("Gemini coaching fallback:", e);
    }
  }
  return `Hai ${params.studentName}, sangat wajar merasakan keraguan saat menghadapi konsep baru. Ingat prinsip neuroplastisitas: otak matematika bukanlah bawaan lahir, melainkan seperti otot yang bertumbuh setiap kali kamu bergulat dengan hal yang menantang! Rencana aksimu untuk "${params.actionPlan[0] || "mengkaji kembali konsep"}" adalah langkah yang sangat cerdas. Ambil nafas, pelajari langkah demi langkah, dan kamu pasti bisa melangkah lebih jauh pada tes ulang ini!`;
}

// server/routes/student.ts
var studentRouter = Router2();
function requireStudent(req, res, next) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    res.status(401).json({ error: "Autentikasi diperlukan. Silakan login terlebih dahulu." });
    return;
  }
  if (user.role === "student") {
    const student = db.getStudentByUserId(user.id);
    if (!student) {
      res.status(403).json({ error: "Profil siswa tidak ditemukan untuk akun ini." });
      return;
    }
    req.student = student;
    req.user = user;
    next();
    return;
  }
  if (user.role === "teacher" || user.role === "admin") {
    const studentIdParam = req.query.as_student;
    const student = studentIdParam ? db.getStudentById(studentIdParam) : db.getStudents()[0];
    if (student) {
      req.student = student;
      req.user = user;
      next();
      return;
    }
  }
  res.status(403).json({ error: "Akses khusus siswa." });
}
studentRouter.get("/learning-journey", requireStudent, (req, res) => {
  const student = req.student;
  const competencies = db.getCompetencies().filter((c) => c.active);
  const progressList = db.getCompetencyProgress(student.id);
  const checkpoints = competencies.map((comp) => {
    const prog = progressList.find((p) => p.competency_id === comp.id);
    const status = prog ? prog.status : "NOT_STARTED";
    let lastAttempt = null;
    if (prog && prog.last_attempt_id) {
      const att = db.getAttemptById(prog.last_attempt_id);
      if (att) {
        lastAttempt = {
          id: att.id,
          percentage: att.percentage,
          submitted_at: att.submitted_at,
          mastery_status: att.mastery_status
        };
      }
    }
    let isLocked = false;
    if (comp.prerequisite_id) {
      const prereqProg = progressList.find((p) => p.competency_id === comp.prerequisite_id);
      if (!prereqProg || prereqProg.status !== "ACHIEVED") {
        isLocked = true;
      }
    }
    const questionCount = db.getQuestions(comp.id, true).length;
    return {
      competency_id: comp.id,
      code: comp.code,
      name: comp.name,
      description: comp.description,
      sequence_order: comp.sequence_order,
      prerequisite_id: comp.prerequisite_id,
      mastery_threshold: comp.mastery_threshold,
      status,
      last_attempt: lastAttempt,
      is_locked: isLocked,
      total_questions: questionCount
    };
  });
  const total = checkpoints.length;
  const achievedCount = checkpoints.filter((c) => c.status === "ACHIEVED").length;
  const developingCount = checkpoints.filter((c) => c.status === "DEVELOPING").length;
  const notStartedCount = checkpoints.filter((c) => c.status === "NOT_STARTED").length;
  res.json({
    student: {
      id: student.id,
      name: student.full_name,
      grade: student.grade,
      class_name: student.class_name
    },
    summary: {
      total,
      achieved: achievedCount,
      developing: developingCount,
      not_started: notStartedCount,
      completion_percentage: total > 0 ? Math.round(achievedCount / total * 100) : 0
    },
    checkpoints
  });
});
studentRouter.get("/competencies/:id", requireStudent, (req, res) => {
  const student = req.student;
  const competencyId = req.params.id;
  const comp = db.getCompetencyById(competencyId);
  if (!comp || !comp.active) {
    res.status(404).json({ error: "Kompetensi tidak ditemukan atau nonaktif." });
    return;
  }
  const prog = db.getSingleCompetencyProgress(student.id, comp.id);
  const status = prog ? prog.status : "NOT_STARTED";
  const attempts = db.getAttempts(student.id, comp.id);
  const questionsCount = db.getQuestions(comp.id, true).length;
  let prerequisite = null;
  let isLocked = false;
  if (comp.prerequisite_id) {
    const prereq = db.getCompetencyById(comp.prerequisite_id);
    if (prereq) {
      const prereqProg = db.getSingleCompetencyProgress(student.id, prereq.id);
      isLocked = !prereqProg || prereqProg.status !== "ACHIEVED";
      prerequisite = {
        id: prereq.id,
        code: prereq.code,
        name: prereq.name,
        status: prereqProg ? prereqProg.status : "NOT_STARTED",
        is_achieved: prereqProg?.status === "ACHIEVED"
      };
    }
  }
  res.json({
    competency: comp,
    student_status: status,
    is_locked: isLocked,
    prerequisite,
    total_questions: questionsCount,
    attempts_count: attempts.length,
    attempts: attempts.map((a) => ({
      id: a.id,
      started_at: a.started_at,
      submitted_at: a.submitted_at,
      correct_count: a.correct_count,
      question_count: a.question_count,
      percentage: a.percentage,
      mastery_status: a.mastery_status,
      ai_feedback: a.ai_feedback
    }))
  });
});
studentRouter.get("/assessments/:competencyId", requireStudent, (req, res) => {
  const competencyId = req.params.competencyId;
  const comp = db.getCompetencyById(competencyId);
  if (!comp || !comp.active) {
    res.status(404).json({ error: "Kompetensi asesmen tidak ditemukan." });
    return;
  }
  const questions = db.getQuestions(competencyId, true);
  if (questions.length === 0) {
    res.status(400).json({ error: "Belum ada bank soal aktif untuk kompetensi ini." });
    return;
  }
  const sanitized = questions.map((q) => ({
    id: q.id,
    competency_id: q.competency_id,
    question_text: q.question_text,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d,
    image_url: q.image_url,
    image_caption: q.image_caption,
    question_order: q.question_order
  }));
  res.json({
    competency: {
      id: comp.id,
      code: comp.code,
      name: comp.name,
      description: comp.description,
      mastery_threshold: comp.mastery_threshold
    },
    total_questions: sanitized.length,
    questions: sanitized
  });
});
studentRouter.post("/attempts", requireStudent, async (req, res) => {
  const student = req.student;
  const { competency_id, responses, started_at } = req.body;
  if (!competency_id || !responses || typeof responses !== "object") {
    res.status(400).json({ error: "Data asesmen tidak lengkap." });
    return;
  }
  const comp = db.getCompetencyById(competency_id);
  if (!comp || !comp.active) {
    res.status(404).json({ error: "Kompetensi tidak valid." });
    return;
  }
  const activeQuestions = db.getQuestions(competency_id, true);
  if (activeQuestions.length === 0) {
    res.status(400).json({ error: "Tidak ada soal aktif untuk kompetensi ini." });
    return;
  }
  const submittedAt = (/* @__PURE__ */ new Date()).toISOString();
  const startTime = started_at || new Date(Date.now() - 12e4).toISOString();
  let correctCount = 0;
  const incorrectList = [];
  const evaluatedResponses = [];
  for (const q of activeQuestions) {
    const rawSelected = responses[q.id];
    const selectedAnswer = rawSelected ? String(rawSelected).toUpperCase() : "A";
    const isCorrect = selectedAnswer === q.correct_answer;
    if (isCorrect) {
      correctCount++;
    } else {
      incorrectList.push({
        question: q.question_text,
        selectedAnswer: `${selectedAnswer}: ${q[`option_${selectedAnswer.toLowerCase()}`] || ""}`,
        correctAnswer: `${q.correct_answer}: ${q[`option_${q.correct_answer.toLowerCase()}`] || ""}`,
        explanation: q.explanation
      });
    }
    evaluatedResponses.push({
      question_id: q.id,
      selected_answer: selectedAnswer,
      is_correct: isCorrect,
      correct_answer: q.correct_answer,
      explanation: q.explanation
    });
  }
  const questionCount = activeQuestions.length;
  const percentage = Math.round(correctCount / questionCount * 100);
  const masteryStatus = percentage >= comp.mastery_threshold * 100 ? "ACHIEVED" : "DEVELOPING";
  const aiFeedback = await generateRemediationFeedback({
    competencyCode: comp.code,
    competencyName: comp.name,
    studentName: student.full_name,
    correctCount,
    totalCount: questionCount,
    percentage,
    masteryStatus,
    incorrectQuestions: incorrectList
  });
  const createdAttempt = db.createAttempt({
    student_id: student.id,
    competency_id: comp.id,
    started_at: startTime,
    submitted_at: submittedAt,
    correct_count: correctCount,
    question_count: questionCount,
    percentage,
    mastery_status: masteryStatus,
    ai_feedback: aiFeedback
  });
  db.createResponses(
    evaluatedResponses.map((r) => ({
      attempt_id: createdAttempt.id,
      student_id: student.id,
      question_id: r.question_id,
      selected_answer: r.selected_answer,
      is_correct: r.is_correct,
      answered_at: submittedAt
    }))
  );
  const existingProg = db.getSingleCompetencyProgress(student.id, comp.id);
  const newStatus = existingProg?.status === "ACHIEVED" && masteryStatus === "DEVELOPING" ? "ACHIEVED" : masteryStatus;
  const updatedProg = db.upsertCompetencyProgress(
    student.id,
    comp.id,
    newStatus,
    createdAttempt.id
  );
  db.addAuditLog(student.id, student.full_name, "student", "SUBMIT_ASSESSMENT", {
    attempt_id: createdAttempt.id,
    competency_code: comp.code,
    correct_count: correctCount,
    total: questionCount,
    percentage,
    mastery_status: masteryStatus,
    competency_status_now: updatedProg.status
  });
  res.json({
    attempt_id: createdAttempt.id,
    competency: {
      id: comp.id,
      code: comp.code,
      name: comp.name,
      mastery_threshold: comp.mastery_threshold
    },
    result: {
      correct_count: correctCount,
      question_count: questionCount,
      percentage,
      mastery_status: masteryStatus,
      competency_status: updatedProg.status,
      ai_feedback: aiFeedback,
      submitted_at: submittedAt
    },
    detailed_responses: evaluatedResponses.map((r) => {
      const q = activeQuestions.find((item) => item.id === r.question_id);
      return {
        question_id: q.id,
        question_text: q.question_text,
        image_url: q.image_url,
        image_caption: q.image_caption,
        options: {
          A: q.option_a,
          B: q.option_b,
          C: q.option_c,
          D: q.option_d
        },
        selected_answer: r.selected_answer,
        correct_answer: r.correct_answer,
        is_correct: r.is_correct,
        explanation: r.explanation
      };
    })
  });
});
studentRouter.get("/attempts/:id/result", requireStudent, (req, res) => {
  const student = req.student;
  const user = req.user;
  const attempt = db.getAttemptById(req.params.id);
  if (!attempt) {
    res.status(404).json({ error: "Riwayat asesmen tidak ditemukan." });
    return;
  }
  if (user.role === "student" && attempt.student_id !== student.id) {
    res.status(403).json({ error: "Akses ditolak. Anda tidak berhak melihat hasil siswa lain." });
    return;
  }
  const comp = db.getCompetencyById(attempt.competency_id);
  const responses = db.getResponsesByAttemptId(attempt.id);
  const questions = db.getQuestions(attempt.competency_id, false);
  const detailedResponses = responses.map((r) => {
    const q = questions.find((item) => item.id === r.question_id);
    return {
      question_id: r.question_id,
      question_text: q?.question_text || "Soal Asesmen",
      image_url: q?.image_url,
      image_caption: q?.image_caption,
      options: {
        A: q?.option_a || "",
        B: q?.option_b || "",
        C: q?.option_c || "",
        D: q?.option_d || ""
      },
      selected_answer: r.selected_answer,
      correct_answer: q?.correct_answer || "",
      is_correct: r.is_correct,
      explanation: q?.explanation || ""
    };
  });
  const prog = db.getSingleCompetencyProgress(attempt.student_id, attempt.competency_id);
  res.json({
    attempt: {
      id: attempt.id,
      started_at: attempt.started_at,
      submitted_at: attempt.submitted_at,
      correct_count: attempt.correct_count,
      question_count: attempt.question_count,
      percentage: attempt.percentage,
      mastery_status: attempt.mastery_status,
      ai_feedback: attempt.ai_feedback
    },
    competency: comp,
    competency_status: prog ? prog.status : "NOT_STARTED",
    responses: detailedResponses
  });
});
studentRouter.get("/progress", requireStudent, (req, res) => {
  const student = req.student;
  const attempts = db.getAttempts(student.id);
  const progressList = db.getCompetencyProgress(student.id);
  const competencies = db.getCompetencies();
  const progressOverview = competencies.map((c) => {
    const prog = progressList.find((p) => p.competency_id === c.id);
    const compAttempts = attempts.filter((a) => a.competency_id === c.id);
    return {
      competency: c,
      status: prog ? prog.status : "NOT_STARTED",
      last_updated: prog ? prog.last_updated_at : null,
      attempts_count: compAttempts.length,
      best_percentage: compAttempts.length > 0 ? Math.max(...compAttempts.map((a) => a.percentage)) : 0,
      latest_attempt: compAttempts[0] || null
    };
  });
  res.json({
    student: {
      id: student.id,
      name: student.full_name,
      grade: student.grade,
      class_name: student.class_name,
      email: student.email
    },
    competencies_progress: progressOverview,
    recent_attempts: attempts.slice(0, 10).map((a) => {
      const comp = competencies.find((c) => c.id === a.competency_id);
      return {
        ...a,
        competency_code: comp?.code || "",
        competency_name: comp?.name || ""
      };
    })
  });
});
studentRouter.get("/profile", requireStudent, (req, res) => {
  const student = req.student;
  const user = req.user;
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url
    },
    student: {
      id: student.id,
      full_name: student.full_name,
      email: student.email,
      grade: student.grade,
      class_name: student.class_name,
      created_at: student.created_at
    }
  });
});
studentRouter.get("/reflections", requireStudent, (req, res) => {
  const student = req.student;
  const rawReflections = db.getReflections(student.id);
  const competencies = db.getCompetencies();
  const enriched = rawReflections.map((r) => {
    const comp = r.competency_id ? competencies.find((c) => c.id === r.competency_id) : null;
    return {
      ...r,
      competency_code: comp?.code || "",
      competency_name: comp?.name || ""
    };
  });
  res.json({ reflections: enriched });
});
studentRouter.post("/reflections", requireStudent, async (req, res) => {
  const student = req.student;
  const { competency_id, mindset_feeling, challenge_description, action_plan, custom_action_text, readiness_level } = req.body;
  if (!mindset_feeling || !action_plan || !Array.isArray(action_plan)) {
    res.status(400).json({ error: "Perasaan mindset dan rencana aksi belajar wajib diisi." });
    return;
  }
  let competencyName = "";
  if (competency_id) {
    const comp = db.getCompetencyById(competency_id);
    if (comp) competencyName = `${comp.code} - ${comp.name}`;
  }
  const coachingFeedback = await generateGrowthMindsetCoaching({
    studentName: student.full_name,
    competencyName,
    feeling: mindset_feeling,
    challenge: challenge_description || "",
    actionPlan: action_plan,
    customAction: custom_action_text
  });
  const created = db.createReflection({
    student_id: student.id,
    competency_id: competency_id || null,
    mindset_feeling,
    challenge_description: challenge_description || "",
    action_plan,
    custom_action_text: custom_action_text || "",
    readiness_level: Number(readiness_level) || 3,
    ai_coaching_feedback: coachingFeedback
  });
  db.addAuditLog(student.id, student.full_name, "student", "SUBMIT_REFLECTION", {
    reflection_id: created.id,
    competency_id,
    feeling: mindset_feeling
  });
  res.status(201).json({
    message: "Refleksi berhasil disimpan! Tetap percaya pada proses belajarmu.",
    reflection: created
  });
});

// server/routes/teacher.ts
import { Router as Router3 } from "express";
var teacherRouter = Router3();
function requireTeacherOrAdmin(req, res, next) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    res.status(401).json({ error: "Autentikasi diperlukan." });
    return;
  }
  if (user.role !== "teacher" && user.role !== "admin") {
    res.status(403).json({ error: "Akses ditolak. Halaman ini hanya dapat diakses oleh Guru atau Administrator." });
    return;
  }
  req.user = user;
  next();
}
teacherRouter.use(requireTeacherOrAdmin);
teacherRouter.get("/dashboard", (_req, res) => {
  const students = db.getStudents();
  const competencies = db.getCompetencies();
  const attempts = db.getAttempts();
  let totalAchieved = 0;
  let totalDeveloping = 0;
  let totalNotStarted = 0;
  students.forEach((std) => {
    competencies.forEach((comp) => {
      const prog = db.getSingleCompetencyProgress(std.id, comp.id);
      const st = prog ? prog.status : "NOT_STARTED";
      if (st === "ACHIEVED") totalAchieved++;
      else if (st === "DEVELOPING") totalDeveloping++;
      else totalNotStarted++;
    });
  });
  const totalCells = students.length * competencies.length;
  const competencyStats = competencies.map((comp) => {
    let compAchieved = 0;
    let compDeveloping = 0;
    let compNotStarted = 0;
    students.forEach((std) => {
      const prog = db.getSingleCompetencyProgress(std.id, comp.id);
      const st = prog ? prog.status : "NOT_STARTED";
      if (st === "ACHIEVED") compAchieved++;
      else if (st === "DEVELOPING") compDeveloping++;
      else compNotStarted++;
    });
    const compAttempts = attempts.filter((a) => a.competency_id === comp.id);
    const avgScore = compAttempts.length > 0 ? Math.round(compAttempts.reduce((acc, cur) => acc + cur.percentage, 0) / compAttempts.length) : 0;
    return {
      competency_id: comp.id,
      code: comp.code,
      name: comp.name,
      threshold: comp.mastery_threshold,
      active: comp.active,
      achieved: compAchieved,
      developing: compDeveloping,
      not_started: compNotStarted,
      mastery_rate: students.length > 0 ? Math.round(compAchieved / students.length * 100) : 0,
      attempts_count: compAttempts.length,
      average_percentage: avgScore
    };
  });
  const recentActivities = attempts.slice(0, 8).map((att) => {
    const std = db.getStudentById(att.student_id);
    const comp = db.getCompetencyById(att.competency_id);
    return {
      id: att.id,
      student_id: att.student_id,
      student_name: std ? std.full_name : "Siswa",
      class_name: std?.class_name || "-",
      competency_code: comp?.code || "",
      competency_name: comp?.name || "",
      submitted_at: att.submitted_at,
      percentage: att.percentage,
      mastery_status: att.mastery_status,
      correct_count: att.correct_count,
      question_count: att.question_count
    };
  });
  res.json({
    total_students: students.length,
    total_competencies: competencies.length,
    total_attempts: attempts.length,
    distribution: {
      achieved: totalAchieved,
      developing: totalDeveloping,
      not_started: totalNotStarted,
      total_checkpoints: totalCells
    },
    competency_stats: competencyStats,
    recent_activities: recentActivities
  });
});
teacherRouter.get("/students", (req, res) => {
  const students = db.getStudents();
  const competencies = db.getCompetencies();
  const { class_filter, search } = req.query;
  let filtered = students;
  if (class_filter) {
    filtered = filtered.filter((s) => s.class_name === class_filter);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (s) => s.full_name.toLowerCase().includes(q) || s.email && s.email.toLowerCase().includes(q)
    );
  }
  const results = filtered.map((std) => {
    const progressMap = {};
    let studentAchieved = 0;
    let studentDeveloping = 0;
    let studentNotStarted = 0;
    competencies.forEach((comp) => {
      const prog = db.getSingleCompetencyProgress(std.id, comp.id);
      const st = prog ? prog.status : "NOT_STARTED";
      progressMap[comp.id] = st;
      if (st === "ACHIEVED") studentAchieved++;
      else if (st === "DEVELOPING") studentDeveloping++;
      else studentNotStarted++;
    });
    const attempts = db.getAttempts(std.id);
    const lastAttempt = attempts[0] || null;
    return {
      id: std.id,
      user_id: std.user_id,
      full_name: std.full_name,
      email: std.email,
      grade: std.grade,
      class_name: std.class_name,
      progress: progressMap,
      stats: {
        achieved: studentAchieved,
        developing: studentDeveloping,
        not_started: studentNotStarted,
        total: competencies.length,
        completion_rate: competencies.length > 0 ? Math.round(studentAchieved / competencies.length * 100) : 0
      },
      last_activity: lastAttempt ? lastAttempt.submitted_at : null,
      total_attempts: attempts.length
    };
  });
  const classes = Array.from(new Set(students.map((s) => s.class_name)));
  res.json({
    classes,
    students: results,
    competencies: competencies.map((c) => ({ id: c.id, code: c.code, name: c.name }))
  });
});
teacherRouter.get("/students/:id", (req, res) => {
  const student = db.getStudentById(req.params.id);
  if (!student) {
    res.status(404).json({ error: "Siswa tidak ditemukan." });
    return;
  }
  const competencies = db.getCompetencies();
  const attempts = db.getAttempts(student.id);
  const competencyDetails = competencies.map((comp) => {
    const prog = db.getSingleCompetencyProgress(student.id, comp.id);
    const compAttempts = attempts.filter((a) => a.competency_id === comp.id);
    return {
      competency: comp,
      status: prog ? prog.status : "NOT_STARTED",
      last_updated_at: prog ? prog.last_updated_at : null,
      attempts_count: compAttempts.length,
      attempts: compAttempts.map((a) => ({
        id: a.id,
        started_at: a.started_at,
        submitted_at: a.submitted_at,
        correct_count: a.correct_count,
        question_count: a.question_count,
        percentage: a.percentage,
        mastery_status: a.mastery_status,
        ai_feedback: a.ai_feedback
      }))
    };
  });
  res.json({
    student,
    competencies: competencyDetails,
    all_attempts: attempts.map((a) => {
      const comp = competencies.find((c) => c.id === a.competency_id);
      return {
        ...a,
        competency_code: comp?.code || "",
        competency_name: comp?.name || ""
      };
    })
  });
});
teacherRouter.get("/results", (req, res) => {
  const { competency_id, status, class_name } = req.query;
  const attempts = db.getAttempts();
  const students = db.getStudents();
  const competencies = db.getCompetencies();
  let filtered = attempts;
  if (competency_id) {
    filtered = filtered.filter((a) => a.competency_id === competency_id);
  }
  if (status) {
    filtered = filtered.filter((a) => a.mastery_status === status);
  }
  const enriched = filtered.map((a) => {
    const std = students.find((s) => s.id === a.student_id);
    const comp = competencies.find((c) => c.id === a.competency_id);
    return {
      ...a,
      student_name: std ? std.full_name : "Siswa",
      student_email: std?.email || "",
      class_name: std?.class_name || "-",
      competency_code: comp?.code || "",
      competency_name: comp?.name || ""
    };
  });
  const finalResults = class_name ? enriched.filter((r) => r.class_name === class_name) : enriched;
  res.json({
    total: finalResults.length,
    results: finalResults,
    competencies: competencies.map((c) => ({ id: c.id, code: c.code, name: c.name })),
    classes: Array.from(new Set(students.map((s) => s.class_name)))
  });
});
teacherRouter.get("/questions", (req, res) => {
  const { competency_id, include_archived } = req.query;
  const onlyActive = include_archived !== "true";
  const questions = db.getQuestions(competency_id, onlyActive);
  const competencies = db.getCompetencies();
  const enriched = questions.map((q) => {
    const comp = competencies.find((c) => c.id === q.competency_id);
    return {
      ...q,
      competency_code: comp?.code || "",
      competency_name: comp?.name || ""
    };
  });
  res.json({
    questions: enriched,
    competencies: competencies.map((c) => ({ id: c.id, code: c.code, name: c.name }))
  });
});
teacherRouter.post("/questions", (req, res) => {
  const user = req.user;
  const {
    competency_id,
    question_text,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_answer,
    explanation,
    question_order,
    image_url,
    image_caption
  } = req.body;
  if (!competency_id || !question_text || !option_a || !option_b || !option_c || !option_d || !correct_answer) {
    res.status(400).json({ error: "Seluruh komponen soal dan pilihan jawaban A, B, C, D wajib diisi." });
    return;
  }
  if (!["A", "B", "C", "D"].includes(correct_answer.toUpperCase())) {
    res.status(400).json({ error: "Kunci jawaban harus tepat satu di antara A, B, C, atau D." });
    return;
  }
  const comp = db.getCompetencyById(competency_id);
  if (!comp) {
    res.status(404).json({ error: "Kompetensi sasaran tidak ditemukan." });
    return;
  }
  const newQuestion = db.createQuestion({
    competency_id,
    question_text: question_text.trim(),
    option_a: option_a.trim(),
    option_b: option_b.trim(),
    option_c: option_c.trim(),
    option_d: option_d.trim(),
    correct_answer: correct_answer.toUpperCase(),
    explanation: explanation ? explanation.trim() : "",
    image_url: image_url ? image_url.trim() : void 0,
    image_caption: image_caption ? image_caption.trim() : void 0,
    question_order: Number(question_order) || 1,
    active: true,
    created_by: user.id
  });
  db.addAuditLog(user.id, user.name, user.role, "CREATE_QUESTION", {
    question_id: newQuestion.id,
    competency_code: comp.code
  });
  res.status(201).json({
    message: "Soal berhasil ditambahkan ke Bank Soal.",
    question: newQuestion
  });
});
teacherRouter.patch("/questions/:id", (req, res) => {
  const user = req.user;
  const qId = req.params.id;
  const updates = req.body;
  if (updates.correct_answer && !["A", "B", "C", "D"].includes(updates.correct_answer.toUpperCase())) {
    res.status(400).json({ error: "Kunci jawaban harus tepat satu di antara A, B, C, atau D." });
    return;
  }
  const updated = db.updateQuestion(qId, updates);
  if (!updated) {
    res.status(404).json({ error: "Soal tidak ditemukan." });
    return;
  }
  db.addAuditLog(user.id, user.name, user.role, "UPDATE_QUESTION", { question_id: qId });
  res.json({
    message: "Soal berhasil diperbarui.",
    question: updated
  });
});
teacherRouter.post("/questions/:id/archive", (req, res) => {
  const user = req.user;
  const qId = req.params.id;
  const success = db.archiveQuestion(qId);
  if (!success) {
    res.status(404).json({ error: "Soal tidak ditemukan." });
    return;
  }
  db.addAuditLog(user.id, user.name, user.role, "ARCHIVE_QUESTION", { question_id: qId });
  res.json({ message: "Soal berhasil diarsipkan (soft delete)." });
});
teacherRouter.get("/competencies", (_req, res) => {
  const competencies = db.getCompetencies();
  const questions = db.getQuestions(void 0, false);
  const enriched = competencies.map((c) => {
    const compQuestions = questions.filter((q) => q.competency_id === c.id);
    const activeQuestions = compQuestions.filter((q) => q.active);
    const prereq = c.prerequisite_id ? competencies.find((item) => item.id === c.prerequisite_id) : null;
    return {
      ...c,
      prerequisite: prereq ? { id: prereq.id, code: prereq.code, name: prereq.name } : null,
      total_questions: compQuestions.length,
      active_questions: activeQuestions.length
    };
  });
  res.json({ competencies: enriched });
});
teacherRouter.post("/competencies", (req, res) => {
  const user = req.user;
  const { code, name, description, sequence_order, prerequisite_id, mastery_threshold, active } = req.body;
  if (!code || !name) {
    res.status(400).json({ error: "Kode dan Nama kompetensi wajib diisi." });
    return;
  }
  const newComp = db.createCompetency({
    code: code.trim().toUpperCase(),
    name: name.trim(),
    description: description || "",
    sequence_order: Number(sequence_order) || 1,
    prerequisite_id: prerequisite_id || null,
    mastery_threshold: Number(mastery_threshold) || 0.8,
    active: active !== false
  });
  db.addAuditLog(user.id, user.name, user.role, "CREATE_COMPETENCY", {
    competency_id: newComp.id,
    code: newComp.code
  });
  res.status(201).json({
    message: "Kompetensi baru berhasil ditambahkan.",
    competency: newComp
  });
});
teacherRouter.patch("/competencies/:id", (req, res) => {
  const user = req.user;
  const compId = req.params.id;
  const updates = req.body;
  if (updates.prerequisite_id === compId) {
    res.status(400).json({ error: "Kompetensi tidak dapat menjadi prasyarat untuk dirinya sendiri." });
    return;
  }
  const updated = db.updateCompetency(compId, updates);
  if (!updated) {
    res.status(404).json({ error: "Kompetensi tidak ditemukan." });
    return;
  }
  db.addAuditLog(user.id, user.name, user.role, "UPDATE_COMPETENCY", {
    competency_id: compId,
    code: updated.code
  });
  res.json({
    message: "Konfigurasi kompetensi berhasil diperbarui.",
    competency: updated
  });
});
teacherRouter.get("/analytics", (_req, res) => {
  const students = db.getStudents();
  const competencies = db.getCompetencies();
  const attempts = db.getAttempts();
  const heatmap = students.map((std) => {
    const compStatusList = competencies.map((c) => {
      const prog = db.getSingleCompetencyProgress(std.id, c.id);
      const atts = attempts.filter((a) => a.student_id === std.id && a.competency_id === c.id);
      const latest = atts[0] || null;
      return {
        competency_id: c.id,
        code: c.code,
        status: prog ? prog.status : "NOT_STARTED",
        percentage: latest ? latest.percentage : null,
        attempts: atts.length
      };
    });
    return {
      student_id: std.id,
      student_name: std.full_name,
      class_name: std.class_name,
      competencies: compStatusList
    };
  });
  const remediationGroups = competencies.map((comp) => {
    const developingStudents = students.filter((s) => {
      const p = db.getSingleCompetencyProgress(s.id, comp.id);
      return p && p.status === "DEVELOPING";
    }).map((s) => {
      const p = db.getSingleCompetencyProgress(s.id, comp.id);
      const att = p?.last_attempt_id ? db.getAttemptById(p.last_attempt_id) : null;
      return {
        id: s.id,
        name: s.full_name,
        class_name: s.class_name,
        latest_score: att?.percentage || 0,
        submitted_at: att?.submitted_at || null
      };
    });
    return {
      competency_id: comp.id,
      code: comp.code,
      name: comp.name,
      developing_count: developingStudents.length,
      students: developingStudents
    };
  });
  res.json({
    heatmap,
    remediation_groups: remediationGroups
  });
});
teacherRouter.get("/audit-logs", (_req, res) => {
  const logs = db.getAuditLogs();
  res.json({ logs: logs.slice(0, 50) });
});
teacherRouter.get("/database", (_req, res) => {
  const raw = db.getRawData();
  res.json({
    summary: {
      users_count: raw.users.length,
      students_count: raw.students.length,
      competencies_count: raw.competencies.length,
      competency_progress_count: raw.competency_progress.length,
      questions_count: raw.questions.length,
      attempts_count: raw.attempts.length,
      responses_count: raw.responses.length,
      audit_logs_count: raw.audit_logs.length
    },
    database: raw
  });
});
teacherRouter.post("/database/reset", (req, res) => {
  const user = req.user;
  db.resetToSeed();
  db.addAuditLog(user.id, user.name, user.role, "DATABASE_RESET", {
    message: "Database berhasil di-reset ke kondisi data awal (seed)."
  });
  res.json({ message: "Database berhasil di-reset ke seed awal." });
});
teacherRouter.get("/users-management", (_req, res) => {
  const allUsers = db.getUsers();
  const students = db.getStudents();
  const userList = allUsers.map((u) => {
    const studentProfile = u.role === "student" ? students.find((s) => s.user_id === u.id) : null;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatar_url: u.avatar_url,
      grade: studentProfile?.grade || "-",
      class_name: studentProfile?.class_name || "-",
      created_at: u.created_at
    };
  });
  res.json({ users: userList });
});
teacherRouter.patch("/users/:id/role", (req, res) => {
  const actor = req.user;
  const { id } = req.params;
  const { new_role } = req.body;
  if (!["student", "teacher", "admin"].includes(new_role)) {
    res.status(400).json({ error: "Role tidak valid. Pilihan: student, teacher, admin." });
    return;
  }
  const targetUser = db.getUserById(id);
  if (!targetUser) {
    res.status(404).json({ error: "Pengguna tidak ditemukan." });
    return;
  }
  const oldRole = targetUser.role;
  const updated = db.updateUserRole(id, new_role);
  db.addAuditLog(actor.id, actor.name, actor.role, "UPDATE_USER_ROLE", {
    target_user_id: id,
    target_user_name: targetUser.name,
    old_role: oldRole,
    new_role
  });
  res.json({
    message: `Role pengguna ${targetUser.name} berhasil diubah dari ${oldRole} menjadi ${new_role}.`,
    user: updated
  });
});
teacherRouter.patch("/users/:id", (req, res) => {
  const actor = req.user;
  const { id } = req.params;
  const { name, email, role, password, grade, class_name } = req.body;
  const target = db.getUserById(id);
  if (!target) {
    res.status(404).json({ error: "Pengguna tidak ditemukan." });
    return;
  }
  if (email && email.toLowerCase() !== target.email.toLowerCase()) {
    const existing = db.getUserByEmail(email);
    if (existing && existing.id !== id) {
      res.status(400).json({ error: "Email tersebut sudah digunakan pengguna lain." });
      return;
    }
  }
  if (role && !["student", "teacher", "admin"].includes(role)) {
    res.status(400).json({ error: "Role tidak valid." });
    return;
  }
  const updated = db.updateUser(id, {
    name,
    email,
    role,
    password,
    grade,
    class_name
  });
  db.addAuditLog(actor.id, actor.name, actor.role, "UPDATE_USER_PROFILE", {
    target_user_id: id,
    target_user_name: name || target.name,
    updates: { name, email, role, class_name }
  });
  res.json({
    message: `Perubahan data pengguna ${updated?.name || ""} berhasil disimpan.`,
    user: updated
  });
});
teacherRouter.post("/users", (req, res) => {
  const actor = req.user;
  const { name, email, role, password, grade, class_name } = req.body;
  if (!name || !email || !role) {
    res.status(400).json({ error: "Nama, email, dan role wajib diisi." });
    return;
  }
  const existing = db.getUserByEmail(email);
  if (existing) {
    res.status(400).json({ error: "Email sudah terdaftar dalam sistem." });
    return;
  }
  const created = db.createUser({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role,
    password: password || "password123",
    grade,
    class_name
  });
  db.addAuditLog(actor.id, actor.name, actor.role, "CREATE_USER", {
    created_user_id: created.id,
    created_user_name: created.name,
    role
  });
  res.status(201).json({
    message: `Pengguna baru ${created.name} berhasil dibuat dengan role ${role}.`,
    user: created
  });
});
teacherRouter.post("/users/:id/reset-password", (req, res) => {
  const actor = req.user;
  const { id } = req.params;
  const { new_password } = req.body;
  const target = db.getUserById(id);
  if (!target) {
    res.status(404).json({ error: "Pengguna tidak ditemukan." });
    return;
  }
  db.resetUserPassword(id, new_password || "password123");
  db.addAuditLog(actor.id, actor.name, actor.role, "RESET_USER_PASSWORD", {
    target_user_id: id,
    target_user_name: target.name
  });
  res.json({ message: `Kata sandi untuk ${target.name} berhasil di-reset ke 'password123'.` });
});
teacherRouter.get("/reflections", (req, res) => {
  const { search, class_filter, competency_id, feeling_filter } = req.query;
  const rawReflections = db.getReflections();
  const students = db.getStudents();
  const competencies = db.getCompetencies();
  const enriched = rawReflections.map((r) => {
    const student = students.find((s) => s.id === r.student_id);
    const comp = r.competency_id ? competencies.find((c) => c.id === r.competency_id) : null;
    return {
      id: r.id,
      student_id: r.student_id,
      student_user_id: student?.user_id,
      student_name: student?.full_name || "Siswa",
      student_email: student?.email || "-",
      student_grade: student?.grade || "Kelas X",
      student_class: student?.class_name || "X-MIPA 1",
      competency_id: r.competency_id,
      competency_code: comp?.code || "-",
      competency_name: comp?.name || "Refleksi Umum Pembelajaran",
      mindset_feeling: r.mindset_feeling,
      challenge_description: r.challenge_description,
      action_plan: r.action_plan || [],
      custom_action_text: r.custom_action_text || "",
      readiness_level: r.readiness_level || 3,
      ai_coaching_feedback: r.ai_coaching_feedback,
      teacher_note: r.teacher_note,
      teacher_note_by: r.teacher_note_by,
      teacher_note_at: r.teacher_note_at,
      created_at: r.created_at
    };
  });
  let filtered = enriched;
  if (search && typeof search === "string") {
    const query = search.toLowerCase().trim();
    filtered = filtered.filter(
      (item) => item.student_name.toLowerCase().includes(query) || item.student_email.toLowerCase().includes(query) || item.competency_name.toLowerCase().includes(query) || item.competency_code.toLowerCase().includes(query) || item.challenge_description.toLowerCase().includes(query) || item.custom_action_text.toLowerCase().includes(query) || item.action_plan.some((a) => a.toLowerCase().includes(query))
    );
  }
  if (class_filter && typeof class_filter === "string") {
    filtered = filtered.filter((item) => item.student_class === class_filter);
  }
  if (competency_id && typeof competency_id === "string") {
    filtered = filtered.filter((item) => item.competency_id === competency_id);
  }
  if (feeling_filter && typeof feeling_filter === "string") {
    filtered = filtered.filter((item) => item.mindset_feeling.toLowerCase().includes(feeling_filter.toLowerCase()));
  }
  const totalReflections = enriched.length;
  const uniqueStudentIds = new Set(enriched.map((r) => r.student_id));
  const avgReadiness = totalReflections > 0 ? (enriched.reduce((acc, r) => acc + (r.readiness_level || 3), 0) / totalReflections).toFixed(1) : "0";
  const feelingCounts = {};
  enriched.forEach((r) => {
    feelingCounts[r.mindset_feeling] = (feelingCounts[r.mindset_feeling] || 0) + 1;
  });
  const actionCounts = {};
  enriched.forEach((r) => {
    r.action_plan.forEach((act) => {
      actionCounts[act] = (actionCounts[act] || 0) + 1;
    });
  });
  const classes = Array.from(new Set(students.map((s) => s.class_name).filter(Boolean))).sort();
  res.json({
    reflections: filtered,
    stats: {
      total_reflections: totalReflections,
      unique_students_count: uniqueStudentIds.size,
      average_readiness: Number(avgReadiness),
      feeling_distribution: feelingCounts,
      top_actions: actionCounts
    },
    classes,
    competencies: competencies.map((c) => ({ id: c.id, code: c.code, name: c.name }))
  });
});
teacherRouter.patch("/reflections/:id/note", (req, res) => {
  const actor = req.user;
  const { id } = req.params;
  const { note } = req.body;
  if (typeof note !== "string") {
    res.status(400).json({ error: "Catatan guru harus berupa teks string." });
    return;
  }
  const updated = db.updateReflectionTeacherNote(id, note.trim(), actor.name);
  if (!updated) {
    res.status(404).json({ error: "Refleksi tidak ditemukan." });
    return;
  }
  db.addAuditLog(actor.id, actor.name, actor.role, "UPDATE_REFLECTION_NOTE", {
    reflection_id: id,
    student_id: updated.student_id
  });
  res.json({
    message: "Catatan apresiasi guru berhasil disimpan.",
    reflection: updated
  });
});

// server/api-app.ts
function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (/^http:\/\/localhost:\d+$/i.test(origin)) return true;
  if (origin.startsWith("https://") && origin.endsWith(".vercel.app")) return true;
  const allowed = (process.env.FRONTEND_ORIGIN || "").split(",").map((value) => value.trim()).filter(Boolean);
  if (allowed.includes("*")) return true;
  return allowed.includes(origin);
}
function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, x-user-id"
    );
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
  }
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
}
async function createApiApp(options = {}) {
  const { logRequests = true } = options;
  if (process.env.VERCEL && !isPostgresEnabled()) {
    throw new Error(
      "DATABASE_URL is required on Vercel. Add Neon pooled URI in Project \u2192 Settings \u2192 Environment Variables."
    );
  }
  await db.ready();
  if (isPostgresEnabled()) {
    await pingDatabase();
  }
  const app = express();
  app.use(corsMiddleware);
  app.use(express.json({ limit: "6mb" }));
  if (logRequests) {
    app.use((req, _res, next) => {
      if (req.path.startsWith("/api")) {
        console.log(`[API] ${req.method} ${req.path}`);
      }
      next();
    });
  }
  app.use("/api/auth", authRouter);
  app.use("/api/student", studentRouter);
  app.use("/api/teacher", teacherRouter);
  app.get("/api/health", async (_req, res) => {
    let postgres = false;
    if (isPostgresEnabled()) {
      try {
        postgres = await pingDatabase();
      } catch {
        postgres = false;
      }
    }
    const ok = !isPostgresEnabled() || postgres;
    res.status(ok ? 200 : 503).json({
      status: ok ? "ok" : "degraded",
      service: "Personal Learning Journey API",
      storage: isPostgresEnabled() ? "neon" : "file",
      postgres,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app.use((err, _req, res, _next) => {
    console.error("Unhandled server error:", err);
    res.status(500).json({
      error: "Terjadi kesalahan internal pada server.",
      message: err.message
    });
  });
  return app;
}

// server/vercel-handler.ts
var maxDuration = 30;
var appPromise = null;
function getApp() {
  if (!appPromise) {
    appPromise = createApiApp({ logRequests: true });
  }
  return appPromise;
}
async function handler(req, res) {
  try {
    const app = await getApp();
    app(req, res);
  } catch (err) {
    console.error("[api] handler failed:", err);
    if (!res.headersSent) {
      res.status(500).json({
        error: "API initialization failed",
        message: err instanceof Error ? err.message : String(err)
      });
    }
  }
}
export {
  handler as default,
  maxDuration
};
