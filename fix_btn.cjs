const fs = require('fs');
let code = fs.readFileSync('src/components/CurriculumManager.tsx', 'utf8');

const targetStr = `          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}`;

const replaceStr = `          <button 
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg font-bold shadow-sm hover:bg-indigo-100 transition-colors"
          >
            <Download className="h-4 w-4" /> โหลดไฟล์ตัวอย่าง (Excel)
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}`;

code = code.replace(targetStr, replaceStr);

fs.writeFileSync('src/components/CurriculumManager.tsx', code, 'utf8');
