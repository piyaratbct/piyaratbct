const fs = require('fs');
let code = fs.readFileSync('src/components/PrintTemplate.tsx', 'utf8');

const targetIcons = `import { Printer, Eye, Lock, Clock, CheckCircle } from 'lucide-react';`;
const replacementIcons = `import { Printer, Eye, Lock, Clock, CheckCircle, Edit3, XCircle } from 'lucide-react';`;
code = code.replace(targetIcons, replacementIcons);

const targetControls = `        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {/* Fit to A4 Single Page Toggle */}`;

const replacementControls = `        <div className="flex items-center space-x-2 w-full sm:w-auto flex-wrap justify-end gap-y-2">
          {/* Signature Actions */}
          {currentUser?.id === record.teacherId && currentUser?.role === 'teacher' && !record.deptHeadApproved && (
            record.teacherSigned && (record as any).teacherSignature ? (
              <button 
                onClick={() => handleResetSignature('teacher')}
                className="flex items-center space-x-1.5 px-3 py-2 bg-rose-500/20 text-rose-200 hover:bg-rose-500/30 border border-rose-500/30 font-bold rounded-xl text-xs transition-colors"
              >
                <XCircle className="h-4 w-4" /> ล้างลายมือชื่อ
              </button>
            ) : (
              <button 
                onClick={() => setSigningRole('teacher')}
                className="flex items-center space-x-1.5 px-3 py-2 bg-blue-500/20 text-blue-200 hover:bg-blue-500/30 border border-blue-500/30 font-bold rounded-xl text-xs transition-colors"
              >
                <Edit3 className="h-4 w-4" /> ลงนามผู้แต่ง
              </button>
            )
          )}

          {allowAcademicSignature && (currentUser?.role === 'admin' || currentUser?.role === 'academic' || currentUser?.role === 'deputy') && (
            isDeptHeadApproved && record.deptHeadSignature ? (
              <button 
                onClick={() => handleResetSignature('deptHead')}
                className="flex items-center space-x-1.5 px-3 py-2 bg-rose-500/20 text-rose-200 hover:bg-rose-500/30 border border-rose-500/30 font-bold rounded-xl text-xs transition-colors"
              >
                <XCircle className="h-4 w-4" /> ยกเลิกการอนุมัติ
              </button>
            ) : (
              <button 
                onClick={() => setSigningRole('deptHead')}
                className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30 border border-emerald-500/30 font-bold rounded-xl text-xs transition-colors"
              >
                <Edit3 className="h-4 w-4" /> เซ็นอนุมัติ (Approve)
              </button>
            )
          )}

          {/* Fit to A4 Single Page Toggle */}`;

code = code.replace(targetControls, replacementControls);
fs.writeFileSync('src/components/PrintTemplate.tsx', code, 'utf8');
