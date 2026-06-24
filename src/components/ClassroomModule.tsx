import React, { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle, Printer, ChevronDown, UserPlus, FileSpreadsheet, Download, Search } from 'lucide-react';
import { Student, StudentAssessment, GRADE_LEVELS, Teacher } from '../types';
import { AssessmentPrintTemplate } from './AssessmentPrintTemplate';
import { ImportStudentData } from './ImportStudentData';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, query, where, doc, setDoc, writeBatch } from 'firebase/firestore';

interface ClassroomModuleProps {
  currentTeacher: Teacher | null;
}

export const ClassroomModule: React.FC<ClassroomModuleProps> = ({ currentTeacher }) => {
  const [activeTab, setActiveTab] = useState<'students' | 'assessments'>('students');
  const [selectedGrade, setSelectedGrade] = useState<string>(GRADE_LEVELS[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [showImport, setShowImport] = useState(false);
  
  // Assessments state
  const [assessments, setAssessments] = useState<Record<string, StudentAssessment>>({});
  const [evaluatingStudent, setEvaluatingStudent] = useState<Student | null>(null);
  
  // Print state
  const [printStudents, setPrintStudents] = useState<Student[] | null>(null);

  useEffect(() => {
    // Fetch students from Firestore
    const qStudents = query(collection(db, 'students'), where('gradeLevel', '==', selectedGrade));
    const unsubscribeStudents = onSnapshot(qStudents, (snapshot) => {
      const fetchedStudents = snapshot.docs.map(doc => ({
        ...doc.data()
      })) as Student[];
      
      // Sort by number
      fetchedStudents.sort((a, b) => a.number - b.number);
      
      setStudents(fetchedStudents);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'students');
    });

    // Fetch assessments for the current grade level
    const qAssessments = query(collection(db, 'assessments'), where('gradeLevel', '==', selectedGrade));
    const unsubscribeAssessments = onSnapshot(qAssessments, (snapshot) => {
      const fetchedAssessments: Record<string, StudentAssessment> = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data() as StudentAssessment;
        fetchedAssessments[data.studentId] = data;
      });
      setAssessments(fetchedAssessments);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'assessments');
    });

    return () => {
      unsubscribeStudents();
      unsubscribeAssessments();
    };
  }, [selectedGrade]);

  const filteredStudents = students;

  // Initialize empty assessment if not exist
  const getInitialAssessment = (studentId: string): StudentAssessment => {
    return {
      id: `a-${Date.now()}`,
      studentId,
      gradeLevel: selectedGrade,
      semester: '1',
      academicYear: '2567',
      teacherId: currentTeacher?.id || 't-unknown',
      characterTraits: { trait1: 0, trait2: 0, trait3: 0, trait4: 0, trait5: 0, trait6: 0, trait7: 0, trait8: 0 },
      competencies: { comp1: 0, comp2: 0, comp3: 0, comp4: 0, comp5: 0 },
      readingWriting: 0,
      comments: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  const [isGeneratingMock, setIsGeneratingMock] = useState(false);

  const handleGenerateMockData = async () => {
    if (!window.confirm(`ต้องการสร้างข้อมูลนักเรียนจำลองสำหรับชั้น ${selectedGrade} หรือไม่? (ระบบจะสร้างข้อมูลให้ 5 คน)`)) {
      return;
    }
    
    setIsGeneratingMock(true);
    try {
      const batch = writeBatch(db);
      const mockStudents = [
        { studentId: Math.floor(10000 + Math.random() * 90000).toString(), firstName: 'สมชาย', lastName: 'รักเรียน', nickname: 'ชาย', gender: 'male', number: 1 },
        { studentId: Math.floor(10000 + Math.random() * 90000).toString(), firstName: 'สมหญิง', lastName: 'ตั้งใจ', nickname: 'หญิง', gender: 'female', number: 2 },
        { studentId: Math.floor(10000 + Math.random() * 90000).toString(), firstName: 'สมศักดิ์', lastName: 'ขยันยิ่ง', nickname: 'ศักดิ์', gender: 'male', number: 3 },
        { studentId: Math.floor(10000 + Math.random() * 90000).toString(), firstName: 'มาลี', lastName: 'ดีงาม', nickname: 'มะลิ', gender: 'female', number: 4 },
        { studentId: Math.floor(10000 + Math.random() * 90000).toString(), firstName: 'วิชาญ', lastName: 'ใฝ่รู้', nickname: 'ชาญ', gender: 'male', number: 5 }
      ];

      for (const student of mockStudents) {
        const newDocRef = doc(collection(db, 'students'));
        batch.set(newDocRef, {
          id: newDocRef.id,
          ...student,
          gradeLevel: selectedGrade,
          status: 'active'
        });
      }
      
      await batch.commit();
      alert('สร้างข้อมูลนักเรียนจำลองสำเร็จ');
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการสร้างข้อมูล');
    } finally {
      setIsGeneratingMock(false);
    }
  };

  const handleSaveAssessment = async (assessment: StudentAssessment) => {
    try {
      const assessmentToSave = {
        ...assessment,
        updatedAt: new Date().toISOString()
      };
      // We can use the studentId as the document ID so each student has one assessment per grade
      const docId = `${assessment.gradeLevel}_${assessment.studentId}`;
      assessmentToSave.id = docId;
      await setDoc(doc(db, 'assessments', docId), assessmentToSave);
      setEvaluatingStudent(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'assessments');
    }
  };

  const printSingleReport = (student: Student) => {
    setPrintStudents([student]);
  };

  const printBatchReport = () => {
    // Print all students in the current grade who have been assessed
    const assessedStudents = filteredStudents.filter(s => assessments[s.id]);
    if (assessedStudents.length === 0) {
      alert("ยังไม่มีข้อมูลการประเมินในระดับชั้นนี้");
      return;
    }
    setPrintStudents(assessedStudents);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <div className="print:hidden space-y-6">
        {/* Module Header with attractive display */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-pink-300 opacity-20 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl"></div>
          
          <div className="flex items-center gap-5 relative z-10">
            <div className="h-16 w-16 bg-white/20 backdrop-blur-md text-white rounded-2xl flex items-center justify-center shadow-inner border border-white/30">
              <Users className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight drop-shadow-sm">2. การจัดการชั้นเรียน (LessonClass)</h2>
              <p className="text-pink-100 font-medium mt-1">จัดการข้อมูลนักเรียนและประเมินพัฒนาการแบบรายบุคคล</p>
            </div>
          </div>
          
          {/* Grade Selector inside header */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 rounded-xl">
            <label className="text-sm font-bold text-pink-50">เลือกระดับชั้น:</label>
            <div className="relative">
              <select 
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="appearance-none bg-white text-slate-800 rounded-lg pl-3 pr-8 py-1.5 text-sm font-bold focus:ring-2 focus:ring-pink-300 outline-none w-full sm:w-auto min-w-[120px] shadow-sm cursor-pointer"
              >
                {GRADE_LEVELS.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-100 max-w-md">
        <button
          onClick={() => setActiveTab('students')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'students' ? 'bg-pink-100 text-pink-700' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <UserPlus className="h-4 w-4" /> ฐานข้อมูลนักเรียน
        </button>
        <button
          onClick={() => setActiveTab('assessments')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'assessments' ? 'bg-pink-100 text-pink-700' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <CheckCircle className="h-4 w-4" /> ประเมินพัฒนาการ
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        
        {activeTab === 'students' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-800">รายชื่อนักเรียน {selectedGrade}</h3>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={handleGenerateMockData}
                  disabled={isGeneratingMock}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Users className="h-4 w-4" /> {isGeneratingMock ? 'กำลังสร้าง...' : 'สร้างข้อมูลสมมติ'}
                </button>
                <button 
                  onClick={() => setShowImport(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                >
                  <FileSpreadsheet className="h-4 w-4" /> นำเข้าข้อมูล (Excel/CSV)
                </button>
                <button className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                  <UserPlus className="h-4 w-4" /> เพิ่มนักเรียน
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-center">เลขที่</th>
                    <th className="px-4 py-3">รหัสนักเรียน</th>
                    <th className="px-4 py-3">ชื่อ-นามสกุล</th>
                    <th className="px-4 py-3 text-center">เพศ</th>
                    <th className="px-4 py-3 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-500">ไม่พบข้อมูลนักเรียนในระดับชั้นนี้</td>
                    </tr>
                  ) : (
                    filteredStudents.map(student => (
                      <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 text-center font-medium">{student.number}</td>
                        <td className="px-4 py-3 font-mono text-slate-500">{student.studentId}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {student.firstName} {student.lastName} {student.nickname && `(${student.nickname})`}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {student.gender === 'male' ? 'ชาย' : 'หญิง'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">ปกติ</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'assessments' && (
          <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-800">ประเมินพัฒนาการนักเรียน</h3>
                <p className="text-sm text-slate-500">บันทึกคุณลักษณะฯ สมรรถนะ และการอ่านเขียน</p>
              </div>
              <button 
                onClick={printBatchReport}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
              >
                <Printer className="h-4 w-4" /> ออกรายงานรวมทั้งชั้นเรียน (PDF)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map(student => {
                const hasAssessed = !!assessments[student.id];
                return (
                  <div key={student.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-xs font-bold text-pink-500 mb-1">เลขที่ {student.number}</div>
                        <div className="font-bold text-slate-800">{student.firstName} {student.lastName}</div>
                      </div>
                      {hasAssessed ? (
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-slate-200"></div>
                      )}
                    </div>
                    
                    <div className="mt-auto pt-4 flex gap-2">
                      <button 
                        onClick={() => setEvaluatingStudent(student)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold text-center transition-colors ${
                          hasAssessed ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                        }`}
                      >
                        {hasAssessed ? 'แก้ไขประเมิน' : 'เริ่มประเมิน'}
                      </button>
                      
                      <button 
                        onClick={() => printSingleReport(student)}
                        disabled={!hasAssessed}
                        className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${
                          hasAssessed ? 'bg-sky-100 text-sky-700 hover:bg-sky-200' : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                        }`}
                        title="พิมพ์รายงานรายบุคคล"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredStudents.length === 0 && (
                 <div className="col-span-full text-center py-8 text-slate-500">ไม่พบข้อมูลนักเรียนในระดับชั้นนี้</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Assessment Modal/Form Overlay */}
      {evaluatingStudent && (
        <AssessmentModal 
          student={evaluatingStudent} 
          existingAssessment={assessments[evaluatingStudent.id] || getInitialAssessment(evaluatingStudent.id)}
          onClose={() => setEvaluatingStudent(null)}
          onSave={handleSaveAssessment}
        />
      )}

      {/* Import Modal */}
      {showImport && (
        <ImportStudentData 
          selectedGrade={selectedGrade}
          onClose={() => setShowImport(false)}
          onSuccess={() => {
            setShowImport(false);
            // We don't need to manually refresh as onSnapshot will handle it
          }}
        />
      )}
      </div>

      {/* Print Overlay */}
      {printStudents && (
        <AssessmentPrintTemplate
          students={printStudents}
          assessments={assessments}
          teacher={currentTeacher!}
          academicYear="2567"
          semester="1"
          onClose={() => setPrintStudents(null)}
        />
      )}

    </div>
  );
};

// --- Subcomponent: Assessment Modal ---
interface AssessmentModalProps {
  student: Student;
  existingAssessment: StudentAssessment;
  onClose: () => void;
  onSave: (assessment: StudentAssessment) => void;
}

const AssessmentModal: React.FC<AssessmentModalProps> = ({ student, existingAssessment, onClose, onSave }) => {
  const [formData, setFormData] = useState<StudentAssessment>(existingAssessment);

  const handleTraitChange = (key: keyof StudentAssessment['characterTraits'], value: number) => {
    setFormData(prev => ({
      ...prev,
      characterTraits: { ...prev.characterTraits, [key]: value }
    }));
  };

  const handleCompChange = (key: keyof StudentAssessment['competencies'], value: number) => {
    setFormData(prev => ({
      ...prev,
      competencies: { ...prev.competencies, [key]: value }
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-4 print:hidden">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-black text-slate-800 text-lg">แบบประเมินพัฒนาการ</h3>
            <p className="text-sm text-slate-500">นักเรียน: {student.firstName} {student.lastName} (เลขที่ {student.number})</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-8">
          
          {/* Section 1: Character Traits */}
          <section>
            <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">1. คุณลักษณะอันพึงประสงค์ 8 ประการ</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {[
                { k: 'trait1', l: '1. รักชาติ ศาสน์ กษัตริย์' },
                { k: 'trait2', l: '2. ซื่อสัตย์สุจริต' },
                { k: 'trait3', l: '3. มีวินัย' },
                { k: 'trait4', l: '4. ใฝ่เรียนรู้' },
                { k: 'trait5', l: '5. อยู่อย่างพอเพียง' },
                { k: 'trait6', l: '6. มุ่งมั่นในการทำงาน' },
                { k: 'trait7', l: '7. รักความเป็นไทย' },
                { k: 'trait8', l: '8. มีจิตสาธารณะ' },
              ].map((item) => (
                <div key={item.k} className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">{item.l}</span>
                  <select 
                    value={formData.characterTraits[item.k as keyof typeof formData.characterTraits]}
                    onChange={(e) => handleTraitChange(item.k as any, Number(e.target.value))}
                    className="border border-slate-200 rounded p-1 text-sm bg-slate-50"
                  >
                    <option value={0}>0 - ไม่ผ่าน</option>
                    <option value={1}>1 - ผ่าน</option>
                    <option value={2}>2 - ดี</option>
                    <option value={3}>3 - ดีเยี่ยม</option>
                  </select>
                </div>
              ))}
            </div>
          </section>

          {/* Section 2: Competencies */}
          <section>
            <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">2. สมรรถนะสำคัญของผู้เรียน 5 ประการ</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {[
                { k: 'comp1', l: '1. ความสามารถในการสื่อสาร' },
                { k: 'comp2', l: '2. ความสามารถในการคิด' },
                { k: 'comp3', l: '3. ความสามารถในการแก้ปัญหา' },
                { k: 'comp4', l: '4. ความสามารถในการใช้ทักษะชีวิต' },
                { k: 'comp5', l: '5. ความสามารถในการใช้เทคโนโลยี' },
              ].map((item) => (
                <div key={item.k} className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">{item.l}</span>
                  <select 
                    value={formData.competencies[item.k as keyof typeof formData.competencies]}
                    onChange={(e) => handleCompChange(item.k as any, Number(e.target.value))}
                    className="border border-slate-200 rounded p-1 text-sm bg-slate-50"
                  >
                    <option value={0}>0 - ไม่ผ่าน</option>
                    <option value={1}>1 - ผ่าน</option>
                    <option value={2}>2 - ดี</option>
                    <option value={3}>3 - ดีเยี่ยม</option>
                  </select>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Reading/Writing */}
          <section>
            <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">3. การประเมินการอ่าน คิดวิเคราะห์ และเขียน</h4>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">ผลการประเมิน:</span>
              <select 
                value={formData.readingWriting}
                onChange={(e) => setFormData(prev => ({...prev, readingWriting: Number(e.target.value)}))}
                className="border border-slate-200 rounded p-1.5 text-sm bg-slate-50 w-40"
              >
                <option value={0}>0 - ไม่ผ่าน</option>
                <option value={1}>1 - ผ่าน</option>
                <option value={2}>2 - ดี</option>
                <option value={3}>3 - ดีเยี่ยม</option>
              </select>
            </div>
          </section>

          {/* Section 4: Comments */}
          <section>
            <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">4. ความคิดเห็นเพิ่มเติม (ข้อเสนอแนะ)</h4>
            <textarea 
              value={formData.comments}
              onChange={(e) => setFormData(prev => ({...prev, comments: e.target.value}))}
              className="w-full border border-slate-200 rounded-lg p-3 text-sm min-h-[100px] outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
              placeholder="ระบุข้อเสนอแนะเพื่อการพัฒนาผู้เรียน..."
            />
          </section>

          {/* Section 5: Narrative Log */}
          <section>
            <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">5. บันทึกพัฒนาการรายบุคคล (เพิ่มเติม)</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">รายวิชา/กิจกรรมที่ประเมิน</label>
                  <input 
                    type="text" 
                    value={formData.subject || ''}
                    onChange={(e) => setFormData(prev => ({...prev, subject: e.target.value}))}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-pink-500"
                    placeholder="เช่น ภาษาไทย, กิจกรรมโฮมรูม"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">วันที่ประเมิน</label>
                  <input 
                    type="date" 
                    value={formData.date || ''}
                    onChange={(e) => setFormData(prev => ({...prev, date: e.target.value}))}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">พฤติกรรม/พัฒนาการที่พบ</label>
                <textarea 
                  value={formData.content || ''}
                  onChange={(e) => setFormData(prev => ({...prev, content: e.target.value}))}
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm min-h-[80px] outline-none focus:border-pink-500"
                  placeholder="ระบุพฤติกรรมหรือพัฒนาการที่สังเกตพบ..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">วิธีการส่งเสริม/แก้ไขปัญหา</label>
                <textarea 
                  value={formData.activities || ''}
                  onChange={(e) => setFormData(prev => ({...prev, activities: e.target.value}))}
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm min-h-[80px] outline-none focus:border-pink-500"
                  placeholder="ระบุวิธีการหรือกิจกรรมที่ใช้..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">ปัญหาอุปสรรค</label>
                <textarea 
                  value={formData.limitations || ''}
                  onChange={(e) => setFormData(prev => ({...prev, limitations: e.target.value}))}
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm min-h-[60px] outline-none focus:border-pink-500"
                  placeholder="ระบุปัญหาหรืออุปสรรค..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">ผลการพัฒนา/ข้อเสนอแนะ</label>
                <textarea 
                  value={formData.suggestions || ''}
                  onChange={(e) => setFormData(prev => ({...prev, suggestions: e.target.value}))}
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm min-h-[60px] outline-none focus:border-pink-500"
                  placeholder="ระบุผลที่ได้หรือข้อเสนอแนะเพิ่มเติม..."
                />
              </div>
            </div>
          </section>

        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">
            ยกเลิก
          </button>
          <button 
            onClick={() => onSave(formData)}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <CheckCircle className="h-4 w-4" /> บันทึกผลประเมิน
          </button>
        </div>
      </div>
    </div>
  );
};
