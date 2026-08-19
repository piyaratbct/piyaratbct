import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf8"));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  try {
    const p1 = await getDocs(collection(db, "lesson_plans"));
    console.log("lesson_plans:", p1.size);
    const p2 = await getDocs(collection(db, "lessonPlans"));
    console.log("lessonPlans:", p2.size);
    const r1 = await getDocs(collection(db, "records"));
    console.log("records:", r1.size);
    const r2 = await getDocs(collection(db, "lesson_records"));
    console.log("lesson_records:", r2.size);
    process.exit(0);
  } catch (e) {
    console.error("Error:", e.message);
    process.exit(1);
  }
}
check();
