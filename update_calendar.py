import re

with open('src/components/SchoolEventCalendar.tsx', 'r') as f:
    content = f.read()

# Add Bell icon
content = content.replace("import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight, BookOpen, Plus, Trash2, CheckCircle2 } from 'lucide-react';", "import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight, BookOpen, Plus, Trash2, CheckCircle2, Users, Bell, AlertCircle } from 'lucide-react';")

# Update Interface
content = content.replace(
    "  timeRange: string;\n}", 
    "  timeRange: string;\n  responsibleTeachers?: string[];\n}"
)

# Add teachers state and new field in newEvent
old_state = """  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newEvent, setNewEvent] = useState({ date: '', title: '', timeRange: '08:00 - 16:00', type: 'activity' });"""

new_state = """  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newEvent, setNewEvent] = useState<{date: string, title: string, timeRange: string, type: string, responsibleTeachers: string[]}>({ date: '', title: '', timeRange: '08:00 - 16:00', type: 'activity', responsibleTeachers: [] });
  const [teachers, setTeachers] = useState<Teacher[]>([]);"""

content = content.replace(old_state, new_state)

# Fetch events and teachers
old_fetch = """  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'schoolEvents'), orderBy('date', 'asc'));
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SchoolEvent));
      setEvents(fetched);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
    setIsLoading(false);
  };"""

new_fetch = """  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [eventsSnap, teachersSnap] = await Promise.all([
        getDocs(query(collection(db, 'schoolEvents'), orderBy('date', 'asc'))),
        getDocs(collection(db, 'teachers'))
      ]);
      const fetchedEvents = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SchoolEvent));
      const fetchedTeachers = teachersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Teacher));
      setEvents(fetchedEvents);
      setTeachers(fetchedTeachers);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setIsLoading(false);
  };"""

content = content.replace(old_fetch, new_fetch)
content = content.replace("fetchEvents();", "fetchData();")

# Handle add event
old_add = """      await addDoc(collection(db, 'schoolEvents'), newEvent);
      setNewEvent({ date: '', title: '', timeRange: '08:00 - 16:00', type: 'activity' });"""
new_add = """      await addDoc(collection(db, 'schoolEvents'), newEvent);
      setNewEvent({ date: '', title: '', timeRange: '08:00 - 16:00', type: 'activity', responsibleTeachers: [] });"""
content = content.replace(old_add, new_add)

# Add form inputs for responsible teachers
old_form = """              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">ประเภท</label>
                <select value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})} className="w-full p-2 text-sm border border-slate-200 rounded-lg">
                  <option value="activity">กิจกรรมทั่วไป</option>
                  <option value="meeting">ประชุม</option>
                  <option value="exam">สอบวัดผล</option>
                </select>
              </div>
            </div>"""

new_form = """              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">ประเภท</label>
                <select value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})} className="w-full p-2 text-sm border border-slate-200 rounded-lg">
                  <option value="activity">กิจกรรมทั่วไป</option>
                  <option value="meeting">ประชุม</option>
                  <option value="exam">สอบวัดผล</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2">ครูผู้รับผิดชอบ (เลือกได้หลายคน)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-white">
                {teachers.map(teacher => (
                  <label key={teacher.id} className="flex items-center gap-2 text-sm cursor-pointer p-1 hover:bg-slate-50 rounded">
                    <input 
                      type="checkbox" 
                      checked={newEvent.responsibleTeachers.includes(teacher.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewEvent({...newEvent, responsibleTeachers: [...newEvent.responsibleTeachers, teacher.id]});
                        } else {
                          setNewEvent({...newEvent, responsibleTeachers: newEvent.responsibleTeachers.filter(id => id !== teacher.id)});
                        }
                      }}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="truncate">{teacher.thaiName || teacher.displayName}</span>
                  </label>
                ))}
              </div>
            </div>"""

content = content.replace(old_form, new_form)

with open('src/components/SchoolEventCalendar.tsx', 'w') as f:
    f.write(content)

