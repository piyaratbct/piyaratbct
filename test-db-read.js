import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
const app = initializeApp({ projectId: 'ai-studio-ec31579a-db84-4704-8763-3621d8afe195' });
const db = getFirestore(app);
async function run() {
    try {
        const sSnap = await getDocs(collection(db, 'schedules'));
        console.log("Docs:", sSnap.docs.length);
        sSnap.docs.forEach(d => {
            const data = d.data();
            console.log(`- semester: "${data.semester}", academicYear: "${data.academicYear}"`);
        });
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
run();
