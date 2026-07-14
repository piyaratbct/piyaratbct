import re

with open('src/components/DisciplineModule.tsx', 'r') as f:
    content = f.read()

# Add Clock to imports
content = content.replace("Trash2, X } from 'lucide-react';", "Trash2, X, Clock } from 'lucide-react';")

# Change first target
target1 = """                    <div className="flex gap-2">
                      <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-lg whitespace-nowrap">
                        {incident.date} {incident.time && `เวลา ${incident.time} น.`}
                      </span>"""
                      
replacement1 = """                    <div className="flex gap-2">
                      <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-lg whitespace-nowrap">
                        {incident.date}
                      </span>"""
content = content.replace(target1, replacement1)

# Change second target
target2 = """                  <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      <span>บันทึกโดย: {incident.teacherName}</span>
                    </div>
                  </div>"""

replacement2 = """                  <div className="pt-3 border-t border-slate-50 flex flex-col gap-1.5 text-xs text-slate-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        <span>บันทึกโดย: {incident.teacherName}</span>
                      </div>
                    </div>
                    {incident.time && (
                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock className="h-3.5 w-3.5" />
                        <span>เวลา: {incident.time} น.</span>
                      </div>
                    )}
                  </div>"""
                  
content = content.replace(target2, replacement2)

with open('src/components/DisciplineModule.tsx', 'w') as f:
    f.write(content)

