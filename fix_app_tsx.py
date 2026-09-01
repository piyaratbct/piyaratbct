import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    # The block starts right after `if (autoEvals.length > 0) {`
    # and ends before `if (newlyAdded.length > 0 && currentTeacher) {`
    
    pattern = re.compile(r'const rawGrades = plan\.gradeLevel \?.*?(?=if \(newlyAdded\.length > 0 && currentTeacher\) \{)', re.DOTALL)
    
    new_code = """const rawGrades = plan.gradeLevel ? plan.gradeLevel.split(',').map(g => g.trim()).filter(Boolean) : ["ประถมศึกษาปีที่ 1"];
          const gradesToProcess = Array.from(new Set(rawGrades));
          
          let subjectsToProcess = [plan.subject];
          if (plan.isIntegrated && plan.integratedSubjects) {
            const extraSubjects = plan.integratedSubjects.split(',').map(s => s.trim()).filter(Boolean);
            subjectsToProcess = Array.from(new Set([...subjectsToProcess, ...extraSubjects]));
          }

          for (const subject of subjectsToProcess) {
            for (const grade of gradesToProcess) {
              const settingsId = `${sAcadYear}_${sSem}_${grade}_${subject}`.replace(/[\\/]/g, '-');
              
              const settingsRef = doc(db, "subject_settings", settingsId);
              const docSnap = await getDoc(settingsRef);
              
              let currentSettings = null;
              if (docSnap.exists()) {
                currentSettings = docSnap.data();
                if (!currentSettings.beforeMidKnowledge) currentSettings.beforeMidKnowledge = [];
                if (!currentSettings.beforeMidSoftSkill) currentSettings.beforeMidSoftSkill = [];
                if (!currentSettings.afterMidKnowledge) currentSettings.afterMidKnowledge = [];
                if (!currentSettings.afterMidSoftSkill) currentSettings.afterMidSoftSkill = [];
              } else {
                currentSettings = {
                  id: settingsId,
                  academicYear: sAcadYear,
                  semester: sSem,
                  gradeLevel: grade,
                  subject: subject,
                  beforeMidKnowledge: [{ id: 'default_bmk_1', name: 'งานที่ 1', maxScore: 20 }],
                  beforeMidSoftSkill: [{ id: 'default_bms_1', name: 'พฤติกรรม', maxScore: 10 }],
                  afterMidKnowledge: [{ id: 'default_amk_1', name: 'สอบกลางภาค', maxScore: 20 }],
                  afterMidSoftSkill: [{ id: 'default_ams_1', name: 'พฤติกรรม', maxScore: 10 }]
                };
              }
              
              let autoCols = 0;
              for (const ev of autoEvals) { 
                 if (!ev.name || ev.name.trim() === '') continue;
                 
                 // Determine which category to push to based on KPA and scorePeriod
                 const isAfter = ev.scorePeriod === 'after_mid';
                 const isSoftSkill = ev.kpa && ev.kpa.includes('A') && !ev.kpa.includes('K') && !ev.kpa.includes('P');
                 
                 let targetArray = currentSettings.beforeMidKnowledge;
                 if (isAfter && isSoftSkill) targetArray = currentSettings.afterMidSoftSkill;
                 else if (isAfter && !isSoftSkill) targetArray = currentSettings.afterMidKnowledge;
                 else if (!isAfter && isSoftSkill) targetArray = currentSettings.beforeMidSoftSkill;
                 else targetArray = currentSettings.beforeMidKnowledge; // default (!isAfter && !isSoftSkill)
                 
                 const exists = targetArray.find((c) => c.name === ev.name);
                 if (!exists) {
                     targetArray.push({
                        id: ev.id || `eval_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                        name: ev.name,
                        maxScore: ev.maxScore || 10
                     });
                     autoCols++;
                     autoColsToastCount++;
                 }
              }
              
              if (autoCols > 0) { 
                 await setDoc(settingsRef, currentSettings);
              }
            }
          }
        }
      }
      
      """
      
    if pattern.search(code):
        code = pattern.sub(new_code, code)
        with open(filename, 'w') as f:
            f.write(code)
        print("Success")
    else:
        print("Pattern not found")

fix('src/App.tsx')
