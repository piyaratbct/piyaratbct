const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Remove student360 from activeModule
content = content.replace(
  /"home" \| "teaching" \| "classroom" \| "academic" \| "analytics" \| "admin" \| "discipline" \| "admission" \| "student360"/g,
  '"home" | "teaching" | "classroom" | "academic" | "analytics" | "admin" | "discipline" | "admission"'
);

// Remove the button
const navRegex = /<button[\s\S]*?onClick=\{\(\) => setActiveModule\("student360"\)\}[\s\S]*?<\/button>/;
content = content.replace(navRegex, '');

// Remove the rendering logic
const renderRegex = /\) : activeModule === "student360" \? \([\s\S]*?<Student360 \/>[\s\S]*?/;
content = content.replace(renderRegex, '');

// Remove the import
content = content.replace('import { Student360 } from "./components/Student360";\n', '');
content = content.replace('import { Student360 } from "./components/Student360";', '');

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('App.tsx reverted');
