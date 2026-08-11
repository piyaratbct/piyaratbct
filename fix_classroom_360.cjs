const fs = require('fs');
let content = fs.readFileSync('src/components/ClassroomModule.tsx', 'utf8');

// 1. Top Tab Icon
// Right now it is:
// <span className="text-[14px] font-black leading-none shrink-0 tracking-tighter">360&deg;</span>
// <span className="whitespace-nowrap">Student 360°</span>
const tabIconRegex = /<span className="text-\[14px\] font-black leading-none shrink-0 tracking-tighter">360&deg;<\/span>\s*<span className="whitespace-nowrap">Student 360°<\/span>/;
const newTabIcon = `<User className="h-4 w-4 shrink-0" />\n              <span className="whitespace-nowrap">Student 360°</span>`;
if (content.match(tabIconRegex)) {
  content = content.replace(tabIconRegex, newTabIcon);
}

// 2. Button Icon magical gradient
const btnIconRegex = /<span className="text-\[10px\] font-black leading-none px-0\.5 tracking-tighter">360&deg;<\/span>/;
const newBtnIcon = `<span className="text-[10px] font-black leading-none px-0.5 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-cyan-500">360&deg;</span>`;
if (content.match(btnIconRegex)) {
  content = content.replace(btnIconRegex, newBtnIcon);
}

// 3. Make the button itself have magical background hover
const btnClassRegex = /className="p-1\.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"\s*title="ดูข้อมูล Student 360°"/;
const newBtnClass = `className="p-1.5 text-slate-400 hover:bg-fuchsia-50 rounded-lg transition-colors border border-transparent hover:border-fuchsia-100 shadow-sm"
                                title="ดูข้อมูล Student 360°"`;
if (content.match(btnClassRegex)) {
  content = content.replace(btnClassRegex, newBtnClass);
}

fs.writeFileSync('src/components/ClassroomModule.tsx', content, 'utf8');
console.log('ClassroomModule 360 update done.');
