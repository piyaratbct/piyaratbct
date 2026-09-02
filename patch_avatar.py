import re

with open('src/components/AvatarUpload.tsx', 'r') as f:
    code = f.read()

# Replace imports
code = code.replace("import { Camera, Loader2, UserCircle } from 'lucide-react';", "import { Camera, Loader2, User } from 'lucide-react';")

# Replace fallback avatar
ui_target = """      ) : (
        <div className={`${sizeClasses[size]} rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold border-2 border-white shadow-sm`}>
          {initials}
        </div>
      )}"""

ui_replacement = """      ) : (
        <div className={`${sizeClasses[size]} rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border-2 border-white shadow-sm`}>
          <User className="w-1/2 h-1/2" />
        </div>
      )}"""

code = code.replace(ui_target, ui_replacement)

with open('src/components/AvatarUpload.tsx', 'w') as f:
    f.write(code)

print("AvatarUpload patched!")
