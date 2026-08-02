import re

with open('src/components/ScheduleManager.tsx', 'r') as f:
    content = f.read()

# 1. Update useState
content = content.replace(
    "const [viewMode, setViewMode] = useState<'manage' | 'overview' | 'free-periods'>('manage');",
    "const [viewMode, setViewMode] = useState<'manage' | 'overview'>('manage');"
)

# 2. Remove search states
content = re.sub(r'  const \[searchDay, setSearchDay\] = useState<number>\(1\);\n  const \[searchPeriod, setSearchPeriod\] = useState<string>\(PERIODS\[0\]\);\n', '', content)

# 3. Remove the free-periods button
button_pattern = r'\s*<button\s*onClick=\{\(\) => setViewMode\(\'free-periods\'\)\}\s*className=\{`px-4 py-2 rounded-md text-sm font-bold transition-colors \$\{viewMode === \'free-periods\' \? \'bg-white text-indigo-600 shadow-sm\' : \'text-slate-500 hover:text-slate-700\'\}`\}\s*>\s*ตรวจสอบคาบว่าง/ชน\s*</button>'
content = re.sub(button_pattern, '', content)

# 4. Remove the block {viewMode === 'free-periods' && ( ... )}
block_start = "{viewMode === 'free-periods' && ("
start_idx = content.find(block_start)
if start_idx != -1:
    end_idx = content.find("{viewMode === 'overview' && (", start_idx)
    if end_idx != -1:
        content = content[:start_idx] + content[end_idx:]

with open('src/components/ScheduleManager.tsx', 'w') as f:
    f.write(content)

print("Removed free-periods feature")
