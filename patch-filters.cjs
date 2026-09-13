const fs = require('fs');
let content = fs.readFileSync('src/components/CurriculumManager.tsx', 'utf8');

const filterStates = `  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');`;
  
const newFilterStates = `  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');`;

content = content.replace(filterStates, newFilterStates);

const filterLogic = `    const matchesGrade = gradeFilter === 'all' || 
                         (c.gradeLevels && c.gradeLevels.some(g => getBaseGrade(g) === getBaseGrade(gradeFilter))) ||
                         c.gradeLevel === gradeFilter || 
                         getBaseGrade(c.gradeLevel) === getBaseGrade(gradeFilter);

    return matchesSearch && matchesGrade;`;
    
const newFilterLogic = `    const matchesGrade = gradeFilter === 'all' || 
                         (c.gradeLevels && c.gradeLevels.some(g => getBaseGrade(g) === getBaseGrade(gradeFilter))) ||
                         c.gradeLevel === gradeFilter || 
                         getBaseGrade(c.gradeLevel) === getBaseGrade(gradeFilter);
                         
    const matchesType = typeFilter === 'all' ||
                        (typeFilter === 'activity' && c.subjectType === 'activity') ||
                        (typeFilter === 'basic' && (!c.subjectType || c.subjectType === 'academic') && (!c.academicCategory || c.academicCategory === 'basic')) ||
                        (typeFilter === 'additional' && (!c.subjectType || c.subjectType === 'academic') && c.academicCategory === 'additional');

    return matchesSearch && matchesGrade && matchesType;`;

content = content.replace(filterLogic, newFilterLogic);

const filterUI = `            <div className="flex gap-2">
              <select 
                value={gradeFilter}
                onChange={e => setGradeFilter(e.target.value)}
                className="w-1/3 p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
              >
                <option value="all">ทุกระดับชั้น</option>
                {BASE_GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="ค้นหารหัส หรือชื่อวิชา..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>`;

const newFilterUI = `            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <select 
                  value={gradeFilter}
                  onChange={e => setGradeFilter(e.target.value)}
                  className="w-1/2 p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                >
                  <option value="all">ทุกระดับชั้น</option>
                  {BASE_GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <select 
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  className="w-1/2 p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                >
                  <option value="all">ทุกประเภทวิชา</option>
                  <option value="basic">วิชาพื้นฐาน</option>
                  <option value="additional">วิชาเพิ่มเติม</option>
                  <option value="activity">กิจกรรมพัฒนาผู้เรียน</option>
                </select>
              </div>
              <div className="relative w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="ค้นหารหัส หรือชื่อวิชา..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>`;

content = content.replace(filterUI, newFilterUI);

fs.writeFileSync('src/components/CurriculumManager.tsx', content);
console.log("Patched CurriculumManager filters");
