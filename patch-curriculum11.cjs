const fs = require('fs');
let content = fs.readFileSync('src/components/CurriculumManager.tsx', 'utf8');

const stateStr = `  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');`;
  
const newStateStr = `  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');`;

content = content.replace(stateStr, newStateStr);

const logicStr = `  const filteredCurriculums = curriculums.filter(c => {
    const matchesSearch = c.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (c.subjectCode && c.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()));
                          
    const getBaseGrade = (grade: string) => grade ? grade.split('/')[0].trim() : '';
    
    const matchesGrade = gradeFilter === 'all' || 
                         (c.gradeLevels && c.gradeLevels.some(g => getBaseGrade(g) === getBaseGrade(gradeFilter))) ||
                         c.gradeLevel === gradeFilter || 
                         getBaseGrade(c.gradeLevel) === getBaseGrade(gradeFilter);
                         
    const matchesType = typeFilter === 'all' ||
                        (typeFilter === 'activity' && c.subjectType === 'activity') ||
                        (typeFilter === 'basic' && (!c.subjectType || c.subjectType === 'academic') && (!c.academicCategory || c.academicCategory === 'basic')) ||
                        (typeFilter === 'additional' && (!c.subjectType || c.subjectType === 'academic') && c.academicCategory === 'additional');

    return matchesSearch && matchesGrade && matchesType;
  });`;
  
const newLogicStr = `  const filteredCurriculums = curriculums.filter(c => {
    const matchesSearch = c.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (c.subjectCode && c.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()));
                          
    const getBaseGrade = (grade: string) => grade ? grade.split('/')[0].trim() : '';
    
    const matchesGrade = gradeFilter === 'all' || 
                         (c.gradeLevels && c.gradeLevels.some(g => getBaseGrade(g) === getBaseGrade(gradeFilter))) ||
                         c.gradeLevel === gradeFilter || 
                         getBaseGrade(c.gradeLevel) === getBaseGrade(gradeFilter);
                         
    const matchesType = typeof typeFilter !== 'undefined' ? (
                        typeFilter === 'all' ||
                        (typeFilter === 'activity' && c.subjectType === 'activity') ||
                        (typeFilter === 'basic' && (!c.subjectType || c.subjectType === 'academic') && (!c.academicCategory || c.academicCategory === 'basic')) ||
                        (typeFilter === 'additional' && (!c.subjectType || c.subjectType === 'academic') && c.academicCategory === 'additional')
                        ) : true;

    return matchesSearch && matchesGrade && matchesType;
  });`;

content = content.replace(logicStr, newLogicStr);

const uiStr = `                <input 
                  type="text" 
                  placeholder="ค้นหารหัส หรือชื่อวิชา..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />`;
                
const newUiStr = `                <input 
                  type="text" 
                  placeholder="ค้นหารหัส หรือชื่อวิชา..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />`;

content = content.replace(uiStr, newUiStr);

fs.writeFileSync('src/components/CurriculumManager.tsx', content);
console.log("Fixed state variable names");
