import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, getDocs } from "firebase/firestore";
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const q = query(collection(db, 'curriculums'));
  const snap = await getDocs(q);
  const data = snap.docs.map(d => ({id: d.id, ...d.data()}));
  console.log(data.map(d => d.subjectName || d.name || 'UNKNOWN').join(', '));
  console.log(JSON.stringify(data.slice(0, 2), null, 2));
}

check().catch(console.error).then(() => process.exit(0));
