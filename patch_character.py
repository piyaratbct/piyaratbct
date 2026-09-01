import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    # 1. Add the column header
    old_header = """                {TRAITS.map(t => (
                  <th key={t.id} className="px-2 py-3 text-center w-16 border-r border-slate-200 last:border-r-0 leading-tight">
                    <span title={t.label} className="text-xs">{t.short}</span>
                  </th>
                ))}
              </tr>"""

    new_header = """                {TRAITS.map(t => (
                  <th key={t.id} className="px-2 py-3 text-center w-16 border-r border-slate-200 leading-tight">
                    <span title={t.label} className="text-xs">{t.short}</span>
                  </th>
                ))}
                <th className="px-3 py-3 text-center w-24 border-l border-slate-200 bg-indigo-50 font-bold text-indigo-700 leading-tight">สรุปผล</th>
              </tr>"""

    if old_header in code:
        code = code.replace(old_header, new_header)
    else:
        print("Could not find header pattern")
        
    # 2. Add the summary calculation
    old_body_start = """                  const studentData = assessments[student.id] || {};
                  const studentBadges = badges[student.id] || [];"""
                  
    new_body_start = """                  const studentData = assessments[student.id] || {};
                  const studentBadges = badges[student.id] || [];
                  
                  const getOverallSummary = () => {
                    let count3 = 0; let count2 = 0; let count1 = 0; let count0 = 0;
                    let totalAssessed = 0;
                    TRAITS.forEach(t => {
                      const val = studentData[t.id];
                      if (val === 3) count3++;
                      else if (val === 2) count2++;
                      else if (val === 1) count1++;
                      else if (val === 0) count0++;
                      if (val !== undefined) totalAssessed++;
                    });
                    
                    if (totalAssessed < 8) return { label: '-', class: 'text-slate-400 bg-slate-50' };
                    if (count0 > 0) return { label: 'ไม่ผ่าน', class: 'text-rose-700 bg-rose-50 font-bold' };
                    if (count3 >= 5 && count1 === 0 && count0 === 0) return { label: 'ดีเยี่ยม', class: 'text-emerald-700 bg-emerald-50 font-bold' };
                    if ((count2 + count3) >= 5 && count0 === 0) return { label: 'ดี', class: 'text-indigo-700 bg-indigo-50 font-bold' };
                    return { label: 'ผ่าน', class: 'text-amber-700 bg-amber-50 font-bold' };
                  };
                  const summary = getOverallSummary();"""
                  
    if old_body_start in code:
        code = code.replace(old_body_start, new_body_start)
    else:
        print("Could not find body start pattern")

    with open(filename, 'w') as f:
        f.write(code)

fix('src/components/CharacterAssessmentView.tsx')
