const fs = require('fs');

const content = `import React, { useState, useEffect } from 'react';
import { Teacher, Student, LessonPlan } from '../types';
import { collection, query, where, getDocs, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { X, Users, BookOpen, Calculator, Calendar, ArrowLeft, Plus, CheckCircle2 } from 'lucide-react';
import { sortSubjects } from '../types';

interface ClassroomHubProps {
  subjectName: string;
  gradeLevel: string;
  currentTeacher: Teacher;
  systemSemester: string;
  systemAcademicYear: string;
  students: Student[];
  onClose: () => void;
}

export const ClassroomHub: React.FC<ClassroomHubProps> = ({
  subjectName,
  gradeLevel,
  currentTeacher,
  systemSemester,
  systemAcademicYear,
  students,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'plans' | 'gradebook'>('gradebook');
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Gradebook state
  const [gradebookData, setGradebookData] = useState<Record<string, Record<string, number>>>({});

  useEffect(() => {
    // 1. Filter students
    const filtered = students.filter(s => s.gradeLevel === gradeLevel).sort((a, b) => a.studentId.localeCompare(b.studentId));
    setClassStudents(filtered);

    // 2. Fetch lesson plans for this subject & grade
    const fetchPlans = async () => {
      try {
        const q = query(
          collection(db, 'lessonPlans'),
          where('teacherId', '==', currentTeacher.id),
          where('subject', '==', subjectName),
          where('gradeLevel', '==', gradeLevel)
        );
        const snapshot = await getDocs(q);
        const fetched: LessonPlan[] = [];
        snapshot.forEach(doc => {
          fetched.push({ id: doc.id, ...doc.data() } as LessonPlan);
        });
        
        const filteredPlans = fetched.filter(p => !p.semester || p.semester === systemSemester);
        
        filteredPlans.sort((a, b) => {
           if (a.date && b.date) return a.date.localeCompare(b.date);
           return a.title.localeCompare(b.title);
        });
        
        setLessonPlans(filteredPlans);
        
        // Fetch gradebook scores
        const safeSubject = subjectName.replace(/\\//g, '_');
        const safeGrade = gradeLevel.replace(/\\//g, '_');
        const gbDocId = \`\${systemAcademicYear}_\${systemSemester}_\${safeSubject}_\${safeGrade}\`;
        
        const gbRef = doc(db, 'gradebooks', gbDocId);
        onSnapshot(gbRef, (docSnap) => {
           if (docSnap.exists() && docSnap.data().scores) {
              setGradebookData(docSnap.data().scores);
           } else {
              setGradebookData({});
           }
           setLoading(false);
        });
        
      } catch (err) {
        console.error("Error fetching data for hub", err);
        setLoading(false);
      }
    };
    
    fetchPlans();
  }, [subjectName, gradeLevel, currentTeacher.id, systemSemester, systemAcademicYear, students]);

  const allEvaluations = lessonPlans.flatMap(plan => 
    (plan.structuredEvaluations || []).map(evalItem => ({
      ...evalItem,
      planTitle: plan.title,
      planId: plan.id
    }))
  );

  const handleScoreChange = async (studentId: string, evalId: string, val: string, maxScore: number) => {
    let numVal = parseFloat(val);
    if (isNaN(numVal)) numVal = 0;
    if (numVal > maxScore) numVal = maxScore;
    if (numVal < 0) numVal = 0;

    const newData = { ...gradebookData };
    if (!newData[studentId]) newData[studentId] = {};
    newData[studentId][evalId] = numVal;
    
    if (val === '') {
       delete newData[studentId][evalId];
    }

    setGradebookData(newData);
    
    try {
      const safeSubject = subjectName.replace(/\\//g, '_');
      const safeGrade = gradeLevel.replace(/\\//g, '_');
      const gbDocId = \`\${systemAcademicYear}_\${systemSemester}_\${safeSubject}_\${safeGrade}\`;
      const gbRef = doc(db, 'gradebooks', gbDocId);
      
      await setDoc(gbRef, {
        subject: subjectName,
        gradeLevel: gradeLevel,
        academicYear: systemAcademicYear,
        semester: systemSemester,
        teacherId: currentTeacher.id,
        scores: newData,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.error("Error saving score", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 leading-tight">
                {subjectName} <span className="text-indigo-600 ml-1">{gradeLevel}</span>
              </h1>
              <p className="text-xs text-slate-500">ภาคเรียนที่ {systemSemester}/{systemAcademicYear} • นักเรียน {classStudents.length} คน</p>
            </div>
          </div>
        </div>
        
        <div className="hidden md:flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('attendance')}
            className={\`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors \${activeTab === 'attendance' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}\`}
          >
            <Calendar className="h-4 w-4" /> บันทึกการสอน
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={\`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors \${activeTab === 'plans' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}\`}
          >
            <BookOpen className="h-4 w-4" /> แผนการสอน
          </button>
          <button
            onClick={() => setActiveTab('gradebook')}
            className={\`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors \${activeTab === 'gradebook' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}\`}
          >
            <Calculator className="h-4 w-4" /> สมุดบันทึกคะแนน
          </button>
        </div>
        
        <button onClick={onClose} className="md:hidden p-2 text-slate-400 hover:text-slate-600">
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="md:hidden bg-white border-b border-slate-200 p-2 flex gap-1 shrink-0">
        <button
          onClick={() => setActiveTab('attendance')}
          className={\`flex-1 py-2 rounded-lg text-xs font-bold flex justify-center items-center gap-1.5 transition-colors \${activeTab === 'attendance' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}\`}
        >
          <Calendar className="h-3.5 w-3.5" /> บันทึกสอน
        </button>
        <button
          onClick={() => setActiveTab('plans')}
          className={\`flex-1 py-2 rounded-lg text-xs font-bold flex justify-center items-center gap-1.5 transition-colors \${activeTab === 'plans' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}\`}
        >
          <BookOpen className="h-3.5 w-3.5" /> แผนฯ
        </button>
        <button
          onClick={() => setActiveTab('gradebook')}
          className={\`flex-1 py-2 rounded-lg text-xs font-bold flex justify-center items-center gap-1.5 transition-colors \${activeTab === 'gradebook' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}\`}
        >
          <Calculator className="h-3.5 w-3.5" /> คะแนน
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6">
        {loading ? (
           <div className="flex justify-center items-center h-full">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
           </div>
        ) : (
          <>
            {activeTab === 'gradebook' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full max-h-full">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
                   <div>
                     <h2 className="text-lg font-black text-slate-800">สมุดบันทึกคะแนน (Auto-Gradebook)</h2>
                     <p className="text-sm text-slate-500">คอลัมน์คะแนนถูกสร้างอัตโนมัติจาก "ภาระงาน/การประเมินผล" ในแผนการสอน</p>
                   </div>
                   <div className="flex gap-4 text-sm font-bold text-slate-600">
                     <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-400"></div> K (ความรู้)</div>
                     <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-400"></div> P (ทักษะ)</div>
                     <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-400"></div> A (คุณลักษณะ)</div>
                   </div>
                </div>
                
                {allEvaluations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                    <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                      <Calculator className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-2">ยังไม่มีคอลัมน์เก็บคะแนน</h3>
                    <p className="text-slate-500 max-w-md mx-auto text-sm">
                      ระบบจะสร้างคอลัมน์เก็บคะแนนให้อัตโนมัติ เมื่อคุณเขียน "แผนการสอน" และเพิ่มการประเมินผลในส่วนที่ 7 (ภาระงาน/ชิ้นงาน)
                    </p>
                    <button 
                      onClick={() => setActiveTab('plans')}
                      className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-sm hover:bg-indigo-700 transition-colors"
                    >
                      ไปเขียนแผนการสอน
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto overflow-y-auto flex-1">
                    <table className="w-full text-sm text-left border-collapse min-w-max">
                      <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                        <tr>
                          <th className="py-3 px-4 font-bold border-b border-r border-slate-200 w-12 text-center bg-slate-50 sticky left-0 z-20">เลขที่</th>
                          <th className="py-3 px-4 font-bold border-b border-r border-slate-200 w-48 bg-slate-50 sticky left-12 z-20">ชื่อ-นามสกุล</th>
                          {allEvaluations.map((ev, i) => (
                            <th key={i} className="py-2 px-3 border-b border-slate-200 min-w-[140px] max-w-[200px] align-top">
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{ev.planTitle}</span>
                                <span className="font-bold text-slate-800 leading-tight line-clamp-2" title={ev.name}>{ev.name}</span>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded truncate max-w-[80px]" title={(ev.indicators || []).join(', ') || ev.indicator}>
                                    {(ev.indicators || []).join(', ') || ev.indicator || 'ไม่มีตัวชี้วัด'}
                                  </span>
                                  <span className="text-xs font-black text-indigo-600">{ev.maxScore} คะแนน</span>
                                </div>
                                <div className="flex gap-1 mt-1">
                                  {(ev.kpa || []).map((k: string) => (
                                    <div key={k} className={\`w-2 h-2 rounded-full \${k==='K'?'bg-emerald-400':k==='P'?'bg-blue-400':'bg-amber-400'}\`} title={\`วัดด้าน \${k}\`}></div>
                                  ))}
                                </div>
                              </div>
                            </th>
                          ))}
                          <th className="py-3 px-4 font-bold border-b border-l border-slate-200 bg-indigo-50 text-indigo-800 text-center w-24 sticky right-0 z-20">
                            รวมคะแนน
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {classStudents.map((student, idx) => {
                          let total = 0;
                          allEvaluations.forEach(ev => {
                            const score = gradebookData[student.id]?.[ev.id] || 0;
                            total += score;
                          });
                          
                          return (
                            <tr key={student.id} className="hover:bg-slate-50/50 group">
                              <td className="py-2 px-4 text-center border-r border-slate-200 bg-white group-hover:bg-slate-50/50 sticky left-0 z-10 text-slate-500 font-medium">
                                {idx + 1}
                              </td>
                              <td className="py-2 px-4 font-semibold text-slate-800 border-r border-slate-200 bg-white group-hover:bg-slate-50/50 sticky left-12 z-10 truncate">
                                {student.title} {student.firstName} {student.lastName}
                              </td>
                              
                              {allEvaluations.map((ev, i) => {
                                const score = gradebookData[student.id]?.[ev.id];
                                return (
                                  <td key={i} className={\`py-2 px-3 text-center border-r border-slate-100 hover:bg-slate-100/50 transition-colors \${score !== undefined ? 'bg-indigo-50/30' : ''}\`}>
                                    <input
                                      type="number"
                                      min="0"
                                      max={ev.maxScore}
                                      value={score !== undefined ? score : ''}
                                      onChange={(e) => handleScoreChange(student.id, ev.id, e.target.value, ev.maxScore)}
                                      className={\`w-16 text-center text-sm font-bold p-1 rounded border focus:ring-2 focus:ring-indigo-500 outline-none transition-all
                                        \${score !== undefined ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-transparent border-transparent hover:border-slate-300 text-slate-700'}\`}
                                      placeholder="-"
                                    />
                                  </td>
                                );
                              })}
                              
                              <td className="py-2 px-4 text-center font-black text-indigo-700 bg-indigo-50/50 border-l border-slate-200 sticky right-0 z-10">
                                {total}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'plans' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-800">แผนการสอนของฉัน</h2>
                    <p className="text-sm text-slate-500">วิชา {subjectName} ห้อง {gradeLevel}</p>
                  </div>
                  <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm flex items-center gap-2 transition-colors">
                    <Plus className="h-4 w-4" /> สร้างแผนการสอน
                  </button>
                </div>
                
                {lessonPlans.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center flex flex-col items-center">
                    <BookOpen className="h-10 w-10 text-slate-300 mb-3" />
                    <h3 className="font-bold text-slate-600">ยังไม่มีแผนการสอนในวิชานี้</h3>
                    <p className="text-sm text-slate-500 mt-1">แผนการสอนที่คุณสร้างในระบบและระบุวิชา/ห้องตรงกัน จะมาแสดงที่นี่โดยอัตโนมัติ</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lessonPlans.map((plan, idx) => (
                      <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded">แผนที่ {idx + 1}</span>
                          <span className="text-[10px] text-slate-400">{plan.date}</span>
                        </div>
                        <h3 className="font-bold text-slate-800 leading-tight mb-2 line-clamp-2" title={plan.title}>{plan.title}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                           <Calculator className="h-3 w-3" />
                           {(plan.structuredEvaluations || []).length} ภาระงานประเมินผล
                        </div>
                        <div className="pt-3 border-t border-slate-100 flex justify-end">
                           <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800">ดูรายละเอียด</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'attendance' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
                 <div className="h-16 w-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                   <Calendar className="h-8 w-8" />
                 </div>
                 <h2 className="text-xl font-black text-slate-800 mb-2">บันทึกการสอนและเช็คชื่อ</h2>
                 <p className="text-slate-500 mb-6 max-w-md">ระบบจะเชื่อมโยงรายชื่อนักเรียน เพื่อให้คุณครูเช็คชื่อผู้เข้าเรียนในรายวิชา {subjectName} ห้อง {gradeLevel} ได้อย่างรวดเร็ว</p>
                 <button className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-colors">
                   + บันทึกการสอนคาบใหม่
                 </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
`
fs.writeFileSync('src/components/ClassroomHub.tsx', content);
