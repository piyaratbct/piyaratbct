import re

with open('src/components/DisciplineModule.tsx', 'r') as f:
    content = f.read()

target_label = """  const getTypeLabel = (type: string, otherDetail?: string, accidentDetail?: string, illnessDetail?: string, fightDetail?: string) => {
    switch (type) {
      case 'fight': return { label: `ทะเลาะวิวาท / ทำร้ายร่างกาย${fightDetail ? `: ${fightDetail}` : ''}`, color: 'bg-rose-100 text-rose-700 border-rose-200' };
      case 'bullying': return { label: 'ความบาดหมาง / กลั่นแกล้ง', color: 'bg-orange-100 text-orange-700 border-orange-200' };
      case 'disruption': return { label: 'ความเข้าใจผิด / ก่อความวุ่นวาย', color: 'bg-amber-100 text-amber-700 border-amber-200' };
      case 'accident': return { label: `อุบัติเหตุ${accidentDetail ? `: ${accidentDetail}` : ''}`, color: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'illness': return { label: `เจ็บป่วยกะทันหัน${illnessDetail ? `: ${illnessDetail}` : ''}`, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
      case 'vandalism': return { label: 'ทำลายทรัพย์สิน', color: 'bg-purple-100 text-purple-700 border-purple-200' };
      case 'other': return { label: `อื่นๆ: ${otherDetail || ''}`, color: 'bg-slate-100 text-slate-700 border-slate-200' };
      default: return { label: 'ไม่ระบุ', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };"""

replacement_label = """  const getTypeLabel = (type: string, otherDetail?: string, accidentDetail?: string, illnessDetail?: string, fightDetail?: string) => {
    switch (type) {
      case 'fight': return { label: `ทะเลาะวิวาท${fightDetail ? `: ${fightDetail}` : ''}`, color: 'bg-rose-100 text-rose-700 border-rose-200' };
      case 'assault': return { label: `ทำร้ายร่างกาย${fightDetail ? `: ${fightDetail}` : ''}`, color: 'bg-red-100 text-red-700 border-red-200' };
      case 'feud': return { label: 'ความบาดหมาง', color: 'bg-orange-100 text-orange-700 border-orange-200' };
      case 'bullying': return { label: 'กลั่นแกล้ง', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
      case 'misunderstanding': return { label: 'ความเข้าใจผิด', color: 'bg-amber-100 text-amber-700 border-amber-200' };
      case 'disruption': return { label: 'ก่อความวุ่นวาย', color: 'bg-lime-100 text-lime-700 border-lime-200' };
      case 'accident': return { label: `อุบัติเหตุ${accidentDetail ? `: ${accidentDetail}` : ''}`, color: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'illness': return { label: `เจ็บป่วยกะทันหัน${illnessDetail ? `: ${illnessDetail}` : ''}`, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
      case 'vandalism': return { label: 'ทำลายทรัพย์สิน', color: 'bg-purple-100 text-purple-700 border-purple-200' };
      case 'other': return { label: `อื่นๆ: ${otherDetail || ''}`, color: 'bg-slate-100 text-slate-700 border-slate-200' };
      default: return { label: 'ไม่ระบุ', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };"""

content = content.replace(target_label, replacement_label)

target_colors = """  const COLORS = {
    fight: '#f43f5e', // rose-500
    bullying: '#f97316', // orange-500
    disruption: '#f59e0b', // amber-500
    accident: '#3b82f6', // blue-500
    illness: '#10b981', // emerald-500
    vandalism: '#a855f7', // purple-500
    other: '#64748b', // slate-500
  };"""

replacement_colors = """  const COLORS = {
    fight: '#f43f5e', // rose-500
    assault: '#ef4444', // red-500
    feud: '#f97316', // orange-500
    bullying: '#eab308', // yellow-500
    misunderstanding: '#f59e0b', // amber-500
    disruption: '#84cc16', // lime-500
    accident: '#3b82f6', // blue-500
    illness: '#10b981', // emerald-500
    vandalism: '#a855f7', // purple-500
    other: '#64748b', // slate-500
  };"""

content = content.replace(target_colors, replacement_colors)

target_options = """                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="fight">ทะเลาะวิวาท / ทำร้ายร่างกาย</option>
                    <option value="bullying">ความบาดหมาง / กลั่นแกล้ง</option>
                    <option value="disruption">ความเข้าใจผิด / ก่อความวุ่นวาย</option>
                    <option value="accident">อุบัติเหตุ</option>
                    <option value="illness">เจ็บป่วยกะทันหัน</option>
                    <option value="vandalism">ทำลายทรัพย์สิน</option>
                    <option value="other">อื่นๆ</option>
                  </select>"""

replacement_options = """                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="fight">ทะเลาะวิวาท</option>
                    <option value="assault">ทำร้ายร่างกาย</option>
                    <option value="feud">ความบาดหมาง</option>
                    <option value="bullying">กลั่นแกล้ง</option>
                    <option value="misunderstanding">ความเข้าใจผิด</option>
                    <option value="disruption">ก่อความวุ่นวาย</option>
                    <option value="accident">อุบัติเหตุ</option>
                    <option value="illness">เจ็บป่วยกะทันหัน</option>
                    <option value="vandalism">ทำลายทรัพย์สิน</option>
                    <option value="other">อื่นๆ</option>
                  </select>"""

content = content.replace(target_options, replacement_options)

target_fight_detail = """                  {type === 'fight' && (
                    <div className="mt-2 space-y-2">
                      <select"""

replacement_fight_detail = """                  {(type === 'fight' || type === 'assault') && (
                    <div className="mt-2 space-y-2">
                      <select"""

content = content.replace(target_fight_detail, replacement_fight_detail)

target_fight_validation = """|| (type === 'fight' && (!fightDetail.trim() || (fightDetail === 'other' && !otherFightDetail.trim())))"""
replacement_fight_validation = """|| ((type === 'fight' || type === 'assault') && (!fightDetail.trim() || (fightDetail === 'other' && !otherFightDetail.trim())))"""
content = content.replace(target_fight_validation, replacement_fight_validation)

with open('src/components/DisciplineModule.tsx', 'w') as f:
    f.write(content)

