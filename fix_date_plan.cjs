const fs = require('fs');

const file = 'src/components/LessonPlanForm.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add import
code = code.replace(/import \{ formatThaiDate \} from '\.\.\/lib\/dateUtils';/, "import { formatThaiDate, generateTeachingWeeksOptions } from '../lib/dateUtils';");

// Inside component
code = code.replace(/  const \[date, setDate\] = useState/, `  const teachingWeeks = generateTeachingWeeksOptions(systemAcademicYear);
  const [date, setDate] = useState`);

// Replace date initialization
code = code.replace(/setDate\(getTodayString\(\)\);/g, `setDate(teachingWeeks[0]);`);

// And in state init:
code = code.replace(/initialPlan\?\.date \|\| getTodayString\(\)/, `initialPlan?.date || teachingWeeks[0]`);

// Replace the input in JSX
code = code.replace(/<label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">\n\s*สัปดาห์\/วันที่สอน \(Date\)\n\s*<\/label>\n\s*<input\n\s*type="date"\n\s*required\n\s*value=\{date\}\n\s*onChange=\{\(e\) => setDate\(e\.target\.value\)\}\n\s*className="w-full px-3 py-1\.5 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"\n\s*title="วันที่สอน"\n\s*\/>/, 
`<label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              สัปดาห์ที่สอน
            </label>
            <select
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              title="สัปดาห์ที่สอน"
            >
              {!teachingWeeks.includes(date) && date && (
                 <option value={date}>{date}</option>
              )}
              {teachingWeeks.map(w => (
                 <option key={w} value={w}>{w}</option>
              ))}
            </select>`);

fs.writeFileSync(file, code, 'utf8');
