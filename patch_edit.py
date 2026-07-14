import re

with open('src/components/DisciplineModule.tsx', 'r') as f:
    content = f.read()

# 1. Imports
import_target = "import { ShieldAlert, PlusCircle, Search, FileText, UserX, AlertTriangle, User, Calendar, Save, Trash2, X } from 'lucide-react';"
import_replacement = "import { ShieldAlert, PlusCircle, Search, FileText, UserX, AlertTriangle, User, Calendar, Save, Trash2, X, Edit } from 'lucide-react';"
content = content.replace(import_target, import_replacement)

firestore_import_target = "import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';"
firestore_import_replacement = "import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';"
content = content.replace(firestore_import_target, firestore_import_replacement)

# 2. State
state_target = """  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');"""
state_replacement = """  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');"""
content = content.replace(state_target, state_replacement)

# 3. resetForm function
reset_target = """    try {
      if (type === 'fight') {
"""
reset_replacement = """    try {
"""
# Oops, need a better way to do resetForm. Let's look at handleSubmit.
