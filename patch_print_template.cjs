const fs = require('fs');
let code = fs.readFileSync('src/components/PrintTemplate.tsx', 'utf8');

const target1 = `                    {allowAcademicSignature && currentUser?.role !== 'teacher' && (`;
const replacement1 = `                    {allowAcademicSignature && (currentUser?.role === 'admin' || currentUser?.role === 'academic' || currentUser?.role === 'deputy') && (`;

const target2 = `                  allowAcademicSignature && currentUser?.role !== 'teacher' ? (`;
const replacement2 = `                  allowAcademicSignature && (currentUser?.role === 'admin' || currentUser?.role === 'academic' || currentUser?.role === 'deputy') ? (`;

code = code.replace(target1, replacement1);
code = code.replace(target2, replacement2);

fs.writeFileSync('src/components/PrintTemplate.tsx', code, 'utf8');
