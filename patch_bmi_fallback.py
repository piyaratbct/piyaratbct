import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target1 = """            const monthsWithData = Array.from(new Set([
              ...allAssessments
                .filter(a => a.weight !== undefined && a.height !== undefined)
                .map(a => a.month)
                .filter(Boolean) as string[],
              ...(selectedMonth && students.some(s => s.weight !== undefined && s.height !== undefined) ? [selectedMonth] : [])
            ])).sort((a, b) => a.localeCompare(b));"""

replacement1 = """            const currentSystemMonth = new Date().toISOString().slice(0, 7);
            const fallbackMonth = selectedMonth || currentSystemMonth;

            const monthsWithData = Array.from(new Set([
              ...allAssessments
                .filter(a => a.weight !== undefined && a.height !== undefined)
                .map(a => a.month)
                .filter(Boolean) as string[],
              ...(students.some(s => s.weight !== undefined && s.height !== undefined) ? [fallbackMonth] : [])
            ])).sort((a, b) => a.localeCompare(b));"""

content = content.replace(target1, replacement1)

target2 = """                const weight = assessmentForMonth?.weight !== undefined ? assessmentForMonth.weight : (currentChartMonth === selectedMonth || !currentChartMonth ? s.weight : undefined);
                const height = assessmentForMonth?.height !== undefined ? assessmentForMonth.height : (currentChartMonth === selectedMonth || !currentChartMonth ? s.height : undefined);"""

replacement2 = """                const weight = assessmentForMonth?.weight !== undefined ? assessmentForMonth.weight : (currentChartMonth === fallbackMonth ? s.weight : undefined);
                const height = assessmentForMonth?.height !== undefined ? assessmentForMonth.height : (currentChartMonth === fallbackMonth ? s.height : undefined);"""

content = content.replace(target2, replacement2)
content = content.replace(target2, replacement2) # Need to replace twice, as it appears twice for chart

target3 = """                            const weight = assessmentForMonth?.weight !== undefined ? assessmentForMonth.weight : (m === selectedMonth || !m ? student.weight : undefined);
                            const height = assessmentForMonth?.height !== undefined ? assessmentForMonth.height : (m === selectedMonth || !m ? student.height : undefined);"""

replacement3 = """                            const weight = assessmentForMonth?.weight !== undefined ? assessmentForMonth.weight : (m === fallbackMonth ? student.weight : undefined);
                            const height = assessmentForMonth?.height !== undefined ? assessmentForMonth.height : (m === fallbackMonth ? student.height : undefined);"""

content = content.replace(target3, replacement3)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
