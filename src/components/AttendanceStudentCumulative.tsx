import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AttendanceSession, Student, SUBJECTS } from '../types';
import { Search, Loader2, BookOpen } from 'lucide-react';

interface Props {
  gradeLevel: string;
  systemAcademicYear?: string;
  systemSemester?: string;
}

export function AttendanceStudentCumulative({ gradeLevel, systemAcademicYear, systemSemester }: Props) {
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>(SUBJECTS[0]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch students in grade
        const sq = query(collection(db, 'students'), where('gradeLevel', '==', gradeLevel));
        const stSnap = await getDocs(sq);
        const stData = stSnap.docs.map(d => ({ id: d.id, ...d.data() } as Student));
        setStudents(stData.sort((a,b) => a.studentId.localeCompare(b.studentId)));

        // Fetch attendance sessions for this academic year and semester
        let aq = query(collection(db, 'attendanceSessions'));
        if (systemAcademicYear) {
          aq = query(aq, where('academicYear', '==', systemAcademicYear));
        }
        if (systemSemester) {
          aq = query(aq, where('semester', '==', systemSemester));
        }
        
        const atSnap = await getDocs(aq);
        const atData = atSnap.docs.map(d => ({ id: d.id, ...d.data() } as AttendanceSession));
        
        // Filter by gradeLevel and subject in memory
        const filteredSessions = atData.filter(s => s.gradeLevel === gradeLevel && s.subject === selectedSubject);
        setSessions(filteredSessions);
      } catch (err) {
        console.error("Error fetching cumulative data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [gradeLevel, systemAcademicYear, systemSemester, selectedSubject]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-3 font-medium">กำลังโหลดข้อมูลสะสม...</span>
      </div>
    );
  }

  const totalPeriods = sessions.length;

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <div className="relative">
          <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <select 
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {totalPeriods === 0 ? (
        <div className="bg-slate-50 text-center p-8 rounded-xl border border-slate-200">
          <p className="text-slate-500 font-medium">ยังไม่มีข้อมูลการสอนหรือการเช็กชื่อในรายวิชานี้ สำหรับ {gradeLevel}</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
            <h4 className="font-bold text-slate-700">สรุปการเข้าเรียนสะสม: {selectedSubject}</h4>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">สอนไปแล้ว {totalPeriods} คาบ</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-bold whitespace-nowrap">เลขประจำตัว</th>
                  <th className="px-4 py-3 font-bold">ชื่อ-นามสกุล</th>
                  <th className="px-4 py-3 font-bold text-center text-emerald-600">มา</th>
                  <th className="px-4 py-3 font-bold text-center text-blue-500">สาย</th>
                  <th className="px-4 py-3 font-bold text-center text-amber-500">ลา</th>
                  <th className="px-4 py-3 font-bold text-center text-orange-500">ป่วย</th>
                  <th className="px-4 py-3 font-bold text-center text-rose-500">ขาด</th>
                  <th className="px-4 py-3 font-bold text-center">ร้อยละเวลาเรียน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map(st => {
                  let present = 0;
                  let late = 0;
                  let leave = 0;
                  let sick = 0;
                  let absent = 0;
                  
                  sessions.forEach(session => {
                    const status = session.attendanceData?.[st.id] || 'absent';
                    if (status === 'present') present++;
                    else if (status === 'late') late++;
                    else if (status === 'leave') leave++;
                    else if (status === 'sick') sick++;
                    else if (status === 'absent') absent++;
                  });

                  // Late typically counts as present, but let's just sum them for percentage.
                  // Usually, present + late are considered "attended".
                  const attended = present + late;
                  const percentage = totalPeriods > 0 ? Math.round((attended / totalPeriods) * 100) : 0;
                  
                  return (
                    <tr key={st.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-slate-500">{st.studentId}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{st.firstName} {st.lastName}</td>
                      <td className="px-4 py-3 text-center font-bold text-emerald-600">{present}</td>
                      <td className="px-4 py-3 text-center font-bold text-blue-500">{late}</td>
                      <td className="px-4 py-3 text-center font-bold text-amber-500">{leave}</td>
                      <td className="px-4 py-3 text-center font-bold text-orange-500">{sick}</td>
                      <td className="px-4 py-3 text-center font-bold text-rose-500">{absent}</td>
                      <td className="px-4 py-3 text-center font-bold">
                        <span className={`${percentage < 80 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {percentage}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
