import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

# 1. Update bmiByGrade calculation (line ~1390)
target1 = """                                if (weight && height) {
                  bmiByGrade[grade].total++;
                  const heightM = height / 100;
                  const bmi = weight / (heightM * heightM);
                  
                  let ageYears = 7;
                  if (s.dob) {
                    const birthDate = new Date(s.dob);
                    const now = new Date();
                    let years = now.getFullYear() - birthDate.getFullYear();
                    let months = now.getMonth() - birthDate.getMonth();
                    if (months < 0 || (months === 0 && now.getDate() < birthDate.getDate())) {
                      years--;
                    }
                    ageYears = years;
                  }
                  
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

replacement1 = """                                if (weight && height && s.dob) {
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
content = content.replace(target1, replacement1)

# 2. Update displayedStudents pie chart calculation (line ~1440)
target2 = """                                if (weight && height) {
                  const heightM = height / 100;
                  const bmi = weight / (heightM * heightM);
                  
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
                }"""

replacement2 = """                                if (weight && height && s.dob) {
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
content = content.replace(target2, replacement2)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
