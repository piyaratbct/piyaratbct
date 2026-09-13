const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({ projectId: 'ai-studio-ec31579a-db84-4704-8763-3621d8afe195' });
const db = getFirestore();

async function run() {
  const currs = await db.collection('curriculums').get();
  console.log("Curriculums:");
  currs.forEach(d => {
    const data = d.data();
    if (data.subjectName && (data.subjectName.includes("กิจกรรม") || data.subjectName.includes("แนะแนว") || data.subjectName.includes("ลูกเสือ") || data.subjectName.includes("อ่าน-เขียน"))) {
      console.log(d.id, data.subjectName, "gradeLevel:", data.gradeLevel, "gradeLevels:", data.gradeLevels, "totalHours:", data.totalHours, "reqPerTerm:", data.requiredHoursPerTerm);
    }
  });
}
run().catch(console.error);
