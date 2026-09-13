const fs = require('fs');
let content = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf8');

const getSubjectTypeStr = `  const selectedSubjectType = React.useMemo(() => {
    const subj = fetchedAvailableSubjects.find(s => {
      if (typeof s === 'string') return s === selectedSubject;
      if (s.type === 'single') return s.name === selectedSubject;
      if (s.type === 'group') return s.subjects.includes(selectedSubject);
      return false;
    });
    // In our implementation, we didn't add subjectType to the dropdown data yet
    // Let's modify useAvailableSubjects to include the raw subject data or type
    // But for now, let's just check if it's 'กิจกรรมลูกเสือ', 'แนะแนว', 'ชุมนุม', etc.
    return (selectedSubject.includes('กิจกรรม') || selectedSubject.includes('ลูกเสือ') || selectedSubject.includes('ชุมนุม') || selectedSubject.includes('แนะแนว')) ? 'activity' : 'academic';
  }, [selectedSubject, fetchedAvailableSubjects]);`;
  
const newGetSubjectTypeStr = `  const selectedSubjectType = React.useMemo(() => {
    const subj = fetchedAvailableSubjects.find(s => {
      if (typeof s === 'string') return s === selectedSubject;
      if (s.type === 'single') return s.name === selectedSubject;
      if (s.type === 'group') return s.subjects.includes(selectedSubject);
      return false;
    });
    
    if (subj && subj.subjectType) {
      return subj.subjectType;
    }
    
    // Fallback logic
    return (selectedSubject.includes('กิจกรรม') || selectedSubject.includes('ลูกเสือ') || selectedSubject.includes('ชุมนุม') || selectedSubject.includes('แนะแนว')) ? 'activity' : 'academic';
  }, [selectedSubject, fetchedAvailableSubjects]);`;

content = content.replace(getSubjectTypeStr, newGetSubjectTypeStr);
fs.writeFileSync('src/components/EvaluationModule.tsx', content);
console.log("Patched eval 2");
