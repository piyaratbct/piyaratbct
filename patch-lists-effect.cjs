const fs = require('fs');

function addEffect(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('useEffect(() => {\n    if (initialSubject)')) {
    const effectStr = `  const [selectedGrade, setSelectedGrade] = useState<string>(initialGrade || "ทั้งหมด");
    
  React.useEffect(() => {
    if (initialSubject) setSelectedSubject(initialSubject);
    if (initialGrade) setSelectedGrade(initialGrade);
  }, [initialSubject, initialGrade]);`;
    
    content = content.replace('  const [selectedGrade, setSelectedGrade] = useState<string>(initialGrade || "ทั้งหมด");', effectStr);
    fs.writeFileSync(file, content);
    console.log("Added useEffect to", file);
  }
}

addEffect('src/components/LessonPlanList.tsx');
addEffect('src/components/LessonLogList.tsx');
