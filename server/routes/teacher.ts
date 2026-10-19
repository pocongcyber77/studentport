import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { getAuthenticatedUser } from './auth.js';

export const teacherRouter = Router();

// Middleware: require teacher or admin role
function requireTeacherOrAdmin(req: Request, res: Response, next: () => void) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    res.status(401).json({ error: 'Autentikasi diperlukan.' });
    return;
  }
  if (user.role !== 'teacher' && user.role !== 'admin') {
    res.status(403).json({ error: 'Akses ditolak. Halaman ini hanya dapat diakses oleh Guru atau Administrator.' });
    return;
  }
  (req as any).user = user;
  next();
}

teacherRouter.use(requireTeacherOrAdmin);

// GET /api/teacher/dashboard
// Overview statistics, status distribution, recent activities
teacherRouter.get('/dashboard', (_req: Request, res: Response) => {
  const students = db.getStudents();
  const competencies = db.getCompetencies();
  const attempts = db.getAttempts();

  // Aggregate progress statuses across all students
  let totalAchieved = 0;
  let totalDeveloping = 0;
  let totalNotStarted = 0;

  students.forEach(std => {
    competencies.forEach(comp => {
      const prog = db.getSingleCompetencyProgress(std.id, comp.id);
      const st = prog ? prog.status : 'NOT_STARTED';
      if (st === 'ACHIEVED') totalAchieved++;
      else if (st === 'DEVELOPING') totalDeveloping++;
      else totalNotStarted++;
    });
  });

  const totalCells = students.length * competencies.length;

  // Competency mastery breakdown
  const competencyStats = competencies.map(comp => {
    let compAchieved = 0;
    let compDeveloping = 0;
    let compNotStarted = 0;

    students.forEach(std => {
      const prog = db.getSingleCompetencyProgress(std.id, comp.id);
      const st = prog ? prog.status : 'NOT_STARTED';
      if (st === 'ACHIEVED') compAchieved++;
      else if (st === 'DEVELOPING') compDeveloping++;
      else compNotStarted++;
    });

    const compAttempts = attempts.filter(a => a.competency_id === comp.id);
    const avgScore = compAttempts.length > 0
      ? Math.round(compAttempts.reduce((acc, cur) => acc + cur.percentage, 0) / compAttempts.length)
      : 0;

    return {
      competency_id: comp.id,
      code: comp.code,
      name: comp.name,
      threshold: comp.mastery_threshold,
      active: comp.active,
      achieved: compAchieved,
      developing: compDeveloping,
      not_started: compNotStarted,
      mastery_rate: students.length > 0 ? Math.round((compAchieved / students.length) * 100) : 0,
      attempts_count: compAttempts.length,
      average_percentage: avgScore,
    };
  });

  // Recent attempts with student and competency names
  const recentActivities = attempts.slice(0, 8).map(att => {
    const std = db.getStudentById(att.student_id);
    const comp = db.getCompetencyById(att.competency_id);
    return {
      id: att.id,
      student_id: att.student_id,
      student_name: std ? std.full_name : 'Siswa',
      class_name: std?.class_name || '-',
      competency_code: comp?.code || '',
      competency_name: comp?.name || '',
      submitted_at: att.submitted_at,
      percentage: att.percentage,
      mastery_status: att.mastery_status,
      correct_count: att.correct_count,
      question_count: att.question_count,
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
      total_checkpoints: totalCells,
    },
    competency_stats: competencyStats,
    recent_activities: recentActivities,
  });
});

// GET /api/teacher/students
// List students with class and competency progress matrix
teacherRouter.get('/students', (req: Request, res: Response) => {
  const students = db.getStudents();
  const competencies = db.getCompetencies();
  const { class_filter, search } = req.query;

  let filtered = students;
  if (class_filter) {
    filtered = filtered.filter(s => s.class_name === class_filter);
  }
  if (search) {
    const q = (search as string).toLowerCase();
    filtered = filtered.filter(s =>
      s.full_name.toLowerCase().includes(q) || (s.email && s.email.toLowerCase().includes(q))
    );
  }

  const results = filtered.map(std => {
    const progressMap: Record<string, string> = {};
    let studentAchieved = 0;
    let studentDeveloping = 0;
    let studentNotStarted = 0;

    competencies.forEach(comp => {
      const prog = db.getSingleCompetencyProgress(std.id, comp.id);
      const st = prog ? prog.status : 'NOT_STARTED';
      progressMap[comp.id] = st;
      if (st === 'ACHIEVED') studentAchieved++;
      else if (st === 'DEVELOPING') studentDeveloping++;
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
        completion_rate: competencies.length > 0 ? Math.round((studentAchieved / competencies.length) * 100) : 0,
      },
      last_activity: lastAttempt ? lastAttempt.submitted_at : null,
      total_attempts: attempts.length,
    };
  });

  const classes = Array.from(new Set(students.map(s => s.class_name)));

  res.json({
    classes,
    students: results,
    competencies: competencies.map(c => ({ id: c.id, code: c.code, name: c.name })),
  });
});

