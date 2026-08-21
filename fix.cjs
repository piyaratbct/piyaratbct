const fs = require('fs');
const file = 'src/components/AttachmentManager.tsx';
let content = fs.readFileSync(file, 'utf8');

// The handleImageUpload function string
const dupStr = `  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      alert('เพื่อประหยัดพื้นที่คลาวด์ กรุณาอัปโหลดรูปภาพที่มีขนาดไม่เกิน 1.5MB ค่ะ');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const newAttachment: Attachment = {
        id: \`att-\${Date.now()}-\${Math.random().toString(36).substring(2, 6)}\`,
        type: "image",
        name: file.name,
        url: result,
      };
      onAddAttachment(newAttachment);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };\n`;

// Find first index of dupStr
const idx = content.indexOf(dupStr);
if (idx !== -1) {
  // Replace only the first occurrence with empty string
  content = content.substring(0, idx) + content.substring(idx + dupStr.length);
  fs.writeFileSync(file, content);
  console.log("Success removing duplicate");
} else {
  console.log("Not found");
}
