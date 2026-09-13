import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const snap = await getDocs(collection(db, 'curriculums'));
  const data = snap.docs.map(d => ({id: d.id, ...d.data()}));
  
  const thai = data.filter(d => d.subjectName && d.subjectName.includes('ภาษาไทย'));
  console.log(JSON.stringify(thai, null, 2));
}

check().catch(console.error).then(() => process.exit(0));
