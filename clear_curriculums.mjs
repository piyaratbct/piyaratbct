import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function clearData() {
  console.log("Fetching curriculums...");
  const q = collection(db, 'curriculums');
  const snap = await getDocs(q);
  console.log(`Found ${snap.size} curriculums to delete.`);
  
  let deleted = 0;
  for (const docSnap of snap.docs) {
    await deleteDoc(doc(db, 'curriculums', docSnap.id));
    deleted++;
  }
  
  console.log(`Successfully deleted ${deleted} curriculums.`);
}

clearData().then(() => {
  console.log("Done.");
  process.exit(0);
}).catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
