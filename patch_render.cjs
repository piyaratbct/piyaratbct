const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');

const renderCode = `
        ) : activeModule === "student360" ? (
          <Student360 />
`;

const insertBefore = `        ) : activeModule === "admin" ? (`;

if (content.includes(insertBefore)) {
  const newContent = content.replace(insertBefore, renderCode + insertBefore);
  fs.writeFileSync('src/App.tsx', newContent, 'utf8');
  console.log('Render patched');
} else {
  console.log('Target not found');
}
