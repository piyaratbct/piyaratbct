const fs = require('fs');
const file = 'src/components/AttachmentManager.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `      <div>
        <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Paperclip className="h-4 w-4 text-blue-600" />
          แนบสื่อการจัดการเรียนการสอน (ลิงก์เว็บ หรือคลาวด์ภายนอก)
        </label>
        <p className="text-[10px] text-slate-400 mt-0.5">
          แนบลิงก์แหล่งการเรียนรู้ แผนการสอนดิจิทัล หรือใบงาน PDF ที่นี่
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!isCompact && (
          <div className="bg-gradient-to-br from-indigo-50/40 to-sky-50/30 p-4 rounded-xl border border-sky-100/60 flex flex-col justify-between space-y-2">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-black text-blue-900 bg-blue-100/70 px-2 py-0.5 rounded-md border border-blue-200">
                💡 คำแนะนำในการเก็บไฟล์รูปภาพ/วิดีโอ/PDF
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600 font-medium">
                เนื่องจากระบบใช้พลังงานประมวลผลบนคลาวด์ร่วมกัน
                เพื่อประสิทธิภาพและความรวดเร็วในการจัดทำเอกสาร
                <span className="text-slate-800 font-bold">
                  {" "}
                  แนะนำให้คุณครูบันทึกไฟล์แผนการสอนฉบับเต็ม PDF หรือสื่อการสอน
                  ไว้ทาง Google Drive ส่วนตัวหรือสถาบันของตนเอง
                </span>
                แล้วคัดลอก "ลิงก์แชร์ที่ทุกคนมีสิทธิ์อ่าน"
                นำมาวางในช่องแชร์ลิงก์ทางด้านขวามือเพื่อความสะดวกรวดเร็วครับ/ค่ะ
              </p>
            </div>
            <div className="pt-2 border-t border-sky-100/80 flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400">
                ตัวอย่าง: https://drive.google.com/drive/...
              </span>
            </div>
          </div>
        )}

        <div className={\`bg-white p-4 rounded-xl border border-slate-150 flex flex-col justify-center space-y-3 \${isCompact ? 'md:col-span-2' : ''}\`}>`;

const replacement = `      <div>
        <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Paperclip className="h-4 w-4 text-blue-600" />
          แนบสื่อการสอน และรูปภาพหลักฐานการสอน (SAR)
        </label>
        <p className="text-[10px] text-slate-400 mt-0.5">
          แนบลิงก์แผนการสอน รูปภาพกิจกรรม หรือใบงาน เพื่อเป็นหลักฐานสำหรับการประเมิน SAR
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Upload Image Section */}
        <div className="bg-white p-4 rounded-xl border border-slate-150 flex flex-col justify-center space-y-3">
          <span className="block text-[11px] font-bold text-slate-700 flex items-center gap-1">
            <FileImage className="h-4 w-4 text-emerald-500" />
            อัปโหลดรูปภาพหลักฐาน (จากเครื่อง)
          </span>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            อัปโหลดรูปภาพกิจกรรมการเรียนการสอน ผลงานนักเรียน หรือสื่อการสอน (ขนาดไม่เกิน 1.5MB)
          </p>
          <div className="mt-2">
            <label className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-emerald-50 text-emerald-700 border-2 border-dashed border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-colors rounded-lg cursor-pointer">
              <Upload className="h-4 w-4" />
              <span className="text-[11px] font-bold">เลือกรูปภาพเพื่ออัปโหลด</span>
              <input 
                type="file" 
                accept="image/jpeg, image/png, image/webp"
                className="hidden" 
                onChange={handleImageUpload} 
              />
            </label>
          </div>
        </div>
        
        {/* Link Attachment Section */}
        <div className={\`bg-white p-4 rounded-xl border border-slate-150 flex flex-col justify-center space-y-3 \${isCompact ? 'md:col-span-2' : ''}\`}>`;

if (content.indexOf(targetStr) !== -1) {
  content = content.replace(targetStr, replacement);
  fs.writeFileSync(file, content);
  console.log("Success replacing layout");
} else {
  console.log("Not found layout");
}
