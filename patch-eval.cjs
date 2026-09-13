const fs = require('fs');
let content = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf8');

// Find where subjectType is used to determine rendering in EvaluationModule
// Actually, first let's see if we can get the subjectType from the selectedSubject

const getSubjectTypeStr = `  const isTeacherAssigned = React.useMemo(() => {`;
const insertSubjectTypeStr = `  const selectedSubjectType = React.useMemo(() => {
    const subj = fetchedAvailableSubjects.find(s => {
      if (typeof s === 'string') return s === selectedSubject;
      if (s.type === 'single') return s.name === selectedSubject;
      if (s.type === 'group') return s.subjects.includes(selectedSubject);
      return false;
    });
    // In our implementation, we didn't add subjectType to the dropdown data yet
    // Let's modify useAvailableSubjects to include the raw subject data or type
    // But for now, let's just check if it's 'กิจกรรมลูกเสือ', 'แนะแนว', 'ชุมนุม', etc.
    return (selectedSubject.includes('กิจกรรม') || selectedSubject.includes('ลูกเสือ') || selectedSubject.includes('ชุมนุม') || selectedSubject.includes('แนะแนว')) ? 'activity' : 'academic';
  }, [selectedSubject, fetchedAvailableSubjects]);

  const isTeacherAssigned = React.useMemo(() => {`;

content = content.replace(getSubjectTypeStr, insertSubjectTypeStr);

// Now patch the tab rendering
const tabRenderStr = `                <button
                  onClick={() => setGradesSubTab('part1')}
                  className={\`px-4 py-2 font-bold text-sm border-b-2 transition-colors whitespace-nowrap \${gradesSubTab === 'part1' ? 'border-indigo-500 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
                >
                  ส่วนที่ 1: เก็บระหว่างเรียน
                </button>
                <button
                  onClick={() => setGradesSubTab('part2')}
                  className={\`px-4 py-2 font-bold text-sm border-b-2 transition-colors whitespace-nowrap \${gradesSubTab === 'part2' ? 'border-indigo-500 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
                >
                  ส่วนที่ 2: ผลการเรียน
                </button>`;

const newTabRenderStr = `                {selectedSubjectType === 'academic' ? (
                  <>
                    <button
                      onClick={() => setGradesSubTab('part1')}
                      className={\`px-4 py-2 font-bold text-sm border-b-2 transition-colors whitespace-nowrap \${gradesSubTab === 'part1' ? 'border-indigo-500 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
                    >
                      ส่วนที่ 1: เก็บระหว่างเรียน
                    </button>
                    <button
                      onClick={() => setGradesSubTab('part2')}
                      className={\`px-4 py-2 font-bold text-sm border-b-2 transition-colors whitespace-nowrap \${gradesSubTab === 'part2' ? 'border-indigo-500 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
                    >
                      ส่วนที่ 2: ผลการเรียน
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setGradesSubTab('part2')}
                    className={\`px-4 py-2 font-bold text-sm border-b-2 transition-colors whitespace-nowrap \${gradesSubTab === 'part2' ? 'border-indigo-500 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
                  >
                    ประเมินผลกิจกรรม (ผ/มผ)
                  </button>
                )}`;
                
content = content.replace(tabRenderStr, newTabRenderStr);