// GET /api/teacher/students/:id
// Individual student drill-down
teacherRouter.get('/students/:id', (req: Request, res: Response) => {
  const student = db.getStudentById(req.params.id);
  if (!student) {
    res.status(404).json({ error: 'Siswa tidak ditemukan.' });
    return;
  }

  const competencies = db.getCompetencies();
  const attempts = db.getAttempts(student.id);

  const competencyDetails = competencies.map(comp => {
    const prog = db.getSingleCompetencyProgress(student.id, comp.id);
    const compAttempts = attempts.filter(a => a.competency_id === comp.id);
    return {
      competency: comp,
      status: prog ? prog.status : 'NOT_STARTED',
      last_updated_at: prog ? prog.last_updated_at : null,
      attempts_count: compAttempts.length,
      attempts: compAttempts.map(a => ({
        id: a.id,
        started_at: a.started_at,
        submitted_at: a.submitted_at,
        correct_count: a.correct_count,
        question_count: a.question_count,
        percentage: a.percentage,
        mastery_status: a.mastery_status,
        ai_feedback: a.ai_feedback,
      })),
    };
  });

  res.json({
    student,
    competencies: competencyDetails,
    all_attempts: attempts.map(a => {
      const comp = competencies.find(c => c.id === a.competency_id);
      return {
        ...a,
        competency_code: comp?.code || '',
        competency_name: comp?.name || '',
      };
    }),
  });
});

// GET /api/teacher/results
// Assessment attempts history
teacherRouter.get('/results', (req: Request, res: Response) => {
  const { competency_id, status, class_name } = req.query;
  const attempts = db.getAttempts();
  const students = db.getStudents();
  const competencies = db.getCompetencies();

  let filtered = attempts;

  if (competency_id) {
    filtered = filtered.filter(a => a.competency_id === competency_id);
  }
  if (status) {
    filtered = filtered.filter(a => a.mastery_status === status);
  }

  const enriched = filtered.map(a => {
    const std = students.find(s => s.id === a.student_id);
    const comp = competencies.find(c => c.id === a.competency_id);
    return {
      ...a,
      student_name: std ? std.full_name : 'Siswa',
      student_email: std?.email || '',
      class_name: std?.class_name || '-',
      competency_code: comp?.code || '',
      competency_name: comp?.name || '',
    };
  });

  const finalResults = class_name
    ? enriched.filter(r => r.class_name === class_name)
    : enriched;

  res.json({
    total: finalResults.length,
    results: finalResults,
    competencies: competencies.map(c => ({ id: c.id, code: c.code, name: c.name })),
    classes: Array.from(new Set(students.map(s => s.class_name))),
  });
});

// --- Question Bank ---

// GET /api/teacher/questions
teacherRouter.get('/questions', (req: Request, res: Response) => {
  const { competency_id, include_archived } = req.query;
  const onlyActive = include_archived !== 'true';
  const questions = db.getQuestions(competency_id as string, onlyActive);
  const competencies = db.getCompetencies();

  const enriched = questions.map(q => {
    const comp = competencies.find(c => c.id === q.competency_id);
    return {
      ...q,
      competency_code: comp?.code || '',
      competency_name: comp?.name || '',
    };
  });

  res.json({
    questions: enriched,
    competencies: competencies.map(c => ({ id: c.id, code: c.code, name: c.name })),
  });
});

