import re

with open('src/components/EvaluationModule.tsx', 'r') as f:
    content = f.read()

# Add SubjectSettingsModal import
content = content.replace(
    "import { AttendanceSummary } from './AttendanceSummary';",
    "import { AttendanceSummary } from './AttendanceSummary';\nimport { SubjectSettingsModal } from './SubjectSettingsModal';"
)

content = content.replace(
    "import { Student, GRADE_LEVELS, SUBJECTS, SubjectScore } from '../types';",
    "import { Student, GRADE_LEVELS, SUBJECTS, SubjectScore, SubjectSettings } from '../types';"
)

content = content.replace(
    "import { Settings } from 'lucide-react';",
    "import { Settings, CheckCircle } from 'lucide-react';"
)

if "Settings" not in content:
    content = content.replace(
        "import { BarChart3, TrendingUp, Award, BookOpen, ChevronDown, CheckCircle, Search, FileText, Wrench, CalendarDays, AlertCircle } from 'lucide-react';",
        "import { BarChart3, TrendingUp, Award, BookOpen, ChevronDown, CheckCircle, Search, FileText, Wrench, CalendarDays, AlertCircle, Settings } from 'lucide-react';"
    )

# Add states
states_block_old = """  const [scores, setScores] = useState<Record<string, SubjectScore>>({});
  const [draftScores, setDraftScores] = useState<Record<string, SubjectScore>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showWarningToast, setShowWarningToast] = useState(false);
  const [warningCount, setWarningCount] = useState(0);"""

states_block_new = """  const [scores, setScores] = useState<Record<string, SubjectScore>>({});
  const [draftScores, setDraftScores] = useState<Record<string, SubjectScore>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showWarningToast, setShowWarningToast] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  
  const [gradesSubTab, setGradesSubTab] = useState<'part1' | 'part2'>('part1');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [subjectSettings, setSubjectSettings] = useState<SubjectSettings | null>(null);"""
content = content.replace(states_block_old, states_block_new)

# Add useEffect for SubjectSettings
settings_effect = """  // Sync draft scores when tab changes or selection changes
  useEffect(() => {
    setDraftScores(scores);
  }, [scores, activeTab, selectedGrade, selectedSubject]);

  useEffect(() => {
    const settingsId = `${systemAcademicYear}_${systemSemester}_${selectedGrade}_${selectedSubject}`.replace(/[\/]/g, '-');
    const unsubscribe = onSnapshot(
      doc(db, "subject_settings", settingsId),
      (docSnap) => {
        if (docSnap.exists()) {
          setSubjectSettings(docSnap.data() as SubjectSettings);
        } else {
          setSubjectSettings({
            id: settingsId,
            academicYear: systemAcademicYear || '',
            semester: systemSemester || '',
            gradeLevel: selectedGrade,
            subject: selectedSubject,
            beforeMidKnowledge: [{ id: 'default_bmk_1', name: 'งานที่ 1', maxScore: 20 }],
            beforeMidSoftSkill: [{ id: 'default_bms_1', name: 'การส่งงาน', maxScore: 10 }],
            afterMidKnowledge: [{ id: 'default_amk_1', name: 'งานที่ 2', maxScore: 20 }],
            afterMidSoftSkill: [{ id: 'default_ams_1', name: 'พฤติกรรม', maxScore: 10 }]
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "subject_settings");
      }
    );
    return () => unsubscribe();
  }, [systemAcademicYear, systemSemester, selectedGrade, selectedSubject]);

  const handleSaveSettings = async (newSettings: SubjectSettings) => {
    try {
      await setDoc(doc(db, "subject_settings", newSettings.id), newSettings);
      setShowSettingsModal(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "subject_settings");
    }
  };"""
content = content.replace(
    "  // Sync draft scores when tab changes or selection changes\n  useEffect(() => {\n    setDraftScores(scores);\n  }, [scores, activeTab, selectedGrade, selectedSubject]);",
    settings_effect
)


# Update handleScoreChange to support activities
handle_score_old = """  type ScoreField = 'preTestScore' | 'postTestScore' | 'beforeMidKnowledgeScore' | 'beforeMidSoftSkillScore' | 'midtermScore' | 'afterMidKnowledgeScore' | 'afterMidSoftSkillScore' | 'finalScore';

  const handleScoreChange = (studentId: string, field: ScoreField, value: string) => {
    const numValue = value === '' ? 0 : Number(value);
    const key = `${studentId}_${systemAcademicYear}_${systemSemester}_${selectedSubject}`;
    
    setDraftScores(prev => {
      const existing = prev[key] || {
        id: `sc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        studentId,
        gradeLevel: selectedGrade,
        academicYear: systemAcademicYear || '',
        semester: systemSemester || '',
        subject: selectedSubject,
        teacherId: 'current-teacher', // Ideally from props, but ok for now
        preTestScore: 0,
        postTestScore: 0,
        beforeMidKnowledgeScore: 0,
        beforeMidSoftSkillScore: 0,
        midtermScore: 0,
        afterMidKnowledgeScore: 0,
        afterMidSoftSkillScore: 0,
        finalScore: 0,
        totalScore: 0,
        grade: "0",
        updatedAt: new Date().toISOString()
      };

      const updated = { ...existing, [field]: numValue };
      updated.totalScore = 
        (updated.beforeMidKnowledgeScore || 0) + 
        (updated.beforeMidSoftSkillScore || 0) + 
        (updated.midtermScore || 0) + 
        (updated.afterMidKnowledgeScore || 0) + 
        (updated.afterMidSoftSkillScore || 0) + 
        (updated.finalScore || 0);
      updated.grade = calculateGrade(updated.totalScore);

      return { ...prev, [key]: updated };
    });
  };"""

