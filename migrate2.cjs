const fs = require('fs');

async function migrate() {
  const firebaseConfig = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf8"));
  const projectId = firebaseConfig.projectId;
  const dbId = firebaseConfig.firestoreDatabaseId || '(default)';
  
  const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents`;
  
  try {
    const res = await fetch(`${baseUrl}/teachers`);
    const data = await res.json();
    console.log("teachers:", data.documents ? data.documents.length : 0);
  } catch(e) {
    console.error(e);
  }
}
migrate();
