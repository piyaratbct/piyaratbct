import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    # Look for the insights section
    if "const lessonRecordScores: Record<string, number[]> = {" not in code.split("const avgScore =")[1]:
        logic_str = """                  if (totalCount > 0) {"""
        logic_replace = """                  // -- NEW: Lesson Records Insights --
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
                               insights.push({ type: 'positive', text: `คะแนนประเมินรายวิชา (${traitInfo.short}) สูงเฉลี่ย ${avg.toFixed(1)} -> แนะนำดีเยี่ยม` });
                           } else if (avg < 1.5) {
                               insights.push({ type: 'warning', text: `คะแนนประเมินรายวิชา (${traitInfo.short}) ต่ำเฉลี่ย ${avg.toFixed(1)} -> ควรปรับปรุง` });
                           } else {
                               insights.push({ type: 'neutral', text: `ประเมินรายวิชา (${traitInfo.short}): ${avg.toFixed(1)}` });
                           }
                       }
                     }
                  });
                  // ------------------------------------

                  if (totalCount > 0) {"""
        
        # We need to make sure we replace the correct `if (totalCount > 0) {` inside the render map.
        parts = code.split('const avgScore = scoreCount > 0 ? (totalScoreSum / scoreCount) : 0;')
        if len(parts) > 1:
             part2 = parts[1].replace(logic_str, logic_replace, 1) # Only replace the first occurrence in the render loop
             code = parts[0] + 'const avgScore = scoreCount > 0 ? (totalScoreSum / scoreCount) : 0;' + part2

    # Also add 'neutral' class in the insights renderer
    class_str = """insight.type === 'positive' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                insight.type === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                'bg-rose-50 text-rose-700 border-rose-100'"""
    class_replace = """insight.type === 'positive' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                insight.type === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                insight.type === 'neutral' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                                'bg-rose-50 text-rose-700 border-rose-100'"""
    
    code = code.replace(class_str, class_replace)

    with open(filename, 'w') as f:
        f.write(code)
    print("Success")

fix('src/components/CharacterAssessmentView.tsx')
