const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function check() {
  const snapshot = await db.collection('lessonPlans').limit(10).get();
  console.log("Total plans found:", snapshot.size);
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`Plan: subject="${data.subject}" gradeLevel="${data.gradeLevel}" semester="${data.semester}" customSubject="${data.customSubject}"`);
  });
}
check();
