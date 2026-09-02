import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'ai-studio-ec31579a-db84-4704-8763-3621d8afe195',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  try {
    const sSnap = await getDocs(collection(db, 'schedules'));
    console.log("Total schedules:", sSnap.docs.length);
    if (sSnap.docs.length > 0) {
      const data = sSnap.docs[0].data();
      console.log("Sample schedule semester:", data.semester, "academicYear:", data.academicYear);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
