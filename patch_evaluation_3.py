import re

with open('src/components/EvaluationModule.tsx', 'r') as f:
    content = f.read()

# Update handleScoreChange
old_handler = """  const handleScoreChange = (studentId: string, field: 'assignmentScore' | 'midtermScore' | 'finalScore', value: string) => {
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
        assignmentScore: 0,
        midtermScore: 0,
        finalScore: 0,
        totalScore: 0,
        grade: "0",
        updatedAt: new Date().toISOString()
      };

      const updated = { ...existing, [field]: numValue };
      updated.totalScore = (updated.assignmentScore || 0) + (updated.midtermScore || 0) + (updated.finalScore || 0);
      updated.grade = calculateGrade(updated.totalScore);

      return { ...prev, [key]: updated };
    });
  };"""

new_handler = """  type ScoreField = 'preTestScore' | 'postTestScore' | 'beforeMidKnowledgeScore' | 'beforeMidSoftSkillScore' | 'midtermScore' | 'afterMidKnowledgeScore' | 'afterMidSoftSkillScore' | 'finalScore';

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

content = content.replace(old_handler, new_handler)

# Update table
old_table = """                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-center w-16">เลขที่</th>
                      <th className="px-4 py-3 w-48 whitespace-nowrap">ชื่อ-นามสกุล</th>
                      <th className="px-4 py-3 text-center border-l border-slate-200">เก็บระหว่างเรียน<br/><span className="text-xs font-normal text-slate-400">(60)</span></th>
                      <th className="px-4 py-3 text-center">กลางภาค<br/><span className="text-xs font-normal text-slate-400">(20)</span></th>
                      <th className="px-4 py-3 text-center">ปลายภาค<br/><span className="text-xs font-normal text-slate-400">(20)</span></th>
                      <th className="px-4 py-3 text-center border-l border-slate-200">รวม<br/><span className="text-xs font-normal text-slate-400">(100)</span></th>
                      <th className="px-4 py-3 text-center">เกรด</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.filter(s => s.gradeLevel === selectedGrade).length > 0 ? (
                      students.filter(s => s.gradeLevel === selectedGrade)
                        .sort((a, b) => (Number(a.number || '0') - Number(b.number || '0')))
                        .map((student) => {
                          const key = `${student.id}_${systemAcademicYear}_${systemSemester}_${selectedSubject}`;
                          const score = draftScores[key] || { assignmentScore: '', midtermScore: '', finalScore: '', totalScore: '-', grade: '-' };
                          
                          return (
                          <tr key={student.id} className={`border-b border-slate-100 transition-colors ${score.totalScore > 0 && score.totalScore < 50 ? 'bg-rose-50/70 hover:bg-rose-100' : 'hover:bg-slate-50'}`}>
                            <td className="px-4 py-3 text-center font-medium">{student.number}</td>
                            <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{student.firstName} {student.lastName}</td>
                            <td className="px-4 py-3 text-center border-l border-slate-100">
                              <input 
                                type="number" 
                                className="w-16 text-center border border-slate-200 rounded p-1" 
                                placeholder="0"
                                value={score.assignmentScore === 0 ? '' : score.assignmentScore}
                                onChange={(e) => handleScoreChange(student.id, 'assignmentScore', e.target.value)}
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input 
                                type="number" 
                                className="w-16 text-center border border-slate-200 rounded p-1" 
                                placeholder="0"
                                value={score.midtermScore === 0 ? '' : score.midtermScore}
                                onChange={(e) => handleScoreChange(student.id, 'midtermScore', e.target.value)}
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input 
                                type="number" 
                                className="w-16 text-center border border-slate-200 rounded p-1" 
                                placeholder="0"
                                value={score.finalScore === 0 ? '' : score.finalScore}
                                onChange={(e) => handleScoreChange(student.id, 'finalScore', e.target.value)}
                              />
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-slate-800 border-l border-slate-100">
                              {score.totalScore}
                            </td>
                            <td className="px-4 py-3 text-center font-black text-emerald-600">
                              {score.grade}
                            </td>
                          </tr>
                        )})
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                          ไม่พบข้อมูลนักเรียนในชั้น {selectedGrade}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>"""

new_table = """                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-2 py-3 text-center w-12 sticky left-0 bg-slate-50 z-10 border-r border-slate-200 shadow-[1px_0_0_#e2e8f0]">เลขที่</th>
                      <th className="px-4 py-3 w-40 whitespace-nowrap sticky left-[48px] bg-slate-50 z-10 border-r border-slate-200 shadow-[1px_0_0_#e2e8f0]">ชื่อ-นามสกุล</th>
                      <th className="px-3 py-3 text-center border-r border-slate-200 bg-sky-50">Pre-Test<br/><span className="text-xs font-normal text-slate-400">ก่อนเรียน</span></th>
                      <th className="px-3 py-3 text-center border-r border-slate-200 bg-emerald-50">ความรู้ก่อนกลางภาค<br/><span className="text-xs font-normal text-emerald-500">(20)</span></th>
                      <th className="px-3 py-3 text-center border-r border-slate-200 bg-emerald-50">จิตพิสัยก่อนกลางภาค<br/><span className="text-xs font-normal text-emerald-500">(10)</span></th>
                      <th className="px-3 py-3 text-center border-r border-slate-200 bg-amber-50">สอบกลางภาค<br/><span className="text-xs font-normal text-amber-500">(20)</span></th>
                      <th className="px-3 py-3 text-center border-r border-slate-200 bg-emerald-50">ความรู้หลังกลางภาค<br/><span className="text-xs font-normal text-emerald-500">(20)</span></th>
                      <th className="px-3 py-3 text-center border-r border-slate-200 bg-emerald-50">จิตพิสัยหลังกลางภาค<br/><span className="text-xs font-normal text-emerald-500">(10)</span></th>
                      <th className="px-3 py-3 text-center border-r border-slate-200 bg-rose-50">สอบปลายภาค<br/><span className="text-xs font-normal text-rose-500">(20)</span></th>
                      <th className="px-3 py-3 text-center border-r border-slate-200 bg-sky-50">Post-Test<br/><span className="text-xs font-normal text-slate-400">หลังเรียน</span></th>
                      <th className="px-4 py-3 text-center border-r border-slate-200 bg-indigo-50">รวม<br/><span className="text-xs font-normal text-indigo-500">(100)</span></th>
                      <th className="px-4 py-3 text-center bg-indigo-50">เกรด</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.filter(s => s.gradeLevel === selectedGrade).length > 0 ? (
                      students.filter(s => s.gradeLevel === selectedGrade)
                        .sort((a, b) => (Number(a.number || '0') - Number(b.number || '0')))
                        .map((student) => {
                          const key = `${student.id}_${systemAcademicYear}_${systemSemester}_${selectedSubject}`;
                          const score = draftScores[key] || { 
                            preTestScore: '', postTestScore: '', 
                            beforeMidKnowledgeScore: '', beforeMidSoftSkillScore: '', 
                            midtermScore: '', 
                            afterMidKnowledgeScore: '', afterMidSoftSkillScore: '', 
                            finalScore: '', 
                            totalScore: '-', grade: '-' 
                          };
                          
                          return (
                          <tr key={student.id} className={`border-b border-slate-100 transition-colors ${score.totalScore > 0 && score.totalScore < 50 ? 'bg-rose-50/70 hover:bg-rose-100' : 'hover:bg-slate-50'}`}>
                            <td className="px-2 py-3 text-center font-medium sticky left-0 bg-white z-10 border-r border-slate-200 group-hover:bg-slate-50 shadow-[1px_0_0_#e2e8f0]">{student.number}</td>
                            <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap sticky left-[48px] bg-white z-10 border-r border-slate-200 group-hover:bg-slate-50 shadow-[1px_0_0_#e2e8f0]">{student.firstName} {student.lastName}</td>
                            <td className="px-3 py-3 text-center border-r border-slate-100 bg-sky-50/30">
                              <input 
                                type="number" 
                                className="w-14 text-center border border-slate-200 rounded p-1 text-xs" 
                                placeholder="0"
                                value={score.preTestScore === 0 ? '' : score.preTestScore}
                                onChange={(e) => handleScoreChange(student.id, 'preTestScore', e.target.value)}
                              />
                            </td>
                            <td className="px-3 py-3 text-center border-r border-slate-100 bg-emerald-50/30">
                              <input 
                                type="number" 
                                className="w-14 text-center border border-slate-200 rounded p-1 text-xs" 
                                placeholder="0"
                                value={score.beforeMidKnowledgeScore === 0 ? '' : score.beforeMidKnowledgeScore}
                                onChange={(e) => handleScoreChange(student.id, 'beforeMidKnowledgeScore', e.target.value)}
                              />
                            </td>
                            <td className="px-3 py-3 text-center border-r border-slate-100 bg-emerald-50/30">
                              <input 
                                type="number" 
                                className="w-14 text-center border border-slate-200 rounded p-1 text-xs" 
                                placeholder="0"
                                value={score.beforeMidSoftSkillScore === 0 ? '' : score.beforeMidSoftSkillScore}
                                onChange={(e) => handleScoreChange(student.id, 'beforeMidSoftSkillScore', e.target.value)}
                              />
                            </td>
                            <td className="px-3 py-3 text-center border-r border-slate-100 bg-amber-50/30">
                              <input 
                                type="number" 
                                className="w-14 text-center border border-slate-200 rounded p-1 text-xs" 
                                placeholder="0"
                                value={score.midtermScore === 0 ? '' : score.midtermScore}
                                onChange={(e) => handleScoreChange(student.id, 'midtermScore', e.target.value)}
                              />
                            </td>
                            <td className="px-3 py-3 text-center border-r border-slate-100 bg-emerald-50/30">
                              <input 
                                type="number" 
                                className="w-14 text-center border border-slate-200 rounded p-1 text-xs" 
                                placeholder="0"
                                value={score.afterMidKnowledgeScore === 0 ? '' : score.afterMidKnowledgeScore}
                                onChange={(e) => handleScoreChange(student.id, 'afterMidKnowledgeScore', e.target.value)}
                              />
                            </td>
                            <td className="px-3 py-3 text-center border-r border-slate-100 bg-emerald-50/30">
                              <input 
                                type="number" 
                                className="w-14 text-center border border-slate-200 rounded p-1 text-xs" 
                                placeholder="0"
                                value={score.afterMidSoftSkillScore === 0 ? '' : score.afterMidSoftSkillScore}
                                onChange={(e) => handleScoreChange(student.id, 'afterMidSoftSkillScore', e.target.value)}
                              />
                            </td>
                            <td className="px-3 py-3 text-center border-r border-slate-100 bg-rose-50/30">
                              <input 
                                type="number" 
                                className="w-14 text-center border border-slate-200 rounded p-1 text-xs" 
                                placeholder="0"
                                value={score.finalScore === 0 ? '' : score.finalScore}
                                onChange={(e) => handleScoreChange(student.id, 'finalScore', e.target.value)}
                              />
                            </td>
                            <td className="px-3 py-3 text-center border-r border-slate-100 bg-sky-50/30">
                              <input 
                                type="number" 
                                className="w-14 text-center border border-slate-200 rounded p-1 text-xs" 
                                placeholder="0"
                                value={score.postTestScore === 0 ? '' : score.postTestScore}
                                onChange={(e) => handleScoreChange(student.id, 'postTestScore', e.target.value)}
                              />
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-slate-800 border-r border-slate-100 bg-indigo-50/30">
                              {score.totalScore}
                            </td>
                            <td className="px-4 py-3 text-center font-black text-emerald-600 bg-indigo-50/30">
                              {score.grade}
                            </td>
                          </tr>
                        )})
                    ) : (
                      <tr>
                        <td colSpan={12} className="px-4 py-8 text-center text-slate-500">
                          ไม่พบข้อมูลนักเรียนในชั้น {selectedGrade}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>"""

content = content.replace(old_table, new_table)

with open('src/components/EvaluationModule.tsx', 'w') as f:
    f.write(content)
