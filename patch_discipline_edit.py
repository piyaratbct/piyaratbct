import re

with open('src/components/DisciplineModule.tsx', 'r') as f:
    content = f.read()

# Fix 1: Submitting logic
target_submit_fight = "fightDetail: type === 'fight' ? (fightDetail === 'other' ? otherFightDetail : fightDetail) : '',"
replacement_submit_fight = "fightDetail: (type === 'fight' || type === 'assault') ? (fightDetail === 'other' ? otherFightDetail : fightDetail) : '',"
content = content.replace(target_submit_fight, replacement_submit_fight)

# Fix 2: Edit mode loading
target_edit_fight = """    if (incident.type === 'fight') {
      const predefinedFights = ['ทะเลาะวิวาทด้วยวาจา (ด่าทอ)', 'ชกต่อย / ตบตี', 'รุมทำร้าย', 'ใช้อาวุธ'];
      if (incident.fightDetail && !predefinedFights.includes(incident.fightDetail)) {
        setFightDetail('other');
        setOtherFightDetail(incident.fightDetail || '');
      } else {
        setFightDetail(incident.fightDetail || '');
        setOtherFightDetail('');
      }
    } else {
      setFightDetail('');
      setOtherFightDetail('');
    }"""

replacement_edit_fight = """    if (incident.type === 'fight' || incident.type === 'assault') {
      const predefinedFights = ['ทะเลาะวิวาทด้วยวาจา (ด่าทอ)', 'ชกต่อย / ตบตี', 'รุมทำร้าย', 'ใช้อาวุธ'];
      if (incident.fightDetail && !predefinedFights.includes(incident.fightDetail)) {
        setFightDetail('other');
        setOtherFightDetail(incident.fightDetail || '');
      } else {
        setFightDetail(incident.fightDetail || '');
        setOtherFightDetail('');
      }
    } else {
      setFightDetail('');
      setOtherFightDetail('');
    }"""

content = content.replace(target_edit_fight, replacement_edit_fight)

with open('src/components/DisciplineModule.tsx', 'w') as f:
    f.write(content)

