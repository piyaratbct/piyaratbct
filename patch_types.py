import re

with open('src/types.ts', 'r') as f:
    content = f.read()

target = """  content: string;      // สาระการจัดการเรียนรู้
  activities: string;   // กิจกรรมการเรียนการสอน
  limitations: string;  // ข้อจำกัดในการจัดการเรียนการสอน
  suggestions: string;  // ข้อเสนอแนะ/ความคิดเห็นของผู้สอน"""

replacement = """  content: string;      // สาระการจัดการเรียนรู้
  activities: string;   // กิจกรรมการเรียนการสอน
  limitations: string;  // ข้อจำกัดในการจัดการเรียนการสอน
  suggestions: string;  // ข้อเสนอแนะ/ความคิดเห็นของผู้สอน
  strengths?: string;   // จุดเด่นในการสอนครั้งนี้"""

content = content.replace(target, replacement)
with open('src/types.ts', 'w') as f:
    f.write(content)

