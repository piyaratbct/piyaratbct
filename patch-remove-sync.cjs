const fs = require('fs');
let content = fs.readFileSync('src/components/ClassroomHub.tsx', 'utf8');

// Replace the sync block with just the try catch closure
const syncRegex = /\/\/ Sync to subject_scores so it reflects in EvaluationModule[\s\S]*?afterMidSoftSkillScore,\n\s*totalScore\n\s*\}, \{ merge: true \}\);/g;
if (content.match(syncRegex)) {
  content = content.replace(syncRegex, '');
  fs.writeFileSync('src/components/ClassroomHub.tsx', content);
  console.log("Removed sync logic.");
} else {
  console.log("Could not find sync logic");
}

// Add onNavigateToEvaluation to props
if (!content.includes('onNavigateToEvaluation?: (')) {
  content = content.replace(
    '  onClose: () => void;\n}',
    '  onClose: () => void;\n  onNavigateToEvaluation?: (subjectName: string, gradeLevel: string) => void;\n}'
  );
  content = content.replace(
    'export const ClassroomHub: React.FC<ClassroomHubProps> = ({',
    'export const ClassroomHub: React.FC<ClassroomHubProps> = ({'
  ); // just ensuring it's there
  content = content.replace(
    '  onClose\n}) => {',
    '  onClose,\n  onNavigateToEvaluation\n}) => {'
  );
  
  // Also put a button in the gradebook tab top section
  const headerReplacement = `<div className="flex gap-4 text-sm font-bold text-slate-600">
                     <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-400"></div> K (ความรู้)</div>
                     <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-400"></div> P (ทักษะ)</div>
                     <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-400"></div> A (คุณลักษณะ)</div>
                   </div>`;
                   
  const newHeader = `<div className="flex flex-col items-end gap-3">
                     <div className="flex gap-4 text-sm font-bold text-slate-600">
                       <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-400"></div> K (ความรู้)</div>
                       <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-400"></div> P (ทักษะ)</div>
                       <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-400"></div> A (คุณลักษณะ)</div>
                     </div>
                     {onNavigateToEvaluation && (
                       <button 
                         onClick={() => onNavigateToEvaluation(subjectName, gradeLevel)}
                         className="px-3 py-1.5 bg-fuchsia-50 text-fuchsia-700 hover:bg-fuchsia-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 border border-fuchsia-200"
                       >
                         <Calculator className="h-3.5 w-3.5" />
                         ไปบันทึกคะแนนในโมดูล 3
                       </button>
                     )}
                   </div>`;
                   
  content = content.replace(headerReplacement, newHeader);
  
  const emptyStateBtnReplacement = `<button 
                      onClick={() => setActiveTab('plans')}
                      className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-sm hover:bg-indigo-700 transition-colors"
                    >
                      ไปเขียนแผนการสอน
                    </button>`;
  const newEmptyStateBtn = `<div className="flex items-center gap-3 mt-6">
                      <button 
                        onClick={() => setActiveTab('plans')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-sm hover:bg-indigo-700 transition-colors"
                      >
                        ไปเขียนแผนการสอน
                      </button>
                      {onNavigateToEvaluation && (
                         <button 
                           onClick={() => onNavigateToEvaluation(subjectName, gradeLevel)}
                           className="px-4 py-2 bg-white text-fuchsia-600 border border-fuchsia-200 rounded-xl font-bold shadow-sm hover:bg-fuchsia-50 transition-colors flex items-center gap-2"
                         >
                           <Calculator className="h-4 w-4" />
                           ข้ามไปบันทึกคะแนนโมดูล 3
                         </button>
                      )}
                    </div>`;
  content = content.replace(emptyStateBtnReplacement, newEmptyStateBtn);
  
  fs.writeFileSync('src/components/ClassroomHub.tsx', content);
  console.log("Added navigation prop and buttons");
}
