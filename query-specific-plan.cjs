const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function check() {
  const snapshot = await db.collection('lessonPlans').get();
  console.log("Total plans:", snapshot.size);
  let found = false;
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.title && data.title.includes('mysub')) {
      found = true;
      console.log(`Plan ID: ${doc.id}`);
      console.log(`  title: "${data.title}"`);
      console.log(`  subject: "${data.subject}"`);
      console.log(`  customSubject: "${data.customSubject}"`);
      console.log(`  gradeLevel: "${data.gradeLevel}"`);
      console.log(`  semester: "${data.semester}"`);
      console.log(`  teacherId: "${data.teacherId}"`);
      console.log(`  structuredEvaluations:`, JSON.stringify(data.structuredEvaluations || []));
    }
  });
  if (!found) console.log("Did not find plan 'mysub'");
}
check();
