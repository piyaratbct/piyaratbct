const fs = require('fs');
const file = 'src/components/SARMonitoringDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// The marker for the start of the grid
const gridStartMarker = `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`;
// The marker for the end of the grid (before the SAR tags distribution section)
const sarTagsStartMarker = `{/* SAR Tags Distribution Section */}`;

const headerEndMarker = `</div>\n\n      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`;

const gridStartIdx = content.indexOf(gridStartMarker);
const sarTagsStartIdx = content.indexOf(sarTagsStartMarker);

if (gridStartIdx !== -1 && sarTagsStartIdx !== -1) {
  const tabsString = `
      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-px overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={\`px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors border-b-2 \${
            activeTab === 'overview'
              ? 'text-indigo-600 border-indigo-600'
              : 'text-slate-500 border-transparent hover:text-slate-800 hover:border-slate-300'
          }\`}
        >
          ภาพรวม (Overview)
        </button>
        <button
          onClick={() => setActiveTab('std1')}
          className={\`px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors border-b-2 \${
            activeTab === 'std1'
              ? 'text-sky-600 border-sky-600'
              : 'text-slate-500 border-transparent hover:text-slate-800 hover:border-slate-300'
          }\`}
        >
          ม.1 (คุณภาพผู้เรียน)
        </button>
        <button
          onClick={() => setActiveTab('std2')}
          className={\`px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors border-b-2 \${
            activeTab === 'std2'
              ? 'text-fuchsia-600 border-fuchsia-600'
              : 'text-slate-500 border-transparent hover:text-slate-800 hover:border-slate-300'
          }\`}
        >
          ม.2 (กระบวนการบริหารฯ)
        </button>
        <button
          onClick={() => setActiveTab('std3')}
          className={\`px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors border-b-2 \${
            activeTab === 'std3'
              ? 'text-amber-600 border-amber-600'
              : 'text-slate-500 border-transparent hover:text-slate-800 hover:border-slate-300'
          }\`}
        >
          ม.3 (การจัดการเรียนการสอน)
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">`;

  content = content.replace(gridStartMarker, tabsString);
  
  const sarTagsString = `        </div>
      )}

      {activeTab === 'std1' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-sky-50/50 flex items-center gap-3">
              <div className="h-10 w-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-black text-slate-800 text-lg">มาตรฐานที่ 1: คุณภาพของผู้เรียน</h2>
                <p className="text-xs font-bold text-sky-600">เจาะลึกข้อมูลผลสัมฤทธิ์และคุณลักษณะ</p>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700">อยู่ระหว่างการพัฒนา</h3>
                <p className="text-slate-500 mt-2">ส่วนนี้เตรียมไว้สำหรับแสดงตารางเจาะลึกข้อมูลรายบุคคล เช่น ผลการเรียนเฉลี่ย และบันทึกพฤติกรรม</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'std2' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-fuchsia-50/50 flex items-center gap-3">
              <div className="h-10 w-10 bg-fuchsia-100 text-fuchsia-600 rounded-xl flex items-center justify-center shrink-0">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-black text-slate-800 text-lg">มาตรฐานที่ 2: กระบวนการบริหารและการจัดการ</h2>
                <p className="text-xs font-bold text-fuchsia-600">เจาะลึกข้อมูลการพัฒนาครู (PD/PLC)</p>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700">อยู่ระหว่างการพัฒนา</h3>
                <p className="text-slate-500 mt-2">ส่วนนี้เตรียมไว้สำหรับแสดงตารางรายชื่อครู พร้อมชั่วโมง PD และ PLC แบบเจาะลึกรายบุคคล</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'std3' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-amber-50/50 flex items-center gap-3">
              <div className="h-10 w-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-black text-slate-800 text-lg">มาตรฐานที่ 3: การจัดการเรียนการสอนที่เน้นผู้เรียน</h2>
                <p className="text-xs font-bold text-amber-600">เจาะลึกข้อมูลการสอนและการบูรณาการ</p>
              </div>
            </div>
            <div className="p-6 bg-slate-50/50">
              <div className="text-center py-8 mb-6 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700">อยู่ระหว่างการพัฒนา</h3>
                <p className="text-slate-500 mt-2">ส่วนนี้เตรียมไว้สำหรับแสดงตารางสรุปการส่งแผนการสอนและงานวิจัยแยกตามหมวดวิชา</p>
              </div>

              {/* SAR Tags Distribution Section */}`;
              
  content = content.replace(sarTagsStartMarker, sarTagsString);

  // We need to close the std3 div.
  // The end of the file is:
  //       </div>
  //     </div>
  //   );
  // }
  
  const endMarker = `    </div>
  );
}`;
  const replaceEnd = `          </div>
        </div>
      )}
    </div>
  );
}`;
  content = content.replace(endMarker, replaceEnd);
  
  // also need to remove the shadow-sm border border-slate-100 from the SAR tags container
  // to make it look native inside the p-6 of std3 tab.
  // original: <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
  // replace: <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
  
  content = content.replace(
    `<div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">`,
    `<div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">`
  );

  fs.writeFileSync(file, content);
  console.log("Success");
} else {
  console.log("Markers not found.");
}
