const fs = require('fs');

async function migrate() {
  const firebaseConfig = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf8"));
  const projectId = firebaseConfig.projectId;
  const dbId = firebaseConfig.firestoreDatabaseId || '(default)';
  
  const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents`;
  
  try {
    // Check old collection
    const res = await fetch(`${baseUrl}/lesson_plans`);
    const data = await res.json();
    console.log("lesson_plans:", data.documents ? data.documents.length : 0);

    const res2 = await fetch(`${baseUrl}/lessonPlans`);
    const data2 = await res2.json();
    console.log("lessonPlans:", data2.documents ? data2.documents.length : 0);

    const res3 = await fetch(`${baseUrl}/lesson_records`);
    const data3 = await res3.json();
    console.log("lesson_records:", data3.documents ? data3.documents.length : 0);

    const res4 = await fetch(`${baseUrl}/records`);
    const data4 = await res4.json();
    console.log("records:", data4.documents ? data4.documents.length : 0);

  } catch(e) {
    console.error(e);
  }
}
migrate();
