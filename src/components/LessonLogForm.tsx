import React, { useState, useEffect } from 'react';
import { LessonRecord, SUBJECTS, GRADE_LEVELS, SubjectType, Attachment, SEMESTERS } from '../types';
import { Save, RefreshCw, Sparkles, BookCheck, ClipboardList, AlertTriangle, MessageSquareCode, CalendarDays, Paperclip, Link2, FileImage, FileText, Video as VideoIcon, Plus, X, Globe, Eye } from 'lucide-react';
import { AttachmentManager } from './AttachmentManager';
import { Star } from 'lucide-react';
import { formatThaiDate } from '../lib/dateUtils';

const EVALUATION_CRITERIA = {
  teacher: [
    { id: 't1', label: 'เตรียมการจัดทำแผนการสอนตรงตามตัวชี้วัดและวัตถุประสงค์' },
    { id: 't2', label: 'นำเข้าสู่บทเรียน กระตุ้นความสนใจของเด็กได้น่าสนใจและเชื่อมโยงเข้าสู่เนื้อหาได้ดี' },
    { id: 't3', label: 'จัดกิจกรรมโดยใช้เทคนิคการสอนที่หลากหลายและเหมาะสมกับเนื้อหา' },
    { id: 't4', label: 'ประเมินผลผู้เรียนด้วยวิธีที่หลากหลายและตรงตามสภาพจริง' },
  ],
  learner: [
    { id: 'l1', label: 'การมีส่วนร่วมในกิจกรรม ผู้เรียนมีความกระตือรือร้น' },
    { id: 'l2', label: 'ผู้เรียนมีความเข้าใจเนื้อหาและสามารถตอบคำถามหรือทำใบงานได้' },
    { id: 'l3', label: 'ผู้เรียนมีการทำงานร่วมกัน แลกเปลี่ยนความคิดเห็น' },
    { id: 'l4', label: 'ผู้เรียนปฏิบัติตามข้อตกลงในชั้นเรียนและมีความสุขในการเรียน' },
    { id: 'l5', label: 'ผู้เรียนสามารถสะท้อนความรู้หรือสร้างสรรค์ผลงานจากสิ่งที่เรียนได้' },
  ],
  media: [
    { id: 'm1', label: 'ความเหมาะสมถูกต้อง ปลอดภัย และเหมาะสมกับวัย' },
    { id: 'm2', label: 'สีสัน ขนาด รูปแบบหรือเทคโนโลยีที่กระตุ้นความสนใจ' },
    { id: 'm3', label: 'การจัดวางและใช้อุปกรณ์มีความคล่องตัว ไม่ติดขัดระหว่างสอน' },
    { id: 'm4', label: 'ช่วยให้ผู้เรียนเข้าใจเนื้อหาที่เป็นนามธรรมได้ง่ายขึ้น' },
    { id: 'm5', label: 'ผู้เรียนสามารถมองเห็น เข้าถึง หรือมีโอกาสจับต้องได้ทั่วถึง' },
  ]
};

