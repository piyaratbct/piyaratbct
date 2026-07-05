import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const q = collection(db, 'teachers');
  const snap = await getDocs(q);
  for (const d of snap.docs) {
    const data = d.data();
    if (data.thaiName && data.thaiName.includes('เดือนชนก')) {
      console.log('Found teacher:', d.id, data.thaiName);
      const newName = 'เดือนชนก กตัญญู';
      await updateDoc(doc(db, 'teachers', d.id), { thaiName: newName });
      console.log('Updated to:', newName);
    }
  }
  process.exit(0);
}
run();
