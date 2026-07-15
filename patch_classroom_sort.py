import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """  displayedStudents.sort((a, b) => {
    if (a.gradeLevel !== b.gradeLevel) {
      return (a.gradeLevel || '').localeCompare(b.gradeLevel || '', 'th');
    }
    return (a.number || 0) - (b.number || 0);
  });"""

replacement = """  displayedStudents.sort((a, b) => {
    if (a.gradeLevel !== b.gradeLevel) {
      const isKinderA = (a.gradeLevel || '').startsWith('อนุบาล');
      const isKinderB = (b.gradeLevel || '').startsWith('อนุบาล');
      if (isKinderA && !isKinderB) return -1;
      if (!isKinderA && isKinderB) return 1;
      return (a.gradeLevel || '').localeCompare(b.gradeLevel || '', 'th', { numeric: true });
    }
    return (a.number || 0) - (b.number || 0);
  });"""

content = content.replace(target, replacement)

target2 = """            ).sort((a, b) => {
              if (a.gradeLevel !== b.gradeLevel) {
                return (a.gradeLevel || '').localeCompare(b.gradeLevel || '', 'th');
              }
              return (a.number || 0) - (b.number || 0);
            });"""

replacement2 = """            ).sort((a, b) => {
              if (a.gradeLevel !== b.gradeLevel) {
                const isKinderA = (a.gradeLevel || '').startsWith('อนุบาล');
                const isKinderB = (b.gradeLevel || '').startsWith('อนุบาล');
                if (isKinderA && !isKinderB) return -1;
                if (!isKinderA && isKinderB) return 1;
                return (a.gradeLevel || '').localeCompare(b.gradeLevel || '', 'th', { numeric: true });
              }
              return (a.number || 0) - (b.number || 0);
            });"""

content = content.replace(target2, replacement2)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
