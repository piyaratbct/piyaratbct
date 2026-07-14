import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Import updatePassword
content = content.replace(
    'import { onAuthStateChanged, signOut } from "firebase/auth";',
    'import { onAuthStateChanged, signOut, updatePassword } from "firebase/auth";'
)

# 2. Add pPassword state
content = content.replace(
    'const [pDisplayName, setPDisplayName] = useState("");',
    'const [pDisplayName, setPDisplayName] = useState("");\n  const [pPassword, setPPassword] = useState("");'
)

# 3. Update handleSaveProfile to handle password update
target_save = """    try {
      const updatedTeacher: Teacher = {"""
replacement_save = """    try {
      if (pPassword.trim().length > 0) {
        if (pPassword.trim().length < 6) {
          alert("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
          return;
        }
        if (auth.currentUser) {
          await updatePassword(auth.currentUser, pPassword.trim());
        }
      }

      const updatedTeacher: Teacher = {"""
content = content.replace(target_save, replacement_save)

# 4. Reset pPassword when opening modal
target_open = """              setPDisplayName(currentTeacher.displayName || "");
              setShowProfileModal(true);"""
replacement_open = """              setPDisplayName(currentTeacher.displayName || "");
              setPPassword("");
              setShowProfileModal(true);"""
content = content.replace(target_open, replacement_open)

# 5. Add input for password in the UI
target_ui = """                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                    <Phone className="h-3 w-3 text-slate-400" />
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="text"
                    required
                    value={pPhoneNumber}
                    onChange={(e) => setPPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>"""

replacement_ui = """                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                    <Phone className="h-3 w-3 text-slate-400" />
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="text"
                    required
                    value={pPhoneNumber}
                    onChange={(e) => setPPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div className="bg-rose-50 border border-rose-200/65 p-3.5 rounded-xl">
                <label className="block text-xs font-black text-rose-900 mb-1">
                  รหัสผ่านใหม่ (หากไม่ต้องการเปลี่ยน ให้เว้นว่างไว้)
                </label>
                <input
                  type="password"
                  value={pPassword}
                  onChange={(e) => setPPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white"
                  placeholder="รหัสผ่านใหม่ (ขั้นต่ำ 6 ตัวอักษร)"
                />
              </div>"""
content = content.replace(target_ui, replacement_ui)

with open('src/App.tsx', 'w') as f:
    f.write(content)