const part2TableStr = `                  gradesSubTab === 'part2' ? (
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="px-2 py-3 text-center w-12 sticky left-0 bg-slate-50 z-10 border-r border-slate-200 shadow-[1px_0_0_#e2e8f0]">เลขที่</th>
                          <th className="px-4 py-3 w-40 whitespace-nowrap sticky left-[48px] bg-slate-50 z-10 border-r border-slate-200 shadow-[1px_0_0_#e2e8f0]">ชื่อ-นามสกุล</th>
                          <th className="px-4 py-3 text-center w-24 border-r border-slate-200">รวม 100 คะแนน</th>
                          <th className="px-4 py-3 text-center w-24 bg-indigo-50 text-indigo-700 border-r border-indigo-100">ระดับผลการเรียน</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {students.map(student => {
                          const key = \`\${student.id}_\${viewYear}_\${viewSemester}_\${selectedSubject}\`;
                          const score = (draftScores[key] || scores[key] || {
                            totalScore: 0,
                            grade: '0'
                          }) as SubjectScore;
                          
                          // Also check if this is an aggregated score from children
                          const isAggregated = score.isAggregated;
                          
                          return (
                            <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-2 py-2 text-center font-medium sticky left-0 bg-white border-r border-slate-100 shadow-[1px_0_0_#f1f5f9]">{student.number}</td>
                              <td className="px-4 py-2 whitespace-nowrap sticky left-[48px] bg-white border-r border-slate-100 shadow-[1px_0_0_#f1f5f9]">
                                {student.firstName} {student.lastName}
                                {isAggregated && <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">รวมจากวิชาย่อย</span>}
                              </td>
                              <td className="px-4 py-2 text-center border-r border-slate-100">
                                {isAggregated ? (
                                  <span className="font-black text-slate-700">{score.totalScore || 0}</span>
                                ) : (
                                  <input 
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={score.totalScore || ''}
                                    onChange={(e) => handleScoreChange(student.id, 'totalScore', e.target.value)}
                                    readOnly={isReadOnly}
                                    className={\`w-16 text-center border \${isReadOnly ? 'border-transparent bg-transparent' : 'border-slate-200 bg-white'} rounded px-2 py-1 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none\`}
                                  />
                                )}
                              </td>
                              <td className="px-4 py-2 text-center bg-indigo-50/30">
                                {isAggregated ? (
                                  <span className="font-black text-indigo-700 text-lg">{score.grade || '-'}</span>
                                ) : (
                                  <select
                                    value={score.grade || ''}
                                    onChange={(e) => handleScoreChange(student.id, 'grade', e.target.value)}
                                    disabled={isReadOnly}
                                    className={\`w-20 text-center border \${isReadOnly ? 'border-transparent bg-transparent appearance-none' : 'border-slate-200 bg-white'} rounded px-2 py-1 font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500 outline-none\`}
                                  >
                                    <option value="">-</option>
                                    <option value="4">4</option>
                                    <option value="3.5">3.5</option>
                                    <option value="3">3</option>
                                    <option value="2.5">2.5</option>
                                    <option value="2">2</option>
                                    <option value="1.5">1.5</option>
                                    <option value="1">1</option>
                                    <option value="0">0</option>
                                    <option value="ร">ร</option>
                                    <option value="มส">มส</option>
                                  </select>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) :`;

