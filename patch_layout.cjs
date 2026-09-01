const fs = require('fs');

let code = fs.readFileSync('src/components/AttendanceTracking.tsx', 'utf8');

const oldLayout = `<div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setShowMilkReport(true)}
              className="w-full justify-center sm:w-auto flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 font-bold transition-colors "
            >
              🥛 รายงานดื่มนม
            </button>
            <button
              onClick={handleClearAttendance}
              disabled={isSaving || isLoading}
              className="w-full justify-center sm:w-auto flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-slate-100 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-200 font-bold transition-colors disabled:opacity-50 "
            >
              <XCircle className="h-4 w-4" /> ล้างข้อมูล
            </button>
            <button
              onClick={handleMarkAllPresent}
              disabled={isSaving || isLoading}
              className="w-full justify-center sm:w-auto flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-100 font-bold transition-colors disabled:opacity-50 "
            >
              <CheckCircle2 className="h-4 w-4" /> มาเรียนทั้งหมด
            </button>
            
            <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer bg-violet-50 px-3 py-2 rounded-lg border border-violet-200">
              <input
                type="checkbox"
                checked={applyToAllPeriods}
                onChange={(e) => setApplyToAllPeriods(e.target.checked)}
                className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
              />
              ใช้ข้อมูลนี้เหมือนกันทุกคาบ
            </label>
            <button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="w-full justify-center sm:w-auto flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold transition-colors disabled:opacity-50  shadow-sm"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              บันทึก
            </button>
          </div>`;

const newLayout = `<div className="flex flex-col xl:flex-row items-center gap-4 w-full md:w-auto">
            {/* Action Tools */}
            <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto p-1.5 bg-slate-100/70 rounded-xl border border-slate-200/80">
              <button
                onClick={() => setShowMilkReport(true)}
                className="w-full justify-center sm:w-auto flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm bg-white text-blue-600 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 font-semibold transition-colors shadow-sm"
              >
                🥛 รายงานดื่มนม
              </button>
              <button
                onClick={handleClearAttendance}
                disabled={isSaving || isLoading}
                className="w-full justify-center sm:w-auto flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm bg-white text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 font-medium transition-colors disabled:opacity-50 shadow-sm"
              >
                <XCircle className="h-4 w-4" /> ล้างข้อมูล
              </button>
              <button
                onClick={handleMarkAllPresent}
                disabled={isSaving || isLoading}
                className="col-span-2 sm:col-span-1 w-full justify-center sm:w-auto flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm bg-white text-emerald-600 border border-slate-200 rounded-lg hover:bg-emerald-50 hover:border-emerald-200 font-semibold transition-colors disabled:opacity-50 shadow-sm"
              >
                <CheckCircle2 className="h-4 w-4" /> มาเรียนทั้งหมด
              </button>
            </div>

            {/* Save Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <label className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs sm:text-sm text-violet-700 font-semibold cursor-pointer bg-violet-50/80 px-4 py-2.5 rounded-xl border border-violet-200 hover:bg-violet-100 transition-colors">
                <input
                  type="checkbox"
                  checked={applyToAllPeriods}
                  onChange={(e) => setApplyToAllPeriods(e.target.checked)}
                  className="rounded border-slate-300 text-violet-600 focus:ring-violet-500 h-4 w-4"
                />
                ใช้ข้อมูลนี้เหมือนกันทุกคาบ
              </label>
              <button
                onClick={handleSave}
                disabled={isSaving || isLoading}
                className="w-full sm:w-auto flex justify-center items-center gap-2 px-6 py-2.5 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold transition-all disabled:opacity-50 shadow-md hover:shadow-lg active:scale-95"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                บันทึกการเช็กชื่อ
              </button>
            </div>
          </div>`;

code = code.replace(oldLayout, newLayout);

fs.writeFileSync('src/components/AttendanceTracking.tsx', code);
console.log('Layout updated');
