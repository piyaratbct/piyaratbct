import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = '''                          <div className="text-xs font-bold text-pink-500 mb-1">
                            เลขที่ {student.number}
                          </div>'''
replacement = '''                          <div className="text-xs font-bold text-pink-500 mb-1 flex items-center gap-2">
                            <span>เลขที่ {student.number}</span>
                            <span className="bg-pink-100 text-pink-700 px-2 rounded-full">{student.gradeLevel || '-'}</span>
                          </div>'''
content = content.replace(target, replacement)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