const newPart2TableStr = `                  gradesSubTab === 'part2' ? (
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="px-2 py-3 text-center w-12 sticky left-0 bg-slate-50 z-10 border-r border-slate-200 shadow-[1px_0_0_#e2e8f0]">เลขที่</th>
                          <th className="px-4 py-3 w-40 whitespace-nowrap sticky left-[48px] bg-slate-50 z-10 border-r border-slate-200 shadow-[1px_0_0_#e2e8f0]">ชื่อ-นามสกุล</th>
                          {selectedSubjectType === 'academic' ? (
                            <>
                              <th className="px-4 py-3 text-center w-24 border-r border-slate-200">รวม 100 คะแนน</th>
                              <th className="px-4 py-3 text-center w-24 bg-indigo-50 text-indigo-700 border-r border-indigo-100">ระดับผลการเรียน</th>
                            </>
                          ) : (
                            <th className="px-4 py-3 text-center w-32 bg-indigo-50 text-indigo-700 border-r border-indigo-100">ผลการประเมินกิจกรรม</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {students.map(student => {
                          const key = \`\${student.id}_\${viewYear}_\${viewSemester}_\${selectedSubject}\`;
                          const score = (draftScores[key] || scores[key] || {
                            totalScore: 0,
                            grade: '0'
                          }) as SubjectScore;
                          
                          // Also check if this is an aggregated score from children
                          const isAggregated = score.isAggregated;
                          
                          return (
                            <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-2 py-2 text-center font-medium sticky left-0 bg-white border-r border-slate-100 shadow-[1px_0_0_#f1f5f9]">{student.number}</td>
                              <td className="px-4 py-2 whitespace-nowrap sticky left-[48px] bg-white border-r border-slate-100 shadow-[1px_0_0_#f1f5f9]">
                                {student.firstName} {student.lastName}
                                {isAggregated && <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">รวมจากวิชาย่อย</span>}
                              </td>
                              {selectedSubjectType === 'academic' ? (
                                <>
                                  <td className="px-4 py-2 text-center border-r border-slate-100">
                                    {isAggregated ? (
                                      <span className="font-black text-slate-700">{score.totalScore || 0}</span>
                                    ) : (
                                      <input 
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={score.totalScore || ''}
                                        onChange={(e) => handleScoreChange(student.id, 'totalScore', e.target.value)}
                                        readOnly={isReadOnly}
                                        className={\`w-16 text-center border \${isReadOnly ? 'border-transparent bg-transparent' : 'border-slate-200 bg-white'} rounded px-2 py-1 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none\`}
                                      />
                                    )}
                                  </td>
                                  <td className="px-4 py-2 text-center bg-indigo-50/30">
                                    {isAggregated ? (
                                      <span className="font-black text-indigo-700 text-lg">{score.grade || '-'}</span>
                                    ) : (
                                      <select
                                        value={score.grade || ''}
                                        onChange={(e) => handleScoreChange(student.id, 'grade', e.target.value)}
                                        disabled={isReadOnly}
                                        className={\`w-20 text-center border \${isReadOnly ? 'border-transparent bg-transparent appearance-none' : 'border-slate-200 bg-white'} rounded px-2 py-1 font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500 outline-none\`}
                                      >
                                        <option value="">-</option>
                                        <option value="4">4</option>
                                        <option value="3.5">3.5</option>
                                        <option value="3">3</option>
                                        <option value="2.5">2.5</option>
                                        <option value="2">2</option>
                                        <option value="1.5">1.5</option>
                                        <option value="1">1</option>
                                        <option value="0">0</option>
                                        <option value="ร">ร</option>
                                        <option value="มส">มส</option>
                                      </select>
                                    )}
                                  </td>
                                </>
                              ) : (
                                <td className="px-4 py-2 text-center bg-indigo-50/30">
                                  <select
                                    value={score.activityResult || ''}
                                    onChange={(e) => handleScoreChange(student.id, 'activityResult', e.target.value)}
                                    disabled={isReadOnly}
                                    className={\`w-32 text-center border \${isReadOnly ? 'border-transparent bg-transparent appearance-none' : 'border-slate-200 bg-white'} rounded px-2 py-1 font-bold focus:ring-2 focus:ring-indigo-500 outline-none \${score.activityResult === 'ผ่าน' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : score.activityResult === 'ไม่ผ่าน' ? 'text-rose-700 bg-rose-50 border-rose-200' : 'text-slate-500'}\`}
                                  >
                                    <option value="">- เลือกผล -</option>
                                    <option value="ผ่าน">ผ (ผ่าน)</option>
                                    <option value="ไม่ผ่าน">มผ (ไม่ผ่าน)</option>
                                  </select>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) :`;

content = content.replace(part2TableStr, newPart2TableStr);

// Force active tab to not be part1 if activity selected
const effectStr = `  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);`;
    
const newEffectStr = `  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
    
    // Auto-switch tabs if needed based on subject type
    if (selectedSubjectType === 'activity' && gradesSubTab === 'part1') {
      setGradesSubTab('part2');
    }`;
    
content = content.replace(effectStr, newEffectStr);

fs.writeFileSync('src/components/EvaluationModule.tsx', content);
console.log("Patched EvaluationModule.tsx");
