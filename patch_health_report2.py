import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """          {activeTab === "health-report" && (() => {
            const monthsWithData = Array.from(new Set(
              allAssessments
                .filter(a => a.weight !== undefined && a.height !== undefined)
                .map(a => a.month)
                .filter(Boolean) as string[]
            )).sort((a, b) => a.localeCompare(b));

            const displayMonths = monthsWithData.slice(-4);

            return (
              <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">"""

replacement = """          {activeTab === "health-report" && (() => {
            const monthsWithData = Array.from(new Set(
              allAssessments
                .filter(a => a.weight !== undefined && a.height !== undefined)
                .map(a => a.month)
                .filter(Boolean) as string[]
            )).sort((a, b) => a.localeCompare(b));

            // If selectedMonth is set, show up to that month. Otherwise show all available.
            const filteredMonthsWithData = selectedMonth 
              ? monthsWithData.filter(m => m <= selectedMonth) 
              : monthsWithData;
              
            const displayMonths = filteredMonthsWithData.slice(-4);
            const currentChartMonth = selectedMonth || (displayMonths.length > 0 ? displayMonths[displayMonths.length - 1] : '');

            const bmiDataCount = {
              underweight: 0,
              normal: 0,
              overweight: 0,
              obese1: 0,
              obese2: 0,
            };

            if (currentChartMonth) {
              students.forEach(s => {
                const assessmentForMonth = allAssessments.find(a => a.studentId === s.id && a.month === currentChartMonth);
                const weight = assessmentForMonth?.weight;
                const height = assessmentForMonth?.height;
                
                if (weight && height) {
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
                }
              });
            }

            const bmiData = [
              { name: 'ผอม/น้ำหนักน้อย', value: bmiDataCount.underweight, fill: '#3b82f6' },
              { name: 'สมส่วน', value: bmiDataCount.normal, fill: '#22c55e' },
              { name: 'ท้วม', value: bmiDataCount.overweight, fill: '#eab308' },
              { name: 'เริ่มอ้วน', value: bmiDataCount.obese1, fill: '#f97316' },
              { name: 'อ้วน', value: bmiDataCount.obese2, fill: '#ef4444' },
            ].filter(item => item.value > 0);

            return (
              <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">"""

content = content.replace(target, replacement)

target2 = """                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-max">"""

replacement2 = """                {bmiData.length > 0 && (
                  <div className="mb-8 bg-white border border-slate-100 rounded-xl p-5 shadow-sm max-w-lg mx-auto">
                    <h4 className="font-bold text-slate-700 mb-4 text-center">
                      ประเมินน้ำหนัก/ส่วนสูง (BMI) {currentChartMonth && `ประจำเดือน ${formatThaiMonthYear(currentChartMonth + '-01')}`}
                    </h4>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={bmiData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ percent }) => percent < 0.1 ? '' : `${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {bmiData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            formatter={(value) => [`${value} คน`, 'จำนวน']}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-max">"""

content = content.replace(target2, replacement2)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
