import React, { useState } from 'react';
import { Attachment } from '../types';
import { Paperclip, Plus, Link2, FileImage, Video as VideoIcon, FileText, Trash2, Eye, X } from 'lucide-react';

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
          แนบสื่อการจัดการเรียนการสอน (ลิงก์เว็บ หรือคลาวด์ภายนอก)
        </label>
        <p className="text-[10px] text-slate-400 mt-0.5">
          แนบลิงก์แหล่งการเรียนรู้ แผนการสอนดิจิทัล หรือใบงาน PDF ที่นี่
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!isCompact && (
          <div className="bg-gradient-to-br from-indigo-50/40 to-sky-50/30 p-4 rounded-xl border border-sky-100/60 flex flex-col justify-between space-y-2">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-black text-blue-900 bg-blue-100/70 px-2 py-0.5 rounded-md border border-blue-200">
                💡 คำแนะนำในการเก็บไฟล์รูปภาพ/วิดีโอ/PDF
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600 font-medium">
                เนื่องจากระบบใช้พลังงานประมวลผลบนคลาวด์ร่วมกัน
                เพื่อประสิทธิภาพและความรวดเร็วในการจัดทำเอกสาร
                <span className="text-slate-800 font-bold">
                  {" "}
                  แนะนำให้คุณครูบันทึกไฟล์แผนการสอนฉบับเต็ม PDF หรือสื่อการสอน
                  ไว้ทาง Google Drive ส่วนตัวหรือสถาบันของตนเอง
                </span>
                แล้วคัดลอก "ลิงก์แชร์ที่ทุกคนมีสิทธิ์อ่าน"
                นำมาวางในช่องแชร์ลิงก์ทางด้านขวามือเพื่อความสะดวกรวดเร็วครับ/ค่ะ
              </p>
            </div>
            <div className="pt-2 border-t border-sky-100/80 flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400">
                ตัวอย่าง: https://drive.google.com/drive/...
              </span>
            </div>
          </div>
        )}

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
