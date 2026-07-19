import React, { useState } from "react";
import { 
  Calendar as CalendarIcon, 
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
import { Student } from "../types";
import { ScheduleManager } from "./ScheduleManager";
import { Teacher } from "../types";

interface AcademicModuleProps {
  currentTeacher: Teacher;
  systemAcademicYear: string;
  systemSemester: string;
}

export const AcademicModule: React.FC<AcademicModuleProps> = ({
  currentTeacher,
  systemAcademicYear,
  systemSemester,
  students,
}) => {
  const [activeTab, setActiveTab] = useState<"calendar" | "settings" | "staff" | "schedule" | "promotion">("calendar");



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
            <h2 className="text-2xl font-black tracking-tight drop-shadow-sm">
              4. การบริหารงานวิชาการ (LessonAcad)
            </h2>
            <p className="text-indigo-100 font-medium mt-1">
              ปีการศึกษา {systemAcademicYear} ภาคเรียนที่ {systemSemester}
            </p>
          </div>
        </div>
      </div>



      {/* Tabs */}
      <div className="grid grid-cols-2 md:flex md:flex-wrap bg-white rounded-xl p-1 shadow-sm border border-slate-100 custom-scrollbar gap-1">
        <button
          onClick={() => setActiveTab("calendar")}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all min-w-[150px] ${
            activeTab === "calendar"
              ? "bg-indigo-50 text-indigo-700"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <CalendarIcon className="h-4 w-4" /> ปฏิทินวิชาการ
        </button>
        <button
          onClick={() => setActiveTab("schedule")}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all min-w-[150px] ${
            activeTab === "schedule"
              ? "bg-indigo-50 text-indigo-700"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <CalendarDays className="h-4 w-4" /> จัดการตารางสอน
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all min-w-[150px] ${
            activeTab === "settings"
              ? "bg-indigo-50 text-indigo-700"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <Settings className="h-4 w-4" /> ตั้งค่าปี/ภาคเรียน
        </button>
        {['admin', 'academic', 'deputy'].includes(currentTeacher.role || 'teacher') && (
          <button
            onClick={() => setActiveTab("staff")}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all min-w-[150px] ${
              activeTab === "staff"
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Users className="h-4 w-4" /> ข้อมูลบุคลากร
          </button>
        )}
        <button
          onClick={() => setActiveTab("promotion")}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all min-w-[150px] ${
            activeTab === "promotion"
              ? "bg-indigo-50 text-indigo-700"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <ArrowRight className="h-4 w-4" /> เลื่อนชั้น/จบการศึกษา
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "calendar" && (
        <SchoolEventCalendar currentTeacher={currentTeacher} />
      )}

      {activeTab === "schedule" && (
        <ScheduleManager systemSemester={systemSemester} systemAcademicYear={systemAcademicYear} currentTeacher={currentTeacher} />
      )}

      {activeTab === "settings" && (
        <AcademicSettings currentTeacher={currentTeacher} />
      )}

      {activeTab === "staff" && (
        <StaffManager currentTeacher={currentTeacher} />
      )}

      {activeTab === "promotion" && (
        <PromotionManager 
          currentAcademicYear={systemAcademicYear} 
          targetAcademicYear={String(parseInt(systemAcademicYear || "2567") + 1)} 
          students={students} 
        />
      )}
    </div>
  );
};
