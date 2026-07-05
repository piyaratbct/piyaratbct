import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore, collection, query, getDocs } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const dbId = "ai-studio-ec31579a-db84-4704-8763-3621d8afe195";
const db = initializeFirestore(app, { experimentalForceLongPolling: true }, dbId);

async function test() {
  try {
    const q = query(collection(db, 'schedules'));
    const snap = await getDocs(q);
    const docs = snap.docs.map(d => d.data());
    console.log("All schedules:");
    console.dir(docs, { depth: null });
  } catch (err) {
    console.error("ERROR:", err.message);
  }
  process.exit(0);
}
test();
