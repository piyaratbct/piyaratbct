import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

# Replace BMI calculation section
target = """                                    const h = student.height / 100;
                                    const bmi = student.weight / (h * h);
                                    let label = '';
                                    let color = '';
                                    if (bmi < 18.5) { label = 'น้ำหนักน้อย'; color = 'text-blue-600 bg-blue-50 border-blue-100'; }
                                    else if (bmi < 23) { label = 'สมส่วน'; color = 'text-green-600 bg-green-50 border-green-100'; }
                                    else if (bmi < 25) { label = 'น้ำหนักเกิน'; color = 'text-yellow-600 bg-yellow-50 border-yellow-100'; }
                                    else if (bmi < 30) { label = 'อ้วนระดับ 1'; color = 'text-orange-600 bg-orange-50 border-orange-100'; }
                                    else { label = 'อ้วนระดับ 2'; color = 'text-red-600 bg-red-50 border-red-100'; }"""

replacement = """                                    const h = student.height / 100;
                                    const bmi = student.weight / (h * h);
                                    
                                    // คำนวณอายุจากวันเกิดเพื่อใช้เกณฑ์คร่าวๆ (ถ้ามี)
                                    let ageYears = 7; // ค่าเริ่มต้นประถมต้น
                                    if (student.dob) {
                                      const birthDate = new Date(student.dob);
                                      const ageDifMs = Date.now() - birthDate.getTime();
                                      const ageDate = new Date(ageDifMs);
                                      ageYears = Math.abs(ageDate.getUTCFullYear() - 1970);
                                    }
                                    
                                    let label = '';
                                    let color = '';
                                    // อ้างอิงเกณฑ์ BMI กรมอนามัยแบบคร่าวๆ สำหรับเด็กวัยเรียน (อายุประมาณ 6-12 ปี)
                                    // ผอม < 14, ค่อนข้างผอม 14-15, สมส่วน 15-19, ท้วม 19-21, เริ่มอ้วน 21-23, อ้วน > 23
                                    // ปรับตามอายุแบบง่าย
                                    const baseNormal = 14 + (ageYears - 6) * 0.3; // ขยับขึ้นตามอายุ
                                    const baseOverweight = 18 + (ageYears - 6) * 0.5;
                                    const baseObese1 = 20 + (ageYears - 6) * 0.6;
                                    const baseObese2 = 22 + (ageYears - 6) * 0.7;

                                    if (bmi < baseNormal) { label = 'ผอม/น้ำหนักน้อย'; color = 'text-blue-600 bg-blue-50 border-blue-100'; }
                                    else if (bmi < baseOverweight) { label = 'สมส่วน'; color = 'text-green-600 bg-green-50 border-green-100'; }
                                    else if (bmi < baseObese1) { label = 'ท้วม'; color = 'text-yellow-600 bg-yellow-50 border-yellow-100'; }
                                    else if (bmi < baseObese2) { label = 'เริ่มอ้วน'; color = 'text-orange-600 bg-orange-50 border-orange-100'; }
                                    else { label = 'อ้วน'; color = 'text-red-600 bg-red-50 border-red-100'; }"""

content = content.replace(target, replacement)

target2 = """            const bmiDataCount = {
              underweight: 0,
              normal: 0,
              overweight: 0,
              obese1: 0,
              obese2: 0,
            };

            students.forEach(s => {
              if (s.weight && s.height) {
                const heightM = s.height / 100;
                const bmi = s.weight / (heightM * heightM);
                if (bmi < 18.5) bmiDataCount.underweight++;
                else if (bmi < 23) bmiDataCount.normal++;
                else if (bmi < 25) bmiDataCount.overweight++;
                else if (bmi < 30) bmiDataCount.obese1++;
                else bmiDataCount.obese2++;
              }
            });

            const bmiData = [
              { name: 'น้ำหนักน้อย', value: bmiDataCount.underweight, fill: '#3b82f6' },
              { name: 'สมส่วน', value: bmiDataCount.normal, fill: '#22c55e' },
              { name: 'น้ำหนักเกิน', value: bmiDataCount.overweight, fill: '#eab308' },
              { name: 'อ้วนระดับ 1', value: bmiDataCount.obese1, fill: '#f97316' },
              { name: 'อ้วนระดับ 2', value: bmiDataCount.obese2, fill: '#ef4444' },
            ].filter(item => item.value > 0);"""

replacement2 = """            const bmiDataCount = {
              underweight: 0,
              normal: 0,
              overweight: 0,
              obese1: 0,
              obese2: 0,
            };

            students.forEach(s => {
              if (s.weight && s.height) {
                const heightM = s.height / 100;
                const bmi = s.weight / (heightM * heightM);
                
                let ageYears = 7;
                if (s.dob) {
                  const birthDate = new Date(s.dob);
                  const ageDifMs = Date.now() - birthDate.getTime();
                  ageYears = Math.abs(new Date(ageDifMs).getUTCFullYear() - 1970);
                }
                
                const baseNormal = 14 + (ageYears - 6) * 0.3;
                const baseOverweight = 18 + (ageYears - 6) * 0.5;
                const baseObese1 = 20 + (ageYears - 6) * 0.6;
                const baseObese2 = 22 + (ageYears - 6) * 0.7;

                if (bmi < baseNormal) bmiDataCount.underweight++;
                else if (bmi < baseOverweight) bmiDataCount.normal++;
                else if (bmi < baseObese1) bmiDataCount.overweight++;
                else if (bmi < baseObese2) bmiDataCount.obese1++;
                else bmiDataCount.obese2++;
              }
            });

            const bmiData = [
              { name: 'ผอม/น้ำหนักน้อย', value: bmiDataCount.underweight, fill: '#3b82f6' },
              { name: 'สมส่วน', value: bmiDataCount.normal, fill: '#22c55e' },
              { name: 'ท้วม', value: bmiDataCount.overweight, fill: '#eab308' },
              { name: 'เริ่มอ้วน', value: bmiDataCount.obese1, fill: '#f97316' },
              { name: 'อ้วน', value: bmiDataCount.obese2, fill: '#ef4444' },
            ].filter(item => item.value > 0);"""

content = content.replace(target2, replacement2)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
