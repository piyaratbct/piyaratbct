import React, { useState } from 'react';
import { ShieldCheck, User, Users, CheckCircle, X, Check } from 'lucide-react';
import { Teacher, LessonRecord } from '../types';

interface UserManagementModuleProps {
  teachers: Teacher[];
  records: LessonRecord[];
  currentTeacher: Teacher;
  onDeleteTeacher: (teacherId: string) => Promise<void>;
  onUpdateTeacher?: (teacherId: string, updates: Partial<Teacher>) => Promise<void>;
}

export const UserManagementModule: React.FC<UserManagementModuleProps> = ({
  teachers,
  records,
  currentTeacher,
  onDeleteTeacher,
  onUpdateTeacher
}) => {
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Teacher>>({});

  if (currentTeacher.role !== 'admin') {
    return (
      <div className="p-12 text-center text-rose-600 bg-rose-50 rounded-2xl border border-rose-200 animate-in fade-in">
        <ShieldCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <h3 className="text-lg font-black tracking-wide">Unauthorized Access</h3>
        <p className="text-sm font-semibold mt-1 text-rose-500">เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถเข้าถึงการจัดการผู้ใช้งานได้</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Academic Board Title Header */}
      <div className="bg-gradient-to-r from-violet-100 via-white to-sky-105 text-slate-800 p-6 rounded-2xl shadow-xs border border-violet-200/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-violet-750 uppercase tracking-wider flex items-center gap-1.5 bg-violet-50 px-2.5 py-1 rounded-sm border border-violet-200 w-fit">
            <ShieldCheck className="h-3.5 w-3.5 text-violet-600 animate-bounce" />
            แผงควบคุมระบบ และจัดการสมาชิก (Admin Control Panel)
          </span>
          <h3 className="text-base font-black tracking-tight mt-1.5 text-slate-900">
            ระบบบริหารจัดการบัญชีผู้ใช้งาน และล้างฐานข้อมูลครูจำลอง
          </h3>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            เฉพาะสิทธิ์ผู้ควบคุมดูแลระบบสูงสุด (System Administrator) เท่านั้นที่มีสิทธิ์ลบประวัติหรือสมาชิกเพื่อความเรียบร้อย
          </p>
        </div>
        <div className="px-3 py-1.5 bg-violet-600 rounded-xl text-[10px] font-extrabold text-white shadow-sm flex items-center gap-1">
          <span>👑 Admin Authorization Verified</span>
        </div>
      </div>

      {/* Metrics cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wide block">จำนวนสมาชิกทั้งหมด</span>
          <span className="text-xl font-extrabold text-slate-800 mt-1 block">{teachers.length} บัญชี</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wide block">คุณครูผู้สอนปกติ</span>
          <span className="text-xl font-extrabold text-sky-600 mt-1 block">
            {teachers.filter(t => !t.role || t.role === 'teacher').length} ท่าน
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wide block">ฝ่ายบริหาร / วิชาการ</span>
          <span className="text-xl font-extrabold text-pink-600 mt-1 block">
            {teachers.filter(t => t.role === 'academic' || t.role === 'deputy').length} ท่าน
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wide block">ผู้ดูแลระบบสูงสุด</span>
          <span className="text-xl font-extrabold text-violet-600 mt-1 block">
            {teachers.filter(t => t.role === 'admin').length} บัญชี
          </span>
        </div>
      </div>

      {/* Filter control or Search */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-violet-600" />
              บัญชีครูและบุคลากร
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5 font-semibold">ค้นหาหรือลบบัญชีคุณครูเพื่อจัดระบบ (บันทึกหลังสอนในระบบคลาวด์ทั้งหมดของผู้ถูกลบจะถูกล้างออกด้วยเพื่อสุขอนามัยข้อมูล)</p>
          </div>
          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="🔍 ค้นหาด้วย ชื่อครู / อีเมล / กลุ่มสาระ..."
              value={adminSearchQuery}
              onChange={(e) => setAdminSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50/50"
            />
          </div>
        </div>

        {/* Members Grid list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers
            .filter(teacher => {
              if (!adminSearchQuery.trim()) return true;
              const query = adminSearchQuery.toLowerCase();
              return (
                (teacher.displayName || '').toLowerCase().includes(query) ||
                (teacher.thaiName || '').toLowerCase().includes(query) ||
                (teacher.englishName || '').toLowerCase().includes(query) ||
                (teacher.email || '').toLowerCase().includes(query) ||
                (teacher.employeeId || '').toLowerCase().includes(query) ||
                (teacher.affiliation || '').toLowerCase().includes(query)
              );
            })
            .map((teacher) => {
              const teacherRecords = records.filter(r => r.teacherId === teacher.id);
              const isSelf = teacher.id === currentTeacher.id;

              // Role Labels
              const roleLabels: any = {
                teacher: { text: 'คุณครูผู้สอน', style: 'bg-sky-50 text-sky-600 border-sky-200' },
                academic: { text: 'หัวหน้าวิชาการ', style: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
                deputy: { text: 'รองผู้อำนวยการ', style: 'bg-pink-50 text-pink-600 border-pink-200' },
                admin: { text: 'ผู้ดูแลระบบ', style: 'bg-violet-50 text-violet-600 border-violet-200' },
                discipline: { text: 'หัวหน้างานปกครอง', style: 'bg-amber-50 text-amber-600 border-amber-200' }
              };
              const roleConfig = roleLabels[teacher.role || 'teacher'] || roleLabels.teacher;

              return (
                <div
                  key={teacher.id}
                  className={`p-5 rounded-2xl border bg-white flex flex-col justify-between transition relative overflow-hidden ${
                    isSelf 
                      ? 'border-violet-350 ring-2 ring-violet-200/40 bg-violet-50/10' 
                      : 'border-slate-100 hover:border-slate-200 hover:shadow-xs'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center space-x-3 truncate">
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
                          isSelf ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-750'
                        }`}>
                          {teacher.displayName ? teacher.displayName.charAt(0) : 'T'}
                        </div>
                        <div className="truncate">
                          <h5 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5 truncate">
                            {teacher.displayName || 'No Name'}
                            {isSelf && (
                              <span className="px-1.5 py-0.5 bg-violet-605 text-white text-[8px] font-semibold rounded-sm tracking-wide">
                                คุณ
                              </span>
                            )}
                          </h5>
                          <span className="block text-[9px] text-slate-400 font-mono mt-0.5">{teacher.employeeId || 'No ID'}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border shrink-0 ${roleConfig.style}`}>
                        {roleConfig.text}
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-1.5 border-t border-slate-50 text-[11px] text-slate-600 select-none">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold">ชื่อภาษาไทย:</span>
                        <span className="font-semibold text-slate-800">{teacher.thaiName || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold">ชื่อภาษาอังกฤษ:</span>
                        <span className="font-semibold text-slate-800">{teacher.englishName || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold">อีเมลติดต่อ:</span>
                        <span className="font-semibold text-slate-800 truncate max-w-[150px]" title={teacher.email}>{teacher.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold">สังกัดกลุ่มสาระ:</span>
                        <span className="font-semibold text-slate-800 truncate max-w-[145px] text-right" title={teacher.affiliation || 'ไม่ระบุ'}>{teacher.affiliation || 'ไม่ระบุ'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold">เบอร์โทรศัพท์:</span>
                        <span className="font-semibold text-slate-800">{teacher.phoneNumber || '-'}</span>
                      </div>
                    </div>

                    {/* Homeroom info & Stat indicators */}
                    <div className="pt-2 border-t border-slate-100">
                      {editingTeacherId === teacher.id ? (
                        <div className="space-y-2 p-2 bg-slate-50 rounded-xl">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="col-span-2">
                              <label className="text-[10px] font-bold text-slate-600">รหัสพนักงาน</label>
                              <input 
                                type="text" 
                                value={editData.employeeId || ''} 
                                onChange={e => setEditData({...editData, employeeId: e.target.value})}
                                className="w-full mt-1 px-2 py-1 text-xs rounded border border-slate-200"
                                placeholder="รหัสพนักงาน"
                              />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                              <label className="text-[10px] font-bold text-slate-600">ชื่อภาษาไทย</label>
                              <input 
                                type="text" 
                                value={editData.thaiName || ''} 
                                onChange={e => setEditData({...editData, thaiName: e.target.value})}
                                className="w-full mt-1 px-2 py-1 text-xs rounded border border-slate-200"
                                placeholder="ชื่อภาษาไทย"
                              />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                              <label className="text-[10px] font-bold text-slate-600">ชื่อภาษาอังกฤษ</label>
                              <input 
                                type="text" 
                                value={editData.englishName || ''} 
                                onChange={e => setEditData({...editData, englishName: e.target.value})}
                                className="w-full mt-1 px-2 py-1 text-xs rounded border border-slate-200"
                                placeholder="ชื่อภาษาอังกฤษ"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="text-[10px] font-bold text-slate-600">สิทธิ์ผู้ใช้งาน</label>
                              <select 
                                value={editData.role || 'teacher'} 
                                onChange={e => setEditData({...editData, role: e.target.value as any})}
                                className="w-full mt-1 px-2 py-1 text-xs rounded border border-slate-200"
                              >
                                <option value="teacher">คุณครูผู้สอนปกติ</option>
                                <option value="academic">ฝ่ายวิชาการ (ตรวจแผนฯ / บันทึกหลังสอน)</option>
                                <option value="deputy">รองผู้อำนวยการ (อนุมัติ)</option>
                                <option value="discipline">หัวหน้างานปกครอง (ตรวจสอบวินัย)</option>
                                <option value="admin">ผู้ดูแลระบบสูงสุด (System Administrator)</option>
                              </select>
                            </div>
                            <div className="col-span-2">
                              <label className="text-[10px] font-bold text-slate-600">กลุ่มสาระฯ</label>
                              <input 
                                type="text" 
                                value={editData.affiliation || ''} 
                                onChange={e => setEditData({...editData, affiliation: e.target.value})}
                                className="w-full mt-1 px-2 py-1 text-xs rounded border border-slate-200"
                                placeholder="กลุ่มสาระ"
                              />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                              <label className="text-[10px] font-bold text-slate-600">ครูประจำชั้น</label>
                              <input 
                                type="text" 
                                value={editData.homeroomClass || ''} 
                                onChange={e => setEditData({...editData, homeroomClass: e.target.value})}
                                className="w-full mt-1 px-2 py-1 text-xs rounded border border-slate-200"
                                placeholder="เช่น ป.1/1"
                              />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                              <label className="text-[10px] font-bold text-slate-600">ครูคู่ชั้น</label>
                              <input 
                                type="text" 
                                value={editData.coHomeroomClass || ''} 
                                onChange={e => setEditData({...editData, coHomeroomClass: e.target.value})}
                                className="w-full mt-1 px-2 py-1 text-xs rounded border border-slate-200"
                                placeholder="เช่น ป.1/1"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end mt-2">
                            <button 
                              onClick={() => setEditingTeacherId(null)}
                              className="px-2 py-1 text-[10px] bg-slate-200 text-slate-600 rounded font-bold"
                            >
                              ยกเลิก
                            </button>
                            <button 
                              onClick={() => {
                                if (onUpdateTeacher) {
                                  onUpdateTeacher(teacher.id, editData);
                                }
                                setEditingTeacherId(null);
                              }}
                              className="px-2 py-1 text-[10px] bg-violet-600 text-white rounded font-bold flex items-center gap-1"
                            >
                              <Check className="h-3 w-3" /> บันทึก
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center bg-violet-50/50 p-2 rounded-xl mb-2 border border-violet-100/50">
                          <div className="text-[10px]">
                            {teacher.homeroomClass || teacher.coHomeroomClass ? (
                              <>
                                {teacher.homeroomClass && <div className="text-violet-700 font-bold"><Users className="h-3 w-3 inline mr-1"/>ประจำชั้น: {teacher.homeroomClass}</div>}
                                {teacher.coHomeroomClass && <div className="text-violet-600 font-semibold"><Users className="h-3 w-3 inline mr-1"/>คู่ชั้น: {teacher.coHomeroomClass}</div>}
                              </>
                            ) : (
                              <div className="text-slate-400 font-medium italic">ไม่มีข้อมูลประจำชั้น</div>
                            )}
                          </div>
                          <button 
                            onClick={() => {
                              setEditData({
                                thaiName: teacher.thaiName || '',
                                englishName: teacher.englishName || '',
                                employeeId: teacher.employeeId || '',
                                affiliation: teacher.affiliation || '',
                                role: teacher.role || 'teacher',
                                homeroomClass: teacher.homeroomClass || '',
                                coHomeroomClass: teacher.coHomeroomClass || '',
                              });
                              setEditingTeacherId(teacher.id);
                            }}
                            className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded text-slate-600 hover:bg-slate-50 shadow-xs font-semibold"
                          >
                            แก้ไขข้อมูล
                          </button>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-2 mt-2 text-center">
                        <div className="p-2 bg-slate-50 rounded-xl leading-none">
                          <span className="text-[8px] text-slate-400 font-black block uppercase">สารบัญสะสม</span>
                          <span className="text-xs font-extrabold text-slate-850 mt-1 block">{teacherRecords.length} แผน</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-xl leading-none">
                          <span className="text-[8px] text-slate-400 font-black block uppercase">ลงนามแล้ว</span>
                          <span className="text-xs font-extrabold text-emerald-600 mt-1 block">
                            {teacherRecords.filter(r => r.teacherSigned).length} แผน
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                    {isSelf ? (
                      <span className="text-[10px] text-slate-400 italic font-semibold p-1.5 bg-slate-50 rounded-lg">
                        🔒 ป้องกันบัญชีตนเอง
                      </span>
                    ) : teacher.id === 't-default-1' ? (
                      <span className="text-[10px] text-slate-400 italic font-semibold p-1.5 bg-slate-50 rounded-lg">
                        🔒 ตัวอย่างระบบหลัก (ลบไม่ได้)
                      </span>
                    ) : (
                      <button
                        onClick={() => onDeleteTeacher(teacher.id)}
                        className="text-[10.5px] font-black text-rose-600 border border-thin border-rose-200 hover:bg-rose-50/80 hover:border-rose-300 px-3 py-1.5 rounded-lg active:scale-95 transition flex items-center gap-1.5"
                      >
                        🗑️ ลบบัญชีผู้ใช้ครู
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

          {teachers.filter(teacher => {
            if (!adminSearchQuery.trim()) return true;
            const query = adminSearchQuery.toLowerCase();
            return (
              (teacher.displayName || '').toLowerCase().includes(query) ||
              (teacher.thaiName || '').toLowerCase().includes(query) ||
              (teacher.englishName || '').toLowerCase().includes(query) ||
              (teacher.email || '').toLowerCase().includes(query) ||
              (teacher.employeeId || '').toLowerCase().includes(query) ||
              (teacher.affiliation || '').toLowerCase().includes(query)
            );
          }).length === 0 && (
            <div className="col-span-full py-16 text-center text-xs text-slate-400 font-bold">
               ไม่พบบัญชีผู้ใช้ครูที่ตรงกับคำค้นหา: "{adminSearchQuery}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
