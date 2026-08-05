const fs = require('fs');
let code = fs.readFileSync('src/components/LessonPlanForm.tsx', 'utf8');

const targetState = `  const [evaluation, setEvaluation] = useState(initialPlan?.evaluation || "");`;
const replacementState = `  const [evaluation, setEvaluation] = useState(initialPlan?.evaluation || "");
  const [status, setStatus] = useState<LessonPlan['status']>(initialPlan?.status || "draft");
  const [approverComment, setApproverComment] = useState(initialPlan?.approverComment || "");
`;
code = code.replace(targetState, replacementState);

const targetPayload = `    const plan: LessonPlan = {
      id: initialPlan ? initialPlan.id : Date.now().toString(),
      teacherId,
      subject,
      customSubject: undefined, // Handled implicitly via subject string
      gradeLevel: selectedGrades.join(", "),
      title,
      coreIndicators,
      targetIndicators,
      competencies,
      objectives,
      activities,
      materials,
      evaluation,
      date,
      semester,
      attachments,
      status: initialPlan ? initialPlan.status : "draft",
      createdAt: initialPlan ? initialPlan.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };`;

const replacementPayload = `    const isApproverSave = (currentUserRole === "academic" || currentUserRole === "admin" || currentUserRole === "deputy") && initialPlan;
    const currentStatus = isApproverSave ? status : (initialPlan ? initialPlan.status : "draft");
    
    const plan: LessonPlan = {
      ...(initialPlan || {}),
      id: initialPlan ? initialPlan.id : Date.now().toString(),
      teacherId: initialPlan ? initialPlan.teacherId : teacherId,
      subject,
      customSubject: undefined, // Handled implicitly via subject string
      gradeLevel: selectedGrades.join(", "),
      title,
      coreIndicators,
      targetIndicators,
      competencies,
      objectives,
      activities,
      materials,
      evaluation,
      date,
      semester,
      attachments,
      status: currentStatus,
      approverComment: isApproverSave ? approverComment : (initialPlan?.approverComment || ""),
      approverId: (isApproverSave && (status === "approved" || status === "rejected")) ? (teacherId) : initialPlan?.approverId, // NOTE: wait, we only have teacherId passed from App as current user? NO, we just passed currentTeacherId in App.tsx?
      // Actually we didn't pass currentTeacherId directly, wait...
      createdAt: initialPlan ? initialPlan.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // For approver saving, we should set approver Name and Date
    if (isApproverSave && (status === 'approved' || status === 'rejected' || approverComment)) {
        // use teacherId as reviewer id since it's passed from App as currentTeacher.id initially
        // BUT wait, we fixed teacherId in App.tsx? NO! In App.tsx teacherId={currentTeacher.id}. 
        // So teacherId prop IS the current user!
        plan.approverId = teacherId;
        plan.approverName = currentUserName || "ผู้ประเมิน";
        plan.approverDate = new Date().toISOString();
    }`;

code = code.replace(targetPayload, replacementPayload);

fs.writeFileSync('src/components/LessonPlanForm.tsx', code, 'utf8');
