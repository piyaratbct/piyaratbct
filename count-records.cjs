const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({ projectId: 'ai-studio-ec31579a-db84-4704-8763-3621d8afe195' });
const db = getFirestore();

async function run() {
  try {
    const recordsSnap = await db.collection('lessonRecords').get();
    console.log(`Total Lesson Records (บันทึกหลังสอน): ${recordsSnap.size}`);
    
    const plansSnap = await db.collection('lessonPlans').get();
    console.log(`Total Lesson Plans (แผนการสอน): ${plansSnap.size}`);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
run();
