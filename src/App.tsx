import React, { useState, useEffect } from "react";
import {
Teacher, LessonRecord, LessonPlan, SUBJECTS, Student, AppNotification } from "./types";
import { MOCK_RECORDS, DEFAULT_TEACHER } from "./data";
import { AuthView } from "./components/AuthView";
import { DashboardStats } from "./components/DashboardStats";
import { TodayAttendanceWidget } from "./components/TodayAttendanceWidget";
import { StudentStatsModal } from "./components/StudentStatsModal";
import { TeacherListModal } from "./components/TeacherListModal";
import { LessonLogList } from "./components/LessonLogList";
import { PBLLessonPlanForm } from "./components/PBLLessonPlanForm";
import { PBLLessonLogForm } from "./components/PBLLessonLogForm";
import { StaffProfileModule } from "./components/StaffProfileModule";
import { LessonPlanList } from "./components/LessonPlanList";
import { ClassroomModule } from "./components/ClassroomModule";
import { EvaluationModule } from "./components/EvaluationModule";
import { UserManagementModule } from "./components/UserManagementModule";
import { SARMonitoringDashboard } from "./components/SARMonitoringDashboard";
import { PrintTemplate, SchoolLogo } from "./components/PrintTemplate";
import { LessonPlanPrintTemplate } from "./components/LessonPlanPrintTemplate";
import { AdminMonitoringDashboard } from "./components/AdminMonitoringDashboard";
import { SchoolEventCalendar } from "./components/SchoolEventCalendar";
import { OverviewCalendar } from "./components/OverviewCalendar";
import { AcademicModule } from "./components/AcademicModule";
import { DailyNotificationPopup } from "./components/DailyNotificationPopup";
import { StudentEvaluationModal } from "./components/StudentEvaluationModal";
import { OnlineUsersIndicator } from "./components/OnlineUsersIndicator";
import { DisciplineModule } from "./components/DisciplineModule";
import { LessonAdmitModule } from './components/LessonAdmitModule';
import { BadgeAwardModal } from './components/BadgeAwardModal';

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
  UserPlus,
  Medal
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { auth, db, storage, handleFirestoreError, OperationType } from "./lib/firebase";
import { onAuthStateChanged, signOut, updatePassword } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { formatThaiDate } from './lib/dateUtils';
import {
  collection,
  query,
  where,
  or,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
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
  const [showBadgeModal, setShowBadgeModal] = useState<boolean>(false);
  const [showTeacherListModal, setShowTeacherListModal] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [activeModule, setActiveModule] = useState<
    "home" | "teaching" | "classroom" | "academic" | "analytics" | "admin" | "discipline" | "admission" | "sar"
  >("home");
  
  const [evalInitialTab, setEvalInitialTab] = useState<'overview' | 'grades' | 'kindergarten' | 'attendance' | 'learning_hours' | 'character' | undefined>(undefined);
  const [evalInitialSubject, setEvalInitialSubject] = useState<string | undefined>(undefined);
  const [evalInitialGrade, setEvalInitialGrade] = useState<string | undefined>(undefined);

  const [activeTab, setActiveTab] = useState<
    "dashboard" | "plan-list" | "pbl-plan-form" | "pbl-log-form"
  >("pbl-log-form");
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
  const [evaluatingModalRecord, setEvaluatingModalRecord] = useState<LessonRecord | null>(null);
  const [preloadedPlanForLog, setPreloadedPlanForLog] = useState<LessonPlan | null>(null);
  const [editingPlan, setEditingPlan] = useState<LessonPlan | null>(null);
  const [activePrintPreview, setActivePrintPreview] =
    useState<LessonRecord | null>(null);
  const [activePlanPrintPreview, setActivePlanPrintPreview] =
    useState<LessonPlan | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEPortfolioModal, setShowEPortfolioModal] = useState(false);

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
                
                // Update lastActiveAt on login/load
                t.lastActiveAt = new Date().toISOString();
                updateDoc(profileRef, { lastActiveAt: t.lastActiveAt }).catch(console.error);
                
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

    
    let unsubNotifications = () => {};
    if (currentTeacher) {
      const qNotif = query(
        collection(db, "notifications"),
        where("userId", "==", currentTeacher.id)
      );
      unsubNotifications = onSnapshot(qNotif, (snapshot) => {
        const fetchedNotifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification));
        // Sort by createdAt descending
        fetchedNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setNotifications(fetchedNotifs);
      });
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
            data.gradeLevel = data.gradeLevel.replace(/\s*\(ป\..*\)/g, '').trim();
          }
          fetchedRecords.push({ ...data, id: doc.id });
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

    let unsubPlans: (() => void) | undefined;
    let unsubPlansCo: (() => void) | undefined;

    const canReadAll = ['admin', 'academic', 'deputy'].includes(currentTeacher.role || '');

    const handlePlansSnapshot = (snapshot: any, source: 'main' | 'co') => {
      setPlans(prevPlans => {
        const newPlansMap = new Map(prevPlans.map(p => [p.id, p]));
        
        snapshot.docChanges().forEach((change: any) => {
          if (change.type === 'removed') {
            newPlansMap.delete(change.doc.id);
          } else {
            const data = change.doc.data() as LessonPlan;
            if (data.gradeLevel) {
              data.gradeLevel = data.gradeLevel.replace(/\s*\(ป\..*\)/g, '').trim();
            }
            // Always use change.doc.id to guarantee a valid ID, overriding any missing internal id
            const planWithId = { ...data, id: change.doc.id };
            newPlansMap.set(change.doc.id, planWithId);
          }
        });

        const fetchedPlans = Array.from(newPlansMap.values());
        fetchedPlans.sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));
        return fetchedPlans;
      });
    };

    if (canReadAll) {
      // For admins, just clear state before first load if needed, but docChanges handles it mostly.
      // Wait, docChanges might be tricky if we don't clear. Let's just do a full map rebuild on every snapshot for simplicity if it's admin.
      unsubPlans = onSnapshot(
        collection(db, "lessonPlans"),
        (snapshot) => {
          const fetchedPlans: LessonPlan[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data() as LessonPlan;
            if (data.gradeLevel) {
              data.gradeLevel = data.gradeLevel.replace(/\s*\(ป\..*\)/g, '').trim();
            }
            fetchedPlans.push({ ...data, id: doc.id });
          });
          fetchedPlans.sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));
          setPlans(fetchedPlans);
        },
        (err) => console.error("Plans lookup error (admin):", err)
      );
    } else {
      // Clear plans initially to avoid stale data
      setPlans([]);
      
      unsubPlans = onSnapshot(
        query(collection(db, "lessonPlans"), where("teacherId", "==", currentTeacher.id)),
        (snapshot) => handlePlansSnapshot(snapshot, 'main'),
        (err) => console.error("Plans lookup error (main):", err)
      );

      unsubPlansCo = onSnapshot(
        query(collection(db, "lessonPlans"), where("coTeachers", "array-contains", currentTeacher.id)),
        (snapshot) => handlePlansSnapshot(snapshot, 'co'),
        (err) => console.error("Plans lookup error (co):", err)
      );
    }

    const unsubStudents = onSnapshot(
      collection(db, "students"),
      (snapshot) => {
        const fetchedStudents = snapshot.docs.map((doc) => {
          const data = doc.data() as Student;
          if (data.gradeLevel) {
            data.gradeLevel = data.gradeLevel.replace(/\s*\(ป\..*\)/g, '').trim();
          }
          return { id: doc.id, ...data };
        });
        
        // Filter out graduated, inactive (ย้าย/ลาออก) students for the main App state
        const activeStudents = fetchedStudents.filter(s => s.status === 'active' || !s.status);
        
        setStudentsCount(activeStudents.length);
        setStudents(fetchedStudents); // Pass ALL students to the app, but rely on activeStudents for count
      },
      (err) => {
        console.error("Students lookup error:", err);
      },
    );

    let unsubNotifications = () => {};
    if (currentTeacher) {
      try {
        const qNotif = query(
          collection(db, "notifications"),
          where("userId", "==", currentTeacher.id)
        );
        unsubNotifications = onSnapshot(
          qNotif,
          (snapshot) => {
            const fetchedNotifs = snapshot.docs.map(
              (doc) => ({ id: doc.id, ...doc.data() } as AppNotification)
            );
            fetchedNotifs.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setNotifications(fetchedNotifs);
          },
          (err) => {
            handleFirestoreError(err, OperationType.GET, "notifications");
          }
        );
      } catch (e) {
        console.warn("Could not setup notifications listener", e);
      }
    }

    return () => {
      unsubRecords();
      unsubTeachers();
      if (unsubPlans) unsubPlans();
      if (unsubPlansCo) unsubPlansCo();
      unsubStudents();
      unsubNotifications();
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

  const handleLogin = (teacher: Teacher) => {
    const updated = { ...teacher, lastActiveAt: new Date().toISOString() };
    setCurrentTeacher(updated);
    initProfileStates(updated);
    if (db) {
      updateDoc(doc(db, "teachers", teacher.id), { lastActiveAt: updated.lastActiveAt }).catch(console.error);
    }
  };

  const handleLogout = async () => {
    try {
      if (currentTeacher) {
        try { sessionStorage.removeItem('daily_popup_' + currentTeacher.id); } catch(e) {}
      }
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
          staff: "เจ้าหน้าที่ธุรการ",
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
      const existingPlan = plans.find((p) => p.id === plan.id);
      const isEdit = !!existingPlan;

      const oldCoTeachers = existingPlan?.coTeachers || [];
      const newCoTeachers = plan.coTeachers || [];
      const newlyAdded = newCoTeachers.filter(id => !oldCoTeachers.includes(id));

      const payload = {
        ...plan,
        updatedAt: new Date().toISOString(),
      };

      const cleanPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== undefined),
      );

      
      await setDoc(doc(db, "lessonPlans", plan.id), cleanPayload);
      
      // AUTO-GENERATE GRADEBOOK COLUMNS
      let autoColsToastCount = 0;
      if (plan.structuredEvaluations && plan.structuredEvaluations.length > 0) {
        const autoEvals = plan.structuredEvaluations.filter(e => e.autoGenerateColumn);
        if (autoEvals.length > 0) {
          const sAcadYear = systemAcademicYear || plan.academicYear || "2567";
          const sSem = systemSemester || plan.semester || "1";
          
          const rawGrades = plan.gradeLevel ? plan.gradeLevel.split(',').map(g => g.trim()).filter(Boolean) : ["ประถมศึกษาปีที่ 1"];
          const gradesToProcess = Array.from(new Set(rawGrades));

          for (const grade of gradesToProcess) {
            const settingsId = `${sAcadYear}_${sSem}_${grade}_${plan.subject}`.replace(/[\/]/g, '-');
            
            const settingsRef = doc(db, "subject_settings", settingsId);
            const docSnap = await getDoc(settingsRef);
            
            let currentSettings = null;
            if (docSnap.exists()) {
              currentSettings = docSnap.data();
              if (!currentSettings.beforeMidKnowledge) currentSettings.beforeMidKnowledge = [];
              if (!currentSettings.beforeMidSoftSkill) currentSettings.beforeMidSoftSkill = [];
              if (!currentSettings.afterMidKnowledge) currentSettings.afterMidKnowledge = [];
              if (!currentSettings.afterMidSoftSkill) currentSettings.afterMidSoftSkill = [];
            } else {
              currentSettings = {
                id: settingsId,
                academicYear: sAcadYear,
                semester: sSem,
                gradeLevel: grade,
                subject: plan.subject,
                beforeMidKnowledge: [{ id: 'default_bmk_1', name: 'งานที่ 1', maxScore: 20 }],
                beforeMidSoftSkill: [{ id: 'default_bms_1', name: 'พฤติกรรม', maxScore: 10 }],
                afterMidKnowledge: [{ id: 'default_amk_1', name: 'สอบกลางภาค', maxScore: 20 }],
                afterMidSoftSkill: [{ id: 'default_ams_1', name: 'พฤติกรรม', maxScore: 10 }]
              };
            }
            
            let autoCols = 0;
            // Append new columns to beforeMidKnowledge
            for (const ev of autoEvals) {
               // Check if it already exists by name (very basic duplicate prevention)
               // and prevent adding if name is empty
               if (!ev.name || ev.name.trim() === '') continue;
               
               const exists = currentSettings.beforeMidKnowledge.find((c) => c.name === ev.name);
               if (!exists) {
                   currentSettings.beforeMidKnowledge.push({
                      id: ev.id || `eval_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                      name: ev.name,
                      maxScore: ev.maxScore || 10
                   });
                   autoCols++;
                   autoColsToastCount++; // Only increment overall if we added it (though multiplied by grades)
               }
            }
            
            if (autoCols > 0) {
               await setDoc(settingsRef, currentSettings);
            }
          }
        }
      }

      if (newlyAdded.length > 0 && currentTeacher) {

        const batch = writeBatch(db);
        for (const userId of newlyAdded) {
           const notifRef = doc(collection(db, "notifications"));
           batch.set(notifRef, {
             id: notifRef.id,
             userId: userId,
             type: 'co_teacher_invite',
             message: `คุณได้รับเชิญให้เป็นครูผู้ร่วมสอนในแผนการสอน "${plan.title}" โดย ${(currentTeacher.thaiName || currentTeacher.displayName)?.startsWith('ครู') ? '' : 'ครู'}${currentTeacher.thaiName || currentTeacher.displayName}`,
             planId: plan.id,
             read: false,
             createdAt: new Date().toISOString()
           });
        }
        await batch.commit();
      }

      
      setEditingPlan(null);
      
      let toastMsg = isEdit
          ? `แก้ไขและอัปเดตแผนการสอน "${plan.title}" บนคลาวด์แล้ว 📝`
          : `สร้างแผนการสอน "${plan.title}" และบันทึกบนคลาวด์แล้ว 🚀`;
      
      let autoColsToast = 0;
      if (plan.structuredEvaluations) {
         autoColsToast = plan.structuredEvaluations.filter(e => e.autoGenerateColumn).length;
      }
      
      if (autoColsToast > 0) {
         toastMsg += `\nสร้างคอลัมน์เก็บคะแนนอัตโนมัติ ${autoColsToast} รายการใน LessonAchieve`;
      }

      addToast(
        toastMsg,
        "success",
        isEdit ? "อัปเดตสำเร็จ" : "บันทึกสำเร็จ",
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
      "คาบที่_ครั้งที่",
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

  // Track user activity to update lastActiveAt periodically
  useEffect(() => {
    if (!currentTeacher || !db) return;
    
    let lastUpdated = Date.now();
    
    const handleActivity = () => {
      const now = Date.now();
      // Update at most once every 5 minutes
      if (now - lastUpdated > 5 * 60 * 1000) {
        lastUpdated = now;
        updateDoc(doc(db, "teachers", currentTeacher.id), {
          lastActiveAt: new Date().toISOString()
        }).catch(console.error);
      }
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, [currentTeacher]);

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
              <OnlineUsersIndicator currentTeacher={currentTeacher} teachers={teachers} />
              {/* User badge */}
              

          
              <button
                onClick={() => setShowEPortfolioModal(true)}
                className="hidden sm:flex items-center gap-1.5 bg-fuchsia-50 text-fuchsia-600 px-3 py-1.5 rounded-full border border-fuchsia-100 hover:bg-fuchsia-100 transition-colors"
                title="แฟ้มสะสมผลงาน (e-Portfolio)"
              >
                <BookOpen className="h-4 w-4" />
                <span className="text-sm font-bold">e-Portfolio</span>
              </button>

              <button 
                onClick={() => setShowProfileModal(true)}
                className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 hover:bg-slate-100 transition-colors"
              >
                {currentTeacher.photoURL ? (
                  <img src={currentTeacher.photoURL} alt={currentTeacher.thaiName} className="w-6 h-6 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    {currentTeacher.thaiName.charAt(0)}
                  </div>
                )}
                <span className="text-sm font-bold text-slate-700 truncate max-w-[150px]">{currentTeacher.thaiName}</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 px-3 py-2 rounded-xl transition-all border border-rose-100 shadow-sm"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline text-sm font-bold">ออกจากระบบ</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Page Layout Grid */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex-1 space-y-6 print:m-0 print:p-0 min-w-0">
        {/* Module Selector */}
        <div className="grid grid-cols-2 lg:flex lg:flex-wrap bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 print:hidden gap-1.5">
          <button
            onClick={() => setActiveModule("home")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all lg:min-w-[200px] flex-1 min-w-0 ${
              activeModule === "home"
                ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            <LayoutDashboard className="h-4.5 w-4.5 shrink-0" />
            <div className="flex flex-col items-center sm:items-start leading-tight min-w-0 w-full overflow-hidden">
              <span className="text-center sm:text-left leading-snug truncate w-full">หน้าแรก</span>
              <span className="text-xs font-semibold opacity-90">(Overview)</span>
            </div>
          </button>
          <button
            onClick={() => setActiveModule("teaching")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all lg:min-w-[200px] flex-1 min-w-0 ${
              activeModule === "teaching"
                ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            <Presentation className="h-4.5 w-4.5 shrink-0" />
            <div className="flex flex-col items-center sm:items-start leading-tight min-w-0 w-full overflow-hidden">
              <span className="text-center sm:text-left leading-snug truncate w-full">1. จัดการผู้สอน</span>
              <span className="text-xs font-semibold opacity-90">(LessonTeach)</span>
            </div>
          </button>
          <button
            onClick={() => setActiveModule("classroom")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all lg:min-w-[200px] flex-1 min-w-0 ${
              activeModule === "classroom"
                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            <Users className="h-4.5 w-4.5 shrink-0" />
            <div className="flex flex-col items-center sm:items-start leading-tight min-w-0 w-full overflow-hidden">
              <span className="text-center sm:text-left leading-snug truncate w-full">2. จัดการชั้นเรียน</span>
              <span className="text-xs font-semibold opacity-90">(LessonClass)</span>
            </div>
          </button>
          <button
            onClick={() => setActiveModule("analytics")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all lg:min-w-[200px] flex-1 min-w-0 ${
              activeModule === "analytics"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            <BarChart3 className="h-4.5 w-4.5 shrink-0" />
            <div className="flex flex-col items-center sm:items-start leading-tight min-w-0 w-full overflow-hidden">
              <span className="text-center sm:text-left leading-snug truncate w-full">3. วัดและประเมินผล</span>
              <span className="text-xs font-semibold opacity-90 truncate w-full text-center sm:text-left">(LessonAchieve)</span>
            </div>
          </button>
          <button
            onClick={() => setActiveModule("academic")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all lg:min-w-[200px] flex-1 min-w-0 ${
              activeModule === "academic"
                ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            <BookOpen className="h-4.5 w-4.5 shrink-0" />
            <div className="flex flex-col items-center sm:items-start leading-tight min-w-0 w-full overflow-hidden">
              <span className="text-center sm:text-left leading-snug truncate w-full">4. บริหารงานวิชาการ</span>
              <span className="text-xs font-semibold opacity-90">(LessonAcad)</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveModule("discipline")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all lg:min-w-[200px] flex-1 min-w-0 ${
              activeModule === "discipline"
                ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
            <div className="flex flex-col items-center sm:items-start leading-tight min-w-0 w-full overflow-hidden">
              <span className="text-center sm:text-left leading-snug truncate w-full">5. บริหารงานปกครอง</span>
              <span className="text-xs font-semibold opacity-90 truncate w-full text-center sm:text-left">(LessonDiscipline)</span>
            </div>
          </button>
          {(currentTeacher.role === "admin" || currentTeacher.role === "staff") && (
            <button
              onClick={() => setActiveModule("admission")}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all lg:min-w-[200px] flex-1 min-w-0 ${
                activeModule === "admission"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <UserPlus className="h-4.5 w-4.5 shrink-0" />
              <div className="flex flex-col items-center sm:items-start leading-tight min-w-0 w-full overflow-hidden">
                <span className="text-center sm:text-left leading-snug truncate w-full">6. รับสมัครนักเรียน</span>
                <span className="text-xs font-semibold opacity-90">(LessonAdmit)</span>
              </div>
            </button>
          )}

          {(currentTeacher.role === "admin" || currentTeacher.role === "academic" || currentTeacher.role === "deputy") && (
            <button
              onClick={() => setActiveModule("sar")}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all lg:min-w-[200px] flex-1 min-w-0 ${
                activeModule === "sar"
                  ? "bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white shadow-md"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <FileText className="h-4.5 w-4.5 shrink-0" />
              <div className="flex flex-col items-center sm:items-start leading-tight min-w-0 w-full overflow-hidden">
                <span className="text-center sm:text-left leading-snug truncate w-full">ติดตาม SAR</span>
                <span className="text-xs font-semibold opacity-90">(SAR Tracker)</span>
              </div>
            </button>
          )}

          {(currentTeacher.role === "admin" || currentTeacher.role === "staff") && (
            <button
              onClick={() => setActiveModule("users" as any)}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all lg:min-w-[200px] flex-1 min-w-0 ${
                activeModule === ("users" as any)
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <ShieldCheck className="h-4.5 w-4.5 shrink-0" />
            <div className="flex flex-col items-center sm:items-start leading-tight min-w-0 w-full overflow-hidden">
              <span className="text-center sm:text-left leading-snug truncate w-full">จัดการระบบผู้ใช้งาน</span>
              <span className="text-xs font-semibold opacity-90">(Admin)</span>
            </div>
            </button>
          )}
        </div>

        {/* Welcome Card & Info */}
        <div className="bg-gradient-to-r from-sky-50/60 via-white to-pink-50/60 rounded-2xl border-l-4 border-l-sky-450 border-y border-r border-sky-100/50 p-4 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xs print:hidden">
          <div className="space-y-2 sm:space-y-3 w-full md:w-auto">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 bg-gradient-to-r from-sky-500/10 to-pink-500/10 border border-sky-200/55 rounded-full text-slate-700 shadow-3xs w-fit">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-sky-500 animate-pulse shrink-0"></span>
              <span className="text-[10px] sm:text-base font-black tracking-wide text-indigo-950 font-sans truncate">
                LessonLog <span className="hidden sm:inline">- ระบบสารสนเทศเพื่อการจัดการสถานศึกษา</span>
              </span>
            </div>
            <h2 className="text-xs sm:text-sm font-extrabold text-slate-750 flex items-center gap-2">
              <span className="animate-wiggle text-sm">👋</span> สวัสดีครับ/ค่ะ,{" "}
              {currentTeacher.displayName}
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-500 font-semibold leading-snug">
              ยินดีต้อนรับเข้าสู่ระบบจัดการข้อมูลการสอนและชั้นเรียน<br className="sm:hidden" /> สถานะของคุณครูคือ{" "}
              <b className="text-sky-700">{currentTeacher.affiliation}</b>
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full md:w-auto mt-1 md:mt-0">
            {/* Backup JSON */}
            <button
              onClick={handleExportBackup}
              className="w-full justify-center sm:w-auto flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-white hover:bg-pink-50 text-slate-600 hover:text-pink-600 border border-slate-200 rounded-lg font-bold transition-colors shadow-sm"
              title="ส่งออกฐานข้อมูลครูสำรองเครื่องเป็นไฟล์ JSON"
            >
              <FileJson className="h-4 w-4 sm:h-4 sm:w-4 text-slate-400" />
              <span>สำรองข้อมูล</span>
            </button>

            {/* Export CSV for Excel */}
            <button
              onClick={handleExportCSV}
              className="w-full justify-center sm:w-auto flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 border border-slate-200 rounded-lg font-bold transition-colors shadow-sm"
              title="ส่งออกบันทึกการสอนเป็นไฟล์ CSV สำหรับเปิดใช้จริงใน Excel และ Google Sheets"
            >
              <FileSpreadsheet className="h-4 w-4 sm:h-4 sm:w-4 text-slate-400" />
              <span>Excel / Sheets</span>
            </button>
          </div>
        </div>

        {activeModule === "home" ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Hero Banner */}
            <div className="bg-white rounded-2xl border border-violet-100 p-8 shadow-sm hidden sm:flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400"></div>
              <div className="h-16 w-16 bg-violet-50 text-violet-500 rounded-full flex items-center justify-center mb-4">
                <LayoutDashboard className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">
                ภาพรวมระบบ LessonLog - ระบบสารสนเทศเพื่อการจัดการสถานศึกษา
              </h2>
              <p className="text-slate-500 text-sm max-w-lg mx-auto mb-4">
                ยินดีต้อนรับเข้าสู่ระบบจัดการข้อมูลการสอนและชั้นเรียน
                ข้อมูลสรุปสถิติภาพรวมทั้งหมด
              </p>
            </div>

            <TodayAttendanceWidget students={students} />
            <DashboardStats records={records} currentTeacher={currentTeacher} teachers={teachers} systemSemester={systemSemester} systemAcademicYear={systemAcademicYear} />
            
            {/* School Event Calendar in Overview */}
            <OverviewCalendar currentTeacher={currentTeacher} systemSemester={systemSemester} systemAcademicYear={systemAcademicYear} onNavigateToCalendar={() => setActiveModule("academic")} students={students} />

            {/* Quick Stats Cards (Mockup) */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 hover:shadow-md transition-shadow">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
                  <Presentation className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-500">
                    แผนการสอน
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-800">
                    {plans.length || 0}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowBadgeModal(true)}
                className="bg-gradient-to-br from-indigo-500 to-purple-500 p-4 sm:p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 hover:shadow-lg hover:scale-[1.02] transition-all text-left text-white cursor-pointer"
              >
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Medal className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-medium text-white/80">
                    Quick Action
                  </div>
                  <div className="text-base sm:text-lg font-black text-white leading-tight">
                    แจกเหรียญความดี
                  </div>
                </div>
              </button>
              <button
                onClick={() => setShowStudentStatsModal(true)}

                className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 hover:shadow-md hover:border-pink-200 transition-all text-left text-inherit cursor-pointer"
              >
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-500">
                    นักเรียนทั้งหมด
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-800">
                    {studentsCount.toLocaleString()}
                  </div>
                </div>
              </button>
              <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 hover:shadow-md transition-shadow">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-500">
                    เข้าเรียนวันนี้
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-800">95%</div>
                </div>
              </div>
              <button 
                onClick={() => setShowTeacherListModal(true)}
                className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 hover:shadow-md hover:border-amber-200 transition-all text-left text-inherit cursor-pointer"
              >
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                  <School className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-500">
                    ครูผู้สอน
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-800">
                    {teachers.length || 0}
                  </div>
                </div>
              </button>
            </div>

            {/* Quick Actions / Modules Navigation */}
            <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveModule("teaching")}
                className="bg-white p-8 rounded-2xl border border-violet-100 shadow-sm hover:shadow-md hover:border-violet-300 hover:-translate-y-1 transition-all text-left flex flex-col items-center text-center group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-violet-50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="h-16 w-16 bg-violet-50 text-violet-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Presentation className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-2 leading-snug">
                  <span className="block text-center sm:text-left text-base sm:text-lg leading-snug">1. จัดการผู้สอน</span>
                  <span className="block text-sm text-slate-500 font-bold mt-0.5">(LessonTeach)</span>
                </h3>
                <p className="text-sm text-slate-500">
                  บันทึกแผนการสอนรายวันและดูข้อมูลประวัติการสอน
                </p>
              </button>

              <button
                onClick={() => setActiveModule("classroom")}
                className="bg-white p-8 rounded-2xl border border-pink-100 shadow-sm hover:shadow-md hover:border-pink-300 hover:-translate-y-1 transition-all text-left flex flex-col items-center text-center group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-pink-50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="h-16 w-16 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-2 leading-snug">
                  <span className="block text-center sm:text-left text-base sm:text-lg leading-snug">2. จัดการชั้นเรียน</span>
                  <span className="block text-sm text-slate-500 font-bold mt-0.5">(LessonClass)</span>
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
                <h3 className="text-lg font-black text-slate-800 mb-2 leading-snug">
                  <span className="block text-center sm:text-left text-base sm:text-lg leading-snug">3. วัดและประเมินผล</span>
                  <span className="block text-sm text-slate-500 font-bold mt-0.5">(LessonAchieve)</span>
                </h3>
                <p className="text-sm text-slate-500">
                  รายงานผลสัมฤทธิ์ทางการเรียนและวิเคราะห์สถิติภาพรวม
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
                <h3 className="text-lg font-black text-slate-800 mb-2 leading-snug">
                  <span className="block text-center sm:text-left text-base sm:text-lg leading-snug">4. บริหารงานวิชาการ</span>
                  <span className="block text-sm text-slate-500 font-bold mt-0.5">(LessonAcad)</span>
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
                <h3 className="text-lg font-black text-slate-800 mb-2 leading-snug">
                  <span className="block text-center sm:text-left text-base sm:text-lg leading-snug">5. บริหารงานปกครอง</span>
                  <span className="block text-sm text-slate-500 font-bold mt-0.5">(LessonDiscipline)</span>
                </h3>
                <p className="text-sm text-slate-500">
                  บันทึกเหตุการณ์ ทะเลาะวิวาท อุบัติเหตุ และความประพฤติ
                </p>
                <div className="mt-4 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                  เปิดใช้งาน
                </div>
              </button>
              {(currentTeacher.role === "admin" || currentTeacher.role === "staff") && (
                <button
                  onClick={() => setActiveModule("admission")}
                  className="bg-white p-8 rounded-2xl border border-indigo-100 shadow-sm hover:shadow-md hover:border-indigo-300 hover:-translate-y-1 transition-all text-left flex flex-col items-center text-center group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="h-16 w-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UserPlus className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-black text-slate-800 mb-2 leading-snug">
                    <span className="block text-center sm:text-left text-base sm:text-lg leading-snug">6. รับสมัครนักเรียน</span>
                    <span className="block text-sm text-slate-500 font-bold mt-0.5">(LessonAdmit)</span>
                  </h3>
                  <p className="text-sm text-slate-500">
                    ระบบรับสมัครเรียน เลื่อนชั้น และจบการศึกษา
                  </p>
                  <div className="mt-4 px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 text-xs font-bold rounded-full flex items-center gap-1">
                    <Wrench className="h-3 w-3" /> ปิดปรับปรุงฟังก์ชัน
                  </div>
                </button>
              )}
              {(currentTeacher.role === "admin" || currentTeacher.role === "academic" || currentTeacher.role === "deputy") && (
                <button
                  onClick={() => setActiveModule("sar")}
                  className="bg-white p-8 rounded-2xl border border-fuchsia-100 shadow-sm hover:shadow-md hover:border-fuchsia-300 hover:-translate-y-1 transition-all text-left flex flex-col items-center text-center group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-fuchsia-50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="h-16 w-16 bg-fuchsia-50 text-fuchsia-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-black text-slate-800 mb-2 leading-snug">
                  <span className="block text-center sm:text-left leading-snug">ติดตาม SAR</span>
                  <span className="block text-sm text-slate-500 font-bold mt-0.5">(SAR Tracker)</span>
                </h3>
                  <p className="text-sm text-slate-500">
                    ตรวจสอบภาพรวมการบันทึกข้อมูล SAR ของบุคลากรทั้งโรงเรียน
                  </p>
                  <div className="mt-4 px-3 py-1 bg-fuchsia-100 text-fuchsia-700 text-xs font-bold rounded-full">
                    สำหรับฝ่ายวิชาการ
                  </div>
                </button>
              )}

              {(currentTeacher.role === "admin" || currentTeacher.role === "staff") && (
                <button
                  onClick={() => setActiveModule("users" as any)}
                  className="bg-white p-8 rounded-2xl border border-amber-100 shadow-sm hover:shadow-md hover:border-amber-300 hover:-translate-y-1 transition-all text-left flex flex-col items-center text-center group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="h-16 w-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-black text-slate-800 mb-2 leading-snug">
                  <span className="block text-center sm:text-left leading-snug">จัดการระบบผู้ใช้งาน</span>
                  <span className="block text-sm text-slate-500 font-bold mt-0.5">(Admin)</span>
                </h3>
                  <p className="text-sm text-slate-500">
                    จัดการบัญชีผู้ใช้งาน สิทธิ์การเข้าถึง และข้อมูลของโรงเรียน
                  </p>
                  <div className="mt-4 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                    เปิดใช้งานเฉพาะ Admin/ธุรการ
                  </div>
                </button>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm overflow-hidden w-full">
              <h3 className="text-base font-black text-slate-800 mb-6 flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-500 shrink-0" />
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
                          className={`h-2.5 w-2.5 rounded-full ${item.color} mt-1.5 shadow-sm shrink-0`}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-slate-700 break-words whitespace-normal">
                            {displayName}{" "}
                            <span className="font-normal text-slate-500">
                              ได้ทำการ
                            </span>{" "}
                            {item.action}
                          </div>
                          <div className="text-xs text-slate-500 mt-1 break-words whitespace-normal">
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
            {(currentTeacher.role !== 'admin' && currentTeacher.role !== 'academic' && currentTeacher.role !== 'deputy') && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center rounded-2xl min-h-[60vh] -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center text-center max-w-sm border border-slate-100 animate-in zoom-in-95 duration-300">
                  <div className="h-16 w-16 bg-violet-50 text-violet-500 rounded-full flex items-center justify-center mb-4">
                    <Wrench className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-black text-slate-800">
                    ปิดปรับปรุงชั่วคราว
                  </h3>
                  <p className="text-slate-500 mt-2 text-sm font-medium">
                    โมดูล "1. จัดการผู้สอน" กำลังอยู่ระหว่างการพัฒนาและปรับปรุงระบบ ขออภัยในความไม่สะดวก
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
            <div className="space-y-6">
              {/* Module Header with attractive display */}
              <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4 text-white relative overflow-hidden print:hidden">
                
                
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-violet-300 opacity-20 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl"></div>
                
                <div className="flex items-center gap-5 relative z-10">
                  <div className="h-16 w-16 bg-white/20 backdrop-blur-md text-white rounded-2xl flex items-center justify-center shadow-inner border border-white/30">
                    <Presentation className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight drop-shadow-sm flex items-center flex-wrap gap-2">
                      <span>1. จัดการผู้สอน</span>
                      <span className="text-xl opacity-90">(LessonTeach)</span>
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
                    onClick={() => setActiveTab("pbl-log-form")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                      activeTab === "pbl-log-form"
                        ? "bg-white text-purple-700 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-500 hover:text-purple-700 hover:bg-purple-50"
                    }`}
                  >
                    <BookOpen className="h-4 w-4" />
                    บันทึกหลังสอน (PBL)
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
                  <div className="w-px h-8 bg-slate-200 mx-2 hidden md:block"></div>
                  <button
                    onClick={() => setActiveTab("pbl-plan-form")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                      activeTab === "pbl-plan-form"
                        ? "bg-white text-purple-700 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-500 hover:text-purple-700 hover:bg-purple-50"
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    สร้างแผนการสอน (PBL)
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
                    setActiveTab("pbl-log-form");
                  }}
                  onDelete={handleDeleteRecord}
                  onPrintPreview={(r) => setActivePrintPreview(r)}
                  onEvaluate={(r) => {
                    setEvaluatingModalRecord(r);
                  }}
                />
              )}

              {activeTab === "pbl-plan-form" && (
                <PBLLessonPlanForm
                  teacherId={currentTeacher.id}
                  teachers={teachers}
                  onSave={handleSavePlan}
                  initialPlan={editingPlan}
                  onCancel={
                    editingPlan ? () => setEditingPlan(null) : undefined
                  }
                  currentUserRole={currentTeacher.role}
                  currentUserName={currentTeacher.name}
                  systemAcademicYear={systemAcademicYear}
                  systemSemester={systemSemester}
                />
              )}
              {activeTab === "pbl-log-form" && (
                <PBLLessonLogForm
                  teacherId={currentTeacher.id}
                  onSave={handleSaveRecord}
                  initialRecord={editingRecord}
                  onCancel={
                    editingRecord ? () => setEditingRecord(null) : undefined
                  }
                  currentUserRole={currentTeacher.role}
                  currentUserName={currentTeacher.name}
                  systemAcademicYear={systemAcademicYear}
                  systemSemester={systemSemester}
                  preloadedPlan={preloadedPlanForLog}
                  onClearPreloadedPlan={() => setPreloadedPlanForLog(null)}
                />
              )}

              {activeTab === "plan-list" && (
                <LessonPlanList
                  plans={plans}
                  records={records}
                  teachers={teachers}
                  showTeacherFilter={
                    currentTeacher.role === "admin" ||
                    currentTeacher.role === "academic" ||
                    currentTeacher.role === "deputy"
                  }
                  currentUserRole={currentTeacher.role}
                  currentTeacherId={currentTeacher.id}
                  systemAcademicYear={systemAcademicYear}
                  systemSemester={systemSemester}
                  onEdit={(p) => {
                    setEditingPlan(p);
                    setActiveTab("pbl-plan-form");
                  }}
                  onDelete={handleDeletePlan}
                  onPrintPreview={(p) => setActivePlanPrintPreview(p)}
                  onEvaluate={(p) => {
                    setEditingRecord(null); // start fresh
                    setPreloadedPlanForLog(p); // preload the plan
                    setActiveTab("pbl-log-form"); // switch to log form tab
                  }}
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
              students={students}
              teachers={teachers}
            />
          </div>
        ) : activeModule === "analytics" ? (
          <div className="relative animate-in fade-in duration-300">
            <EvaluationModule
              systemAcademicYear={systemAcademicYear}
              systemSemester={systemSemester}
              students={students}
              currentTeacher={currentTeacher}
              initialTab={evalInitialTab}
              initialSubject={evalInitialSubject}
              initialGrade={evalInitialGrade}
            />
          </div>
        ) : activeModule === "admin" ? (
          <AdminMonitoringDashboard
            records={records}
            plans={plans}
            teachers={teachers}
          />
        ) : activeModule === "sar" ? (
          <SARMonitoringDashboard
            teachers={teachers}
            students={students}
            systemAcademicYear={systemAcademicYear}
            currentTeacher={currentTeacher}
          />
        ) : activeModule === "staff" ? (
          <div className="relative animate-in fade-in duration-300">
            <StaffProfileModule
              currentTeacher={currentTeacher}
              teachers={teachers}
              systemAcademicYear={systemAcademicYear}
              systemSemester={systemSemester}
              isPersonalView={true}
            />
          </div>
        ) : activeModule === "discipline" ? (
          <div className="relative animate-in fade-in duration-300">
            <DisciplineModule
              currentTeacher={currentTeacher}
              systemSemester={systemSemester}
              systemAcademicYear={systemAcademicYear}
              students={students}
            />
          </div>
        ) : activeModule === "admission" ? (
          <div className="relative animate-in fade-in duration-300">
            <LessonAdmitModule
              currentTeacher={currentTeacher}
              systemSemester={systemSemester}
              systemAcademicYear={systemAcademicYear}
              students={students}
            />
          </div>
        ) : activeModule === "users" ? (
          <div className="relative animate-in fade-in duration-300">
            <UserManagementModule
              teachers={teachers}
              records={records}
              currentTeacher={currentTeacher}
              onDeleteTeacher={async (id) => {
                 setTeacherToDelete(id);
              }}
              onUpdateTeacher={async (id, updates) => {
                 const tRef = doc(db, 'teachers', id);
                 await setDoc(tRef, updates, { merge: true });
              }}
            />
          </div>
        ) : null}
      </main>

      {/* Print Overlays */}
      {activePrintPreview && (
        <PrintTemplate
          record={activePrintPreview}
          teacher={currentTeacher}
          customLogo={customLogo}
          onClose={() => setActivePrintPreview(null)}
        />
      )}

      {/* 4.1.2 Plan Print/PDF Template Viewer Overlay Modal */}
      {activePlanPrintPreview && (
        <LessonPlanPrintTemplate
          plan={activePlanPrintPreview}
          allTeachers={teachers}
          teacher={
            teachers.find((t) => t.id === activePlanPrintPreview.teacherId) ||
            (currentTeacher?.role === "teacher"
              ? currentTeacher
              : DEFAULT_TEACHER)
          }
          academicHead={
            teachers.find((t) => t.role === "academic" || t.role === "deputy" || t.role === "admin") ||
            ((currentTeacher?.role === "academic" || currentTeacher?.role === "deputy" || currentTeacher?.role === "admin") ? currentTeacher : null)
          }
          currentUser={currentTeacher}
          onUpdatePlan={(updated: any) => {
            handleSavePlan(updated);
            setActivePlanPrintPreview(updated);
          }}
          onClose={() => setActivePlanPrintPreview(null)}
          onNavigateToGradebook={(subject, gradeLevel) => {
            setActivePlanPrintPreview(null);
            setEvalInitialSubject(subject);
            setEvalInitialGrade(gradeLevel.split(',')[0].trim());
            setEvalInitialTab('grades');
            setActiveModule('analytics');
          }}
        />
      )}

      {/* 4.1.5 e-Portfolio Modal */}
      {showEPortfolioModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-slate-50 w-full max-w-5xl min-h-[80vh] max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="flex justify-between items-center p-4 sm:p-6 bg-white border-b border-slate-100 shrink-0 sticky top-0 z-10">
              <h2 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2">
                <div className="h-10 w-10 bg-fuchsia-100 rounded-full flex items-center justify-center text-fuchsia-600">
                  <BookOpen className="h-5 w-5" />
                </div>
                แฟ้มสะสมผลงานของฉัน (e-Portfolio)
              </h2>
              <button onClick={() => setShowEPortfolioModal(false)} className="p-2 bg-slate-50 hover:bg-slate-100 hover:text-rose-600 text-slate-500 rounded-full transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50">
              <StaffProfileModule
                currentTeacher={currentTeacher}
                teachers={teachers}
                systemAcademicYear={systemAcademicYear}
                systemSemester={systemSemester}
                isPersonalView={true}
              />
            </div>
          </div>
        </div>
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

              {/* Profile Avatar Upload (Firebase Storage) */}
              <div className="bg-indigo-50 border border-indigo-200/65 p-3.5 rounded-xl">
                <label className="block text-xs font-black text-indigo-900 mb-1">
                  รูปภาพโปรไฟล์ส่วนตัว (Avatar)
                </label>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center border border-indigo-200 overflow-hidden shrink-0">
                    {currentTeacher.photoURL ? (
                      <img src={currentTeacher.photoURL} alt="Profile Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-6 w-6 text-indigo-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) { // 5MB limit
                            window.dispatchEvent(new CustomEvent('app-custom-toast', { detail: { message: 'กรุณาเลือกรูปภาพขนาดไม่เกิน 5MB', type: 'error' } }));
                            e.target.value = '';
                            return;
                          }
                          
                          if (!storage) {
                            window.dispatchEvent(new CustomEvent('app-custom-toast', { detail: { message: 'ระบบจัดเก็บไฟล์ยังไม่พร้อมใช้งาน', type: 'error' } }));
                            return;
                          }

                          try {
                            const ext = file.name.split('.').pop() || 'jpg';
                            const fileName = `avatars/${currentTeacher.id}_${Date.now()}.${ext}`;
                            const storageRef = ref(storage, fileName);
                            
                            // 1. Upload to Firebase Storage
                            await uploadBytes(storageRef, file);
                            
                            // 2. Get Download URL
                            const downloadURL = await getDownloadURL(storageRef);
                            
                            // 3. Update Firestore with new URL
                            const updatedTeacher = { ...currentTeacher, photoURL: downloadURL };
                            await updateDoc(doc(db, "teachers", currentTeacher.id), { photoURL: downloadURL });
                            setCurrentTeacher(updatedTeacher);
                            
                            window.dispatchEvent(new CustomEvent('app-custom-toast', { detail: { message: 'อัปเดตรูปโปรไฟล์สำเร็จ', type: 'success' } }));
                          } catch (err) {
                            console.error("Error uploading avatar:", err);
                            window.dispatchEvent(new CustomEvent('app-custom-toast', { detail: { message: 'เกิดข้อผิดพลาดในการอัปเดตรูปโปรไฟล์', type: 'error' } }));
                          }
                          e.target.value = ''; // Reset input
                        }
                      }}
                      className="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200"
                    />
                    <p className="text-[10px] text-indigo-500 mt-1">ไฟล์ JPG/PNG ขนาดไม่เกิน 5MB (รูปสี่เหลี่ยมจัตุรัส)</p>
                  </div>
                  {currentTeacher.photoURL && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const updatedTeacher = { ...currentTeacher };
                          delete updatedTeacher.photoURL;
                          await updateDoc(doc(db, "teachers", currentTeacher.id), { photoURL: null });
                          setCurrentTeacher(updatedTeacher);
                          
                          // Attempt to delete from storage if URL matches our structure (optional cleanup)
                          // Note: A robust system would track the full storage path or parse it from the URL.
                          
                          window.dispatchEvent(new CustomEvent('app-custom-toast', { detail: { message: 'ลบรูประยะไกลออกจากโปรไฟล์แล้ว', type: 'success' } }));
                        } catch (err) {
                          console.error("Error removing avatar:", err);
                          window.dispatchEvent(new CustomEvent('app-custom-toast', { detail: { message: 'ลบรูปภาพไม่สำเร็จ', type: 'error' } }));
                        }
                      }}
                      className="text-rose-500 hover:bg-rose-100 p-1.5 rounded-lg text-[10px] font-bold"
                    >
                      ลบรูป
                    </button>
                  )}
                </div>
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
              {currentTeacher?.role === "admin" && (
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
                    </div>
                  </div>
                </div>
              )}

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

      {/* Badge Award Modal */}
      <BadgeAwardModal
        isOpen={showBadgeModal}
        onClose={() => setShowBadgeModal(false)}
        students={students}
        currentTeacher={currentTeacher}
        systemAcademicYear={systemAcademicYear}
        systemSemester={systemSemester}
      />

      {/* Student Stats Modal */}
      <StudentStatsModal
        isOpen={showStudentStatsModal}
        onClose={() => setShowStudentStatsModal(false)}
        students={students}
      />
      {/* Student Evaluation Modal */}
      <StudentEvaluationModal
        isOpen={!!evaluatingModalRecord}
        onClose={() => setEvaluatingModalRecord(null)}
        record={evaluatingModalRecord}
        plans={plans}
        onSuccess={() => {
          setEvaluatingModalRecord(null);
        }}
      />
      <TeacherListModal
        isOpen={showTeacherListModal}
        onClose={() => setShowTeacherListModal(false)}
        teachers={teachers}
      />
    </div>
  );
}
