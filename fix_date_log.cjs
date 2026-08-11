const fs = require('fs');

const file = 'src/components/LessonLogForm.tsx';
let code = fs.readFileSync(file, 'utf8');

if(!code.includes('generateTeachingWeeksOptions')) {
  code = code.replace(/import \{ formatThaiDate \} from '\.\.\/lib\/dateUtils';/, "import { formatThaiDate, generateTeachingWeeksOptions } from '../lib/dateUtils';");
}

code = code.replace(/  const \[date, setDate\] = useState/, `  const teachingWeeks = generateTeachingWeeksOptions(systemAcademicYear);
  const [date, setDate] = useState`);

// Replace date initialization
code = code.replace(/setDate\(getTodayString\(\)\);/g, `setDate(teachingWeeks[0]);`);

// And in state init:
code = code.replace(/initialRecord\?\.date \|\| new Date\(\)\.toISOString\(\)\.slice\(0, 10\)/, `initialRecord?.date || teachingWeeks[0]`);

// Replace the input in JSX
code = code.replace(/<label className="block text-xs font-semibold text-slate-700 mb-1">\n\s*วันที่สอน\n\s*<\/label>\n\s*<input\n\s*type="date"\n\s*value=\{date\}\n\s*onChange=\{\(e\) => setDate\(e\.target\.value\)\}\n\s*className="w-full px-3 py-1\.5 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"\n\s*title="วันที่สอน"\n\s*\/>/, 
`<label className="block text-xs font-semibold text-slate-700 mb-1">
              สัปดาห์ที่สอน
            </label>
            <select
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
