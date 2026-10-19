/**
 * Core Data Models & Types for Personal Learning Journey
 * Follows Specification Section 8, 12, 13
 */

export type UserRole = 'student' | 'teacher' | 'admin';

export type CompetencyStatus = 'NOT_STARTED' | 'DEVELOPING' | 'ACHIEVED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  user_id: string;
  full_name: string;
  email?: string;
  grade: string;
  class_name: string;
  created_at: string;
  updated_at: string;
}

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
  remedial_guide: string; // panduan cara belajar / langkah perbaikan
  sequence_order: number;
}

export interface Competency {
  id: string;
  chapter_id?: string; // Links Competency to Chapter (Bab)
  code: string; // e.g. PRG-1
  name: string;
  description: string;
  sequence_order: number;
  prerequisite_id?: string | null;
  mastery_threshold: number; // e.g. 0.80 for 80%
  subtopics?: Subtopic[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompetencyProgress {
  id: string;
  student_id: string;
  competency_id: string;
  status: CompetencyStatus;
  last_attempt_id?: string | null;
  last_updated_at: string;
  created_at: string;
  updated_at: string;
}

export interface AssessmentQuestion {
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
  correct_answer: 'A' | 'B' | 'C' | 'D'; // Strictly server-side protected
  explanation?: string;
  image_url?: string;
  image_caption?: string;
  question_order: number;
  active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Sanitized version exposed to students before & during test
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

export interface AssessmentAttempt {
  id: string;
  student_id: string;
  competency_id: string;
  started_at: string;
  submitted_at: string;
  correct_count: number;
  question_count: number;
  percentage: number;
  mastery_status: 'ACHIEVED' | 'DEVELOPING';
  ai_feedback?: string;
  subtopic_breakdown?: Array<{
    subtopic_id: string;
    subtopic_code: string;
    subtopic_title: string;
    total: number;
    correct: number;
    mastery_status: 'ACHIEVED' | 'DEVELOPING';
    remedial_guide: string;
  }>;
  created_at: string;
}

export interface AssessmentResponse {
  id: string;
  attempt_id: string;
  student_id: string;
  question_id: string;
  selected_answer: 'A' | 'B' | 'C' | 'D';
  is_correct: boolean;
  answered_at: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor_user_id: string;
  actor_name: string;
  actor_role: UserRole;
  action: string;
  details: Record<string, unknown>;
}

export interface StudentReflection {
  id: string;
  student_id: string;
  competency_id?: string | null;
  mindset_feeling: string;
  challenge_description: string;
  action_plan: string[];
  custom_action_text?: string;
  readiness_level: number; // 1 to 5
  ai_coaching_feedback?: string;
  teacher_note?: string;
  teacher_note_by?: string;
  teacher_note_at?: string;
  created_at: string;
}

// Student Learning Journey View model
export interface JourneyCheckpoint {
  competency_id: string;
  code: string;
  name: string;
  description: string;
  sequence_order: number;
  prerequisite_id?: string | null;
  mastery_threshold: number;
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
