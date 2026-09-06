import React, { useRef, useState } from 'react';
import { Camera, Loader2, User } from 'lucide-react';
import { resizeImageFile } from '../lib/imageUtils';

interface AvatarUploadProps {
  url?: string;
  name: string;
  onUpload: (base64Url: string) => Promise<void>;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
}

export function AvatarUpload({ url, name, onUpload, size = 'md', editable = false }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    xs: 'w-5 h-5 text-[9px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-xl'
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file.type.startsWith("image/")) {
      alert("กรุณาอัปโหลดไฟล์รูปภาพ (JPEG, PNG, WebP) เท่านั้น");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    

    try {
      setIsUploading(true);
      const base64Str = await resizeImageFile(file, 0.2, 400, 400); // Max 200KB, 400x400
      await onUpload(base64Str);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("เกิดข้อผิดพลาด: ไฟล์รูปภาพนี้ไม่สามารถอ่านได้ (อาจเป็นไฟล์ HEIC หรือรูปแบบที่ไม่รองรับ)");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const initials = name ? name.charAt(0) : '?';

  return (
    <div className={`relative inline-block ${editable ? 'cursor-pointer group' : ''}`} onClick={() => editable && !isUploading && fileInputRef.current?.click()}>
      {url ? (
        <img 
          src={url} 
          alt={name} 
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white shadow-sm`}
        />
      ) : (
        <div className={`${sizeClasses[size]} rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border-2 border-white shadow-sm`}>
          <User className="w-1/2 h-1/2" />
        </div>
      )}

      {editable && (
        <div className={`absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${isUploading ? 'opacity-100' : ''}`}>
          {isUploading ? (
            <Loader2 className="w-1/3 h-1/3 text-white animate-spin" />
          ) : (
            <Camera className="w-1/3 h-1/3 text-white" />
          )}
        </div>
      )}

      {editable && (
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/jpeg, image/png, image/webp"
          onChange={handleFileChange}
        />
      )}
    </div>
  );
}
