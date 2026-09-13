const fs = require('fs');
let content = fs.readFileSync('src/components/SubjectChildManager.tsx', 'utf8');

// 1. Add Student type import
content = content.replace("import { CurriculumSubject, GRADE_LEVELS } from '../types';", "import { CurriculumSubject, GRADE_LEVELS, Student } from '../types';");

// 2. Add icons for Aggregation
if (!content.includes('Calculator')) {
  content = content.replace("CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';", "CheckCircle2, AlertCircle, BookOpen, Calculator, RefreshCw, Save } from 'lucide-react';");
}

// 3. Update Props interface
const propsRegex = /interface SubjectChildManagerProps \{[\s\S]*?\}/;
content = content.replace(propsRegex, `interface SubjectChildManagerProps {
  parentSubject: CurriculumSubject;
  onUpdate: () => void;
  canEdit: boolean;
  students?: Student[];
  systemSemester?: string;
  systemAcademicYear?: string;
}`);

// 4. Update component signature
const fcRegex = /export const SubjectChildManager: React\.FC<SubjectChildManagerProps> = \(\{ parentSubject, onUpdate, canEdit \}\) => \{/;
content = content.replace(fcRegex, `export const SubjectChildManager: React.FC<SubjectChildManagerProps> = ({ parentSubject, onUpdate, canEdit, students: allStudents = [], systemSemester = '1', systemAcademicYear = '2567' }) => {`);

// 5. Inject state variables and logic for aggregation
const insertionPoint = "  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);";
const newLogic = `  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // --- Aggregation State ---
  const [activeTab, setActiveTab] = useState<'structure' | 'aggregation'>('structure');
  const [childScores, setChildScores] = useState<Record<string, Record<string, number>>>({}); // childId -> studentId -> score
  const [isFetchingScores, setIsFetchingScores] = useState(false);
  const [toastMessage, setToastMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  const students = React.useMemo(() => 
    allStudents.filter(s => s.gradeLevel === parentSubject.gradeLevel && (s.status === 'active' || !s.status))
      .sort((a, b) => Number(a.number) - Number(b.number)),
  [allStudents, parentSubject.gradeLevel]);

  const fetchScores = async () => {
    setIsFetchingScores(true);
    try {
      const scoresData: Record<string, Record<string, number>> = {};
      const safeGrade = (parentSubject.gradeLevel || '').replace(/[\\/]/g, '_');
      
      for (const child of children) {
        const safeSubject = child.subjectName.replace(/[\\/]/g, '_');
        
        // Try fetching from gradebooks (auto-gradebook)
        const gbDocId = \`\${systemAcademicYear}_\${systemSemester}_\${safeSubject}_\${safeGrade}\`;
        const gbSnap = await getDocs(query(collection(db, 'gradebooks'), where('__name__', '==', gbDocId)));
        
        let hasScores = false;
        if (!gbSnap.empty) {
          const gbData = gbSnap.docs[0].data();
          if (gbData.scores) {
             scoresData[child.id] = {};
             Object.keys(gbData.scores).forEach(studentId => {
                let total = 0;
                Object.values(gbData.scores[studentId] as Record<string, number>).forEach(v => total += v);
                scoresData[child.id][studentId] = total;
             });
             hasScores = true;
          }
        }
        
        // Fallback to subject_scores (manual gradebook)
        if (!hasScores) {
           const ssQuery = query(
              collection(db, 'subject_scores'), 
              where('subject', '==', child.subjectName),
              where('gradeLevel', '==', parentSubject.gradeLevel),
              where('academicYear', '==', systemAcademicYear),
              where('semester', '==', systemSemester)
           );
           const ssSnap = await getDocs(ssQuery);
           if (!ssSnap.empty) {
              scoresData[child.id] = {};
              ssSnap.docs.forEach(doc => {
                 const data = doc.data();
                 scoresData[child.id][data.studentId] = data.totalScore || 0;
              });
           }
        }
      }
      setChildScores(scoresData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingScores(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'aggregation' && children.length > 0) {
      fetchScores();
    }
  }, [activeTab, children, systemAcademicYear, systemSemester, parentSubject.gradeLevel]);

  const calculateGrade = (total: number): string => {
    if (total >= 80) return "4";
    if (total >= 75) return "3.5";
    if (total >= 70) return "3";
    if (total >= 65) return "2.5";
    if (total >= 60) return "2";
    if (total >= 55) return "1.5";
    if (total >= 50) return "1";
    return "0";
  };

  const handleSaveAggregation = async () => {
    setIsSaving(true);
    try {
      const promises = students.map(student => {
        let finalTotal = 0;
        
        children.forEach(child => {
           const weight = child.weightPercentage || 0;
           const rawScore = childScores[child.id]?.[student.id] || 0;
           const weightedScore = (rawScore * weight) / 100;
           finalTotal += weightedScore;
        });
        
        finalTotal = Math.round(finalTotal);
        const key = \`\${student.id}_\${systemAcademicYear}_\${systemSemester}_\${parentSubject.subjectName}\`;
        const ref = doc(db, 'subject_scores', key);
        
        return setDoc(ref, {
          studentId: student.id,
          academicYear: systemAcademicYear,
          semester: systemSemester,
          subject: parentSubject.subjectName,
          gradeLevel: parentSubject.gradeLevel,
          totalScore: finalTotal,
          grade: calculateGrade(finalTotal),
          isAggregated: true,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      });
      
      await Promise.all(promises);
      
      setToastMessage({ type: 'success', text: 'บันทึกการประมวลผลวิชาหลักเรียบร้อยแล้ว' });
      setTimeout(() => setToastMessage(null), 3000);
    } catch (e) {
      console.error(e);
      setToastMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการบันทึก' });
    } finally {
      setIsSaving(false);
    }
  };
`;
content = content.replace(insertionPoint, newLogic);

// 6. Inject UI Tabs
const headerRegex = /<div className="flex justify-between items-center mb-6">\s*<h3 className="text-xl font-black text-slate-800">จัดการวิชาย่อย \(Parent-Child\)<\/h3>/;
const newHeaderAndTabs = `<div className="flex flex-col mb-6 gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-800">การจัดการวิชาย่อย (Parent-Child)</h3>
        </div>
        
        {/* Tabs for Structure / Aggregation */}
        <div className="flex border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('structure')}
            className={\`px-4 py-2 font-bold text-sm border-b-2 transition-colors \${activeTab === 'structure' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
          >
            <Layers className="h-4 w-4 inline-block mr-2" /> โครงสร้างและสัดส่วน
          </button>
          <button 
            onClick={() => setActiveTab('aggregation')}
            className={\`px-4 py-2 font-bold text-sm border-b-2 transition-colors \${activeTab === 'aggregation' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
          >
            <Calculator className="h-4 w-4 inline-block mr-2" /> ประมวลผลคะแนนรวม
          </button>
        </div>
      </div>
      
      {activeTab === 'structure' && (
        <>`;

content = content.replace(headerRegex, newHeaderAndTabs);
if (!content.includes('import { Layers } from')) {
    content = content.replace("BookOpen, Calculator, RefreshCw, Save } from 'lucide-react';", "BookOpen, Calculator, RefreshCw, Save, Layers } from 'lucide-react';");
}


// 7. Close the fragment for structure and add the aggregation UI
const endOfStructureSearchStr = `{showForm && (`
const endOfStructureReplacement = `</>
      )}
      
      {activeTab === 'aggregation' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold border border-indigo-100">
                ปีการศึกษา {systemAcademicYear}
              </span>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold border border-indigo-100">
                เทอม {systemSemester}
              </span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold border border-emerald-100">
                {parentSubject.gradeLevel}
              </span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={fetchScores}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors"
              >
                <RefreshCw className="h-3 w-3" /> ดึงข้อมูลใหม่
              </button>
              <button 
                onClick={handleSaveAggregation}
                disabled={isSaving || children.length === 0}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-bold text-sm shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} 
                บันทึกผลการเรียนวิชาหลัก
              </button>
            </div>
          </div>
          
          {toastMessage && (
            <div className={\`p-4 rounded-xl flex items-center gap-3 \${toastMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}\`}>
              {toastMessage.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              <p className="font-bold">{toastMessage.text}</p>
            </div>
          )}
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <span className="font-bold text-slate-700">สัดส่วนคะแนนย่อย:</span>
              {children.length > 0 ? children.map(c => (
                <span key={c.id} className="px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-600 shadow-sm">
                  {c.subjectName} ({c.weightPercentage || 0}%)
                </span>
              )) : <span className="text-sm text-rose-500 font-medium">ยังไม่มีการตั้งค่าวีชาย่อยในโครงสร้าง</span>}
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-center w-16 sticky left-0 bg-slate-50 z-10 border-r border-slate-200">เลขที่</th>
                    <th className="px-4 py-3 w-48 sticky left-16 bg-slate-50 z-10 border-r border-slate-200">ชื่อ-นามสกุล</th>
                    {children.map(child => (
                      <th key={child.id} className="px-4 py-3 text-center border-r border-slate-200 min-w-[120px]">
                        คะแนน {child.subjectName} <br/>
                        <span className="text-xs text-indigo-500 font-normal">(ปรับเป็น {child.weightPercentage || 0}%)</span>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center bg-indigo-50 text-indigo-700 border-r border-indigo-100 w-24">คะแนนรวม</th>
                    <th className="px-4 py-3 text-center bg-indigo-50 text-indigo-700 w-24">ผลการเรียน</th>
                  </tr>
                </thead>
                <tbody>
                  {isFetchingScores ? (
                    <tr>
                      <td colSpan={5 + children.length} className="px-4 py-8 text-center text-slate-500">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-500" />
                        กำลังดึงข้อมูลคะแนน...
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan={5 + children.length} className="px-4 py-8 text-center text-slate-500">ไม่มีข้อมูลนักเรียน</td>
                    </tr>
                  ) : (
                    students.map(student => {
                      let finalTotal = 0;
                      
                      return (
                        <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-2 text-center sticky left-0 bg-white border-r border-slate-200">{student.number}</td>
                          <td className="px-4 py-2 whitespace-nowrap sticky left-16 bg-white border-r border-slate-200">{student.firstName} {student.lastName}</td>
                          
                          {children.map(child => {
                            const weight = child.weightPercentage || 0;
                            const rawScore = childScores[child.id]?.[student.id];
                            const hasScore = rawScore !== undefined;
                            const weightedScore = hasScore ? (rawScore * weight) / 100 : 0;
                            finalTotal += weightedScore;
                            
                            return (
                              <td key={child.id} className="px-4 py-2 text-center border-r border-slate-100">
                                {hasScore ? (
                                  <div className="flex flex-col">
                                    <span className="font-bold text-slate-700">{weightedScore.toFixed(1)}</span>
                                    <span className="text-[10px] text-slate-400">ดิบ: {rawScore}</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </td>
                            );
                          })}
                          
                          <td className="px-4 py-2 text-center font-black text-indigo-600 bg-indigo-50/30 border-r border-indigo-100">
                            {Math.round(finalTotal)}
                          </td>
                          <td className="px-4 py-2 text-center font-black text-emerald-600 bg-indigo-50/30">
                            {calculateGrade(Math.round(finalTotal))}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showForm && (`

content = content.replace(endOfStructureSearchStr, endOfStructureReplacement);

fs.writeFileSync('src/components/SubjectChildManager.tsx', content);
console.log("Patched SubjectChildManager with Aggregation Tab");
