export type UserRole = 'student' | 'teacher' | 'admin';

export type CompetencyStatus = 'NOT_STARTED' | 'DEVELOPING' | 'ACHIEVED';

export interface Chapter {
  id: string; // e.g. 'chap-1'
  code: string; // e.g. 'BAB-1'
  title: string; // e.g. 'Program Linear Dua Variabel'
  description: string;
  sequence_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subtopic {
  id: string; // e.g. 'sub-2-1'
  competency_id: string;
  code: string; // e.g. '2.1'
  title: string; // e.g. 'Menentukan Titik Potong Sumbu X dan Y'
  description?: string;
  remedial_guide: string; // panduan cara belajar spesifik langkah ini
  sequence_order: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  student_profile?: {
    id: string;
    grade: string;
    class_name: string;
  } | null;
}

export interface JourneyCheckpoint {
  competency_id: string;
  chapter_id?: string;
  code: string;
  name: string;
  description: string;
  sequence_order: number;
  prerequisite_id?: string | null;
  mastery_threshold: number;
  subtopics?: Subtopic[];
  status: CompetencyStatus;
  last_attempt?: {
    id: string;
    percentage: number;
    submitted_at: string;
    mastery_status: 'ACHIEVED' | 'DEVELOPING';
  } | null;
  is_locked: boolean;
  total_questions: number;
}

export interface StudentJourneySummary {
  student: {
    id: string;
    name: string;
    grade: string;
    class_name: string;
  };
  chapters?: Chapter[];
  current_chapter_id?: string;
  summary: {
    total: number;
    achieved: number;
    developing: number;
    not_started: number;
    completion_percentage: number;
  };
  checkpoints: JourneyCheckpoint[];
}

export interface SanitizedQuestion {
  id: string;
  chapter_id?: string;
  competency_id: string;
  subtopic_id?: string;
  subtopic_title?: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  image_url?: string;
  image_caption?: string;
  question_order: number;
}

export interface AssessmentResponseReview {
  question_id: string;
  subtopic_id?: string;
  subtopic_title?: string;
  question_text: string;
  image_url?: string;
  image_caption?: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  selected_answer: 'A' | 'B' | 'C' | 'D';
  correct_answer: string;
  is_correct: boolean;
  explanation?: string;
}

export interface SubtopicDiagnostic {
  subtopic_id: string;
  subtopic_code: string;
  subtopic_title: string;
  total: number;
  correct: number;
  mastery_status: 'ACHIEVED' | 'DEVELOPING';
  remedial_guide: string;
}

export interface AssessmentResult {
  attempt_id: string;
  competency: {
    id: string;
    code: string;
    name: string;
    mastery_threshold: number;
  };
  result: {
    correct_count: number;
    question_count: number;
    percentage: number;
    mastery_status: 'ACHIEVED' | 'DEVELOPING';
    competency_status: CompetencyStatus;
    ai_feedback?: string;
    submitted_at: string;
    subtopic_breakdown?: SubtopicDiagnostic[];
  };
  detailed_responses: AssessmentResponseReview[];
}

export interface StudentReflection {
  id: string;
  student_id: string;
  student_name?: string;
  student_email?: string;
  student_grade?: string;
  student_class?: string;
  student_user_id?: string;
  competency_id?: string | null;
  competency_code?: string;
  competency_name?: string;
  mindset_feeling: string;
  challenge_description: string;
  action_plan: string[];
  custom_action_text?: string;
  readiness_level: number;
  ai_coaching_feedback?: string;
  teacher_note?: string;
  teacher_note_by?: string;
  teacher_note_at?: string;
  created_at: string;
}

