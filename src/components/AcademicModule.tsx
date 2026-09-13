import React, { useState } from "react";
import { 
  Calendar as CalendarIcon, Calculator, 
  Clock, 
  BookOpen, 
  Settings, 
  Users, 
  GraduationCap,
  ShieldCheck,
  CalendarDays,
  ArrowRight
} from "lucide-react";
import { SchoolEventCalendar } from "./SchoolEventCalendar";
import { PromotionManager } from "./PromotionManager";
import { AcademicSettings } from "./AcademicSettings";
import { StaffManager } from "./StaffManager";
import { StaffProfileModule } from "./StaffProfileModule";
import { Student } from "../types";
import { ScheduleManager } from "./ScheduleManager";
import { CurriculumManager } from "./CurriculumManager";
import { SubjectStructureManager } from "./SubjectStructureManager";
import { ClassroomSettings } from "./ClassroomSettings";
import { FileSpreadsheet, FileText } from "lucide-react";


import { Teacher } from "../types";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useEffect } from "react";

interface AcademicModuleProps {
  currentTeacher: Teacher;
  systemAcademicYear: string;
  systemSemester: string;
  students: Student[];
  teachers: Teacher[];
}

export const AcademicModule: React.FC<AcademicModuleProps> = ({
  currentTeacher,
  systemAcademicYear,
  systemSemester,
  students: allStudents,
  teachers,
}) => {
  const students = React.useMemo(() => allStudents.filter(s => s.status === 'active' || !s.status), [allStudents]);
  const [activeTab, setActiveTab] = useState<"calendar" | "settings" | "staff" | "schedule" | "promotion" | "curriculum" | "eportfolio" | "classrooms">("calendar");
  const [upcomingEventCount, setUpcomingEventCount] = useState(0);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      if (!currentTeacher) return;
      try {
        const q = query(collection(db, 'schoolEvents'), where('responsibleTeachers', 'array-contains', currentTeacher.id));
        const snapshot = await getDocs(q);
        const today = new Date();
        today.setHours(0,0,0,0);
        const inThreeDays = new Date(today);
        inThreeDays.setDate(today.getDate() + 3);
        
        let count = 0;
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const d = new Date(data.date);
          if (d >= today && d <= inThreeDays) {
            count++;
          }
        });
        setUpcomingEventCount(count);
      } catch (error) {
        console.error("Error fetching upcoming events", error);
      }
    };
    fetchUpcomingEvents();
    
    // Listen for custom event to refresh when calendar changes
    window.addEventListener('app-custom-toast', fetchUpcomingEvents);
    return () => window.removeEventListener('app-custom-toast', fetchUpcomingEvents);
  }, [currentTeacher]);



  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-300 opacity-20 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl"></div>
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="h-16 w-16 bg-white/20 backdrop-blur-md text-white rounded-2xl flex items-center justify-center shadow-inner border border-white/30">
            <BookOpen className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight drop-shadow-sm flex items-center flex-wrap sm:flex-nowrap gap-1 sm:gap-2">
              <span>4. บริหารงานวิชาการ</span>
              <span className="text-xl opacity-90">(LessonAcad)</span>
            </h2>
            <p className="text-indigo-100 font-medium mt-1">
              {String(systemAcademicYear).startsWith("ปี") ? systemAcademicYear : `ปีการศึกษา ${systemAcademicYear}`} {String(systemSemester).startsWith("ภาคเรียน") ? systemSemester : `ภาคเรียนที่ ${systemSemester}`}
            </p>
          </div>
        </div>
      </div>



      {/* Tabs */}
      <div className="flex overflow-x-auto custom-scrollbar bg-white rounded-xl p-1 shadow-sm border border-slate-100 w-full gap-1">
        <button
          onClick={() => setActiveTab("calendar")}
          className={`flex-none flex flex-row items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === "calendar"
              ? "bg-indigo-50 text-indigo-700"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <CalendarIcon className="h-4 w-4" /> ปฏิทินและกิจกรรม
        </button>
        
        <button
          onClick={() => setActiveTab("schedule")}
          className={`flex-none flex flex-row items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === "schedule"
              ? "bg-indigo-50 text-indigo-700"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <Clock className="h-4 w-4" /> จัดการตารางสอน
        </button>
        
        <button
          onClick={() => setActiveTab("staff")}
          className={`flex-none flex flex-row items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
            (activeTab === "staff" || activeTab === "eportfolio" || activeTab === "classrooms")
              ? "bg-indigo-50 text-indigo-700"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <Users className="h-4 w-4" /> บุคลากรและชั้นเรียน
        </button>
        
        <button
          onClick={() => setActiveTab("promotion")}
          className={`flex-none flex flex-row items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === "promotion"
              ? "bg-indigo-50 text-indigo-700"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <GraduationCap className="h-4 w-4" /> เลื่อนชั้นนักเรียน
        </button>

        <button
          onClick={() => setActiveTab("curriculum")}
          className={`flex-none flex flex-row items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === "curriculum"
              ? "bg-indigo-50 text-indigo-700"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <BookOpen className="h-4 w-4" /> บริหารหลักสูตรและโครงสร้าง
        </button>
        
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-none flex flex-row items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === "settings"
              ? "bg-indigo-50 text-indigo-700"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <Settings className="h-4 w-4" /> ตั้งค่าระบบ
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "calendar" && (
        <SchoolEventCalendar currentTeacher={currentTeacher} students={students} />
      )}

      {activeTab === "schedule" && (
        <ScheduleManager systemSemester={systemSemester} systemAcademicYear={systemAcademicYear} currentTeacher={currentTeacher} />
      )}

      {activeTab === "settings" && (
        <AcademicSettings currentTeacher={currentTeacher} />
      )}

      {(activeTab === "staff" || activeTab === "eportfolio" || activeTab === "classrooms") && (
        <div className="space-y-4">
          <div className="flex overflow-x-auto gap-2 border-b border-slate-200">
            <button
              onClick={() => setActiveTab("staff")}
              className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "staff"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              จัดการข้อมูลและสิทธิ์ผู้ใช้งาน
            </button>
            <button
              onClick={() => setActiveTab("eportfolio")}
              className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "eportfolio"
                  ? "border-fuchsia-600 text-fuchsia-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              แฟ้มสะสมผลงาน (e-Portfolio)
            </button>
            <button
              onClick={() => setActiveTab("classrooms")}
              className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "classrooms"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              จัดการโครงสร้างห้องเรียน
            </button>
          </div>
          
          {activeTab === "classrooms" && (
            <ClassroomSettings currentTeacher={currentTeacher} students={students} teachers={teachers} />
          )}

          {activeTab === "staff" && (
            <StaffManager currentTeacher={currentTeacher} />
          )}
          {activeTab === "eportfolio" && (
            <StaffProfileModule
              currentTeacher={currentTeacher}
              teachers={teachers}
              systemAcademicYear={systemAcademicYear}
              systemSemester={systemSemester}
              isPersonalView={false}
            />
          )}
        </div>
      )}

      {activeTab === "promotion" && (
        <PromotionManager 
          currentAcademicYear={systemAcademicYear} 
          targetAcademicYear={String(parseInt(systemAcademicYear || "2567") + 1)} 
          students={students} 
        />
      )}



      
      
      {activeTab === "curriculum" && (
        <CurriculumManager currentUserRole={currentTeacher.role} students={students} systemSemester={systemSemester} systemAcademicYear={systemAcademicYear} />
      )}
    </div>
  );
};
