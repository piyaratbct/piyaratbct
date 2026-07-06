import React, { useState } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  BookOpen, 
  Settings, 
  Users, 
  GraduationCap,
  ShieldCheck,
  CalendarDays
} from "lucide-react";
import { SchoolEventCalendar } from "./SchoolEventCalendar";
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
}) => {
  const [activeTab, setActiveTab] = useState<"calendar" | "settings" | "staff" | "schedule">("calendar");

  if (currentTeacher.role !== 'admin' && currentTeacher.role !== 'academic') {
    return (
      <div className="p-12 text-center text-rose-600 bg-rose-50 rounded-2xl border border-rose-200 animate-in fade-in">
        <ShieldCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <h3 className="text-lg font-black tracking-wide">Unauthorized Access</h3>
        <p className="text-sm font-semibold mt-1 text-rose-500">เฉพาะเจ้าหน้าที่วิชาการและผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถเข้าถึงการบริหารงานวิชาการได้</p>
      </div>
    );
  }

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
      </div>

      {/* Tab Contents */}
      {activeTab === "calendar" && (
        <SchoolEventCalendar currentTeacher={currentTeacher} />
      )}

      {activeTab === "schedule" && (
        <ScheduleManager systemSemester={systemSemester} systemAcademicYear={systemAcademicYear} currentTeacher={currentTeacher} />
      )}

      {activeTab === "settings" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center">
          <div className="h-16 w-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">ตั้งค่าระบบและวันเปิด-ปิดภาคเรียน</h3>
          <p className="text-slate-500">ส่วนนี้ใช้สำหรับกำหนดจำนวนวันเรียนของแต่ละภาคเรียน การตั้งค่าเกณฑ์การผ่าน และข้อมูลอื่นๆ</p>
          <button className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition">
            ตั้งค่าภาคเรียนปัจจุบัน
          </button>
        </div>
      )}

      {activeTab === "staff" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center">
          <div className="h-16 w-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">ระบบจัดสรรบุคลากร</h3>
          <p className="text-slate-500">ส่วนนี้ใช้สำหรับจัดโครงสร้างครูประจำชั้น และจัดสรรตารางสอนให้กับบุคลากร</p>
          <button className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition">
            จัดการโครงสร้าง
          </button>
        </div>
      )}
    </div>
  );
};
