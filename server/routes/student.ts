import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { getAuthenticatedUser } from './auth.js';
import { generateRemediationFeedback, generateGrowthMindsetCoaching } from '../gemini.js';
import { JourneyCheckpoint, SanitizedQuestion } from '../types.js';

export const studentRouter = Router();

// Middleware to enforce student authentication & isolate student_id
function requireStudent(req: Request, res: Response, next: () => void) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    res.status(401).json({ error: 'Autentikasi diperlukan. Silakan login terlebih dahulu.' });
    return;
  }

  // If user is a student, get their student record
  if (user.role === 'student') {
    const student = db.getStudentByUserId(user.id);
    if (!student) {
      res.status(403).json({ error: 'Profil siswa tidak ditemukan untuk akun ini.' });
      return;
    }
    (req as any).student = student;
    (req as any).user = user;
    next();
    return;
  }

  // Teachers/admins can also view student mode on behalf of a student if specified in query or default to first student
  if (user.role === 'teacher' || user.role === 'admin') {
    const studentIdParam = req.query.as_student as string;
    const student = studentIdParam ? db.getStudentById(studentIdParam) : db.getStudents()[0];
    if (student) {
      (req as any).student = student;
      (req as any).user = user;
      next();
      return;
    }
  }

  res.status(403).json({ error: 'Akses khusus siswa.' });
}

