import re

with open('src/components/DisciplineModule.tsx', 'r') as f:
    content = f.read()

target1 = """                        <option value="เลือดกำเดาไหล">เลือดกำเดาไหล</option>"""
content = content.replace(target1, "")

target2 = """                        <option value="ปวดท้อง">ปวดท้อง</option>
                        <option value="ปวดหัว">ปวดหัว</option>
                        <option value="มีไข้ ตัวร้อน">มีไข้ ตัวร้อน</option>
                        <option value="อาการแพ้อาหาร">อาการแพ้อาหาร</option>"""
replacement2 = """                        <option value="เลือดกำเดาไหล">เลือดกำเดาไหล</option>
                        <option value="ปวดท้อง">ปวดท้อง</option>
                        <option value="ปวดหัว">ปวดหัว</option>
                        <option value="มีไข้ ตัวร้อน">มีไข้ ตัวร้อน</option>
                        <option value="อาการแพ้อาหาร">อาการแพ้อาหาร</option>"""
content = content.replace(target2, replacement2)

target3 = """const predefinedAccidents = ['หกล้ม / ลื่นล้ม', 'วิ่งชน / วิ่งปะทะ', 'อุบัติเหตุจากการทำกิจกรรม เช่น เล่นกีฬา', 'ถูกของมีคมบาด', 'ประตู/หน้าต่าง/โต๊ะหนีบ'];"""
content = content.replace(target3, """const predefinedAccidents = ['หกล้ม / ลื่นล้ม', 'วิ่งชน / วิ่งปะทะ', 'อุบัติเหตุจากการทำกิจกรรม เช่น เล่นกีฬา', 'ถูกของมีคมบาด', 'ประตู/หน้าต่าง/โต๊ะหนีบ'];""")

target4 = """const predefinedIllness = ['ปวดท้อง', 'ปวดหัว', 'มีไข้ ตัวร้อน', 'อาการแพ้อาหาร'];"""
replacement4 = """const predefinedIllness = ['เลือดกำเดาไหล', 'ปวดท้อง', 'ปวดหัว', 'มีไข้ ตัวร้อน', 'อาการแพ้อาหาร'];"""
content = content.replace(target4, replacement4)

with open('src/components/DisciplineModule.tsx', 'w') as f:
    f.write(content)
