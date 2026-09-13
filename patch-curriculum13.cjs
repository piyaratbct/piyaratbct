const fs = require('fs');
let content = fs.readFileSync('src/components/CurriculumManager.tsx', 'utf8');

const importStr = "import { BookOpen, Search, Plus, Edit, Trash2, Upload, CheckCircle2, Circle, Loader2, Save, X, ChevronDown, ChevronRight, Download, AlertTriangle, CheckCircle } from 'lucide-react';";
const newImportStr = "import { BookOpen, Search, Plus, Edit, Trash2, Upload, CheckCircle2, Circle, Loader2, Save, X, ChevronDown, ChevronRight, Download, AlertTriangle, CheckCircle, Award } from 'lucide-react';";

content = content.replace(importStr, newImportStr);
fs.writeFileSync('src/components/CurriculumManager.tsx', content);
console.log("Fixed Award import correctly");
