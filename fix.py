import re

f = open('src/components/CharacterAssessmentView.tsx', 'r')
code = f.read()
f.close()

# The missing part is:
missing_part = """const avgScore = scoreCount > 0 ? (totalScoreSum / scoreCount) : 0;
                  const insights: any[] = [];
                  
                  // -- NEW: Lesson Records Insights --
                  const lessonRecordScores: Record<string, number[]> = { t1: [], t2: [], t3: [], t4: [], t5: [], t6: [], t7: [], t8: [] };
                  lessonRecords.forEach(record => {
                    if (record.studentDesirableScores && record.studentDesirableScores[student.id]) {
                      const studentScores = record.studentDesirableScores[student.id];
                      Object.entries(studentScores).forEach(([indicatorId, score]) => {
                         const traitNumber = indicatorId.split('.')[0];
                         const traitKey = `t${traitNumber}`;
                         if (lessonRecordScores[traitKey] !== undefined) {
                           lessonRecordScores[traitKey].push(score as number);
                         }
                      });
                    }
                  });
                  Object.keys(lessonRecordScores).forEach(traitKey => {
                     const scores = lessonRecordScores[traitKey];
                     if (scores.length > 0) {
                       const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
                       const traitInfo = TRAITS.find(t => t.id === traitKey);
                       if (traitInfo) {
                           if (avg >= 2.5) {
                               insights.push({ type: 'positive', text: `ประเมินรายวิชา (${traitInfo.short}) ดีเยี่ยม: ${avg.toFixed(1)}` });
                           } else if (avg < 1.5) {
                               insights.push({ type: 'warning', text: `ประเมินรายวิชา (${traitInfo.short}) ควรปรับปรุง: ${avg.toFixed(1)}` });
                           } else {
                               insights.push({ type: 'neutral', text: `ประเมินรายวิชา (${traitInfo.short}): ${avg.toFixed(1)}` });
                           }
                       }
                     }
                  });
                  // ------------------------------------

                  const attendedEvents = schoolEvents.filter(e => e.attendeeIds && e.attendeeIds.includes(student.id));
                  const eventTraitMap: Record<string, string[]> = {};
                  attendedEvents.forEach(e => {
                    if (e.evaluatedTraits) {
                      e.evaluatedTraits.forEach((tId: string) => {
                        if (!eventTraitMap[tId]) eventTraitMap[tId] = [];
                        eventTraitMap[tId].push(e.title);
                      });
                    }
                  });
                  Object.keys(eventTraitMap).forEach(tId => {
                    const trait = TRAITS.find(t => t.id === tId);
                    if (trait) {
                      insights.push({ type: 'positive', text: `เข้าร่วม ${eventTraitMap[tId].join(', ')} -> โดดเด่น (${trait.short})` });
                    }
                  });
                  
                  if (totalCount > 0) {
                    if (attendancePercent >= 90 && !hasIncidents) {
                      insights.push({ type: 'positive', text: `มาเรียนสม่ำเสมอ (${attendancePercent.toFixed(0)}%) -> เพิ่มวินัย` });
                    }
                    if (lateCount >= 3) {
                      insights.push({ type: 'warning', text: `มาสายบ่อย (${lateCount} ครั้ง) -> หักวินัย` });
                    }
                  }
                  
                  if (hasIncidents) {
                    insights.push({ type: 'danger', text: `คดีฝ่ายปกครอง (${studentIncidents.length} คดี) -> หักวินัย` });
                  }
                  
                  if (scoreCount > 0) {
                    if (avgScore >= 80) {
                      insights.push({ type: 'positive', text: `การเรียน (${avgScore.toFixed(0)}%) -> เพิ่มใฝ่เรียน/มุ่งมั่น` });
                    } else if (avgScore < 50) {
                      insights.push({ type: 'warning', text: `การเรียน (${avgScore.toFixed(0)}%) -> หักใฝ่เรียน/มุ่งมั่น` });
                    }
                  }

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-2 py-3 text-center sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-200 shadow-[1px_0_0_#e2e8f0] font-medium text-slate-500">
                        {student.number || '-'}
                      </td>
                      <td className="px-4 py-3 sticky left-[48px] bg-white group-hover:bg-slate-50 z-10 border-r border-slate-200 shadow-[1px_0_0_#e2e8f0]">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{student.firstName} {student.lastName}</span>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {studentBadges.map((badge, idx) => (
                              <span key={`b-${idx}`} className="text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100" title={`โดย ${badge.teacherName}`}>
                                <Medal className="h-3 w-3" />
                                {badge.description}
                              </span>
                            ))}
                            {insights.map((insight, idx) => (
                              <span key={`i-${idx}`} className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border ${
                                insight.type === 'positive' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                insight.type === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                insight.type === 'neutral' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                                'bg-rose-50 text-rose-700 border-rose-100'
                              }`}>
                                {insight.type === 'positive' && <Sparkles className="h-3 w-3" />}
                                {insight.type === 'warning' && <AlertCircle className="h-3 w-3" />}
                                {insight.type === 'danger' && <AlertCircle className="h-3 w-3" />}
                                {insight.text}
                              </span>
                            ))}
                            {studentBadges.length === 0 && insights.length === 0 && (
                               <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                 (ยังไม่มีข้อมูลหลักฐานประกอบ)
                               </span>
                            )}
                          </div>
                        </div>
                      </td>
                      {TRAITS.map(t => {
                        const score = (studentData as any)[t.id];
                        return (
                          <td key={t.id} className="px-1 py-3 text-center border-r border-slate-200 last:border-r-0">
                              <select
                                value={score !== undefined ? score : ''}
                                onChange={(e) => handleScoreChange(student.id, t.id, Number(e.target.value))}
                                disabled={!isTeacherActionAllowed}
                                className={`w-full text-center py-1 px-1 rounded border cursor-pointer outline-none transition-colors text-sm font-semibold ${(score === 3 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : score === 2 ? 'bg-white text-slate-700 border-slate-200' : score === 1 ? 'bg-amber-50 text-amber-700 border-amber-200' : score === 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-400 border-slate-200')}`}
                              >
                               <option value="" disabled>-</option>
                               <option value={3}>3</option>
                               <option value={2}>2</option>
                               <option value={1}>1</option>
                               <option value={0}>0</option>
                             </select>
                          </td>
                        );
                      })}
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                    ไม่พบข้อมูลนักเรียนในชั้น {selectedGrade}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-100 border border-emerald-300 inline-block"></span> = ดีเยี่ยม (3)</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-white border border-slate-300 inline-block"></span> = ดี (2)</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-50 border border-amber-300 inline-block"></span> = ผ่าน (1)</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-rose-50 border border-rose-300 inline-block"></span> = ไม่ผ่าน (0)</div>
        </div>
      </div>
    </div>
  );
};
"""

code += missing_part

with open('src/components/CharacterAssessmentView.tsx', 'w') as f:
    f.write(code)

print("Fixed!")
