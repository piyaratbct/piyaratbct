cat << 'PATCH' > studentdetail.patch
--- src/components/StudentDetailModal.tsx
+++ src/components/StudentDetailModal.tsx
@@ -95,6 +95,13 @@
                 <p className="font-semibold text-slate-800">{student.religion || '-'}</p>
               </div>
+              <div>
+                <div className="flex items-center gap-2 text-slate-500 mb-1">
+                  <User className="h-4 w-4" />
+                  <span className="text-xs font-bold">สถานศึกษาเดิม</span>
+                </div>
+                <p className="font-semibold text-slate-800">{student.previousSchool || '-'}</p>
+              </div>
             </div>
 
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 md:col-span-2">
@@ -106,6 +113,7 @@
                 <div className="space-y-2">
                   <h4 className="text-sm font-bold text-indigo-600">ข้อมูลบิดา</h4>
                   <p className="text-sm"><span className="text-slate-500 font-bold">ชื่อ-นามสกุล:</span> {student.fatherName || '-'}</p>
+                  <p className="text-sm"><span className="text-slate-500 font-bold">วันเกิด:</span> {formatThaiDate(student.fatherDob)}</p>
                   <p className="text-sm"><span className="text-slate-500 font-bold">อาชีพ:</span> {student.fatherOccupation || '-'}</p>
                   <p className="text-sm"><span className="text-slate-500 font-bold">รายได้:</span> {student.fatherIncome || '-'}</p>
                   <p className="text-sm"><span className="text-slate-500 font-bold">สถานที่ทำงาน:</span> {student.fatherWorkplace || '-'} {student.fatherWorkplaceProvince ? `(จ.${student.fatherWorkplaceProvince})` : ''}</p>
@@ -115,6 +123,7 @@
                 <div className="space-y-2">
                   <h4 className="text-sm font-bold text-pink-600">ข้อมูลมารดา</h4>
                   <p className="text-sm"><span className="text-slate-500 font-bold">ชื่อ-นามสกุล:</span> {student.motherName || '-'}</p>
+                  <p className="text-sm"><span className="text-slate-500 font-bold">วันเกิด:</span> {formatThaiDate(student.motherDob)}</p>
                   <p className="text-sm"><span className="text-slate-500 font-bold">อาชีพ:</span> {student.motherOccupation || '-'}</p>
                   <p className="text-sm"><span className="text-slate-500 font-bold">รายได้:</span> {student.motherIncome || '-'}</p>
                   <p className="text-sm"><span className="text-slate-500 font-bold">สถานที่ทำงาน:</span> {student.motherWorkplace || '-'} {student.motherWorkplaceProvince ? `(จ.${student.motherWorkplaceProvince})` : ''}</p>
@@ -148,6 +157,10 @@
               <span className="font-black text-sm uppercase tracking-wider">ข้อมูลสุขภาพ / โรคประจำตัว / การแพ้</span>
             </div>
             <div className="relative z-10 space-y-3">
+              <div>
+                <span className="text-xs font-bold text-rose-700 block mb-0.5">หมู่โลหิต</span>
+                <p className="text-sm font-semibold text-rose-900 bg-white px-3 py-2 rounded-lg border border-rose-100">{student.bloodGroup || '-'}</p>
+              </div>
               <div>
                 <span className="text-xs font-bold text-rose-700 block mb-0.5">การแพ้ยา</span>
                 <p className="text-sm font-semibold text-rose-900 bg-white px-3 py-2 rounded-lg border border-rose-100">{student.allergicMedicine || '-'}</p>
PATCH
patch src/components/StudentDetailModal.tsx studentdetail.patch