// POST /api/teacher/questions
teacherRouter.post('/questions', (req: Request, res: Response) => {
  const user = (req as any).user;
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
    image_caption,
  } = req.body;

  if (!competency_id || !question_text || !option_a || !option_b || !option_c || !option_d || !correct_answer) {
    res.status(400).json({ error: 'Seluruh komponen soal dan pilihan jawaban A, B, C, D wajib diisi.' });
    return;
  }

  if (!['A', 'B', 'C', 'D'].includes(correct_answer.toUpperCase())) {
    res.status(400).json({ error: 'Kunci jawaban harus tepat satu di antara A, B, C, atau D.' });
    return;
  }

  const comp = db.getCompetencyById(competency_id);
  if (!comp) {
    res.status(404).json({ error: 'Kompetensi sasaran tidak ditemukan.' });
    return;
  }

  const newQuestion = db.createQuestion({
    competency_id,
    question_text: question_text.trim(),
    option_a: option_a.trim(),
    option_b: option_b.trim(),
    option_c: option_c.trim(),
    option_d: option_d.trim(),
    correct_answer: correct_answer.toUpperCase() as 'A' | 'B' | 'C' | 'D',
    explanation: explanation ? explanation.trim() : '',
    image_url: image_url ? image_url.trim() : undefined,
    image_caption: image_caption ? image_caption.trim() : undefined,
    question_order: Number(question_order) || 1,
    active: true,
    created_by: user.id,
  });

  db.addAuditLog(user.id, user.name, user.role, 'CREATE_QUESTION', {
    question_id: newQuestion.id,
    competency_code: comp.code,
  });

  res.status(201).json({
    message: 'Soal berhasil ditambahkan ke Bank Soal.',
    question: newQuestion,
  });
});

// PATCH /api/teacher/questions/:id
teacherRouter.patch('/questions/:id', (req: Request, res: Response) => {
  const user = (req as any).user;
  const qId = req.params.id;
  const updates = req.body;

  if (updates.correct_answer && !['A', 'B', 'C', 'D'].includes(updates.correct_answer.toUpperCase())) {
    res.status(400).json({ error: 'Kunci jawaban harus tepat satu di antara A, B, C, atau D.' });
    return;
  }

  const updated = db.updateQuestion(qId, updates);
  if (!updated) {
    res.status(404).json({ error: 'Soal tidak ditemukan.' });
    return;
  }

  db.addAuditLog(user.id, user.name, user.role, 'UPDATE_QUESTION', { question_id: qId });

  res.json({
    message: 'Soal berhasil diperbarui.',
    question: updated,
  });
});

// POST /api/teacher/questions/:id/archive
teacherRouter.post('/questions/:id/archive', (req: Request, res: Response) => {
  const user = (req as any).user;
  const qId = req.params.id;

  const success = db.archiveQuestion(qId);
  if (!success) {
    res.status(404).json({ error: 'Soal tidak ditemukan.' });
    return;
  }

  db.addAuditLog(user.id, user.name, user.role, 'ARCHIVE_QUESTION', { question_id: qId });

  res.json({ message: 'Soal berhasil diarsipkan (soft delete).' });
});

// --- Competencies ---

// GET /api/teacher/competencies
teacherRouter.get('/competencies', (_req: Request, res: Response) => {
  const competencies = db.getCompetencies();
  const questions = db.getQuestions(undefined, false);

  const enriched = competencies.map(c => {
    const compQuestions = questions.filter(q => q.competency_id === c.id);
    const activeQuestions = compQuestions.filter(q => q.active);
    const prereq = c.prerequisite_id ? competencies.find(item => item.id === c.prerequisite_id) : null;

    return {
      ...c,
      prerequisite: prereq ? { id: prereq.id, code: prereq.code, name: prereq.name } : null,
      total_questions: compQuestions.length,
      active_questions: activeQuestions.length,
    };
  });

  res.json({ competencies: enriched });
});

// POST /api/teacher/competencies
teacherRouter.post('/competencies', (req: Request, res: Response) => {
  const user = (req as any).user;
  const { code, name, description, sequence_order, prerequisite_id, mastery_threshold, active } = req.body;

  if (!code || !name) {
    res.status(400).json({ error: 'Kode dan Nama kompetensi wajib diisi.' });
    return;
  }

  const newComp = db.createCompetency({
    code: code.trim().toUpperCase(),
    name: name.trim(),
    description: description || '',
    sequence_order: Number(sequence_order) || 1,
    prerequisite_id: prerequisite_id || null,
    mastery_threshold: Number(mastery_threshold) || 0.8,
    active: active !== false,
  });

  db.addAuditLog(user.id, user.name, user.role, 'CREATE_COMPETENCY', {
    competency_id: newComp.id,
    code: newComp.code,
  });

  res.status(201).json({
    message: 'Kompetensi baru berhasil ditambahkan.',
    competency: newComp,
  });
});

