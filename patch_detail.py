import re

with open('src/components/StudentDetailModal.tsx', 'r') as f:
    code = f.read()

# 1. Imports
if 'AvatarUpload' not in code:
    code = code.replace("import { X, User, HeartPulse, MapPin, Phone, Calendar, AlertTriangle } from 'lucide-react';", "import { X, User, HeartPulse, MapPin, Phone, Calendar, AlertTriangle } from 'lucide-react';\nimport { AvatarUpload } from './AvatarUpload';")

# 2. Add to UI
ui_target = """          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center shrink-0">
              <span className="text-2xl font-black">{student.firstName.charAt(0)}</span>
            </div>"""

ui_replacement = """          <div className="flex items-start gap-4">
            <div className="shrink-0 pt-1">
              <AvatarUpload
                url={student.photoURL}
                name={student.firstName || student.studentId}
                size="lg"
                editable={false}
                onUpload={async () => {}}
              />
            </div>"""

code = code.replace(ui_target, ui_replacement)

with open('src/components/StudentDetailModal.tsx', 'w') as f:
    f.write(code)

print("StudentDetailModal patched!")
