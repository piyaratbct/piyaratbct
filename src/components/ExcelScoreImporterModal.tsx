import React, { useState, useRef } from 'react';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, X, Info, HelpCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Student, SubjectSettings, ActivityColumn } from '../types';

interface ExcelScoreImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSubject: string;
  selectedGrade: string;
  academicYear: string;
  semester: string;
  students: Student[];
  subjectSettings: SubjectSettings | null;
  onImportComplete: (
    scoresToUpdate: Array<{
      studentId: string;
      beforeMidKnowledgeScore?: number;
      beforeMidSoftSkillScore?: number;
      midtermScore?: number;
      afterMidKnowledgeScore?: number;
      afterMidSoftSkillScore?: number;
      finalScore?: number;
      activities?: Record<string, number>;
    }>,
    newSettings?: SubjectSettings
  ) => Promise<void>;
}

interface ParsedColumn {
  headerName: string;
  detectedType: 'info' | 'activity' | 'fixedScore';
  targetField?: 'beforeMidKnowledgeScore' | 'beforeMidSoftSkillScore' | 'midtermScore' | 'afterMidKnowledgeScore' | 'afterMidSoftSkillScore' | 'finalScore';
  category?: 'beforeMidKnowledge' | 'beforeMidSoftSkill' | 'afterMidKnowledge' | 'afterMidSoftSkill';
  activityName?: string;
  maxScore: number;
}

