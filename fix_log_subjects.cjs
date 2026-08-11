const fs = require('fs');

function processFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  if (!code.includes('const [availableSubjects, setAvailableSubjects]')) {
    code = code.replace(/const \[subject, setSubject\] = useState<SubjectType>\('ภาษาไทย'\);/, `const [availableSubjects, setAvailableSubjects] = useState<string[]>(SUBJECTS);
  const [subject, setSubject] = useState<SubjectType>('ภาษาไทย');`);

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
    // Add import for query, collection, getDocs from firestore if not there, they might be there.
    code = code.replace(/  \/\/ Fetch saved lesson plans/, effectCode + "\n  // Fetch saved lesson plans");

    code = code.replace(/\{SUBJECTS\.filter\(s => s !== 'อื่นๆ'\)\.map\(\(sub\) => \(/g, 
                        `{availableSubjects.filter(s => s !== 'อื่นๆ' && s !== 'อื่น ๆ').map((sub) => (`);

    fs.writeFileSync(file, code, 'utf8');
  }
}

processFile('src/components/LessonLogForm.tsx');
