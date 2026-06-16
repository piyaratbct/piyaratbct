import React, { useState, useEffect } from 'react';
import { Teacher, LessonRecord, SUBJECTS } from './types';
import { MOCK_RECORDS, DEFAULT_TEACHER } from './data';
import { AuthView } from './components/AuthView';
import { DashboardStats } from './components/DashboardStats';
import { LessonLogForm } from './components/LessonLogForm';
import { LessonLogList } from './components/LessonLogList';
import { PrintTemplate, SchoolLogo } from './components/PrintTemplate';
import { 
  BookOpen, LogOut, User, Award, Phone, Building, 
  Settings, HelpCircle, CheckCircle, ChevronDown, 
  CalendarDays, Download, FileJson, FileSpreadsheet, School, PlusCircle,
  Lock, Unlock, KeyRound, ShieldCheck, Eye, EyeOff, ShieldAlert,
  Camera, Upload, RotateCcw, Loader2, Bell, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, doc, getDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

export default function App() {
  // Toast notifications state
  interface ToastItem {
    id: string;
    title: string;
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
  }
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success', title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const defaultTitles = {
      success: '🎉 สำเร็จ',
      info: 'ℹ️ แจ้งเตือน',
      warning: '⚠️ ข้อควรระวัง',
      error: '❌ เกิดข้อผิดพลาด'
    };
    const toastTitle = title || defaultTitles[type];
    const newToast: ToastItem = { id, title: toastTitle, message, type };
    setToasts((prev) => [...prev, newToast]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [records, setRecords] = useState<LessonRecord[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [activeTab, setActiveTab] = useState<'form' | 'dashboard' | 'admin-users'>('form');
  const [selectedDashboardTeacherId, setSelectedDashboardTeacherId] = useState<string>('all');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');

  // Custom School Logo States & Camera Capture
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  // Dashboard Lock Passcode States
  const [isDashboardUnlocked, setIsDashboardUnlocked] = useState(false);
  const [dashboardPasswordInput, setDashboardPasswordInput] = useState('');
  const [dashboardPasswordError, setDashboardPasswordError] = useState('');
  const [sysDashboardPassword, setSysDashboardPassword] = useState('admin123');
  const [showPasswordChangeField, setShowPasswordChangeField] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [showPassRaw, setShowPassRaw] = useState(false);

  // Editing and preview modals/states
  const [editingRecord, setEditingRecord] = useState<LessonRecord | null>(null);
  const [activePrintPreview, setActivePrintPreview] = useState<LessonRecord | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showFormOnMobile, setShowFormOnMobile] = useState(false);

  // Edit Teacher profile temporary states
  const [pThaiName, setPThaiName] = useState('');
  const [pEnglishName, setPEnglishName] = useState('');
  const [pEmployeeId, setPEmployeeId] = useState('');
  const [pPhoneNumber, setPPhoneNumber] = useState('');
  const [pAffiliation, setPAffiliation] = useState('');
  const [pDisplayName, setPDisplayName] = useState('');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // 1. Firebase Authentication state change listener
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const profileRef = doc(db, 'teachers', user.uid);
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists()) {
            const t = profileSnap.data() as Teacher;
            setCurrentTeacher(t);
            initProfileStates(t);
          } else {
            const fallback: Teacher = {
              id: user.uid,
              email: user.email || '',
              thaiName: 'คุณครูผู้เขียน',
              englishName: 'Teacher Profile',
              employeeId: 'ED-' + user.uid.substring(0, 5).toUpperCase(),
              phoneNumber: 'N/A',
              affiliation: 'กลุ่มสาระการเรียนรู้',
              displayName: user.displayName || user.email?.split('@')[0] || 'Teacher',
              role: 'teacher'
            };
            // Do not write to Firestore here to prevent race conditions during registration & demo account setup
            setCurrentTeacher(fallback);
            initProfileStates(fallback);
          }
        } catch (err) {
          console.error("Error setting up active teacher session:", err);
        }
      } else {
        setCurrentTeacher(null);
      }
      setAuthLoading(false);
    });

    // Load custom logo
    const savedLogo = localStorage.getItem('lessonlog_custom_logo');
    if (savedLogo) {
      setCustomLogo(savedLogo);
    }

    // Load sys dashboard password
    const savedPassword = localStorage.getItem('lessonlog_sys_dashboard_password');
    if (savedPassword) {
      setSysDashboardPassword(savedPassword);
    }

    return () => {
      unsubAuth();
    };
  }, []);

  // 2. Real-time dynamic Firestore listeners for Records and Teacher catalogues
  useEffect(() => {
    if (!currentTeacher) return;

    // Clean active states when profile switches
    setRecords([]);

    // Set records query based on Role-Based Access Control list constraints
    let recordsQuery;
    if (currentTeacher.role !== 'teacher') {
      recordsQuery = collection(db, 'records');
    } else {
      recordsQuery = query(collection(db, 'records'), where('teacherId', '==', currentTeacher.id));
    }

    const unsubRecords = onSnapshot(recordsQuery, async (snapshot) => {
      const fetchedRecords: LessonRecord[] = [];
      snapshot.forEach((doc) => {
        fetchedRecords.push(doc.data() as LessonRecord);
      });

      // Sort chronological descending
      fetchedRecords.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

      // Auto-seeding for new teachers (highly polished out-of-the-box system demo)
      if (fetchedRecords.length === 0 && currentTeacher.role === 'teacher' && !currentTeacher.hasSeeded) {
        const updatedTeacher = { ...currentTeacher, hasSeeded: true };
        setCurrentTeacher(updatedTeacher);
        setDoc(doc(db, 'teachers', currentTeacher.id), updatedTeacher).catch(console.error);

        const seedPayloads = MOCK_RECORDS.map((r, index) => ({
          ...r,
          id: `rec-${currentTeacher.id}-${index}`,
          teacherId: currentTeacher.id,
          createdAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString()
        }));

        for (const payload of seedPayloads) {
          setDoc(doc(db, 'records', payload.id), payload).catch(console.error);
        }
      } else {
        setRecords((prevRecords) => {
          if (prevRecords && prevRecords.length > 0) {
            fetchedRecords.forEach((newRec) => {
              const oldRec = prevRecords.find((r) => r.id === newRec.id);
              if (oldRec) {
                const oldApproved = !!oldRec.deptHeadApproved;
                const newApproved = !!newRec.deptHeadApproved;

                if (!oldApproved && newApproved) {
                  addToast(
                    `เอกสารการสอนชั้น ${newRec.gradeLevel} "${newRec.subject}" ได้รับการลงนามตรวจอนุมัติโดยหัวหน้าฝ่ายวิชาการเรียบร้อยแล้ว 🌸`,
                    'success',
                    '✍️ ตรวจอนุมัติเอกสารสำเร็จ'
                  );
                } else if (oldApproved && !newApproved) {
                  addToast(
                    `เอกสารการสอนชั้น ${newRec.gradeLevel} "${newRec.subject}" ถูกยกเลิกขั้นตอนลงนามรับรองกรุณาตรวจสอบ ⚠️`,
                    'warning',
                    'ยกเลิกการตรวจรับรอง'
                  );
                } else if (!oldRec.teacherSigned && newRec.teacherSigned) {
                  addToast(
                    `คุณครูผู้บันทึกได้กดลงลายมือชื่อในเอกสาร "${newRec.subject}" เรียบร้อยแล้ว ✍️`,
                    'info',
                    'คุณครูลงนามส่งแผน'
                  );
                }
              } else {
                // New record added by someone else
                if (newRec.teacherId !== currentTeacher.id) {
                  addToast(
                    `มีบันทึกหลังสอนใหม่เข้ามา: วิชา "${newRec.subject}" ชั้น ${newRec.gradeLevel} 📝`,
                    'info',
                    'พบบันทึกการสอนใหม่'
                  );
                }
              }
            });
          }
          return fetchedRecords;
        });
        if (fetchedRecords.length > 0 && currentTeacher.role === 'teacher' && !currentTeacher.hasSeeded) {
          const updatedTeacher = { ...currentTeacher, hasSeeded: true };
          setCurrentTeacher(updatedTeacher);
          setDoc(doc(db, 'teachers', currentTeacher.id), updatedTeacher).catch(console.error);
        }
      }
    }, (err) => {
      console.error("Records snapshot failed:", err);
    });

    // Subscription for all academic profiles lookup
    const unsubTeachers = onSnapshot(collection(db, 'teachers'), (snapshot) => {
      const fetchedTeachers: Teacher[] = [];
      snapshot.forEach((doc) => {
        fetchedTeachers.push(doc.data() as Teacher);
      });
      if (!fetchedTeachers.some(t => t.id === DEFAULT_TEACHER.id)) {
        fetchedTeachers.push(DEFAULT_TEACHER);
      }
      setTeachers(fetchedTeachers);
    }, (err) => {
      console.error("Teachers catalog lookup error:", err);
    });

    return () => {
      unsubRecords();
      unsubTeachers();
    };
  }, [currentTeacher]);

  const initProfileStates = (t: Teacher) => {
    setPThaiName(t.thaiName || '');
    setPEnglishName(t.englishName || '');
    setPEmployeeId(t.employeeId || '');
    setPPhoneNumber(t.phoneNumber || '');
    setPAffiliation(t.affiliation || '');
    setPDisplayName(t.displayName || '');
  };


  // Camera Capture Control Effect
  useEffect(() => {
    if (isCameraActive) {
      let activeStream: MediaStream | null = null;
      navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 480 }, height: { ideal: 480 } },
        audio: false
      }).then(stream => {
        activeStream = stream;
        setCameraStream(stream);
        setCameraError(null);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }).catch(err => {
        console.error("Camera capture error:", err);
        setCameraError("ไม่สามารถเปิดใช้งานกล้องได้กรุณาตรวจสอบสิทธิ์การใช้งานกล้องในเบราว์เซอร์");
      });

      return () => {
        if (activeStream) {
          activeStream.getTracks().forEach(track => track.stop());
        }
      };
    }
  }, [isCameraActive]);

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const size = Math.min(video.videoWidth || 480, video.videoHeight || 480);
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Crop center to square
        const sx = (video.videoWidth - size) / 2;
        const sy = (video.videoHeight - size) / 2;
        ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/png');
        setCustomLogo(dataUrl);
        localStorage.setItem('lessonlog_custom_logo', dataUrl);
      }
      stopCamera();
    } catch (err) {
      console.error("Failed to capture image from camera:", err);
      setCameraError("ไม่สามารถจับภาพได้กรุณาทดลองบันทึกใหม่อีกครั้ง");
    }
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const base64String = event.target.result as string;
        setCustomLogo(base64String);
        localStorage.setItem('lessonlog_custom_logo', base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearCustomLogo = () => {
    setCustomLogo(null);
    localStorage.removeItem('lessonlog_custom_logo');
  };

  const handleLogin = (teacher: Teacher) => {
    setCurrentTeacher(teacher);
    initProfileStates(teacher);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentTeacher(null);
      setRecords([]);
      setEditingRecord(null);
      setActivePrintPreview(null);
      setShowProfileModal(false);
      setIsDashboardUnlocked(false);
    } catch (err) {
      console.error("Sign out fail:", err);
    }
  };

  // Dashboard security handlers
  const handleUnlockDashboard = (e: React.FormEvent) => {
    e.preventDefault();
    if (dashboardPasswordInput.trim() === sysDashboardPassword) {
      setIsDashboardUnlocked(true);
      setDashboardPasswordError('');
      setDashboardPasswordInput('');
    } else {
      setDashboardPasswordError('❌ รหัสผ่านคลังระบบไม่ถูกต้อง กรุณาติดต่อฝ่ายวิชาการ/ฝ่ายบริหาร หรือลองใหม่อีกครั้ง');
    }
  };

  const handleLockDashboard = () => {
    setIsDashboardUnlocked(false);
    setDashboardPasswordInput('');
    setDashboardPasswordError('');
  };

  const handleChangeSysDashboardPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasswordInput.trim()) {
      alert('กรุณาระบุรหัสผ่านใหม่');
      return;
    }
    setSysDashboardPassword(newPasswordInput.trim());
    localStorage.setItem('lessonlog_sys_dashboard_password', newPasswordInput.trim());
    setNewPasswordInput('');
    setShowPasswordChangeField(false);
    alert('🔒 บันทึกรหัสผ่านควบคุมความปลอดภัยตัวใหม่สำหรับเข้าคลังเรียบร้อยแล้ว!');
  };

  // Profile Save Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeacher) return;

    if (!pThaiName || !pEnglishName || !pEmployeeId || !pPhoneNumber || !pAffiliation || !pDisplayName) {
      alert('กรุณากรอกข้อมูลโปรไฟล์ของคุณครูให้ครบทุกช่อง');
      return;
    }

    try {
      const updatedTeacher: Teacher = {
        ...currentTeacher,
        thaiName: pThaiName,
        englishName: pEnglishName,
        employeeId: pEmployeeId,
        phoneNumber: pPhoneNumber,
        affiliation: pAffiliation,
        displayName: pDisplayName
      };

      await setDoc(doc(db, 'teachers', currentTeacher.id), updatedTeacher);
      setCurrentTeacher(updatedTeacher);
      addToast('แก้ไขและอัปเดตข้อมูลโปรไฟล์ผู้ใช้งานสำเร็จแล้ว 💼', 'success', 'อัปเดตโปรไฟล์');

      setProfileSuccessMsg('อัปเดตข้อมูลคุณครูเรียบร้อยแล้ว ในระบบคลาวด์/Firestore!');
      setTimeout(() => {
        setProfileSuccessMsg('');
        setShowProfileModal(false);
      }, 1500);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `teachers/${currentTeacher.id}`);
    }
  };

  // Create or Update Record
  const handleSaveRecord = async (record: LessonRecord) => {
    try {
      const isEdit = records.some(r => r.id === record.id);
      const existing = records.find(r => r.id === record.id);
      
      if (isEdit && existing && currentTeacher) {
        const isOwner = existing.teacherId === currentTeacher.id;
        const isAdmin = currentTeacher.role === 'admin';
        if (!isAdmin && !isOwner) {
          alert('🔒 ขออภัย! เฉพาะผู้ดูแลระบบ (System Administrator) หรือคุณครูที่เป็นเจ้าของเอกสารเท่านั้นที่มีสิทธิ์แก้ไขบันทึกนี้ได้');
          return;
        }
      }

      if (existing && existing.deptHeadApproved) {
        alert('🔒 ขออภัย! เอกสารนี้ได้รับการลงนามอนุมัติและล็อกระบบแล้ว ไม่สามารถแก้ไขได้');
        return;
      }

      let updatedHistory = record.editHistory || [];
      let lastEditedBy = record.lastEditedBy;
      let lastEditedAt = record.lastEditedAt;

      if (isEdit) {
        const roleMap: any = {
          teacher: 'คุณครูผู้สอน',
          academic: 'หัวหน้าฝ่ายวิชาการ',
          deputy: 'รองผู้อำนวยการ',
          admin: 'ผู้ดูแลระบบ'
        };
        const currentRoleStr = currentTeacher ? (roleMap[currentTeacher.role || ''] || 'ผู้ใช้งาน') : 'ผู้ใช้งาน';
        const editorNameStr = currentTeacher 
          ? `${currentTeacher.thaiName || currentTeacher.displayName} (${currentRoleStr})` 
          : 'ผู้ใช้งานระบบ';
        
        lastEditedBy = editorNameStr;
        lastEditedAt = new Date().toISOString();
        
        updatedHistory = [
          ...updatedHistory,
          {
            editedBy: editorNameStr,
            editedAt: lastEditedAt
          }
        ];
      }

      const payload = {
        ...record,
        updatedAt: new Date().toISOString(),
        ...(isEdit ? { lastEditedBy, lastEditedAt, editHistory: updatedHistory } : {})
      };
      await setDoc(doc(db, 'records', record.id), payload);
      setEditingRecord(null);
      setShowFormOnMobile(false);
      addToast(
        isEdit 
          ? `แก้ไขและอัปเดตบันทึกผลหลังสอนรายวิชา "${record.subject}" เรียบร้อยแล้ว ✨` 
          : `สร้างและส่งบันทึกผลหลังสอนรายวิชา "${record.subject}" สำเร็จ จัดเก็บเข้าคลาวด์แล้ว 🎉`,
        'success',
        isEdit ? 'อัปเดตข้อมูลสำเร็จ' : 'บันทึกการสอนสำเร็จ'
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `records/${record.id}`);
    }
  };

  // Delete Record
  const handleDeleteRecord = async (id: string) => {
    if (!currentTeacher) return;

    try {
      const existing = records.find(r => r.id === id);
      if (!existing) return;

      const isOwner = existing.teacherId === currentTeacher.id;
      const isAdmin = currentTeacher.role === 'admin';

      if (!isAdmin && !isOwner) {
        alert('🔒 ขออภัย! เฉพาะผู้ดูแลระบบ (System Administrator) หรือคุณครูที่เป็นเจ้าของเอกสารเท่านั้นที่มีสิทธิ์ลบประวัตินี้ได้');
        return;
      }

      if (existing.deptHeadApproved) {
        alert('🔒 ขออภัย! เอกสารนี้ได้รับการลงนามอนุมัติและล็อกระบบแล้ว ไม่สามารถแก้ไขหรือลบได้');
        return;
      }

      await deleteDoc(doc(db, 'records', id));
      if (editingRecord?.id === id) {
        setEditingRecord(null);
      }
      addToast('ลบบันทึกหลังสอนรายวิชาออกจากระบบคลาวด์เสร็จสิ้น 🗑️', 'info', 'ลบเอกสารสำเร็จ');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `records/${id}`);
    }
  };

  // Delete Teacher (Admin Only)
  const handleDeleteTeacher = async (teacherId: string) => {
    if (!currentTeacher) return;
    if (currentTeacher.role !== 'admin') {
      alert('🔒 เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถลบบัญชีผู้ใช้ได้');
      return;
    }

    if (teacherId === currentTeacher.id) {
      alert('❌ คุณไม่สามารถลบบัญชีของคุณเองได้ในหน้าต่างการใช้งานปัจจุบัน');
      return;
    }

    const teacherObj = teachers.find(t => t.id === teacherId);
    if (!teacherObj) return;

    if (teacherId === 't-default-1') {
      alert('❌ บัญชีผู้ใช้นี้เป็นผู้ใช้งานจำลองหลักเริ่มต้นของวิชาการ ไม่ฝังตัวให้ลบเด็ดขาด');
      return;
    }

    const teacherRecords = records.filter(r => r.teacherId === teacherId);
    const hasApprovedRecords = teacherRecords.some(r => r.deptHeadApproved);

    const confirmationMsg = `⚠️ คุณต้องการลบบัญชีคุณครู "${teacherObj.displayName || teacherObj.thaiName}" ใช่หรือไม่?\n\n` +
      `การลบบัญชีนี้จะส่งผลให้ บันทึกหลังเรียนทั้งหมดของคุณครูจำนวน ${teacherRecords.length} รายการ ถูกลบออกจากระบบคลาวด์/Firestore อย่างถาวรเพื่อป้องกันข้อมูลค้างคา\n` +
      `${hasApprovedRecords ? '🚨 โปรดระวัง: คุณครูท่านนี้มีบางรายการที่ได้รับการอนุมัติและลงนามแล้ว!' : ''}\n\n` +
      `ยืนยันการลบอย่างไม่มีเงื่อนไขและไม่สามารถกู้คืนได้?`;

    if (!window.confirm(confirmationMsg)) {
      return;
    }

    try {
      // 1. Delete associated records
      for (const rec of teacherRecords) {
        await deleteDoc(doc(db, 'records', rec.id));
      }
      // 2. Delete teacher doc
      await deleteDoc(doc(db, 'teachers', teacherId));
      
      alert(`🗑️ ลบบัญชีผู้ใช้งาน "${teacherObj.displayName || teacherObj.thaiName}" และบันทึกสอนที่เกี่ยวข้องทั้งหมดเรียบร้อยแล้ว`);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `teachers/${teacherId}`);
    }
  };

  // Export records JSON backup
  const handleExportBackup = () => {
    const backupStr = JSON.stringify(records, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(backupStr);
    const exportFileDefaultName = `LessonLog_Backup_${new Date().toISOString().slice(0,10)}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Export records as CSV for MS Excel / Google Sheets (UTF-8 BOM supported)
  const handleExportCSV = () => {
    // CSV headers
    const headers = [
      'ลำดับ',
      'วันที่สอน_บันทึก',
      'ระดับชั้น',
      'วิชา',
      'สาระการจัดกิจกรรมการเรียนรู้',
      'กิจกรรมการสอน_กระบวนการ',
      'ข้อจำกัด_ปัญหาการสอน',
      'ข้อเสนอแนะ_แนวทางแก้ไข',
      'ครูผู้สอนต้องการลงนาม',
      'หัวหน้าวิชาการอนุมัติ',
      'ชื่อหัวหน้าผู้อนุมัติ',
      'วันที่หัวหน้าอนุมัติ'
    ];

    const rows = records.map((rec, index) => {
      const escape = (val: string | undefined | null) => {
        if (!val) return '""';
        return `"${val.replace(/"/g, '""')}"`;
      };

      const subj = rec.customSubject ? `${rec.subject} (${rec.customSubject})` : rec.subject;
      
      return [
        index + 1,
        rec.date,
        escape(rec.gradeLevel),
        escape(subj),
        escape(rec.content),
        escape(rec.activities),
        escape(rec.limitations),
        escape(rec.suggestions),
        rec.teacherSigned ? 'ลงนามแล้ว' : 'ยังไม่ได้ลงนาม',
        rec.deptHeadApproved ? 'อนุมัติแล้ว' : 'ยังไม่อนุมัติ',
        escape(rec.deptHeadName || ''),
        rec.deptHeadDate ? rec.deptHeadDate : ''
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    // Using BOM to prevent Thai characters encoding issue in Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const exportFileDefaultName = `LessonLog_Export_${new Date().toISOString().slice(0,10)}.csv`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', url);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    // Clean up
    URL.revokeObjectURL(url);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">กำลังเชื่อมต่อฐานข้อมูลความปลอดภัยครู...</p>
        </div>
      </div>
    );
  }

  if (!currentTeacher) {
    return <AuthView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-pink-50/40 via-white to-sky-50/40 flex flex-col font-sans mb-12">
      
      {/* Dynamic Theme Color Top Border */}
      <div className="h-1.5 w-full bg-gradient-to-r from-sky-400 via-white to-pink-400 print:hidden" />
      
      {/* 1. Header Layout */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-100/60 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* App Branding */}
            <div className="flex items-center space-x-3">
              <div className="h-11 w-11 bg-white rounded-xl flex items-center justify-center border border-sky-200/80 overflow-hidden shadow-xs hover:scale-105 hover:border-pink-300 transition shrink-0">
                {customLogo ? (
                  <img src={customLogo} alt="School Custom Logo" className="h-full w-full object-cover" />
                ) : (
                  <SchoolLogo className="h-9 w-9 text-sky-500" />
                )}
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black text-slate-800 tracking-tight font-sans">LessonLog</span>
                  <span className="text-[8px] bg-pink-50 text-pink-600 px-1 py-0.5 rounded font-black border border-pink-100 font-mono scale-90">SMBS</span>
                </div>
                <span className="hidden sm:inline-block text-[10px] font-bold text-slate-400">
                  โรงเรียนศิริมงคลศึกษา บางบัวทอง
                </span>
                <span className="sm:hidden text-[9px] font-bold text-slate-400 block">
                  ศิริมงคลศึกษา บางบัวทอง
                </span>
              </div>
            </div>

            {/* Profile Dropdown / Actions */}
            <div className="flex items-center space-x-3">
              {/* User badge */}
              <button 
                onClick={() => setShowProfileModal(true)}
                className="flex items-center space-x-2.5 px-3 py-1.5 hover:bg-sky-50/50 active:bg-sky-100 rounded-xl border border-sky-100 transition text-left cursor-pointer"
              >
                <div className="h-7 w-7 bg-sky-50 text-sky-600 border border-sky-150 rounded-lg flex items-center justify-center text-xs font-bold font-mono">
                  {currentTeacher.displayName.charAt(0)}
                </div>
                <div className="hidden md:block">
                  <span className="block text-xs font-bold text-slate-800 leading-none">{currentTeacher.displayName}</span>
                  <span className="block text-[10px] text-slate-400 font-medium mt-0.5">{currentTeacher.employeeId}</span>
                </div>
                <ChevronDown className="h-3 w-3 text-slate-400 hidden sm:block" />
              </button>

              {/* Settings profile button */}
              <button
                onClick={() => setShowProfileModal(true)}
                className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition sm:block hidden"
                title="ตั้งค่าข้อมูลคุณครู"
              >
                <Settings className="h-4.5 w-4.5" />
              </button>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="p-2 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold"
                title="ออกจากระบบ"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">ออกจากระบบ</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* 2. Main Page Layout Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex-1 space-y-6 print:m-0 print:p-0">
        
        {/* Welcome Card & Info */}
        <div className="bg-gradient-to-r from-sky-50/60 via-white to-pink-50/60 rounded-2xl border-l-4 border-l-sky-450 border-y border-r border-sky-100/50 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xs print:hidden">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-sky-500/10 to-pink-500/10 border border-sky-200/55 rounded-full text-slate-700 shadow-3xs">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
              <span className="text-sm sm:text-base font-black tracking-wide text-indigo-950 font-sans">
                LessonLog - ระบบบันทึกผลการจัดการเรียนรู้
              </span>
            </div>
            <h2 className="text-xs sm:text-sm font-extrabold text-slate-750 flex items-center gap-2">
              <span className="animate-wiggle text-sm">👋</span> สวัสดีครับ/ค่ะ, {currentTeacher.displayName}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 font-semibold">
              ยินดีต้อนรับสู่ระบบบันทึกผลการสอน สังกัดของคุณครูคือ <b className="text-sky-700">{currentTeacher.affiliation}</b>
            </p>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            {/* Backup JSON */}
            <button
              onClick={handleExportBackup}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-pink-50 hover:text-pink-600 border border-slate-200 rounded-xl transition"
              title="ส่งออกฐานข้อมูลครูสำรองเครื่องเป็นไฟล์ JSON"
            >
              <FileJson className="h-3.5 w-3.5" />
              <span>สำรองข้อมูล (JSON)</span>
            </button>

            {/* Export CSV for Excel */}
            <button
              onClick={handleExportCSV}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-emerald-50 hover:text-emerald-600 border border-slate-200 rounded-xl transition"
              title="ส่งออกบันทึกการสอนเป็นไฟล์ CSV สำหรับเปิดใช้จริงใน Excel และ Google Sheets"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>นำไปใช้ใน Excel / Sheets (CSV)</span>
            </button>

            {/* Print/Add mobile float trigger */}
            <button
              onClick={() => {
                setEditingRecord(null);
                setShowFormOnMobile(!showFormOnMobile);
              }}
              className="flex-1 md:flex-none md:hidden flex items-center justify-center gap-1 bg-gradient-to-r from-sky-500 to-pink-500 text-white px-3 py-2 text-xs font-bold rounded-xl active:scale-95 transition"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>{showFormOnMobile ? 'ปิดฟอร์ม' : 'เขียนบันทึกใหม่'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs (แยกหน้าต่างระหว่าง การเขียนบันทึก และ แดชบอร์ดภาพรวมสถิติครู) */}
        <div className="flex border-b border-sky-100 print:hidden overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('form');
              // Auto reset filters
              setSelectedDashboardTeacherId('all');
            }}
            className={`flex items-center gap-2 px-6 py-3 text-xs font-black transition-all border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'form'
                ? 'border-sky-500 text-sky-600 bg-sky-50/40'
                : 'border-transparent text-slate-500 hover:text-sky-600 hover:bg-sky-50/10'
            }`}
          >
            <PlusCircle className="h-4 w-4 text-sky-500" />
            1. ห้องบันทึกหลังสอนรายวัน (Lesson Log)
          </button>
          
          {currentTeacher.role !== 'teacher' && (
            <button
              onClick={() => {
                setActiveTab('dashboard');
                // Default to seeing current logged in teacher's stats or all
                setSelectedDashboardTeacherId('all');
              }}
              className={`flex items-center gap-2 px-6 py-3 text-xs font-black transition-all border-b-2 cursor-pointer shrink-0 ${
                activeTab === 'dashboard'
                  ? 'border-pink-400 text-pink-600 bg-pink-50/40'
                  : 'border-transparent text-slate-500 hover:text-pink-600 hover:bg-pink-50/10'
              }`}
            >
              <School className="h-4 w-4 text-pink-405 text-pink-500" />
              2. คลังสารบัญและแดชบอร์ดสรุป (Directory & Dashboard)
            </button>
          )}

          {currentTeacher.role === 'admin' && (
            <button
              onClick={() => {
                setActiveTab('admin-users');
              }}
              className={`flex items-center gap-2 px-6 py-3 text-xs font-black transition-all border-b-2 cursor-pointer shrink-0 ${
                activeTab === 'admin-users'
                  ? 'border-violet-500 text-violet-600 bg-violet-50/40'
                  : 'border-transparent text-slate-500 hover:text-violet-600 hover:bg-violet-50/10'
              }`}
            >
              <ShieldAlert className="h-4 w-4 text-violet-500" />
              3. จัดการระบบบัญชีผู้ใช้และครู (User Directory & Controls)
            </button>
          )}
        </div>

        {activeTab === 'form' || currentTeacher.role === 'teacher' ? (
          /* WINDOW 1: WRITING ROOM */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Side: Creation Form (collapsible on mobile) */}
            <div className={`lg:col-span-5 print:hidden ${showFormOnMobile ? 'block' : 'hidden lg:block'}`}>
              <LessonLogForm 
                initialRecord={editingRecord}
                teacherId={currentTeacher.id}
                onSave={handleSaveRecord}
                onCancel={() => setEditingRecord(null)}
              />
            </div>

            {/* Right Side: Log list of currently logged-in teacher */}
            <div className="lg:col-span-7 print:w-full print:border-none">
              <div className="bg-white p-5 rounded-2xl border border-sky-100/50 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wide">
                      บันทึกของฉัน ({records.filter(r => r.teacherId === currentTeacher.id).length} รายการ)
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">รายการประวัติที่คุณครูบันทึกไว้ในระบบ</p>
                  </div>
                  {editingRecord && (
                    <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 font-bold rounded-lg text-[9px] animate-pulse">
                      กำลังอยู่ในโหมดแก้ไขข้อมูล
                    </span>
                  )}
                </div>
                
                <LessonLogList 
                  records={records.filter(r => r.teacherId === currentTeacher.id)}
                  teachers={teachers}
                  showTeacherFilter={false}
                  currentUserRole={currentTeacher.role}
                  currentTeacherId={currentTeacher.id}
                  onEdit={(r) => {
                    const isOwner = r.teacherId === currentTeacher.id;
                    const isAdmin = currentTeacher.role === 'admin';
                    if (!isAdmin && !isOwner) {
                      alert('🔒 ขออภัย! เฉพาะผู้ดูแลระบบ (System Administrator) หรือคุณครูที่เป็นเจ้าของเอกสารเท่านั้นที่มีสิทธิ์แก้ไขบันทึกนี้ได้');
                      return;
                    }
                    if (r.deptHeadApproved) {
                      alert('🔒 เอกสารนี้ได้รับการลงนามอนุมัติและล็อกระบบแล้ว ไม่สามารถแก้ไขได้');
                      return;
                    }
                    setEditingRecord(r);
                    setShowFormOnMobile(true);
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  onDelete={handleDeleteRecord}
                  onPrintPreview={(r) => setActivePrintPreview(r)}
                />
              </div>
            </div>

          </div>
        ) : activeTab === 'dashboard' ? (
          /* WINDOW 2: GLOBAL ANALYTICS DASHBOARD & COLLABORATIVE DIRECTORIES */
          <div className="space-y-6">
            
            {/* Academic Board Title Header */}
            <div className="bg-gradient-to-r from-sky-100 via-white to-pink-100 text-slate-800 p-6 rounded-2xl shadow-xs border border-sky-200/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-sky-600 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-sky-500 animate-bounce" />
                  สิทธิ์ผู้ควบคุมดูแล: {
                    currentTeacher.role === 'admin' 
                      ? 'ผู้ดูแลระบบ (System Administrator)' 
                      : currentTeacher.role === 'deputy'
                      ? 'รองผู้อำนวยการ (Deputy Director)'
                      : 'หัวหน้าฝ่ายวิชาการ (Academic Administrator)'
                  }
                </span>
                <h3 className="text-base font-black tracking-tight mt-1 text-slate-900">
                  การตรวจสอบ และลงนามอนุมัติบันทึกหลังการสอน
                </h3>
              </div>
              <div className="px-3 py-1.5 bg-sky-50 rounded-xl border border-sky-200/60 text-[10px] font-bold text-sky-600">
                ⚡ Realtime Cloud Sync Active
              </div>
            </div>

            {/* Scope info panel */}
            <div className="bg-gradient-to-r from-sky-50/60 via-white to-pink-50/60 text-slate-800 p-4 rounded-2xl border border-pink-100/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 print:hidden shadow-2xs">
              <div>
                <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest block">มุมมองสถิติปัจจุบัน:</span>
                <span className="block text-sm font-black text-slate-800 mt-0.5">
                  {selectedDashboardTeacherId === 'all' 
                    ? '🏫 คุณครูทุกท่านในโรงเรียน' 
                    : `👤 เฉพาะครู: ${teachers.find(t => t.id === selectedDashboardTeacherId)?.displayName || 'ไม่ระบุ'}`}
                </span>
              </div>
              {selectedDashboardTeacherId !== 'all' && (
                <button
                  onClick={() => setSelectedDashboardTeacherId('all')}
                  className="text-[11px] font-bold text-sky-600 bg-white hover:bg-sky-50 border border-sky-200 px-3 py-1.5 rounded-lg transition"
                >
                  ดูภาพรวมโรงเรียน
                </button>
              )}
            </div>

            {/* Dashboard Stats (Updates based on selected scope) */}
            <div className="print:hidden">
              <DashboardStats 
                records={selectedDashboardTeacherId === 'all' 
                  ? records 
                  : records.filter(r => r.teacherId === selectedDashboardTeacherId)} 
                currentTeacher={currentTeacher}
                teachers={teachers}
              />
            </div>

            {/* แดชบอร์ดสรุปกิจกรรมครูรายบุคคล */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm print:hidden">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wide flex items-center gap-2">
                    <School className="h-5 w-5 text-indigo-600" />
                    1. แดชบอร์ดสถิติคุณครูแต่ละท่าน
                  </h3>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">รวมจำนวนผลงานสะสมของคุณครู คลิกที่รายชื่อคุณครูเพื่อคัดกรองหรือเรียกดูประวัติ</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedDashboardTeacherId('all')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      selectedDashboardTeacherId === 'all'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    ครูทุกคน
                  </button>
                  <button
                    onClick={() => setSelectedDashboardTeacherId(currentTeacher.id)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      selectedDashboardTeacherId === currentTeacher.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    เฉพาะฉัน
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teachers.map((teacher) => {
                  const teacherRecords = records.filter(r => r.teacherId === teacher.id);
                  const subjectCount: Record<string, number> = {};
                  teacherRecords.forEach(r => {
                    subjectCount[r.subject] = (subjectCount[r.subject] || 0) + 1;
                  });
                  let topTeacherSubject = 'ไม่มีข้อมูล';
                  let maxTeacherCount = 0;
                  Object.entries(subjectCount).forEach(([sub, count]) => {
                    if (count > maxTeacherCount) {
                      topTeacherSubject = sub;
                      maxTeacherCount = count;
                    }
                  });

                  const isCurrentActive = selectedDashboardTeacherId === teacher.id;

                  return (
                    <div
                      key={teacher.id}
                      onClick={() => setSelectedDashboardTeacherId(teacher.id)}
                      className={`cursor-pointer group p-4.5 rounded-2xl border transition duration-150 relative overflow-hidden flex flex-col justify-between ${
                        isCurrentActive
                          ? 'bg-indigo-50/60 border-indigo-300 ring-2 ring-indigo-200/40'
                          : 'bg-white border-slate-100 hover:border-indigo-100 hover:bg-slate-50/10'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-2.5">
                            <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs font-bold uppercase shrink-0 ${
                              teacher.id === currentTeacher.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-indigo-100 text-indigo-700'
                            }`}>
                              {teacher.displayName.charAt(0)}
                            </div>
                            <div className="truncate">
                              <span className="block text-xs font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors truncate">
                                {teacher.displayName}
                                {teacher.id === currentTeacher.id && (
                                  <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[8px] font-black rounded-sm uppercase tracking-wide">
                                    คุณ
                                  </span>
                                )}
                              </span>
                              <span className="block text-[9px] text-slate-400 mt-0.5 font-mono">{teacher.employeeId}</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-400 line-clamp-1 italic">{teacher.affiliation}</p>

                        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100">
                          <div className="p-2 bg-slate-50/50 rounded-xl text-center">
                            <span className="text-[8px] text-slate-400 block font-bold uppercase">บันทึกสะสม</span>
                            <span className="text-xs font-extrabold text-slate-800 mt-0.5 block">{teacherRecords.length} รายการ</span>
                          </div>
                          <div className="p-2 bg-slate-50/50 rounded-xl text-center">
                            <span className="text-[8px] text-slate-400 block font-bold uppercase">วิชาสอนหลัก</span>
                            <span className="text-[10px] font-black text-indigo-600 mt-1 block truncate" title={topTeacherSubject}>{topTeacherSubject}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100/40 flex justify-between items-center text-[9px] font-semibold text-slate-400">
                        <span className="truncate max-w-[120px]">{teacher.email}</span>
                        <span className={`text-[9px] font-bold ${
                          isCurrentActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                        }`}>
                          {isCurrentActive ? '🟢 แสดงข้อมูลอยู่' : '🔍 เลือกดูบันทึก'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* List and directories under active analytics filter */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm print:w-full print:border-none">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-150">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <BookOpen className="h-4.5 w-4.5 text-blue-500" />
                    2. คลังสารบัญและประวัติหลังสอน
                  </h3>
                  <p className="text-[11px] text-slate-600 font-bold mt-0.5">
                    กำลังแสดงผลของ: {selectedDashboardTeacherId === 'all' ? 'คุณครูทุกคน' : teachers.find(t => t.id === selectedDashboardTeacherId)?.displayName || 'ไม่ระบุ'}, ทั้งหมด {
                      (selectedDashboardTeacherId === 'all' 
                        ? records 
                        : records.filter(r => r.teacherId === selectedDashboardTeacherId)
                      ).length
                    } รายการ
                  </p>
                </div>
              </div>
              
              <LessonLogList 
                records={
                  selectedDashboardTeacherId === 'all' 
                    ? records 
                    : records.filter(r => r.teacherId === selectedDashboardTeacherId)
                }
                teachers={teachers}
                showTeacherFilter={true}
                currentUserRole={currentTeacher.role}
                currentTeacherId={currentTeacher.id}
                onEdit={(r) => {
                  const isOwner = r.teacherId === currentTeacher.id;
                  const isAdmin = currentTeacher.role === 'admin';
                  if (!isAdmin && !isOwner) {
                    alert('🔒 ขออภัย! เฉพาะผู้ดูแลระบบ (System Administrator) หรือคุณครูที่เป็นเจ้าของเอกสารเท่านั้นที่มีสิทธิ์แก้ไขบันทึกนี้ได้');
                    return;
                  }
                  if (r.deptHeadApproved) {
                    alert('🔒 เอกสารนี้ได้รับการลงนามอนุมัติและล็อกระบบแล้ว ไม่สามารถแก้ไขได้');
                    return;
                  }
                  setEditingRecord(r);
                  setActiveTab('form');
                  setShowFormOnMobile(true);
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
                onDelete={handleDeleteRecord}
                onPrintPreview={(r) => setActivePrintPreview(r)}
              />
            </div>

          </div>
        ) : (
          /* WINDOW 3: ADMIN USER DIRECTORY & CONTROLS */
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Academic Board Title Header */}
            <div className="bg-gradient-to-r from-violet-100 via-white to-sky-105 text-slate-800 p-6 rounded-2xl shadow-xs border border-violet-200/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-violet-750 uppercase tracking-wider flex items-center gap-1.5 bg-violet-50 px-2.5 py-1 rounded-sm border border-violet-200 w-fit">
                  <ShieldCheck className="h-3.5 w-3.5 text-violet-600 animate-bounce" />
                  แผงควบคุมระบบ และจัดการสมาชิก (Admin Control Panel)
                </span>
                <h3 className="text-base font-black tracking-tight mt-1.5 text-slate-900">
                  ระบบบริหารจัดการบัญชีผู้ใช้งาน และล้างฐานข้อมูลครูจำลอง
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  เฉพาะสิทธิ์ผู้ควบคุมดูแลระบบสูงสุด (System Administrator) เท่านั้นที่มีสิทธิ์ลบประวัติหรือสมาชิกเพื่อความเรียบร้อย
                </p>
              </div>
              <div className="px-3 py-1.5 bg-violet-600 rounded-xl text-[10px] font-extrabold text-white shadow-sm flex items-center gap-1">
                <span>👑 Admin Authorization Verified</span>
              </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wide block">จำนวนสมาชิกทั้งหมด</span>
                <span className="text-xl font-extrabold text-slate-800 mt-1 block">{teachers.length} บัญชี</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wide block">คุณครูผู้สอนปกติ</span>
                <span className="text-xl font-extrabold text-sky-600 mt-1 block">
                  {teachers.filter(t => !t.role || t.role === 'teacher').length} ท่าน
                </span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wide block">ฝ่ายบริหาร / วิชาการ</span>
                <span className="text-xl font-extrabold text-pink-600 mt-1 block">
                  {teachers.filter(t => t.role === 'academic' || t.role === 'deputy').length} ท่าน
                </span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wide block">ผู้ดูแลระบบสูงสุด</span>
                <span className="text-xl font-extrabold text-violet-600 mt-1 block">
                  {teachers.filter(t => t.role === 'admin').length} บัญชี
                </span>
              </div>
            </div>

            {/* Filter control or Search */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wide flex items-center gap-2">
                    <User className="h-4.5 w-4.5 text-violet-600" />
                    บัญชีชื่อข้าราชการและบุคลากรทางการศึกษา
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-semibold">ค้นหาหรือลบบัญชีคุณครูเพื่อจัดระบบ (บันทึกหลังสอนในระบบคลาวด์ทั้งหมดของผู้ถูกลบจะถูกล้างออกด้วยเพื่อสุขอนามัยข้อมูล)</p>
                </div>
                <div className="w-full md:w-72">
                  <input
                    type="text"
                    placeholder="🔍 ค้นหาด้วย ชื่อครู / อีเมล / กลุ่มสาระ..."
                    value={adminSearchQuery}
                    onChange={(e) => setAdminSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Members Grid list */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teachers
                  .filter(teacher => {
                    if (!adminSearchQuery.trim()) return true;
                    const query = adminSearchQuery.toLowerCase();
                    return (
                      (teacher.displayName || '').toLowerCase().includes(query) ||
                      (teacher.thaiName || '').toLowerCase().includes(query) ||
                      (teacher.englishName || '').toLowerCase().includes(query) ||
                      (teacher.email || '').toLowerCase().includes(query) ||
                      (teacher.employeeId || '').toLowerCase().includes(query) ||
                      (teacher.affiliation || '').toLowerCase().includes(query)
                    );
                  })
                  .map((teacher) => {
                    const teacherRecords = records.filter(r => r.teacherId === teacher.id);
                    const isSelf = teacher.id === currentTeacher.id;

                    // Role Labels
                    const roleLabels: any = {
                      teacher: { text: 'คุณครูผู้สอน', style: 'bg-sky-50 text-sky-600 border-sky-200' },
                      academic: { text: 'หัวหน้าวิชาการ', style: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
                      deputy: { text: 'รองผู้อำนวยการ', style: 'bg-pink-50 text-pink-600 border-pink-200' },
                      admin: { text: 'ผู้ดูแลระบบ', style: 'bg-violet-50 text-violet-600 border-violet-200' }
                    };
                    const roleConfig = roleLabels[teacher.role || 'teacher'] || roleLabels.teacher;

                    return (
                      <div
                        key={teacher.id}
                        className={`p-5 rounded-2xl border bg-white flex flex-col justify-between transition relative overflow-hidden ${
                          isSelf 
                            ? 'border-violet-350 ring-2 ring-violet-200/40 bg-violet-50/10' 
                            : 'border-slate-100 hover:border-slate-200 hover:shadow-xs'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex items-center space-x-3 truncate">
                              <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
                                isSelf ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-750'
                              }`}>
                                {teacher.displayName ? teacher.displayName.charAt(0) : 'T'}
                              </div>
                              <div className="truncate">
                                <h5 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5 truncate">
                                  {teacher.displayName || 'No Name'}
                                  {isSelf && (
                                    <span className="px-1.5 py-0.5 bg-violet-605 text-white text-[8px] font-semibold rounded-sm tracking-wide">
                                      คุณ
                                    </span>
                                  )}
                                </h5>
                                <span className="block text-[9px] text-slate-400 font-mono mt-0.5">{teacher.employeeId || 'No ID'}</span>
                              </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border shrink-0 ${roleConfig.style}`}>
                              {roleConfig.text}
                            </span>
                          </div>

                          <div className="space-y-1.5 pt-1.5 border-t border-slate-50 text-[11px] text-slate-600 select-none">
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-bold">ชื่อภาษาไทย:</span>
                              <span className="font-semibold text-slate-800">{teacher.thaiName || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-bold">ชื่อภาษาอังกฤษ:</span>
                              <span className="font-semibold text-slate-800">{teacher.englishName || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-bold">อีเมลติดต่อ:</span>
                              <span className="font-semibold text-slate-800 truncate max-w-[150px]" title={teacher.email}>{teacher.email}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-bold">สังกัดกลุ่มสาระ:</span>
                              <span className="font-semibold text-slate-800 truncate max-w-[145px] text-right" title={teacher.affiliation || 'ไม่ระบุ'}>{teacher.affiliation || 'ไม่ระบุ'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-bold">เบอร์โทรศัพท์:</span>
                              <span className="font-semibold text-slate-800">{teacher.phoneNumber || '-'}</span>
                            </div>
                          </div>

                          {/* Stat indicators */}
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-center">
                            <div className="p-2 bg-slate-50 rounded-xl leading-none">
                              <span className="text-[8px] text-slate-400 font-black block uppercase">สารบัญสะสม</span>
                              <span className="text-xs font-extrabold text-slate-850 mt-1 block">{teacherRecords.length} แผน</span>
                            </div>
                            <div className="p-2 bg-slate-50 rounded-xl leading-none">
                              <span className="text-[8px] text-slate-400 font-black block uppercase">ลงนามแล้ว</span>
                              <span className="text-xs font-extrabold text-emerald-600 mt-1 block">
                                {teacherRecords.filter(r => r.teacherSigned).length} แผน
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                          {isSelf ? (
                            <span className="text-[10px] text-slate-400 italic font-semibold p-1.5 bg-slate-50 rounded-lg">
                              🔒 ป้องกันบัญชีตนเอง
                            </span>
                          ) : teacher.id === 't-default-1' ? (
                            <span className="text-[10px] text-slate-400 italic font-semibold p-1.5 bg-slate-50 rounded-lg">
                              🔒 ตัวอย่างระบหลัก (ลบไม่ได้)
                            </span>
                          ) : (
                            <button
                              onClick={() => handleDeleteTeacher(teacher.id)}
                              className="text-[10.5px] font-black text-rose-600 border border-thin border-rose-200 hover:bg-rose-50/80 hover:border-rose-300 px-3 py-1.5 rounded-lg active:scale-95 transition flex items-center gap-1.5"
                            >
                              🗑️ ลบบัญชีผู้ใช้ครู
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                {teachers.filter(teacher => {
                  if (!adminSearchQuery.trim()) return true;
                  const query = adminSearchQuery.toLowerCase();
                  return (
                    (teacher.displayName || '').toLowerCase().includes(query) ||
                    (teacher.thaiName || '').toLowerCase().includes(query) ||
                    (teacher.englishName || '').toLowerCase().includes(query) ||
                    (teacher.email || '').toLowerCase().includes(query) ||
                    (teacher.employeeId || '').toLowerCase().includes(query) ||
                    (teacher.affiliation || '').toLowerCase().includes(query)
                  );
                }).length === 0 && (
                  <div className="col-span-full py-16 text-center text-xs text-slate-400 font-bold">
                     ไม่พบบัญชีผู้ใช้ครูที่ตรงกับคำค้นหา: "{adminSearchQuery}"
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 3. Footer branding */}
      <footer className="mt-16 py-8 border-t border-slate-100 bg-white print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <p className="text-xs font-semibold text-slate-400">LessonLog - ระบบบันทึกผลหลังสอนประถมศึกษา</p>
          <p className="text-[10px] text-slate-400 font-medium">ออกรายงานสรุปและบันทึกผลเพื่อใช้ประกอบการสอนอย่างง่ายดาย</p>
        </div>
      </footer>

      {/* 4. Overlay Modals: */}

       {/* 4.1. Print/PDF Template Viewer Overlay Modal */}
      {activePrintPreview && (
        <PrintTemplate 
          record={activePrintPreview}
          teacher={teachers.find(t => t.id === activePrintPreview.teacherId) || (currentTeacher?.role === 'teacher' ? currentTeacher : DEFAULT_TEACHER)}
          academicHead={teachers.find(t => t.role !== 'teacher') || (currentTeacher?.role !== 'teacher' ? currentTeacher : null)}
          currentUser={currentTeacher}
          customLogo={customLogo}
          allowAcademicSignature={true}
          onUpdateRecord={async (updated) => {
            try {
              let updatedHistory = updated.editHistory || [];
              let lastEditedBy = updated.lastEditedBy;
              let lastEditedAt = updated.lastEditedAt;

              const roleMap: any = {
                teacher: 'คุณครูผู้สอน',
                academic: 'หัวหน้าฝ่ายวิชาการ',
                deputy: 'รองผู้อำนวยการ',
                admin: 'ผู้ดูแลระบบ'
              };
              const currentRoleStr = currentTeacher ? (roleMap[currentTeacher.role || ''] || 'ผู้ใช้งาน') : 'ผู้ใช้งาน';
              const editorNameStr = currentTeacher 
                ? `${currentTeacher.thaiName || currentTeacher.displayName} (${currentRoleStr})` 
                : 'ผู้ใช้งานระบบ';
              
              lastEditedBy = editorNameStr;
              lastEditedAt = new Date().toISOString();
              
              updatedHistory = [
                ...updatedHistory,
                {
                  editedBy: editorNameStr,
                  editedAt: lastEditedAt
                }
              ];

              const dbPayload = {
                ...updated,
                lastEditedBy,
                lastEditedAt,
                editHistory: updatedHistory,
                updatedAt: new Date().toISOString()
              };

              await setDoc(doc(db, 'records', updated.id), dbPayload);
              setActivePrintPreview(dbPayload);
            } catch (err) {
              handleFirestoreError(err, OperationType.UPDATE, `records/${updated.id}`);
            }
          }}
          onClose={() => setActivePrintPreview(null)}
        />
      )}

      {/* 4.2. Profile Settings / Custom Display Name Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            
            <div className="bg-gradient-to-r from-indigo-700 to-blue-700 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  ตั้งค่าข้อมูลของคุณครู
                </h3>
                <p className="text-[10px] text-indigo-100 mt-0.5">ข้อมูลจริงที่ใช้สำหรับแสดงในใบประเมินและไฟล์รายงาน PDF อัตโนมัติ</p>
              </div>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="p-1 px-2.5 hover:bg-white/10 rounded-lg text-xs"
              >
                ปิด
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              {profileSuccessMsg && (
                <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3.5 rounded-r-lg text-xs text-emerald-800 flex gap-2 items-center">
                  <CheckCircle className="h-4.5 w-4.5 text-emerald-600" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              {/* Custom Screen Name */}
              <div className="bg-amber-50 border border-amber-200/65 p-3.5 rounded-xl">
                <label className="block text-xs font-black text-amber-900 mb-1">
                  ชื่อเล่น / ชื่อเรียกทั่วไป
                </label>
                <input
                  type="text"
                  required
                  value={pDisplayName}
                  onChange={(e) => setPDisplayName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                  placeholder="เช่น ครูวิมล แสนสุข, ครูแอร์ บันเทิงศิลป์"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    ชื่อ-นามสกุล (ภาษาไทย)
                  </label>
                  <input
                    type="text"
                    required
                    value={pThaiName}
                    onChange={(e) => setPThaiName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    ชื่อ-นามสกุล (ภาษาอังกฤษ)
                  </label>
                  <input
                    type="text"
                    required
                    value={pEnglishName}
                    onChange={(e) => setPEnglishName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                    <Award className="h-3 w-3 text-slate-400" />
                    รหัสประจำตัวครู
                  </label>
                  <input
                    type="text"
                    required
                    value={pEmployeeId}
                    onChange={(e) => setPEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                    <Phone className="h-3 w-3 text-slate-400" />
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="text"
                    required
                    value={pPhoneNumber}
                    onChange={(e) => setPPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              {currentTeacher?.role === 'teacher' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                    <School className="h-3.5 w-3.5 text-slate-400" />
                    กลุ่มสาระการเรียนรู้ที่สังกัด *
                  </label>
                  <select
                    required
                    value={pAffiliation}
                    onChange={(e) => setPAffiliation(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white cursor-pointer"
                  >
                    <option value="" disabled>-- เลือกกลุ่มสาระการเรียนรู้ --</option>
                    {SUBJECTS.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* ปรับแต่งโลโก้โรงเรียน (School Logo Setup Panel) */}
              <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl space-y-3">
                <span className="text-[11px] font-black text-slate-700 flex items-center gap-1.5">
                  <School className="h-4 w-4 text-pink-600 animate-pulse" />
                  ปรับแต่งตราสัญลักษณ์โรงเรียน (School Logo)
                </span>
                <p className="text-[10px] text-slate-500 leading-normal">
                  กำหนดภาพตราสัญลักษณ์ที่จะใช้สำหรับใบรายงาน PDF และแท็บด้านบนของครู สามารถกดจับภาพจากกล้องถ่ายรูปได้โดยตรง หรืออัปโหลดไฟล์
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
                  <div className="h-16 w-16 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-150 overflow-hidden relative group shrink-0 shadow-inner">
                    {customLogo ? (
                      <>
                        <img src={customLogo} alt="Custom school logo" className="h-full w-full object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-indigo-900/90 text-white text-[8px] text-center font-bold py-0.5 pointer-events-none scale-90">ตรากำหนดเอง</span>
                      </>
                    ) : (
                      <>
                        <SchoolLogo className="h-12 w-12" />
                        <span className="absolute bottom-0 inset-x-0 bg-pink-600/90 text-white text-[8px] text-center font-black py-0.5 pointer-events-none scale-90">ตราเริ่มต้น</span>
                      </>
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1 w-full text-left">
                    {currentTeacher?.role === 'admin' ? (
                      <>
                        <span className="text-[10px] font-bold text-slate-500 block">ตัวเลือกปรับเปลี่ยนตราสัญลักษณ์:</span>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setIsCameraActive(true)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-lg transition"
                          >
                            <Camera className="h-3 w-3" />
                            จับภาพจากกล้อง
                          </button>
                          
                          <label className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer transition">
                            <Upload className="h-3 w-3" />
                            อัปโหลดรูปภาพ
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoFileUpload}
                              className="hidden"
                            />
                          </label>

                          {customLogo && (
                            <button
                              type="button"
                              onClick={handleClearCustomLogo}
                              className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] px-3 py-1.5 rounded-lg border border-rose-200 transition"
                            >
                              <RotateCcw className="h-3 w-3" />
                              กู้คืนตราเดิม
                            </button>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="p-2.5 bg-amber-50/60 border border-amber-100 rounded-lg text-amber-800 text-[10.5px] leading-relaxed select-none">
                        ⚠️ <strong>เฉพาะผู้ดูแลระบบ (Administrator) เท่านั้น</strong> ที่มีสิทธิ์แก้ไขสัญลักษณ์/ตราสัญลักษณ์โรงเรียนได้ (ของบัญชีคุณครูและฝ่ายวิชาการจะเป็นสถานะอ่านอย่างเดียว)
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-150 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl transition"
                >
                  ปิดหน้าต่าง
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
                >
                  บันทึกข้อมูล
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 4.3. Interactive Camera Capture Sub-Modal/Overlay */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col justify-center items-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl p-6 text-center space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm text-white flex items-center justify-center gap-2">
                <Camera className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
                ถ่ายภาพโลโก้ / ตราสัญลักษณ์สด
              </h3>
              <p className="text-[10px] text-slate-400 text-center leading-normal">
                เพื่อความกึ่งกลางและภาพออกมาสวยงาม โปรดปรับตราสัญลักษณ์ให้อยู่ในกรอบเป้าเล็ง
              </p>
            </div>

            {/* Video Canvas Scanning Stage */}
            <div className="relative aspect-square w-full max-w-[240px] mx-auto bg-black rounded-2xl overflow-hidden border border-slate-700/80">
              {/* Scanning laser line animation */}
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-405 to-transparent top-0 animate-[scan_2.5s_ease-in-out_infinite] z-20 shadow-[0_0_8px_rgba(99,102,241,1)]" />
              
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Aim alignment grids */}
              <div className="absolute inset-4 border-2 border-dashed border-indigo-400/40 rounded-full pointer-events-none flex items-center justify-center">
                <div className="w-10 h-10 border border-dashed border-indigo-400/60 rounded-full" />
              </div>
              
              {cameraError && (
                <div className="absolute inset-0 bg-slate-950/90 flex flex-col justify-center items-center p-4 space-y-3">
                  <ShieldAlert className="h-8 w-8 text-rose-500 animate-[bounce_1s_infinite]" />
                  <p className="text-[10px] text-rose-400 font-bold text-center leading-normal">{cameraError}</p>
                </div>
              )}
            </div>

            {/* Capture controls */}
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={stopCamera}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-755 text-slate-300 font-extrabold text-[11px] rounded-xl border border-slate-700 active:scale-95 transition"
              >
                ยกเลิก
              </button>
              
              <button
                type="button"
                disabled={!!cameraError}
                onClick={capturePhoto}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none text-white font-extrabold text-[11px] rounded-xl active:scale-95 transition flex items-center justify-center gap-1.5"
              >
                <div className="h-2 w-2 rounded-full bg-white animate-ping" />
                ถ่ายคู่รูปตรา
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      <div id="toast-container" className="fixed bottom-5 right-5 z-55 flex flex-col gap-3 pointer-events-none max-w-sm w-full font-sans print:hidden">
        <AnimatePresence>
          {toasts.map((toast) => {
            const colors = {
              success: {
                bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
                iconBg: 'bg-emerald-500 text-white',
                progressBg: 'bg-emerald-500'
              },
              info: {
                bg: 'bg-sky-50 border-sky-200 text-sky-800',
                iconBg: 'bg-sky-500 text-white',
                progressBg: 'bg-sky-500'
              },
              warning: {
                bg: 'bg-amber-50 border-amber-200 text-amber-800',
                iconBg: 'bg-amber-500 text-white',
                progressBg: 'bg-amber-500'
              },
              error: {
                bg: 'bg-rose-50 border-rose-200 text-rose-800',
                iconBg: 'bg-rose-500 text-white',
                progressBg: 'bg-rose-500'
              }
            }[toast.type];

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
                layout
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-lg backdrop-blur-md ${colors.bg} relative overflow-hidden`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${colors.iconBg} flex items-center justify-center`}>
                  <Bell className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <h4 className="text-xs font-black tracking-tight">{toast.title}</h4>
                  <p className="text-[11px] font-semibold mt-0.5 leading-normal opacity-90">{toast.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition p-1 rounded-lg hover:bg-slate-200/10 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                {/* Auto expire progress bar anim */}
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: 0 }}
                  transition={{ duration: 5, ease: 'linear' }}
                  className={`absolute bottom-0 left-0 h-1 ${colors.progressBg}`}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

    </div>
  );
}
