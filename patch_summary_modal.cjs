const fs = require('fs');
let code = fs.readFileSync('src/components/AttendanceSummary.tsx', 'utf8');

const target = `      )}
    </div>
  );
}`;
const replacement = `      )}

      {editingSession && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <AttendanceTracking
              students={students}
              gradeLevel={editingSession.gradeLevel}
              teacherId={editingSession.teacherId}
              teacherName={editingSession.teacherName}
              semester={systemSemester || ''}
              academicYear={systemAcademicYear || ''}
              initialDate={editingSession.date}
              initialPeriod={editingSession.period}
              onClose={() => {
                setEditingSession(null);
                setRefreshTrigger(prev => prev + 1);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}`;
code = code.replace(target, replacement);
fs.writeFileSync('src/components/AttendanceSummary.tsx', code, 'utf8');