// GET /api/student/learning-journey
// Returns the student's personal linear journey
studentRouter.get('/learning-journey', requireStudent, (req: Request, res: Response) => {
  const student = (req as any).student;
  const competencies = db.getCompetencies().filter(c => c.active);
  const progressList = db.getCompetencyProgress(student.id);

  const checkpoints: JourneyCheckpoint[] = competencies.map((comp) => {
    const prog = progressList.find(p => p.competency_id === comp.id);
    const status = prog ? prog.status : 'NOT_STARTED';

    let lastAttempt = null;
    if (prog && prog.last_attempt_id) {
      const att = db.getAttemptById(prog.last_attempt_id);
      if (att) {
        lastAttempt = {
          id: att.id,
          percentage: att.percentage,
          submitted_at: att.submitted_at,
          mastery_status: att.mastery_status,
        };
      }
    }

    // Check prerequisite
    let isLocked = false;
    if (comp.prerequisite_id) {
      const prereqProg = progressList.find(p => p.competency_id === comp.prerequisite_id);
      // Prerequisite is locked if not yet ACHIEVED
      if (!prereqProg || prereqProg.status !== 'ACHIEVED') {
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
      total_questions: questionCount,
    };
  });

  // Calculate summary
  const total = checkpoints.length;
  const achievedCount = checkpoints.filter(c => c.status === 'ACHIEVED').length;
  const developingCount = checkpoints.filter(c => c.status === 'DEVELOPING').length;
  const notStartedCount = checkpoints.filter(c => c.status === 'NOT_STARTED').length;

  res.json({
    student: {
      id: student.id,
      name: student.full_name,
      grade: student.grade,
      class_name: student.class_name,
    },
    summary: {
      total,
      achieved: achievedCount,
      developing: developingCount,
      not_started: notStartedCount,
      completion_percentage: total > 0 ? Math.round((achievedCount / total) * 100) : 0,
    },
    checkpoints,
  });
});

// GET /api/student/competencies/:id
studentRouter.get('/competencies/:id', requireStudent, (req: Request, res: Response) => {
  const student = (req as any).student;
  const competencyId = req.params.id;
  const comp = db.getCompetencyById(competencyId);

  if (!comp || !comp.active) {
    res.status(404).json({ error: 'Kompetensi tidak ditemukan atau nonaktif.' });
    return;
  }

  const prog = db.getSingleCompetencyProgress(student.id, comp.id);
  const status = prog ? prog.status : 'NOT_STARTED';

  const attempts = db.getAttempts(student.id, comp.id);
  const questionsCount = db.getQuestions(comp.id, true).length;

  let prerequisite = null;
  let isLocked = false;
  if (comp.prerequisite_id) {
    const prereq = db.getCompetencyById(comp.prerequisite_id);
    if (prereq) {
      const prereqProg = db.getSingleCompetencyProgress(student.id, prereq.id);
      isLocked = !prereqProg || prereqProg.status !== 'ACHIEVED';
      prerequisite = {
        id: prereq.id,
        code: prereq.code,
        name: prereq.name,
        status: prereqProg ? prereqProg.status : 'NOT_STARTED',
        is_achieved: prereqProg?.status === 'ACHIEVED',
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
    attempts: attempts.map(a => ({
      id: a.id,
      started_at: a.started_at,
      submitted_at: a.submitted_at,
      correct_count: a.correct_count,
      question_count: a.question_count,
      percentage: a.percentage,
      mastery_status: a.mastery_status,
      ai_feedback: a.ai_feedback,
    })),
  });
});

// GET /api/student/assessments/:competencyId
// CRITICAL SECURITY: Answer keys are NEVER exposed to student before submission!
studentRouter.get('/assessments/:competencyId', requireStudent, (req: Request, res: Response) => {
  const competencyId = req.params.competencyId;
  const comp = db.getCompetencyById(competencyId);

  if (!comp || !comp.active) {
    res.status(404).json({ error: 'Kompetensi asesmen tidak ditemukan.' });
    return;
  }

  const questions = db.getQuestions(competencyId, true);
  if (questions.length === 0) {
    res.status(400).json({ error: 'Belum ada bank soal aktif untuk kompetensi ini.' });
    return;
  }

  // Sanitize: strip correct_answer and explanation
  const sanitized: SanitizedQuestion[] = questions.map(q => ({
    id: q.id,
    competency_id: q.competency_id,
    question_text: q.question_text,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d,
    image_url: q.image_url,
    image_caption: q.image_caption,
    question_order: q.question_order,
  }));

  res.json({
    competency: {
      id: comp.id,
      code: comp.code,
      name: comp.name,
      description: comp.description,
      mastery_threshold: comp.mastery_threshold,
    },
    total_questions: sanitized.length,
    questions: sanitized,
  });
});

// POST /api/student/attempts
// Submits answers, deterministically evaluates on server, stores attempt + responses, upserts progress
studentRouter.post('/attempts', requireStudent, async (req: Request, res: Response) => {
  const student = (req as any).student;
  const { competency_id, responses, started_at } = req.body;

  if (!competency_id || !responses || typeof responses !== 'object') {
    res.status(400).json({ error: 'Data asesmen tidak lengkap.' });
    return;
  }

  const comp = db.getCompetencyById(competency_id);
  if (!comp || !comp.active) {
    res.status(404).json({ error: 'Kompetensi tidak valid.' });
    return;
  }

  const activeQuestions = db.getQuestions(competency_id, true);
  if (activeQuestions.length === 0) {
    res.status(400).json({ error: 'Tidak ada soal aktif untuk kompetensi ini.' });
    return;
  }

  const submittedAt = new Date().toISOString();
  const startTime = started_at || new Date(Date.now() - 120000).toISOString();

  let correctCount = 0;
  const incorrectList: Array<{
    question: string;
    selectedAnswer: string;
    correctAnswer: string;
    explanation?: string;
  }> = [];

  const evaluatedResponses: Array<{
    question_id: string;
    selected_answer: 'A' | 'B' | 'C' | 'D';
    is_correct: boolean;
    correct_answer: string;
    explanation?: string;
  }> = [];

  for (const q of activeQuestions) {
    const rawSelected = responses[q.id];
    const selectedAnswer = (rawSelected ? String(rawSelected).toUpperCase() : 'A') as 'A' | 'B' | 'C' | 'D';
    const isCorrect = selectedAnswer === q.correct_answer;

    if (isCorrect) {
      correctCount++;
    } else {
      incorrectList.push({
        question: q.question_text,
        selectedAnswer: `${selectedAnswer}: ${(q as any)[`option_${selectedAnswer.toLowerCase()}`] || ''}`,
        correctAnswer: `${q.correct_answer}: ${(q as any)[`option_${q.correct_answer.toLowerCase()}`] || ''}`,
        explanation: q.explanation,
      });
    }

    evaluatedResponses.push({
      question_id: q.id,
      selected_answer: selectedAnswer,
      is_correct: isCorrect,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
    });
  }

  const questionCount = activeQuestions.length;
  const percentage = Math.round((correctCount / questionCount) * 100);
  const masteryStatus: 'ACHIEVED' | 'DEVELOPING' = percentage >= (comp.mastery_threshold * 100) ? 'ACHIEVED' : 'DEVELOPING';

  // AI / Pedagogical Formative Feedback
  const aiFeedback = await generateRemediationFeedback({
    competencyCode: comp.code,
    competencyName: comp.name,
    studentName: student.full_name,
    correctCount,
    totalCount: questionCount,
    percentage,
    masteryStatus,
    incorrectQuestions: incorrectList,
  });

  // Create Attempt record
  const createdAttempt = db.createAttempt({
    student_id: student.id,
    competency_id: comp.id,
    started_at: startTime,
    submitted_at: submittedAt,
    correct_count: correctCount,
    question_count: questionCount,
    percentage,
    mastery_status: masteryStatus,
    ai_feedback: aiFeedback,
  });

  // Create Responses records
  db.createResponses(
    evaluatedResponses.map(r => ({
      attempt_id: createdAttempt.id,
      student_id: student.id,
      question_id: r.question_id,
      selected_answer: r.selected_answer,
      is_correct: r.is_correct,
      answered_at: submittedAt,
    }))
  );

  // Upsert Competency Progress
  // Rule: If student has already achieved this competency before, does a lower retry downgrade them?
  // Mastery learning standard: Once achieved, retain ACHIEVED status unless teacher explicitly resets,
  // or update if improved/retained. Here we update status based on latest mastery rule or retain achieved if already met.
  const existingProg = db.getSingleCompetencyProgress(student.id, comp.id);
  const newStatus = existingProg?.status === 'ACHIEVED' && masteryStatus === 'DEVELOPING' ? 'ACHIEVED' : masteryStatus;

  const updatedProg = db.upsertCompetencyProgress(
    student.id,
    comp.id,
    newStatus,
    createdAttempt.id
  );

  // Add audit log
  db.addAuditLog(student.id, student.full_name, 'student', 'SUBMIT_ASSESSMENT', {
    attempt_id: createdAttempt.id,
    competency_code: comp.code,
    correct_count: correctCount,
    total: questionCount,
    percentage,
    mastery_status: masteryStatus,
    competency_status_now: updatedProg.status,
  });

  res.json({
    attempt_id: createdAttempt.id,
    competency: {
      id: comp.id,
      code: comp.code,
      name: comp.name,
      mastery_threshold: comp.mastery_threshold,
    },
    result: {
      correct_count: correctCount,
      question_count: questionCount,
      percentage,
      mastery_status: masteryStatus,
      competency_status: updatedProg.status,
      ai_feedback: aiFeedback,
      submitted_at: submittedAt,
    },
    detailed_responses: evaluatedResponses.map(r => {
      const q = activeQuestions.find(item => item.id === r.question_id)!;
      return {
        question_id: q.id,
        question_text: q.question_text,
        image_url: q.image_url,
        image_caption: q.image_caption,
        options: {
          A: q.option_a,
          B: q.option_b,
          C: q.option_c,
          D: q.option_d,
        },
        selected_answer: r.selected_answer,
        correct_answer: r.correct_answer,
        is_correct: r.is_correct,
        explanation: r.explanation,
      };
    }),
  });
});

// GET /api/student/attempts/:id/result
studentRouter.get('/attempts/:id/result', requireStudent, (req: Request, res: Response) => {
  const student = (req as any).student;
  const user = (req as any).user;
  const attempt = db.getAttemptById(req.params.id);

  if (!attempt) {
    res.status(404).json({ error: 'Riwayat asesmen tidak ditemukan.' });
    return;
  }

  // Student isolation check: cannot view another student's attempt!
  if (user.role === 'student' && attempt.student_id !== student.id) {
    res.status(403).json({ error: 'Akses ditolak. Anda tidak berhak melihat hasil siswa lain.' });
    return;
  }

  const comp = db.getCompetencyById(attempt.competency_id);
  const responses = db.getResponsesByAttemptId(attempt.id);
  const questions = db.getQuestions(attempt.competency_id, false);

  const detailedResponses = responses.map(r => {
    const q = questions.find(item => item.id === r.question_id);
    return {
      question_id: r.question_id,
      question_text: q?.question_text || 'Soal Asesmen',
      image_url: q?.image_url,
      image_caption: q?.image_caption,
      options: {
        A: q?.option_a || '',
        B: q?.option_b || '',
        C: q?.option_c || '',
        D: q?.option_d || '',
      },
      selected_answer: r.selected_answer,
      correct_answer: q?.correct_answer || '',
      is_correct: r.is_correct,
      explanation: q?.explanation || '',
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
      ai_feedback: attempt.ai_feedback,
    },
    competency: comp,
    competency_status: prog ? prog.status : 'NOT_STARTED',
    responses: detailedResponses,
  });
});

// GET /api/student/progress
studentRouter.get('/progress', requireStudent, (req: Request, res: Response) => {
  const student = (req as any).student;
  const attempts = db.getAttempts(student.id);
  const progressList = db.getCompetencyProgress(student.id);
  const competencies = db.getCompetencies();

  const progressOverview = competencies.map(c => {
    const prog = progressList.find(p => p.competency_id === c.id);
    const compAttempts = attempts.filter(a => a.competency_id === c.id);
    return {
      competency: c,
      status: prog ? prog.status : 'NOT_STARTED',
      last_updated: prog ? prog.last_updated_at : null,
      attempts_count: compAttempts.length,
      best_percentage: compAttempts.length > 0 ? Math.max(...compAttempts.map(a => a.percentage)) : 0,
      latest_attempt: compAttempts[0] || null,
    };
  });

  res.json({
    student: {
      id: student.id,
      name: student.full_name,
      grade: student.grade,
      class_name: student.class_name,
      email: student.email,
    },
    competencies_progress: progressOverview,
    recent_attempts: attempts.slice(0, 10).map(a => {
      const comp = competencies.find(c => c.id === a.competency_id);
      return {
        ...a,
        competency_code: comp?.code || '',
        competency_name: comp?.name || '',
      };
    }),
  });
});

// GET /api/student/profile
studentRouter.get('/profile', requireStudent, (req: Request, res: Response) => {
  const student = (req as any).student;
  const user = (req as any).user;

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url,
    },
    student: {
      id: student.id,
      full_name: student.full_name,
      email: student.email,
      grade: student.grade,
      class_name: student.class_name,
      created_at: student.created_at,
    },
  });
});

