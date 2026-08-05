const fs = require('fs');
let code = fs.readFileSync('src/components/AttendanceSummary.tsx', 'utf8');

const stateTarget = `  const [viewMode, setViewMode] = useState<'daily' | 'cumulative'>('daily');`;
const stateReplace = `  const [viewMode, setViewMode] = useState<'daily' | 'cumulative'>('daily');
  const [editingSession, setEditingSession] = useState<AttendanceSession | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);`;
code = code.replace(stateTarget, stateReplace);

const effectTarget = `  }, [selectedGrade, selectedDate, viewMode, systemAcademicYear, systemSemester]);`;
const effectReplace = `  }, [selectedGrade, selectedDate, viewMode, systemAcademicYear, systemSemester, refreshTrigger]);`;
code = code.replace(effectTarget, effectReplace);

fs.writeFileSync('src/components/AttendanceSummary.tsx', code, 'utf8');
