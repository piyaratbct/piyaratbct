import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    old_ui = """                        <label className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[10px] px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer shadow-sm transition">
                          <Upload className="h-3 w-3" />
                          อัปโหลดรูปภาพ
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoFileUpload}
                            className="hidden"
                          />
                        </label>"""
                        
    new_ui = """                        <label className={`flex-1 sm:flex-none flex items-center justify-center gap-1 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[10px] px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer shadow-sm transition ${isUploadingLogo ? 'opacity-50 pointer-events-none' : ''}`}>
                          {isUploadingLogo ? (
                            <span className="h-3 w-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                          ) : (
                            <Upload className="h-3 w-3" />
                          )}
                          {isUploadingLogo ? 'กำลังอัปโหลด...' : 'อัปโหลดรูปภาพ'}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoFileUpload}
                            className="hidden"
                            disabled={isUploadingLogo}
                          />
                        </label>"""

    code = code.replace(old_ui, new_ui)

    with open(filename, 'w') as f:
        f.write(code)

fix('src/App.tsx')
