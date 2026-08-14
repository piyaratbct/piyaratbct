const fs = require('fs');
let code = fs.readFileSync('src/components/AcademicSettings.tsx', 'utf8');

const targetUI = `        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">`;
const replacementUI = `        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 border-b border-slate-100 pb-8">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อโรงเรียน</label>
              <input
                type="text"
                value={schoolName}
                onChange={e => setSchoolName(e.target.value)}
                disabled={!canEdit || isProcessing}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 disabled:bg-slate-50"
                placeholder="ระบุชื่อโรงเรียน"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">แขวง/ตำบล</label>
              <input
                type="text"
                value={schoolSubDistrict}
                onChange={e => setSchoolSubDistrict(e.target.value)}
                disabled={!canEdit || isProcessing}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 disabled:bg-slate-50"
                placeholder="ระบุแขวงหรือตำบล"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">เขต/อำเภอ</label>
              <input
                type="text"
                value={schoolDistrict}
                onChange={e => setSchoolDistrict(e.target.value)}
                disabled={!canEdit || isProcessing}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 disabled:bg-slate-50"
                placeholder="ระบุเขตหรืออำเภอ"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">จังหวัด</label>
              <input
                type="text"
                value={schoolProvince}
                onChange={e => setSchoolProvince(e.target.value)}
                disabled={!canEdit || isProcessing}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 disabled:bg-slate-50"
                placeholder="ระบุจังหวัด"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">`;
code = code.replace(targetUI, replacementUI);
fs.writeFileSync('src/components/AcademicSettings.tsx', code, 'utf8');
