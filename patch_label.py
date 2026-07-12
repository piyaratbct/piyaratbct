import re

with open('src/components/DisciplineModule.tsx', 'r') as f:
    content = f.read()

target = """  const getTypeLabel = (type: string, otherDetail?: string) => {
    switch (type) {
      case 'fight': return { label: 'ทะเลาะวิวาท / ทำร้ายร่างกาย', color: 'bg-rose-100 text-rose-700 border-rose-200' };
      case 'bullying': return { label: 'ความบาดหมาง / กลั่นแกล้ง', color: 'bg-orange-100 text-orange-700 border-orange-200' };
      case 'disruption': return { label: 'ความเข้าใจผิด / ก่อความวุ่นวาย', color: 'bg-amber-100 text-amber-700 border-amber-200' };
      case 'accident': return { label: 'อุบัติเหตุ', color: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'illness': return { label: 'เจ็บป่วยกะทันหัน', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
      case 'vandalism': return { label: 'ทำลายทรัพย์สิน', color: 'bg-purple-100 text-purple-700 border-purple-200' };
      case 'other': return { label: `อื่นๆ: ${otherDetail || ''}`, color: 'bg-slate-100 text-slate-700 border-slate-200' };
      default: return { label: 'ไม่ระบุ', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };"""
replacement = """  const getTypeLabel = (type: string, otherDetail?: string, accidentDetail?: string) => {
    switch (type) {
      case 'fight': return { label: 'ทะเลาะวิวาท / ทำร้ายร่างกาย', color: 'bg-rose-100 text-rose-700 border-rose-200' };
      case 'bullying': return { label: 'ความบาดหมาง / กลั่นแกล้ง', color: 'bg-orange-100 text-orange-700 border-orange-200' };
      case 'disruption': return { label: 'ความเข้าใจผิด / ก่อความวุ่นวาย', color: 'bg-amber-100 text-amber-700 border-amber-200' };
      case 'accident': return { label: `อุบัติเหตุ${accidentDetail ? `: ${accidentDetail}` : ''}`, color: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'illness': return { label: 'เจ็บป่วยกะทันหัน', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
      case 'vandalism': return { label: 'ทำลายทรัพย์สิน', color: 'bg-purple-100 text-purple-700 border-purple-200' };
      case 'other': return { label: `อื่นๆ: ${otherDetail || ''}`, color: 'bg-slate-100 text-slate-700 border-slate-200' };
      default: return { label: 'ไม่ระบุ', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };"""

content = content.replace(target, replacement)

type_info_target = "const typeInfo = getTypeLabel(incident.type, incident.otherTypeDetail);"
type_info_replacement = "const typeInfo = getTypeLabel(incident.type, incident.otherTypeDetail, incident.accidentDetail);"
content = content.replace(type_info_target, type_info_replacement)

with open('src/components/DisciplineModule.tsx', 'w') as f:
    f.write(content)
