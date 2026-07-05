import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = getFirestore(app);

async function test() {
  try {
    const q = query(
      collection(db, 'schedules'),
      where('semester', '==', 'ภาคเรียนที่ 1/2567'),
      where('academicYear', '==', '2567'),
      where('gradeLevel', '==', 'ป.1/1')
    );
    await getDocs(q);
    console.log("SUCCESS");
  } catch (err) {
    console.error("ERROR:", err.message);
  }
  process.exit(0);
}
test();
