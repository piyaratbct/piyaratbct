import React, { useState, useEffect } from 'react';
import { LessonRecord, SUBJECTS, GRADE_LEVELS, SubjectType, Attachment } from '../types';
import { Save, RefreshCw, Sparkles, BookCheck, ClipboardList, AlertTriangle, MessageSquareCode, CalendarDays, Paperclip, Link2, FileImage, FileText, Video as VideoIcon, Plus, X, Globe, Eye } from 'lucide-react';

interface LessonLogFormProps {
  initialRecord: LessonRecord | null;
  teacherId: string;
  onSave: (record: LessonRecord) => void;
  onCancel?: () => void;
}

export function LessonLogForm({ initialRecord, teacherId, onSave, onCancel }: LessonLogFormProps) {
  const [subject, setSubject] = useState<SubjectType>('ภาษาไทย');
  const [customSubject, setCustomSubject] = useState('');
  const [gradeLevel, setGradeLevel] = useState(GRADE_LEVELS[0]);
  
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
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [attachmentType, setAttachmentType] = useState<'image' | 'video' | 'pdf' | 'link'>('link');

  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'pdf') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2000000) {
      alert('ขออภัย จำกัดขนาดไฟล์แนบไม่เกิน 2MB เพื่อหลีกเลี่ยงโควตาหน่วยความจำเบราว์เซอร์เต็ม กรุณาแปลงเป็น "ลิงก์เว็บไซต์/คลาวด์ภายนอก" หากไฟล์มีขนาดเกินนี้ครับ/ค่ะ');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const newAttachment: Attachment = {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type,
        name: file.name,
        url: result
      };
      setAttachments(prev => [...prev, newAttachment]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddLink = () => {
    if (!newLinkUrl.trim()) return;
    let url = newLinkUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    const newAttachment: Attachment = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'link',
      name: newLinkName.trim() || 'ลิงก์เว็บไซต์ประกอบการเรียนสอน',
      url
    };
    setAttachments(prev => [...prev, newAttachment]);
    setNewLinkName('');
    setNewLinkUrl('');
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  // Load initial record for editing
  useEffect(() => {
    if (initialRecord) {
      setSubject(initialRecord.subject as SubjectType);
      setCustomSubject(initialRecord.customSubject || '');
      setGradeLevel(initialRecord.gradeLevel);
      setDate(initialRecord.date);
      setContent(initialRecord.content);
      setActivities(initialRecord.activities);
      setLimitations(initialRecord.limitations);
      setSuggestions(initialRecord.suggestions);
      setAttachments(initialRecord.attachments || []);
    } else {
      resetForm();
    }
  }, [initialRecord]);

  const resetForm = () => {
    setSubject('ภาษาไทย');
    setCustomSubject('');
    setGradeLevel(GRADE_LEVELS[0]);
    setDate(getTodayString());
    setContent('');
    setActivities('');
    setLimitations('');
    setSuggestions('');
    setAttachments([]);
    setNewLinkName('');
    setNewLinkUrl('');
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (subject === 'อื่นๆ' && !customSubject.trim()) {
      setErrorMsg('กรุณากรอกชื่อรายวิชาเพิ่มเติมในช่องระบุรายวิชาอื่น');
      return;
    }

    if (!content.trim() || !activities.trim() || !limitations.trim() || !suggestions.trim()) {
      setErrorMsg('กรุณากรอกข้อมูลในหัวข้อ สาระการจัดการเรียนรู้, กิจกรรม, ข้อจำกัด และข้อเสนอแนะ ให้ครบถ้วนสมบูรณ์');
      return;
    }

    const payload: LessonRecord = {
      id: initialRecord?.id || `rec-${Date.now()}`,
      teacherId,
      subject,
      customSubject: subject === 'อื่นๆ' ? customSubject.trim() : undefined,
      gradeLevel,
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

        {/* 1. Basic Metadata Grid (subject, grade, date) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              กลุ่มสาระ / วิชาที่สอน
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value as SubjectType)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {SUBJECTS.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ระดับชั้น
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {GRADE_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>{lvl}</option>
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

        {/* Conditional Custom Subject Input */}
        {subject === 'อื่นๆ' && (
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
            <label className="block text-xs font-bold text-amber-900 mb-1">
              ระบุวิชาอื่นๆ เพิ่มเติม
            </label>
            <input
              type="text"
              required
              placeholder="เช่น ดนตรี-นาฏศิลป์, สิ่งแวดล้อมน่ารู้, สหกรณ์วัยเรียน"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
            />
          </div>
        )}

        <div className="border-t border-slate-100 my-2"></div>

        {/* 2. Structured Text fields */}
        
        {/* สาระการจัดการเรียนรู้ */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <ClipboardList className="h-4 w-4 text-blue-500" />
            1. สาระการเรียนรู้และจุดประสงค์
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
            4. ข้อเสนอแนะและทางแก้ไข
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
        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/80 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Paperclip className="h-4 w-4 text-blue-600" />
              5. แนบสื่อการสอน (รูป, วิดีโอ, PDF หรือลิงก์)
            </label>
            <p className="text-[10px] text-slate-400 mt-0.5">สามารถเก็บสื่อการสอน สไลด์ หรือลิงก์เสริมตรงนี้ได้เลย</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* File Upload Section */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-150 space-y-2.5">
              <span className="block text-[11px] font-bold text-slate-600">เลือกไฟล์จากเครื่อง</span>
              <div className="grid grid-cols-3 gap-2">
                <label className="flex flex-col items-center justify-center p-2.5 border border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-blue-50/20 hover:border-blue-300 transition group text-center">
                  <FileImage className="h-5 w-5 text-slate-400 group-hover:text-blue-500 mb-1" />
                  <span className="text-[9px] font-medium text-slate-500 font-sans">รูปภาพ</span>
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'image')} className="hidden" />
                </label>

                <label className="flex flex-col items-center justify-center p-2.5 border border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-blue-50/20 hover:border-blue-300 transition group text-center">
                  <VideoIcon className="h-5 w-5 text-slate-400 group-hover:text-blue-500 mb-1" />
                  <span className="text-[9px] font-medium text-slate-500 font-sans">วิดีโอ</span>
                  <input type="file" accept="video/*" onChange={(e) => handleFileChange(e, 'video')} className="hidden" />
                </label>

                <label className="flex flex-col items-center justify-center p-2.5 border border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-blue-50/20 hover:border-blue-300 transition group text-center">
                  <FileText className="h-5 w-5 text-slate-400 group-hover:text-blue-500 mb-1" />
                  <span className="text-[9px] font-medium text-slate-500 font-sans">ไฟล์ PDF</span>
                  <input type="file" accept="application/pdf" onChange={(e) => handleFileChange(e, 'pdf')} className="hidden" />
                </label>
              </div>
              <p className="text-[9px] text-slate-400 italic">ขนาดรูปหรือไฟล์ ไม่เกิน 2MB เพื่อการบันทึกที่รวดเร็ว</p>
            </div>

            {/* URL Link Section */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-150 space-y-2">
              <span className="block text-[11px] font-bold text-slate-600">ใส่ลิงก์เว็บหรือคลาวด์</span>
              <div className="space-y-1.5">
                <input
                  type="text"
                  placeholder="ชื่อลิงก์ (เช่น สไลด์การสอน, ใบงาน)"
                  value={newLinkName}
                  onChange={(e) => setNewLinkName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-[11px] rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                />
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="ลิงก์เว็บไซต์ (https://...)"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-[11px] rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddLink}
                    disabled={!newLinkUrl.trim()}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-bold rounded-lg transition text-[11px] flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>เพิ่มลิงก์</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* List of current attachments */}
          {attachments.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <span className="block text-[10px] font-semibold text-slate-500 mb-1.5">ไฟล์แนบทั้งหมด ({attachments.length}):</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {attachments.map((att) => {
                  let Icon = Link2;
                  let colorClass = 'text-blue-500 bg-blue-50';
                  if (att.type === 'image') { Icon = FileImage; colorClass = 'text-emerald-500 bg-emerald-50'; }
                  else if (att.type === 'video') { Icon = VideoIcon; colorClass = 'text-purple-500 bg-purple-50'; }
                  else if (att.type === 'pdf') { Icon = FileText; colorClass = 'text-rose-500 bg-rose-50'; }

                  return (
                    <div key={att.id} className="flex justify-between items-center p-2 rounded-xl bg-white border border-slate-150 text-[11px]">
                      <div className="flex items-center gap-2 max-w-[85%]">
                        <div className={`p-1.5 rounded-lg ${colorClass}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="truncate">
                          <span className="font-medium text-slate-700 block truncate" title={att.name}>{att.name}</span>
                          <span className="text-[9px] text-slate-400 capitalize block">{att.type}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {att.type === 'image' && att.url.startsWith('data:') && (
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:bg-slate-100 text-blue-500 hover:text-blue-700 rounded-lg transition"
                            title="ดูรูปภาพเต็ม"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => removeAttachment(att.id)}
                          className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

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
