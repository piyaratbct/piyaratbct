const fs = require('fs');
let code = fs.readFileSync('src/components/SubjectStructureManager.tsx', 'utf8');

// The handleSeedData function is declared BEFORE the state hooks. We need to move it after them.
const handleSeedDataStart = code.indexOf('const handleSeedData = async () => {');
const handleSeedDataEnd = code.indexOf('  const [subjects, setSubjects]') - 1; // It's currently right before the states

if (handleSeedDataStart !== -1 && handleSeedDataEnd !== -1) {
    const handleSeedDataCode = code.substring(handleSeedDataStart, handleSeedDataEnd);
    
    // Remove it from current location
    code = code.replace(handleSeedDataCode, '');
    
    // Find where to insert it (after the state declarations and useEffect)
    const insertPoint = code.indexOf('const fetchSubjects = async () => {');
    
    // Insert it
    code = code.substring(0, insertPoint) + handleSeedDataCode + code.substring(insertPoint);
    
    fs.writeFileSync('src/components/SubjectStructureManager.tsx', code);
    console.log("Moved handleSeedData function below state declarations");
} else {
    console.log("Could not find function bounds");
}
