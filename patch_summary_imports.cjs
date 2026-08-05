const fs = require('fs');
let code = fs.readFileSync('src/components/AttendanceSummary.tsx', 'utf8');

code = code.replace(
  "import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';",
  "import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';"
);
code = code.replace(
  "import { CalendarDays, Clock, CheckCircle2, XCircle, AlertCircle, HelpCircle, FileText, Users, Loader2 } from 'lucide-react';",
  "import { CalendarDays, Clock, CheckCircle2, XCircle, AlertCircle, HelpCircle, FileText, Users, Loader2, Edit3, Trash2 } from 'lucide-react';"
);
code = code.replace(
  "import { AttendanceStudentCumulative } from './AttendanceStudentCumulative';",
  "import { AttendanceStudentCumulative } from './AttendanceStudentCumulative';\nimport { AttendanceTracking } from './AttendanceTracking';"
);

fs.writeFileSync('src/components/AttendanceSummary.tsx', code, 'utf8');
