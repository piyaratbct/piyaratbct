import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

old_btns = """                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setShowHistoryCompare(!showHistoryCompare)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${showHistoryCompare ? 'bg-pink-50 text-pink-600 border-pink-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    >
                      {showHistoryCompare ? 'ซ่อนเปรียบเทียบย้อนหลัง' : 'เปรียบเทียบย้อนหลัง 4 เดือน'}
                    </button>"""

new_btns = """                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={printBatchHealthReport}
                      className="px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                      <Printer className="h-4 w-4" /> พิมพ์รายงานทั้งหมด
                    </button>
                    <button
                      onClick={() => setShowHistoryCompare(!showHistoryCompare)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${showHistoryCompare ? 'bg-pink-50 text-pink-600 border-pink-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    >
                      {showHistoryCompare ? 'ซ่อนเปรียบเทียบย้อนหลัง' : 'เปรียบเทียบย้อนหลัง 4 เดือน'}
                    </button>"""

content = content.replace(old_btns, new_btns)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
