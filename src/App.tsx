import React, { useState, useEffect } from "react";
import { Teacher, LessonRecord, LessonPlan, SUBJECTS, Student } from "./types";
import { MOCK_RECORDS, DEFAULT_TEACHER } from "./data";
import { AuthView } from "./components/AuthView";
import { DashboardStats } from "./components/DashboardStats";
import { StudentStatsModal } from "./components/StudentStatsModal";
import { TeacherListModal } from "./components/TeacherListModal";
import { LessonLogForm } from "./components/LessonLogForm";
import { LessonLogList } from "./components/LessonLogList";
import { LessonPlanForm } from "./components/LessonPlanForm";
import { LessonPlanList } from "./components/LessonPlanList";
import { ClassroomModule } from "./components/ClassroomModule";
import { EvaluationModule } from "./components/EvaluationModule";
import { UserManagementModule } from "./components/UserManagementModule";
import { PrintTemplate, SchoolLogo } from "./components/PrintTemplate";
import { LessonPlanPrintTemplate } from "./components/LessonPlanPrintTemplate";
import { AdminMonitoringDashboard } from "./components/AdminMonitoringDashboard";
import { SchoolEventCalendar } from "./components/SchoolEventCalendar";
import { OverviewCalendar } from "./components/OverviewCalendar";
import { AcademicModule } from "./components/AcademicModule";
import { DisciplineModule } from "./components/DisciplineModule";
import {
  BookOpen,
  LogOut,
  User,
  Award,
  Phone,
  Building,
  Settings,
  HelpCircle,
  CheckCircle,
  ChevronDown,
  CalendarDays,
  Download,
  FileJson,
  FileSpreadsheet,
  School,
  PlusCircle,
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  ShieldAlert,
  Camera,
  Upload,
  RotateCcw,
  Loader2,
  Bell,
  X,
  FileText,
  Users,
  BarChart3,
  LayoutDashboard,
  Presentation,
  Wrench,
  Trash2,
  PenLine,
  List,
  History,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { auth, db, handleFirestoreError, OperationType } from "./lib/firebase";
import { onAuthStateChanged, signOut, updatePassword } from "firebase/auth";
import { formatThaiDate } from './lib/dateUtils';
import {
  collection,
  query,
  where,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";

// Safe localStorage helper to avoid SecurityError in restricted sandboxed iframes
const safeLocalStorage = {
  getItem(key: string): string | null {
    try {
      return typeof window !== "undefined" && window.localStorage
        ? localStorage.getItem(key)
        : null;
    } catch (e) {
      console.warn(`[SafeStorage] Failed to read key "${key}":`, e);
      return null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn(`[SafeStorage] Failed to write key "${key}":`, e);
    }
  },
  removeItem(key: string): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn(`[SafeStorage] Failed to remove key "${key}":`, e);
    }
  },
};

// Safe scroll helper to prevent sandbox limitations from throwing errors
const safeScrollTo = (options: ScrollToOptions) => {
  try {
    if (
      typeof window !== "undefined" &&
      typeof window.scrollTo === "function"
    ) {
      window.scrollTo(options);
    }
  } catch (e) {
    console.warn("[SafeScroll] Failed to scroll:", e);
  }
};