export const ExcelScoreImporterModal: React.FC<ExcelScoreImporterModalProps> = ({
  isOpen,
  onClose,
  selectedSubject,
  selectedGrade,
  academicYear,
  semester,
  students,
  subjectSettings,
  onImportComplete
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parsedHeaders, setParsedHeaders] = useState<ParsedColumn[]>([]);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [autoCreateActivities, setAutoCreateActivities] = useState(true);
  const [clampOutOfRangeScores, setClampOutOfRangeScores] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 1. Download Template function
  const handleDownloadTemplate = () => {
    // Generate headers
    const headers = [
      'เลขประจำตัว',
      'เลขที่',
      'ชื่อ - สกุล',
      'ชิ้นงาน/ใบงาน 1 (10)',
      'การส่งงาน/ความรับผิดชอบ (10)',
      'สอบกลางภาค (20)',
      'ชิ้นงาน/ใบงาน 2 (10)',
      'พฤติกรรมการเรียน (10)',
      'สอบปลายภาค (30)'
    ];

    // Rows with current students in this grade
    const classStudents = students
      .filter(s => s.gradeLevel === selectedGrade)
      .sort((a, b) => (Number(a.number) || 0) - (Number(b.number) || 0));

    const rows = classStudents.map(s => [
      s.studentId,
      s.number || '',
      `${s.firstName} ${s.lastName}`.trim(),
      '', // ชิ้นงาน 1
      '', // การส่งงาน
      '', // กลางภาค
      '', // ชิ้นงาน 2
      '', // พฤติกรรม
      ''  // ปลายภาค
    ]);

    const worksheetData = [
      [`แบบฟอร์มคะแนนวิชา: ${selectedSubject} ชั้น: ${selectedGrade} ปีการศึกษา: ${academicYear} ภาคเรียนที่: ${semester}`],
      [], // blank line
      headers,
      ...rows
    ];

    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // Styling column widths
    ws['!cols'] = [
      { wch: 14 }, // studentId
      { wch: 8 },  // number
      { wch: 26 }, // name
      { wch: 24 }, // act1
      { wch: 28 }, // act2
      { wch: 18 }, // midterm
      { wch: 24 }, // act3
      { wch: 24 }, // act4
      { wch: 18 }  // final
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'คะแนน');

    const cleanSubject = selectedSubject.replace(/[\\/:*?"<>|]/g, '');
    const cleanGrade = selectedGrade.replace(/[\\/:*?"<>|]/g, '');
    XLSX.writeFile(wb, `คะแนน_${cleanSubject}_${cleanGrade}_${academicYear}_${semester}.xlsx`);
  };

  // 2. Parse uploaded excel file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setErrorMsg(null);
    setParsing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        // Read rows as array of arrays
        const rawData: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (!rawData || rawData.length === 0) {
          setErrorMsg('ไม่พบข้อมูลในไฟล์ Excel');
          setParsing(false);
          return;
        }

        // Find header row (the first row containing "เลขประจำตัว" or "รหัสนักเรียน" or "ชื่อ" or "เลขที่")
        let headerRowIndex = -1;
        for (let i = 0; i < Math.min(rawData.length, 10); i++) {
          const row = rawData[i];
          if (Array.isArray(row)) {
            const hasId = row.some(cell => String(cell || '').includes('เลขประจำตัว') || String(cell || '').includes('รหัส'));
            const hasName = row.some(cell => String(cell || '').includes('ชื่อ'));
            const hasNum = row.some(cell => String(cell || '').includes('เลขที่'));
            if ((hasId || hasNum) && hasName) {
              headerRowIndex = i;
              break;
            }
          }
        }

        // Fallback: If no descriptive header found, assume row 0
        if (headerRowIndex === -1) {
          headerRowIndex = 0;
        }

        const rawHeaders: string[] = (rawData[headerRowIndex] || []).map(h => String(h || '').trim());
        const dataRows = rawData.slice(headerRowIndex + 1).filter(r => r && r.length > 0 && r.some(c => c !== null && c !== undefined && c !== ''));

        // Analyze and map headers with positional detection relative to Midterm
        let foundMidterm = false;
        const parsedCols: ParsedColumn[] = rawHeaders.map((header) => {
          const lower = header.toLowerCase();

          // Extract max score from bracket e.g. "ใบงาน 1 (10)" -> 10
          let maxScore = 10;
          const scoreMatch = header.match(/\((\d+(\.\d+)?)\)/);
          if (scoreMatch) {
            maxScore = parseFloat(scoreMatch[1]);
          }

          // Check if Info column
          if (lower.includes('เลขประจำตัว') || lower.includes('รหัส') || lower.includes('studentid') || lower === 'id') {
            return { headerName: header, detectedType: 'info', maxScore: 0 };
          }
          if (lower.includes('เลขที่') || lower === 'no' || lower === '#') {
            return { headerName: header, detectedType: 'info', maxScore: 0 };
          }
          if (lower.includes('ชื่อ') || lower.includes('สกุล') || lower === 'name') {
            return { headerName: header, detectedType: 'info', maxScore: 0 };
          }

          // Check Fixed score columns
          if (lower.includes('กลางภาค') || lower.includes('midterm')) {
            foundMidterm = true;
            return { headerName: header, detectedType: 'fixedScore', targetField: 'midtermScore', maxScore: maxScore || 20 };
          }
          if (lower.includes('ปลายภาค') || lower.includes('final')) {
            return { headerName: header, detectedType: 'fixedScore', targetField: 'finalScore', maxScore: maxScore || 30 };
          }

          // Positional & Keyword Determination
          // 1. If column is positioned AFTER the Midterm column, default to after-midterm
          // 2. Or if keyword contains 'หลัง' -> afterMidKnowledge
          // 3. Or if keyword contains soft-skills like 'พฤติกรรม', 'ส่งงาน'
          let category: 'beforeMidKnowledge' | 'beforeMidSoftSkill' | 'afterMidKnowledge' | 'afterMidSoftSkill' = foundMidterm ? 'afterMidKnowledge' : 'beforeMidKnowledge';

          const isSoftSkill = lower.includes('พฤติกรรม') || lower.includes('คุณธรรม') || lower.includes('การส่งงาน') || lower.includes('จิตพิสัย') || lower.includes('ความรับผิดชอบ') || lower.includes('วินัย');

          if (isSoftSkill) {
            category = foundMidterm ? 'afterMidSoftSkill' : 'beforeMidSoftSkill';
          } else if (lower.includes('หลังกลางภาค') || lower.includes('หลังสอบ')) {
            category = 'afterMidKnowledge';
          } else if (lower.includes('ก่อนกลางภาค') || lower.includes('ก่อนสอบ')) {
            category = 'beforeMidKnowledge';
          }

          // Clean activity name (remove bracket score)
          const cleanName = header.replace(/\s*\(\d+(\.\d+)?\)\s*$/, '').trim();

          return {
            headerName: header,
            detectedType: 'activity',
            category,
            activityName: cleanName,
            maxScore: maxScore || 10
          };
        });

        setParsedHeaders(parsedCols);

        // Map data rows to students
        const classStudents = students.filter(s => s.gradeLevel === selectedGrade);
        const studentById = new Map<string, Student>();
        const studentByNum = new Map<number, Student>();
        const studentByName = new Map<string, Student>();

        classStudents.forEach(s => {
          if (s.studentId) studentById.set(String(s.studentId).trim(), s);
          if (s.number) studentByNum.set(Number(s.number), s);
          const fullName = `${s.firstName || ''} ${s.lastName || ''}`.replace(/\s+/g, ' ').trim();
          studentByName.set(fullName, s);
        });

        const idColIndex = parsedCols.findIndex(c => c.detectedType === 'info' && (c.headerName.includes('เลขประจำตัว') || c.headerName.includes('รหัส')));
        const numColIndex = parsedCols.findIndex(c => c.detectedType === 'info' && c.headerName.includes('เลขที่'));
        const nameColIndex = parsedCols.findIndex(c => c.detectedType === 'info' && c.headerName.includes('ชื่อ'));

        const previewList: any[] = [];

        dataRows.forEach((row, rIdx) => {
          const rowId = idColIndex !== -1 ? String(row[idColIndex] || '').trim() : '';
          const rowNum = numColIndex !== -1 ? Number(row[numColIndex]) : null;
          const rowName = nameColIndex !== -1 ? String(row[nameColIndex] || '').replace(/\s+/g, ' ').trim() : '';

          // Match student
          let matchedStudent: Student | undefined = undefined;
          if (rowId && studentById.has(rowId)) {
            matchedStudent = studentById.get(rowId);
          } else if (rowNum && studentByNum.has(rowNum)) {
            matchedStudent = studentByNum.get(rowNum);
          } else if (rowName) {
            matchedStudent = studentByName.get(rowName);
          }

          const scoreValues: Record<string, number> = {};
          parsedCols.forEach((col, cIdx) => {
            if (col.detectedType !== 'info') {
              const rawVal = row[cIdx];
              if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
                const num = parseFloat(rawVal);
                if (!isNaN(num)) {
                  scoreValues[col.headerName] = num;
                }
              }
            }
          });

          previewList.push({
            rowIndex: rIdx + 1,
            matchedStudent,
            rawRow: row,
            rowId,
            rowNum,
            rowName,
            scoreValues
          });
        });

        setPreviewRows(previewList);
        setParsing(false);
      } catch (err: any) {
        console.error('Error parsing excel:', err);
        setErrorMsg('ไม่สามารถอ่านไฟล์ได้ กรุณาตรวจสอบรูปแบบไฟล์ Excel (.xlsx, .xls)');
        setParsing(false);
      }
    };

    reader.readAsBinaryString(uploadedFile);
  };

  // 3. Confirm Import
  const handleConfirmImport = async () => {
    if (previewRows.length === 0) return;
    setIsSaving(true);
    try {
      // Step A: Prepare Subject Settings updates if autoCreateActivities is true
      let updatedSettings: SubjectSettings | undefined = undefined;
      const activityCols = parsedHeaders.filter(c => c.detectedType === 'activity');

      if (autoCreateActivities && activityCols.length > 0) {
        const baseSettings: SubjectSettings = subjectSettings || {
          id: `${academicYear}_${semester}_${selectedGrade}_${selectedSubject}`.replace(/[\/]/g, '-'),
          academicYear,
          semester,
          gradeLevel: selectedGrade,
          subject: selectedSubject,
          beforeMidKnowledge: [],
          beforeMidSoftSkill: [],
          afterMidKnowledge: [],
          afterMidSoftSkill: []
        };

        const newBeforeMidK: ActivityColumn[] = [...(baseSettings.beforeMidKnowledge || [])];
        const newBeforeMidS: ActivityColumn[] = [...(baseSettings.beforeMidSoftSkill || [])];
        const newAfterMidK: ActivityColumn[] = [...(baseSettings.afterMidKnowledge || [])];
        const newAfterMidS: ActivityColumn[] = [...(baseSettings.afterMidSoftSkill || [])];

        activityCols.forEach(col => {
          const actName = col.activityName || col.headerName;
          const cat = col.category || 'beforeMidKnowledge';
          let targetList = 
            cat === 'beforeMidKnowledge' ? newBeforeMidK :
            cat === 'beforeMidSoftSkill' ? newBeforeMidS :
            cat === 'afterMidKnowledge' ? newAfterMidK : newAfterMidS;

          // Check if already exists with same name
          const existing = targetList.find(a => a.name === actName || a.name.includes(actName));
          if (!existing) {
            const newId = `excel_act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
            targetList.push({
              id: newId,
              name: actName,
              maxScore: col.maxScore || 10
            });
            // Assign newId to col for mapping
            (col as any).activityId = newId;
          } else {
            (col as any).activityId = existing.id;
          }
        });

        updatedSettings = {
          ...baseSettings,
          beforeMidKnowledge: newBeforeMidK,
          beforeMidSoftSkill: newBeforeMidS,
          afterMidKnowledge: newAfterMidK,
          afterMidSoftSkill: newAfterMidS
        };
      }

      // Step B: Prepare student scores to update
      const scoresToUpdate: Array<{
        studentId: string;
        beforeMidKnowledgeScore?: number;
        beforeMidSoftSkillScore?: number;
        midtermScore?: number;
        afterMidKnowledgeScore?: number;
        afterMidSoftSkillScore?: number;
        finalScore?: number;
        activities?: Record<string, number>;
      }> = [];

      previewRows.forEach(item => {
        if (!item.matchedStudent) return;

        const activitiesObj: Record<string, number> = {};
        let midterm: number | undefined = undefined;
        let finalVal: number | undefined = undefined;

        parsedHeaders.forEach(col => {
          let val = item.scoreValues[col.headerName];
          if (val === undefined || val === null) return;

          // Min/Max validation check
          if (val < 0 || val > col.maxScore) {
            if (clampOutOfRangeScores) {
              val = Math.min(col.maxScore, Math.max(0, val));
            } else {
              throw new Error(`พบคะแนนเกินเกณฑ์สำหรับนักเรียน ${item.matchedStudent?.firstName} ในคอลัมน์ "${col.headerName}" (ระบุ: ${val} แต่คะแนนเต็ม ${col.maxScore}) กรุณาเปิดตัวเลือกปรับคะแนนอัตโนมัติก่อนนำเข้า`);
            }
          }

          if (col.detectedType === 'fixedScore') {
            if (col.targetField === 'midtermScore') midterm = val;
            if (col.targetField === 'finalScore') finalVal = val;
          } else if (col.detectedType === 'activity') {
            const actId = (col as any).activityId || `act_${col.activityName}`;
            activitiesObj[actId] = val;
          }
        });

        scoresToUpdate.push({
          studentId: item.matchedStudent.id,
          midtermScore: midterm,
          finalScore: finalVal,
          activities: activitiesObj
        });
      });

      await onImportComplete(scoresToUpdate, updatedSettings);
      alert(`นำเข้าคะแนนสำเร็จจำนวน ${scoresToUpdate.length} คน!`);
      onClose();
    } catch (err: any) {
      console.error('Failed to import scores:', err);
      alert('เกิดข้อผิดพลาดในการนำเข้าคะแนน: ' + (err.message || String(err)));
    } finally {
      setIsSaving(false);
    }
  };

  const matchedCount = previewRows.filter(r => r.matchedStudent).length;

  // Calculate Out-of-range Min/Max statistics
  const outOfRangeStats = React.useMemo(() => {
    let errorCount = 0;
    const studentsWithErrors = new Set<string>();

    previewRows.forEach(row => {
      parsedHeaders.forEach(col => {
        if (col.detectedType !== 'info') {
          const val = row.scoreValues[col.headerName];
          if (val !== undefined && val !== null) {
            if (val < 0 || val > col.maxScore) {
              errorCount++;
              studentsWithErrors.add(row.rowIndex);
            }
          }
        }
      });
    });

    return {
      count: errorCount,
      studentCount: studentsWithErrors.size
    };
  }, [previewRows, parsedHeaders]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <FileSpreadsheet className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">นำเข้าคะแนนจากไฟล์ Excel</h3>
              <p className="text-xs text-emerald-100">
                วิชา: {selectedSubject} • ชั้น: {selectedGrade} • ภาคเรียน {semester}/{academicYear}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Step 1: Download Template Notice */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Info className="h-4 w-4 text-emerald-600" />
                ยังไม่มีแบบฟอร์มคะแนนของวิชานี้?
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                ดาวน์โหลดแบบฟอร์มที่มีรายชื่อนักเรียนในห้องและคอลัมน์กิจกรรมไปกรอกคะแนนได้ทันที
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition-all shadow-sm shrink-0"
            >
              <Download className="h-4 w-4 text-emerald-600" />
              ดาวน์โหลดแบบฟอร์ม Excel
            </button>
          </div>

          {/* Step 2: Upload Zone */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              เลือกไฟล์คะแนน Excel (.xlsx, .xls)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/30 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
            >
              <Upload className="h-8 w-8 text-emerald-600" />
              <div className="text-sm font-bold text-slate-700">
                {file ? file.name : 'คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่'}
              </div>
              <p className="text-xs text-slate-400">
                รองรับไฟล์ตารางคะแนนเดิมของคุณครูที่มีชื่อกิจกรรมและคะแนนเต็ม
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Step 3: Parsed Activities and Headers Preview */}
          {parsedHeaders.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ตรวจพบคอลัมน์และกิจกรรมเก็บคะแนน ({parsedHeaders.filter(c => c.detectedType !== 'info').length} รายการ)
                </h4>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoCreateActivities}
                    onChange={(e) => setAutoCreateActivities(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>สร้างกิจกรรมย่อยในระบบให้อัตโนมัติตามชื่อคอลัมน์</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {parsedHeaders
                  .filter(c => c.detectedType !== 'info')
                  .map((col, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                      <div className="font-bold text-slate-800 truncate" title={col.headerName}>
                        {col.headerName}
                      </div>

                      {col.detectedType === 'fixedScore' ? (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md font-bold">
                            {col.targetField === 'midtermScore' ? 'คะแนนสอบกลางภาค' : 'คะแนนสอบปลายภาค'}
                          </span>
                          <span className="font-bold text-slate-700">เต็ม {col.maxScore}</span>
                        </div>
                      ) : (
                        <div className="space-y-1.5 pt-1 border-t border-slate-200">
                          <div className="flex items-center justify-between gap-2">
                            <label className="text-[10px] font-bold text-slate-500">หมวดหมู่กิจกรรม:</label>
                            <select
                              value={col.category}
                              onChange={(e) => {
                                const newCat = e.target.value as any;
                                setParsedHeaders(prev => prev.map(p => p.headerName === col.headerName ? { ...p, category: newCat } : p));
                              }}
                              className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[11px] font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500"
                            >
                              <option value="beforeMidKnowledge">ก่อนกลางภาค (ชิ้นงาน/แบบฝึก)</option>
                              <option value="beforeMidSoftSkill">ก่อนกลางภาค (ส่งงาน/จิตพิสัย)</option>
                              <option value="afterMidKnowledge">หลังกลางภาค (ชิ้นงาน/แบบฝึก)</option>
                              <option value="afterMidSoftSkill">หลังกลางภาค (ส่งงาน/จิตพิสัย)</option>
                            </select>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-[10px] text-slate-400">คะแนนเต็ม</span>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={col.maxScore}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 10;
                                  setParsedHeaders(prev => prev.map(p => p.headerName === col.headerName ? { ...p, maxScore: val } : p));
                                }}
                                className="w-12 bg-white border border-slate-300 rounded px-1 text-center font-bold text-slate-800 text-xs py-0.5"
                              />
                              <span className="text-slate-500 text-[10px]">คะแนน</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>

              {/* Out of Range Min/Max Warning Banner */}
              {outOfRangeStats.count > 0 && (
                <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 text-amber-900">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                    <div>
                      <span className="font-bold text-sm">ตรวจพบคะแนนเกินเกณฑ์ [Min/Max] {outOfRangeStats.count} จุด</span>
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        ระบบตรวจพบคะแนนเกินคะแนนเต็มของกิจกรรม หรือต่ำกว่า 0 จากนักเรียน {outOfRangeStats.studentCount} คน
                      </p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-amber-300 shadow-sm cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={clampOutOfRangeScores}
                      onChange={(e) => setClampOutOfRangeScores(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className="font-bold text-slate-800 text-xs">
                      ปรับคะแนนให้อยู่ในเกณฑ์อัตโนมัติ (Clamp Min/Max)
                    </span>
                  </label>
                </div>
              )}

              {/* Data Rows Preview */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h5 className="text-xs font-bold text-slate-700">
                    ตัวอย่างข้อมูลที่ตรวจพบ (จับคู่ถูกต้อง {matchedCount} จาก {previewRows.length} แถว)
                  </h5>
                  {matchedCount < previewRows.length && (
                    <span className="text-[11px] text-amber-600 font-bold">
                      ⚠️ มีบางแถวที่รหัสหรือเลขที่ไม่ตรงกับห้องนี้
                    </span>
                  )}
                </div>

                <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-56">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-600 sticky top-0">
                      <tr>
                        <th className="p-2.5 font-bold">สถานะจับคู่</th>
                        <th className="p-2.5 font-bold">รหัสในไฟล์</th>
                        <th className="p-2.5 font-bold">เลขที่</th>
                        <th className="p-2.5 font-bold">ชื่อนักเรียนในระบบ</th>
                        {parsedHeaders.filter(c => c.detectedType !== 'info').map((c, i) => (
                          <th key={i} className="p-2.5 font-bold text-center whitespace-nowrap">
                            {c.headerName}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {previewRows.slice(0, 10).map((row, rIdx) => (
                        <tr key={rIdx} className={row.matchedStudent ? 'hover:bg-slate-50' : 'bg-rose-50/50'}>
                          <td className="p-2.5">
                            {row.matchedStudent ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                                <CheckCircle2 className="h-3.5 w-3.5" /> ตรงกัน
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                                <X className="h-3.5 w-3.5" /> ไม่พบในห้องนี้
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-slate-600">{row.rowId || '-'}</td>
                          <td className="p-2.5 text-slate-600">{row.rowNum || '-'}</td>
                          <td className="p-2.5 font-semibold text-slate-800">
                            {row.matchedStudent ? `${row.matchedStudent.firstName} ${row.matchedStudent.lastName}` : (row.rowName || '-')}
                          </td>
                          {parsedHeaders.filter(c => c.detectedType !== 'info').map((c, i) => {
                            const val = row.scoreValues[c.headerName];
                            const isOutOfRange = val !== undefined && val !== null && (val < 0 || val > c.maxScore);
                            return (
                              <td key={i} className={`p-2.5 text-center font-bold ${isOutOfRange ? 'bg-rose-50' : 'text-slate-700'}`}>
                                {val !== undefined ? (
                                  isOutOfRange ? (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-black text-xs border border-rose-300" title={`คะแนนเต็ม ${c.maxScore}`}>
                                      {val} <span className="text-[10px] font-semibold text-rose-600">({val > c.maxScore ? `>${c.maxScore}` : '<0'})</span>
                                    </span>
                                  ) : (
                                    val
                                  )
                                ) : '-'}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {previewRows.length > 10 && (
                  <p className="text-[11px] text-slate-400 mt-1 text-right">
                    ...แสดงตัวอย่าง 10 รายการแรกจากทั้งหมด {previewRows.length} รายการ
                  </p>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            disabled={previewRows.length === 0 || matchedCount === 0 || isSaving || (!clampOutOfRangeScores && outOfRangeStats.count > 0)}
            onClick={handleConfirmImport}
            title={!clampOutOfRangeScores && outOfRangeStats.count > 0 ? "กรุณาเปิดตัวเลือกปรับคะแนนอัตโนมัติ หรือแก้ไขไฟล์ Excel เนื่องจากพบคะแนนเกินเกณฑ์" : ""}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:cursor-not-allowed"
          >
            {isSaving ? 'กำลังบันทึกคะแนน...' : `ยืนยันนำเข้าคะแนน (${matchedCount} คน)`}
          </button>
        </div>

      </div>
    </div>
  );
};
