const fs = require('fs');

const fixFile = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Fix Teacher
  content = content.replace(
    /bg-slate-900 text-white shadow-md shadow-indigo-200/g,
    'bg-pink-500 text-white shadow-md shadow-pink-200'
  );
  content = content.replace(
    /<div className="w-1\.5 h-4 bg-slate-900 rounded-full"><\/div>/g,
    '<div className="w-1.5 h-4 bg-pink-500 rounded-full"></div>'
  );
  content = content.replace(
    /bg-slate-50 border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800 hover:bg-slate-100/g,
    'bg-slate-50 border border-slate-200 text-slate-500 hover:border-pink-300 hover:text-pink-600 hover:bg-pink-50'
  );

  // Fix Learner
  content = content.replace(
    /bg-slate-500 text-white shadow-md shadow-blue-200/g,
    'bg-sky-500 text-white shadow-md shadow-sky-200'
  );
  content = content.replace(
    /<div className="w-1\.5 h-4 bg-slate-500 rounded-full"><\/div>\n\s*ด้านผู้เรียน/g,
    '<div className="w-1.5 h-4 bg-sky-500 rounded-full"></div>\n                  ด้านผู้เรียน'
  );
  content = content.replace(
    /bg-slate-50 border border-slate-200 text-slate-500 hover:border-blue-300 hover:text-slate-600 hover:bg-slate-50/g,
    'bg-slate-50 border border-slate-200 text-slate-500 hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50'
  );

  // Fix legends if they have slate-900 / slate-500 (but they are 5, 4, 3, 2, 1 and should not be changed, or maybe we want them to reflect the same scores? The scores use default colors across all sections. Oh wait! The scores 5=ดีเยี่ยม 4=ดีมาก 3=ดี 2=พอใช้ 1=ปรับปรุง use slate-900, slate-500, emerald-500, amber-500, rose-500. Are they tied to the sections? No, they are tied to the scores themselves!)
  // If the user meant "แก้ไขการใส่สีในการประเมินในด้านผู้สอนและด้านผู้เรียน ไม่ขอสีเข้มแบบนี้"
  // It means they just want the section color to be different. The section color is used when a score is selected in that section.
  
  fs.writeFileSync(file, content, 'utf8');
};

fixFile('src/components/LessonLogForm.tsx');
fixFile('src/components/PBLLessonLogForm.tsx');

