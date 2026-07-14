import re

with open('src/components/DisciplineModule.tsx', 'r') as f:
    content = f.read()

target = "const [showForm, setShowForm] = useState(false);"
replacement = "const [showForm, setShowForm] = useState(false);\n  const [editingId, setEditingId] = useState<string | null>(null);"
content = content.replace(target, replacement)

target2 = "import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';"
replacement2 = "import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';"
content = content.replace(target2, replacement2)

with open('src/components/DisciplineModule.tsx', 'w') as f:
    f.write(content)
