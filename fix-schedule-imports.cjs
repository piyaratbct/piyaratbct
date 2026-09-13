const fs = require('fs');
let content = fs.readFileSync('src/components/ScheduleManager.tsx', 'utf8');

if (!content.includes('onSnapshot')) {
  content = content.replace(
    /import \{ collection, query, getDocs, doc, setDoc, deleteDoc, addDoc, where \} from 'firebase\/firestore';/,
    "import { collection, query, getDocs, doc, setDoc, deleteDoc, addDoc, where, onSnapshot } from 'firebase/firestore';"
  );
}

if (!content.includes('AlertCircle')) {
  content = content.replace(
    /Calendar, Trash2, Plus, User, BookOpen/,
    "Calendar, Trash2, Plus, User, BookOpen, AlertCircle"
  );
}

fs.writeFileSync('src/components/ScheduleManager.tsx', content);
console.log("Fixed imports");
