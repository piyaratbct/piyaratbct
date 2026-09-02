import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { readFileSync } from "fs";

const config = JSON.parse(readFileSync("./firebase-applet-config.json", "utf8"));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function check() {
  const docRef = doc(db, "config", "school");
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const data = snap.data();
    const logo = data.customLogo;
    if (!logo) {
      console.log("RESULT: No logo set (null)");
    } else if (logo.includes("firebasestorage.googleapis.com")) {
      console.log("RESULT: Logo is in Storage (URL: " + logo.substring(0, 80) + "...)");
    } else if (logo.startsWith("data:image")) {
      console.log("RESULT: Logo is still Base64 encoded in Firestore");
    } else {
      console.log("RESULT: Unknown format -> " + logo.substring(0, 50));
    }
  } else {
    console.log("RESULT: Document does not exist.");
  }
  process.exit(0);
}
check();
