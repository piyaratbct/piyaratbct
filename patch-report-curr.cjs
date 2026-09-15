const fs = require('fs');
let code = fs.readFileSync('src/components/LearningHoursReport.tsx', 'utf8');

const regex = /relevantCurriculums\.forEach\(curr => \{\s*if \(\!curr\.subjectName \|\| curr\.isParent\) return; \/\/ Skip parent subjects/;
const replacement = `relevantCurriculums.forEach(curr => {
      if (!curr.subjectName) return;
      // If the subject is a child subject (has parentId), skip it here because its targets and progress will be aggregated into the Parent Subject.
      if (curr.parentId) return;`;

if (code.match(/relevantCurriculums\.forEach\(curr => \{\s*if \(\!curr\.subjectName/)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/components/LearningHoursReport.tsx', code);
    console.log("Patched curriculum loop in LearningHoursReport.tsx");
} else {
    console.log("Could not find regex in LearningHoursReport");
}
