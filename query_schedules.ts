import { collection, getDocs } from "firebase/firestore";
import { db } from "./src/lib/firebase";

async function run() {
  const snap = await getDocs(collection(db, 'schedules'));
  console.log("Found", snap.size, "schedules.");
  const data = snap.docs.map(d => d.data());
  const uniqueSemesters = [...new Set(data.map(d => d.semester))];
  const uniqueYears = [...new Set(data.map(d => d.academicYear))];
  console.log("Semesters:", uniqueSemesters);
  console.log("Years:", uniqueYears);
}
run();
