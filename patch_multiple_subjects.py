import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    old_logic = """          const rawGrades = plan.gradeLevel ? plan.gradeLevel.split(',').map(g => g.trim()).filter(Boolean) : ["ประถมศึกษาปีที่ 1"];
          const gradesToProcess = Array.from(new Set(rawGrades));

          for (const grade of gradesToProcess) {
            const settingsId = `${sAcadYear}_${sSem}_${grade}_${plan.subject}`.replace(/[\\/]/g, '-');
            
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
                subject: plan.subject,
                beforeMidKnowledge: [{ id: 'default_bmk_1', name: 'งานที่ 1', maxScore: 20 }],
                beforeMidSoftSkill: [{ id: 'default_bms_1', name: 'พฤติกรรม', maxScore: 10 }],
                afterMidKnowledge: [{ id: 'default_amk_1', name: 'สอบกลางภาค', maxScore: 20 }],
                afterMidSoftSkill: [{ id: 'default_ams_1', name: 'พฤติกรรม', maxScore: 10 }]
              };
            }"""

    new_logic = """          const rawGrades = plan.gradeLevel ? plan.gradeLevel.split(',').map(g => g.trim()).filter(Boolean) : ["ประถมศึกษาปีที่ 1"];
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
              }"""

    if old_logic in code:
        code = code.replace(old_logic, new_logic)
        # Also need to close the extra for loop at the end of the block
        # The block originally ends with:
        #             if (autoCols > 0) { 
        #                await setDoc(settingsRef, currentSettings);
        #             }
        #           }
        #         }
        #       }
        
        old_close_logic = """            if (autoCols > 0) { 
               await setDoc(settingsRef, currentSettings);
            }
          }
        }
      }"""
        
        new_close_logic = """            if (autoCols > 0) { 
               await setDoc(settingsRef, currentSettings);
            }
          }
        }
        }
      }"""
        code = code.replace(old_close_logic, new_close_logic)

        with open(filename, 'w') as f:
            f.write(code)
        print("Success")
    else:
        print("Pattern not found")

fix('src/App.tsx')
