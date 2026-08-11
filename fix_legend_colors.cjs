const fs = require('fs');

const fixFile = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(
    /<div className="w-2 h-2 rounded-full bg-slate-900"><\/div>5 = ดีเยี่ยม/g,
    '<div className="w-2 h-2 rounded-full bg-indigo-500"></div>5 = ดีเยี่ยม'
  );
  
  content = content.replace(
    /<div className="w-2 h-2 rounded-full bg-slate-500"><\/div>4 = ดีมาก/g,
    '<div className="w-2 h-2 rounded-full bg-blue-400"></div>4 = ดีมาก'
  );

  fs.writeFileSync(file, content, 'utf8');
};

fixFile('src/components/LessonLogForm.tsx');
fixFile('src/components/PBLLessonLogForm.tsx');

