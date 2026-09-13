import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  projectId: "ai-studio-ec31579a-db84-4704-8763-3621d8afe195"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const q = collection(db, 'curriculums');
getDocs(q).then(snap => {
  console.log("Count:", snap.size);
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
