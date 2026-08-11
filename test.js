const fs = require('fs');
const content = fs.readFileSync('src/components/ClassroomModule.tsx', 'utf8');

const m1 = '{activeTab === "special-care" && (() => {';
const m2 = '        {/* Assessment Modal/Form Overlay */}';

const i1 = content.indexOf(m1);
const i2 = content.indexOf(m2);

console.log("Index 1:", i1, "Index 2:", i2);

if (i1 > 0 && i2 > 0) {
    const extracted = content.substring(i1, i2);
    fs.writeFileSync('extracted_old_health.tsx', extracted, 'utf8');
}
