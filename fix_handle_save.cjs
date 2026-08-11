const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `  const handleSavePlan = async (plan: LessonPlan) => {
    try {
      const existingPlan = plans.find((p) => p.id === plan.id);
      const isEdit = !!existingPlan;

      const oldCoTeachers = existingPlan?.coTeachers || [];
      const newCoTeachers = plan.coTeachers || [];
      const newlyAdded = newCoTeachers.filter(id => !oldCoTeachers.includes(id));

      const payload = {
        ...plan,
        updatedAt: new Date().toISOString(),
      };

      const cleanPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== undefined),
      );

      await setDoc(doc(db, "lessonPlans", plan.id), cleanPayload);
      
      if (newlyAdded.length > 0 && currentTeacher) {
        const { writeBatch } = require("firebase/firestore"); // Actually, it's better to import writeBatch at the top. Let's do batch manually using multiple setDocs to avoid require
        for (const userId of newlyAdded) {
           const notifRef = doc(collection(db, "notifications"));
           await setDoc(notifRef, {
             id: notifRef.id,
             userId: userId,
             type: 'co_teacher_invite',
             message: \`คุณได้รับเชิญให้เป็นครูผู้ร่วมสอนในแผนการสอน "\${plan.title}" โดยครู\${currentTeacher.thaiName || currentTeacher.displayName}\`,
             planId: plan.id,
             read: false,
             createdAt: new Date().toISOString()
           });
        }
      }

      setEditingPlan(null);`;

code = code.replace(/const handleSavePlan = async \(plan: LessonPlan\) => \{\n\s*try \{\n\s*const isEdit = plans\.some\(\(p\) => p\.id === plan\.id\);\n\n\s*const payload = \{\n\s*\.\.\.plan,\n\s*updatedAt: new Date\(\)\.toISOString\(\),\n\s*\};\n\n\s*const cleanPayload = Object\.fromEntries\(\n\s*Object\.entries\(payload\)\.filter\(\(\[_, v\]\) => v !== undefined\),\n\s*\);\n\n\s*await setDoc\(doc\(db, "lessonPlans", plan\.id\), cleanPayload\);\n\s*setEditingPlan\(null\);/, replacement);

fs.writeFileSync('src/App.tsx', code, 'utf8');
