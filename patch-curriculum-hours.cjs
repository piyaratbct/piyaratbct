const fs = require('fs');

const files = [
  'src/components/CurriculumManager.tsx',
  'src/components/UnifiedCurriculumManager.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
      'โครงสร้างเวลาเรียน (ชั่วโมง / เทอม)',
      'โครงสร้างเวลาเรียน (ชั่วโมง / ปีการศึกษา)'
    );
    fs.writeFileSync(file, content);
    console.log(`Patched ${file}`);
  }
});
