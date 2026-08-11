const fs = require('fs');
let content = fs.readFileSync('src/components/ClassroomModule.tsx', 'utf8');

if (!content.includes('const [selectedStudent360')) {
  content = content.replace(
    /const \[activeTab, setActiveTab\] = useState[^;]*;/g,
    match => match + '\n  const [selectedStudent360, setSelectedStudent360] = useState<Student | null>(null);'
  );
  fs.writeFileSync('src/components/ClassroomModule.tsx', content, 'utf8');
  console.log('Fixed state');
} else {
  console.log('Already has state');
}
