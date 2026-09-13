const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function check() {
  const snapshot = await db.collection('lessonPlans').get();
  console.log("Total plans:", snapshot.size);
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`Plan ID: ${doc.id}`);
    console.log(`  subject: "${data.subject}"`);
    console.log(`  customSubject: "${data.customSubject}"`);
    console.log(`  gradeLevel: "${data.gradeLevel}"`);
    console.log(`  semester: "${data.semester}"`);
    console.log(`  teacherId: "${data.teacherId}"`);
  });
}
check();
