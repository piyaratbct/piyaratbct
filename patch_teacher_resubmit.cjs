const fs = require('fs');
let code = fs.readFileSync('src/components/LessonPlanForm.tsx', 'utf8');

const target = `    const isApproverSave = (currentUserRole === "academic" || currentUserRole === "admin" || currentUserRole === "deputy") && initialPlan;
    const currentStatus = isApproverSave ? status : (initialPlan ? initialPlan.status : "draft");`;

const replacement = `    const isApproverSave = (currentUserRole === "academic" || currentUserRole === "admin" || currentUserRole === "deputy") && initialPlan;
    
    // Determine the status. If a teacher edits a rejected plan, automatically resubmit it.
    let currentStatus = isApproverSave ? status : (initialPlan ? initialPlan.status : "draft");
    if (!isApproverSave && initialPlan && initialPlan.status === "rejected") {
      currentStatus = "submitted"; // Reset to submitted when teacher updates
    }`;

code = code.replace(target, replacement);

const target2 = `      approverComment: isApproverSave ? approverComment : (initialPlan?.approverComment || ""),`;
const replacement2 = `      approverComment: isApproverSave ? approverComment : (initialPlan?.status === "rejected" ? "" : (initialPlan?.approverComment || "")),`;
code = code.replace(target2, replacement2);

fs.writeFileSync('src/components/LessonPlanForm.tsx', code, 'utf8');
