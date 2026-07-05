import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import fs from "fs";

const configPath = "firebase-applet-config.json";
if (!fs.existsSync(configPath)) {
  console.log("No config found");
  process.exit(0);
}

const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
const app = initializeApp(config);
const db = getFirestore(app);

async function test() {
  try {
    const q = query(
      collection(db, 'schedules'),
      where('teacherId', '==', 'test-teacher-id'),
      where('semester', '==', 'ภาคเรียนที่ 1/2567'),
      where('academicYear', '==', '2567')
    );
    await getDocs(q);
    console.log("SUCCESS");
  } catch (err) {
    console.error("ERROR:", err.message);
  }
  process.exit(0);
}

test();
