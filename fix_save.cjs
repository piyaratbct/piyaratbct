const fs = require('fs');
let code = fs.readFileSync('src/components/LessonPlanForm.tsx', 'utf8');

const oldPlanObj = `    const plan: LessonPlan = {
      id: initialPlan ? initialPlan.id : Date.now().toString(),
      teacherId,
      subject,
      customSubject: undefined, // Handled implicitly via subject string
      gradeLevel: selectedGrades.join(", "),
      title,
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

const newPlanObj = `    const plan: LessonPlan = {
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

code = code.replace(oldPlanObj, newPlanObj);
fs.writeFileSync('src/components/LessonPlanForm.tsx', code, 'utf8');