handle_score_new = """  type ScoreField = 'preTestScore' | 'postTestScore' | 'beforeMidKnowledgeScore' | 'beforeMidSoftSkillScore' | 'midtermScore' | 'afterMidKnowledgeScore' | 'afterMidSoftSkillScore' | 'finalScore';

  const handleScoreChange = (studentId: string, field: ScoreField, value: string) => {
    const numValue = value === '' ? 0 : Number(value);
    const key = `${studentId}_${systemAcademicYear}_${systemSemester}_${selectedSubject}`;
    
    setDraftScores(prev => {
      const existing = prev[key] || {
        id: `sc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        studentId,
        gradeLevel: selectedGrade,
        academicYear: systemAcademicYear || '',
        semester: systemSemester || '',
        subject: selectedSubject,
        teacherId: 'current-teacher', // Ideally from props, but ok for now
        preTestScore: 0,
        postTestScore: 0,
        beforeMidKnowledgeScore: 0,
        beforeMidSoftSkillScore: 0,
        midtermScore: 0,
        afterMidKnowledgeScore: 0,
        afterMidSoftSkillScore: 0,
        finalScore: 0,
        totalScore: 0,
        grade: "0",
        activities: {},
        updatedAt: new Date().toISOString()
      };

      const updated = { ...existing, [field]: numValue };
      updated.totalScore = 
        (updated.beforeMidKnowledgeScore || 0) + 
        (updated.beforeMidSoftSkillScore || 0) + 
        (updated.midtermScore || 0) + 
        (updated.afterMidKnowledgeScore || 0) + 
        (updated.afterMidSoftSkillScore || 0) + 
        (updated.finalScore || 0);
      updated.grade = calculateGrade(updated.totalScore);

      return { ...prev, [key]: updated };
    });
  };

  const handleActivityScoreChange = (studentId: string, category: keyof Omit<SubjectSettings, 'id' | 'academicYear' | 'semester' | 'gradeLevel' | 'subject'>, activityId: string, value: string) => {
    const numValue = value === '' ? 0 : Number(value);
    const key = `${studentId}_${systemAcademicYear}_${systemSemester}_${selectedSubject}`;
    
    setDraftScores(prev => {
      const existing = prev[key] || {
        id: `sc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        studentId,
        gradeLevel: selectedGrade,
        academicYear: systemAcademicYear || '',
        semester: systemSemester || '',
        subject: selectedSubject,
        teacherId: 'current-teacher', 
        preTestScore: 0, postTestScore: 0,
        beforeMidKnowledgeScore: 0, beforeMidSoftSkillScore: 0,
        midtermScore: 0,
        afterMidKnowledgeScore: 0, afterMidSoftSkillScore: 0,
        finalScore: 0, totalScore: 0, grade: "0",
        activities: {},
        updatedAt: new Date().toISOString()
      };

      const updatedActivities = { ...(existing.activities || {}), [activityId]: numValue };
      
      // Compute the total for the category
      const categorySum = subjectSettings?.[category]?.reduce((sum, act) => sum + (updatedActivities[act.id] || 0), 0) || 0;
      
      const updated = { ...existing, activities: updatedActivities };
      
      // Update the parent score field based on the category
      if (category === 'beforeMidKnowledge') updated.beforeMidKnowledgeScore = categorySum;
      if (category === 'beforeMidSoftSkill') updated.beforeMidSoftSkillScore = categorySum;
      if (category === 'afterMidKnowledge') updated.afterMidKnowledgeScore = categorySum;
      if (category === 'afterMidSoftSkill') updated.afterMidSoftSkillScore = categorySum;

      updated.totalScore = 
        (updated.beforeMidKnowledgeScore || 0) + 
        (updated.beforeMidSoftSkillScore || 0) + 
        (updated.midtermScore || 0) + 
        (updated.afterMidKnowledgeScore || 0) + 
        (updated.afterMidSoftSkillScore || 0) + 
        (updated.finalScore || 0);
      updated.grade = calculateGrade(updated.totalScore);

      return { ...prev, [key]: updated };
    });
  };"""
content = content.replace(handle_score_old, handle_score_new)

with open('src/components/EvaluationModule.tsx', 'w') as f:
    f.write(content)

