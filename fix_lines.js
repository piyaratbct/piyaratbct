import fs from 'fs';
const file = 'src/components/ClassroomModule.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

// Clear lines 1452, 1453, 1456, 1457
lines[1452] = '';
lines[1453] = '';
lines[1456] = '';
lines[1457] = '';

// Filter out empty strings
lines = lines.filter((l, i) => i !== 1452 && i !== 1453 && i !== 1456 && i !== 1457);

fs.writeFileSync(file, lines.join('\n'));
console.log("Deleted extra lines!");
