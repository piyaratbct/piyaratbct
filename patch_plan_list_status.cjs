const fs = require('fs');
let code = fs.readFileSync('src/components/LessonPlanList.tsx', 'utf8');

const targetSelect = `              <option value="ทั้งหมด">สถานะ: ทุกสถานะ</option>
              <option value="draft">ยังไม่อนุมัติ (Draft) ⚪</option>
              <option value="approved">อนุมัติแล้ว (Approved) 🟢</option>
              <option value="rejected">ตีกลับให้แก้ (Rejected) 🔴</option>`;

const replacementSelect = `              <option value="ทั้งหมด">สถานะ: ทุกสถานะ</option>
              <option value="draft">ฉบับร่าง (Draft) ⚪</option>
              <option value="submitted">รอประเมิน (Submitted) 🔵</option>
              <option value="approved">อนุมัติแล้ว (Approved) 🟢</option>
              <option value="rejected">ตีกลับให้แก้ (Rejected) 🔴</option>`;

code = code.replace(targetSelect, replacementSelect);
fs.writeFileSync('src/components/LessonPlanList.tsx', code, 'utf8');
