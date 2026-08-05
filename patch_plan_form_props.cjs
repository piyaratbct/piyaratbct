const fs = require('fs');
let code = fs.readFileSync('src/components/LessonPlanForm.tsx', 'utf8');

const targetProps = `export function LessonPlanForm({
  teacherId,
  onSave,
  initialPlan,
  onCancel,
  currentUserRole,
  systemAcademicYear,
  systemSemester,
}: {
  teacherId: string;
  onSave: (plan: Omit<LessonPlan, "id" | "createdAt" | "updatedAt">) => void;
  initialPlan?: LessonPlan | null;
  onCancel?: () => void;
  currentUserRole?: string;
  systemAcademicYear: string;
  systemSemester: string;
}) {`;

const replacementProps = `export function LessonPlanForm({
  teacherId,
  onSave,
  initialPlan,
  onCancel,
  currentUserRole,
  currentUserName,
  systemAcademicYear,
  systemSemester,
}: {
  teacherId: string;
  onSave: (plan: Omit<LessonPlan, "id" | "createdAt" | "updatedAt">) => void;
  initialPlan?: LessonPlan | null;
  onCancel?: () => void;
  currentUserRole?: string;
  currentUserName?: string;
  systemAcademicYear: string;
  systemSemester: string;
}) {`;

code = code.replace(targetProps, replacementProps);
fs.writeFileSync('src/components/LessonPlanForm.tsx', code, 'utf8');
