const fs = require('fs');
const file = 'src/components/SARMonitoringDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = `สถิติจากบันทึกหลังสอนทั้งหมดในปีการศึกษา {systemAcademicYear}`;
const replace1 = `สถิติจากบันทึกหลัง{educationLevelFilter === 'kindergarten' ? 'การจัดประสบการณ์' : 'สอน'}ทั้งหมดในปีการศึกษา {systemAcademicYear}`;
content = content.replace(target1, replace1);

const target2 = `คุณครูสามารถติดแท็กได้ที่เมนู "เขียนบันทึกหลังสอน"`;
const replace2 = `คุณครูสามารถติดแท็กได้ที่เมนู "เขียนบันทึกหลัง{educationLevelFilter === 'kindergarten' ? 'การจัดประสบการณ์' : 'สอน'}"`;
content = content.replace(target2, replace2);

fs.writeFileSync(file, content);
