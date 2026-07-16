import re

with open('src/components/HealthPrintTemplate.tsx', 'r') as f:
    content = f.read()

# Fix imports
content = content.replace("import { formatThaiMonthYear, parseISOToThaiDate } from '../lib/dateUtils';", "")

# Fix signatures
old_signatures = """            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 mt-12">
              <PrintSignatureBox 
                title="ครูประจำวิชา/ผู้ประเมิน" 
                name={teacher.thaiName || teacher.email} 
              />
              <PrintSignatureBox 
                title="ผู้ปกครอง" 
                name=" " 
              />
            </div>"""

new_signatures = """            {/* Signatures */}
            <div className="flex justify-between items-end mt-12 px-8">
              <div className="w-64">
                <PrintSignatureBox 
                  role="ผู้ปกครอง" 
                  name=" " 
                  label="ลงชื่อ"
                />
              </div>
              <div className="w-64">
                <PrintSignatureBox 
                  role="ครูประจำชั้น/ผู้ประเมิน" 
                  name={teacher.thaiName || teacher.displayName} 
                  label="ลงชื่อ"
                />
              </div>
            </div>"""
            
content = content.replace(old_signatures, new_signatures)

with open('src/components/HealthPrintTemplate.tsx', 'w') as f:
    f.write(content)
