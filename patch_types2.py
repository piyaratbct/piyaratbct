import re

with open('src/types.ts', 'r') as f:
    content = f.read()

content = content.replace("  month?: string;        // ระบุเพียงเดือนที่ได้ลงบันทึกประเมิน", "  month?: string;        // ระบุเพียงเดือนที่ได้ลงบันทึกประเมิน\n  weight?: number;\n  height?: number;")

with open('src/types.ts', 'w') as f:
    f.write(content)
