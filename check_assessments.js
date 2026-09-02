import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query } from "firebase/firestore";
import { readFileSync } from "fs";

const config = JSON.parse(readFileSync("./firebase-applet-config.json", "utf8"));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function check() {
  const querySnapshot = await getDocs(query(collection(db, "assessments")));
  let months = {};
  querySnapshot.forEach((doc) => {
    const m = doc.data().month || "undefined";
    months[m] = (months[m] || 0) + 1;
  });
  console.log("Assessments months:", months);
  
  const qK = await getDocs(query(collection(db, "kindergartenAssessments")));
  let kMonths = {};
  qK.forEach((doc) => {
    const m = doc.data().month || "undefined";
    kMonths[m] = (kMonths[m] || 0) + 1;
  });
  console.log("Kindergarten months:", kMonths);

  process.exit(0);
}
check();
