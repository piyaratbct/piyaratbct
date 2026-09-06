import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const app = initializeApp({
  projectId: "ai-studio-ec31579a-db84-4704-8763-3621d8afe195",
});
const db = getFirestore(app);

async function check() {
  const docRef = doc(db, 'config', 'school');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    console.log("Current School Config:", docSnap.data());
  } else {
    console.log("No config document found!");
  }
}

check();
