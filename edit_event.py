import re

with open('src/components/SchoolEventCalendar.tsx', 'r') as f:
    content = f.read()

# 1. Update imports
content = content.replace(
    "import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight, BookOpen, Plus, Trash2, CheckCircle2, Users, Bell, AlertCircle } from 'lucide-react';",
    "import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight, BookOpen, Plus, Trash2, CheckCircle2, Users, Bell, AlertCircle, Edit2 } from 'lucide-react';"
)
content = content.replace(
    "import { collection, query, orderBy, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';",
    "import { collection, query, orderBy, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';"
)

# 2. Add editingEventId state
old_state = "  const [isAdding, setIsAdding] = useState(false);"
new_state = "  const [isAdding, setIsAdding] = useState(false);\n  const [editingEventId, setEditingEventId] = useState<string | null>(null);"
content = content.replace(old_state, new_state)

# 3. Update handleAddEvent
old_handle_add = """  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.date || !newEvent.title) return;
    try {
      await addDoc(collection(db, 'schoolEvents'), newEvent);
      setNewEvent({ date: '', title: '', timeRange: '08:00 - 16:00', type: 'activity', responsibleTeachers: [] });
      setIsAdding(false);
      fetchData();
      window.dispatchEvent(new CustomEvent('app-custom-toast', { detail: { message: 'เพิ่มกิจกรรมเรียบร้อยแล้ว', type: 'success' }}));
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };"""

new_handle_add = """  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.date || !newEvent.title) return;
    try {
      if (editingEventId) {
        await updateDoc(doc(db, 'schoolEvents', editingEventId), newEvent);
        window.dispatchEvent(new CustomEvent('app-custom-toast', { detail: { message: 'แก้ไขกิจกรรมเรียบร้อยแล้ว', type: 'success' }}));
      } else {
        await addDoc(collection(db, 'schoolEvents'), newEvent);
        window.dispatchEvent(new CustomEvent('app-custom-toast', { detail: { message: 'เพิ่มกิจกรรมเรียบร้อยแล้ว', type: 'success' }}));
      }
      setNewEvent({ date: '', title: '', timeRange: '08:00 - 16:00', type: 'activity', responsibleTeachers: [] });
      setIsAdding(false);
      setEditingEventId(null);
      fetchData();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };
  
  const handleEdit = (event: SchoolEvent) => {
    setNewEvent({
      date: event.date,
      title: event.title,
      timeRange: event.timeRange || '08:00 - 16:00',
      type: event.type || 'activity',
      responsibleTeachers: event.responsibleTeachers || []
    });
    setEditingEventId(event.id);
    setIsAdding(true);
  };
  
  const handleCancelForm = () => {
    setNewEvent({ date: '', title: '', timeRange: '08:00 - 16:00', type: 'activity', responsibleTeachers: [] });
    setIsAdding(false);
    setEditingEventId(null);
  };"""

content = content.replace(old_handle_add, new_handle_add)

# 4. Update the "Add Event" button logic to clear edit state
old_add_btn = """        {canManageEvents && !isAdding && (
          <button 
            onClick={() => setIsAdding(true)}"""

new_add_btn = """        {canManageEvents && !isAdding && (
          <button 
            onClick={() => {
              setNewEvent({ date: '', title: '', timeRange: '08:00 - 16:00', type: 'activity', responsibleTeachers: [] });
              setEditingEventId(null);
              setIsAdding(true);
            }}"""

content = content.replace(old_add_btn, new_add_btn)

# 5. Update form title and cancel button
old_form_title = '<h4 className="font-bold text-slate-700">เพิ่มกิจกรรมใหม่</h4>'
new_form_title = '<h4 className="font-bold text-slate-700">{editingEventId ? "แก้ไขกิจกรรม" : "เพิ่มกิจกรรมใหม่"}</h4>'
content = content.replace(old_form_title, new_form_title)

old_form_cancel = '<button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50">ยกเลิก</button>'
new_form_cancel = '<button type="button" onClick={handleCancelForm} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50">ยกเลิก</button>'
content = content.replace(old_form_cancel, new_form_cancel)

# 6. Add edit button to the event card
old_card_actions = """                  {canManageEvents && (
                    <div className="mt-4 pt-4 border-t border-black/5 flex justify-end relative z-10">
                      <button onClick={() => handleDelete(event.id)} className="text-xs font-bold flex items-center gap-1 opacity-70 hover:opacity-100 hover:text-red-700 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" /> ลบ
                      </button>
                    </div>
                  )}"""

new_card_actions = """                  {canManageEvents && (
                    <div className="mt-4 pt-4 border-t border-black/5 flex justify-end gap-3 relative z-10">
                      <button onClick={() => handleEdit(event)} className="text-xs font-bold flex items-center gap-1 opacity-70 hover:opacity-100 hover:text-indigo-700 transition-colors">
                        <Edit2 className="h-3.5 w-3.5" /> แก้ไข
                      </button>
                      <button onClick={() => handleDelete(event.id)} className="text-xs font-bold flex items-center gap-1 opacity-70 hover:opacity-100 hover:text-red-700 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" /> ลบ
                      </button>
                    </div>
                  )}"""

content = content.replace(old_card_actions, new_card_actions)

with open('src/components/SchoolEventCalendar.tsx', 'w') as f:
    f.write(content)

