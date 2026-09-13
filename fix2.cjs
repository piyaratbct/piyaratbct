const fs = require('fs');
let content = fs.readFileSync('src/components/SubjectChildManager.tsx', 'utf8');

const badStart = "      </div>\n      )}\n      \n      {activeTab === 'aggregation' && (";
const showForm = "{showForm && (";
const startIndex = content.indexOf(badStart);
const endIndex = content.indexOf(showForm, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + content.substring(endIndex);
  fs.writeFileSync('src/components/SubjectChildManager.tsx', content);
  console.log("Removed bad block");
} else {
  console.log("Not found");
}
