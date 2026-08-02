import re

with open('src/components/AcademicModule.tsx', 'r') as f:
    content = f.read()

# 1. Imports
content = content.replace(
    'import { Teacher } from "../types";',
    'import { Teacher } from "../types";\nimport { collection, query, where, getDocs } from "firebase/firestore";\nimport { db } from "../lib/firebase";\nimport { useEffect } from "react";'
)

# 2. Add state and effect
old_state = '  const [activeTab, setActiveTab] = useState<"calendar" | "settings" | "staff" | "schedule" | "promotion" | "learning_hours">("calendar");'
new_state = """  const [activeTab, setActiveTab] = useState<"calendar" | "settings" | "staff" | "schedule" | "promotion" | "learning_hours">("calendar");
  const [upcomingEventCount, setUpcomingEventCount] = useState(0);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      if (!currentTeacher) return;
      try {
        const q = query(collection(db, 'schoolEvents'), where('responsibleTeachers', 'array-contains', currentTeacher.id));
        const snapshot = await getDocs(q);
        const today = new Date();
        today.setHours(0,0,0,0);
        const inThreeDays = new Date(today);
        inThreeDays.setDate(today.getDate() + 3);
        
        let count = 0;
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const d = new Date(data.date);
          if (d >= today && d <= inThreeDays) {
            count++;
          }
        });
        setUpcomingEventCount(count);
      } catch (error) {
        console.error("Error fetching upcoming events", error);
      }
    };
    fetchUpcomingEvents();
  }, [currentTeacher]);"""

content = content.replace(old_state, new_state)

# 3. Update the tab UI
old_tab = """        <button
          onClick={() => setActiveTab("calendar")}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all min-w-[150px] ${
            activeTab === "calendar"
              ? "bg-indigo-50 text-indigo-700"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <CalendarIcon className="h-4 w-4" /> ปฏิทินวิชาการ
        </button>"""

new_tab = """        <button
          onClick={() => setActiveTab("calendar")}
          className={`relative flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all min-w-[150px] ${
            activeTab === "calendar"
              ? "bg-indigo-50 text-indigo-700"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <CalendarIcon className="h-4 w-4" /> 
          ปฏิทินวิชาการ
          {upcomingEventCount > 0 && (
            <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white animate-bounce">
              {upcomingEventCount}
            </span>
          )}
        </button>"""

content = content.replace(old_tab, new_tab)

with open('src/components/AcademicModule.tsx', 'w') as f:
    f.write(content)

