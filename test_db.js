import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const app = initializeApp({
  projectId: "gen-lang-client-0549870883",
});
const db = getFirestore(app, "ai-studio-ec31579a-db84-4704-8763-3621d8afe195");

async function check() {
  try {
    const docRef = doc(db, 'config', 'school');
    const docSnap = await getDoc(docRef);
    console.log("Exists:", docSnap.exists());
    if (docSnap.exists()) {
      console.log(docSnap.data());
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

check();