// PATCH /api/teacher/competencies/:id
teacherRouter.patch('/competencies/:id', (req: Request, res: Response) => {
  const user = (req as any).user;
  const compId = req.params.id;
  const updates = req.body;

  // Prevent circular prerequisite
  if (updates.prerequisite_id === compId) {
    res.status(400).json({ error: 'Kompetensi tidak dapat menjadi prasyarat untuk dirinya sendiri.' });
    return;
  }

  const updated = db.updateCompetency(compId, updates);
  if (!updated) {
    res.status(404).json({ error: 'Kompetensi tidak ditemukan.' });
    return;
  }

  db.addAuditLog(user.id, user.name, user.role, 'UPDATE_COMPETENCY', {
    competency_id: compId,
    code: updated.code,
  });

  res.json({
    message: 'Konfigurasi kompetensi berhasil diperbarui.',
    competency: updated,
  });
});

// GET /api/teacher/analytics
teacherRouter.get('/analytics', (_req: Request, res: Response) => {
  const students = db.getStudents();
  const competencies = db.getCompetencies();
  const attempts = db.getAttempts();

  // Heatmap: Matrix of Student x Competency
  const heatmap = students.map(std => {
    const compStatusList = competencies.map(c => {
      const prog = db.getSingleCompetencyProgress(std.id, c.id);
      const atts = attempts.filter(a => a.student_id === std.id && a.competency_id === c.id);
      const latest = atts[0] || null;
      return {
        competency_id: c.id,
        code: c.code,
        status: prog ? prog.status : 'NOT_STARTED',
        percentage: latest ? latest.percentage : null,
        attempts: atts.length,
      };
    });

    return {
      student_id: std.id,
      student_name: std.full_name,
      class_name: std.class_name,
      competencies: compStatusList,
    };
  });

  // Students developing breakdown (needing remediation)
  const remediationGroups = competencies.map(comp => {
    const developingStudents = students.filter(s => {
      const p = db.getSingleCompetencyProgress(s.id, comp.id);
      return p && p.status === 'DEVELOPING';
    }).map(s => {
      const p = db.getSingleCompetencyProgress(s.id, comp.id);
      const att = p?.last_attempt_id ? db.getAttemptById(p.last_attempt_id) : null;
      return {
        id: s.id,
        name: s.full_name,
        class_name: s.class_name,
        latest_score: att?.percentage || 0,
        submitted_at: att?.submitted_at || null,
      };
    });

    return {
      competency_id: comp.id,
      code: comp.code,
      name: comp.name,
      developing_count: developingStudents.length,
      students: developingStudents,
    };
  });

  res.json({
    heatmap,
    remediation_groups: remediationGroups,
  });
});

// GET /api/teacher/audit-logs
teacherRouter.get('/audit-logs', (_req: Request, res: Response) => {
  const logs = db.getAuditLogs();
  res.json({ logs: logs.slice(0, 50) });
});

// GET /api/teacher/database (Live Database Inspector)
teacherRouter.get('/database', (_req: Request, res: Response) => {
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
      audit_logs_count: raw.audit_logs.length,
    },
    database: raw,
  });
});

// POST /api/teacher/database/reset
teacherRouter.post('/database/reset', (req: Request, res: Response) => {
  const user = (req as any).user;
  db.resetToSeed();
  db.addAuditLog(user.id, user.name, user.role, 'DATABASE_RESET', {
    message: 'Database berhasil di-reset ke kondisi data awal (seed).',
  });
  res.json({ message: 'Database berhasil di-reset ke seed awal.' });
});

// GET /api/teacher/users-management
// Only teachers and admins can view and manage user roles
teacherRouter.get('/users-management', (_req: Request, res: Response) => {
  const allUsers = db.getUsers();
  const students = db.getStudents();

  const userList = allUsers.map(u => {
    const studentProfile = u.role === 'student' ? students.find(s => s.user_id === u.id) : null;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatar_url: u.avatar_url,
      grade: studentProfile?.grade || '-',
      class_name: studentProfile?.class_name || '-',
      created_at: u.created_at,
    };
  });

  res.json({ users: userList });
});

