const fs = require('fs');
let code = fs.readFileSync('src/components/LessonPlanList.tsx', 'utf8');

const targetImport = `import { LessonPlan, SUBJECTS, GRADE_LEVELS, Teacher } from "../types";`;
const replacementImport = `import { LessonPlan, SUBJECTS, GRADE_LEVELS, Teacher, LessonRecord } from "../types";`;
code = code.replace(targetImport, replacementImport);

const targetProps = `interface LessonPlanListProps {
  plans: LessonPlan[];
  teachers?: Teacher[];
  showTeacherFilter?: boolean;`;
const replacementProps = `interface LessonPlanListProps {
  plans: LessonPlan[];
  records?: LessonRecord[]; // added for comparison
  teachers?: Teacher[];
  showTeacherFilter?: boolean;`;
code = code.replace(targetProps, replacementProps);

const targetComponent = `export function LessonPlanList({
  plans,
  teachers,
  showTeacherFilter = false,
  currentUserRole,
  currentTeacherId,
  onEdit,
  onDelete,
  onPrintPreview,
}: LessonPlanListProps) {`;
const replacementComponent = `export function LessonPlanList({
  plans,
  records = [],
  teachers,
  showTeacherFilter = false,
  currentUserRole,
  currentTeacherId,
  onEdit,
  onDelete,
  onPrintPreview,
}: LessonPlanListProps) {`;
code = code.replace(targetComponent, replacementComponent);

fs.writeFileSync('src/components/LessonPlanList.tsx', code, 'utf8');
