const fs = require('fs');
let code = fs.readFileSync('src/components/LessonPlanForm.tsx', 'utf8');

// The incorrect part:
// const [title,
//       coreIndicators,
//       targetIndicators, setTitle] = useState("");
// const [coreIndicators, setCoreIndicators] = useState("");
// const [targetIndicators, setTargetIndicators] = useState("");

code = code.replace(
  'const [title,\n      coreIndicators,\n      targetIndicators, setTitle] = useState("");',
  'const [title, setTitle] = useState("");'
);

fs.writeFileSync('src/components/LessonPlanForm.tsx', code, 'utf8');