export default function App() {
  // Toast notifications state
  interface ToastItem {
    id: string;
    title: string;
    message: string;
    type: "success" | "info" | "warning" | "error";
  }
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (
    message: string,
    type: "success" | "info" | "warning" | "error" = "success",
    title?: string,
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    const defaultTitles = {
      success: "🎉 สำเร็จ",
      info: "ℹ️ แจ้งเตือน",
      warning: "⚠️ ข้อควรระวัง",
      error: "❌ เกิดข้อผิดพลาด",
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
  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsCount, setStudentsCount] = useState<number>(0);
  const [showStudentStatsModal, setShowStudentStatsModal] = useState<boolean>(false);
  const [showTeacherListModal, setShowTeacherListModal] = useState<boolean>(false);
  const [activeModule, setActiveModule] = useState<
    "home" | "teaching" | "classroom" | "academic" | "analytics" | "admin" | "discipline"
  >("home");
  const [activeTab, setActiveTab] = useState<
    "form" | "dashboard" | "plan-form" | "plan-list"
  >("form");
  const [selectedDashboardTeacherId, setSelectedDashboardTeacherId] =
    useState<string>("all");

  // Custom School Logo States & Camera Capture
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [systemAcademicYear, setSystemAcademicYear] = useState<string>("2567");
  const [systemSemester, setSystemSemester] = useState<string>("1");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  // Dashboard Lock Passcode States
  const [isDashboardUnlocked, setIsDashboardUnlocked] = useState(false);
  const [dashboardPasswordInput, setDashboardPasswordInput] = useState("");
  const [dashboardPasswordError, setDashboardPasswordError] = useState("");
  const [sysDashboardPassword, setSysDashboardPassword] = useState("admin123");
  const [showPasswordChangeField, setShowPasswordChangeField] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [showPassRaw, setShowPassRaw] = useState(false);

  // Editing and preview modals/states
  const [editingRecord, setEditingRecord] = useState<LessonRecord | null>(null);
  const [editingPlan, setEditingPlan] = useState<LessonPlan | null>(null);
  const [activePrintPreview, setActivePrintPreview] =
    useState<LessonRecord | null>(null);
  const [activePlanPrintPreview, setActivePlanPrintPreview] =
    useState<LessonPlan | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showFormOnMobile, setShowFormOnMobile] = useState(false);

  // Edit Teacher profile temporary states
  const [pThaiName, setPThaiName] = useState("");
  const [pEnglishName, setPEnglishName] = useState("");
  const [pEmployeeId, setPEmployeeId] = useState("");
  const [pPhoneNumber, setPPhoneNumber] = useState("");
  const [pAffiliation, setPAffiliation] = useState("");
  const [pDisplayName, setPDisplayName] = useState("");
  const [pPassword, setPPassword] = useState("");
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");

  // 1. Firebase Authentication state change listener
  useEffect(() => {
    let unsubAuth = () => {};
    if (auth && auth.onAuthStateChanged) {
      unsubAuth = auth.onAuthStateChanged(async (user: any) => {
        if (user) {
          try {
            if (db) {
              const profileRef = doc(db, "teachers", user.uid);
              const profileSnap = await getDoc(profileRef);
              if (profileSnap.exists()) {
                const t = profileSnap.data() as Teacher;
                setCurrentTeacher(t);
                initProfileStates(t);
                setAuthLoading(false);
                return;
              }
            }
            // Fallback if db is unavailable or profile missing
            const fallback: Teacher = {
              id: user.uid,
              email: user.email || "",
              thaiName: "คุณครูผู้เขียน",
              englishName: "Teacher Profile",
              employeeId: "ED-" + user.uid.substring(0, 5).toUpperCase(),
              phoneNumber: "N/A",
              affiliation: "กลุ่มสาระการเรียนรู้",
              displayName:
                user.displayName || user.email?.split("@")[0] || "Teacher",
              role: "teacher",
              hasSeeded: true,
            };
            setCurrentTeacher(fallback);
            initProfileStates(fallback);
          } catch (err) {
            console.warn(
              "Error setting up active teacher session, using fallback:",
              err,
            );
            const fallback: Teacher = {
              id: user.uid,
              email: user.email || "",
              thaiName: "คุณครูผู้เขียน",
              englishName: "Teacher Profile",
              employeeId: "ED-" + user.uid.substring(0, 5).toUpperCase(),
              phoneNumber: "N/A",
              affiliation: "กลุ่มสาระการเรียนรู้",
              displayName:
                user.displayName || user.email?.split("@")[0] || "Teacher",
              role: "teacher",
              hasSeeded: true,
            };
            setCurrentTeacher(fallback);
            initProfileStates(fallback);
          }
        } else {
          setCurrentTeacher(null);
        }
        setAuthLoading(false);
      });
    } else {
      setAuthLoading(false);
    }

    // Load custom logo
    const savedLogo = safeLocalStorage.getItem("lessonlog_custom_logo");
    if (savedLogo) {
      setCustomLogo(savedLogo);
    }

    // Listen for safety-wrapper alerts to block SecurityError in sandboxed iframe environments
    const handleSafeAlert = (event: Event) => {
      const customEv = event as CustomEvent<{ message: string }>;
      if (customEv.detail && customEv.detail.message) {
        addToast(customEv.detail.message, "info");
      }
    };
    window.addEventListener("app-safe-alert", handleSafeAlert);

    const handleCustomToast = (event: Event) => {
      const customEv = event as CustomEvent<{ message: string; type?: 'info' | 'success' | 'warning' | 'error'; title?: string }>;
      if (customEv.detail && customEv.detail.message) {
        addToast(customEv.detail.message, customEv.detail.type || "info", customEv.detail.title);
      }
    };
    window.addEventListener("app-custom-toast", handleCustomToast);

    // Real-time dynamic subscription to shared school config doc (e.g., customLogo, systemAcademicYear, systemSemester)
    let unsubConfig = () => {};
    if (db) {
      try {
        unsubConfig = onSnapshot(
          doc(db, "config", "school"),
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              if (data && data.customLogo !== undefined) {
                setCustomLogo(data.customLogo);
              }
              if (data && data.systemAcademicYear) {
                setSystemAcademicYear(data.systemAcademicYear);
              }
              if (data && data.systemSemester) {
                setSystemSemester(data.systemSemester);
              }
            }
          },
          (err) => {
            console.warn("Config fetch error or offline model:", err);
          },
        );
      } catch (e) {
        console.warn("Could not connect to Firestore config doc", e);
      }
    }

    // Load sys dashboard password
    const savedPassword = safeLocalStorage.getItem(
      "lessonlog_sys_dashboard_password",
    );
    if (savedPassword) {
      setSysDashboardPassword(savedPassword);
    }

    return () => {
      unsubAuth();
      unsubConfig();
      window.removeEventListener("app-safe-alert", handleSafeAlert);
      window.removeEventListener("app-custom-toast", handleCustomToast);
    };
  }, []);

  // 2. Real-time dynamic Firestore listeners for Records and Teacher catalogues
  useEffect(() => {
    if (!currentTeacher || !db) return;

    // Clean active states when profile switches
    setRecords([]);

    // Set records query based on Role-Based Access Control list constraints
    let recordsQuery;
    try {
      const canReadAll = ['admin', 'academic', 'deputy'].includes(currentTeacher.role || '');
      if (canReadAll) {
        recordsQuery = collection(db, "records");
      } else {
        recordsQuery = query(
          collection(db, "records"),
          where("teacherId", "==", currentTeacher.id),
        );
      }
    } catch (e) {
      console.warn("Could not setup Firestore queries", e);
      return;
    }

    const unsubRecords = onSnapshot(
      recordsQuery,
      async (snapshot) => {
        const fetchedRecords: LessonRecord[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as LessonRecord;
          if (data.gradeLevel) {
            data.gradeLevel = data.gradeLevel.replace(/\s*\(ป\..*\)/g, '');
          }
          fetchedRecords.push(data);
        });

        // Sort chronological descending
        fetchedRecords.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

        // Auto-seeding for new teachers (highly polished out-of-the-box system demo)
        if (
          fetchedRecords.length === 0 &&
          currentTeacher.role === "teacher" &&
          !currentTeacher.hasSeeded
        ) {
          const updatedTeacher = { ...currentTeacher, hasSeeded: true };
          setCurrentTeacher(updatedTeacher);
          setDoc(doc(db, "teachers", currentTeacher.id), updatedTeacher).catch(
            console.error,
          );

          const seedPayloads = MOCK_RECORDS.map((r, index) => ({
            ...r,
            id: `rec-${currentTeacher.id}-${index}`,
            teacherId: currentTeacher.id,
            createdAt: new Date(
              Date.now() - index * 24 * 60 * 60 * 1000,
            ).toISOString(),
            updatedAt: new Date(
              Date.now() - index * 24 * 60 * 60 * 1000,
            ).toISOString(),
          }));

          for (const payload of seedPayloads) {
            setDoc(doc(db, "records", payload.id), payload).catch(
              console.error,
            );
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
                      "success",
                      "✍️ ตรวจอนุมัติเอกสารสำเร็จ",
                    );
                  } else if (oldApproved && !newApproved) {
                    addToast(
                      `เอกสารการสอนชั้น ${newRec.gradeLevel} "${newRec.subject}" ถูกยกเลิกขั้นตอนลงนามรับรองกรุณาตรวจสอบ ⚠️`,
                      "warning",
                      "ยกเลิกการตรวจรับรอง",
                    );
                  } else if (!oldRec.teacherSigned && newRec.teacherSigned) {
                    addToast(
                      `คุณครูผู้บันทึกได้กดลงลายมือชื่อในเอกสาร "${newRec.subject}" เรียบร้อยแล้ว ✍️`,
                      "info",
                      "คุณครูลงนามส่งแผน",
                    );
                  }
                } else {
                  // New record added by someone else
                  if (newRec.teacherId !== currentTeacher.id) {
                    addToast(
                      `มีบันทึกหลังสอนใหม่เข้ามา: วิชา "${newRec.subject}" ชั้น ${newRec.gradeLevel} 📝`,
                      "info",
                      "พบบันทึกการสอนใหม่",
                    );
                  }
                }
              });
            }
            return fetchedRecords;
          });
          if (
            fetchedRecords.length > 0 &&
            currentTeacher.role === "teacher" &&
            !currentTeacher.hasSeeded
          ) {
            const updatedTeacher = { ...currentTeacher, hasSeeded: true };
            setCurrentTeacher(updatedTeacher);
            setDoc(
              doc(db, "teachers", currentTeacher.id),
              updatedTeacher,
            ).catch(console.error);
          }
        }
      },
      (err) => {
        console.error("Records snapshot failed:", err);
      },
    );

    // Subscription for all academic profiles lookup
    const unsubTeachers = onSnapshot(
      collection(db, "teachers"),
      (snapshot) => {
        const fetchedTeachers: Teacher[] = [];
        snapshot.forEach((doc) => {
          fetchedTeachers.push(doc.data() as Teacher);
        });
        if (!fetchedTeachers.some((t) => t.id === DEFAULT_TEACHER.id)) {
          fetchedTeachers.push(DEFAULT_TEACHER);
        }
        setTeachers(fetchedTeachers);
      },
      (err) => {
        console.error("Teachers catalog lookup error:", err);
      },
    );

    let plansQuery: any;
    try {
      const canReadAll = ['admin', 'academic', 'deputy'].includes(currentTeacher.role || '');
      if (canReadAll) {
        plansQuery = collection(db, "lessonPlans");
      } else {
        plansQuery = query(
          collection(db, "lessonPlans"),
          where("teacherId", "==", currentTeacher.id),
        );
      }
    } catch (e) {
      console.warn("Could not setup Firestore queries for plans", e);
    }
    const unsubPlans = onSnapshot(
      plansQuery,
      (snapshot) => {
        const fetchedPlans: LessonPlan[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as LessonPlan;
          if (data.gradeLevel) {
            data.gradeLevel = data.gradeLevel.replace(/\s*\(ป\..*\)/g, '');
          }
          fetchedPlans.push(data);
        });
        fetchedPlans.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setPlans(fetchedPlans);
      },
      (err) => {
        console.error("Plans lookup error:", err);
      },
    );

    const unsubStudents = onSnapshot(
      collection(db, "students"),
      (snapshot) => {
        setStudentsCount(snapshot.size);
        const fetchedStudents = snapshot.docs.map((doc) => {
          const data = doc.data() as Student;
          if (data.gradeLevel) {
            data.gradeLevel = data.gradeLevel.replace(/\s*\(ป\..*\)/g, '');
          }
          return { id: doc.id, ...data };
        });
        setStudents(fetchedStudents);
      },
      (err) => {
        console.error("Students lookup error:", err);
      },
    );

    return () => {
      unsubRecords();
      unsubTeachers();
      unsubPlans();
      unsubStudents();
    };
  }, [currentTeacher]);

  const initProfileStates = (t: Teacher) => {
    setPThaiName(t.thaiName || "");
    setPEnglishName(t.englishName || "");
    setPEmployeeId(t.employeeId || "");
    setPPhoneNumber(t.phoneNumber || "");
    setPAffiliation(t.affiliation || "");
    setPDisplayName(t.displayName || "");
    setPPassword("");
  };

  // Camera Capture Control Effect
  useEffect(() => {
    if (isCameraActive) {
      let activeStream: MediaStream | null = null;
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setCameraError(
          "เบราว์เซอร์หรือสภาพแวดล้อมระบบของคุณไม่สนับสนุนการใช้งานกล้องถ่ายรูป",
        );
        return;
      }
      navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 480 },
            height: { ideal: 480 },
          },
          audio: false,
        })
        .then((stream) => {
          activeStream = stream;
          setCameraStream(stream);
          setCameraError(null);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("Camera capture error:", err);
          setCameraError(
            "ไม่สามารถเปิดใช้งานกล้องได้กรุณาตรวจสอบสิทธิ์การใช้งานกล้องในเบราว์เซอร์",
          );
        });

      return () => {
        if (activeStream) {
          activeStream.getTracks().forEach((track) => track.stop());
        }
      };
    }
  }, [isCameraActive]);

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      const size = Math.min(video.videoWidth || 480, video.videoHeight || 480);
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Crop center to square
        const sx = (video.videoWidth - size) / 2;
        const sy = (video.videoHeight - size) / 2;
        ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
        const dataUrl = canvas.toDataURL("image/png");
        setCustomLogo(dataUrl);
        safeLocalStorage.setItem("lessonlog_custom_logo", dataUrl);
        setDoc(
          doc(db, "config", "school"),
          { customLogo: dataUrl },
          { merge: true },
        ).catch((err) => {
          console.error("Failed to persist custom logo in Firestore:", err);
        });
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
        safeLocalStorage.setItem("lessonlog_custom_logo", base64String);
        setDoc(
          doc(db, "config", "school"),
          { customLogo: base64String },
          { merge: true },
        ).catch((err) => {
          console.error("Failed to persist uploaded logo in Firestore:", err);
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearCustomLogo = () => {
    setCustomLogo(null);
    safeLocalStorage.removeItem("lessonlog_custom_logo");
    setDoc(
      doc(db, "config", "school"),
      { customLogo: null },
      { merge: true },
    ).catch((err) => {
      console.error("Failed to clear custom logo in Firestore:", err);
    });
  };

  const handleUpdateAcademicYear = (newYear: string, newSemester: string) => {
    setSystemAcademicYear(newYear);
    setSystemSemester(newSemester);
    if (db) {
      setDoc(
        doc(db, "config", "school"),
        { systemAcademicYear: newYear, systemSemester: newSemester },
        { merge: true },
      ).catch((err) => {
        console.error("Failed to persist academic year in Firestore:", err);
      });
    }
    addToast("อัปเดตปีการศึกษาและภาคเรียนเรียบร้อยแล้ว", "success");
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
      setDashboardPasswordError("");
      setDashboardPasswordInput("");
    } else {
      setDashboardPasswordError(
        "❌ รหัสผ่านคลังระบบไม่ถูกต้อง กรุณาติดต่อฝ่ายวิชาการ/ฝ่ายบริหาร หรือลองใหม่อีกครั้ง",
      );
    }
  };

  const handleLockDashboard = () => {
    setIsDashboardUnlocked(false);
    setDashboardPasswordInput("");
    setDashboardPasswordError("");
  };

  const handleChangeSysDashboardPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasswordInput.trim()) {
      alert("กรุณาระบุรหัสผ่านใหม่");
      return;
    }
    setSysDashboardPassword(newPasswordInput.trim());
    safeLocalStorage.setItem(
      "lessonlog_sys_dashboard_password",
      newPasswordInput.trim(),
    );
    setNewPasswordInput("");
    setShowPasswordChangeField(false);
    alert(
      "🔒 บันทึกรหัสผ่านควบคุมความปลอดภัยตัวใหม่สำหรับเข้าคลังเรียบร้อยแล้ว!",
    );
  };

  // Profile Save Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeacher) return;

    if (
      !pThaiName ||
      !pEnglishName ||
      !pEmployeeId ||
      !pPhoneNumber ||
      !pDisplayName ||
      (currentTeacher.role === "teacher" && !pAffiliation)
    ) {
      alert("กรุณากรอกข้อมูลโปรไฟล์ของคุณครูให้ครบทุกช่อง");
      return;
    }

    try {
      if (pPassword.trim().length > 0) {
        if (pPassword.trim().length < 6) {
          alert("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
          return;
        }
        if (auth.currentUser) {
          try {
            await updatePassword(auth.currentUser, pPassword.trim());
            // Log successful password change
            const logId = `pwd-change-${auth.currentUser.uid}-${Date.now()}`;
            await setDoc(doc(db, "auditLogs", logId), {
              userId: auth.currentUser.uid,
              userEmail: currentTeacher.email,
              action: "PASSWORD_CHANGE",
              timestamp: new Date().toISOString()
            });
          } catch (error: any) {
            console.error("Password update error:", error);
            if (error.code === 'auth/requires-recent-login') {
              alert("ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาออกจากระบบแล้วเข้าสู่ระบบใหม่อีกครั้ง ก่อนทำการเปลี่ยนรหัสผ่าน");
            } else {
              alert("เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน: " + error.message);
            }
            return;
          }
        }
      }

      const updatedTeacher: Teacher = {
        ...currentTeacher,
        thaiName: pThaiName,
        englishName: pEnglishName,
        employeeId: pEmployeeId,
        phoneNumber: pPhoneNumber,
        affiliation: pAffiliation,
        displayName: pDisplayName,
      };

      await setDoc(doc(db, "teachers", currentTeacher.id), updatedTeacher);
      setCurrentTeacher(updatedTeacher);
      addToast(
        "แก้ไขและอัปเดตข้อมูลโปรไฟล์ผู้ใช้งานสำเร็จแล้ว 💼",
        "success",
        "อัปเดตโปรไฟล์",
      );

      setProfileSuccessMsg(
        "อัปเดตข้อมูลคุณครูเรียบร้อยแล้ว ในระบบคลาวด์/Firestore!",
      );
      setTimeout(() => {
        setProfileSuccessMsg("");
        setShowProfileModal(false);
      }, 1500);
    } catch (err) {
      handleFirestoreError(
        err,
        OperationType.WRITE,
        `teachers/${currentTeacher.id}`,
      );
    }
  };

  // Create or Update Record
  const handleSaveRecord = async (record: LessonRecord) => {
    try {
      const isEdit = records.some((r) => r.id === record.id);
      const existing = records.find((r) => r.id === record.id);

      if (isEdit && existing && currentTeacher) {
        const isOwner = existing.teacherId === currentTeacher.id;
        const isAdmin = currentTeacher.role === "admin";
        if (!isAdmin && !isOwner) {
          alert(
            "🔒 ขออภัย! เฉพาะผู้ดูแลระบบ (System Administrator) หรือคุณครูที่เป็นเจ้าของเอกสารเท่านั้นที่มีสิทธิ์แก้ไขบันทึกนี้ได้",
          );
          return;
        }
      }

      if (existing && existing.deptHeadApproved) {
        alert(
          "🔒 ขออภัย! เอกสารนี้ได้รับการลงนามอนุมัติและล็อกระบบแล้ว ไม่สามารถแก้ไขได้",
        );
        return;
      }

      let updatedHistory = record.editHistory || [];
      let lastEditedBy = record.lastEditedBy;
      let lastEditedAt = record.lastEditedAt;

      if (isEdit) {
        const roleMap: any = {
          teacher: "คุณครูผู้สอน",
          academic: "หัวหน้าฝ่ายวิชาการ",
          deputy: "รองผู้อำนวยการ",
          admin: "ผู้ดูแลระบบ",
          discipline: "หัวหน้างานปกครอง",
        };
        const currentRoleStr = currentTeacher
          ? roleMap[currentTeacher.role || ""] || "ผู้ใช้งาน"
          : "ผู้ใช้งาน";
        const editorNameStr = currentTeacher
          ? `${currentTeacher.thaiName || currentTeacher.displayName} (${currentRoleStr})`
          : "ผู้ใช้งานระบบ";

        lastEditedBy = editorNameStr;
        lastEditedAt = new Date().toISOString();

        updatedHistory = [
          ...updatedHistory,
          {
            editedBy: editorNameStr,
            editedAt: lastEditedAt,
          },
        ];
      }

      const payload = {
        ...record,
        updatedAt: new Date().toISOString(),
        ...(isEdit
          ? { lastEditedBy, lastEditedAt, editHistory: updatedHistory }
          : {}),
      };

      // Filter out undefined property values to prevent Firestore serialization errors
      const cleanPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== undefined),
      );

      await setDoc(doc(db, "records", record.id), cleanPayload);
      setEditingRecord(null);
      setShowFormOnMobile(false);
      addToast(
        isEdit
          ? `แก้ไขและอัปเดตบันทึกผลหลังสอนรายวิชา "${record.subject}" เรียบร้อยแล้ว ✨`
          : `สร้างและส่งบันทึกผลหลังสอนรายวิชา "${record.subject}" สำเร็จ จัดเก็บเข้าคลาวด์แล้ว 🎉`,
        "success",
        isEdit ? "อัปเดตข้อมูลสำเร็จ" : "บันทึกการสอนสำเร็จ",
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `records/${record.id}`);
    }
  };

  // Delete Record
  const handleDeleteRecord = async (id: string) => {
    if (!currentTeacher) return;

    try {
      const existing = records.find((r) => r.id === id);
      if (!existing) return;

      const isOwner = existing.teacherId === currentTeacher.id;
      const isAdmin = currentTeacher.role === "admin";

      if (!isAdmin && !isOwner) {
        alert(
          "🔒 ขออภัย! เฉพาะผู้ดูแลระบบ (System Administrator) หรือคุณครูที่เป็นเจ้าของเอกสารเท่านั้นที่มีสิทธิ์ลบประวัตินี้ได้",
        );
        return;
      }

      if (existing.deptHeadApproved) {
        alert(
          "🔒 ขออภัย! เอกสารนี้ได้รับการลงนามอนุมัติและล็อกระบบแล้ว ไม่สามารถแก้ไขหรือลบได้",
        );
        return;
      }

      await deleteDoc(doc(db, "records", id));
      if (editingRecord?.id === id) {
        setEditingRecord(null);
      }
      addToast(
        "ลบบันทึกหลังสอนรายวิชาออกจากระบบคลาวด์เสร็จสิ้น 🗑️",
        "info",
        "ลบเอกสารสำเร็จ",
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `records/${id}`);
    }
  };

  const handleSavePlan = async (plan: LessonPlan) => {
    try {
      const isEdit = plans.some((p) => p.id === plan.id);

      const payload = {
        ...plan,
        updatedAt: new Date().toISOString(),
      };

      const cleanPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== undefined),
      );

      await setDoc(doc(db, "lessonPlans", plan.id), cleanPayload);
      setEditingPlan(null);
      setShowFormOnMobile(false);
      addToast(
        isEdit
          ? `แก้ไขและอัปเดตแผนการสอน "${plan.title}" เรียบร้อยแล้ว ✨`
          : `สร้างแผนการสอน "${plan.title}" สำเร็จ จัดเก็บเข้าคลาวด์แล้ว 🎉`,
        "success",
        isEdit ? "อัปเดตแผนการสอนสำเร็จ" : "บันทึกแผนการสอนสำเร็จ",
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `lessonPlans/${plan.id}`);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!currentTeacher) return;

    try {
      const existing = plans.find((p) => p.id === id);
      if (!existing) return;

      const isOwner = existing.teacherId === currentTeacher.id;
      const isAdmin = currentTeacher.role === "admin";

      if (!isAdmin && !isOwner) {
        alert(
          "🔒 ขออภัย! เฉพาะผู้ดูแลระบบ หรือคุณครูเจ้าของแผนการสอนเท่านั้นที่มีสิทธิ์ลบแผนการสอนนี้ได้",
        );
        return;
      }

      if (existing.status === "approved") {
        alert(
          "🔒 ขออภัย! แผนการสอนนี้ได้รับการลงนามอนุมัติแล้ว ไม่สามารถลบได้",
        );
        return;
      }

      await deleteDoc(doc(db, "lessonPlans", id));
      if (editingPlan?.id === id) {
        setEditingPlan(null);
      }
      addToast("ลบแผนการสอนออกจากระบบเสร็จสิ้น 🗑️", "info", "ลบข้อมูลสำเร็จ");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `lessonPlans/${id}`);
    }
  };

  // Delete Teacher (Admin Only)
  const [teacherToDelete, setTeacherToDelete] = useState<string | null>(null);

  const confirmDeleteTeacher = async () => {
    if (!teacherToDelete || !currentTeacher) return;

    const teacherObj = teachers.find((t) => t.id === teacherToDelete);
    if (!teacherObj) return;

    const teacherRecords = records.filter(
      (r) => r.teacherId === teacherToDelete,
    );

    try {
      // 1. Delete associated records
      for (const rec of teacherRecords) {
        await deleteDoc(doc(db, "records", rec.id));
      }
      // 2. Delete teacher doc
      await deleteDoc(doc(db, "teachers", teacherToDelete));

      setTeacherToDelete(null);
    } catch (err) {
      handleFirestoreError(
        err,
        OperationType.DELETE,
        `teachers/${teacherToDelete}`,
      );
    }
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    if (!currentTeacher) return;
    if (currentTeacher.role !== "admin") {
      alert("🔒 เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถลบบัญชีผู้ใช้ได้");
      return;
    }

    if (teacherId === currentTeacher.id) {
      alert("❌ คุณไม่สามารถลบบัญชีของคุณเองได้ในหน้าต่างการใช้งานปัจจุบัน");
      return;
    }

    const teacherObj = teachers.find((t) => t.id === teacherId);
    if (!teacherObj) return;

    if (teacherId === "t-default-1") {
      alert(
        "❌ บัญชีผู้ใช้นี้เป็นผู้ใช้งานจำลองหลักเริ่มต้นของวิชาการ ไม่ฝังตัวให้ลบเด็ดขาด",
      );
      return;
    }

    setTeacherToDelete(teacherId);
  };

  const handleUpdateTeacher = async (teacherId: string, updates: Partial<Teacher>) => {
    if (!currentTeacher) return;
    if (currentTeacher.role !== "admin") {
      alert("🔒 เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถแก้ไขบัญชีผู้ใช้ได้");
      return;
    }

    try {
      await updateDoc(doc(db, "teachers", teacherId), updates as any);
      window.dispatchEvent(
        new CustomEvent("app-custom-toast", {
          detail: {
            message: "อัปเดตข้อมูลผู้ใช้เรียบร้อยแล้ว",
            type: "success",
            title: "บันทึกสำเร็จ",
          },
        }),
      );
    } catch (err: any) {
      console.error("Error updating teacher:", err);
      alert(`อัปเดตข้อมูลผู้ใช้ไม่สำเร็จ: ${err.message}`);
    }
  };

  // Export records JSON backup
  const handleExportBackup = () => {
    const backupStr = JSON.stringify(records, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(backupStr);
    const exportFileDefaultName = `LessonLog_Backup_${new Date().toISOString().slice(0, 10)}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  // Export records as CSV for MS Excel / Google Sheets (UTF-8 BOM supported)
  const handleExportCSV = () => {
    // CSV headers
    const headers = [
      "ลำดับ",
      "วันที่สอน_บันทึก",
      "ระดับชั้น",
      "วิชา",
      "สาระการจัดกิจกรรมการเรียนรู้",
      "กิจกรรมการสอน_กระบวนการ",
      "ข้อจำกัด_ปัญหาการสอน",
      "ข้อเสนอแนะ_แนวทางแก้ไข",
      "ครูผู้สอนต้องการลงนาม",
      "หัวหน้าวิชาการอนุมัติ",
      "ชื่อหัวหน้าผู้อนุมัติ",
      "วันที่หัวหน้าอนุมัติ",
    ];

    const rows = records.map((rec, index) => {
      const escape = (val: string | undefined | null) => {
        if (!val) return '""';
        return `"${val.replace(/"/g, '""')}"`;
      };

      const subj = rec.customSubject
        ? `${rec.subject} (${rec.customSubject})`
        : rec.subject;

      return [
        index + 1,
        rec.date,
        escape(rec.gradeLevel),
        escape(subj),
        escape(rec.content),
        escape(rec.activities),
        escape(rec.limitations),
        escape(rec.suggestions),
        rec.teacherSigned ? "ลงนามแล้ว" : "ยังไม่ได้ลงนาม",
        rec.deptHeadApproved ? "อนุมัติแล้ว" : "ยังไม่อนุมัติ",
        escape(rec.deptHeadName || ""),
        rec.deptHeadDate ? rec.deptHeadDate : "",
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    // Using BOM to prevent Thai characters encoding issue in Excel
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const exportFileDefaultName = `LessonLog_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", url);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    // Clean up
    URL.revokeObjectURL(url);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">
            กำลังเชื่อมต่อฐานข้อมูลความปลอดภัยครู...
          </p>
        </div>
      </div>
    );
  }

  if (!currentTeacher) {
    return <AuthView onLogin={handleLogin} customLogo={customLogo} />;
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
                  <img
                    src={customLogo}
                    alt="School Custom Logo"
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <SchoolLogo className="h-9 w-9 text-sky-500" />
                )}
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm sm:text-base font-black text-slate-800 tracking-tight font-sans">
                    LessonLog <span className="hidden sm:inline">- ระบบสารสนเทศเพื่อการจัดการสถานศึกษา</span>
                  </span>
                  <span className="text-[8px] bg-pink-50 text-pink-600 px-1 py-0.5 rounded font-black border border-pink-100 font-mono scale-90">
                    SMBS
                  </span>
                </div>
                <div className="hidden sm:flex flex-col mt-0.5 items-start">
                  <span className="text-[11px] font-bold text-slate-500">
                    โรงเรียนศิริมงคลศึกษา บางบัวทอง
                  </span>
                  <span className="text-[9px] font-semibold text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded border border-pink-100 uppercase tracking-wider mt-0.5">
                    Sirimongkolsuksa Bangbuathong School
                  </span>
                </div>
                <div className="sm:hidden flex flex-col mt-0.5 items-start">
                  <span className="text-[10px] font-bold text-slate-500 block">
                    ศิริมงคลศึกษา บางบัวทอง
                  </span>
                  <span className="text-[8px] font-semibold text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded border border-pink-100 uppercase tracking-wide block mt-0.5">
                    Sirimongkolsuksa Bangbuathong School
                  </span>
                </div>
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
                  <span className="block text-xs font-bold text-slate-800 leading-none">
                    {currentTeacher.displayName}
                  </span>
                  <span className="block text-[10px] text-slate-400 font-medium mt-0.5">
                    {currentTeacher.employeeId}
                  </span>
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
        {/* Module Selector */}
        <div className="grid grid-cols-2 lg:flex lg:flex-wrap bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 print:hidden gap-1.5">
          <button
            onClick={() => setActiveModule("home")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all lg:min-w-[200px] flex-1 ${
              activeModule === "home"
                ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            <LayoutDashboard className="h-4.5 w-4.5 shrink-0" />
            <div className="flex flex-col items-center sm:items-start leading-tight">
              <span className="whitespace-nowrap">หน้าแรก</span>
              <span className="text-xs font-semibold opacity-90">(Overview)</span>
            </div>
          </button>

          <button
            onClick={() => setActiveModule("teaching")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all lg:min-w-[200px] flex-1 ${
              activeModule === "teaching"
                ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            <Presentation className="h-4.5 w-4.5 shrink-0" />
            <div className="flex flex-col items-center sm:items-start leading-tight">
              <span className="whitespace-nowrap">1. การจัดการผู้สอน</span>
              <span className="text-xs font-semibold opacity-90">(LessonTeach)</span>
            </div>
          </button>

          <button
            onClick={() => setActiveModule("classroom")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all lg:min-w-[200px] flex-1 ${
              activeModule === "classroom"
                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            <Users className="h-4.5 w-4.5 shrink-0" />
            <div className="flex flex-col items-center sm:items-start leading-tight">
              <span className="whitespace-nowrap">2. การจัดการชั้นเรียน</span>
              <span className="text-xs font-semibold opacity-90">(LessonClass)</span>
            </div>
          </button>

          <button
            onClick={() => setActiveModule("analytics")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all lg:min-w-[200px] flex-1 ${
              activeModule === "analytics"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            <BarChart3 className="h-4.5 w-4.5 shrink-0" />
            <div className="flex flex-col items-center sm:items-start leading-tight">
              <span className="whitespace-nowrap">3. การวัดและประเมินผลผู้เรียน</span>
              <span className="text-xs font-semibold opacity-90">(LessonAchieve)</span>
            </div>
          </button>

          <button
            onClick={() => setActiveModule("academic")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all lg:min-w-[200px] flex-1 ${
              activeModule === "academic"
                ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            <BookOpen className="h-4.5 w-4.5 shrink-0" />
            <div className="flex flex-col items-center sm:items-start leading-tight">
              <span className="whitespace-nowrap">4. การบริหารงานวิชาการ</span>
              <span className="text-xs font-semibold opacity-90">(LessonAcad)</span>
            </div>
          </button>

          <button
            onClick={() => setActiveModule("discipline")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all lg:min-w-[200px] flex-1 ${
              activeModule === "discipline"
                ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
            <div className="flex flex-col items-center sm:items-start leading-tight">
              <span className="whitespace-nowrap">5. การบริหารงานปกครอง</span>
              <span className="text-xs font-semibold opacity-90">(LessonDiscipline)</span>
            </div>
          </button>
          
          {currentTeacher.role === "admin" && (
            <button
              onClick={() => setActiveModule("admin" as any)}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all lg:min-w-[200px] flex-1 ${
                activeModule === ("admin" as any)
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <ShieldCheck className="h-4.5 w-4.5 shrink-0" />
            <div className="flex flex-col items-center sm:items-start leading-tight">
              <span className="whitespace-nowrap">การจัดการระบบผู้ใช้งาน</span>
              <span className="text-xs font-semibold opacity-90">(Admin)</span>
            </div>
            </button>
          )}
        </div>

        {/* Welcome Card & Info */}
        <div className="bg-gradient-to-r from-sky-50/60 via-white to-pink-50/60 rounded-2xl border-l-4 border-l-sky-450 border-y border-r border-sky-100/50 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xs print:hidden">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-sky-500/10 to-pink-500/10 border border-sky-200/55 rounded-full text-slate-700 shadow-3xs max-w-full overflow-hidden">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse shrink-0"></span>
              <span className="text-xs sm:text-base font-black tracking-wide text-indigo-950 font-sans truncate">
                LessonLog <span className="hidden sm:inline">- ระบบสารสนเทศเพื่อการจัดการสถานศึกษา</span>
              </span>
            </div>
            <h2 className="text-xs sm:text-sm font-extrabold text-slate-750 flex items-center gap-2">
              <span className="animate-wiggle text-sm">👋</span> สวัสดีครับ/ค่ะ,{" "}
              {currentTeacher.displayName}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 font-semibold">
              ยินดีต้อนรับเข้าสู่ระบบจัดการข้อมูลการสอนและชั้นเรียน สถานะของคุณครูคือ{" "}
              <b className="text-sky-700">{currentTeacher.affiliation}</b>
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
              <span>{showFormOnMobile ? "ปิดฟอร์ม" : "เขียนบันทึกใหม่"}</span>
            </button>
          </div>
        </div>

        {activeModule === "home" ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Hero Banner */}
            <div className="bg-white rounded-2xl border border-violet-100 p-8 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400"></div>
              <div className="h-16 w-16 bg-violet-50 text-violet-500 rounded-full flex items-center justify-center mb-4">
                <LayoutDashboard className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">
                ภาพรวมระบบ LessonLog - ระบบสารสนเทศเพื่อการจัดการสถานศึกษา
              </h2>
              <p className="text-slate-500 text-sm max-w-lg mx-auto">
                ยินดีต้อนรับเข้าสู่ระบบจัดการข้อมูลการสอนและชั้นเรียน
                ข้อมูลสรุปสถิติภาพรวมทั้งหมด
              </p>
            </div>

            <DashboardStats records={records} currentTeacher={currentTeacher} teachers={teachers} systemSemester={systemSemester} systemAcademicYear={systemAcademicYear} />
            
            {/* School Event Calendar in Overview */}
            <OverviewCalendar currentTeacher={currentTeacher} systemSemester={systemSemester} systemAcademicYear={systemAcademicYear} onNavigateToCalendar={() => setActiveModule("academic")} />

            {/* Quick Stats Cards (Mockup) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
                  <Presentation className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-500">
                    แผนการสอนทั้งหมด
                  </div>
                  <div className="text-2xl font-black text-slate-800">
                    {plans.length || 0}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowStudentStatsModal(true)}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md hover:border-pink-200 transition-all text-left text-inherit cursor-pointer"
              >
                <div className="h-12 w-12 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center shrink-0">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-500">
                    นักเรียนทั้งหมด
                  </div>
                  <div className="text-2xl font-black text-slate-800">
                    {studentsCount.toLocaleString()}
                  </div>
                </div>
              </button>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-500">
                    สถิติเข้าเรียนวันนี้
                  </div>
                  <div className="text-2xl font-black text-slate-800">95%</div>
                </div>
              </div>
              <button 
                onClick={() => setShowTeacherListModal(true)}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md hover:border-amber-200 transition-all text-left text-inherit cursor-pointer"
              >
                <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                  <School className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-500">
                    ครูผู้สอน (ระบบ)
                  </div>
                  <div className="text-2xl font-black text-slate-800">
                    {teachers.length || 0}
                  </div>
                </div>
              </button>
            </div>

            {/* Quick Actions / Modules Navigation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveModule("teaching")}
                className="bg-white p-8 rounded-2xl border border-violet-100 shadow-sm hover:shadow-md hover:border-violet-300 hover:-translate-y-1 transition-all text-left flex flex-col items-center text-center group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-violet-50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="h-16 w-16 bg-violet-50 text-violet-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Presentation className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-2 leading-tight flex flex-col gap-0.5">
                  <span className="whitespace-nowrap">1. การจัดการผู้สอน</span>
                  <span className="text-base text-slate-500 font-black">(LessonTeach)</span>
                </h3>
                <p className="text-sm text-slate-500">
                  บันทึกแผนการสอนรายวันและดูข้อมูลประวัติการสอน
                </p>
                <div className="mt-4 px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 text-xs font-bold rounded-full flex items-center gap-1">
                  <Wrench className="h-3 w-3" /> ปิดปรับปรุงฟังก์ชัน
                </div>
              </button>

              <button
                onClick={() => setActiveModule("classroom")}
                className="bg-white p-8 rounded-2xl border border-pink-100 shadow-sm hover:shadow-md hover:border-pink-300 hover:-translate-y-1 transition-all text-left flex flex-col items-center text-center group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-pink-50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="h-16 w-16 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-2 leading-tight flex flex-col gap-0.5">
                  <span className="whitespace-nowrap">2. การจัดการชั้นเรียน</span>
                  <span className="text-base text-slate-500 font-black">(LessonClass)</span>
                </h3>
                <p className="text-sm text-slate-500">
                  จัดการข้อมูลนักเรียน เช็กชื่อ และบันทึกพฤติกรรม
                </p>
                <div className="mt-4 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                  เปิดใช้งาน
                </div>
              </button>

              <button
                onClick={() => setActiveModule("analytics")}
                className="bg-white p-8 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md hover:border-emerald-300 hover:-translate-y-1 transition-all text-left flex flex-col items-center text-center group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="h-16 w-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-2 leading-tight flex flex-col gap-0.5">
                  <span className="whitespace-nowrap text-base sm:text-lg">3. การวัดและประเมินผลผู้เรียน</span>
                  <span className="text-base text-slate-500 font-black">(LessonAchieve)</span>
                </h3>
                <p className="text-sm text-slate-500">
                  รายงานผลสัมฤทธิ์และสถิติภาพรวมของผู้เรียน
                </p>
                <div className="mt-4 px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 text-xs font-bold rounded-full flex items-center gap-1">
                  <Wrench className="h-3 w-3" /> ปิดปรับปรุงฟังก์ชัน
                </div>
              </button>

              <button
                onClick={() => setActiveModule("academic")}
                className="bg-white p-8 rounded-2xl border border-indigo-100 shadow-sm hover:shadow-md hover:border-indigo-300 hover:-translate-y-1 transition-all text-left flex flex-col items-center text-center group relative overflow-hidden cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="h-16 w-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-indigo-500">
                  <BookOpen className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-2 leading-tight flex flex-col gap-0.5">
                  <span className="whitespace-nowrap">4. การบริหารงานวิชาการ</span>
                  <span className="text-base text-slate-500 font-black">(LessonAcad)</span>
                </h3>
                <p className="text-sm text-slate-500">
                  ดูตารางสอน ปฏิทินกิจกรรม และการตั้งค่าวิชาการ
                </p>
                <div className="mt-4 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full flex items-center gap-1">
                  เปิดใช้งาน
                </div>
              </button>

              <button
                onClick={() => setActiveModule("discipline")}
                className="bg-white p-8 rounded-2xl border border-rose-100 shadow-sm hover:shadow-md hover:border-rose-300 hover:-translate-y-1 transition-all text-left flex flex-col items-center text-center group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="h-16 w-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ShieldAlert className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-2 leading-tight flex flex-col gap-0.5">
                  <span className="whitespace-nowrap">5. การบริหารงานปกครอง</span>
                  <span className="text-base text-slate-500 font-black">(LessonDiscipline)</span>
                </h3>
                <p className="text-sm text-slate-500">
                  บันทึกเหตุการณ์ ทะเลาะวิวาท อุบัติเหตุ และความประพฤติ
                </p>
                <div className="mt-4 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                  เปิดใช้งาน
                </div>
              </button>
              {currentTeacher.role === "admin" && (
                <button
                  onClick={() => setActiveModule("admin" as any)}
                  className="bg-white p-8 rounded-2xl border border-amber-100 shadow-sm hover:shadow-md hover:border-amber-300 hover:-translate-y-1 transition-all text-left flex flex-col items-center text-center group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="h-16 w-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-black text-slate-800 mb-2 leading-tight flex flex-col gap-0.5">
                  <span className="whitespace-nowrap">การจัดการระบบผู้ใช้งาน</span>
                  <span className="text-base text-slate-500 font-black">(Admin)</span>
                </h3>
                  <p className="text-sm text-slate-500">
                    จัดการบัญชีผู้ใช้งาน สิทธิ์การเข้าถึง และข้อมูลของโรงเรียน
                  </p>
                  <div className="mt-4 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                    เปิดใช้งานเฉพาะ Admin
                  </div>
                </button>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-base font-black text-slate-800 mb-6 flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-500" />
                ความเคลื่อนไหวล่าสุด
              </h3>
              <div className="space-y-4">
                {(() => {
                  // Combine plans and records
                  const activities: Array<{
                    id: string;
                    teacherId: string;
                    action: string;
                    subject: string;
                    timestamp: number;
                    color: string;
                  }> = [];

                  records.forEach(r => {
                    activities.push({
                      id: `r-${r.id}`,
                      teacherId: r.teacherId,
                      action: "เพิ่ม/แก้ไขบันทึกหลังสอน",
                      subject: `${r.subject === 'อื่นๆ' && r.customSubject ? r.customSubject : r.subject} ${r.gradeLevel}`,
                      timestamp: new Date(r.updatedAt || r.createdAt).getTime(),
                      color: "bg-pink-400"
                    });
                  });

                  plans.forEach(p => {
                    activities.push({
                      id: `p-${p.id}`,
                      teacherId: p.teacherId,
                      action: "เพิ่ม/แก้ไขแผนการสอน",
                      subject: `${p.subject === 'อื่นๆ' && p.customSubject ? p.customSubject : p.subject} ${p.gradeLevel}`,
                      timestamp: new Date(p.updatedAt || p.createdAt).getTime(),
                      color: "bg-emerald-400"
                    });
                  });

                  // Sort by timestamp desc and take top 5
                  activities.sort((a, b) => b.timestamp - a.timestamp);
                  const topActivities = activities.slice(0, 5);
                  
                  if (topActivities.length === 0) {
                     return <div className="text-sm text-slate-500 text-center py-4">ยังไม่มีความเคลื่อนไหว</div>;
                  }

                  const formatTimeAgo = (timestamp: number) => {
                    const diffInSeconds = Math.floor((Date.now() - timestamp) / 1000);
                    if (diffInSeconds < 60) return "เมื่อสักครู่";
                    const diffInMinutes = Math.floor(diffInSeconds / 60);
                    if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่แล้ว`;
                    const diffInHours = Math.floor(diffInMinutes / 60);
                    if (diffInHours < 24) return `${diffInHours} ชั่วโมงที่แล้ว`;
                    const diffInDays = Math.floor(diffInHours / 24);
                    if (diffInDays < 30) return `${diffInDays} วันที่แล้ว`;
                    return formatThaiDate(new Date(timestamp).toISOString());
                  };

                  return topActivities.map((item, i) => {
                    const teacher = teachers.find(t => t.id === item.teacherId);
                    const teacherName = teacher ? teacher.thaiName : "ไม่ทราบชื่อ";
                    const isMe = currentTeacher?.id === item.teacherId;
                    const displayName = isMe ? "คุณ" : teacherName;
                    
                    return (
                      <div
                        key={item.id}
                        className="flex gap-4 items-start pb-4 border-b border-slate-50 last:border-0 last:pb-0"
                      >
                        <div
                          className={`h-2.5 w-2.5 rounded-full ${item.color} mt-1.5 shadow-sm`}
                        ></div>
                        <div>
                          <div className="text-sm font-bold text-slate-700">
                            {displayName}{" "}
                            <span className="font-normal text-slate-500">
                              ได้ทำการ
                            </span>{" "}
                            {item.action}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {item.subject} • {formatTimeAgo(item.timestamp)}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Admin Monitoring Dashboard */}
            {(currentTeacher.role === "admin" || currentTeacher.role === "academic" || currentTeacher.role === "deputy") && (
              <AdminMonitoringDashboard records={records} plans={plans} teachers={teachers} />
            )}
          </div>
        ) : activeModule === "teaching" ? (
          <div className="space-y-6 animate-in fade-in duration-300 relative">
            {/* Maintenance Overlay */}
            {currentTeacher.role !== "admin" && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center rounded-2xl min-h-[60vh]">
                <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center text-center max-w-sm border border-slate-100 animate-in zoom-in-95 duration-300">
                  <div className="h-16 w-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4">
                    <Wrench className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-black text-slate-800">
                    ปิดปรับปรุงชั่วคราว
                  </h3>
                  <p className="text-slate-500 mt-2 text-sm font-medium">
                    โมดูลการจัดการผู้สอนกำลังอยู่ระหว่างการพัฒนาและปรับปรุงระบบ
                    ขออภัยในความไม่สะดวก
                  </p>
                  <button
                    onClick={() => setActiveModule("home")}
                    className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-bold shadow-sm transition-colors"
                  >
                    กลับสู่หน้าหลัก
                  </button>
                </div>
              </div>
            )}

            <div className={currentTeacher.role !== "admin" ? "opacity-40 pointer-events-none space-y-6" : "space-y-6"}>
              {/* Module Header with attractive display */}
              <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4 text-white relative overflow-hidden print:hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-violet-300 opacity-20 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl"></div>
                
                <div className="flex items-center gap-5 relative z-10">
                  <div className="h-16 w-16 bg-white/20 backdrop-blur-md text-white rounded-2xl flex items-center justify-center shadow-inner border border-white/30">
                    <Presentation className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight drop-shadow-sm">
                      1. การจัดการผู้สอน (LessonTeach)
                    </h2>
                    <p className="text-violet-100 font-medium mt-1">
                      บันทึกแผนการสอนรายวันและดูข้อมูลประวัติการสอน
                    </p>
                  </div>
                </div>
              </div>

              {/* Header and Tabs */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 print:hidden">
                <div className="flex flex-wrap bg-slate-50 p-1.5 rounded-xl w-full lg:w-auto overflow-x-auto custom-scrollbar gap-1 border border-slate-100">
                  <button
                    onClick={() => setActiveTab("form")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                      activeTab === "form"
                        ? "bg-white text-purple-700 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-500 hover:text-purple-700 hover:bg-purple-50"
                    }`}
                  >
                    <PenLine className="h-4 w-4" />
                    บันทึกหลังสอน
                  </button>
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                      activeTab === "dashboard"
                        ? "bg-white text-purple-700 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-500 hover:text-purple-700 hover:bg-purple-50"
                    }`}
                  >
                    <List className="h-4 w-4" />
                    หน้ารายการสอน
                  </button>
                  <button
                    onClick={() => setActiveTab("plan-form")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                      activeTab === "plan-form"
                        ? "bg-white text-purple-700 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-500 hover:text-purple-700 hover:bg-purple-50"
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    สร้างแผนการสอน
                  </button>
                  <button
                    onClick={() => setActiveTab("plan-list")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                      activeTab === "plan-list"
                        ? "bg-white text-purple-700 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-500 hover:text-purple-700 hover:bg-purple-50"
                    }`}
                  >
                    <History className="h-4 w-4" />
                    คลังแผนการสอน
                  </button>
                </div>
              </div>

              {/* Content area */}
              {activeTab === "form" && (
                <LessonLogForm
                  teacherId={currentTeacher.id}
                  onSave={handleSaveRecord}
                  initialRecord={editingRecord}
                  onCancel={
                    editingRecord ? () => setEditingRecord(null) : undefined
                  }
                  systemAcademicYear={systemAcademicYear}
                  systemSemester={systemSemester}
                />
              )}

              {activeTab === "dashboard" && (
                <LessonLogList
                  records={records}
                  teachers={teachers}
                  showTeacherFilter={
                    currentTeacher.role === "admin" ||
                    currentTeacher.role === "academic" ||
                    currentTeacher.role === "deputy"
                  }
                  currentUserRole={currentTeacher.role}
                  currentTeacherId={currentTeacher.id}
                  onEdit={(r) => {
                    setEditingRecord(r);
                    setActiveTab("form");
                  }}
                  onDelete={handleDeleteRecord}
                  onPrintPreview={(r) => setActivePrintPreview(r)}
                />
              )}

              {activeTab === "plan-form" && (
                <LessonPlanForm
                  teacherId={currentTeacher.id}
                  onSave={handleSavePlan}
                  initialPlan={editingPlan}
                  onCancel={
                    editingPlan ? () => setEditingPlan(null) : undefined
                  }
                  currentUserRole={currentTeacher.role}
                  systemAcademicYear={systemAcademicYear}
                  systemSemester={systemSemester}
                />
              )}

              {activeTab === "plan-list" && (
                <LessonPlanList
                  plans={plans}
                  teachers={teachers}
                  showTeacherFilter={
                    currentTeacher.role === "admin" ||
                    currentTeacher.role === "academic" ||
                    currentTeacher.role === "deputy"
                  }
                  currentUserRole={currentTeacher.role}
                  currentTeacherId={currentTeacher.id}
                  onEdit={(p) => {
                    setEditingPlan(p);
                    setActiveTab("plan-form");
                  }}
                  onDelete={handleDeletePlan}
                  onPrintPreview={(p) => setActivePlanPrintPreview(p)}
                />
              )}
            </div>
          </div>
        ) : activeModule === "classroom" ? (
          <ClassroomModule
            currentTeacher={currentTeacher}
            systemAcademicYear={systemAcademicYear}
            systemSemester={systemSemester}
            teachers={teachers}
          />
        ) : activeModule === "academic" ? (
          <div className="relative animate-in fade-in duration-300">
            <AcademicModule
              currentTeacher={currentTeacher}
              systemAcademicYear={systemAcademicYear}
              systemSemester={systemSemester}
            />
          </div>
        ) : activeModule === "analytics" ? (
          <div className="relative animate-in fade-in duration-300">
            {(currentTeacher.role === 'teacher' || currentTeacher.role === 'academic') && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center rounded-2xl min-h-[60vh]">
                <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center text-center max-w-sm border border-slate-100 animate-in zoom-in-95 duration-300">
                  <div className="h-16 w-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4">
                    <Wrench className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-black text-slate-800">
                    ปิดปรับปรุงชั่วคราว
                  </h3>
                  <p className="text-slate-500 mt-2 text-sm font-medium">
                    โมดูลการวัดและประเมินผลผู้เรียนกำลังอยู่ระหว่างการพัฒนาและปรับปรุงระบบ ขออภัยในความไม่สะดวก
                  </p>
                  <button
                    onClick={() => setActiveModule("home")}
                    className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-bold shadow-sm transition-colors"
                  >
                    กลับสู่หน้าหลัก
                  </button>
                </div>
              </div>
            )}
            <EvaluationModule 
              systemAcademicYear={systemAcademicYear}
              systemSemester={systemSemester}
              students={students}
            />
          </div>
        ) : activeModule === "admin" ? (
          <UserManagementModule
            teachers={teachers}
            records={records}
            currentTeacher={currentTeacher}
            onDeleteTeacher={handleDeleteTeacher}
            onUpdateTeacher={handleUpdateTeacher}
          />
        ) : activeModule === "discipline" ? (
          <DisciplineModule
            currentTeacher={currentTeacher}
            systemSemester={systemSemester}
            systemAcademicYear={systemAcademicYear}
            students={students}
          />
        ) : null}
      </main>

      {/* 3. Footer branding */}
      <footer className="mt-16 py-8 border-t border-slate-100 bg-white print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <p className="text-xs font-semibold text-slate-400">
            LessonLog - ระบบสารสนเทศเพื่อการจัดการสถานศึกษา
          </p>
          <p className="text-[10px] text-slate-400 font-medium">
            ออกรายงานสรุปและบันทึกผลเพื่อใช้ประกอบการสอนอย่างง่ายดาย
          </p>
        </div>
      </footer>

      {/* 4. Overlay Modals: */}

      {/* 4.1. Print/PDF Template Viewer Overlay Modal */}
      {activePrintPreview && (
        <PrintTemplate
          record={activePrintPreview}
          teacher={
            teachers.find((t) => t.id === activePrintPreview.teacherId) ||
            (currentTeacher?.role === "teacher"
              ? currentTeacher
              : DEFAULT_TEACHER)
          }
          academicHead={
            teachers.find((t) => t.role !== "teacher") ||
            (currentTeacher?.role !== "teacher" ? currentTeacher : null)
          }
          currentUser={currentTeacher}
          customLogo={customLogo}
          allowAcademicSignature={true}
          onUpdateRecord={async (updated) => {
            try {
              let updatedHistory = updated.editHistory || [];
              let lastEditedBy = updated.lastEditedBy;
              let lastEditedAt = updated.lastEditedAt;

              const roleMap: any = {
                teacher: "คุณครูผู้สอน",
                academic: "หัวหน้าฝ่ายวิชาการ",
                deputy: "รองผู้อำนวยการ",
                admin: "ผู้ดูแลระบบ",
                discipline: "หัวหน้างานปกครอง",
              };
              const currentRoleStr = currentTeacher
                ? roleMap[currentTeacher.role || ""] || "ผู้ใช้งาน"
                : "ผู้ใช้งาน";
              const editorNameStr = currentTeacher
                ? `${currentTeacher.thaiName || currentTeacher.displayName} (${currentRoleStr})`
                : "ผู้ใช้งานระบบ";

              lastEditedBy = editorNameStr;
              lastEditedAt = new Date().toISOString();

              updatedHistory = [
                ...updatedHistory,
                {
                  editedBy: editorNameStr,
                  editedAt: lastEditedAt,
                },
              ];

              const dbPayload = {
                ...updated,
                lastEditedBy,
                lastEditedAt,
                editHistory: updatedHistory,
                updatedAt: new Date().toISOString(),
              };

              const cleanDbPayload = Object.fromEntries(
                Object.entries(dbPayload).filter(([_, v]) => v !== undefined),
              );

              await setDoc(
                doc(db, "records", updated.id),
                cleanDbPayload as any,
              );
              setActivePrintPreview(cleanDbPayload as any);
            } catch (err) {
              handleFirestoreError(
                err,
                OperationType.UPDATE,
                `records/${updated.id}`,
              );
            }
          }}
          onClose={() => setActivePrintPreview(null)}
        />
      )}

      {/* 4.1.2 Plan Print/PDF Template Viewer Overlay Modal */}
      {activePlanPrintPreview && (
        <LessonPlanPrintTemplate
          plan={activePlanPrintPreview}
          teacher={
            teachers.find((t) => t.id === activePlanPrintPreview.teacherId) ||
            (currentTeacher?.role === "teacher"
              ? currentTeacher
              : DEFAULT_TEACHER)
          }
          academicHead={
            teachers.find((t) => t.role !== "teacher") ||
            (currentTeacher?.role !== "teacher" ? currentTeacher : null)
          }
          currentUser={currentTeacher}
          onUpdatePlan={(updated: any) => {
            handleSavePlan(updated);
            setActivePlanPrintPreview(updated);
          }}
          onClose={() => setActivePlanPrintPreview(null)}
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
                <p className="text-[10px] text-indigo-100 mt-0.5">
                  ข้อมูลจริงที่ใช้สำหรับแสดงในใบประเมินและไฟล์รายงาน PDF
                  อัตโนมัติ
                </p>
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

              <div className="bg-rose-50 border border-rose-200/65 p-3.5 rounded-xl">
                <label className="block text-xs font-black text-rose-900 mb-1">
                  รหัสผ่านใหม่ (หากไม่ต้องการเปลี่ยน ให้เว้นว่างไว้)
                </label>
                <input
                  type="password"
                  value={pPassword}
                  onChange={(e) => setPPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white"
                  placeholder="รหัสผ่านใหม่ (ขั้นต่ำ 6 ตัวอักษร)"
                />
              </div>

              {currentTeacher?.role === "teacher" && (
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
                    <option value="" disabled>
                      -- เลือกกลุ่มสาระการเรียนรู้ --
                    </option>
                    {SUBJECTS.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
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
                  กำหนดภาพตราสัญลักษณ์ที่จะใช้สำหรับใบรายงาน PDF
                  และแท็บด้านบนของครู สามารถกดจับภาพจากกล้องถ่ายรูปได้โดยตรง
                  หรืออัปโหลดไฟล์
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
                  <div className="h-16 w-16 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-150 overflow-hidden relative group shrink-0 shadow-inner">
                    {customLogo ? (
                      <>
                        <img
                          src={customLogo}
                          alt="Custom school logo"
                          className="h-full w-full object-contain p-1"
                        />
                        <span className="absolute bottom-0 inset-x-0 bg-indigo-900/90 text-white text-[8px] text-center font-bold py-0.5 pointer-events-none scale-90">
                          ตรากำหนดเอง
                        </span>
                      </>
                    ) : (
                      <>
                        <SchoolLogo className="h-12 w-12" />
                        <span className="absolute bottom-0 inset-x-0 bg-pink-600/90 text-white text-[8px] text-center font-black py-0.5 pointer-events-none scale-90">
                          ตราเริ่มต้น
                        </span>
                      </>
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1 w-full text-left">
                    {currentTeacher?.role === "admin" ? (
                      <>
                        <span className="text-[10px] font-bold text-slate-500 block">
                          ตัวเลือกปรับเปลี่ยนตราสัญลักษณ์:
                        </span>
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
                        ⚠️{" "}
                        <strong>
                          เฉพาะผู้ดูแลระบบ (Administrator) เท่านั้น
                        </strong>{" "}
                        ที่มีสิทธิ์แก้ไขสัญลักษณ์/ตราสัญลักษณ์โรงเรียนได้
                        (ของบัญชีคุณครูและฝ่ายวิชาการจะเป็นสถานะอ่านอย่างเดียว)
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ปรับแต่งปีการศึกษา (Academic Year Setup Panel) */}
              <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl space-y-3">
                <span className="text-[11px] font-black text-slate-700 flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-blue-600" />
                  กำหนดภาคเรียนและปีการศึกษาปัจจุบัน (Academic Year)
                </span>
                <p className="text-[10px] text-slate-500 leading-normal">
                  กำหนดภาคเรียนและปีการศึกษาสำหรับระบบ
                  ซึ่งจะถูกนำไปใช้เป็นค่าเริ่มต้นในเอกสารรายงาน และแบบฟอร์มต่างๆ
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
                  <div className="space-y-1.5 flex-1 w-full text-left">
                    {currentTeacher?.role === "admin" ? (
                      <div className="flex gap-2">
                        <select
                          value={systemSemester}
                          onChange={(e) => setSystemSemester(e.target.value)}
                          className="px-3 py-2 text-sm font-bold text-center rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                        >
                          <option value="1">ภาคเรียนที่ 1</option>
                          <option value="2">ภาคเรียนที่ 2</option>
                        </select>
                        <input
                          type="text"
                          value={systemAcademicYear}
                          onChange={(e) =>
                            setSystemAcademicYear(e.target.value)
                          }
                          className="px-3 py-2 text-sm font-bold text-center rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateAcademicYear(
                              systemAcademicYear,
                              systemSemester,
                            )
                          }
                          className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2 rounded-lg transition"
                        >
                          บันทึกข้อมูล
                        </button>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-amber-50/60 border border-amber-100 rounded-lg text-amber-800 text-[10.5px] leading-relaxed select-none">
                        ⚠️{" "}
                        <strong>
                          เฉพาะผู้ดูแลระบบ (Administrator) เท่านั้น
                        </strong>{" "}
                        ที่มีสิทธิ์แก้ไขภาคเรียนและปีการศึกษา
                        <div className="mt-1 font-bold text-slate-700">
                          ปีการศึกษาปัจจุบัน: ภาคเรียนที่ {systemSemester}/
                          {systemAcademicYear}
                        </div>
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
                เพื่อความกึ่งกลางและภาพออกมาสวยงาม
                โปรดปรับตราสัญลักษณ์ให้อยู่ในกรอบเป้าเล็ง
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
                  <p className="text-[10px] text-rose-400 font-bold text-center leading-normal">
                    {cameraError}
                  </p>
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
      <div
        id="toast-container"
        className="fixed bottom-5 right-5 z-55 flex flex-col gap-3 pointer-events-none max-w-sm w-full font-sans print:hidden"
      >
        <AnimatePresence>
          {toasts.map((toast) => {
            const colors = {
              success: {
                bg: "bg-emerald-50 border-emerald-200 text-emerald-800",
                iconBg: "bg-emerald-500 text-white",
                progressBg: "bg-emerald-500",
              },
              info: {
                bg: "bg-sky-50 border-sky-200 text-sky-800",
                iconBg: "bg-sky-500 text-white",
                progressBg: "bg-sky-500",
              },
              warning: {
                bg: "bg-amber-50 border-amber-200 text-amber-800",
                iconBg: "bg-amber-500 text-white",
                progressBg: "bg-amber-500",
              },
              error: {
                bg: "bg-rose-50 border-rose-200 text-rose-800",
                iconBg: "bg-rose-500 text-white",
                progressBg: "bg-rose-500",
              },
            }[toast.type];

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.85,
                  transition: { duration: 0.15 },
                }}
                layout
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-lg backdrop-blur-md ${colors.bg} relative overflow-hidden`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 ${colors.iconBg} flex items-center justify-center`}
                >
                  <Bell className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <h4 className="text-xs font-black tracking-tight">
                    {toast.title}
                  </h4>
                  <p className="text-[11px] font-semibold mt-0.5 leading-normal opacity-90">
                    {toast.message}
                  </p>
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
                  initial={{ width: "100%" }}
                  animate={{ width: 0 }}
                  transition={{ duration: 5, ease: "linear" }}
                  className={`absolute bottom-0 left-0 h-1 ${colors.progressBg}`}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Delete Teacher Confirmation Modal */}
      {teacherToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="font-black text-slate-800 text-lg mb-2">
              ยืนยันการลบบัญชีผู้ใช้
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              คุณต้องการลบบัญชีผู้ใช้งานนี้ใช่หรือไม่?
              <br />
              ข้อมูลที่เกี่ยวข้องจะถูกลบอย่างถาวร
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setTeacherToDelete(null)}
                className="flex-1 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmDeleteTeacher}
                className="flex-1 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                ลบข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Stats Modal */}
      <StudentStatsModal
        isOpen={showStudentStatsModal}
        onClose={() => setShowStudentStatsModal(false)}
        students={students}
      />
      <TeacherListModal
        isOpen={showTeacherListModal}
        onClose={() => setShowTeacherListModal(false)}
        teachers={teachers}
      />
    </div>
  );
}
