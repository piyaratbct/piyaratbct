const fs = require('fs');
let content = fs.readFileSync('src/components/ScheduleManager.tsx', 'utf8');

// The line numbers are 32, 41, 391. Let's see what's actually there.
console.log(content.split('\\n')[31]);
console.log(content.split('\\n')[40]);

// Fix duplicate imports if they exist
content = content.replace(/import \{ onSnapshot \} from 'firebase\/firestore';\n/, '');
content = content.replace(/import \{ AlertCircle \} from 'lucide-react';\n/, '');

// Clean replace in the main import blocks
content = content.replace(
  /import \{ collection, query, getDocs, doc, setDoc, deleteDoc, addDoc, where([^}]*)\} from 'firebase\/firestore';/,
  "import { collection, query, getDocs, doc, setDoc, deleteDoc, addDoc, where, onSnapshot } from 'firebase/firestore';"
);

content = content.replace(
  /import \{ Calendar, Trash2, Plus, User, BookOpen([^}]*)\} from 'lucide-react';/,
  "import { Calendar, Trash2, Plus, User, BookOpen, AlertCircle } from 'lucide-react';"
);

fs.writeFileSync('src/components/ScheduleManager.tsx', content);
console.log("Applied clean regex fixes");
