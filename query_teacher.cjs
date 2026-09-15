const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({ projectId: 'ai-studio-ec31579a-db84-4704-8763-3621d8afe195' });
const db = getFirestore();

async function run() {
  const teachers = await db.collection('teachers').get();
  console.log("Teachers:");
  teachers.forEach(d => {
    const data = d.data();
    if (data.thaiName && data.thaiName.includes("เดือนชนก")) {
      console.log(d.id, data.thaiName, data.role);
    }
  });
}
run().catch(console.error);