// PATCH /api/teacher/users/:id/role
// Update user's role
teacherRouter.patch('/users/:id/role', (req: Request, res: Response) => {
  const actor = (req as any).user;
  const { id } = req.params;
  const { new_role } = req.body;

  if (!['student', 'teacher', 'admin'].includes(new_role)) {
    res.status(400).json({ error: 'Role tidak valid. Pilihan: student, teacher, admin.' });
    return;
  }

  const targetUser = db.getUserById(id);
  if (!targetUser) {
    res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
    return;
  }

  const oldRole = targetUser.role;
  const updated = db.updateUserRole(id, new_role as any);

  // Add audit log
  db.addAuditLog(actor.id, actor.name, actor.role, 'UPDATE_USER_ROLE', {
    target_user_id: id,
    target_user_name: targetUser.name,
    old_role: oldRole,
    new_role,
  });

  res.json({
    message: `Role pengguna ${targetUser.name} berhasil diubah dari ${oldRole} menjadi ${new_role}.`,
    user: updated,
  });
});

// PATCH /api/teacher/users/:id
// Update user profile details (name, email, role, class_name, password)
teacherRouter.patch('/users/:id', (req: Request, res: Response) => {
  const actor = (req as any).user;
  const { id } = req.params;
  const { name, email, role, password, grade, class_name } = req.body;

  const target = db.getUserById(id);
  if (!target) {
    res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
    return;
  }

  if (email && email.toLowerCase() !== target.email.toLowerCase()) {
    const existing = db.getUserByEmail(email);
    if (existing && existing.id !== id) {
      res.status(400).json({ error: 'Email tersebut sudah digunakan pengguna lain.' });
      return;
    }
  }

  if (role && !['student', 'teacher', 'admin'].includes(role)) {
    res.status(400).json({ error: 'Role tidak valid.' });
    return;
  }

  const updated = db.updateUser(id, {
    name,
    email,
    role,
    password,
    grade,
    class_name,
  });

  db.addAuditLog(actor.id, actor.name, actor.role, 'UPDATE_USER_PROFILE', {
    target_user_id: id,
    target_user_name: name || target.name,
    updates: { name, email, role, class_name },
  });

  res.json({
    message: `Perubahan data pengguna ${updated?.name || ''} berhasil disimpan.`,
    user: updated,
  });
});

// POST /api/teacher/users
// Register a new user with specific role
teacherRouter.post('/users', (req: Request, res: Response) => {
  const actor = (req as any).user;
  const { name, email, role, password, grade, class_name } = req.body;

  if (!name || !email || !role) {
    res.status(400).json({ error: 'Nama, email, dan role wajib diisi.' });
    return;
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    res.status(400).json({ error: 'Email sudah terdaftar dalam sistem.' });
    return;
  }

  const created = db.createUser({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role,
    password: password || 'password123',
    grade,
    class_name,
  });

  db.addAuditLog(actor.id, actor.name, actor.role, 'CREATE_USER', {
    created_user_id: created.id,
    created_user_name: created.name,
    role,
  });

  res.status(201).json({
    message: `Pengguna baru ${created.name} berhasil dibuat dengan role ${role}.`,
    user: created,
  });
});

// POST /api/teacher/users/:id/reset-password
teacherRouter.post('/users/:id/reset-password', (req: Request, res: Response) => {
  const actor = (req as any).user;
  const { id } = req.params;
  const { new_password } = req.body;

  const target = db.getUserById(id);
  if (!target) {
    res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
    return;
  }

  db.resetUserPassword(id, new_password || 'password123');

  db.addAuditLog(actor.id, actor.name, actor.role, 'RESET_USER_PASSWORD', {
    target_user_id: id,
    target_user_name: target.name,
  });

  res.json({ message: `Kata sandi untuk ${target.name} berhasil di-reset ke 'password123'.` });
});

