const fs = require('fs');
let code = fs.readFileSync('src/components/CurriculumManager.tsx', 'utf8');

// Add Download to lucide-react imports
code = code.replace(
  "import { BookOpen, Search, Plus, Edit, Trash2, Upload, CheckCircle2, Circle, Loader2, Save, X, ChevronDown, ChevronRight } from 'lucide-react';",
  "import { BookOpen, Search, Plus, Edit, Trash2, Upload, CheckCircle2, Circle, Loader2, Save, X, ChevronDown, ChevronRight, Download, AlertTriangle, CheckCircle } from 'lucide-react';"
);

// Add custom modal states
const modalStates = `
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void } | null>(null);
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' } | null>(null);

  const downloadTemplate = () => {
    const data = [
      {
        'ชื่อรายวิชา': 'คณิตศาสตร์พื้นฐาน (ค11101)',
        'ระดับชั้น': 'ประถมศึกษาปีที่ 1',
        'มาตรฐาน': 'มาตรฐาน ค 1.1',
        'รหัสตัวชี้วัด': 'ค 1.1 ป.1/1',
        'คำอธิบายตัวชี้วัด': 'บอกจำนวนของสิ่งต่าง ๆ แสดงสิ่งต่าง ๆ ตามจำนวนที่กำหนด อ่านและเขียนตัวเลขฮินดูอารบิก ตัวเลขไทยแสดงจำนวนนับไม่เกิน 100 และ 0',
        'ประเภท': 'ต้องรู้ (Core)'
      },
      {
        'ชื่อรายวิชา': 'คณิตศาสตร์พื้นฐาน (ค11101)',
        'ระดับชั้น': 'ประถมศึกษาปีที่ 1',
        'มาตรฐาน': 'มาตรฐาน ค 1.1',
        'รหัสตัวชี้วัด': 'ค 1.1 ป.1/2',
        'คำอธิบายตัวชี้วัด': 'เปรียบเทียบจำนวนนับไม่เกิน 100 และ 0 โดยใช้เครื่องหมาย = ≠ > <',
        'ประเภท': 'ควรรู้ (Terminal)'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ตัวชี้วัด");

    // Adjust column widths
    const wscols = [
      { wch: 25 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 60 },
      { wch: 15 }
    ];
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, "แบบฟอร์มนำเข้าตัวชี้วัด.xlsx");
  };
`;

code = code.replace(
  "const [searchQuery, setSearchQuery] = useState('');",
  "const [searchQuery, setSearchQuery] = useState('');\n" + modalStates
);

// Replace confirm and alert
code = code.replace(
  "if (!confirm('ยืนยันการลบรายวิชานี้? ข้อมูลมาตรฐานและตัวชี้วัดทั้งหมดจะถูกลบด้วย')) return;",
  "setConfirmModal({ isOpen: true, title: 'ลบรายวิชา', message: 'ยืนยันการลบรายวิชานี้? ข้อมูลมาตรฐานและตัวชี้วัดทั้งหมดจะถูกลบด้วย และไม่สามารถกู้คืนได้', onConfirm: async () => { setConfirmModal(null);"
);
code = code.replace(
  "      await fetchCurriculums();\n    } catch (error) {\n      handleFirestoreError(error, OperationType.DELETE, 'curriculums');\n    }\n  };",
  "      await fetchCurriculums();\n    } catch (error) {\n      handleFirestoreError(error, OperationType.DELETE, 'curriculums');\n    }\n  }});"
);

code = code.replace(
  "if (!selectedCurriculum || !confirm('ยืนยันการลบมาตรฐานการเรียนรู้นี้?')) return;",
  "if (!selectedCurriculum) return;\n    setConfirmModal({ isOpen: true, title: 'ลบมาตรฐานการเรียนรู้', message: 'ยืนยันการลบมาตรฐานการเรียนรู้นี้พร้อมตัวชี้วัดทั้งหมดภายใต้มาตรฐานนี้?', onConfirm: async () => { setConfirmModal(null);"
);
code = code.replace(
  "      setCurriculums(prev => prev.map(c => c.id === updatedCurriculum.id ? updatedCurriculum : c));\n    } catch (error) {\n      handleFirestoreError(error, OperationType.DELETE, 'curriculums');\n    }\n  };",
  "      setCurriculums(prev => prev.map(c => c.id === updatedCurriculum.id ? updatedCurriculum : c));\n    } catch (error) {\n      handleFirestoreError(error, OperationType.DELETE, 'curriculums');\n    }\n  }});"
);

code = code.replace(
  "if (!selectedCurriculum || !confirm('ยืนยันการลบตัวชี้วัดนี้?')) return;",
  "if (!selectedCurriculum) return;\n    setConfirmModal({ isOpen: true, title: 'ลบตัวชี้วัด', message: 'ยืนยันการลบตัวชี้วัดนี้?', onConfirm: async () => { setConfirmModal(null);"
);
code = code.replace(
  "      setCurriculums(prev => prev.map(c => c.id === updatedCurriculum.id ? updatedCurriculum : c));\n    } catch (error) {\n      handleFirestoreError(error, OperationType.DELETE, 'curriculums');\n    }\n  };",
  "      setCurriculums(prev => prev.map(c => c.id === updatedCurriculum.id ? updatedCurriculum : c));\n    } catch (error) {\n      handleFirestoreError(error, OperationType.DELETE, 'curriculums');\n    }\n  }});"
);

code = code.replace(
  "alert(\`นำเข้าข้อมูลสำเร็จ \${successCount} รายวิชา\`);",
  "setAlertModal({ isOpen: true, title: 'นำเข้าข้อมูลสำเร็จ', message: \`นำเข้าข้อมูลตัวชี้วัดจำนวน \${successCount} รายวิชาเรียบร้อยแล้ว\`, type: 'success' });"
);

code = code.replace(
  "alert('เกิดข้อผิดพลาดในการนำเข้าไฟล์ Excel โปรดตรวจสอบรูปแบบไฟล์');",
  "setAlertModal({ isOpen: true, title: 'เกิดข้อผิดพลาด', message: 'เกิดข้อผิดพลาดในการนำเข้าไฟล์ Excel โปรดตรวจสอบรูปแบบไฟล์ให้ตรงกับแบบฟอร์ม', type: 'error' });"
);

// Add download button to UI
const downloadButton = `
          <button 
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold shadow-sm hover:bg-slate-50 transition-colors"
          >
            <Download className="h-4 w-4" /> โหลดไฟล์ตัวอย่าง
          </button>
`;
code = code.replace(
  "accept=\".xlsx, .xls\" \n          />",
  "accept=\".xlsx, .xls\" \n          />" + downloadButton
);

// Add custom modals to JSX
const modalsJsx = `
      {/* Alert Modal */}
      {alertModal && alertModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 text-center p-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4">
              {alertModal.type === 'success' ? (
                <CheckCircle className="h-6 w-6 text-emerald-500" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-rose-500" />
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">{alertModal.title}</h3>
            <p className="text-sm text-slate-600 mb-6">{alertModal.message}</p>
            <button
              onClick={() => setAlertModal(null)}
              className="w-full px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-500" />
                {confirmModal.title}
              </h3>
              <p className="text-sm text-slate-600">{confirmModal.message}</p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-4 py-2 text-sm font-bold bg-rose-500 text-white hover:bg-rose-600 rounded-lg transition-colors"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(
  "      {/* Modals */}",
  "      {/* Modals */}\n" + modalsJsx
);

fs.writeFileSync('src/components/CurriculumManager.tsx', code, 'utf8');
