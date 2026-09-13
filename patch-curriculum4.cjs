const fs = require('fs');
let content = fs.readFileSync('src/components/CurriculumManager.tsx', 'utf8');

content = content.replace(/{ code: 'ข้อ 1', description: 'รักชาติ ศาสน์ กษัตริย์', type: 'core' }/g, "{ id: Date.now().toString() + Math.random().toString(), code: 'ข้อ 1', description: 'รักชาติ ศาสน์ กษัตริย์', type: 'core' }");
content = content.replace(/{ code: 'ข้อ 2', description: 'ซื่อสัตย์สุจริต', type: 'core' }/g, "{ id: Date.now().toString() + Math.random().toString(), code: 'ข้อ 2', description: 'ซื่อสัตย์สุจริต', type: 'core' }");
content = content.replace(/{ code: 'ข้อ 3', description: 'มีวินัย', type: 'core' }/g, "{ id: Date.now().toString() + Math.random().toString(), code: 'ข้อ 3', description: 'มีวินัย', type: 'core' }");
content = content.replace(/{ code: 'ข้อ 4', description: 'ใฝ่เรียนรู้', type: 'core' }/g, "{ id: Date.now().toString() + Math.random().toString(), code: 'ข้อ 4', description: 'ใฝ่เรียนรู้', type: 'core' }");
content = content.replace(/{ code: 'ข้อ 5', description: 'อยู่อย่างพอเพียง', type: 'core' }/g, "{ id: Date.now().toString() + Math.random().toString(), code: 'ข้อ 5', description: 'อยู่อย่างพอเพียง', type: 'core' }");
content = content.replace(/{ code: 'ข้อ 6', description: 'มุ่งมั่นในการทำงาน', type: 'core' }/g, "{ id: Date.now().toString() + Math.random().toString(), code: 'ข้อ 6', description: 'มุ่งมั่นในการทำงาน', type: 'core' }");
content = content.replace(/{ code: 'ข้อ 7', description: 'รักความเป็นไทย', type: 'core' }/g, "{ id: Date.now().toString() + Math.random().toString(), code: 'ข้อ 7', description: 'รักความเป็นไทย', type: 'core' }");
content = content.replace(/{ code: 'ข้อ 8', description: 'มีจิตสาธารณะ', type: 'core' }/g, "{ id: Date.now().toString() + Math.random().toString(), code: 'ข้อ 8', description: 'มีจิตสาธารณะ', type: 'core' }");

content = content.replace(/{ code: 'ข้อ 1', description: 'ความสามารถในการสื่อสาร', type: 'core' }/g, "{ id: Date.now().toString() + Math.random().toString(), code: 'ข้อ 1', description: 'ความสามารถในการสื่อสาร', type: 'core' }");
content = content.replace(/{ code: 'ข้อ 2', description: 'ความสามารถในการคิด', type: 'core' }/g, "{ id: Date.now().toString() + Math.random().toString(), code: 'ข้อ 2', description: 'ความสามารถในการคิด', type: 'core' }");
content = content.replace(/{ code: 'ข้อ 3', description: 'ความสามารถในการแก้ปัญหา', type: 'core' }/g, "{ id: Date.now().toString() + Math.random().toString(), code: 'ข้อ 3', description: 'ความสามารถในการแก้ปัญหา', type: 'core' }");
content = content.replace(/{ code: 'ข้อ 4', description: 'ความสามารถในการใช้ทักษะชีวิต', type: 'core' }/g, "{ id: Date.now().toString() + Math.random().toString(), code: 'ข้อ 4', description: 'ความสามารถในการใช้ทักษะชีวิต', type: 'core' }");
content = content.replace(/{ code: 'ข้อ 5', description: 'ความสามารถในการใช้เทคโนโลยี', type: 'core' }/g, "{ id: Date.now().toString() + Math.random().toString(), code: 'ข้อ 5', description: 'ความสามารถในการใช้เทคโนโลยี', type: 'core' }");

if (!content.includes('import {') || !content.includes('Award')) {
  content = content.replace(/import { Plus, Edit, Trash2, Loader2, X, Upload, Download, CheckCircle, Search, Save, AlertTriangle, BookOpen } from 'lucide-react';/g, "import { Plus, Edit, Trash2, Loader2, X, Upload, Download, CheckCircle, Search, Save, AlertTriangle, BookOpen, Award } from 'lucide-react';");
}

fs.writeFileSync('src/components/CurriculumManager.tsx', content);
console.log("Fixed typescript issues");
