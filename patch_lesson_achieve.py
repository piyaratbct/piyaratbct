with open('src/components/LessonAchieve.tsx', 'r') as f:
    content = f.read()

old_tr = """              {atRiskStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors">"""

new_tr = """              {atRiskStudents.map((student) => (
                <tr key={student.id} className={`transition-colors ${student.severity === 'high' ? 'bg-rose-50/70 hover:bg-rose-100' : 'bg-amber-50/70 hover:bg-amber-100'}`}>"""

content = content.replace(old_tr, new_tr)

with open('src/components/LessonAchieve.tsx', 'w') as f:
    f.write(content)
