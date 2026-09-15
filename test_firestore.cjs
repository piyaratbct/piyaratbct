const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'ai-studio-ec31579a-db84-4704-8763-3621d8afe195'
});
const db = admin.firestore();
async function run() {
    const snap = await db.collection('curriculums').get();
    const docs = snap.docs.map(d => ({id: d.id, ...d.data()}));
    const art = docs.filter(d => d.subjectName && d.subjectName.includes('ศิลปะ') || d.subjectName && d.subjectName.includes('ทัศนศิลป์') || d.subjectName && d.subjectName.includes('ดนตรี'));
    console.log(JSON.stringify(art, null, 2));
}
run().catch(console.error);
