import re

with open('src/components/AcademicModule.tsx', 'r') as f:
    content = f.read()

target_auth = """  if (currentTeacher.role !== 'admin' && currentTeacher.role !== 'academic') {
    return (
      <div className="p-12 text-center text-rose-600 bg-rose-50 rounded-2xl border border-rose-200 animate-in fade-in">
        <ShieldCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <h3 className="text-lg font-black tracking-wide">Unauthorized Access</h3>
        <p className="text-sm font-semibold mt-1 text-rose-500">เฉพาะเจ้าหน้าที่วิชาการและผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถเข้าถึงการบริหารงานวิชาการได้</p>
      </div>
    );
  }"""
content = content.replace(target_auth, "")

target_settings = """      {activeTab === "settings" && (
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
      )}"""
replacement_settings = """      {activeTab === "settings" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center">
          <div className="h-16 w-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">ตั้งค่าระบบและวันเปิด-ปิดภาคเรียน</h3>
          <p className="text-slate-500">ส่วนนี้ใช้สำหรับกำหนดจำนวนวันเรียนของแต่ละภาคเรียน การตั้งค่าเกณฑ์การผ่าน และข้อมูลอื่นๆ</p>
          {(currentTeacher.role === 'admin' || currentTeacher.role === 'academic') ? (
            <button className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition">
              ตั้งค่าภาคเรียนปัจจุบัน
            </button>
          ) : (
            <p className="mt-4 text-sm text-rose-500 font-medium">คุณไม่มีสิทธิ์แก้ไขการตั้งค่านี้</p>
          )}
        </div>
      )}"""
content = content.replace(target_settings, replacement_settings)

target_staff = """      {activeTab === "staff" && (
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
      )}"""
replacement_staff = """      {activeTab === "staff" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center">
          <div className="h-16 w-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">ระบบจัดสรรบุคลากร</h3>
          <p className="text-slate-500">ส่วนนี้ใช้สำหรับจัดโครงสร้างครูประจำชั้น และจัดสรรตารางสอนให้กับบุคลากร</p>
          {(currentTeacher.role === 'admin' || currentTeacher.role === 'academic') ? (
            <button className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition">
              จัดการโครงสร้าง
            </button>
          ) : (
            <p className="mt-4 text-sm text-rose-500 font-medium">คุณไม่มีสิทธิ์แก้ไขโครงสร้างบุคลากร</p>
          )}
        </div>
      )}"""
content = content.replace(target_staff, replacement_staff)

with open('src/components/AcademicModule.tsx', 'w') as f:
    f.write(content)
