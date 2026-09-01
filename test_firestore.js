const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, getDocsFromServer } = require('firebase/firestore');

// Use anonymous access to public collections since rules allow read: if true for curriculums
const app = initializeApp({ projectId: "ai-studio-ec31579a-db84-4704-8763-3621d8afe195" });
const db = getFirestore(app);

async function test() {
  try {
    console.log("Fetching curriculums from server...");
    const c = await getDocsFromServer(collection(db, 'curriculums'));
    const curriculums = c.docs.map(d => ({id: d.id, ...d.data()}));
    console.log(`Found ${curriculums.length} curriculums`);
    
    // Print unique subject names and grade levels
    const subjects = [...new Set(curriculums.map(c => c.subjectName))];
    const grades = [...new Set(curriculums.map(c => c.gradeLevel))];
    
    console.log("Unique Subjects:", subjects);
    console.log("Unique Grades:", grades);
    
    // Check standards structure for a sample
    if (curriculums.length > 0) {
      console.log("\nSample Curriculum:");
      console.log("- Subject:", curriculums[0].subjectName);
      console.log("- Grade:", curriculums[0].gradeLevel);
      console.log("- Standard count:", curriculums[0].standards?.length || 0);
      if (curriculums[0].standards?.length > 0) {
         console.log("- First standard:", curriculums[0].standards[0].title);
         console.log("- Indicator count:", curriculums[0].standards[0].indicators?.length || 0);
      }
    }
  } catch (err) {
    console.error("Failed to fetch:", err.message);
  }
}
test();
