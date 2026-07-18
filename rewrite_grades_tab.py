import re

with open('src/components/EvaluationModule.tsx', 'r') as f:
    content = f.read()

start_idx = content.find("{activeTab === 'grades' && (")
if start_idx != -1:
    count = 1
    i = start_idx + len("{activeTab === 'grades' && (")
    while count > 0 and i < len(content):
        if content[i:i+2] == ')}':
            count -= 1
        elif content[i] == '(':
            count += 1
        elif content[i] == ')':
            count -= 1
        i += 1
    
    new_grades_tab = """{activeTab === 'grades' && (
            <div className="p-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-800">บันทึกคะแนน</h3>
                  <p className="text-sm text-slate-500">จัดการข้อมูลคะแนนเก็บ คะแนนสอบย่อย กลางภาค และปลายภาค</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <select 
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {SUBJECTS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <select 
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {GRADE_LEVELS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                  <button 
                    onClick={() => setShowSettingsModal(true)}
                    className="flex items-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                  >
                    <Settings className="h-4 w-4" /> ตั้งค่ากิจกรรม
                  </button>
                </div>
              </div>

              {/* Sub tabs for grades */}
              <div className="flex border-b border-slate-200 mb-6">
                <button
                  onClick={() => setGradesSubTab('part1')}
                  className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors ${gradesSubTab === 'part1' ? 'border-indigo-500 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  ส่วนที่ 1: เก็บระหว่างเรียน
                </button>
                <button
                  onClick={() => setGradesSubTab('part2')}
                  className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors ${gradesSubTab === 'part2' ? 'border-indigo-500 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  ส่วนที่ 2: สอบ (กลางภาค/ปลายภาค)
                </button>
              </div>

              <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl max-w-full">
                {gradesSubTab === 'part1' && subjectSettings ? (
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th rowSpan={2} className="px-2 py-3 text-center w-12 sticky left-0 bg-slate-50 z-10 border-r border-slate-200 shadow-[1px_0_0_#e2e8f0]">เลขที่</th>
                        <th rowSpan={2} className="px-4 py-3 w-40 whitespace-nowrap sticky left-[48px] bg-slate-50 z-10 border-r border-slate-200 shadow-[1px_0_0_#e2e8f0]">ชื่อ-นามสกุล</th>
                        <th colSpan={subjectSettings.beforeMidKnowledge.length} className="px-3 py-2 text-center border-b border-r border-slate-200 bg-emerald-50/50">ความรู้ก่อนกลางภาค (20)</th>
                        <th colSpan={subjectSettings.beforeMidSoftSkill.length} className="px-3 py-2 text-center border-b border-r border-slate-200 bg-emerald-50/50">จิตพิสัยก่อนกลางภาค (10)</th>
                        <th colSpan={subjectSettings.afterMidKnowledge.length} className="px-3 py-2 text-center border-b border-r border-slate-200 bg-emerald-50/50">ความรู้หลังกลางภาค (20)</th>
                        <th colSpan={subjectSettings.afterMidSoftSkill.length} className="px-3 py-2 text-center border-b border-r border-slate-200 bg-emerald-50/50">จิตพิสัยหลังกลางภาค (10)</th>
                        <th rowSpan={2} className="px-3 py-3 text-center border-l border-slate-200 bg-indigo-50 font-bold">รวมเก็บคะแนน<br/><span className="text-xs text-indigo-500 font-normal">(60)</span></th>
                      </tr>
                      <tr>
                        {subjectSettings.beforeMidKnowledge.map(act => (
                          <th key={act.id} className="px-2 py-2 text-center border-r border-slate-200 bg-emerald-50/50 font-medium text-xs whitespace-nowrap min-w-[60px]">
                            {act.name}<br/><span className="text-slate-400">({act.maxScore})</span>
                          </th>
                        ))}
                        {subjectSettings.beforeMidSoftSkill.map(act => (
                          <th key={act.id} className="px-2 py-2 text-center border-r border-slate-200 bg-emerald-50/50 font-medium text-xs whitespace-nowrap min-w-[60px]">
                            {act.name}<br/><span className="text-slate-400">({act.maxScore})</span>
                          </th>
                        ))}
                        {subjectSettings.afterMidKnowledge.map(act => (
                          <th key={act.id} className="px-2 py-2 text-center border-r border-slate-200 bg-emerald-50/50 font-medium text-xs whitespace-nowrap min-w-[60px]">
                            {act.name}<br/><span className="text-slate-400">({act.maxScore})</span>
                          </th>
                        ))}
                        {subjectSettings.afterMidSoftSkill.map(act => (
                          <th key={act.id} className="px-2 py-2 text-center border-r border-slate-200 bg-emerald-50/50 font-medium text-xs whitespace-nowrap min-w-[60px]">
                            {act.name}<br/><span className="text-slate-400">({act.maxScore})</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {students.filter(s => s.gradeLevel === selectedGrade).length > 0 ? (
                        students.filter(s => s.gradeLevel === selectedGrade)
                          .sort((a, b) => (Number(a.number || '0') - Number(b.number || '0')))
                          .map((student) => {
                            const key = `${student.id}_${systemAcademicYear}_${systemSemester}_${selectedSubject}`;
                            const score = draftScores[key] || { activities: {}, totalScore: '-', grade: '-' };
                            const part1Total = (Number(score.beforeMidKnowledgeScore) || 0) + (Number(score.beforeMidSoftSkillScore) || 0) + (Number(score.afterMidKnowledgeScore) || 0) + (Number(score.afterMidSoftSkillScore) || 0);
                            
                            return (
                            <tr key={student.id} className={`group border-b border-slate-100 transition-colors ${score.totalScore > 0 && score.totalScore < 50 ? 'bg-rose-50/70 hover:bg-rose-100' : 'hover:bg-slate-50'}`}>
                              <td className="px-2 py-3 text-center font-medium sticky left-0 bg-white z-10 border-r border-slate-200 group-hover:bg-slate-50 shadow-[1px_0_0_#e2e8f0]">{student.number}</td>
                              <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap sticky left-[48px] bg-white z-10 border-r border-slate-200 group-hover:bg-slate-50 shadow-[1px_0_0_#e2e8f0]">{student.firstName} {student.lastName}</td>
                              
                              {subjectSettings.beforeMidKnowledge.map(act => (
                                <td key={act.id} className="px-2 py-2 text-center border-r border-slate-100 bg-emerald-50/30">
                                  <input 
                                    type="number" max={act.maxScore}
                                    className="w-12 text-center border border-slate-200 rounded p-1 text-xs outline-none focus:ring-1 focus:ring-emerald-500" 
                                    placeholder="0"
                                    value={score.activities?.[act.id] === 0 ? '' : score.activities?.[act.id] || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val !== '' && Number(val) > act.maxScore) return;
                                      handleActivityScoreChange(student.id, 'beforeMidKnowledge', act.id, val);
                                    }}
                                  />
                                </td>
                              ))}
                              {subjectSettings.beforeMidSoftSkill.map(act => (
                                <td key={act.id} className="px-2 py-2 text-center border-r border-slate-100 bg-emerald-50/30">
                                  <input 
                                    type="number" max={act.maxScore}
                                    className="w-12 text-center border border-slate-200 rounded p-1 text-xs outline-none focus:ring-1 focus:ring-emerald-500" 
                                    placeholder="0"
                                    value={score.activities?.[act.id] === 0 ? '' : score.activities?.[act.id] || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val !== '' && Number(val) > act.maxScore) return;
                                      handleActivityScoreChange(student.id, 'beforeMidSoftSkill', act.id, val);
                                    }}
                                  />
                                </td>
                              ))}
                              {subjectSettings.afterMidKnowledge.map(act => (
                                <td key={act.id} className="px-2 py-2 text-center border-r border-slate-100 bg-emerald-50/30">
                                  <input 
                                    type="number" max={act.maxScore}
                                    className="w-12 text-center border border-slate-200 rounded p-1 text-xs outline-none focus:ring-1 focus:ring-emerald-500" 
                                    placeholder="0"
                                    value={score.activities?.[act.id] === 0 ? '' : score.activities?.[act.id] || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val !== '' && Number(val) > act.maxScore) return;
                                      handleActivityScoreChange(student.id, 'afterMidKnowledge', act.id, val);
                                    }}
                                  />
                                </td>
                              ))}
                              {subjectSettings.afterMidSoftSkill.map(act => (
                                <td key={act.id} className="px-2 py-2 text-center border-r border-slate-100 bg-emerald-50/30">
                                  <input 
                                    type="number" max={act.maxScore}
                                    className="w-12 text-center border border-slate-200 rounded p-1 text-xs outline-none focus:ring-1 focus:ring-emerald-500" 
                                    placeholder="0"
                                    value={score.activities?.[act.id] === 0 ? '' : score.activities?.[act.id] || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val !== '' && Number(val) > act.maxScore) return;
                                      handleActivityScoreChange(student.id, 'afterMidSoftSkill', act.id, val);
                                    }}
                                  />
                                </td>
                              ))}
                              
                              <td className="px-3 py-3 text-center font-bold text-slate-800 border-l border-slate-100 bg-indigo-50/30">
                                {part1Total}
                              </td>
                            </tr>
                          )})
                      ) : (
                        <tr>
                          <td colSpan={20} className="px-4 py-8 text-center text-slate-500">
                            ไม่พบข้อมูลนักเรียนในชั้น {selectedGrade}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                ) : (
                  gradesSubTab === 'part2' ? (
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="px-2 py-3 text-center w-12 sticky left-0 bg-slate-50 z-10 border-r border-slate-200 shadow-[1px_0_0_#e2e8f0]">เลขที่</th>
                          <th className="px-4 py-3 w-40 whitespace-nowrap sticky left-[48px] bg-slate-50 z-10 border-r border-slate-200 shadow-[1px_0_0_#e2e8f0]">ชื่อ-นามสกุล</th>
                          <th className="px-3 py-3 text-center border-r border-slate-200 bg-sky-50">Pre-Test<br/><span className="text-xs font-normal text-slate-400">ก่อนเรียน</span></th>
                          <th className="px-3 py-3 text-center border-r border-slate-200 bg-amber-50">สอบกลางภาค<br/><span className="text-xs font-normal text-amber-500">(20)</span></th>
                          <th className="px-3 py-3 text-center border-r border-slate-200 bg-rose-50">สอบปลายภาค<br/><span className="text-xs font-normal text-rose-500">(20)</span></th>
                          <th className="px-3 py-3 text-center border-r border-slate-200 bg-sky-50">Post-Test<br/><span className="text-xs font-normal text-slate-400">หลังเรียน</span></th>
                          <th className="px-4 py-3 text-center border-r border-slate-200 bg-indigo-50">รวมทั้งหมด<br/><span className="text-xs font-normal text-indigo-500">(100)</span></th>
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
                                midtermScore: '', finalScore: '', 
                                totalScore: '-', grade: '-' 
                              };
                              
                              return (
                              <tr key={student.id} className={`group border-b border-slate-100 transition-colors ${score.totalScore > 0 && score.totalScore < 50 ? 'bg-rose-50/70 hover:bg-rose-100' : 'hover:bg-slate-50'}`}>
                                <td className="px-2 py-3 text-center font-medium sticky left-0 bg-white z-10 border-r border-slate-200 group-hover:bg-slate-50 shadow-[1px_0_0_#e2e8f0]">{student.number}</td>
                                <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap sticky left-[48px] bg-white z-10 border-r border-slate-200 group-hover:bg-slate-50 shadow-[1px_0_0_#e2e8f0]">{student.firstName} {student.lastName}</td>
                                <td className="px-3 py-3 text-center border-r border-slate-100 bg-sky-50/30">
                                  <input 
                                    type="number" 
                                    className="w-14 text-center border border-slate-200 rounded p-1 text-xs outline-none focus:ring-1 focus:ring-sky-500" 
                                    placeholder="0"
                                    value={score.preTestScore === 0 ? '' : score.preTestScore}
                                    onChange={(e) => handleScoreChange(student.id, 'preTestScore', e.target.value)}
                                  />
                                </td>
                                <td className="px-3 py-3 text-center border-r border-slate-100 bg-amber-50/30">
                                  <input 
                                    type="number" max={20}
                                    className="w-14 text-center border border-slate-200 rounded p-1 text-xs outline-none focus:ring-1 focus:ring-amber-500" 
                                    placeholder="0"
                                    value={score.midtermScore === 0 ? '' : score.midtermScore}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val !== '' && Number(val) > 20) return;
                                      handleScoreChange(student.id, 'midtermScore', val);
                                    }}
                                  />
                                </td>
                                <td className="px-3 py-3 text-center border-r border-slate-100 bg-rose-50/30">
                                  <input 
                                    type="number" max={20}
                                    className="w-14 text-center border border-slate-200 rounded p-1 text-xs outline-none focus:ring-1 focus:ring-rose-500" 
                                    placeholder="0"
                                    value={score.finalScore === 0 ? '' : score.finalScore}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val !== '' && Number(val) > 20) return;
                                      handleScoreChange(student.id, 'finalScore', val);
                                    }}
                                  />
                                </td>
                                <td className="px-3 py-3 text-center border-r border-slate-100 bg-sky-50/30">
                                  <input 
                                    type="number" 
                                    className="w-14 text-center border border-slate-200 rounded p-1 text-xs outline-none focus:ring-1 focus:ring-sky-500" 
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
                    </table>
                  ) : (
                    <div className="p-8 text-center text-slate-500">กำลังโหลดการตั้งค่า...</div>
                  )
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button 
                  onClick={handleSaveScores}
                  disabled={isSaving}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" /> 
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </div>
            </div>
          )}"""
    
    content = content[:start_idx] + new_grades_tab + content[i:]
    
    # Also add the modal component before the closing div of return
    # Find the last closing div
    last_div_idx = content.rfind("</div>\n  );\n};")
    if last_div_idx != -1:
        modal_injection = """
      {showSettingsModal && subjectSettings && (
        <SubjectSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          settings={subjectSettings}
          onSave={handleSaveSettings}
        />
      )}
    """
        content = content[:last_div_idx] + modal_injection + content[last_div_idx:]

    with open('src/components/EvaluationModule.tsx', 'w') as f:
        f.write(content)
