const fs = require('fs');
let content = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf8');

// The block starts from `const effectiveSettings = React.useMemo(() => {` at line 66 down to `  return () => { unsubscribe(); unsubLp(); };`
// I will just replace the entire first useEffect from line 46 to line 79.
const firstUseEffectClean = `  useEffect(() => {
    if (selectedSubject === 'กิจกรรมลูกเสือ') {
      const q = query(collection(db, 'schoolEvents'), where('type', '==', 'scout_camp'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        let attendees = new Set<string>();
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.attendeeIds) {
            data.attendeeIds.forEach((id: string) => attendees.add(id));
          }
        });
        setScoutCampAttendees(attendees);
      });
      return () => unsubscribe();
    }
  }, [selectedSubject]);`;

// Regex to replace the messy useEffect
content = content.replace(/  useEffect\(\(\) => \{\n    if \(selectedSubject === 'กิจกรรมลูกเสือ'\) \{[\s\S]*?  \}, \[selectedSubject\]\);/, firstUseEffectClean);

fs.writeFileSync('src/components/EvaluationModule.tsx', content);
