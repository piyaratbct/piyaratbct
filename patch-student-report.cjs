const fs = require('fs');

let content = fs.readFileSync('src/components/StudentReportPrintTemplate.tsx', 'utf8');

// Ensure SchoolSubject is imported
if (!content.includes('SchoolSubject')) {
  content = content.replace(/import \{ Student, SubjectScore, SUBJECTS \} from "\.\.\/types";/, 'import { Student, SubjectScore, SUBJECTS, SchoolSubject } from "../types";');
}

// Add state for schoolSubjects
content = content.replace(/const \[isCompact, setIsCompact\] = useState\(false\);/, 
  'const [isCompact, setIsCompact] = useState(false);\n  const [schoolSubjects, setSchoolSubjects] = useState<SchoolSubject[]>([]);');

// Add fetch inside useEffect
content = content.replace(/if \(gradeLevel\) \{/, 
  `if (gradeLevel) {
      const fetchSubjects = async () => {
        try {
          const sq = query(collection(db, "schoolSubjects"), where("gradeLevel", "==", gradeLevel));
          const ssnap = await getDocs(sq);
          if (!ssnap.empty) {
            setSchoolSubjects(ssnap.docs.map(d => ({ id: d.id, ...d.data() } as SchoolSubject)));
          }
        } catch (e) {
          console.error("Error fetching school subjects", e);
        }
      };
      fetchSubjects();`);

// Replace the studentScores logic
content = content.replace(/\/\/ Collect scores for this student for all subjects[\s\S]*?const standardScores = studentScores\.filter/, 
`
        // Dynamic subject scoring if we have schoolSubjects set up
        let studentScores: any[] = [];
        
        if (schoolSubjects.length > 0) {
           const parentsAndStandalone = schoolSubjects.filter(s => s.isParent || (!s.isParent && !s.parentId)).sort((a, b) => a.subjectCode.localeCompare(b.subjectCode));
           studentScores = parentsAndStandalone.map(subjectDef => {
             if (subjectDef.isParent) {
                const children = schoolSubjects.filter(s => s.parentId === subjectDef.id);
                let totalScore = 0;
                let hasAnyScore = false;
                
                children.forEach(child => {
                  const key = \`\${student.id}_\${academicYear}_\${semester}_\${child.name}\`;
                  const scoreObj = scores[key];
                  if (scoreObj && scoreObj.totalScore !== undefined && scoreObj.totalScore !== null) {
                     totalScore += scoreObj.totalScore * ((child.weightPercentage || 0) / 100);
                     hasAnyScore = true;
                  }
                });
                
                const parentKey = \`\${student.id}_\${academicYear}_\${semester}_\${subjectDef.name}\`;
                const parentScoreObj = scores[parentKey];
                
                if (children.length === 0 && parentScoreObj) {
                  totalScore = parentScoreObj.totalScore || 0;
                  hasAnyScore = true;
                } else if (children.length > 0 && parentScoreObj && !hasAnyScore) {
                  totalScore = parentScoreObj.totalScore || 0;
                  hasAnyScore = true;
                }
                
                totalScore = Math.round(totalScore);
                let grade = "-";
                if (hasAnyScore) {
                  if (totalScore >= 80) grade = "4";
                  else if (totalScore >= 75) grade = "3.5";
                  else if (totalScore >= 70) grade = "3";
                  else if (totalScore >= 65) grade = "2.5";
                  else if (totalScore >= 60) grade = "2";
                  else if (totalScore >= 55) grade = "1.5";
                  else if (totalScore >= 50) grade = "1";
                  else if (totalScore > 0) grade = "0";
                }

                return {
                   subject: subjectDef.name,
                   totalScore: hasAnyScore ? totalScore : "-",
                   grade: hasAnyScore ? grade : "-"
                };
             } else {
                const key = \`\${student.id}_\${academicYear}_\${semester}_\${subjectDef.name}\`;
                const score = scores[key];
                return {
                  subject: subjectDef.name,
                  totalScore: score?.totalScore ?? "-",
                  grade: score?.grade || "-",
                };
             }
           });
        } else {
          // Collect scores for this student for all subjects
          studentScores = filteredSubjects.map((subject) => {
            const key = \`\${student.id}_\${academicYear}_\${semester}_\${subject}\`;
            const score = scores[key];
            return {
              subject,
              totalScore: score?.totalScore ?? "-",
              grade: score?.grade || "-",
            };
          });
        }

        const standardScores = studentScores.filter`);

// Ensure reduce handles "-"
content = content.replace(/const totalEarnedScore = standardScores\.reduce\(\(acc, curr\) => acc \+ curr\.totalScore, 0\);/, 
  'const totalEarnedScore = standardScores.reduce((acc, curr) => acc + (typeof curr.totalScore === "number" ? curr.totalScore : 0), 0);');

fs.writeFileSync('src/components/StudentReportPrintTemplate.tsx', content);

console.log("Patched StudentReportPrintTemplate");
