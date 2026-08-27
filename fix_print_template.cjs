const fs = require('fs');
let code = fs.readFileSync('src/components/LessonPlanPrintTemplate.tsx', 'utf8');

const replacement = `
  const showIndicators = !plan.isKindergarten && (plan.coreIndicators || plan.targetIndicators);
  const showCompetencies = Boolean(plan.competencies);

  let currentStep = 2;
  const indicatorsStep = showIndicators ? currentStep++ : null;
  const competenciesStep = showCompetencies ? currentStep++ : null;
  const objectivesStep = currentStep++;
  const activitiesStep = currentStep++;
  const materialsStep = currentStep++;
  const evaluationStep = currentStep++;

  return (
`;

code = code.replace(/  return \(\n\s*<PDFPrintHelper/g, replacement + '    <PDFPrintHelper');

// 1. Hide the Indicators section for Kindergarten
code = code.replace(
  /\{\(plan\.coreIndicators \|\| plan\.targetIndicators\) && \(/g,
  '{showIndicators && ('
);
code = code.replace(
  /2\. มาตรฐานการเรียนรู้และตัวชี้วัด/g,
  '{indicatorsStep}. มาตรฐานการเรียนรู้และตัวชี้วัด'
);

// 2. Fix Competencies numbering
code = code.replace(
  /\{\(plan\.coreIndicators \|\| plan\.targetIndicators\) \? '3\.' : '2\.'\} สมรรถนะสำคัญ/g,
  '{competenciesStep}. สมรรถนะสำคัญ'
);

// 3. Fix Objectives numbering
code = code.replace(
  /\{(\(\(plan\.coreIndicators \|\| plan\.targetIndicators\) && plan\.competencies\) \? '4\.' : \(\(plan\.coreIndicators \|\| plan\.targetIndicators\) \|\| plan\.competencies\) \? '3\.' : '2\.')\} \{plan\.isKindergarten \? "จุดประสงค์การจัดประสบการณ์" : "จุดประสงค์การเรียนรู้ \(Objectives\)"\}/g,
  '{objectivesStep}. {plan.isKindergarten ? "จุดประสงค์การจัดประสบการณ์" : "จุดประสงค์การเรียนรู้ (Objectives)"}'
);

// 4. Fix Activities numbering (Kindergarten)
code = code.replace(
  /\{(\(\(plan\.coreIndicators \|\| plan\.targetIndicators\) && plan\.competencies\) \? '5\.' : \(\(plan\.coreIndicators \|\| plan\.targetIndicators\) \|\| plan\.competencies\) \? '4\.' : '3\.')\} การจัดประสบการณ์ 6 กิจกรรมหลัก/g,
  '{activitiesStep}. การจัดประสบการณ์ 6 กิจกรรมหลัก'
);

// 5. Fix Activities numbering (Normal)
code = code.replace(
  /\{(\(\(plan\.coreIndicators \|\| plan\.targetIndicators\) && plan\.competencies\) \? '5\.' : \(\(plan\.coreIndicators \|\| plan\.targetIndicators\) \|\| plan\.competencies\) \? '4\.' : '3\.')\} กิจกรรมการเรียนรู้ \(Learning Activities\)/g,
  '{activitiesStep}. กิจกรรมการเรียนรู้ (Learning Activities)'
);

// 6. Fix Materials numbering
code = code.replace(
  /\{(\(\(plan\.coreIndicators \|\| plan\.targetIndicators\) && plan\.competencies\) \? '6\.' : \(\(plan\.coreIndicators \|\| plan\.targetIndicators\) \|\| plan\.competencies\) \? '5\.' : '4\.')\} \{plan\.isKindergarten \? "สื่อการจัดประสบการณ์ \(Materials\)" : "สื่อการเรียนรู้ \/ แหล่งเรียนรู้ \(Materials\)"\}/g,
  '{materialsStep}. {plan.isKindergarten ? "สื่อการจัดประสบการณ์ (Materials)" : "สื่อการเรียนรู้ / แหล่งเรียนรู้ (Materials)"}'
);

// 7. Fix Evaluation numbering (Kindergarten)
code = code.replace(
  /\{(\(\(plan\.coreIndicators \|\| plan\.targetIndicators\) && plan\.competencies\) \? '7\.' : \(\(plan\.coreIndicators \|\| plan\.targetIndicators\) \|\| plan\.competencies\) \? '6\.' : '5\.')\} การสังเกตและประเมินพัฒนาการ 4 ด้าน/g,
  '{evaluationStep}. การสังเกตและประเมินพัฒนาการ 4 ด้าน'
);

// 8. Fix Evaluation numbering (Normal)
code = code.replace(
  /\{(\(\(plan\.coreIndicators \|\| plan\.targetIndicators\) && plan\.competencies\) \? '7\.' : \(\(plan\.coreIndicators \|\| plan\.targetIndicators\) \|\| plan\.competencies\) \? '6\.' : '5\.')\} วัดและประเมินผล \(Evaluation\)/g,
  '{evaluationStep}. วัดและประเมินผล (Evaluation)'
);

fs.writeFileSync('src/components/LessonPlanPrintTemplate.tsx', code);
