import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, or, getDocs } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function test() {
  try {
    const q = query(
      collection(db, "lessonPlans"),
      or(
        where("teacherId", "==", "teacher1"),
        where("coTeachers", "array-contains", "teacher1"),
        where("collaborators", "array-contains", "teacher1@example.com")
      )
    );
    await getDocs(q);
    console.log("SUCCESS");
  } catch(e) {
    console.log("ERROR", e.message);
  }
  process.exit(0);
}
test();
