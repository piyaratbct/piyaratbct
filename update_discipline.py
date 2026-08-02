import re

with open('src/components/DisciplineModule.tsx', 'r') as f:
    content = f.read()

# Add imports
content = content.replace(
    "Edit, ShieldAlert, PlusCircle, Search, FileText, UserX, AlertTriangle, User, Calendar, Save, Trash2, X, Clock",
    "Edit, ShieldAlert, PlusCircle, Search, FileText, UserX, AlertTriangle, User, Calendar, Save, Trash2, X, Clock, Printer"
)

content = content.replace(
    "import { formatThaiMonthYear, formatThaiDate } from '../lib/dateUtils';",
    "import { formatThaiMonthYear, formatThaiDate } from '../lib/dateUtils';\nimport { DisciplineSemesterReportPrintTemplate } from './DisciplineSemesterReportPrintTemplate';"
)

# Add state
state_match = re.search(r'const \[searchQuery, setSearchQuery\] = useState\(\'\'\);', content)
if state_match:
    content = content[:state_match.end()] + '\n  const [showPrintReport, setShowPrintReport] = useState(false);' + content[state_match.end():]

# Add button
button_html = """        <div className="relative z-10 w-full md:w-auto flex flex-col md:flex-row gap-3">
          <button
            onClick={() => setShowPrintReport(true)}
            className="w-full md:w-auto bg-white hover:bg-slate-50 text-rose-600 px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all border border-rose-100"
          >
            <Printer className="h-5 w-5" />
            สรุปผลภาคเรียน
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="w-full md:w-auto bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all border border-white/30"
          >
            <PlusCircle className="h-5 w-5" />
            บันทึกเหตุการณ์ใหม่
          </button>
        </div>"""

content = re.sub(
    r'<div className="relative z-10 w-full md:w-auto">\s*<button\s*onClick=\{\(\) => setShowForm\(true\)\}\s*className="w-full md:w-auto bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all border border-white/30"\s*>\s*<PlusCircle className="h-5 w-5" />\s*บันทึกเหตุการณ์ใหม่\s*</button>\s*</div>',
    button_html,
    content
)

# Add template to bottom of return
template_html = """      {showPrintReport && (
        <DisciplineSemesterReportPrintTemplate
          incidents={incidents}
          academicYear={systemAcademicYear}
          semester={systemSemester}
          onClose={() => setShowPrintReport(false)}
        />
      )}
    </div>
  );"""

content = re.sub(r'</div>\s*\);\s*}\s*$', template_html + '\n}', content)

with open('src/components/DisciplineModule.tsx', 'w') as f:
    f.write(content)
