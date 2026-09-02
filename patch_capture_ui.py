import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    old_btn = """              <button
                type="button"
                disabled={!!cameraError}
                onClick={capturePhoto}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none text-white font-extrabold text-[11px] rounded-xl active:scale-95 transition flex items-center justify-center gap-1.5"
              >
                <div className="h-2 w-2 rounded-full bg-white animate-ping" />
                ถ่ายคู่รูปตรา
              </button>"""
              
    new_btn = """              <button
                type="button"
                disabled={!!cameraError || isUploadingLogo}
                onClick={capturePhoto}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none text-white font-extrabold text-[11px] rounded-xl active:scale-95 transition flex items-center justify-center gap-1.5"
              >
                {isUploadingLogo ? (
                  <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <div className="h-2 w-2 rounded-full bg-white animate-ping" />
                )}
                {isUploadingLogo ? 'กำลังบันทึก...' : 'ถ่ายคู่รูปตรา'}
              </button>"""

    code = code.replace(old_btn, new_btn)

    with open(filename, 'w') as f:
        f.write(code)

fix('src/App.tsx')
