const fs = require('fs');
let content = fs.readFileSync('src/components/CurriculumManager.tsx', 'utf8');

const importStr = "import { Plus, Edit, Trash2, Loader2, X, Upload, Download, CheckCircle, Search, Save, AlertTriangle, BookOpen } from 'lucide-react';";
const newImportStr = "import { Plus, Edit, Trash2, Loader2, X, Upload, Download, CheckCircle, Search, Save, AlertTriangle, BookOpen, Award } from 'lucide-react';";
content = content.replace(importStr, newImportStr);

const stateStr = `  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  
  const [innerTab, setInnerTab] = useState<'indicators' | 'structure'>('indicators');`;
  
const newStateStr = `  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const [innerTab, setInnerTab] = useState<'indicators' | 'structure'>('indicators');`;

content = content.replace(stateStr, newStateStr);

fs.writeFileSync('src/components/CurriculumManager.tsx', content);
console.log("Fixed typescript issues again");
