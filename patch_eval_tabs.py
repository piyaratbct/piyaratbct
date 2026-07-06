import re

with open('src/components/EvaluationModule.tsx', 'r') as f:
    content = f.read()

target = """          <div className="flex flex-wrap bg-white rounded-xl p-1 shadow-sm border border-slate-100 max-w-2xl">"""

replacement = """          <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap bg-white rounded-xl p-1 shadow-sm border border-slate-100 max-w-2xl gap-1">"""

if target in content:
    content = content.replace(target, replacement)
    print("Patched EvaluationModule tabs")
else:
    print("EvaluationModule tabs target not found")

with open('src/components/EvaluationModule.tsx', 'w') as f:
    f.write(content)
