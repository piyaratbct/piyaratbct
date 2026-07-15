import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target1 = """              if (selectedMonth) {
                const assessmentForMonth = assessments.find(a => a.studentId === s.id && a.month === selectedMonth);
                if (assessmentForMonth && assessmentForMonth.weight !== undefined && assessmentForMonth.height !== undefined) {"""

replacement1 = """              if (selectedMonth) {
                const assessmentForMonth = assessments[s.id];
                if (assessmentForMonth && assessmentForMonth.weight !== undefined && assessmentForMonth.height !== undefined) {"""

content = content.replace(target1, replacement1)

target2 = """            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-sm outline-none bg-transparent font-bold text-pink-600 cursor-pointer w-full"
            />
          </div>"""

replacement2 = """            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-sm outline-none bg-transparent font-bold text-pink-600 cursor-pointer w-full"
            />
            {selectedMonth && activeTab === 'special-care' && (
              <button 
                onClick={() => setSelectedMonth('')}
                className="text-slate-400 hover:text-slate-600 flex-shrink-0 ml-1"
                title="ล้างการเลือกเดือน (ดูข้อมูลล่าสุด)"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>"""

content = content.replace(target2, replacement2)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
