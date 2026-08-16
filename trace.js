import fs from 'fs';
const file = 'src/components/ClassroomModule.tsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

for (let i = 1247; i < 1470; i++) {
  if (lines[i] && lines[i].includes('return (')) {
    console.log("Found return at", i + 1, ":", lines[i]);
  }
}
