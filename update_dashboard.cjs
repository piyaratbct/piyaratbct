const fs = require('fs');
const file = 'src/components/SARMonitoringDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add studentAssessments state
content = content.replace(
  "const [kgAssessments, setKgAssessments] = useState<KindergartenAssessment[]>([]);",
  "const [kgAssessments, setKgAssessments] = useState<KindergartenAssessment[]>([]);\n  const [studentAssessments, setStudentAssessments] = useState<any[]>([]);"
);

// 2. Fetch studentAssessments
content = content.replace(
  "      const kgUnsub = onSnapshot(query(collection(db, 'kindergartenAssessments')), (snap) => {",
  `      const saUnsub = onSnapshot(query(collection(db, 'studentAssessments')), (snap) => {
        setStudentAssessments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (err) => console.error("Error loading Student Assessments:", err));

      const kgUnsub = onSnapshot(query(collection(db, 'kindergartenAssessments')), (snap) => {`
);
content = content.replace("        kgUnsub();\n      };\n    };\n\n    fetchData();", "        kgUnsub();\n        saUnsub();\n      };\n    };\n\n    fetchData();");

// 3. Remove basicEduStd1Eval fetch and state
content = content.replace(/  const \[basicEduStd1Eval.*?\n/, "");
content = content.replace(/  const \[isEditingStd1.*?\n/, "");
content = content.replace(/  const \[std1FormData.*?\}\);\n/s, "");
content = content.replace(/  \/\/ --- FILTERING LOGIC ---\n\n  useEffect\(\(\) => \{\n    if \(\!systemAcademicYear\).*?  \};\n/s, "  // --- FILTERING LOGIC ---");

// 4. Compute basicEduStd1Eval dynamically
const computationCode = `  const fStudentAssessments = React.useMemo(() => {
    return studentAssessments.filter(a => validStudentIds.has(a.studentId) && a.academicYear === systemAcademicYear);
  }, [studentAssessments, validStudentIds, systemAcademicYear]);

  // Compute Standard 1 for Basic Education dynamically
  const computedStd1Eval = React.useMemo(() => {
    const defaultVal = { c1_1_1: 0, c1_1_2: 0, c1_1_3: 0, c1_1_4: 0, c1_1_5: 0, c1_1_6: 0, c1_2_1: 0, c1_2_2: 0, c1_2_3: 0, c1_2_4: 0 };
    if (!fStudents.length) return defaultVal;
    
    // Total students for percentage calculation
    const total = fStudents.length;
    const calcPerc = (count: number) => Math.round((count / total) * 100);

    // 1.1.1 อ่าน เขียน สื่อสาร: readingWriting >= 2 & comp1 >= 2
    const c1_1_1 = fStudentAssessments.filter(a => a.readingWriting >= 2 && a.competencies?.comp1 >= 2).length;
    // 1.1.2 คิดวิเคราะห์ วิจารณญาณ: comp2 >= 2 & comp3 >= 2
    const c1_1_2 = fStudentAssessments.filter(a => a.competencies?.comp2 >= 2 && a.competencies?.comp3 >= 2).length;
    // 1.1.3 นวัตกรรม: Lesson records having 'innovation-creation' tag
    let innovationPercentage = 0;
    if (fLessonRecords.length > 0) {
      const innovationLessons = fLessonRecords.filter(r => (r.sarTags || []).includes('innovation-creation')).length;
      innovationPercentage = Math.round((innovationLessons / fLessonRecords.length) * 100);
    }
    // 1.1.4 ใช้เทคโนโลยี: comp5 >= 2
    const c1_1_4 = fStudentAssessments.filter(a => a.competencies?.comp5 >= 2).length;
    // 1.1.5 ผลสัมฤทธิ์: grade >= 3 or score >= 75
    // Map latest grade for each student
    const studentGrades = new Map<string, boolean>();
    fSubjectScores.forEach(s => {
      const isGood = s.score >= 75 || s.grade === '3' || s.grade === '3.5' || s.grade === '4';
      if (!studentGrades.has(s.studentId) || isGood) studentGrades.set(s.studentId, isGood); // Take true if any is good, or we can average. Let's just say if they have good grades. 
    });
    // better logic: count students whose average score across subjects is good.
    const studentAvgScore = new Map<string, {total: number, count: number}>();
    fSubjectScores.forEach(s => {
      if (!studentAvgScore.has(s.studentId)) studentAvgScore.set(s.studentId, {total: 0, count: 0});
      const data = studentAvgScore.get(s.studentId)!;
      data.total += s.score || 0;
      data.count += 1;
    });
    let c1_1_5 = 0;
    studentAvgScore.forEach(data => {
      if (data.total / data.count >= 75) c1_1_5++;
    });

    // 1.1.6 งานอาชีพ: comp4 >= 2
    const c1_1_6 = fStudentAssessments.filter(a => a.competencies?.comp4 >= 2).length;

    // 1.2.1 ค่านิยมที่ดี: Average traits >= 2. We'll check trait1..8 >= 2 as a whole or sum >= 16
    const c1_2_1 = fStudentAssessments.filter(a => {
       const t = a.characterTraits || {};
       return ((t.trait1||0) + (t.trait2||0) + (t.trait3||0) + (t.trait4||0) + (t.trait5||0) + (t.trait6||0) + (t.trait7||0) + (t.trait8||0)) >= 16;
    }).length;
    // 1.2.2 ภูมิใจในท้องถิ่น: trait7 >= 2
    const c1_2_2 = fStudentAssessments.filter(a => a.characterTraits?.trait7 >= 2).length;
    // 1.2.3 การอยู่ร่วมกัน: trait8 >= 2 and NO fighting/bullying discipline incidents
    const badDisciplineIds = new Set(fDisciplineIncidents.filter(d => ['ทะเลาะวิวาท', 'กลั่นแกล้ง', 'บูลลี่'].some(t => d.type?.includes(t) || d.description?.includes(t))).map(d => d.studentId));
    const c1_2_3 = fStudentAssessments.filter(a => a.characterTraits?.trait8 >= 2 && !badDisciplineIds.has(a.studentId)).length;
    // 1.2.4 สุขภาวะ: has weight & height
    const c1_2_4 = fStudentAssessments.filter(a => a.weight > 0 && a.height > 0).length;

    return {
      c1_1_1: calcPerc(c1_1_1),
      c1_1_2: calcPerc(c1_1_2),
      c1_1_3: innovationPercentage,
      c1_1_4: calcPerc(c1_1_4),
      c1_1_5: calcPerc(c1_1_5),
      c1_1_6: calcPerc(c1_1_6),
      c1_2_1: calcPerc(c1_2_1),
      c1_2_2: calcPerc(c1_2_2),
      c1_2_3: calcPerc(c1_2_3),
      c1_2_4: calcPerc(c1_2_4)
    };
  }, [fStudentAssessments, fStudents.length, fLessonRecords, fSubjectScores, fDisciplineIncidents]);`;

content = content.replace("  const fLessonPlans = React.useMemo(() => {\n    if (educationLevelFilter === 'kindergarten') return lessonPlans.filter(p => p.gradeLevel && p.gradeLevel.includes('อนุบาล'));\n    if (educationLevelFilter === 'primary') return lessonPlans.filter(p => p.gradeLevel && !p.gradeLevel.includes('อนุบาล'));\n    return lessonPlans;\n  }, [lessonPlans, educationLevelFilter]);\n\n  // --- CALCULATION LOGIC ---", "  const fLessonPlans = React.useMemo(() => {\n    if (educationLevelFilter === 'kindergarten') return lessonPlans.filter(p => p.gradeLevel && p.gradeLevel.includes('อนุบาล'));\n    if (educationLevelFilter === 'primary') return lessonPlans.filter(p => p.gradeLevel && !p.gradeLevel.includes('อนุบาล'));\n    return lessonPlans;\n  }, [lessonPlans, educationLevelFilter]);\n\n" + computationCode + "\n\n  // --- CALCULATION LOGIC ---");

// 5. Replace view logic
const viewStart = content.indexOf('<div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4 flex justify-between items-center">');
const viewEnd = content.indexOf('</>', viewStart) + 3;

if (viewStart !== -1 && viewEnd !== -1) {
  const replacementView = `<div className="bg-gradient-to-r from-sky-500 to-indigo-500 rounded-xl shadow-sm border-0 p-6 mb-4 text-white">
                <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                  <div className="bg-white/20 p-1.5 rounded-lg">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  การประเมินคุณภาพผู้เรียน (คำนวณอัตโนมัติ)
                </h3>
                <p className="text-sky-100 text-sm">ข้อมูลถูกประมวลผลอัตโนมัติแบบ Real-time จากระบบฐานข้อมูล (เกรด, ประเมินพัฒนาการ, สมรรถนะ, บันทึกวินัย, และบันทึกหลังสอน)</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6 p-6 animate-in fade-in">
                  <div className="mb-6">
                    <h4 className="font-bold text-slate-800 mb-4 text-lg border-b pb-2">1.1 ผลสัมฤทธิ์ทางวิชาการของผู้เรียน</h4>
                    <div className="divide-y divide-slate-100 border rounded-xl overflow-hidden">
                      {[
                        { id: 'c1_1_1', title: '1.มีความสามารถในการอ่าน การเขียน การสื่อสาร และการคิดคำนวณ' },
                        { id: 'c1_1_2', title: '2.มีความสามารถในการคิดวิเคราะห์ คิดอย่างมีวิจารณญาณ อภิปรายแลกเปลี่ยนความคิดเห็น และแก้ปัญหา' },
                        { id: 'c1_1_3', title: '3.มีความสามารถในการสร้างนวัตกรรม' },
                        { id: 'c1_1_4', title: '4.มีความสามารถในการใช้เทคโนโลยีสารสนเทศและการสื่อสาร' },
                        { id: 'c1_1_5', title: '5.มีผลสัมฤทธิ์ทางการเรียนตามหลักสูตรสถานศึกษา' },
                        { id: 'c1_1_6', title: '6.มีความรู้ ทักษะพื้นฐาน และเจตคติที่ดีต่องานอาชีพ' }
                      ].map(c => (
                        <div key={c.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-700">{c.title}</p>
                          </div>
                          <div className="shrink-0 flex items-center gap-3 min-w-[200px]">
                            <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-sky-500 h-full rounded-full transition-all duration-1000" style={{ width: \`\${computedStd1Eval?.[c.id as keyof typeof computedStd1Eval] || 0}%\` }}></div>
                            </div>
                            <span className="text-sm font-bold text-slate-700 w-12 text-right">{computedStd1Eval?.[c.id as keyof typeof computedStd1Eval] || 0}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                    <div className="p-4 bg-emerald-50 border-b border-slate-200">
                       <h4 className="font-bold text-slate-800 text-base">1.2 คุณลักษณะที่พึงประสงค์ของผู้เรียน</h4>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {[
                        { id: 'c1_2_1', title: '1.การมีคุณลักษณะและค่านิยมที่ดีตามที่สถานศึกษากำหนด' },
                        { id: 'c1_2_2', title: '2.ความภูมิใจในท้องถิ่นและความเป็นไทย' },
                        { id: 'c1_2_3', title: '3.การยอมรับที่จะอยู่ร่วมกันบนความแตกต่างและหลากหลาย' },
                        { id: 'c1_2_4', title: '4.สุขภาวะทางร่างกาย และจิตสังคม' }
                      ].map(c => (
                        <div key={c.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-700">{c.title}</p>
                          </div>
                          <div className="shrink-0 flex items-center gap-3 min-w-[200px]">
                            <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: \`\${computedStd1Eval?.[c.id as keyof typeof computedStd1Eval] || 0}%\` }}></div>
                            </div>
                            <span className="text-sm font-bold text-slate-700 w-12 text-right">{computedStd1Eval?.[c.id as keyof typeof computedStd1Eval] || 0}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>`;

  content = content.substring(0, viewStart) + replacementView + content.substring(viewEnd);
  // Also we need to make sure basicEduStd1Eval references are gone from the file, wait I replaced it with computedStd1Eval
}
fs.writeFileSync(file, content, 'utf8');
