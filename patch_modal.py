import re

with open('src/components/StudentDetailModal.tsx', 'r') as f:
    content = f.read()

target = """          {(student.medicalInfo || student.allergicMedicine || student.allergicFood || student.congenitalDisease) && (
            <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500 opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
              <div className="flex items-center gap-2 text-rose-600 mb-3 relative z-10">
                <HeartPulse className="h-5 w-5" />
                <span className="font-black text-sm uppercase tracking-wider">ข้อมูลสุขภาพ / โรคประจำตัว / การแพ้</span>
              </div>
              <div className="relative z-10 space-y-3">
                {student.allergicMedicine && (
                  <div>
                    <span className="block text-xs font-bold text-rose-700/70 mb-1">การแพ้ยา</span>
                    <p className="font-semibold text-rose-800">{student.allergicMedicine}</p>
                  </div>
                )}
                {student.allergicFood && (
                  <div>
                    <span className="block text-xs font-bold text-rose-700/70 mb-1">การแพ้อาหาร</span>
                    <p className="font-semibold text-rose-800">{student.allergicFood}</p>
                  </div>
                )}
                {student.congenitalDisease && (
                  <div>
                    <span className="block text-xs font-bold text-rose-700/70 mb-1">โรคประจำตัว</span>
                    <p className="font-semibold text-rose-800">{student.congenitalDisease}</p>
                  </div>
                )}
                {student.medicalInfo && (
                  <div>
                    <span className="block text-xs font-bold text-rose-700/70 mb-1">ข้อมูลอื่นๆ</span>
                    <p className="font-semibold text-rose-800 whitespace-pre-wrap">{student.medicalInfo}</p>
                  </div>
                )}
              </div>
            </div>
          )}"""

replacement = """          <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500 opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
            <div className="flex items-center gap-2 text-rose-600 mb-3 relative z-10">
              <HeartPulse className="h-5 w-5" />
              <span className="font-black text-sm uppercase tracking-wider">ข้อมูลสุขภาพ / โรคประจำตัว / การแพ้</span>
            </div>
            <div className="relative z-10 space-y-3">
              <div>
                <span className="block text-xs font-bold text-rose-700/70 mb-1">การแพ้ยา</span>
                <p className="font-semibold text-rose-800">{student.allergicMedicine || '-'}</p>
              </div>
              <div>
                <span className="block text-xs font-bold text-rose-700/70 mb-1">การแพ้อาหาร</span>
                <p className="font-semibold text-rose-800">{student.allergicFood || '-'}</p>
              </div>
              <div>
                <span className="block text-xs font-bold text-rose-700/70 mb-1">โรคประจำตัว</span>
                <p className="font-semibold text-rose-800">{student.congenitalDisease || '-'}</p>
              </div>
              <div>
                <span className="block text-xs font-bold text-rose-700/70 mb-1">ข้อมูลอื่นๆ</span>
                <p className="font-semibold text-rose-800 whitespace-pre-wrap">{student.medicalInfo || '-'}</p>
              </div>
            </div>
          </div>"""

if target in content:
    content = content.replace(target, replacement)
    print("Replaced successfully")
else:
    print("Target not found")
    
with open('src/components/StudentDetailModal.tsx', 'w') as f:
    f.write(content)
