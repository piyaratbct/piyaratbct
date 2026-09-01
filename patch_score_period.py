import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    old_logic = """            let autoCols = 0;
            // Append new columns to beforeMidKnowledge
            for (const ev of autoEvals) { 
               // Check if it already exists by name (very basic duplicate prevention)
               // and prevent adding if name is empty
               if (!ev.name || ev.name.trim() === '') continue;
               
               const exists = currentSettings.beforeMidKnowledge.find((c) => c.name === ev.name);
               if (!exists) {
                   currentSettings.beforeMidKnowledge.push({
                      id: ev.id || `eval_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                      name: ev.name,
                      maxScore: ev.maxScore || 10
                   });
                   autoCols++;
                   autoColsToastCount++; // Only increment overall if we added it (though multiplied by grades)
               }
            }"""

    new_logic = """            let autoCols = 0;
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
            }"""

    code = code.replace(old_logic, new_logic)

    with open(filename, 'w') as f:
        f.write(code)

fix('src/App.tsx')
