import React, { useState, useEffect, useMemo } from 'react';
import { 
  Student, 
  Teacher, 
  KindergartenAssessment, 
  CurriculumSubject 
} from '../types';
import { 
  Award, 
  Sparkles, 
  Printer, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Edit, 
  ChevronRight, 
  BookOpen, 
  Users, 
  Scale, 
  Activity, 
  Heart, 
  Smile, 
  Brain, 
  Compass,
  FileText
} from 'lucide-react';
import { collection, query, where, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { KindergartenAssessmentModal } from './KindergartenAssessmentModal';
import { KindergartenPrintTemplate } from './KindergartenPrintTemplate';
import { KindergartenTemplateModal } from './KindergartenTemplateModal';

interface KindergartenEvaluationDashboardProps {
  students: Student[];
  currentTeacher: Teacher;
  systemAcademicYear: string;
  systemSemester: string;
}

export const KindergartenEvaluationDashboard: React.FC<KindergartenEvaluationDashboardProps> = ({
  students,
  currentTeacher,
  systemAcademicYear,
  systemSemester,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<string>('อนุบาล 1');
  const [selectedMonth, setSelectedMonth] = useState<string>(() => new Date().toISOString().slice(0, 7));
  const [assessments, setAssessments] = useState<Record<string, KindergartenAssessment>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [evaluatingStudent, setEvaluatingStudent] = useState<Student | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showKgTemplateModal, setShowKgTemplateModal] = useState(false);
  const [curriculums, setCurriculums] = useState<CurriculumSubject[]>([]);

  // Filter students in selected grade
  const gradeStudents = useMemo(() => {
    return students
      .filter(s => (s.status === 'active' || !s.status) && s.gradeLevel === selectedGrade)
      .sort((a, b) => (Number(a.number) || 0) - (Number(b.number) || 0));
  }, [students, selectedGrade]);

  // Fetch assessments for this grade, year, and month
  const fetchAssessments = async () => {
    if (!db) return;
    setIsLoading(true);
    try {
      const q = query(
        collection(db, 'assessments'),
        where('gradeLevel', '==', selectedGrade),
        where('academicYear', '==', systemAcademicYear),
        where('semester', '==', systemSemester)
      );
      const snapshot = await getDocs(q);
      const map: Record<string, KindergartenAssessment> = {};
      snapshot.docs.forEach(d => {
        const data = d.data() as KindergartenAssessment;
        // Match either studentId or id
        if (data.studentId) {
          map[data.studentId] = { ...data, id: d.id };
        }
      });
      setAssessments(map);
    } catch (err) {
      console.error('Error fetching kindergarten assessments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch curriculums to see if 2568 template is loaded
  const fetchCurriculums = async () => {
    if (!db) return;
    try {
      const q = query(collection(db, 'curriculums'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as CurriculumSubject));
      setCurriculums(data);
    } catch (err) {
      console.error('Error fetching curriculums:', err);
    }
  };

  useEffect(() => {
    fetchAssessments();
    fetchCurriculums();
  }, [selectedGrade, systemAcademicYear, systemSemester]);

  const activeCurriculum = useMemo(() => {
    return curriculums.find(c => 
      (c.gradeLevel === selectedGrade || (c.gradeLevels && c.gradeLevels.includes(selectedGrade))) &&
      (c.subjectName.includes('ปฐมวัย') || c.subjectName.includes('อนุบาล'))
    );
  }, [curriculums, selectedGrade]);

  const getInitialAssessment = (studentId: string): KindergartenAssessment => {
    return {
      id: '',
      studentId,
      gradeLevel: selectedGrade,
      academicYear: systemAcademicYear,
      semester: systemSemester,
      teacherId: currentTeacher?.id || '',
      month: selectedMonth,
      physicalDev: '',
      emotionalDev: '',
      citizenshipDev: '',
      intellectualDev: '',
      updatedAt: new Date().toISOString()
    };
  };

  const handleSaveAssessment = async (assessment: any, newWeight?: number, newHeight?: number) => {
    try {
      const now = new Date().toISOString();
      const currentStudent = students.find(s => s.id === assessment.studentId);
      
      if (currentStudent && (newWeight !== currentStudent.weight || newHeight !== currentStudent.height)) {
        try {
          await updateDoc(doc(db, 'students', currentStudent.id), {
            ...(newWeight !== undefined ? { weight: newWeight } : {}),
            ...(newHeight !== undefined ? { height: newHeight } : {}),
            updatedAt: now
          });
          currentStudent.weight = newWeight;
          currentStudent.height = newHeight;
        } catch (e) {
          console.error('Error updating student dimensions:', e);
        }
      }

      const safeGrade = selectedGrade.replace(/\//g, '-');
      const targetMonth = assessment.month || selectedMonth || now.slice(0, 7);
      const docId = `${safeGrade}_${assessment.studentId}_${systemAcademicYear}_${systemSemester}_${targetMonth}`;

      const assessmentToSave: KindergartenAssessment = {
        ...assessment,
        id: docId,
        studentId: assessment.studentId,
        gradeLevel: selectedGrade,
        academicYear: systemAcademicYear,
        semester: systemSemester,
        teacherId: currentTeacher?.id || assessment.teacherId || '',
        month: targetMonth,
        updatedAt: now
      };

      await setDoc(doc(db, 'assessments', docId), assessmentToSave);

      setAssessments(prev => ({
        ...prev,
        [assessment.studentId]: assessmentToSave
      }));

      setEvaluatingStudent(null);
    } catch (error) {
      console.error('Error saving kindergarten assessment:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกผลการประเมิน');
    }
  };

  // Stats calculation
  const evaluatedCount = useMemo(() => {
    return gradeStudents.filter(s => {
      const a = assessments[s.id];
      return a && (a.physicalDev || a.emotionalDev || a.citizenshipDev || a.intellectualDev);
    }).length;
  }, [gradeStudents, assessments]);

  const fullyEvaluatedCount = useMemo(() => {
    return gradeStudents.filter(s => {
      const a = assessments[s.id];
      return a && a.physicalDev && a.emotionalDev && a.citizenshipDev && a.intellectualDev;
    }).length;
  }, [gradeStudents, assessments]);

  const getBmiLabel = (bmi: number | null | undefined) => {
    if (bmi === null || bmi === undefined) return '-';
    if (bmi < 18.5) return 'ผอม';
    if (bmi >= 18.5 && bmi < 23) return 'สมส่วน';
    if (bmi >= 23 && bmi < 25) return 'ท้วม';
    if (bmi >= 25) return 'อ้วน';
    return '-';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner & Fast Action Card */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 rounded-3xl p-6 shadow-md text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner shrink-0">
              <Award className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider bg-white/25 px-2.5 py-0.5 rounded-full border border-white/20">
                  หลักสูตรการศึกษาปฐมวัย พ.ศ. 2568
                </span>
                <span className="text-[11px] font-bold bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full">
                  สมรรถนะ 4 ด้าน
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight">
                ระบบวัดและประเมินพัฒนาการระดับปฐมวัย
              </h2>
              <p className="text-pink-100 text-xs mt-1">
                ปีการศึกษา {systemAcademicYear} ภาคเรียนที่ {systemSemester} • ประเมินตามสภาพจริง บูรณาการ 4 สาระที่ควรเรียนรู้
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowKgTemplateModal(true)}
              className="px-4 py-2.5 bg-white text-pink-700 hover:bg-pink-50 rounded-xl text-xs font-black shadow-sm transition-all flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4 text-pink-500" />
              <span>นำเข้า/ตั้งค่าแม่แบบหลักสูตร 2568</span>
            </button>
            <button
              onClick={() => setShowPrintModal(true)}
              disabled={gradeStudents.length === 0}
              className="px-4 py-2.5 bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Printer className="h-4 w-4" />
              <span>พิมพ์รายงาน ปพ.3 ปฐมวัย</span>
            </button>
          </div>
        </div>
      </div>

      {/* Curriculum Status Banner */}
      {activeCurriculum ? (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <CheckCircle className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-emerald-900">
                เชื่อมโยงหลักสูตรแล้ว: {activeCurriculum.subjectName} ({activeCurriculum.gradeLevel})
              </span>
              <p className="text-emerald-700 text-[11px] mt-0.5">
                มี {activeCurriculum.standards?.length || 0} มาตรฐานสมรรถนะ • {activeCurriculum.units?.length || 0} หน่วยการเรียนรู้บูรณาการ
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowKgTemplateModal(true)}
            className="text-emerald-800 hover:text-emerald-950 font-bold underline shrink-0"
          >
            ปรับปรุงโครงสร้างหลักสูตร
          </button>
        </div>
      ) : (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <AlertCircle className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-amber-900">
                ยังไม่ได้นำเข้าแม่แบบหลักสูตรปฐมวัย พ.ศ. 2568 สำหรับชั้น {selectedGrade}
              </span>
              <p className="text-amber-700 text-[11px] mt-0.5">
                คลิกเพื่อนำเข้า 4 สมรรถนะหลักและสาระการเรียนรู้ 4 เรื่องเข้าสู่ระบบจัดการหลักสูตรได้ทันที
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowKgTemplateModal(true)}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm transition-colors shrink-0 flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>นำเข้าแม่แบบ 2568 ทันที</span>
          </button>
        </div>
      )}

      {/* Class and Month Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 mr-1">เลือกระดับชั้น:</span>
          {['อนุบาล 1', 'อนุบาล 2', 'อนุบาล 3'].map(g => (
            <button
              key={g}
              onClick={() => setSelectedGrade(g)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedGrade === g
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-500/20'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>รอบการประเมิน (เดือน):</span>
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
      </div>

      {/* 4 Competencies Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Physical */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-pink-600 uppercase tracking-wider">สมรรถนะที่ 1</span>
            <h4 className="text-xs font-bold text-slate-800">ด้านสุขภาวะทางกาย</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              การเติบโต สุขนิสัย กล้ามเนื้อมัดใหญ่-เล็ก และความปลอดภัย
            </p>
          </div>
        </div>

        {/* 2. Emotional & Social */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <Smile className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">สมรรถนะที่ 2</span>
            <h4 className="text-xs font-bold text-slate-800">ด้านอารมณ์ จิตใจ และสังคม</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              ร่าเริง แจ่มใส ช่วยเหลือตนเอง แบ่งปัน และอยู่ร่วมกับผู้อื่น
            </p>
          </div>
        </div>

        {/* 3. Citizenship & Thainess */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">สมรรถนะที่ 3</span>
            <h4 className="text-xs font-bold text-slate-800">ด้านพลเมืองและความเป็นไทย</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              เคารพกติกา มารยาทไทย ภูมิใจความเป็นไทย และรักสิ่งแวดล้อม
            </p>
          </div>
        </div>

        {/* 4. Intellectual */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">สมรรถนะที่ 4</span>
            <h4 className="text-xs font-bold text-slate-800">ด้านสติปัญญาและการเรียนรู้</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              การสื่อสาร การคิด ช่างสังเกต จินตนาการสร้างสรรค์
            </p>
          </div>
        </div>

      </div>

      {/* Progress & Students List */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
              <Users className="h-5 w-5 text-pink-500" />
              <span>รายชื่อนักเรียนระดับชั้น {selectedGrade} ({gradeStudents.length} คน)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ประเมินแล้วครบทุกด้าน {fullyEvaluatedCount}/{gradeStudents.length} คน • บันทึกบางส่วน {evaluatedCount}/{gradeStudents.length} คน
            </p>
          </div>
          
          <div className="w-full sm:w-48 bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-pink-500 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${gradeStudents.length > 0 ? (fullyEvaluatedCount / gradeStudents.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        {gradeStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Users className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-600 text-sm">ไม่พบข้อมูลนักเรียนในชั้น {selectedGrade}</p>
            <p className="mt-1">คุณสามารถเพิ่มนักเรียนได้ที่โมดูลห้องเรียน หรือเลือกชั้นเรียนอื่น</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-600 font-bold">
                  <th className="py-3 px-4 w-12 text-center">เลขที่</th>
                  <th className="py-3 px-4">ชื่อ - นามสกุล</th>
                  <th className="py-3 px-4 text-center">น้ำหนัก/ส่วนสูง (BMI)</th>
                  <th className="py-3 px-4 text-center">1. สุขภาวะกาย</th>
                  <th className="py-3 px-4 text-center">2. อารมณ์-สังคม</th>
                  <th className="py-3 px-4 text-center">3. พลเมือง-ไทย</th>
                  <th className="py-3 px-4 text-center">4. สติปัญญา</th>
                  <th className="py-3 px-4 text-center">สถานะประเมิน</th>
                  <th className="py-3 px-4 text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {gradeStudents.map((student) => {
                  const assessment = assessments[student.id];
                  const hasPhysical = !!assessment?.physicalDev;
                  const hasEmotional = !!assessment?.emotionalDev;
                  const hasCitizenship = !!assessment?.citizenshipDev;
                  const hasIntellectual = !!assessment?.intellectualDev;
                  
                  const isComplete = hasPhysical && hasEmotional && hasCitizenship && hasIntellectual;
                  const isPartial = (hasPhysical || hasEmotional || hasCitizenship || hasIntellectual) && !isComplete;

                  const weight = (assessment as any)?.weight !== undefined ? (assessment as any).weight : student.weight;
                  const height = (assessment as any)?.height !== undefined ? (assessment as any).height : student.height;
                  
                  let bmi: number | null = null;
                  if (weight && height) {
                    const hInMeters = height / 100;
                    bmi = Number((weight / (hInMeters * hInMeters)).toFixed(1));
                  }

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 text-center font-bold text-slate-700">
                        {student.number || '-'}
                      </td>
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
                            <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-xs">
                              {student.firstName?.[0] || 'น'}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-800">
                              {student.title || ''} {student.firstName} {student.lastName}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              รหัส {student.studentId || student.id.slice(0, 6)}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        {weight && height ? (
                          <div>
                            <span className="font-medium text-slate-700">{weight} กก. / {height} ซม.</span>
                            <div className="text-[10px] text-emerald-600 font-bold">
                              BMI {bmi} ({getBmiLabel(bmi)})
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">- ยังไม่ระบุ -</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold ${
                          hasPhysical ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {hasPhysical ? '✓' : '•'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold ${
                          hasEmotional ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {hasEmotional ? '✓' : '•'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold ${
                          hasCitizenship ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {hasCitizenship ? '✓' : '•'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold ${
                          hasIntellectual ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {hasIntellectual ? '✓' : '•'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        {isComplete ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ครบ 4 ด้าน
                          </span>
                        ) : isPartial ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            บันทึกบางส่วน
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                            รอประเมิน
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setEvaluatingStudent(student)}
                          className="px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 mx-auto"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          <span>{assessment ? 'แก้ไขประเมิน' : 'บันทึกประเมิน'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Assessment Modal */}
      {evaluatingStudent && (
        <KindergartenAssessmentModal
          student={evaluatingStudent}
          existingAssessment={
            assessments[evaluatingStudent.id] ||
            getInitialAssessment(evaluatingStudent.id)
          }
          onClose={() => setEvaluatingStudent(null)}
          onSave={handleSaveAssessment}
        />
      )}

      {/* Print Template Modal */}
      {showPrintModal && (
        <KindergartenPrintTemplate
          students={gradeStudents}
          assessments={assessments}
          teacher={currentTeacher}
          academicYear={systemAcademicYear}
          semester={systemSemester}
          selectedMonth={selectedMonth}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {/* Kindergarten Curriculum Template Modal */}
      {showKgTemplateModal && (
        <KindergartenTemplateModal
          isOpen={showKgTemplateModal}
          onClose={() => setShowKgTemplateModal(false)}
          existingCurriculums={curriculums}
          onSuccess={async () => {
            await fetchCurriculums();
            alert('นำเข้าแม่แบบหลักสูตรปฐมวัย พ.ศ. 2568 เรียบร้อยแล้ว!');
          }}
        />
      )}

    </div>
  );
};
