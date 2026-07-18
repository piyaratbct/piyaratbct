with open('src/components/HealthPrintTemplate.tsx', 'r') as f:
    content = f.read()

old_block = """            <div className="flex justify-between items-end mt-12 px-8">
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

new_block = """            <div className="flex justify-end items-end mt-12 px-8">
              <div className="w-64">
                <PrintSignatureBox 
                  role="ครูประจำชั้น/ผู้ประเมิน" 
                  name={teacher.thaiName || teacher.displayName} 
                  label="ลงชื่อ"
                />
              </div>
            </div>"""

content = content.replace(old_block, new_block)

with open('src/components/HealthPrintTemplate.tsx', 'w') as f:
    f.write(content)
