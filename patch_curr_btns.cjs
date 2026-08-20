const fs = require('fs');
let content = fs.readFileSync('src/components/CurriculumManager.tsx', 'utf8');

const searchTopBtns = `<div className="flex gap-2">
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".xlsx, .xls" 
            className="hidden" 
          />
          <button 
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg font-bold shadow-sm hover:bg-indigo-100 transition-colors"
          >
            <Download className="h-4 w-4" /> โหลดไฟล์ตัวอย่าง (Excel)
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} 
            {isImporting ? 'กำลังนำเข้า...' : 'นำเข้าตัวชี้วัด (Excel)'}
          </button>
          <button 
            onClick={() => {
              setEditingSubject({ gradeLevel: GRADE_LEVELS[0], subjectName: SUBJECTS[0] });
              setShowSubjectForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" /> เพิ่มรายวิชา
          </button>
        </div>`;

const replacementTopBtns = `{canEdit && (
        <div className="flex gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".xlsx, .xls" 
            className="hidden" 
          />
          <button 
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg font-bold shadow-sm hover:bg-indigo-100 transition-colors"
          >
            <Download className="h-4 w-4" /> โหลดไฟล์ตัวอย่าง (Excel)
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} 
            {isImporting ? 'กำลังนำเข้า...' : 'นำเข้าตัวชี้วัด (Excel)'}
          </button>
          <button 
            onClick={() => {
              setEditingSubject({ gradeLevel: GRADE_LEVELS[0], subjectName: SUBJECTS[0] });
              setShowSubjectForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" /> เพิ่มรายวิชา
          </button>
        </div>
        )}`;

if (content.includes(searchTopBtns)) {
    content = content.replace(searchTopBtns, replacementTopBtns);
    console.log("Top buttons patched.");
    fs.writeFileSync('src/components/CurriculumManager.tsx', content);
} else {
    console.log("Could not find top buttons string.");
}
