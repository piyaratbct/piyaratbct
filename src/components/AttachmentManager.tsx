import React, { useState } from 'react';
import { Attachment } from '../types';
import { Paperclip, Plus, Link2, FileImage, Video as VideoIcon, FileText, Trash2, Eye, X, Upload } from 'lucide-react';

interface AttachmentManagerProps {
  attachments: Attachment[];
  onAddAttachment: (attachment: Attachment) => void;
  onRemoveAttachment: (id: string) => void;
  isCompact?: boolean;
}

export const AttachmentManager: React.FC<AttachmentManagerProps> = ({
  attachments,
  onAddAttachment,
  onRemoveAttachment,
  isCompact = false
}) => {
  const [newLinkName, setNewLinkName] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      alert('เพื่อประหยัดพื้นที่คลาวด์ กรุณาอัปโหลดรูปภาพที่มีขนาดไม่เกิน 1.5MB ค่ะ');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const newAttachment: Attachment = {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: "image",
        name: file.name,
        url: result,
      };
      onAddAttachment(newAttachment);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddLink = () => {
    if (!newLinkUrl.trim()) return;
    let url = newLinkUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    const newAttachment: Attachment = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: "link",
      name: newLinkName.trim() || "สื่อการสอน / แหล่งเรียนรู้",
      url,
    };
    onAddAttachment(newAttachment);
    setNewLinkName("");
    setNewLinkUrl("");
  };

  return (
    <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100/80 space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Paperclip className="h-4 w-4 text-blue-600" />
          แนบสื่อการสอน และรูปภาพหลักฐานการสอน (SAR)
        </label>
        <p className="text-[10px] text-slate-400 mt-0.5">
          แนบลิงก์แผนการสอน รูปภาพกิจกรรม หรือใบงาน เพื่อเป็นหลักฐานสำหรับการประเมิน SAR
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Upload Image Section */}
        <div className="bg-white p-4 rounded-xl border border-slate-150 flex flex-col justify-center space-y-3">
          <span className="block text-[11px] font-bold text-slate-700 flex items-center gap-1">
            <FileImage className="h-4 w-4 text-emerald-500" />
            อัปโหลดรูปภาพหลักฐาน (จากเครื่อง)
          </span>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            อัปโหลดรูปภาพกิจกรรมการเรียนการสอน ผลงานนักเรียน หรือสื่อการสอน (ขนาดไม่เกิน 1.5MB)
          </p>
          <div className="mt-2">
            <label className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-emerald-50 text-emerald-700 border-2 border-dashed border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-colors rounded-lg cursor-pointer">
              <Upload className="h-4 w-4" />
              <span className="text-[11px] font-bold">เลือกรูปภาพเพื่ออัปโหลด</span>
              <input 
                type="file" 
                accept="image/jpeg, image/png, image/webp"
                className="hidden" 
                onChange={handleImageUpload} 
              />
            </label>
          </div>
        </div>
        
        {/* Link Attachment Section */}
        <div className={`bg-white p-4 rounded-xl border border-slate-150 flex flex-col justify-center space-y-3 ${isCompact ? 'md:col-span-2' : ''}`}>
          <span className="block text-[11px] font-bold text-slate-700">
            ใส่ลิงก์แหล่งข้อมูลเสริม
          </span>
          <div className="space-y-2.5">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500">
                1. ชื่อเรียกลิงก์ / คำอธิบายสื่อ
              </span>
              <input
                type="text"
                placeholder="เช่น สไลด์วิชา AI, แผนการสอนฉบับเต็ม PDF"
                value={newLinkName}
                onChange={(e) => setNewLinkName(e.target.value)}
                className="w-full px-2.5 py-1.5 text-[11px] rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white placeholder:text-slate-400 text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500">
                2. ที่อยู่ลิงก์เว็บ (URL)
              </span>
              <div className="flex gap-1.5">
                <input
                  type="url"
                  placeholder="https://drive.google.com/... หรือแชร์ลิงก์อื่นๆ"
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 text-[11px] rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white placeholder:text-slate-400 text-slate-800 font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddLink}
                  disabled={!newLinkUrl.trim()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-bold rounded-lg transition text-[11px] flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>เพิ่มลิงก์</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {attachments.length > 0 && (
        <div className="pt-2 border-t border-slate-100">
          <span className="block text-[10px] font-semibold text-slate-500 mb-1.5">
            ไฟล์แนบทั้งหมด ({attachments.length}):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {attachments.map((att) => {
              let Icon = Link2;
              let colorClass = "text-blue-500 bg-blue-50";
              if (att.type === "image") {
                Icon = FileImage;
                colorClass = "text-emerald-500 bg-emerald-50";
              } else if (att.type === "video") {
                Icon = VideoIcon;
                colorClass = "text-purple-500 bg-purple-50";
              } else if (att.type === "pdf") {
                Icon = FileText;
                colorClass = "text-rose-500 bg-rose-50";
              }

              return (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-2 rounded-xl border border-slate-200 bg-white shadow-xs group"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${colorClass}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 pr-2">
                      <p className="text-[11px] font-bold text-slate-700 truncate" title={att.name}>
                        {att.name}
                      </p>
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] text-blue-500 hover:underline truncate block"
                      >
                        {att.url}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {att.type === 'image' && att.url.startsWith('data:') && (
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-slate-100 text-blue-500 hover:text-blue-700 rounded-lg transition md:opacity-0 group-hover:opacity-100"
                        title="ดูรูปภาพเต็ม"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => onRemoveAttachment(att.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors md:opacity-0 group-hover:opacity-100"
                      title="ลบสื่อนี้"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
