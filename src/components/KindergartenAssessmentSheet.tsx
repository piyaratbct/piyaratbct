import React, { useState, useEffect, useMemo } from 'react';
import { 
  Award, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  Sparkles, 
  Clock, 
  Users, 
  Activity, 
  Smile, 
  Compass, 
  Brain, 
  FileText, 
  RefreshCw,
  Zap,
  TrendingUp,
  HeartPulse
} from 'lucide-react';
import { collection, query, where, getDocs, doc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Student, Teacher, KindergartenAssessment, StudentAssessment } from '../types';
import { KindergartenAssessmentModal } from './KindergartenAssessmentModal';
import { KindergartenPrintTemplate } from './KindergartenPrintTemplate';

interface KindergartenAssessmentSheetProps {
  students: Student[];
  currentTeacher: Teacher | null;
  systemAcademicYear: string;
  systemSemester: string;
}

interface StudentSemesterHealthSummary {
  latestWeight?: number;
  latestHeight?: number;
  initialWeight?: number;
  initialHeight?: number;
  weightDiff?: number;
  heightDiff?: number;
  bmi?: number;
  bmiLabel: string;
  bmiColor: string;
  recordCount: number;
}

export const KindergartenAssessmentSheet: React.FC<KindergartenAssessmentSheetProps> = ({
  students,
  currentTeacher,
  systemAcademicYear,
  systemSemester,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<string>('อนุบาล 1');
  const [assessments, setAssessments] = useState<Record<string, KindergartenAssessment>>({});
  const [semesterHealthMap, setSemesterHealthMap] = useState<Record<string, StudentSemesterHealthSummary>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState<Set<string>>(new Set());
  const [evaluatingStudent, setEvaluatingStudent] = useState<Student | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Filter active students in selected grade, sorted by number
  const gradeStudents = useMemo(() => {
    return students
      .filter(s => (s.status === 'active' || !s.status) && s.gradeLevel === selectedGrade)
      .sort((a, b) => (Number(a.number) || 0) - (Number(b.number) || 0));
  }, [students, selectedGrade]);

  // Calculate BMI label & color
  const computeBmiInfo = (weight?: number, height?: number) => {
    if (!weight || !height) {
      return { bmi: undefined, bmiLabel: 'รอชั่ง/วัด', bmiColor: 'text-slate-400 bg-slate-100' };
    }
    const hInMeters = height / 100;
    const bmi = Number((weight / (hInMeters * hInMeters)).toFixed(1));
    if (bmi < 14) return { bmi, bmiLabel: 'ผอมมาก', bmiColor: 'text-blue-700 bg-blue-50 border-blue-200' };
    if (bmi < 15.5) return { bmi, bmiLabel: 'น้ำหนักน้อย', bmiColor: 'text-sky-700 bg-sky-50 border-sky-200' };
    if (bmi <= 18.5) return { bmi, bmiLabel: 'สมส่วน', bmiColor: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (bmi <= 20) return { bmi, bmiLabel: 'ท้วม', bmiColor: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { bmi, bmiLabel: 'เริ่มอ้วน/อ้วน', bmiColor: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  // Fetch assessments and all semester health records
  const loadData = async () => {
    if (!db) return;
    setIsLoading(true);
    try {
      // 1. Fetch kindergarten semester evaluation records
      const qAssessments = query(
        collection(db, 'assessments'),
        where('gradeLevel', '==', selectedGrade),
        where('academicYear', '==', systemAcademicYear),
        where('semester', '==', systemSemester)
      );
      const snapshot = await getDocs(qAssessments);
      
      const loadedAssessments: Record<string, KindergartenAssessment> = {};
      const allHealthRecordsByStudent: Record<string, { weight?: number; height?: number; month?: string; updatedAt?: string }[]> = {};

      snapshot.docs.forEach(docSnap => {
        const data = docSnap.data() as any;
        const studentId = data.studentId;
        if (!studentId) return;

        // Collect health records throughout the semester
        if (data.weight || data.height) {
          if (!allHealthRecordsByStudent[studentId]) allHealthRecordsByStudent[studentId] = [];
          allHealthRecordsByStudent[studentId].push({
            weight: data.weight ? Number(data.weight) : undefined,
            height: data.height ? Number(data.height) : undefined,
            month: data.month,
            updatedAt: data.updatedAt
          });
        }

        // Check if this doc is the primary semester evaluation record or has scores
        const currentExisting = loadedAssessments[studentId];
        const hasScores = data.physicalScore || data.emotionalScore || data.citizenshipScore || data.intellectualScore;
        const isSummaryDoc = docSnap.id.includes('summary') || docSnap.id.includes('term');

        if (!currentExisting || isSummaryDoc || hasScores) {
          loadedAssessments[studentId] = {
            ...data,
            id: docSnap.id,
            // Fallback score parsing from string if needed
            physicalScore: data.physicalScore || (data.physicalDev === '3' ? 3 : data.physicalDev === '2' ? 2 : data.physicalDev === '1' ? 1 : undefined),
            emotionalScore: data.emotionalScore || (data.emotionalDev === '3' ? 3 : data.emotionalDev === '2' ? 2 : data.emotionalDev === '1' ? 1 : undefined),
            citizenshipScore: data.citizenshipScore || (data.citizenshipDev === '3' ? 3 : data.citizenshipDev === '2' ? 2 : data.citizenshipDev === '1' ? 1 : undefined),
            intellectualScore: data.intellectualScore || (data.intellectualDev === '3' ? 3 : data.intellectualDev === '2' ? 2 : data.intellectualDev === '1' ? 1 : undefined),
          };
        }
      });

      // 2. Compute semester growth summary for each student
      const healthSummaries: Record<string, StudentSemesterHealthSummary> = {};

      gradeStudents.forEach(st => {
        const records = allHealthRecordsByStudent[st.id] || [];
        // Sort records by month/updatedAt
        records.sort((a, b) => (a.month || a.updatedAt || '').localeCompare(b.month || b.updatedAt || ''));

        let latestW = records[records.length - 1]?.weight || st.weight;
        let latestH = records[records.length - 1]?.height || st.height;
        let initialW = records[0]?.weight;
        let initialH = records[0]?.height;

        let weightDiff: number | undefined = undefined;
        let heightDiff: number | undefined = undefined;

        if (records.length > 1 && latestW && initialW) {
          weightDiff = Number((latestW - initialW).toFixed(1));
        }
        if (records.length > 1 && latestH && initialH) {
          heightDiff = Number((latestH - initialH).toFixed(1));
        }

        const bmiInfo = computeBmiInfo(latestW, latestH);

        healthSummaries[st.id] = {
          latestWeight: latestW,
          latestHeight: latestH,
          initialWeight: initialW,
          initialHeight: initialH,
          weightDiff,
          heightDiff,
          bmi: bmiInfo.bmi,
          bmiLabel: bmiInfo.bmiLabel,
          bmiColor: bmiInfo.bmiColor,
          recordCount: records.length
        };
      });

      setAssessments(loadedAssessments);
      setSemesterHealthMap(healthSummaries);
      setUnsavedChanges(new Set());
    } catch (err) {
      console.error('Error loading kindergarten assessment data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedGrade, systemAcademicYear, systemSemester, gradeStudents.length]);

  // Update a single domain score for a student
  const handleSetScore = (studentId: string, domain: 'physicalScore' | 'emotionalScore' | 'citizenshipScore' | 'intellectualScore', score: 1 | 2 | 3) => {
    setAssessments(prev => {
      const current = prev[studentId] || {
        id: '',
        studentId,
        gradeLevel: selectedGrade,
        academicYear: systemAcademicYear,
        semester: systemSemester,
        teacherId: currentTeacher?.id || '',
        physicalDev: '',
        emotionalDev: '',
        citizenshipDev: '',
        intellectualDev: '',
        updatedAt: new Date().toISOString()
      };

      const newScore = current[domain] === score ? undefined : score; // toggle if clicked again
      const updated: KindergartenAssessment = {
        ...current,
        [domain]: newScore,
        updatedAt: new Date().toISOString()
      };

      return {
        ...prev,
        [studentId]: updated
      };
    });

    setUnsavedChanges(prev => new Set(prev).add(studentId));
  };

  // Quick fill: set all 4 domains to 3 (ดี) for a single student
  const handleSetAllThreeForStudent = (studentId: string) => {
    setAssessments(prev => {
      const current = prev[studentId] || {
        id: '',
        studentId,
        gradeLevel: selectedGrade,
        academicYear: systemAcademicYear,
        semester: systemSemester,
        teacherId: currentTeacher?.id || '',
        physicalDev: '',
        emotionalDev: '',
        citizenshipDev: '',
        intellectualDev: '',
        updatedAt: new Date().toISOString()
      };

      return {
        ...prev,
        [studentId]: {
          ...current,
          physicalScore: 3,
          emotionalScore: 3,
          citizenshipScore: 3,
          intellectualScore: 3,
          updatedAt: new Date().toISOString()
        }
      };
    });

    setUnsavedChanges(prev => new Set(prev).add(studentId));
  };

  // Quick fill: set 3 (ดี) for all students in the class
  const handleQuickFillAllGood = () => {
    const updatedMap = { ...assessments };
    const changedIds = new Set(unsavedChanges);

    gradeStudents.forEach(st => {
      const current = updatedMap[st.id] || {
        id: '',
        studentId: st.id,
        gradeLevel: selectedGrade,
        academicYear: systemAcademicYear,
        semester: systemSemester,
        teacherId: currentTeacher?.id || '',
        physicalDev: '',
        emotionalDev: '',
        citizenshipDev: '',
        intellectualDev: '',
        updatedAt: new Date().toISOString()
      };

      updatedMap[st.id] = {
        ...current,
        physicalScore: 3,
        emotionalScore: 3,
        citizenshipScore: 3,
        intellectualScore: 3,
        updatedAt: new Date().toISOString()
      };

      changedIds.add(st.id);
    });

    setAssessments(updatedMap);
    setUnsavedChanges(changedIds);
  };

  // Save all modified assessments to Firestore
  const handleSaveAll = async () => {
    if (!db) return;
    setIsSaving(true);
    setSaveSuccessMsg(null);

    try {
      const batch = writeBatch(db);
      const now = new Date().toISOString();
      const safeGrade = selectedGrade.replace(/\//g, '-');
      let count = 0;

      // Iterate through students that have unsaved changes or have any evaluation
      const targetIds = unsavedChanges.size > 0 ? Array.from(unsavedChanges) : Object.keys(assessments);

      for (const studentId of targetIds) {
        const item = assessments[studentId];
        if (!item) continue;

        const docId = item.id || `${safeGrade}_${studentId}_${systemAcademicYear}_${systemSemester}_summary`;
        const docRef = doc(db, 'assessments', docId);

        const health = semesterHealthMap[studentId];
        const dataToSave: KindergartenAssessment = {
          ...item,
          id: docId,
          studentId,
          gradeLevel: selectedGrade,
          academicYear: systemAcademicYear,
          semester: systemSemester,
          teacherId: currentTeacher?.id || item.teacherId || '',
          weight: health?.latestWeight || item.weight,
          height: health?.latestHeight || item.height,
          updatedAt: now
        };

        batch.set(docRef, dataToSave, { merge: true });
        count++;
      }

      await batch.commit();

      setUnsavedChanges(new Set());
      setSaveSuccessMsg(`บันทึกผลการประเมินพัฒนาการเรียบร้อยแล้ว (${count} รายการ)`);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Error saving assessments batch:', err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle save from individual detailed modal
  const handleSaveIndividualModal = async (savedAssessment: KindergartenAssessment, newWeight?: number, newHeight?: number) => {
    const studentId = savedAssessment.studentId;
    const now = new Date().toISOString();

    setAssessments(prev => ({
      ...prev,
      [studentId]: {
        ...savedAssessment,
        updatedAt: now
      }
    }));

    if (newWeight !== undefined || newHeight !== undefined) {
      setSemesterHealthMap(prev => {
        const cur = prev[studentId] || { bmiLabel: '-', bmiColor: '', recordCount: 0 };
        const w = newWeight !== undefined ? newWeight : cur.latestWeight;
        const h = newHeight !== undefined ? newHeight : cur.latestHeight;
        const bmiInfo = computeBmiInfo(w, h);
        return {
          ...cur,
          latestWeight: w,
          latestHeight: h,
          bmi: bmiInfo.bmi,
          bmiLabel: bmiInfo.bmiLabel,
          bmiColor: bmiInfo.bmiColor
        };
      });
    }

    setUnsavedChanges(prev => new Set(prev).add(studentId));
    setEvaluatingStudent(null);
  };

  // Real-time summary statistics for the class
  const classStats = useMemo(() => {
    const totalStudents = gradeStudents.length;
    if (totalStudents === 0) return null;

    const domainTotals = {
      physical: { s3: 0, s2: 0, s1: 0, unassessed: 0 },
      emotional: { s3: 0, s2: 0, s1: 0, unassessed: 0 },
      citizenship: { s3: 0, s2: 0, s1: 0, unassessed: 0 },
      intellectual: { s3: 0, s2: 0, s1: 0, unassessed: 0 }
    };

    let completeCount = 0;

    gradeStudents.forEach(st => {
      const a = assessments[st.id];
      if (!a) {
        domainTotals.physical.unassessed++;
        domainTotals.emotional.unassessed++;
        domainTotals.citizenship.unassessed++;
        domainTotals.intellectual.unassessed++;
        return;
      }

      // Check each domain
      if (a.physicalScore === 3) domainTotals.physical.s3++;
      else if (a.physicalScore === 2) domainTotals.physical.s2++;
      else if (a.physicalScore === 1) domainTotals.physical.s1++;
      else domainTotals.physical.unassessed++;

      if (a.emotionalScore === 3) domainTotals.emotional.s3++;
      else if (a.emotionalScore === 2) domainTotals.emotional.s2++;
      else if (a.emotionalScore === 1) domainTotals.emotional.s1++;
      else domainTotals.emotional.unassessed++;

      if (a.citizenshipScore === 3) domainTotals.citizenship.s3++;
      else if (a.citizenshipScore === 2) domainTotals.citizenship.s2++;
      else if (a.citizenshipScore === 1) domainTotals.citizenship.s1++;
      else domainTotals.citizenship.unassessed++;

      if (a.intellectualScore === 3) domainTotals.intellectual.s3++;
      else if (a.intellectualScore === 2) domainTotals.intellectual.s2++;
      else if (a.intellectualScore === 1) domainTotals.intellectual.s1++;
      else domainTotals.intellectual.unassessed++;

      if (a.physicalScore && a.emotionalScore && a.citizenshipScore && a.intellectualScore) {
        completeCount++;
      }
    });

    return {
      totalStudents,
      completeCount,
      percentComplete: Math.round((completeCount / totalStudents) * 100),
      domainTotals
    };
  }, [gradeStudents, assessments]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-3xl p-6 shadow-md text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner shrink-0">
              <Award className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider bg-white/25 px-2.5 py-0.5 rounded-full border border-white/20">
                  ระบบบันทึกผลการประเมินพัฒนาการตลอดภาคเรียน
                </span>
                <span className="text-[11px] font-bold bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full">
                  3 ระดับคุณภาพ
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight">
                สมุดประเมินพัฒนาการเด็กปฐมวัย (ปพ.5)
              </h2>
              <p className="text-emerald-100 text-xs mt-1">
                ปีการศึกษา {systemAcademicYear} ภาคเรียนที่ {systemSemester} • รวบรวมข้อมูลภาวะโภชนาการตลอดเทอม และประเมิน 4 ด้านหลัก
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowPrintModal(true)}
              disabled={gradeStudents.length === 0}
              className="px-4 py-2.5 bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Printer className="h-4 w-4" />
              <span>พิมพ์รายงาน ปพ.5 ปฐมวัย</span>
            </button>
            
            <button
              onClick={handleSaveAll}
              disabled={isSaving || gradeStudents.length === 0}
              className="px-5 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-emerald-600" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 text-emerald-600" />
                  <span>บันทึกผลการประเมินทั้งหมด</span>
                  {unsavedChanges.size > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] rounded-full font-bold">
                      {unsavedChanges.size}
                    </span>
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Filters and Fast Action Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Grade selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 mr-1">ระดับชั้น:</span>
          {['อนุบาล 1', 'อนุบาล 2', 'อนุบาล 3'].map(g => (
            <button
              key={g}
              onClick={() => setSelectedGrade(g)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedGrade === g
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={handleQuickFillAllGood}
            disabled={gradeStudents.length === 0}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            title="ตั้งค่าระดับ 3 (ดี) ให้เด็กทั้งห้องในคลิกเดียว เพื่อความรวดเร็วในการบันทึก"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span>ตั้งค่าเริ่มต้น [ 3 ดี ] ทุกคน</span>
          </button>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            title="โหลดข้อมูลใหม่อีกครั้ง"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>รีเฟรช</span>
          </button>
        </div>
      </div>

      {/* Legend & Guide Bar */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-bold text-slate-700">เกณฑ์ระดับคุณภาพ:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-[11px] shadow-sm">3</span>
            <span className="text-slate-700 font-medium">ดี (ปฏิบัติได้ดี/สมวัยสม่ำเสมอ)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-lg bg-sky-600 text-white font-bold flex items-center justify-center text-[11px] shadow-sm">2</span>
            <span className="text-slate-700 font-medium">พอใช้ (ปฏิบัติได้มีผู้ชี้แนะ)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-lg bg-rose-500 text-white font-bold flex items-center justify-center text-[11px] shadow-sm">1</span>
            <span className="text-slate-700 font-medium">ควรส่งเสริม (ต้องส่งเสริมเป็นพิเศษ)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500 text-[11px]">
          <HeartPulse className="h-4 w-4 text-emerald-600" />
          <span>ข้อมูล นน./สส. และ BMI ดึงสรุปจากบันทึกตลอดภาคเรียนให้อัตโนมัติ</span>
        </div>
      </div>

      {/* Interactive Table Sheet */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        
        {/* Table Header Summary */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              <span>รายชื่อนักเรียนระดับชั้น {selectedGrade} ({gradeStudents.length} คน)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ประเมินครบ 4 ด้านแล้ว {classStats?.completeCount || 0}/{gradeStudents.length} คน ({classStats?.percentComplete || 0}%)
              {unsavedChanges.size > 0 && (
                <span className="ml-2 text-rose-600 font-bold">• มี {unsavedChanges.size} คนที่ยังไม่ได้กดบันทึก</span>
              )}
            </p>
          </div>

          <div className="w-full sm:w-48 bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${classStats?.percentComplete || 0}%` }}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-16 text-center text-slate-400">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-emerald-600" />
            <p className="text-xs font-bold text-slate-600">กำลังดึงข้อมูลการประเมินและสถิติสุขภาพตลอดเทอม...</p>
          </div>
        ) : gradeStudents.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-xs">
            <Users className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-600 text-sm">ไม่พบข้อมูลนักเรียนในชั้น {selectedGrade}</p>
            <p className="mt-1">คุณสามารถเพิ่มนักเรียนได้ที่โมดูลห้องเรียน หรือสลับไประดับชั้นอื่น</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-3 px-3 w-12 text-center">เลขที่</th>
                  <th className="py-3 px-4 min-w-[180px]">ชื่อ - นามสกุล</th>
                  <th className="py-3 px-4 min-w-[170px] text-center bg-emerald-50/40 border-x border-slate-100">
                    <div className="flex items-center justify-center gap-1 text-emerald-900 font-bold">
                      <HeartPulse className="h-3.5 w-3.5 text-emerald-600" />
                      <span>สุขภาพ & โภชนาการตลอดเทอม</span>
                    </div>
                  </th>
                  <th className="py-3 px-3 text-center min-w-[150px]">
                    <div className="flex items-center justify-center gap-1 text-pink-700 font-bold">
                      <Activity className="h-3.5 w-3.5" />
                      <span>1. สุขภาวะทางกาย</span>
                    </div>
                  </th>
                  <th className="py-3 px-3 text-center min-w-[150px]">
                    <div className="flex items-center justify-center gap-1 text-rose-700 font-bold">
                      <Smile className="h-3.5 w-3.5" />
                      <span>2. อารมณ์-สังคม</span>
                    </div>
                  </th>
                  <th className="py-3 px-3 text-center min-w-[150px]">
                    <div className="flex items-center justify-center gap-1 text-amber-700 font-bold">
                      <Compass className="h-3.5 w-3.5" />
                      <span>3. พลเมือง-ไทย</span>
                    </div>
                  </th>
                  <th className="py-3 px-3 text-center min-w-[150px]">
                    <div className="flex items-center justify-center gap-1 text-indigo-700 font-bold">
                      <Brain className="h-3.5 w-3.5" />
                      <span>4. สติปัญญา</span>
                    </div>
                  </th>
                  <th className="py-3 px-3 text-center w-28">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {gradeStudents.map((student) => {
                  const assessment = assessments[student.id] || {} as KindergartenAssessment;
                  const health = semesterHealthMap[student.id];
                  const hasUnsaved = unsavedChanges.has(student.id);

                  const renderScoreButtons = (
                    domainKey: 'physicalScore' | 'emotionalScore' | 'citizenshipScore' | 'intellectualScore',
                    activeScore?: 1 | 2 | 3
                  ) => {
                    return (
                      <div className="flex items-center justify-center gap-1">
                        {([3, 2, 1] as const).map((val) => {
                          const isSelected = activeScore === val;
                          let style = '';
                          if (val === 3) {
                            style = isSelected 
                              ? 'bg-emerald-600 text-white font-black shadow-sm ring-2 ring-emerald-600/30' 
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60';
                          } else if (val === 2) {
                            style = isSelected 
                              ? 'bg-sky-600 text-white font-black shadow-sm ring-2 ring-sky-600/30' 
                              : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200/60';
                          } else {
                            style = isSelected 
                              ? 'bg-rose-500 text-white font-black shadow-sm ring-2 ring-rose-500/30' 
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60';
                          }

                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => handleSetScore(student.id, domainKey, val)}
                              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${style}`}
                              title={val === 3 ? 'ระดับ 3 (ดี)' : val === 2 ? 'ระดับ 2 (พอใช้)' : 'ระดับ 1 (ควรส่งเสริม)'}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    );
                  };

                  return (
                    <tr 
                      key={student.id} 
                      className={`hover:bg-slate-50/70 transition-colors ${hasUnsaved ? 'bg-amber-50/20' : ''}`}
                    >
                      {/* Number */}
                      <td className="py-3 px-3 text-center font-bold text-slate-700">
                        {student.number || '-'}
                      </td>

                      {/* Student Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {student.photoURL ? (
                            <img 
                              src={student.photoURL} 
                              alt="" 
                              className="w-8 h-8 rounded-full object-cover border border-slate-200" 
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                              {student.firstName?.[0] || 'น'}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                              <span>{student.title || ''} {student.firstName} {student.lastName}</span>
                              {hasUnsaved && (
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="ยังไม่บันทึก" />
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              รหัส {student.studentId || student.id.slice(0, 6)}
                              {student.nickname && ` • (${student.nickname})`}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Semester Health & Growth Summary */}
                      <td className="py-3 px-4 text-center bg-emerald-50/20 border-x border-slate-100">
                        {health?.latestWeight && health?.latestHeight ? (
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-800">
                              {health.latestWeight} กก. / {health.latestHeight} ซม.
                            </div>
                            
                            {/* Growth diff if recorded across semester */}
                            {(health.weightDiff !== undefined || health.heightDiff !== undefined) && (
                              <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                                <TrendingUp className="h-3 w-3 text-emerald-600" />
                                <span>
                                  {health.weightDiff !== undefined && `นน. ${health.weightDiff >= 0 ? '+' : ''}${health.weightDiff} กก.`}
                                  {health.heightDiff !== undefined && ` • สส. ${health.heightDiff >= 0 ? '+' : ''}${health.heightDiff} ซม.`}
                                </span>
                              </div>
                            )}

                            {/* Nutrition badge */}
                            <div className="pt-0.5">
                              <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${health.bmiColor}`}>
                                {health.bmiLabel} (BMI {health.bmi})
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">
                            รอชั่ง/วัดในระบบ
                          </span>
                        )}
                      </td>

                      {/* 1. Physical */}
                      <td className="py-3 px-3 text-center">
                        {renderScoreButtons('physicalScore', assessment.physicalScore)}
                      </td>

                      {/* 2. Emotional */}
                      <td className="py-3 px-3 text-center">
                        {renderScoreButtons('emotionalScore', assessment.emotionalScore)}
                      </td>

                      {/* 3. Citizenship */}
                      <td className="py-3 px-3 text-center">
                        {renderScoreButtons('citizenshipScore', assessment.citizenshipScore)}
                      </td>

                      {/* 4. Intellectual */}
                      <td className="py-3 px-3 text-center">
                        {renderScoreButtons('intellectualScore', assessment.intellectualScore)}
                      </td>

                      {/* Action Tools */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleSetAllThreeForStudent(student.id)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-amber-200/60"
                            title="กดเพื่อให้ 3 (ดี) ครบทั้ง 4 ด้านรวดเร็ว"
                          >
                            <Zap className="h-3.5 w-3.5" />
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => setEvaluatingStudent(student)}
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200/60"
                            title="บันทึกข้อสังเกตและคำบรรยายเพิ่มเติม"
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Class Statistics Breakdown */}
      {classStats && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Award className="h-4 w-4 text-emerald-600" />
              <span>สรุปภาพรวมผลการประเมินพัฒนาการระดับชั้น {selectedGrade}</span>
            </h4>
            <span className="text-xs text-slate-500 font-medium">
              นักเรียนทั้งหมด {classStats.totalStudents} คน
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* 1. Physical */}
            <div className="p-3.5 bg-pink-50/50 border border-pink-100 rounded-2xl space-y-2">
              <div className="font-bold text-pink-900 flex items-center justify-between">
                <span>1. สุขภาวะทางกาย</span>
                <Activity className="h-4 w-4 text-pink-500" />
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>ดี (3):</span>
                  <span className="font-bold">{classStats.domainTotals.physical.s3} คน ({Math.round((classStats.domainTotals.physical.s3 / classStats.totalStudents) * 100)}%)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-500"></span>พอใช้ (2):</span>
                  <span className="font-bold">{classStats.domainTotals.physical.s2} คน</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span>ควรส่งเสริม (1):</span>
                  <span className="font-bold">{classStats.domainTotals.physical.s1} คน</span>
                </div>
              </div>
            </div>

            {/* 2. Emotional */}
            <div className="p-3.5 bg-rose-50/50 border border-rose-100 rounded-2xl space-y-2">
              <div className="font-bold text-rose-900 flex items-center justify-between">
                <span>2. อารมณ์ จิตใจ และสังคม</span>
                <Smile className="h-4 w-4 text-rose-500" />
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>ดี (3):</span>
                  <span className="font-bold">{classStats.domainTotals.emotional.s3} คน ({Math.round((classStats.domainTotals.emotional.s3 / classStats.totalStudents) * 100)}%)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-500"></span>พอใช้ (2):</span>
                  <span className="font-bold">{classStats.domainTotals.emotional.s2} คน</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span>ควรส่งเสริม (1):</span>
                  <span className="font-bold">{classStats.domainTotals.emotional.s1} คน</span>
                </div>
              </div>
            </div>

            {/* 3. Citizenship */}
            <div className="p-3.5 bg-amber-50/50 border border-amber-100 rounded-2xl space-y-2">
              <div className="font-bold text-amber-900 flex items-center justify-between">
                <span>3. พลเมืองและความเป็นไทย</span>
                <Compass className="h-4 w-4 text-amber-600" />
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>ดี (3):</span>
                  <span className="font-bold">{classStats.domainTotals.citizenship.s3} คน ({Math.round((classStats.domainTotals.citizenship.s3 / classStats.totalStudents) * 100)}%)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-500"></span>พอใช้ (2):</span>
                  <span className="font-bold">{classStats.domainTotals.citizenship.s2} คน</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span>ควรส่งเสริม (1):</span>
                  <span className="font-bold">{classStats.domainTotals.citizenship.s1} คน</span>
                </div>
              </div>
            </div>

            {/* 4. Intellectual */}
            <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-2">
              <div className="font-bold text-indigo-900 flex items-center justify-between">
                <span>4. สติปัญญาและการเรียนรู้</span>
                <Brain className="h-4 w-4 text-indigo-500" />
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>ดี (3):</span>
                  <span className="font-bold">{classStats.domainTotals.intellectual.s3} คน ({Math.round((classStats.domainTotals.intellectual.s3 / classStats.totalStudents) * 100)}%)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-500"></span>พอใช้ (2):</span>
                  <span className="font-bold">{classStats.domainTotals.intellectual.s2} คน</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span>ควรส่งเสริม (1):</span>
                  <span className="font-bold">{classStats.domainTotals.intellectual.s1} คน</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Modal */}
      {evaluatingStudent && (
        <KindergartenAssessmentModal
          student={evaluatingStudent}
          existingAssessment={assessments[evaluatingStudent.id] || {
            id: '',
            studentId: evaluatingStudent.id,
            gradeLevel: selectedGrade,
            academicYear: systemAcademicYear,
            semester: systemSemester,
            teacherId: currentTeacher?.id || '',
            physicalDev: '',
            emotionalDev: '',
            citizenshipDev: '',
            intellectualDev: '',
            updatedAt: new Date().toISOString()
          }}
          onClose={() => setEvaluatingStudent(null)}
          onSave={handleSaveIndividualModal}
        />
      )}

      {/* Print Modal */}
      {showPrintModal && (
        <KindergartenPrintTemplate
          students={gradeStudents}
          assessments={assessments}
          teacher={currentTeacher || { id: '', employeeId: '', thaiName: 'ครูประจำชั้น' } as Teacher}
          academicYear={systemAcademicYear}
          semester={systemSemester}
          onClose={() => setShowPrintModal(false)}
        />
      )}

    </div>
  );
};