// GET /api/student/reflections
// Returns all growth mindset reflections submitted by this student
studentRouter.get('/reflections', requireStudent, (req: Request, res: Response) => {
  const student = (req as any).student;
  const rawReflections = db.getReflections(student.id);
  const competencies = db.getCompetencies();

  const enriched = rawReflections.map(r => {
    const comp = r.competency_id ? competencies.find(c => c.id === r.competency_id) : null;
    return {
      ...r,
      competency_code: comp?.code || '',
      competency_name: comp?.name || '',
    };
  });

  res.json({ reflections: enriched });
});

// POST /api/student/reflections
// Saves a student reflection before retrying and generates growth mindset coaching
studentRouter.post('/reflections', requireStudent, async (req: Request, res: Response) => {
  const student = (req as any).student;
  const { competency_id, mindset_feeling, challenge_description, action_plan, custom_action_text, readiness_level } = req.body;

  if (!mindset_feeling || !action_plan || !Array.isArray(action_plan)) {
    res.status(400).json({ error: 'Perasaan mindset dan rencana aksi belajar wajib diisi.' });
    return;
  }

  let competencyName = '';
  if (competency_id) {
    const comp = db.getCompetencyById(competency_id);
    if (comp) competencyName = `${comp.code} - ${comp.name}`;
  }

  // Generate Growth Mindset Mentor feedback
  const coachingFeedback = await generateGrowthMindsetCoaching({
    studentName: student.full_name,
    competencyName,
    feeling: mindset_feeling,
    challenge: challenge_description || '',
    actionPlan: action_plan,
    customAction: custom_action_text,
  });

  const created = db.createReflection({
    student_id: student.id,
    competency_id: competency_id || null,
    mindset_feeling,
    challenge_description: challenge_description || '',
    action_plan,
    custom_action_text: custom_action_text || '',
    readiness_level: Number(readiness_level) || 3,
    ai_coaching_feedback: coachingFeedback,
  });

  // Audit log
  db.addAuditLog(student.id, student.full_name, 'student', 'SUBMIT_REFLECTION', {
    reflection_id: created.id,
    competency_id,
    feeling: mindset_feeling,
  });

  res.status(201).json({
    message: 'Refleksi berhasil disimpan! Tetap percaya pada proses belajarmu.',
    reflection: created,
  });
});

