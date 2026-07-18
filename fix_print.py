with open('src/components/KindergartenPrintTemplate.tsx', 'r') as f:
    content = f.read()

# Fix studentId issue
content = content.replace('find(a => a.studentId)', 'find(a => (a as any).studentId)')

# Fix PrintSignatureBox props
old_sig = """                <PrintSignatureBox
                  title="ผู้ประเมิน"
                  name={teacher.thaiName}
                  position="ครูประจำชั้น"
                />"""
new_sig = """                <PrintSignatureBox
                  role="ผู้ประเมิน"
                  name={teacher.thaiName}
                  label="ครูประจำชั้น"
                />"""
content = content.replace(old_sig, new_sig)

with open('src/components/KindergartenPrintTemplate.tsx', 'w') as f:
    f.write(content)
