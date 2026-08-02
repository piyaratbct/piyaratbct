import re

with open('src/components/LessonLogForm.tsx', 'r') as f:
    content = f.read()

content = content.replace('            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n\n        {/* 7. แนบไฟล์และลิงก์เว็บไซต์ประกอบ */}', '            </div>\n          </div>\n        </div>\n\n        {/* 7. แนบไฟล์และลิงก์เว็บไซต์ประกอบ */}')

with open('src/components/LessonLogForm.tsx', 'w') as f:
    f.write(content)