// GET /api/teacher/reflections
// Returns all student reflections with enrichment, statistics, and filters
teacherRouter.get('/reflections', (req: Request, res: Response) => {
  const { search, class_filter, competency_id, feeling_filter } = req.query;

  const rawReflections = db.getReflections();
  const students = db.getStudents();
  const competencies = db.getCompetencies();

  // Enrich reflections with student profile and competency data
  const enriched = rawReflections.map(r => {
    const student = students.find(s => s.id === r.student_id);
    const comp = r.competency_id ? competencies.find(c => c.id === r.competency_id) : null;

    return {
      id: r.id,
      student_id: r.student_id,
      student_user_id: student?.user_id,
      student_name: student?.full_name || 'Siswa',
      student_email: student?.email || '-',
      student_grade: student?.grade || 'Kelas X',
      student_class: student?.class_name || 'X-MIPA 1',
      competency_id: r.competency_id,
      competency_code: comp?.code || '-',
      competency_name: comp?.name || 'Refleksi Umum Pembelajaran',
      mindset_feeling: r.mindset_feeling,
      challenge_description: r.challenge_description,
      action_plan: r.action_plan || [],
      custom_action_text: r.custom_action_text || '',
      readiness_level: r.readiness_level || 3,
      ai_coaching_feedback: r.ai_coaching_feedback,
      teacher_note: r.teacher_note,
      teacher_note_by: r.teacher_note_by,
      teacher_note_at: r.teacher_note_at,
      created_at: r.created_at,
    };
  });

  // Apply filters
  let filtered = enriched;

  if (search && typeof search === 'string') {
    const query = search.toLowerCase().trim();
    filtered = filtered.filter(item =>
      item.student_name.toLowerCase().includes(query) ||
      item.student_email.toLowerCase().includes(query) ||
      item.competency_name.toLowerCase().includes(query) ||
      item.competency_code.toLowerCase().includes(query) ||
      item.challenge_description.toLowerCase().includes(query) ||
      item.custom_action_text.toLowerCase().includes(query) ||
      item.action_plan.some(a => a.toLowerCase().includes(query))
    );
  }

  if (class_filter && typeof class_filter === 'string') {
    filtered = filtered.filter(item => item.student_class === class_filter);
  }

  if (competency_id && typeof competency_id === 'string') {
    filtered = filtered.filter(item => item.competency_id === competency_id);
  }

  if (feeling_filter && typeof feeling_filter === 'string') {
    filtered = filtered.filter(item => item.mindset_feeling.toLowerCase().includes(feeling_filter.toLowerCase()));
  }

  // Calculate high-level summary metrics
  const totalReflections = enriched.length;
  const uniqueStudentIds = new Set(enriched.map(r => r.student_id));
  const avgReadiness = totalReflections > 0
    ? (enriched.reduce((acc, r) => acc + (r.readiness_level || 3), 0) / totalReflections).toFixed(1)
    : '0';

  // Feeling distribution
  const feelingCounts: Record<string, number> = {};
  enriched.forEach(r => {
    feelingCounts[r.mindset_feeling] = (feelingCounts[r.mindset_feeling] || 0) + 1;
  });

  // Action plan frequency
  const actionCounts: Record<string, number> = {};
  enriched.forEach(r => {
    r.action_plan.forEach(act => {
      actionCounts[act] = (actionCounts[act] || 0) + 1;
    });
  });

  // List of unique classes
  const classes = Array.from(new Set(students.map(s => s.class_name).filter(Boolean))).sort();

  res.json({
    reflections: filtered,
    stats: {
      total_reflections: totalReflections,
      unique_students_count: uniqueStudentIds.size,
      average_readiness: Number(avgReadiness),
      feeling_distribution: feelingCounts,
      top_actions: actionCounts,
    },
    classes,
    competencies: competencies.map(c => ({ id: c.id, code: c.code, name: c.name })),
  });
});

// PATCH /api/teacher/reflections/:id/note
// Allows teachers to add or update pedagogical feedback notes on student reflections
teacherRouter.patch('/reflections/:id/note', (req: Request, res: Response) => {
  const actor = (req as any).user;
  const { id } = req.params;
  const { note } = req.body;

  if (typeof note !== 'string') {
    res.status(400).json({ error: 'Catatan guru harus berupa teks string.' });
    return;
  }

  const updated = db.updateReflectionTeacherNote(id, note.trim(), actor.name);
  if (!updated) {
    res.status(404).json({ error: 'Refleksi tidak ditemukan.' });
    return;
  }

  db.addAuditLog(actor.id, actor.name, actor.role, 'UPDATE_REFLECTION_NOTE', {
    reflection_id: id,
    student_id: updated.student_id,
  });

  res.json({
    message: 'Catatan apresiasi guru berhasil disimpan.',
    reflection: updated,
  });
});



