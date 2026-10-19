/**
 * Personal Learning Journey - Main Application
 * Formative Assessment Web Application based on Mastery Learning
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { LearningJourneyMap } from './components/student/LearningJourneyMap';
import { CompetencyDetailView } from './components/student/CompetencyDetailView';
import { AssessmentRunner } from './components/student/AssessmentRunner';
import { AssessmentResultView } from './components/student/AssessmentResultView';
import { ProgressHistoryView } from './components/student/ProgressHistoryView';
import { StudentProfileView } from './components/student/StudentProfileView';
import { GrowthMindsetReflectionView } from './components/student/GrowthMindsetReflectionView';

import { TeacherDashboardView } from './components/teacher/TeacherDashboardView';
import { StudentsListView } from './components/teacher/StudentsListView';
import { StudentDetailModal } from './components/teacher/StudentDetailModal';
import { QuestionBankView } from './components/teacher/QuestionBankView';
import { CompetencyManagementView } from './components/teacher/CompetencyManagementView';
import { AnalyticsView } from './components/teacher/AnalyticsView';
import { AssessmentResultsView } from './components/teacher/AssessmentResultsView';
import { ReflectionsMonitoringView } from './components/teacher/ReflectionsMonitoringView';
import { AuditLogView } from './components/teacher/AuditLogView';
import { DatabaseInspectorView } from './components/teacher/DatabaseInspectorView';
import { UserRoleManagementView } from './components/teacher/UserRoleManagementView';

import { LoginPage } from './components/auth/LoginPage';
import { ForgotPasswordModal } from './components/auth/ForgotPasswordModal';
import { StudentJourneySummary, AssessmentResult } from './types';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, token, isLoading, switchUser } = useAuth();

  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<string>('journey');

  // Student Flow state
  const [journeyData, setJourneyData] = useState<StudentJourneySummary | null>(null);
  const [journeyLoading, setJourneyLoading] = useState(false);
  const [selectedCompetencyId, setSelectedCompetencyId] = useState<string | null>(null);
  const [activeAssessmentCompId, setActiveAssessmentCompId] = useState<string | null>(null);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);

  // Teacher Drill-down state
  const [selectedDrillStudentId, setSelectedDrillStudentId] = useState<string | null>(null);

  // Auth subview (e.g. forgot password)
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // Load student journey
  const loadStudentJourney = async () => {
    if (!token) return;
    setJourneyLoading(true);
    try {
      const res = await fetch('/api/student/learning-journey', {
        headers: { 'x-user-id': token },
      });
      if (res.ok) {
        const data = await res.json();
        setJourneyData(data);
      }
    } catch (e) {
      console.error('Error fetching learning journey:', e);
    } finally {
      setJourneyLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      if (user.role === 'teacher' || user.role === 'admin') {
        setCurrentTab('teacher-dashboard');
      } else {
        setCurrentTab('journey');
        loadStudentJourney();
      }
      // Reset view states
      setSelectedCompetencyId(null);
      setActiveAssessmentCompId(null);
      setAssessmentResult(null);
    }
  }, [user?.id, user?.role, token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fbf8] flex flex-col items-center justify-center p-4">
        <Loader2 size={36} className="animate-spin text-emerald-600 mb-3" />
        <span className="text-sm font-semibold text-slate-600">
          Memuat Personal Learning Journey...
        </span>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    if (isForgotPassword) {
      return <ForgotPasswordModal onBackToLogin={() => setIsForgotPassword(false)} />;
    }
    return <LoginPage onForgotPassword={() => setIsForgotPassword(true)} />;
  }

  // Handlers for student flow
  const handleSelectCompetency = (compId: string) => {
    setSelectedCompetencyId(compId);
    setActiveAssessmentCompId(null);
    setAssessmentResult(null);
  };

  const handleStartAssessment = (compId: string) => {
    setActiveAssessmentCompId(compId);
    setSelectedCompetencyId(null);
    setAssessmentResult(null);
  };

  const handleAssessmentCompleted = (result: AssessmentResult) => {
    setAssessmentResult(result);
    setActiveAssessmentCompId(null);
    // Reload journey to update checkpoint statuses
    loadStudentJourney();
  };

  const handleBackToJourney = () => {
    setSelectedCompetencyId(null);
    setActiveAssessmentCompId(null);
    setAssessmentResult(null);
    loadStudentJourney();
  };

  const handleNextCheckpoint = () => {
    if (!journeyData || !assessmentResult) {
      handleBackToJourney();
      return;
    }
    const currentCompId = assessmentResult.competency.id;
    const currentIndex = journeyData.checkpoints.findIndex(c => c.competency_id === currentCompId);
    if (currentIndex >= 0 && currentIndex < journeyData.checkpoints.length - 1) {
      const nextComp = journeyData.checkpoints[currentIndex + 1];
      setSelectedCompetencyId(nextComp.competency_id);
      setAssessmentResult(null);
    } else {
      handleBackToJourney();
    }
  };

  // Previewing another student's journey from teacher view
  const handlePreviewAsStudent = async (studentUserId: string) => {
    await switchUser(studentUserId);
    setCurrentTab('journey');
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col font-sans">
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          setSelectedCompetencyId(null);
          setActiveAssessmentCompId(null);
          setAssessmentResult(null);
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* STUDENT VIEWS */}
        {user.role === 'student' && (
          <>
            {/* 1. Assessment Runner Screen */}
            {activeAssessmentCompId ? (
              <AssessmentRunner
                competencyId={activeAssessmentCompId}
                onCancel={handleBackToJourney}
                onCompleted={handleAssessmentCompleted}
              />
            ) : assessmentResult ? (
              /* 2. Assessment Result Screen */
              <AssessmentResultView
                result={assessmentResult}
                onBackToJourney={handleBackToJourney}
                onRetry={() => handleStartAssessment(assessmentResult.competency.id)}
                onNextCheckpoint={handleNextCheckpoint}
              />
            ) : selectedCompetencyId ? (
              /* 3. Competency Detail View */
              <CompetencyDetailView
                competencyId={selectedCompetencyId}
                onBack={handleBackToJourney}
                onStartAssessment={handleStartAssessment}
              />
            ) : currentTab === 'student-mindset' ? (
              /* 4. Growth Mindset & Pre-Retry Reflection Room */
              <GrowthMindsetReflectionView
                checkpoints={journeyData?.checkpoints || []}
                onStartAssessment={handleStartAssessment}
              />
            ) : currentTab === 'student-progress' ? (
              /* 5. My Progress Timeline */
              <ProgressHistoryView
                onStartAssessment={handleStartAssessment}
                onSelectCompetency={handleSelectCompetency}
              />
            ) : currentTab === 'student-profile' ? (
              /* 6. Student Profile */
              <StudentProfileView />
            ) : (
              /* 7. Default: Personal Learning Journey Map */
              journeyLoading && !journeyData ? (
                <div className="flex items-center justify-center min-h-[350px]">
                  <Loader2 size={32} className="animate-spin text-emerald-600 mb-2" />
                </div>
              ) : journeyData ? (
                <LearningJourneyMap
                  journeyData={journeyData}
                  onSelectCompetency={handleSelectCompetency}
                  onStartAssessment={handleStartAssessment}
                  onOpenGrowthMindset={() => setCurrentTab('student-mindset')}
                />
              ) : null
            )}
          </>
        )}

        {/* TEACHER / ADMIN VIEWS */}
        {(user.role === 'teacher' || user.role === 'admin') && (
          <>
            {currentTab === 'teacher-dashboard' && (
              <TeacherDashboardView
                onNavigateTab={setCurrentTab}
                onSelectStudent={setSelectedDrillStudentId}
              />
            )}

            {currentTab === 'teacher-students' && (
              <StudentsListView
                onSelectStudentDetail={setSelectedDrillStudentId}
                onPreviewStudentJourney={handlePreviewAsStudent}
                onNavigateTab={setCurrentTab}
              />
            )}

            {currentTab === 'teacher-results' && <AssessmentResultsView />}

            {currentTab === 'teacher-reflections' && (
              <ReflectionsMonitoringView
                onPreviewStudentJourney={handlePreviewAsStudent}
              />
            )}

            {currentTab === 'teacher-questions' && <QuestionBankView />}

            {currentTab === 'teacher-competencies' && <CompetencyManagementView />}

            {currentTab === 'teacher-analytics' && <AnalyticsView />}

            {currentTab === 'teacher-audit' && <AuditLogView />}

            {currentTab === 'teacher-database' && <DatabaseInspectorView />}

            {currentTab === 'teacher-roles' && <UserRoleManagementView />}

            {/* Drill-down modal */}
            {selectedDrillStudentId && (
              <StudentDetailModal
                studentId={selectedDrillStudentId}
                onClose={() => setSelectedDrillStudentId(null)}
                onPreviewAsStudent={handlePreviewAsStudent}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Personal Learning Journey</span>
            <span>•</span>
            <span>Mastery-Based Formative Assessment Engine</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Progress &gt; Ranking</span>
            <span>Mastery &gt; Score</span>
            <span>Personal Journey &gt; Comparison</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
