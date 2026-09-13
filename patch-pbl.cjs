const fs = require('fs');

let content = fs.readFileSync('src/components/PBLLessonPlanForm.tsx', 'utf8');

const targetStr = `  // Calculate remaining indicators
  let totalRemaining = 0;
  curriculums.forEach(curr => {
    curr.standards?.forEach((std: any) => {
      std.indicators?.forEach((ind: any) => {
        if (!usedIndicators.has(ind.code)) {
          totalRemaining++;
        }
      });
    });
  });`;

const newTargetStr = `  // Calculate remaining indicators
  let totalIndicatorsInCurriculum = 0;
  let totalRemaining = 0;
  curriculums.forEach(curr => {
    curr.standards?.forEach((std: any) => {
      std.indicators?.forEach((ind: any) => {
        totalIndicatorsInCurriculum++;
        if (!usedIndicators.has(ind.code)) {
          totalRemaining++;
        }
      });
    });
  });`;

content = content.replace(targetStr, newTargetStr);

const msgTargetStr = `                    {curriculums.length === 0 
                      ? 'ไม่พบข้อมูลหลักสูตรสำหรับวิชาและชั้นเรียนที่เลือก'
                      : totalRemaining === 0 
                        ? 'คุณได้นำตัวชี้วัดทั้งหมดไปใช้ในแผนการสอนครบถ้วนแล้ว เยี่ยมมาก!'
                        : \`คุณมีตัวชี้วัดที่ยังไม่ได้ระบุในแผนการสอนใดเลย จำนวน \${totalRemaining} ตัวชี้วัด\`}
                  </p>`;

const newMsgTargetStr = `                    {curriculums.length === 0 
                      ? 'ไม่พบข้อมูลหลักสูตรสำหรับวิชาและชั้นเรียนที่เลือก'
                      : totalIndicatorsInCurriculum === 0
                        ? 'ยังไม่ได้เพิ่มข้อมูลตัวชี้วัดในวิชานี้ (ไปที่เมนูจัดการหลักสูตร)'
                      : totalRemaining === 0 
                        ? 'คุณได้นำตัวชี้วัดทั้งหมดไปใช้ในแผนการสอนครบถ้วนแล้ว เยี่ยมมาก!'
                        : \`คุณมีตัวชี้วัดที่ยังไม่ได้ระบุในแผนการสอนใดเลย จำนวน \${totalRemaining} ตัวชี้วัด\`}
                  </p>`;

content = content.replace(msgTargetStr, newMsgTargetStr);

fs.writeFileSync('src/components/PBLLessonPlanForm.tsx', content);
console.log("Patched PBLLessonPlanForm.tsx");
