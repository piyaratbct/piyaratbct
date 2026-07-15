import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target1 = """            const bmiDataCount = {
              underweight: 0,
              normal: 0,
              overweight: 0,
              obese1: 0,
              obese2: 0,
            };"""

replacement1 = """            const bmiDataCount = {
              underweight: 0,
              normal: 0,
              overweight: 0,
              obese1: 0,
              obese2: 0,
              unknown: 0,
            };"""
content = content.replace(target1, replacement1)

target2 = """            const bmiByGrade: Record<string, { grade: string, underweight: number, normal: number, overweight: number, obese1: number, obese2: number, total: number }> = {};"""

replacement2 = """            const bmiByGrade: Record<string, { grade: string, underweight: number, normal: number, overweight: number, obese1: number, obese2: number, unknown: number, total: number }> = {};"""
content = content.replace(target2, replacement2)

target3 = """                  bmiByGrade[grade] = { grade, underweight: 0, normal: 0, overweight: 0, obese1: 0, obese2: 0, total: 0 };"""

replacement3 = """                  bmiByGrade[grade] = { grade, underweight: 0, normal: 0, overweight: 0, obese1: 0, obese2: 0, unknown: 0, total: 0 };"""
content = content.replace(target3, replacement3)


target4 = """                                if (weight && height && s.dob) {
                  bmiByGrade[grade].total++;
                  const heightM = height / 100;
                  const bmi = weight / (heightM * heightM);
                  
                  const birthDate = new Date(s.dob);
                  const targetDate = currentChartMonth ? new Date(`${currentChartMonth}-01`) : new Date();
                  let years = targetDate.getFullYear() - birthDate.getFullYear();
                  if (targetDate.getMonth() < birthDate.getMonth()) {
                    years--;
                  }
                  const ageYears = years;
                  
                  const baseNormal = 14 + (ageYears - 6) * 0.3;
                  const baseOverweight = 18 + (ageYears - 6) * 0.5;
                  const baseObese1 = 20 + (ageYears - 6) * 0.6;
                  const baseObese2 = 22 + (ageYears - 6) * 0.7;

                  if (bmi < baseNormal) bmiByGrade[grade].underweight++;
                  else if (bmi < baseOverweight) bmiByGrade[grade].normal++;
                  else if (bmi < baseObese1) bmiByGrade[grade].overweight++;
                  else if (bmi < baseObese2) bmiByGrade[grade].obese1++;
                  else bmiByGrade[grade].obese2++;
                }"""

replacement4 = """                                if (weight && height) {
                  bmiByGrade[grade].total++;
                  const heightM = height / 100;
                  const bmi = weight / (heightM * heightM);
                  
                  if (!s.dob) {
                    bmiByGrade[grade].unknown++;
                  } else {
                    const birthDate = new Date(s.dob);
                    const targetDate = currentChartMonth ? new Date(`${currentChartMonth}-01`) : new Date();
                    let years = targetDate.getFullYear() - birthDate.getFullYear();
                    if (targetDate.getMonth() < birthDate.getMonth()) {
                      years--;
                    }
                    const ageYears = years;
                    
                    const baseNormal = 14 + (ageYears - 6) * 0.3;
                    const baseOverweight = 18 + (ageYears - 6) * 0.5;
                    const baseObese1 = 20 + (ageYears - 6) * 0.6;
                    const baseObese2 = 22 + (ageYears - 6) * 0.7;

                    if (bmi < baseNormal) bmiByGrade[grade].underweight++;
                    else if (bmi < baseOverweight) bmiByGrade[grade].normal++;
                    else if (bmi < baseObese1) bmiByGrade[grade].overweight++;
                    else if (bmi < baseObese2) bmiByGrade[grade].obese1++;
                    else bmiByGrade[grade].obese2++;
                  }
                }"""
content = content.replace(target4, replacement4)


target5 = """                                if (weight && height && s.dob) {
                  const heightM = height / 100;
                  const bmi = weight / (heightM * heightM);
                  
                  const birthDate = new Date(s.dob);
                  const targetDate = currentChartMonth ? new Date(`${currentChartMonth}-01`) : new Date();
                  let years = targetDate.getFullYear() - birthDate.getFullYear();
                  if (targetDate.getMonth() < birthDate.getMonth()) {
                    years--;
                  }
                  const ageYears = years;
                  
                  const baseNormal = 14 + (ageYears - 6) * 0.3;
                  const baseOverweight = 18 + (ageYears - 6) * 0.5;
                  const baseObese1 = 20 + (ageYears - 6) * 0.6;
                  const baseObese2 = 22 + (ageYears - 6) * 0.7;

                  if (bmi < baseNormal) bmiDataCount.underweight++;
                  else if (bmi < baseOverweight) bmiDataCount.normal++;
                  else if (bmi < baseObese1) bmiDataCount.overweight++;
                  else if (bmi < baseObese2) bmiDataCount.obese1++;
                  else bmiDataCount.obese2++;
                }"""

replacement5 = """                                if (weight && height) {
                  const heightM = height / 100;
                  const bmi = weight / (heightM * heightM);
                  
                  if (!s.dob) {
                    bmiDataCount.unknown++;
                  } else {
                    const birthDate = new Date(s.dob);
                    const targetDate = currentChartMonth ? new Date(`${currentChartMonth}-01`) : new Date();
                    let years = targetDate.getFullYear() - birthDate.getFullYear();
                    if (targetDate.getMonth() < birthDate.getMonth()) {
                      years--;
                    }
                    const ageYears = years;
                    
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
                }"""
content = content.replace(target5, replacement5)


target6 = """            const bmiData = [
              { name: 'ผอม/น้ำหนักน้อย', value: bmiDataCount.underweight, fill: '#3b82f6' },
              { name: 'สมส่วน', value: bmiDataCount.normal, fill: '#22c55e' },
              { name: 'ท้วม', value: bmiDataCount.overweight, fill: '#eab308' },
              { name: 'เริ่มอ้วน', value: bmiDataCount.obese1, fill: '#f97316' },
              { name: 'อ้วน', value: bmiDataCount.obese2, fill: '#ef4444' },
            ].filter(item => item.value > 0);"""

replacement6 = """            const bmiData = [
              { name: 'ผอม/น้ำหนักน้อย', value: bmiDataCount.underweight, fill: '#3b82f6' },
              { name: 'สมส่วน', value: bmiDataCount.normal, fill: '#22c55e' },
              { name: 'ท้วม', value: bmiDataCount.overweight, fill: '#eab308' },
              { name: 'เริ่มอ้วน', value: bmiDataCount.obese1, fill: '#f97316' },
              { name: 'อ้วน', value: bmiDataCount.obese2, fill: '#ef4444' },
              { name: 'ขาดวันเกิด (คำนวณไม่ได้)', value: bmiDataCount.unknown, fill: '#94a3b8' },
            ].filter(item => item.value > 0);"""
content = content.replace(target6, replacement6)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
