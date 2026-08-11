const fs = require('fs');

function processFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  if (!code.includes('const [availableSubjects, setAvailableSubjects]')) {
    code = code.replace(/const \[subject, setSubject\] = useState/, `const [availableSubjects, setAvailableSubjects] = useState<string[]>(SUBJECTS);
  const [subject, setSubject] = useState`);

    const effectCode = `
  useEffect(() => {
    const fetchAvailableSubjects = async () => {
      try {
        const q = query(collection(db, 'curriculums'));
        const snapshot = await getDocs(q);
        const subjects = new Set(SUBJECTS);
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.subjectName) {
            subjects.add(data.subjectName);
          }
        });
        setAvailableSubjects(Array.from(subjects));
      } catch (error) {
        console.error("Error fetching available subjects", error);
      }
    };
    fetchAvailableSubjects();
  }, []);
`;
    code = code.replace(/  useEffect\(\(\) => \{\n    const fetchCurriculumData/, effectCode + "\n  useEffect(() => {\n    const fetchCurriculumData");

    code = code.replace(/\{SUBJECTS\.filter\(s => s !== 'อื่นๆ' && s !== 'อื่น ๆ'\)\.map\(\(s\) => \(/g, 
                        `{availableSubjects.filter(s => s !== 'อื่นๆ' && s !== 'อื่น ๆ').map((s) => (`);

    fs.writeFileSync(file, code, 'utf8');
  }
}

processFile('src/components/LessonPlanForm.tsx');
// PBLLessonPlanForm has a fixed subject "บูรณาการ (PBL)", it doesn't need this datalist change because it's hardcoded. Wait, does PBL use subject "บูรณาการ (PBL)" for curriculum?
