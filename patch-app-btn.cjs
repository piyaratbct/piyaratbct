const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldAction = `                 } else if (action === 'logs') {
                   setTeachingInitialSubject(subject);
                   setTeachingInitialGrade(grade);
                   setActiveTab('dashboard');
                   setActiveModule('teaching');
                 }`;

const newAction = `                 } else if (action === 'logs') {
                   setTeachingInitialSubject(subject);
                   setTeachingInitialGrade(grade);
                   setActiveTab('dashboard');
                   setActiveModule('teaching');
                 } else if (action === 'attendance') {
                   setEvalInitialTab('attendance');
                   setEvalInitialSubject(subject);
                   setEvalInitialGrade(grade);
                   setActiveModule('analytics');
                 }`;

content = content.replace(oldAction, newAction);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx for attendance action");
