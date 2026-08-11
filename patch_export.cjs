const fs = require('fs');
let content = fs.readFileSync('src/components/Student360.tsx', 'utf8');

// Add imports
content = content.replace(
  "Award, AlertCircle, Calendar, Droplets",
  "Award, AlertCircle, Calendar, Droplets, Download, ChevronDown, Printer, FileJson"
);

// Add export menu state
content = content.replace(
  'const [activeTab, setActiveTab] = useState<"academic" | "health" | "behavior" | "pastoral">("academic");',
  'const [activeTab, setActiveTab] = useState<"academic" | "health" | "behavior" | "pastoral">("academic");\n  const [showExportMenu, setShowExportMenu] = useState(false);'
);

// Add export functions
const exportFunctions = `
  const handleExportJSON = () => {
    if (!student) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(student, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", \`student_\${student.studentId}_\${student.firstName}.json\`);
    document.body.appendChild(downloadAnchorNode); 
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleExportPDF = () => {
    window.print();
  };
`;

content = content.replace(
  'const student = extendedStudents.find(s => s.id === selectedStudentId);',
  'const student = extendedStudents.find(s => s.id === selectedStudentId);\n' + exportFunctions
);

// Update Header
const oldHeader = `<div className="relative max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="ค้นหาชื่อ, นามสกุล หรือรหัสนักเรียน..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
          />
          {searchTerm && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden z-20">
              {filteredStudents.length > 0 ? (
                <ul className="max-h-60 overflow-y-auto p-2 space-y-1">
                  {filteredStudents.map(s => (
                    <li 
                      key={s.id}
                      onClick={() => {
                        setSelectedStudentId(s.id);
                        setSearchTerm("");
                      }}
                      className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{s.firstName} {s.lastName} ({s.nickname})</p>
                        <p className="text-[10px] text-slate-500">รหัส: {s.studentId} | ชั้น: {s.grade}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-sm text-slate-500">ไม่พบรายชื่อนักเรียน</div>
              )}
            </div>
          )}
        </div>`;

const newHeader = `<div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto flex-1 justify-end">
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="ค้นหาชื่อ, นามสกุล หรือรหัสนักเรียน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
            />
            {searchTerm && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden z-20">
                {filteredStudents.length > 0 ? (
                  <ul className="max-h-60 overflow-y-auto p-2 space-y-1">
                    {filteredStudents.map(s => (
                      <li 
                        key={s.id}
                        onClick={() => {
                          setSelectedStudentId(s.id);
                          setSearchTerm("");
                        }}
                        className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{s.firstName} {s.lastName} ({s.nickname})</p>
                          <p className="text-[10px] text-slate-500">รหัส: {s.studentId} | ชั้น: {s.grade}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-sm text-slate-500">ไม่พบรายชื่อนักเรียน</div>
                )}
              </div>
            )}
          </div>
          
          {student && (
            <div className="relative w-full md:w-auto z-10">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all font-bold text-sm whitespace-nowrap shadow-sm"
              >
                <Download className="w-4 h-4 text-indigo-500" />
                ส่งออกข้อมูล
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
              
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button 
                    onClick={() => {
                      handleExportPDF();
                      setShowExportMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors text-left"
                  >
                    <Printer className="w-4 h-4 text-indigo-400" />
                    ส่งออกเป็น PDF (พิมพ์)
                  </button>
                  <button 
                    onClick={() => {
                      handleExportJSON();
                      setShowExportMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors text-left border-t border-slate-100"
                  >
                    <FileJson className="w-4 h-4 text-indigo-400" />
                    ส่งออกเป็น JSON
                  </button>
                </div>
              )}
            </div>
          )}
        </div>`;

content = content.replace(oldHeader, newHeader);

fs.writeFileSync('src/components/Student360.tsx', content, 'utf8');
console.log('Export button added');
