import React, { useState, useEffect } from 'react';
import { LessonRecord, SUBJECTS, GRADE_LEVELS, SubjectType, Attachment, SEMESTERS } from '../types';
import { Save, RefreshCw, Sparkles, BookCheck, ClipboardList, AlertTriangle, MessageSquareCode, CalendarDays, Paperclip, Link2, FileImage, FileText, Video as VideoIcon, Plus, X, Globe, Eye } from 'lucide-react';
import { AttachmentManager } from './AttachmentManager';

interface LessonLogFormProps {
  initialRecord: LessonRecord | null;
  teacherId: string;
  onSave: (record: LessonRecord) => void;
  onCancel?: () => void;
  systemAcademicYear?: string;
  systemSemester?: string;
}

export function LessonLogForm({ initialRecord, teacherId, onSave, onCancel, systemAcademicYear = '2567', systemSemester = '1' }: LessonLogFormProps) {
  const [subject, setSubject] = useState<SubjectType>('ภาษาไทย');

  const [selectedGrades, setSelectedGrades] = useState<string[]>([GRADE_LEVELS[0]]);
  const defaultSemester = `ภาคเรียนที่ ${systemSemester}/${systemAcademicYear}`;
  const [semester, setSemester] = useState(defaultSemester);
  
  // Default date to today's local date (YYYY-MM-DD)
  const getTodayString = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - (offset * 60 * 1000));
    return localToday.toISOString().split('T')[0];
  };

  const [date, setDate] = useState(getTodayString());
  const [content, setContent] = useState('');
  const [activities, setActivities] = useState('');
  const [limitations, setLimitations] = useState('');
  const [suggestions, setSuggestions] = useState('');

  // Attachment states
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  // Load initial record for editing
  useEffect(() => {
    if (initialRecord) {
      setSubject(initialRecord.subject === 'อื่นๆ' && initialRecord.customSubject ? initialRecord.customSubject : (initialRecord.subject as string));
      
      if (initialRecord.gradeLevel) {
        const levels = initialRecord.gradeLevel.split(',').map(s => s.trim()).filter(Boolean);
        setSelectedGrades(levels.length > 0 ? levels : [GRADE_LEVELS[0]]);
      } else {
        setSelectedGrades([GRADE_LEVELS[0]]);
      }
      
      setSemester(initialRecord.semester || defaultSemester);
      setDate(initialRecord.date);
      setContent(initialRecord.content);
      setActivities(initialRecord.activities);
      setLimitations(initialRecord.limitations);
      setSuggestions(initialRecord.suggestions);
      setAttachments(initialRecord.attachments || []);
    } else {
      resetForm();
    }
  }, [initialRecord, defaultSemester]);

  const resetForm = () => {
    setSubject('ภาษาไทย');
    setSelectedGrades([GRADE_LEVELS[0]]);
    setSemester(defaultSemester);
    setDate(getTodayString());
    setContent('');
    setActivities('');
    setLimitations('');
    setSuggestions('');
    setAttachments([]);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!subject.trim()) {
      setErrorMsg('กรุณาระบุกลุ่มสาระ/วิชาที่สอน');
      return;
    }

    if (selectedGrades.length === 0) {
      setErrorMsg('กรุณาเลือก ระดับชั้น อย่างน้อย 1 ระดับชั้น');
      return;
    }

    if (!content.trim() || !activities.trim() || !limitations.trim() || !suggestions.trim()) {
      setErrorMsg('กรุณากรอกข้อมูลในหัวข้อ เนื้อหา/สาระ, กิจกรรม, ข้อจำกัด และความคิดเห็นของครูผู้สอน ให้ครบถ้วนสมบูรณ์');
      return;
    }

    const payload: LessonRecord = {
      ...(initialRecord || {}),
      id: initialRecord?.id || `rec-${Date.now()}`,
      teacherId,
      subject,
      customSubject: '', // We now save the actual subject directly into the `subject` field
      gradeLevel: selectedGrades.join(', '),
      academicYear: systemAcademicYear,
      semester,
      date,
      content: content.trim(),
      activities: activities.trim(),
      limitations: limitations.trim(),
      suggestions: suggestions.trim(),
      attachments,
      createdAt: initialRecord?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(payload);
    if (!initialRecord) {
      resetForm();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Form Header */}
      <div className="bg-gradient-to-r from-sky-400 via-sky-500 to-pink-400 px-6 py-4 flex justify-between items-center text-white shadow-xs">
        <div>
          <h3 className="font-extrabold text-base flex items-center gap-2">
            <BookCheck className="h-5 w-5 animate-pulse text-white" />
            {initialRecord ? 'แก้ไขบันทึกหลังสอน' : 'เขียนบันทึกหลังสอน'}
          </h3>
          <p className="text-[11px] text-white/95 mt-0.5">กรอกข้อมูลจากการสอนจริงรายคาบ</p>
        </div>
        {initialRecord && onCancel && (
          <button 
            onClick={onCancel}
            className="text-xs font-semibold px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
          >
            ยกเลิกแก้ไข
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {errorMsg && (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-lg text-xs text-rose-700">
            <span className="font-bold">ตรวจสอบข้อมูล:</span> {errorMsg}
          </div>
        )}

        {/* 1. Basic Metadata Grid (subject, semester, date) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              กลุ่มสาระ / วิชาที่สอน
            </label>
            <input
              type="text"
              list="subject-list"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="เลือกหรือพิมพ์รายวิชา..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
            <datalist id="subject-list">
              {SUBJECTS.filter(s => s !== 'อื่นๆ').map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ภาคเรียนพร้อมปีการศึกษา
            </label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-sans"
            >
              {[
                `ภาคเรียนที่ 1/${systemAcademicYear}`,
                `ภาคเรียนที่ 2/${systemAcademicYear}`,
                `ภาคเรียนที่ 1/${parseInt(systemAcademicYear) - 1}`,
                `ภาคเรียนที่ 2/${parseInt(systemAcademicYear) - 1}`,
                `ภาคเรียนที่ 1/${parseInt(systemAcademicYear) - 2}`,
                `ภาคเรียนที่ 2/${parseInt(systemAcademicYear) - 2}`
              ].map((sem) => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
              วันที่สอน
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>
        </div>

        {/* 1.5 Multi-grade level selection grid */}
        <div className="bg-slate-50/40 p-4 rounded-xl border border-slate-100">
          <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
            <span>ระดับชั้นที่เข้าสอน (เลือกได้มากกว่า 1 ระดับชั้น)</span>
            <span className="text-[10.5px] text-blue-600 font-bold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100/50">
              {selectedGrades.length === 0 ? 'ยังไม่ได้เลือก' : `เลือกแล้ว ${selectedGrades.length} ระดับชั้น`}
            </span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {GRADE_LEVELS.map((lvl) => {
              const isSelected = selectedGrades.includes(lvl);
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      setSelectedGrades(prev => prev.filter(g => g !== lvl));
                    } else {
                      setSelectedGrades(prev => [...prev, lvl]);
                    }
                  }}
                  className={`px-4 py-2.5 text-xs sm:text-[13px] font-bold rounded-xl border text-left transition duration-150 flex items-center justify-between gap-2.5 cursor-pointer select-none h-full shadow-2xs ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50/80'
                  }`}
                >
                  <span className="whitespace-normal leading-tight flex-1">{lvl}</span>
                  <span className={`w-4 h-4 rounded-md flex items-center justify-center border text-[10px] shrink-0 font-bold ${
                    isSelected ? 'border-white bg-white text-blue-600' : 'border-slate-300'
                  }`}>
                    {isSelected ? '✓' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-slate-100 my-2"></div>

        {/* 2. Structured Text fields */}
        
        {/* สาระการจัดการเรียนรู้ */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <ClipboardList className="h-4 w-4 text-blue-500" />
            1. เนื้อหา/สาระ
          </label>
          <p className="text-[10px] text-slate-400 mb-1">ระบุเนื้อหาหลักหรือแนวการสอนในคาบนี้</p>
          <textarea
            rows={3}
            placeholder="ระบุรายละเอียดสาระสำคัญหรือขอบเขตเนื้อหาเกณฑ์การสอน..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 leading-relaxed placeholder:text-slate-400"
          ></textarea>
        </div>

        {/* กิจกรรมการเรียนการสอน */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            2. กิจกรรมการเรียนการสอน
          </label>
          <p className="text-[10px] text-slate-400 mb-1">เขียนกิจกรรมที่ทำในห้อง เช่น วิธีการสอน เกม หรือกิจกรรมกลุ่ม</p>
          <textarea
            rows={4}
            placeholder="ระบุกระบวนการและขั้นตอนกิจกรรมการเรียนการสอน..."
            value={activities}
            onChange={(e) => setActivities(e.target.value)}
            className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 leading-relaxed placeholder:text-slate-400 whitespace-pre-line"
          ></textarea>
        </div>

        {/* ข้อจำกัดในการจัดการเรียนการสอน */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-rose-500" />
            3. ข้อจำกัดและปัญหาที่พบ
          </label>
          <p className="text-[10px] text-slate-400 mb-1">ระบุสิ่งที่ติดขัด เช่น อุปกรณ์ไม่พอ ปัญหาเรื่องเสียง หรือเด็กไม่เข้าใจ</p>
          <textarea
            rows={3}
            placeholder="ระบุข้อจำกัดหรือปัญหาอุปสรรคที่พบระหว่างการเรียนการสอน..."
            value={limitations}
            onChange={(e) => setLimitations(e.target.value)}
            className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 leading-relaxed placeholder:text-slate-400"
          ></textarea>
        </div>

        {/* ข้อเสนอแนะ/ความคิดเห็นของผู้สอน */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <MessageSquareCode className="h-4 w-4 text-emerald-500" />
            4. ความคิดเห็นของครูผู้สอน
          </label>
          <p className="text-[10px] text-slate-400 mb-1">ระบุแนวทางการพัฒนาหรือการปรับใช้เพื่อแก้ไขในคาบถัดไป</p>
          <textarea
            rows={3}
            placeholder="ระบุข้อเสนอแนะหรือแนวทางการพัฒนาปรับปรุงเพิ่มเติม..."
            value={suggestions}
            onChange={(e) => setSuggestions(e.target.value)}
            className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 leading-relaxed placeholder:text-slate-400"
          ></textarea>
        </div>

        {/* ๕. แนบไฟล์และลิงก์เว็บไซต์ประกอบ */}
        <AttachmentManager 
          attachments={attachments}
          onAddAttachment={(att) => setAttachments(prev => [...prev, att])}
          onRemoveAttachment={removeAttachment}
        />

        {/* Submission Panel */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 text-xs font-semibold text-slate-500 bg-slate-50 hover:bg-pink-50 hover:text-pink-600 border border-slate-200/80 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {initialRecord ? 'คืนค่า' : 'ล้างฟอร์ม'}
          </button>
          
          <button
            type="submit"
            className="px-6 py-2 text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 active:scale-95 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" />
            {initialRecord ? 'บันทึกข้อมูลแก้ไข' : 'บันทึกข้อมูลเข้าระบบ'}
          </button>
        </div>
      </form>
    </div>
  );
}