const DEFAULT_EVALUATIONS = {
  teacher: { t1: 5, t2: 5, t3: 5, t4: 5 },
  learner: { l1: 5, l2: 5, l3: 5, l4: 5, l5: 5 },
  media: { m1: 5, m2: 5, m3: 5, m4: 5, m5: 5 }
};


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
  const [strengths, setStrengths] = useState('');
  const [evaluations, setEvaluations] = useState<{
    teacher: Record<string, number>;
    learner: Record<string, number>;
    media: Record<string, number>;
  }>(DEFAULT_EVALUATIONS);

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
      setStrengths(initialRecord.strengths || '');
      setAttachments(initialRecord.attachments || []);
      if (initialRecord.evaluations) {
        setEvaluations(initialRecord.evaluations);
      } else {
        setEvaluations(DEFAULT_EVALUATIONS);
      }
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
    setStrengths('');
    setEvaluations(DEFAULT_EVALUATIONS);
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

    if (!content.trim() || !activities.trim() || !limitations.trim() || !suggestions.trim() || !strengths.trim()) {
      setErrorMsg('กรุณากรอกข้อมูลให้ครบถ้วนทุกหัวข้อ');
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
      strengths: strengths.trim(),
      evaluations,
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              วันที่สอน
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              title="วันที่สอน"
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
            3. ข้อจำกัดและอุปสรรคที่พบ
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
            4. ข้อเสนอแนะและแนวทางการพัฒนา
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

        {/* จุดเด่นในการสอนครั้งนี้ */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <Star className="h-4 w-4 text-amber-500" />
            5. จุดเด่นในการสอนครั้งนี้
          </label>
          <p className="text-[10px] text-slate-400 mb-1">ระบุจุดเด่นหรือความสำเร็จที่เกิดขึ้นในการสอนคาบนี้</p>
          <textarea
            rows={3}
            placeholder="ระบุจุดเด่นในการสอนครั้งนี้..."
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
            className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 leading-relaxed placeholder:text-slate-400"
          ></textarea>
        </div>

        {/* แบบประเมินการจัดการเรียนรู้ */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            6. แบบประเมินการจัดการเรียนรู้
          </label>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-indigo-50/50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-800">เกณฑ์การประเมิน</span>
              <div className="flex gap-3 text-[10px] font-bold text-indigo-600">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-500"></div>5 = ดีเยี่ยม</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div>4 = ดีมาก</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>3 = ดี</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div>2 = พอใช้</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500"></div>1 = ปรับปรุง</span>
              </div>
            </div>
            
            <div className="divide-y divide-slate-100">
              {/* ด้านผู้สอน */}
              <div className="p-4 bg-slate-50/30">
                <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
                  ด้านผู้สอน
                </h4>
                <div className="space-y-3">
                  {EVALUATION_CRITERIA.teacher.map((item, index) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-slate-100 hover:shadow-sm">
                      <span className="text-[11px] text-slate-700 flex-1 flex gap-2">
                        <span className="text-slate-400 font-medium">{index + 1}.</span> 
                        {item.label}
                      </span>
                      <div className="flex gap-1.5 self-end sm:self-auto">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <button
                            type="button"
                            key={score}
                            onClick={() => setEvaluations(prev => ({ ...prev, teacher: { ...prev.teacher, [item.id]: score } }))}
                            className={`w-8 h-8 flex items-center justify-center rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                              evaluations.teacher[item.id] === score
                                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200 scale-110'
                                : 'bg-slate-50 border border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'
                            }`}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* ด้านผู้เรียน */}
              <div className="p-4 bg-slate-50/30">
                <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
                  ด้านผู้เรียน
                </h4>
                <div className="space-y-3">
                  {EVALUATION_CRITERIA.learner.map((item, index) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-slate-100 hover:shadow-sm">
                      <span className="text-[11px] text-slate-700 flex-1 flex gap-2">
                        <span className="text-slate-400 font-medium">{index + 1}.</span> 
                        {item.label}
                      </span>
                      <div className="flex gap-1.5 self-end sm:self-auto">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <button
                            type="button"
                            key={score}
                            onClick={() => setEvaluations(prev => ({ ...prev, learner: { ...prev.learner, [item.id]: score } }))}
                            className={`w-8 h-8 flex items-center justify-center rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                              evaluations.learner[item.id] === score
                                ? 'bg-blue-500 text-white shadow-md shadow-blue-200 scale-110'
                                : 'bg-slate-50 border border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ด้านสื่อและแหล่งเรียนรู้ */}
              <div className="p-4 bg-slate-50/30">
                <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                  ด้านสื่อและแหล่งเรียนรู้
                </h4>
                <div className="space-y-3">
                  {EVALUATION_CRITERIA.media.map((item, index) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-slate-100 hover:shadow-sm">
                      <span className="text-[11px] text-slate-700 flex-1 flex gap-2">
                        <span className="text-slate-400 font-medium">{index + 1}.</span> 
                        {item.label}
                      </span>
                      <div className="flex gap-1.5 self-end sm:self-auto">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <button
                            type="button"
                            key={score}
                            onClick={() => setEvaluations(prev => ({ ...prev, media: { ...prev.media, [item.id]: score } }))}
                            className={`w-8 h-8 flex items-center justify-center rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                              evaluations.media[item.id] === score
                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200 scale-110'
                                : 'bg-slate-50 border border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 7. แนบไฟล์และลิงก์เว็บไซต์ประกอบ */}
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
