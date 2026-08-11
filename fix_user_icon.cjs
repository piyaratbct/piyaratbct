const fs = require('fs');
let content = fs.readFileSync('src/components/ClassroomModule.tsx', 'utf8');

if (!content.includes('User,')) {
  content = content.replace('Users,', 'Users,\n  User,');
  fs.writeFileSync('src/components/ClassroomModule.tsx', content, 'utf8');
  console.log('Added User icon import');
}
