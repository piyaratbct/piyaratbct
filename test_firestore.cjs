const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, initializeFirestore } = require('firebase/firestore');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = initializeFirestore(app, {}, config.firestoreDatabaseId);

async function test() {
  try {
    const snapshot = await getDocs(collection(db, 'curriculums'));
    const curriculums = snapshot.docs.map(doc => doc.data());
    
    console.log(`Found ${curriculums.length} curriculums`);
    const uniqueSubjects = [...new Set(curriculums.map(c => c.subjectName))];
    const uniqueGrades = [...new Set(curriculums.map(c => c.gradeLevel))];
    
    console.log("\n--- Subjects in DB ---");
    console.log(uniqueSubjects);
    console.log("\n--- Grades in DB ---");
    console.log(uniqueGrades);
    
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
