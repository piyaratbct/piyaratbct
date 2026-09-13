const fs = require('fs');
let code = fs.readFileSync('src/components/AttendanceStudentCumulative.tsx', 'utf8');

const endToFix = `      )}
      ;
              acc[st.id] = { present, late, leave, sick, absent };
              return acc;
            }, {} as Record<string, { present: number; leave: number; sick: number; absent: number; late: number; }>)
          }}
          subject={selectedSubject}
          gradeLevel={gradeLevel}
          academicYear={systemAcademicYear || "2567"}
          semester={systemSemester || "1"}
          onClose={() => setShowPrint(false)}
        />
      )}
    </div>
  );
}`;

const correctEnd = `      )}
    </div>
  );
}`;

if (code.includes(endToFix)) {
  code = code.replace(endToFix, correctEnd);
  fs.writeFileSync('src/components/AttendanceStudentCumulative.tsx', code);
  console.log("Fixed end of file");
} else {
  console.log("End target not found");
}
