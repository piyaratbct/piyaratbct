import re

with open('src/components/EvaluationModule.tsx', 'r') as f:
    content = f.read()

# Replace handleActivityScoreChange
old_func = """  const handleActivityScoreChange = (studentId: string, category: keyof Omit<SubjectSettings, 'id' | 'academicYear' | 'semester' | 'gradeLevel' | 'subject'>, activityId: string, value: string) => {
    const numValue = value === '' ? 0 : Number(value);
    const key = `${studentId}_${systemAcademicYear}_${systemSemester}_${selectedSubject}`;
    
    setDraftScores(prev => {
      const existing = prev[key] || {
        id: `sc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        studentId,
        gradeLevel: selectedGrade,
        academicYear: systemAcademicYear || '',
        semester: systemSemester || '',
        subject: selectedSubject,
        teacherId: 'current-teacher', 
        preTestScore: 0, postTestScore: 0,
        beforeMidKnowledgeScore: 0, beforeMidSoftSkillScore: 0,
        midtermScore: 0,
        afterMidKnowledgeScore: 0, afterMidSoftSkillScore: 0,
        finalScore: 0, totalScore: 0, grade: "0",
        activities: {},
        updatedAt: new Date().toISOString()
      };

      const updatedActivities = { ...(existing.activities || {}), [activityId]: numValue };
      
      // Compute the total for the category
      const categorySum = subjectSettings?.[category]?.reduce((sum, act) => sum + (updatedActivities[act.id] || 0), 0) || 0;
      
      const updated = { ...existing, activities: updatedActivities };
      
      // Update the parent score field based on the category
      if (category === 'beforeMidKnowledge') updated.beforeMidKnowledgeScore = categorySum;
      if (category === 'beforeMidSoftSkill') updated.beforeMidSoftSkillScore = categorySum;
      if (category === 'afterMidKnowledge') updated.afterMidKnowledgeScore = categorySum;
      if (category === 'afterMidSoftSkill') updated.afterMidSoftSkillScore = categorySum;

      updated.totalScore = 
        (updated.beforeMidKnowledgeScore || 0) + 
        (updated.beforeMidSoftSkillScore || 0) + 
        (updated.midtermScore || 0) + 
        (updated.afterMidKnowledgeScore || 0) + 
        (updated.afterMidSoftSkillScore || 0) + 
        (updated.finalScore || 0);
      updated.grade = calculateGrade(updated.totalScore);

      return { ...prev, [key]: updated };
    });
  };"""


new_func = """  const handleActivityScoreChange = (studentId: string, category: keyof Omit<SubjectSettings, 'id' | 'academicYear' | 'semester' | 'gradeLevel' | 'subject'>, activityId: string, value: string) => {
    const numValue = value === '' ? 0 : Number(value);
    const key = `${studentId}_${systemAcademicYear}_${systemSemester}_${selectedSubject}`;
    
    setDraftScores(prev => {
      const existing = prev[key] || {
        id: `sc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        studentId,
        gradeLevel: selectedGrade,
        academicYear: systemAcademicYear || '',
        semester: systemSemester || '',
        subject: selectedSubject,
        teacherId: 'current-teacher', 
        preTestScore: 0, postTestScore: 0,
        beforeMidKnowledgeScore: 0, beforeMidSoftSkillScore: 0,
        midtermScore: 0,
        afterMidKnowledgeScore: 0, afterMidSoftSkillScore: 0,
        finalScore: 0, totalScore: 0, grade: "0",
        activities: {},
        updatedAt: new Date().toISOString()
      };

      const updatedActivities = { ...(existing.activities || {}), [activityId]: numValue };
      
      // Compute raw sum and target max
      const rawSum = subjectSettings?.[category]?.reduce((sum, act) => sum + (updatedActivities[act.id] || 0), 0) || 0;
      const rawMaxSum = subjectSettings?.[category]?.reduce((sum, act) => sum + Number(act.maxScore), 0) || 0;
      
      const targetMax = category === 'beforeMidKnowledge' ? 20 : 
                        category === 'beforeMidSoftSkill' ? 10 : 
                        category === 'afterMidKnowledge' ? 20 : 
                        category === 'afterMidSoftSkill' ? 10 : 0;
      
      // Proportional calculation (rounded to 2 decimal places)
      let categorySum = rawSum;
      if (rawMaxSum > 0) {
        categorySum = Number(((rawSum / rawMaxSum) * targetMax).toFixed(2));
      }
      
      const updated = { ...existing, activities: updatedActivities };
      
      // Update the parent score field based on the category
      if (category === 'beforeMidKnowledge') updated.beforeMidKnowledgeScore = categorySum;
      if (category === 'beforeMidSoftSkill') updated.beforeMidSoftSkillScore = categorySum;
      if (category === 'afterMidKnowledge') updated.afterMidKnowledgeScore = categorySum;
      if (category === 'afterMidSoftSkill') updated.afterMidSoftSkillScore = categorySum;

      updated.totalScore = 
        Math.round((updated.beforeMidKnowledgeScore || 0) + 
        (updated.beforeMidSoftSkillScore || 0) + 
        (updated.midtermScore || 0) + 
        (updated.afterMidKnowledgeScore || 0) + 
        (updated.afterMidSoftSkillScore || 0) + 
        (updated.finalScore || 0));
      updated.grade = calculateGrade(updated.totalScore);

      return { ...prev, [key]: updated };
    });
  };"""

content = content.replace(old_func, new_func)

# Also update the UI to show the proportional scores next to raw sum
# In gradesSubTab === 'part1', we need to display part1Total properly. It's already calculating it properly from parent scores
# Let's fix the part1Total calculation inside rendering to use the proportionally scaled values

with open('src/components/EvaluationModule.tsx', 'w') as f:
    f.write(content)

