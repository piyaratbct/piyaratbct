import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """              {displayedStudents.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserX className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700">ไม่มีข้อมูลนักเรียน</h3>
                  <p className="text-slate-500 mt-2 text-sm font-medium max-w-md mx-auto">
                    ฟังก์ชันเช็กชื่อนักเรียนกำลังอยู่ระหว่างการพัฒนาและปรับปรุงระบบ ขออภัยในความไม่สะดวก
                  </p>
                </div>
              ) : (
                <AttendanceTracking 
                  students={displayedStudents}
                  gradeLevel={selectedGrade}
                  teacherId={currentTeacher.id}
                  teacherName={currentTeacher.thaiName || currentTeacher.displayName || 'Unknown Teacher'}
                  semester={systemSemester}
                  academicYear={systemAcademicYear}
                />
              )}"""

replacement = """              {!GRADE_LEVELS.includes(selectedGrade) ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-8 w-8 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700">กรุณาเลือกชั้นเรียนรายห้อง</h3>
                  <p className="text-slate-500 mt-2 text-sm font-medium">
                    การเช็คชื่อต้องทำในระดับชั้นเรียนรายห้องเท่านั้น
                  </p>
                </div>
              ) : displayedStudents.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserX className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700">ไม่มีข้อมูลนักเรียน</h3>
                  <p className="text-slate-500 mt-2 text-sm font-medium max-w-md mx-auto">
                    ยังไม่มีข้อมูลนักเรียนในชั้นเรียนนี้
                  </p>
                </div>
              ) : (
                <AttendanceTracking 
                  students={displayedStudents}
                  gradeLevel={selectedGrade}
                  teacherId={currentTeacher.id}
                  teacherName={currentTeacher.thaiName || currentTeacher.displayName || 'Unknown Teacher'}
                  semester={systemSemester}
                  academicYear={systemAcademicYear}
                />
              )}"""

content = content.replace(target, replacement)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
