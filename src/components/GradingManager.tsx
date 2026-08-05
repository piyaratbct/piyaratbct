import React, { useState } from 'react';
import { FileSpreadsheet, Search, Save, Download, CheckCircle2, Circle, Filter } from 'lucide-react';

export const GradingManager: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <FileSpreadsheet className="h-6 w-6 text-emerald-500" />
          ระบบบันทึกผลการเรียน (ปพ.5)
        </h2>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold shadow-sm hover:bg-slate-50 transition-colors">
            <Download className="h-4 w-4" /> ส่งออก ปพ.5
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold shadow-sm hover:bg-emerald-700 transition-colors">
            <Save className="h-4 w-4" /> บันทึกข้อมูล
          </button>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-4 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-slate-500 mb-1">รายวิชา</label>
          <select className="w-full border border-slate-200 rounded-lg text-sm bg-slate-50 py-2 px-3">
            <option>คณิตศาสตร์พื้นฐาน (ค11101) - ป.1/1</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-slate-500 mb-1">การประเมิน</label>
          <select className="w-full border border-slate-200 rounded-lg text-sm bg-slate-50 py-2 px-3">
            <option>ประเมินตามตัวชี้วัด (เน้นต้องรู้)</option>
            <option>คุณลักษณะอันพึงประสงค์</option>
            <option>อ่าน คิดวิเคราะห์ เขียน</option>
          </select>
        </div>
        <div className="flex-none pt-5">
           <button className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 rounded-lg text-sm font-bold hover:bg-rose-100 transition-colors border border-rose-100">
             <Filter className="h-4 w-4" /> แสดงเฉพาะ "ตัวชี้วัดต้องรู้" (ต้นทาง)
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-600">
              <tr>
                <th className="px-4 py-3 w-16 text-center border-r border-slate-200">เลขที่</th>
                <th className="px-4 py-3 border-r border-slate-200">ชื่อ-นามสกุล</th>
                <th className="px-2 py-3 text-center border-r border-slate-200 min-w-[80px]">
                  <div className="flex flex-col items-center">
                    <span className="text-rose-600 mb-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/> ต้องรู้</span>
                    <span>ค 1.1 ป.1/1</span>
                    <span className="text-[10px] text-slate-400 font-normal">(10 คะแนน)</span>
                  </div>
                </th>
                <th className="px-2 py-3 text-center border-r border-slate-200 min-w-[80px] bg-slate-100/50">
                  <div className="flex flex-col items-center">
                    <span className="text-amber-600 mb-1 flex items-center gap-1"><Circle className="h-3 w-3"/> ควรรู้</span>
                    <span>ค 1.1 ป.1/2</span>
                    <span className="text-[10px] text-slate-400 font-normal">(5 คะแนน)</span>
                  </div>
                </th>
                <th className="px-2 py-3 text-center border-r border-slate-200 min-w-[80px]">
                  <div className="flex flex-col items-center">
                    <span className="text-rose-600 mb-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/> ต้องรู้</span>
                    <span>ค 1.1 ป.1/3</span>
                    <span className="text-[10px] text-slate-400 font-normal">(10 คะแนน)</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-center w-24">
                  <div className="flex flex-col items-center text-indigo-600">
                    <span>รวม</span>
                    <span className="text-[10px] font-normal">(25 คะแนน)</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { id: 1, name: 'เด็กชายสมชาย เรียนดี' },
                { id: 2, name: 'เด็กหญิงสมหญิง รักเรียน' }
              ].map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-center font-medium border-r border-slate-200">{student.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-800 border-r border-slate-200 whitespace-nowrap">{student.name}</td>
                  <td className="px-2 py-2 border-r border-slate-200">
                    <input type="number" defaultValue={8} className="w-full text-center p-1.5 border border-slate-200 rounded focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                  </td>
                  <td className="px-2 py-2 border-r border-slate-200 bg-slate-100/30">
                    <input type="number" defaultValue={4} className="w-full text-center p-1.5 border border-slate-200 rounded bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                  </td>
                  <td className="px-2 py-2 border-r border-slate-200">
                    <input type="number" defaultValue={9} className="w-full text-center p-1.5 border border-slate-200 rounded focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                  </td>
                  <td className="px-4 py-2 text-center font-bold text-indigo-600 bg-indigo-50/30">
                    21
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
         <p className="text-xs text-slate-500 flex items-center gap-2">
           <span className="flex items-center gap-1 text-rose-600 font-bold"><CheckCircle2 className="h-4 w-4"/> ตัวชี้วัดต้องรู้ (Core)</span> หรือตัวชี้วัดต้นทาง คือตัวชี้วัดหลักที่ต้องนำมาใช้ประเมินผลการเรียน
         </p>
         <p className="text-xs text-slate-500 flex items-center gap-2">
           <span className="flex items-center gap-1 text-amber-600 font-bold"><Circle className="h-4 w-4"/> ตัวชี้วัดควรรู้</span> หรือตัวชี้วัดปลายทาง สามารถใช้ประเมินผลร่วม หรือบูรณาการได้
         </p>
      </div>
    </div>
  );
};
