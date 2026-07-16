import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Increase English text size on header buttons
content = content.replace(
    'className="text-[10px] font-medium opacity-80"', 
    'className="text-xs font-semibold opacity-90"'
)

# Increase English text size on welcome screen buttons
content = content.replace(
    'className="text-sm text-slate-500 font-bold"',
    'className="text-base text-slate-500 font-black"'
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Replacement complete")
