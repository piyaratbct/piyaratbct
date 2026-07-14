import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Chart Section */}
                  <div className="lg:col-span-1 bg-white border border-slate-100 rounded-xl p-5 shadow-sm">"""

replacement = """              ) : (
                <div className="flex flex-col gap-6">
                  {/* Chart Section */}
                  <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">"""

content = content.replace(target, replacement)

target2 = """                  {/* List Section */}
                  <div className="lg:col-span-2">"""

replacement2 = """                  {/* List Section */}
                  <div>"""

content = content.replace(target2, replacement2)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
