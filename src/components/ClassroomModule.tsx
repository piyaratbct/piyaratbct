import { AvatarUpload } from "./AvatarUpload";
import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import {
  Users,
  Activity,
  User,
  PieChart as PieChartIcon,
  FileText,
  CheckCircle,
  Printer,
  ChevronDown,
  UserPlus,
  FileSpreadsheet,
  Download,
  Search,
  Pencil,
  Trash2,
  History,
  Clock,
  GraduationCap,
  CalendarCheck,
  Wrench, AlertCircle,
  AlertTriangle, HeartPulse, X, TrendingUp, TrendingDown, Minus, FileJson,
} from "lucide-react";
import { StudentDetailModal } from "./StudentDetailModal";
import { Student360 } from "./Student360";
import { Student, StudentAssessment, GRADE_LEVELS, Teacher } from "../types";
import { AssessmentPrintTemplate } from "./AssessmentPrintTemplate";
import { KindergartenPrintTemplate } from "./KindergartenPrintTemplate";
import { HealthPrintTemplate } from "./HealthPrintTemplate";
import { ParentFeedbackPrintTemplate } from "./ParentFeedbackPrintTemplate";
import { ImportStudentData } from "./ImportStudentData";
import { StudentModal } from "./StudentModal";
import { BatchPromotionModal } from "./BatchPromotionModal";
import { AssignSectionModal } from "./AssignSectionModal";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
  doc,
  setDoc,
  updateDoc,
  writeBatch,
  deleteDoc,
  deleteField,
} from "firebase/firestore";
import { AssessmentModal } from "./AssessmentModal";
import { KindergartenAssessmentModal } from "./KindergartenAssessmentModal";
import { KindergartenAssessment } from "../types";
import { AttendanceTracking } from "./AttendanceTracking";
import { formatThaiDateTime, formatThaiMonthYear } from '../lib/dateUtils';

interface ClassroomModuleProps {
  currentTeacher: Teacher | null;
  systemAcademicYear?: string;
  systemSemester?: string;
  teachers?: Teacher[];
  initialTab?: 'students' | 'student360' | 'attendance' | 'assessments' | 'special-care';
  initialGrade?: string;
  initialSubject?: string;
}

export const ClassroomModule: React.FC<ClassroomModuleProps> = ({
  currentTeacher,
  systemAcademicYear = "2567",
  systemSemester = "1",
  teachers = [],
  initialTab,
  initialGrade,
  initialSubject,
}) => {
  const [activeTab, setActiveTab] = useState<"students" | "student360" | "attendance" | "assessments" | "special-care">(
    initialTab || "students",
  );

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);
  const [selectedStudent360, setSelectedStudent360] = useState<Student | null>(null);

  const defaultGrade = initialGrade || currentTeacher?.homeroomClass || currentTeacher?.coHomeroomClass || GRADE_LEVELS[0];
  const [selectedGrade, setSelectedGrade] = useState<string>(defaultGrade);
    const [students, setStudents] = useState<Student[]>([]);
  
  const uniqueGrades = React.useMemo(() => {
    const dbGrades = new Set(students.map(s => s.gradeLevel));
    
    // Grades to hide if they don't have any students (to avoid clutter when sub-rooms are used)
    const hideIfEmpty = ['ประถมศึกษาปีที่ 1', 'ประถมศึกษาปีที่ 2'];
    const filteredGradeLevels = GRADE_LEVELS.filter(g => !hideIfEmpty.includes(g) || dbGrades.has(g));

    // Filter out grades that are already in GRADE_LEVELS
    const extraGrades = Array.from(dbGrades).filter(g => typeof g === 'string' && !GRADE_LEVELS.includes(g) && g !== 'จบการศึกษา') as string[];
    // Sort extraGrades simply by string comparison
    extraGrades.sort();
    return [...filteredGradeLevels, ...extraGrades];
  }, [students]);

  const [showImport, setShowImport] = useState(false);
  const [showBatchPromotion, setShowBatchPromotion] = useState(false);
  const [showAssignSection, setShowAssignSection] = useState(false);
  const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Assessments state
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [hasAutoSelected, setHasAutoSelected] = useState<boolean>(false);
  const [allAssessments, setAllAssessments] = useState<StudentAssessment[]>([]);
  const [showHistoryCompare, setShowHistoryCompare] = useState(false);
  const [assessments, setAssessments] = useState<
    Record<string, any>
  >({});
  const [evaluatingStudent, setEvaluatingStudent] = useState<Student | null>(
    null,
  );

  // Print state
  const [printStudents, setPrintStudents] = useState<Student[] | null>(null);
  const [printHealthStudents, setPrintHealthStudents] = useState<Student[] | null>(null);
  const [showFeedbackPrint, setShowFeedbackPrint] = useState(false);

  // Student Form state
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Delete confirmation state
  const [studentToDelete, setStudentToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [assessmentToDelete, setAssessmentToDelete] =
    useState<StudentAssessment | null>(null);

  const [expandedHistory, setExpandedHistory] = useState<
    Record<string, boolean>
  >({});

  const toggleHistory = (studentId: string) => {
    setExpandedHistory((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  };



  const isStudentManager = currentTeacher?.role && ['admin', 'academic', 'deputy', 'discipline', 'staff'].includes(currentTeacher.role);
  const canDeleteStudent = currentTeacher?.role === 'admin';

  useEffect(() => {
    // Fetch students from Firestore
    const qStudents = query(collection(db, "students"));
    const unsubscribeStudents = onSnapshot(
      qStudents,
      (snapshot) => {
        const fetchedStudents = snapshot.docs
          .map((doc) => {
            const data = doc.data() as Student;
            if (data.gradeLevel) {
              data.gradeLevel = data.gradeLevel.replace(/\s*\(ป\..*\)/g, '');
            }
            return { id: doc.id, ...data };
          });

        // Sort by number
        fetchedStudents.sort((a, b) => a.number - b.number);

        setStudents(fetchedStudents);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "students");
      },
    );

    // Fetch assessments for the current grade level
    const qAssessments = query(collection(db, "assessments"));
    const unsubscribeAssessments = onSnapshot(
      qAssessments,
      (snapshot) => {
        const fetchedAssessments: StudentAssessment[] = [];
        snapshot.docs.forEach((doc) => {
          const data = doc.data() as StudentAssessment;
          if (data.gradeLevel) {
            data.gradeLevel = data.gradeLevel.replace(/\s*\(ป\..*\)/g, '');
          }
          fetchedAssessments.push(data);
        });
        setAllAssessments(fetchedAssessments);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "assessments");
      },
    );

    return () => {
      unsubscribeStudents();
      unsubscribeAssessments();
    };
  }, [selectedGrade]);

  useEffect(() => {
    if (!hasAutoSelected && allAssessments.length > 0) {
       const availableMonths = Array.from(new Set(allAssessments.map(a => a.month).filter(Boolean))) as string[];
       if (availableMonths.length > 0) {
          availableMonths.sort().reverse();
          setSelectedMonth(availableMonths[0]);
          setHasAutoSelected(true);
       }
    }
  }, [allAssessments, hasAutoSelected]);

  useEffect(() => {
    const currentMonthAssessments: Record<string, StudentAssessment> = {};
    allAssessments.forEach((assessment) => {
      // For assessments, if month is selected, it uniquely identifies the point in time (YYYY-MM).
      // We should not restrict by systemAcademicYear or systemSemester, because if the term changes,
      // teachers still need to view past months' data.
      const matchMonth = (assessment.month || "") === selectedMonth;
      
      if (matchMonth) {
        currentMonthAssessments[assessment.studentId] = assessment;
      }
    });
    setAssessments(currentMonthAssessments);
  }, [allAssessments, selectedMonth]);

  const displayedStudents = students.filter((student) => {
    // If searching, ignore grade level filter
    if (searchQuery !== "") {
      const matchesGender = genderFilter === "all" || student.gender === genderFilter;
      const matchesSearch = `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.nickname && student.nickname.toLowerCase().includes(searchQuery.toLowerCase())) ||
        student.studentId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesGender && matchesSearch;
    }
    
    // If not searching, filter by grade and gender
    let matchGrade = false;
    if (selectedGrade === 'ภาพรวม') {
      matchGrade = true;
    } else if (selectedGrade === 'ระดับอนุบาล') {
      matchGrade = (student.gradeLevel || '').startsWith('อนุบาล');
    } else if (selectedGrade === 'ระดับประถมศึกษา') {
      matchGrade = (student.gradeLevel || '').startsWith('ประถม');
    } else {
      matchGrade = student.gradeLevel === selectedGrade;
    }
    
    if (!matchGrade) return false;
    if (genderFilter !== "all" && student.gender !== genderFilter) return false;
    
    return true;
  });

  // Sort displayed students by grade level (optional but nice), then number
  displayedStudents.sort((a, b) => {
    if (a.gradeLevel !== b.gradeLevel) {
      const isKinderA = (a.gradeLevel || '').startsWith('อนุบาล');
      const isKinderB = (b.gradeLevel || '').startsWith('อนุบาล');
      if (isKinderA && !isKinderB) return -1;
      if (!isKinderA && isKinderB) return 1;
      return (a.gradeLevel || '').localeCompare(b.gradeLevel || '', 'th', { numeric: true });
    }
    return (a.number || 0) - (b.number || 0);
  });

  // Calculate counts based on displayed students (or just grade level students if not searching)
  const studentsInGrade = students.filter(s => {
    if (selectedGrade === 'ภาพรวม') return true;
    if (selectedGrade === 'จบการศึกษา') return s.status === 'graduated' || s.gradeLevel === 'จบการศึกษา';
    if (selectedGrade === 'ระดับอนุบาล') return (s.gradeLevel || '').startsWith('อนุบาล');
    if (selectedGrade === 'ระดับประถมศึกษา') return (s.gradeLevel || '').startsWith('ประถม');
    return s.gradeLevel === selectedGrade;
  });
  const countSource = searchQuery !== "" ? displayedStudents : studentsInGrade;
  
  const totalCount = countSource.filter(s => s.status === 'active' || !s.status).length;
  const maleCount = countSource.filter((s) => s.gender === "male" && (s.status === 'active' || !s.status)).length;
  const femaleCount = countSource.filter((s) => s.gender === "female" && (s.status === 'active' || !s.status)).length;
  
  const allergicFoodStudents = countSource.filter((s) => s.allergicFood);
  const congenitalDiseaseStudents = countSource.filter((s) => s.congenitalDisease);

  const homeroomTeachers = teachers.filter(
    (t) => t.homeroomClass === selectedGrade || t.coHomeroomClass === selectedGrade
  );

  const isKindergarten = selectedGrade.startsWith("อนุบาล");

  const getInitialKindergartenAssessment = (studentId: string): KindergartenAssessment => {
    return {
      id: `ka-${Date.now()}`,
      studentId,
      gradeLevel: selectedGrade,
      semester: systemSemester || '',
      academicYear: systemAcademicYear || '',
      teacherId: currentTeacher?.id || "t-unknown",
      physicalDev: "",
      emotionalDev: "",
      citizenshipDev: "",
      intellectualDev: "",
      month: selectedMonth,
      updatedAt: new Date().toISOString(),
    };
  };

  // Initialize empty assessment if not exist
  const getInitialAssessment = (studentId: string): StudentAssessment => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    return {
      id: `a-${Date.now()}`,
      studentId,
      gradeLevel: selectedGrade,
      semester: systemSemester,
      academicYear: systemAcademicYear,
      teacherId: currentTeacher?.id || "t-unknown",
      characterTraits: {
        trait1: 0,
        trait2: 0,
        trait3: 0,
        trait4: 0,
        trait5: 0,
        trait6: 0,
        trait7: 0,
        trait8: 0,
      },
      competencies: { comp1: 0, comp2: 0, comp3: 0, comp4: 0, comp5: 0 },
      readingWriting: 0,
      comments: "",
      month: selectedMonth,
      recordDate: todayStr,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const handleSaveStudent = async (
    studentData: Omit<Student, "id">,
    id?: string,
  ) => {
    if (!studentData.studentId || studentData.studentId.trim() === '') {
      window.alert('กรุณาระบุรหัสนักเรียน ข้อมูลนี้ไม่สามารถเว้นว่างได้');
      return;
    }

    const isDuplicate = students.some(
      (s) => s.studentId === studentData.studentId && s.id !== id
    );

    if (isDuplicate) {
      window.alert(`มีนักเรียนที่ใช้รหัส "${studentData.studentId}" อยู่ในระบบแล้ว กรุณาใช้รหัสอื่นเพื่อป้องกันการสร้างข้อมูลซ้ำ`);
      return;
    }

    try {
      if (id) {
        await setDoc(
          doc(db, "students", id),
          {
            ...studentData,
            id,
          },
          { merge: true },
        );
      } else {
        const newDocRef = doc(collection(db, "students"));
        await setDoc(newDocRef, {
          academicYear: systemAcademicYear,
          ...studentData,
          id: newDocRef.id,
        });
      }
      setShowStudentModal(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "students");
    }
  };

  const confirmDeleteStudent = async () => {
    if (!studentToDelete) return;
    try {
      // ทำการสำรองข้อมูล (Soft Backup) ไปที่ collection deleted_students ก่อนลบจริง
      const studentToBackup = students.find(s => s.id === studentToDelete.id);
      if (studentToBackup) {
        await setDoc(doc(db, "deleted_students", studentToDelete.id), {
          ...studentToBackup,
          deletedAt: new Date().toISOString(),
          deletedBy: currentTeacher?.id || 'unknown'
        });
      }
      
      await deleteDoc(doc(db, "students", studentToDelete.id));
      setStudentToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, "students");
    }
  };

  const handleDeleteAllStudents = async () => {
    try {
      setIsDeletingAll(true);
      const studentsToDelete = students.filter(s => s.gradeLevel === selectedGrade);
      
      const chunks = [];
      for (let i = 0; i < studentsToDelete.length; i += 500) {
        chunks.push(studentsToDelete.slice(i, i + 500));
      }

      for (const chunk of chunks) {
        const batch = writeBatch(db);
        for (const student of chunk) {
          batch.delete(doc(db, "students", student.id));
        }
        await batch.commit();
      }
      
      setShowDeleteAllConfirm(false);
      setIsDeletingAll(false);
    } catch (error) {
      console.error("Failed to delete all students:", error);
      setIsDeletingAll(false);
      handleFirestoreError(error, OperationType.DELETE, "students");
    }
  };

  const handleDeleteAssessment = async () => {
    if (!assessmentToDelete) return;
    try {
      const studentId = assessmentToDelete.studentId;
      await deleteDoc(doc(db, "assessments", assessmentToDelete.id));
      
      // Update student's weight and height when assessment is deleted
      if (studentId) {
        try {
          // Find the latest assessment for this student that is NOT the one being deleted
          const remainingAssessments = allAssessments.filter(a => a.studentId === studentId && a.id !== assessmentToDelete.id && a.weight !== undefined && a.height !== undefined);
          
          if (remainingAssessments.length > 0) {
            // Sort to find latest by month
            remainingAssessments.sort((a, b) => (b.month || "").localeCompare(a.month || ""));
            const latest = remainingAssessments[0];
            await updateDoc(doc(db, "students", studentId), {
              weight: latest.weight,
              height: latest.height
            });
          } else {
            await updateDoc(doc(db, "students", studentId), {
              weight: deleteField(),
              height: deleteField()
            });
          }
        } catch (updateErr) {
          console.error("Failed to update student weight and height", updateErr);
        }
      }

      setAssessmentToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, "assessments");
    }
  };

  const handleSaveAssessment = async (assessment: any, newWeight?: number, newHeight?: number) => {
    try {
      const now = new Date().toISOString();
      const teacherName = currentTeacher
        ? currentTeacher.displayName || currentTeacher.thaiName
        : "ผู้ใช้งาน";
        
      // Also update student weight/height if changed
      const currentStudent = students.find(s => s.id === assessment.studentId);
      if (currentStudent && (newWeight !== currentStudent.weight || newHeight !== currentStudent.height)) {
        try {
          await updateDoc(doc(db, "students", currentStudent.id), {
            ...(newWeight !== undefined ? { weight: newWeight } : {}),
            ...(newHeight !== undefined ? { height: newHeight } : {}),
            updatedAt: now
          });
        } catch (error) {
          console.error("Error updating student weight/height", error);
        }
      }

      let updatedHistory = assessment.editHistory || [];
      // If the assessment is being updated (i.e. already has an ID, though we construct the ID here),
      // we check if it already existed.
      // We can rely on assessments state to check if it's an update.
      const safeGradeLevel = assessment.gradeLevel.replace(/\//g, "-");
      const targetMonth = assessment.month || selectedMonth || new Date().toISOString().slice(0, 7);
      const targetYear = assessment.academicYear || systemAcademicYear;
      const targetSemester = assessment.semester || systemSemester;
      const docId = `${safeGradeLevel}_${assessment.studentId}_${targetYear}_${targetSemester}_${targetMonth}`;
      
      // existing assessment for this specific month
      const existing = assessments[assessment.studentId];

      if (existing) {
        updatedHistory.push({
          editedBy: teacherName,
          editedAt: now,
        });
      }

      const assessmentToSave = {
        ...assessment,
        ...(newWeight !== undefined ? { weight: newWeight } : {}),
        ...(newHeight !== undefined ? { height: newHeight } : {}),
        id: docId,
        updatedAt: now,
        ...(existing
          ? {
              lastEditedBy: teacherName,
              lastEditedAt: now,
              editHistory: updatedHistory,
            }
          : {}),
      };

      await setDoc(doc(db, "assessments", docId), assessmentToSave);
      setEvaluatingStudent(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "assessments");
    }
  };

  const printSingleReport = (student: Student) => {
    setPrintStudents([student]);
  };

  const printBatchHealthReport = () => {
    if (displayedStudents.length === 0) {
      alert("ไม่มีข้อมูลนักเรียนในระดับชั้นนี้");
      return;
    }
    setPrintHealthStudents(displayedStudents);
  };

  const printSingleHealthReport = (student: Student) => {
    setPrintHealthStudents([student]);
  };

  const printBatchReport = () => {
    // Print all students in the current grade who have been assessed
    const assessedStudents = displayedStudents.filter((s) => assessments[s.id] && (s.status === 'active' || !s.status));
    if (assessedStudents.length === 0) {
      alert("ยังไม่มีข้อมูลการประเมินในระดับชั้นนี้สำหรับนักเรียนปกติ");
      return;
    }
    setPrintStudents(assessedStudents);
  };

  const printFeedbackBatchReport = () => {
    setShowFeedbackPrint(true);
  };

  const exportToCSV = () => {
    const headers = [
      "เลขที่", "รหัสนักเรียน", "เลขประจำตัวประชาชน",
      "ชื่อ", "นามสกุล", "ชื่อเล่น",
      "ระดับชั้น", "เพศ", "วัน/เดือน/ปีเกิด",
      "เชื้อชาติ", "สัญชาติ", "ศาสนา", "กรุ๊ปเลือด",
      "ที่อยู่", "สถานภาพครอบครัว",
      "ชื่อบิดา", "เบอร์โทรบิดา", "อาชีพบิดา", "รายได้บิดา", "สถานที่ทำงานบิดา",
      "ชื่อมารดา", "เบอร์โทรมารดา", "อาชีพมารดา", "รายได้มารดา", "สถานที่ทำงานมารดา",
      "ชื่อผู้ปกครอง", "ความสัมพันธ์ผู้ปกครอง", "อาชีพผู้ปกครอง", "รายได้ผู้ปกครอง", "สถานที่ทำงานผู้ปกครอง",
      "น้ำหนัก", "ส่วนสูง",
      "แพ้อาหาร", "แพ้ยา", "โรคประจำตัว", "การมองเห็น", "สุขภาพฟัน", "ข้อมูลทางการแพทย์อื่นๆ", "รับนมโรงเรียน",
      "โรงเรียนเดิม", "สถานะ", "โรงเรียนที่ย้ายไป"
    ];
    
    const escape = (val?: string | number | boolean) => {
      if (val === null || val === undefined) return "";
      const str = String(val);
      // Escape double quotes by doubling them, and wrap in double quotes
      return `"${str.replace(/"/g, '""')}"`;
    };

    const csvContent = [
      headers.join(","),
      ...displayedStudents.map((student) => {
        return [
          escape(student.number),
          escape(student.studentId),
          escape(student.nationalId),
          escape(student.firstName),
          escape(student.lastName),
          escape(student.nickname),
          escape(student.gradeLevel),
          escape(student.gender === "male" ? "ชาย" : student.gender === "female" ? "หญิง" : ""),
          escape(student.dob),
          escape(student.ethnicity),
          escape(student.nationality),
          escape(student.religion),
          escape(student.bloodGroup),
          escape(student.address),
          escape(student.familyStatus),
          escape(student.fatherName || `${student.fatherFirstName || ''} ${student.fatherLastName || ''}`.trim()),
          escape(student.fatherPhone),
          escape(student.fatherOccupation),
          escape(student.fatherIncome),
          escape(student.fatherWorkplace ? `${student.fatherWorkplace} ${student.fatherWorkplaceProvince || ''}`.trim() : ""),
          escape(student.motherName || `${student.motherPrefix || ''}${student.motherFirstName || ''} ${student.motherLastName || ''}`.trim()),
          escape(student.motherPhone),
          escape(student.motherOccupation),
          escape(student.motherIncome),
          escape(student.motherWorkplace ? `${student.motherWorkplace} ${student.motherWorkplaceProvince || ''}`.trim() : ""),
          escape(`${student.guardianFirstName || ''} ${student.guardianLastName || ''}`.trim()),
          escape(student.guardianRelation),
          escape(student.guardianOccupation),
          escape(student.guardianIncome),
          escape(student.guardianWorkplace ? `${student.guardianWorkplace} ${student.guardianWorkplaceProvince || ''}`.trim() : ""),
          escape(student.weight),
          escape(student.height),
          escape(student.allergicFood),
          escape(student.allergicMedicine),
          escape(student.congenitalDisease),
          escape(student.vision),
          escape(student.dental),
          escape(student.medicalInfo),
          escape(student.noSchoolMilk ? "ไม่รับ (แพ้นมวัว)" : "รับปกติ"),
          escape(student.previousSchool ? `${student.previousSchool} ${student.previousSchoolProvince || ''}`.trim() : ""),
          escape(student.status === "active" ? "ปกติ" : student.status === "graduated" ? "จบการศึกษา" : "ย้าย/ออก"),
          escape(student.destinationSchool)
        ].join(",");
      })
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ข้อมูลนักเรียน_${selectedGrade}_${systemSemester}-${systemAcademicYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="print:hidden space-y-6">
        {/* Module Header with attractive display */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl p-4 sm:p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-pink-300 opacity-20 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl"></div>

          <div className="flex flex-row items-center gap-4 sm:gap-5 relative z-10">
            <div className="h-16 w-16 bg-white/20 backdrop-blur-md text-white rounded-2xl flex items-center justify-center shadow-inner border border-white/30">
              <Users className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight drop-shadow-sm">
                <span className="block sm:inline">2. จัดการชั้นเรียน</span>
                <span className="text-xl opacity-90 block sm:inline sm:ml-2">(LessonClass)</span>
              </h2>
              <p className="text-pink-100 font-medium mt-1 flex flex-col sm:block">
                <span>จัดการข้อมูลนักเรียน</span>
                <span className="sm:ml-1">ประเมินพัฒนาการแบบรายบุคคล</span>
              </p>
            </div>
          </div>

          {/* Grade Selector inside header */}
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 rounded-xl w-full md:w-auto">
            <label className="text-sm font-bold text-pink-50">
              เลือกระดับชั้น:
            </label>
            <div className="relative">
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="appearance-none bg-white text-slate-800 rounded-lg pl-3 pr-8 py-1.5 text-sm font-bold focus:ring-2 focus:ring-pink-300 outline-none w-full sm:w-auto min-w-[120px] shadow-sm cursor-pointer"
              >
                {isStudentManager && (
                  <optgroup label="มุมมองพิเศษ">
                    <option value="ภาพรวม">ภาพรวม (ทั้งหมด)</option>
                    <option value="ระดับอนุบาล">ระดับอนุบาล (อนุบาล 1-3)</option>
                    <option value="ระดับประถมศึกษา">ระดับประถมศึกษา (ป.1-ป.6)</option>
                    <option value="จบการศึกษา">จบการศึกษา (ศิษย์เก่า)</option>
                  </optgroup>
                )}
                <optgroup label="รายชั้นเรียน">
                  {uniqueGrades.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </optgroup>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Tabs and Filters */}
        <div className="flex flex-col gap-4 w-full">
          <div className="grid grid-cols-2 lg:flex lg:flex-wrap bg-white/50 backdrop-blur-sm rounded-2xl p-1.5 shadow-sm border border-slate-100 w-full gap-1.5">
            <button
              onClick={() => setActiveTab("students")}
              className={`flex-1 flex flex-col lg:flex-row items-center justify-center gap-1.5 lg:gap-2 py-3 lg:py-2 px-2 rounded-xl text-xs lg:text-sm font-bold transition-all ${
                activeTab === "students"
                  ? "bg-white text-pink-600 shadow-sm ring-1 ring-slate-200/50"
                  : "text-slate-500 hover:bg-white/60 hover:text-slate-700"
              }`}
            >
              <UserPlus className="h-5 w-5 lg:h-4 lg:w-4 shrink-0" /> 
              <span className="text-center lg:text-left leading-tight">ฐานข้อมูลนักเรียน</span>
            </button>
            <button
              onClick={() => { setSelectedStudent360(null); setActiveTab("student360"); }}
              className={`flex-1 flex flex-col lg:flex-row items-center justify-center gap-1.5 lg:gap-2 py-3 lg:py-2 px-2 rounded-xl text-xs lg:text-sm font-bold transition-all ${
                activeTab === "student360"
                  ? "bg-white text-sky-600 shadow-sm ring-1 ring-slate-200/50"
                  : "text-slate-500 hover:bg-white/60 hover:text-slate-700"
              }`}
            >
              <User className="h-5 w-5 lg:h-4 lg:w-4 shrink-0" />
              <span className="text-center lg:text-left leading-tight">Student 360°</span>
            </button>
            <button
              onClick={() => setActiveTab("attendance")}
              className={`flex-1 flex flex-col lg:flex-row items-center justify-center gap-1.5 lg:gap-2 py-3 lg:py-2 px-2 rounded-xl text-xs lg:text-sm font-bold transition-all ${
                activeTab === "attendance"
                  ? "bg-white text-pink-600 shadow-sm ring-1 ring-slate-200/50"
                  : "text-slate-500 hover:bg-white/60 hover:text-slate-700"
              }`}
            >
              <CalendarCheck className="h-5 w-5 lg:h-4 lg:w-4 shrink-0" /> 
              <span className="text-center lg:text-left leading-tight">เช็กชื่อเข้าเรียน</span>
            </button>
            <button
              onClick={() => setActiveTab("assessments")}
              className={`flex-1 flex flex-col lg:flex-row items-center justify-center gap-1.5 lg:gap-2 py-3 lg:py-2 px-2 rounded-xl text-xs lg:text-sm font-bold transition-all ${
                activeTab === "assessments"
                  ? "bg-white text-pink-600 shadow-sm ring-1 ring-slate-200/50"
                  : "text-slate-500 hover:bg-white/60 hover:text-slate-700"
              }`}
            >
              <CheckCircle className="h-5 w-5 lg:h-4 lg:w-4 shrink-0" /> 
              <span className="text-center lg:text-left leading-tight">ประเมินพัฒนาการ</span>
            </button>
            <button
              onClick={() => setActiveTab("special-care")}
              className={`col-span-2 lg:col-span-1 flex-1 flex flex-col lg:flex-row items-center justify-center gap-1.5 lg:gap-2 py-3 lg:py-2 px-2 rounded-xl text-xs lg:text-sm font-bold transition-all ${
                activeTab === "special-care"
                  ? "bg-white text-pink-600 shadow-sm ring-1 ring-slate-200/50"
                  : "text-slate-500 hover:bg-white/60 hover:text-slate-700"
              }`}
            >
              <HeartPulse className="h-5 w-5 lg:h-4 lg:w-4 shrink-0" /> 
              <span className="text-center lg:text-left leading-tight">ข้อมูลสุขภาพและร่างกาย</span>
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-between items-start sm:items-center">
            <div className={`flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 shrink-0 w-full sm:w-auto transition-opacity duration-200 ${(activeTab === 'assessments' || activeTab === 'special-care') ? 'opacity-100' : 'opacity-0 hidden sm:flex pointer-events-none'}`}>
              <label className="text-sm font-bold text-slate-700 whitespace-nowrap">ประจำเดือน:</label>
              <div className="flex items-center min-w-[120px]">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="text-sm outline-none bg-white font-bold text-pink-600 border border-slate-200 rounded px-2 py-1 focus:ring-2 focus:ring-pink-500"
                />
              </div>
              {selectedMonth && activeTab === 'special-care' && (
                <button 
                  onClick={() => setSelectedMonth('')}
                  className="text-slate-400 hover:text-slate-600 flex-shrink-0 ml-1 relative z-10"
                  title="ล้างการเลือกเดือน (ดูข้อมูลล่าสุด)"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <div className="relative w-full sm:w-80 shrink-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="ค้นหานักเรียน (ทั้งหมด)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl shadow-sm text-sm font-medium text-slate-700 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white w-full transition-all"
              />
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden w-full">
          
          {activeTab === "student360" && (
            <div className="p-4 sm:p-6">
              <Student360 initialStudent={selectedStudent360} />
            </div>
          )}
{activeTab === "students" && (
            <div className="p-4 sm:p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <h3 className="text-lg font-black text-slate-800 flex flex-wrap items-center gap-2">
                    {searchQuery ? (
                      <>ผลการค้นหา: <span className="text-pink-600">"{searchQuery}"</span></>
                    ) : (
                      <div className="flex flex-col">
                        <span className="whitespace-nowrap">รายชื่อนักเรียน</span>
                        <span className="text-sm font-bold text-pink-600 mt-0.5 whitespace-nowrap">{selectedGrade}</span>
                      </div>
                    )}
                  </h3>
                  <div className="flex flex-wrap gap-2 text-sm font-medium">
                    <span className="bg-slate-100 px-3 py-1 rounded-lg text-slate-600 whitespace-nowrap">
                      ทั้งหมด: <span className="font-bold text-slate-900">{totalCount}</span> คน
                    </span>
                    <span className="bg-blue-50 px-3 py-1 rounded-lg text-blue-700 whitespace-nowrap">
                      ชาย: <span className="font-bold">{maleCount}</span> คน
                    </span>
                    <span className="bg-pink-50 px-3 py-1 rounded-lg text-pink-700 whitespace-nowrap">
                      หญิง: <span className="font-bold">{femaleCount}</span> คน
                    </span>
                  </div>
                  {homeroomTeachers.length > 0 && (
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 shadow-sm flex items-center gap-1.5">
                        <Users className="h-3 w-3 text-slate-400" />
                        ครูประจำชั้น:
                      </span>
                      {homeroomTeachers.map((ht, idx) => (
                        <div key={ht.id} className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60 shadow-sm flex items-center gap-1.5">
                          
                          <span>
                            {ht.thaiName} 
                            {ht.homeroomClass === selectedGrade && ht.coHomeroomClass === selectedGrade 
                              ? ' (ประจำชั้น/คู่ชั้น)' 
                              : ht.homeroomClass === selectedGrade 
                                ? ' (ประจำชั้น)' 
                                : ' (คู่ชั้น)'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full md:w-auto">
                  <button
                    onClick={() => {
                      const backupStr = JSON.stringify(studentsInGrade, null, 2);
                      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(backupStr);
                      const exportFileDefaultName = `LessonClass_Students_${selectedGrade}_${new Date().toISOString().slice(0, 10)}.json`;
                      const linkElement = document.createElement("a");
                      linkElement.setAttribute("href", dataUri);
                      linkElement.setAttribute("download", exportFileDefaultName);
                      linkElement.click();
                    }}
                    className="w-full justify-center sm:w-auto flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-white hover:bg-pink-50 text-slate-600 hover:text-pink-600 border border-slate-200 rounded-lg font-bold transition-colors shadow-sm"
                    title="สำรองข้อมูลเป็นไฟล์ JSON"
                  >
                    <FileJson className="h-4 w-4 sm:h-4 sm:w-4 text-slate-400" />
                    <span>สำรองข้อมูล</span>
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="w-full justify-center sm:w-auto flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 border border-slate-200 rounded-lg font-bold transition-colors shadow-sm"
                    title="นำไปใช้ใน Excel / Sheets (CSV)"
                  >
                    <FileText className="h-4 w-4 sm:h-4 sm:w-4 text-slate-400" />
                    <span>Excel / Sheets</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full md:w-auto">

                  <select
                    value={genderFilter}
                    onChange={(e) =>
                      setGenderFilter(
                        e.target.value as "all" | "male" | "female",
                      )
                    }
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-pink-500 bg-white w-full sm:w-auto"
                  >
                    <option value="all">เพศ: ทั้งหมด</option>
                    <option value="male">เพศ: ชาย</option>
                    <option value="female">เพศ: หญิง</option>
                  </select>
                  <button
                    onClick={exportToCSV}
                    className="w-full justify-center sm:w-auto bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors border border-indigo-200"
                  >
                    <Download className="h-4 w-4" /> ส่งออก CSV
                  </button>
                  {uniqueGrades.includes(selectedGrade) && (
                    <>
{isStudentManager && (                      <button
                        onClick={() => setShowImport(true)}
                        className="w-full justify-center sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                      >
                        <FileSpreadsheet className="h-4 w-4" /> นำเข้าข้อมูล
                        (Excel/CSV)
                      </button>)}

{isStudentManager && (
                        <>
                      <button
                        onClick={() => {
                          setEditingStudent(null);
                          setShowStudentModal(true);
                        }}
                        className="w-full justify-center sm:w-auto bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors whitespace-nowrap"
                      >
                        <UserPlus className="h-4 w-4" /> เพิ่มนักเรียน
                      </button>
                      <button
                        onClick={() => setShowBatchPromotion(true)}
                        className="w-full justify-center sm:w-auto bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors whitespace-nowrap"
                      >
                        <TrendingUp className="h-4 w-4" /> เลื่อนชั้นทั้งห้อง
                      </button>
                      {GRADE_LEVELS.some(g => g.startsWith(selectedGrade + "/")) && (
                        <button
                          onClick={() => setShowAssignSection(true)}
                          className="w-full justify-center sm:w-auto bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors whitespace-nowrap"
                        >
                          <Users className="h-4 w-4" /> ย้ายห้อง/จัดห้องย่อย
                        </button>
                      )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm w-full">
                  {displayedStudents.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      ไม่พบข้อมูลนักเรียนในระดับชั้นนี้
                    </div>
                  ) : (
                    displayedStudents.map((student) => (
                      <div
                        key={student.id}
                        className={`p-3 sm:px-4 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-4 border-b border-slate-100 last:border-0 ${student.status === "active" ? "even:bg-slate-50/30" : "bg-slate-100/40 opacity-70 grayscale-[0.3] relative"}`}
                      >
                        <div className="flex items-start gap-2.5 relative z-10">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm shrink-0 mt-0.5">
                            {student.number}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-slate-700 text-sm truncate whitespace-normal leading-tight flex items-center gap-2 flex-wrap">
                              <span className={student.status !== "active" ? "line-through text-slate-400" : ""}>
                                {student.firstName} {student.lastName}
                                {student.nickname && <span className="block sm:inline sm:ml-1 text-slate-500 font-normal">({student.nickname})</span>}
                              </span>
                              {student.gender === "male" ? (
                                <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0">ชาย</span>
                              ) : (
                                <span className="bg-pink-50 text-pink-600 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0">หญิง</span>
                              )}
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${student.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600 border border-rose-200"}`}
                              >
                                {student.status === "active" ? "ปกติ" : "ย้าย/ออก"}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-0.5">
                              <span className={student.status !== "active" ? "line-through" : ""}>รหัส: {student.studentId}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0"></span>
                              <span>ชั้น: {student.gradeLevel || '-'}</span>
                            </div>
                            
                            {/* Health Tags */}
                            {(student.allergicFood || student.congenitalDisease || student.allergicMedicine || student.medicalInfo) && (
                              <div className="flex flex-wrap items-center gap-1 mt-1.5">
                                {student.allergicFood && (
                                  <span className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-[10px] font-bold" title={`แพ้อาหาร: ${student.allergicFood}`}>
                                    <AlertTriangle className="h-3 w-3" /> แพ้อาหาร
                                  </span>
                                )}
                                {student.congenitalDisease && (
                                  <span className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-[10px] font-bold" title={`โรคประจำตัว: ${student.congenitalDisease}`}>
                                    <AlertTriangle className="h-3 w-3" /> โรคประจำตัว
                                  </span>
                                )}
                                {student.allergicMedicine && (
                                  <span className="flex items-center gap-1 bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full text-[10px] font-bold" title={`แพ้ยา: ${student.allergicMedicine}`}>
                                    <AlertTriangle className="h-3 w-3" /> แพ้ยา
                                  </span>
                                )}
                                {student.medicalInfo && (
                                  <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold" title={`อื่นๆ: ${student.medicalInfo}`}>
                                    <AlertTriangle className="h-3 w-3" /> อื่นๆ
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-row items-center justify-end md:justify-center gap-1 sm:gap-2 w-full md:w-auto mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-0 border-slate-100 relative z-10">
                          {(isStudentManager || currentTeacher?.role === 'staff' || (currentTeacher && (currentTeacher.homeroomClass === student.gradeLevel || currentTeacher.coHomeroomClass === student.gradeLevel))) && (
                            <button
                              onClick={() => setViewingStudent(student)}
                              className="flex items-center justify-center gap-1 flex-1 md:flex-none p-1.5 sm:px-3 text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg transition-colors text-xs font-bold"
                              title="ดูข้อมูลนักเรียน"
                            >
                              <Search className="h-3.5 w-3.5" /> <span className="md:hidden lg:inline">ดูข้อมูล</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedStudent360(student);
                              setActiveTab("student360");
                            }}
                            className="flex items-center justify-center flex-1 md:flex-none px-4 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 text-xs font-black tracking-widest"
                            title="ดูข้อมูล Student 360°"
                          >
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 to-cyan-600">360&deg;</span>
                          </button>
                          
                          {isStudentManager && (
                            <div className="flex gap-1 ml-auto md:ml-0">
                              {(student.status === "active" || currentTeacher?.role === 'admin') ? (
                                <button
                                  onClick={() => {
                                    setEditingStudent(student);
                                    setShowStudentModal(true);
                                  }}
                                  className="p-1.5 sm:p-2 text-slate-400 hover:text-sky-600 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-200 rounded-lg transition-colors"
                                  title="แก้ไขข้อมูล"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                              ) : (
                                <div
                                  className="p-1.5 sm:p-2 text-slate-300 bg-slate-50 border border-slate-100 rounded-lg cursor-not-allowed opacity-50"
                                  title="นักเรียนย้าย/ลาออกไปแล้ว (Admin เท่านั้นที่สามารถแก้ไขได้)"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </div>
                              )}
                              
                              {canDeleteStudent && (
                                <button
                                  onClick={() =>
                                    setStudentToDelete({
                                      id: student.id,
                                      name: `${student.firstName} ${student.lastName}`,
                                    })
                                  }
                                  className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-colors"
                                  title="ลบนักเรียน"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
            </div>
          )}

          {activeTab === "attendance" && currentTeacher && (
            <div className="p-2 sm:p-6 relative animate-in fade-in duration-300">
              <AttendanceTracking 
                students={displayedStudents}
                gradeLevel={selectedGrade}
                teacherId={currentTeacher.id}
                teacherName={currentTeacher.thaiName || currentTeacher.displayName || 'Unknown Teacher'}
                semester={systemSemester}
                academicYear={systemAcademicYear}
              />
            </div>
          )}

          {activeTab === "assessments" && (
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <h3 className="text-lg font-black text-slate-800 flex flex-wrap items-center gap-2">
                    ประเมินพัฒนาการนักเรียน
                    {searchQuery && (
                       <span className="text-sm font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full ml-2">
                         ค้นหา: "{searchQuery}"
                       </span>
                    )}
                  </h3>
                  <div className="flex flex-wrap gap-2 text-sm font-medium">
                    <span className="bg-slate-100 px-3 py-1 rounded-lg text-slate-600 whitespace-nowrap">
                      ทั้งหมด: <span className="font-bold text-slate-900">{totalCount}</span> คน
                    </span>
                    <span className="bg-blue-50 px-3 py-1 rounded-lg text-blue-700 whitespace-nowrap">
                      ชาย: <span className="font-bold">{maleCount}</span> คน
                    </span>
                    <span className="bg-pink-50 px-3 py-1 rounded-lg text-pink-700 whitespace-nowrap">
                      หญิง: <span className="font-bold">{femaleCount}</span> คน
                    </span>
                  </div>
                  {homeroomTeachers.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 items-center">
                      <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 shadow-sm flex items-center gap-1.5">
                        <Users className="h-3 w-3 text-slate-400" />
                        ครูประจำชั้น:
                      </span>
                      {homeroomTeachers.map((ht, idx) => (
                        <div key={ht.id} className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60 shadow-sm flex items-center gap-1.5">
                          
                          <span>
                            {ht.thaiName} 
                            {ht.homeroomClass === selectedGrade && ht.coHomeroomClass === selectedGrade 
                              ? ' (ประจำชั้น/คู่ชั้น)' 
                              : ht.homeroomClass === selectedGrade 
                                ? ' (ประจำชั้น)' 
                                : ' (คู่ชั้น)'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full md:w-auto mt-4 md:mt-0">

                  <select
                    value={genderFilter}
                    onChange={(e) =>
                      setGenderFilter(
                        e.target.value as "all" | "male" | "female",
                      )
                    }
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-pink-500 bg-white w-full sm:w-auto"
                  >
                    <option value="all">เพศ: ทั้งหมด</option>
                    <option value="male">เพศ: ชาย</option>
                    <option value="female">เพศ: หญิง</option>
                  </select>
                  <button
                    onClick={printBatchReport}
                    className="w-full justify-center sm:w-auto bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                  >
                    <Printer className="h-4 w-4" /> ออกรายงานรวม
                  </button>
                  <button
                    onClick={printFeedbackBatchReport}
                    className="w-full justify-center sm:w-auto bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                  >
                    <Printer className="h-4 w-4" /> พิมพ์แบบตอบกลับ (ฟอร์มเปล่า)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedStudents.map((student) => {
                  const hasAssessed = !!assessments[student.id];
                  const assessment = assessments[student.id];
                  return (
                    <div
                      key={student.id}
                      className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow flex flex-col"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="text-xs font-bold text-pink-500 mb-1 flex items-center gap-2">
                            <span>เลขที่ {student.number}</span>
                            <span className="bg-pink-100 text-pink-700 px-2 rounded-full">{student.gradeLevel || '-'}</span>
                          </div>
                          <div className="font-bold text-slate-800">
                            {student.firstName} {student.lastName}
                            {student.nickname && <span className="block sm:inline sm:ml-1 text-slate-500 font-normal">({student.nickname})</span>}
                          </div>
                        </div>
                        {hasAssessed ? (
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-slate-200"></div>
                        )}
                      </div>

                      {assessment?.lastEditedBy && (
                        <div className="mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100 mb-2 text-[10px]">
                          <div
                            className="flex items-center justify-between cursor-pointer select-none"
                            onClick={() => toggleHistory(student.id)}
                          >
                            <div className="flex items-center space-x-1 min-w-0">
                              <History className="h-3 w-3 text-sky-600 shrink-0" />
                              <span className="font-bold text-slate-600 truncate">
                                แก้ไขล่าสุดโดย: {assessment.lastEditedBy}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 shrink-0 text-slate-400">
                              <Clock className="h-3 w-3" />
                              <span>
                                {formatThaiDateTime(assessment.lastEditedAt)}
                              </span>
                            </div>
                          </div>
                          {expandedHistory[student.id] &&
                            assessment.editHistory &&
                            assessment.editHistory.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-slate-200 space-y-1 max-h-24 overflow-y-auto">
                                {assessment.editHistory
                                  .slice()
                                  .reverse()
                                  .map((history, idx) => (
                                    <div
                                      key={idx}
                                      className="flex justify-between items-center bg-white px-2 py-1 rounded border border-slate-50"
                                    >
                                      <span className="text-slate-500 font-medium">
                                        ครั้งที่{" "}
                                        {assessment.editHistory!.length - idx}:{" "}
                                        <span className="text-slate-700">
                                          {history.editedBy}
                                        </span>
                                      </span>
                                      <span className="text-slate-400 italic">
                                        {formatThaiDateTime(history.editedAt)}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            )}
                        </div>
                      )}

                      <div className="mt-auto pt-2 flex gap-2">
                        <button
                          onClick={() => setEvaluatingStudent(student)}
                          disabled={student.status !== "active"}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold text-center transition-colors ${
                            student.status !== "active"
                              ? "bg-slate-50 text-slate-400 cursor-not-allowed opacity-70"
                              : hasAssessed
                              ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                              : "bg-pink-100 text-pink-700 hover:bg-pink-200"
                          }`}
                          title={student.status !== "active" ? "ไม่สามารถประเมินนักเรียนที่ย้าย/ออกแล้วได้" : ""}
                        >
                          {hasAssessed ? "แก้ไขประเมิน" : "เริ่มประเมิน"}
                        </button>

                        <button
                          onClick={() => printSingleReport(student)}
                          disabled={!hasAssessed}
                          className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${
                            hasAssessed
                              ? "bg-sky-100 text-sky-700 hover:bg-sky-200"
                              : "bg-slate-50 text-slate-300 cursor-not-allowed"
                          }`}
                          title="พิมพ์รายงานรายบุคคล"
                        >
                          <Printer className="h-4 w-4" />
                        </button>

                        {hasAssessed &&
                          assessment &&
                          (currentTeacher?.role === "admin" ||
                            currentTeacher?.id === assessment.teacherId) && (
                            <button
                              onClick={() => setAssessmentToDelete(assessment)}
                              className="px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center transition-colors bg-rose-50 text-rose-600 hover:bg-rose-100"
                              title="ลบการประเมิน"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                      </div>
                    </div>
                  );
                })}
                {displayedStudents.length === 0 && (
                  <div className="col-span-full text-center py-8 text-slate-500">
                    ไม่พบข้อมูลนักเรียนในระดับชั้นนี้
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "special-care" && (() => {
  const allergicMedStudents = studentsInGrade.filter((s) => s.allergicMedicine && s.allergicMedicine !== 'ไม่มี' && s.allergicMedicine !== '-');
  const otherMedicalStudents = studentsInGrade.filter((s) => s.medicalInfo && s.medicalInfo !== 'ไม่มี' && s.medicalInfo !== '-');
  const allAllergicFoodStudents = studentsInGrade.filter((s) => s.allergicFood && s.allergicFood !== 'ไม่มี' && s.allergicFood !== '-');
  const allCongenitalDiseaseStudents = studentsInGrade.filter((s) => s.congenitalDisease && s.congenitalDisease !== 'ไม่มี' && s.congenitalDisease !== '-');
  
  const allSpecialCareStudents = studentsInGrade.filter(s => 
    (s.allergicMedicine && s.allergicMedicine !== 'ไม่มี' && s.allergicMedicine !== '-') || 
    (s.medicalInfo && s.medicalInfo !== 'ไม่มี' && s.medicalInfo !== '-') || 
    (s.allergicFood && s.allergicFood !== 'ไม่มี' && s.allergicFood !== '-') || 
    (s.congenitalDisease && s.congenitalDisease !== 'ไม่มี' && s.congenitalDisease !== '-')
  );

  const diseaseData = [
    { name: 'แพ้ยา', value: allergicMedStudents.length, fill: '#8b5cf6' },
    { name: 'แพ้อาหาร', value: allAllergicFoodStudents.length, fill: '#f97316' },
    { name: 'โรคประจำตัว', value: allCongenitalDiseaseStudents.length, fill: '#e11d48' },
    { name: 'อื่นๆ', value: otherMedicalStudents.length, fill: '#64748b' }
  ].filter(d => d.value > 0);

  const congenitalDiseaseCounts = allCongenitalDiseaseStudents.reduce((acc, s) => {
    const raw = (s.congenitalDisease || '').trim();
    const diseases = raw.split(/[,/]+/).map(d => d.trim()).filter(Boolean);
    diseases.forEach(d => {
      acc[d] = (acc[d] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const congenitalBarData = Object.entries(congenitalDiseaseCounts)
    .map(([name, value]) => ({ name, value, fill: '#e11d48' }))
    .sort((a, b) => (b.value as number) - (a.value as number));

  const hasAnySpecialCare = diseaseData.length > 0 || congenitalBarData.length > 0;

  const getStudentHealthData = (student: Student) => {
    // If you need latest assessment weight/height for special care display (optional)
    const stAssessments = (Object.values(assessments) as StudentAssessment[]).filter(a => a.studentId === student.id).sort((a, b) => (b.month || '').localeCompare(a.month || ''));
    if (stAssessments.length > 0) {
      return { weight: stAssessments[0].weight, height: stAssessments[0].height };
    }
    return { weight: null, height: null };
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-rose-50/50 p-4 rounded-xl border border-rose-100 items-start">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-rose-500" />
            ข้อมูลสุขภาพนักเรียน
          </h3>
          <p className="text-slate-500 text-sm">
            นักเรียนที่มีข้อมูลสุขภาพ แพ้อาหาร แพ้ยา โรคประจำตัว รวมถึงการประเมิน<span className="whitespace-nowrap">น้ำหนักและส่วนสูง</span>
          </p>
        </div>
        <div className="flex flex-col md:items-end gap-3 justify-center h-full">
          <div className="flex flex-wrap gap-2 text-sm font-medium">
             <span className="bg-white px-3 py-1.5 rounded-lg text-slate-600 shadow-sm border border-rose-100 whitespace-nowrap flex items-center gap-2">
                ต้องการการดูแลพิเศษ: <span className="font-black text-rose-600 text-base">{allSpecialCareStudents.length}</span> คน
             </span>
          </div>
        </div>
      </div>

      {!hasAnySpecialCare ? (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center flex flex-col items-center justify-center">
          <div className="h-16 w-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">ไม่มีข้อมูลสุขภาพที่ต้องดูแลเป็นพิเศษ</h3>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
              <h4 className="font-bold text-slate-700 mb-1 text-center">ภาพรวมข้อมูลสุขภาพ ({selectedGrade.includes('ทั้งหมด') ? selectedGrade : 'ห้อง ' + selectedGrade})</h4>
              <p className="text-xs text-slate-500 text-center mb-4">จำนวนนักเรียนในกลุ่มนี้ {diseaseData.reduce((acc, curr) => acc + Number(curr.value || 0), 0)} รายการ</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={diseaseData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ percent }) => percent < 0.1 ? '' : `${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {diseaseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value) => [`${value} คน`, 'จำนวน']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
              <h4 className="font-bold text-slate-700 mb-1 text-center">สถิติโรคประจำตัวทั้งหมด</h4>
              <p className="text-xs text-slate-500 text-center mb-4">พบโรคประจำตัว {congenitalBarData.reduce((acc, curr) => acc + Number(curr.value || 0), 0)} รายการ</p>
              <div className="h-64 w-full">
                {congenitalBarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={congenitalBarData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={80} />
                      <RechartsTooltip 
                        formatter={(value) => [`${value} คน`, 'จำนวน']}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={40}>
                        {congenitalBarData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm">ไม่มีข้อมูลโรคประจำตัว</div>
                )}
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="flex flex-col border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
                  {allSpecialCareStudents.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      ไม่พบข้อมูลสุขภาพที่ต้องระวัง
                    </div>
                  ) : (
                    allSpecialCareStudents.map((student) => {
                      const { weight, height } = getStudentHealthData(student);
                      let bmiLabel = '';
                      let bmiColor = '';
                      let bmiText = '-';
                      if (weight && height) {
                        const h = height / 100;
                        const bmi = weight / (h * h);
                        let ageYears = 7;
                        if (student.dob) {
                          const birthDate = new Date(student.dob);
                          const now = new Date();
                          ageYears = now.getFullYear() - birthDate.getFullYear();
                        }
                        const baseNormal = 14 + (ageYears - 6) * 0.3;
                        const baseObese1 = 20 + (ageYears - 6) * 0.6;
                        if (bmi < baseNormal) { bmiLabel = 'ผอม'; bmiColor = 'text-blue-600 bg-blue-50 border-blue-200'; }
                        else if (bmi >= baseObese1) { bmiLabel = 'เริ่มอ้วน/อ้วน'; bmiColor = 'text-red-600 bg-red-50 border-red-200'; }
                        else { bmiLabel = 'สมส่วน'; bmiColor = 'text-green-600 bg-green-50 border-green-200'; }
                        bmiText = `${weight} กก. / ${height} ซม. (BMI ${bmi.toFixed(1)})`;
                      }

                      return (
                        <div key={student.id} className="p-3 sm:px-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-4">
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center font-bold text-pink-600 text-sm shrink-0 mt-0.5">
                              {student.number}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-slate-700 text-sm truncate whitespace-normal leading-tight flex items-center gap-2 flex-wrap">
                                <span>
                                  {student.firstName} {student.lastName}
                                  {student.nickname && <span className="block sm:inline sm:ml-1 text-slate-500 font-normal">({student.nickname})</span>}
                                </span>
                                <span className="bg-pink-50 text-pink-600 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0">{student.gradeLevel || '-'}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                รหัส: {student.studentId}
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                {bmiLabel && (
                                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${bmiColor}`}>
                                    {bmiText} - {bmiLabel}
                                  </div>
                                )}
                                {student.congenitalDisease && student.congenitalDisease !== 'ไม่มี' && student.congenitalDisease !== '-' && (
                                  <div className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md font-bold text-[10px] border border-rose-100">โรค: {student.congenitalDisease}</div>
                                )}
                                {student.allergicFood && student.allergicFood !== 'ไม่มี' && student.allergicFood !== '-' && (
                                  <div className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md font-bold text-[10px] border border-orange-100">แพ้อาหาร: {student.allergicFood}</div>
                                )}
                                {student.allergicMedicine && student.allergicMedicine !== 'ไม่มี' && student.allergicMedicine !== '-' && (
                                  <div className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md font-bold text-[10px] border border-purple-100">แพ้ยา: {student.allergicMedicine}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
          </div>
        </div>
      )}
    </div>
  );
})()}{/* BMI Report appended to special-care */}
          {activeTab === "special-care" && (() => {
  
  const currentStudentIds = new Set(students.map(s => s.id));
  const availableMonthsSet = new Set<string>();
  allAssessments.forEach(a => { 
    if (a.month && currentStudentIds.has(a.studentId)) {
      availableMonthsSet.add(a.month); 
    }
  });
  const availableMonths = Array.from(availableMonthsSet).sort().reverse();
  
  const currentChartMonth = selectedMonth || availableMonths[0];
  const displayMonths = showHistoryCompare ? availableMonths.slice(0, 4).reverse() : currentChartMonth ? [currentChartMonth] : [];

  let bmiData: any[] = [];
  let bmiByGradeData: any[] = [];
  
  if (currentChartMonth) {
    const currentAssessments = allAssessments.filter(a => a.month === currentChartMonth);
    
    let underweight = 0;
    let normal = 0;
    let overweight = 0;
    let obese1 = 0;
    let obese2 = 0;
    let unknown = 0;
    
    const studentsToCalculate = students.filter(s => {
      if (s.status === 'graduated' || s.status === 'inactive') return false;
      if (selectedGrade === 'ภาพรวม') return true;
      if (selectedGrade.includes('อนุบาล')) return (s.gradeLevel || '').includes('อนุบาล');
      if (selectedGrade.includes('ประถม')) return (s.gradeLevel || '').includes('ประถม');
      if (selectedGrade.includes('มัธยม')) return (s.gradeLevel || '').includes('มัธยม');
      return s.gradeLevel === selectedGrade;
    });
    const currentGradeBmiStats = { underweight: 0, normal: 0, overweight: 0, obese1: 0, obese2: 0, unknown: 0 };
    
    const gradeStats: Record<string, { grade: string, underweight: number, normal: number, overweight: number, obese1: number, obese2: number, unknown: number }> = {};
    const inGradeIds = new Set(studentsInGrade.map(st => st.id));
    
    studentsToCalculate.forEach(s => {
      const assessment = currentAssessments.find(a => a.studentId === s.id);
      const grade = s.gradeLevel || 'ไม่ระบุ';
      if (!gradeStats[grade]) {
        gradeStats[grade] = { grade, underweight: 0, normal: 0, overweight: 0, obese1: 0, obese2: 0, unknown: 0 };
      }
      
      if (assessment && assessment.weight && assessment.height) {
        const w = assessment.weight;
        const h = assessment.height / 100;
        const bmi = w / (h * h);
        
        if (!s.dob) {
           unknown++;
           gradeStats[grade].unknown++;
           if(s.gradeLevel === selectedGrade) currentGradeBmiStats.unknown++;
        } else {
          const birthDate = new Date(s.dob);
          const targetDate = new Date(`${currentChartMonth}-01`);
          let years = targetDate.getFullYear() - birthDate.getFullYear();
          if (targetDate.getMonth() < birthDate.getMonth()) {
            years--;
          }
          
          const baseNormal = 14 + (years - 6) * 0.3;
          const baseOverweight = 18 + (years - 6) * 0.5;
          const baseObese1 = 20 + (years - 6) * 0.6;
          const baseObese2 = 22 + (years - 6) * 0.7;
          
          let cat = '';
          if (bmi < baseNormal) cat = 'underweight';
          else if (bmi < baseOverweight) cat = 'normal';
          else if (bmi < baseObese1) cat = 'overweight';
          else if (bmi < baseObese2) cat = 'obese1';
          else cat = 'obese2';
          
          if (cat === 'underweight') { underweight++; gradeStats[grade].underweight++; if(inGradeIds.has(s.id)) currentGradeBmiStats.underweight++; }
          else if (cat === 'normal') { normal++; gradeStats[grade].normal++; if(inGradeIds.has(s.id)) currentGradeBmiStats.normal++; }
          else if (cat === 'overweight') { overweight++; gradeStats[grade].overweight++; if(inGradeIds.has(s.id)) currentGradeBmiStats.overweight++; }
          else if (cat === 'obese1') { obese1++; gradeStats[grade].obese1++; if(inGradeIds.has(s.id)) currentGradeBmiStats.obese1++; }
          else if (cat === 'obese2') { obese2++; gradeStats[grade].obese2++; if(inGradeIds.has(s.id)) currentGradeBmiStats.obese2++; }
        }
      }
    });
    
    if (currentGradeBmiStats.underweight > 0) bmiData.push({ name: 'ผอม', value: currentGradeBmiStats.underweight, fill: '#3b82f6' });
    if (currentGradeBmiStats.normal > 0) bmiData.push({ name: 'สมส่วน', value: currentGradeBmiStats.normal, fill: '#22c55e' });
    if (currentGradeBmiStats.overweight > 0) bmiData.push({ name: 'ท้วม', value: currentGradeBmiStats.overweight, fill: '#eab308' });
    if (currentGradeBmiStats.obese1 > 0) bmiData.push({ name: 'เริ่มอ้วน', value: currentGradeBmiStats.obese1, fill: '#f97316' });
    if (currentGradeBmiStats.obese2 > 0) bmiData.push({ name: 'อ้วน', value: currentGradeBmiStats.obese2, fill: '#ef4444' });
    if (currentGradeBmiStats.unknown > 0) bmiData.push({ name: 'ขาดวันเกิด', value: currentGradeBmiStats.unknown, fill: '#94a3b8' });
    
    const shortenGrade = (g) => {
      let short = g.replace('ประถมศึกษาปีที่ ', 'ป.');
      short = short.replace('มัธยมศึกษาปีที่ ', 'ม.');
      short = short.replace('อนุบาลปีที่ ', 'อ.');
      short = short.replace('อนุบาล ', 'อ.');
      return short;
    };
    bmiByGradeData = Object.values(gradeStats).map(st => ({...st, shortGrade: shortenGrade(st.grade)})).sort((a, b) => a.grade.localeCompare(b.grade));
  }

  return (
    <div className="px-6 pb-6 pt-2 border-t border-slate-100 mt-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Activity className="h-5 w-5 text-rose-500" />
            รายงานสรุปพัฒนาการทางร่างกาย (BMI)
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            เปรียบเทียบข้อมูล BMI ของนักเรียน
          </p>
        </div>
        <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
          <button
            onClick={printBatchHealthReport}
            className="w-full justify-center sm:w-auto px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <Printer className="h-4 w-4" /> พิมพ์รายงานทั้งหมด
          </button>
          <button
            onClick={() => setShowHistoryCompare(!showHistoryCompare)}
            className={`w-full justify-center sm:w-auto px-4 py-2 rounded-xl text-sm font-bold border transition-colors flex items-center ${showHistoryCompare ? 'bg-pink-50 text-pink-600 border-pink-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            {showHistoryCompare ? 'ซ่อนเปรียบเทียบย้อนหลัง' : 'เปรียบเทียบย้อนหลัง 4 เดือน'}
          </button>
          {currentChartMonth && (
            <div className="bg-pink-50 text-pink-700 px-4 py-2 rounded-lg font-bold text-sm">
              ข้อมูลประจำเดือน {formatThaiMonthYear(currentChartMonth).replace('256', '6')}
            </div>
          )}
        </div>
      </div>
      
      {currentChartMonth && bmiData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
            <h4 className="font-bold text-slate-700 mb-1 text-center">สัดส่วนนักเรียนแยกตามเกณฑ์ ({selectedGrade.includes('ทั้งหมด') ? selectedGrade : 'ห้อง ' + selectedGrade})</h4>
            <p className="text-xs text-slate-500 text-center mb-4">จำนวนที่มีข้อมูล {bmiData.reduce((acc, curr) => acc + curr.value, 0)} คน</p>
            <div className="h-64 w-full">
            {bmiData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bmiData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    dataKey="value"
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {bmiData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value) => [`${value} คน`, 'จำนวน']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                ไม่มีข้อมูลน้ำหนัก/ส่วนสูง
              </div>
            )}
            </div>
          </div>
          
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
            <h4 className="font-bold text-slate-700 mb-1 text-center">สัดส่วนนักเรียนแยกตามเกณฑ์ (รายชั้นปี)</h4>
            <p className="text-xs text-slate-500 text-center mb-4">จำนวนที่มีข้อมูล {bmiByGradeData.reduce((acc, curr) => acc + curr.underweight + curr.normal + curr.overweight + curr.obese1 + curr.obese2 + curr.unknown, 0)} คน</p>
            <div className="h-64 w-full">
              {bmiByGradeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bmiByGradeData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="shortGrade" 
                      tick={{ fontSize: 11, fill: '#64748b' }} 
                      axisLine={false} 
                      tickLine={false} 
                      angle={-45} 
                      textAnchor="end" 
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: '#64748b' }} 
                      axisLine={false} 
                      tickLine={false} 
                      allowDecimals={false}
                    />
                    <RechartsTooltip 
                      formatter={(value, name) => [`${value} คน`, name]}
                      labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }}
                      payload={[
                        { value: 'ผอม', type: 'circle', color: '#3b82f6' },
                        { value: 'สมส่วน', type: 'circle', color: '#22c55e' },
                        { value: 'ท้วม', type: 'circle', color: '#eab308' },
                        { value: 'เริ่มอ้วน', type: 'circle', color: '#f97316' },
                        { value: 'อ้วน', type: 'circle', color: '#ef4444' },
                        { value: 'ขาดวันเกิด', type: 'circle', color: '#94a3b8' }
                      ]}
                    />
                    <Bar dataKey="underweight" name="ผอม" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="normal" name="สมส่วน" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="overweight" name="ท้วม" stackId="a" fill="#eab308" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="obese1" name="เริ่มอ้วน" stackId="a" fill="#f97316" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="obese2" name="อ้วน" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="unknown" name="ขาดวันเกิด" stackId="a" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                  ไม่มีข้อมูลระดับชั้น
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 mb-8 text-center text-slate-500 font-medium">
          {currentChartMonth ? 'ไม่มีข้อมูลพัฒนาการร่างกายในเดือนนี้' : 'กรุณาเลือกประจำเดือนเพื่อดูสรุปข้อมูล'}
        </div>
      )}
      
      <div className="flex flex-col border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden w-full">
              {displayedStudents.length === 0 ? (
                <div className="px-4 py-8 text-center text-slate-500">
                  ไม่มีข้อมูลนักเรียน
                </div>
              ) : (
                displayedStudents.map((student) => {
                  const studentDataMap: Record<string, any> = {};
                  
                  let currentAgeYears = 7;
                  let currentAgeMonths = 0;
                  const hasDob = !!student.dob;
                  if (hasDob) {
                    const birthDate = new Date(student.dob!);
                    const now = new Date();
                    
                    let years = now.getFullYear() - birthDate.getFullYear();
                    let months = now.getMonth() - birthDate.getMonth();
                    
                    if (months < 0 || (months === 0 && now.getDate() < birthDate.getDate())) {
                      years--;
                      months += (months < 0 ? 12 : 11);
                    }
                    
                    currentAgeYears = years;
                    currentAgeMonths = months;
                  }

                  displayMonths.forEach(m => {
                    const assessmentForMonth = allAssessments.find(a => a.studentId === student.id && a.month === m);
                    const weight = assessmentForMonth?.weight;
                    const height = assessmentForMonth?.height;
                    let bmi = null;
                    let label = '-';
                    let color = 'text-slate-500';

                    if (weight && height) {
                      const h = height / 100;
                      bmi = weight / (h * h);
                      
                      if (!hasDob) {
                        label = 'ไม่มีวันเกิด';
                        color = 'text-red-500';
                      } else {
                        const baseNormal = 14 + (currentAgeYears - 6) * 0.3;
                        const baseOverweight = 17 + (currentAgeYears - 6) * 0.4;
                        const baseObese1 = 20 + (currentAgeYears - 6) * 0.6;
                        const baseObese2 = 22 + (currentAgeYears - 6) * 0.7;

                        if (bmi < baseNormal) { label = 'ผอม'; color = 'text-blue-600'; }
                        else if (bmi < baseOverweight) { label = 'สมส่วน'; color = 'text-green-600'; }
                        else if (bmi < baseObese1) { label = 'ท้วม'; color = 'text-yellow-600'; }
                        else if (bmi < baseObese2) { label = 'เริ่มอ้วน'; color = 'text-orange-600'; }
                        else { label = 'อ้วน'; color = 'text-red-600'; }
                      }
                      
                      studentDataMap[m] = { weight, height, bmi, bmiLabel: label, bmiColor: color };
                    }
                  });

                  let trendIcon = <Minus className="h-4 w-4 text-slate-300" />;
                  if (displayMonths.length > 1) {
                    const oldestM = displayMonths[0];
                    const newestM = displayMonths[displayMonths.length - 1];
                    const oldestBmi = studentDataMap[oldestM]?.bmi;
                    const newestBmi = studentDataMap[newestM]?.bmi;
                    if (oldestBmi && newestBmi) {
                      const diff = newestBmi - oldestBmi;
                      if (diff > 0.5) trendIcon = <TrendingUp className="h-4 w-4 text-red-500" title={`เพิ่มขึ้น ${diff.toFixed(1)}`} />;
                      else if (diff < -0.5) trendIcon = <TrendingDown className="h-4 w-4 text-green-500" title={`ลดลง ${Math.abs(diff).toFixed(1)}`} />;
                    }
                  }

                  return (
                    <div key={student.id} className="p-3 sm:px-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 even:bg-slate-50/30">
                      <div className="flex items-start gap-2.5 min-w-[200px]">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm shrink-0 mt-0.5">
                          {student.number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-slate-700 text-sm truncate whitespace-normal leading-tight">
                            {student.firstName} {student.lastName}
                            {student.nickname && <span className="block sm:inline sm:ml-1 text-slate-500 font-normal">({student.nickname})</span>}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 flex flex-wrap gap-x-1.5 items-center">
                            <span>รหัส: {student.studentId}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0"></span>
                            <span>อายุ: {student.dob ? `${currentAgeYears} ปี ${currentAgeMonths} ด.` : '-'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col gap-1 w-full md:w-auto mt-2 md:mt-0 pl-10 md:pl-0">
                        {displayMonths.length === 0 ? (
                          <div className="text-sm text-slate-400">-</div>
                        ) : (
                          <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2">
                            {displayMonths.map(m => {
                              const d = studentDataMap[m];
                              return (
                                <div key={`${student.id}-${m}`} className="flex flex-col bg-slate-50 border border-slate-100 rounded-md p-1.5 min-w-[70px] sm:min-w-[90px]">
                                  <div className="text-[9px] text-slate-400 mb-0.5 truncate">{formatThaiMonthYear(m).replace('256', '6')}</div>
                                  {!d ? (
                                    <div className="text-xs text-slate-300 font-medium">-</div>
                                  ) : (
                                    <>
                                      <div className={`text-xs font-bold ${d.bmiColor}`}>{d.bmi?.toFixed(1)}</div>
                                      {d.bmiLabel === 'ไม่มีวันเกิด' ? (
                                        <div className="text-[9px] text-red-500 font-bold opacity-100 flex items-center gap-0.5" title="ไม่สามารถแปลผล BMI ได้เนื่องจากไม่มีข้อมูลวันเกิด">
                                          <AlertCircle className="h-2.5 w-2.5" /> <span className="truncate">ขาดวันเกิด</span>
                                        </div>
                                      ) : (
                                        <div className={`text-[9px] ${d.bmiColor} opacity-80`}>{d.bmiLabel}</div>
                                      )}
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      
                      {displayMonths.length > 1 && (
                        <div className="flex items-center gap-1.5 pl-10 md:pl-0 mt-1 md:mt-0">
                          <span className="text-[10px] text-slate-400 md:hidden">แนวโน้ม:</span>
                          <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                            {trendIcon}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
    </div>
  );
})()}
      </div>

      {/* Assessment Modal/Form Overlay */}
        {evaluatingStudent && isKindergarten && (
          <KindergartenAssessmentModal
            student={evaluatingStudent}
            existingAssessment={
              assessments[evaluatingStudent.id] ||
              getInitialKindergartenAssessment(evaluatingStudent.id)
            }
            onClose={() => setEvaluatingStudent(null)}
            onSave={handleSaveAssessment}
          />
        )}
        {evaluatingStudent && !isKindergarten && (
          <AssessmentModal
            student={evaluatingStudent}
            existingAssessment={
              assessments[evaluatingStudent.id] ||
              getInitialAssessment(evaluatingStudent.id)
            }
            onClose={() => setEvaluatingStudent(null)}
            onSave={handleSaveAssessment}
          />
        )}

        {/* Batch Promotion Modal */}
        {showBatchPromotion && (
          <BatchPromotionModal
            students={studentsInGrade}
            currentGrade={selectedGrade}
            systemAcademicYear={systemAcademicYear}
            onClose={() => setShowBatchPromotion(false)}
            onSuccess={() => setShowBatchPromotion(false)}
          />
        )}

        {/* Assign Section Modal */}
        {showAssignSection && (
          <AssignSectionModal
            students={studentsInGrade}
            currentGrade={selectedGrade}
            onClose={() => setShowAssignSection(false)}
            onSuccess={() => setShowAssignSection(false)}
          />
        )}

        {/* Import Modal */}
        {showImport && (
          <ImportStudentData
            selectedGrade={selectedGrade}
            onClose={() => setShowImport(false)}
            onSuccess={() => {
              setShowImport(false);
              // We don't need to manually refresh as onSnapshot will handle it
            }}
          />
        )}

        {/* Student Add/Edit Modal */}
        {showStudentModal && (
          <StudentModal
            student={editingStudent}
            selectedGrade={selectedGrade}
            onClose={() => setShowStudentModal(false)}
            onSave={handleSaveStudent}
          />
        )}
        
        {/* Student Detail Modal */}
        {viewingStudent && (
          <StudentDetailModal
            student={viewingStudent}
            onClose={() => setViewingStudent(null)}
          />
        )}
        {/* Delete Confirmation Modal */}
        {showDeleteAllConfirm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-rose-600" />
              </div>
              <h3 className="font-black text-slate-800 text-lg mb-2">
                ยืนยันการลบนักเรียนทั้งหมด
              </h3>
              <p className="text-slate-500 text-sm mb-4">
                คุณต้องการลบข้อมูลนักเรียนทั้งหมดใน "{selectedGrade}" ใช่หรือไม่?<br/>
                มีนักเรียนทั้งหมด {students.filter(s => s.gradeLevel === selectedGrade).length} คน<br/>
                <span className="text-rose-600 font-bold mt-2 block">การดำเนินการนี้ไม่สามารถกู้คืนได้!</span>
              </p>
              <div className="mb-6 text-left">
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  พิมพ์คำว่า <span className="text-rose-600 font-black">DELETE</span> เพื่อยืนยัน
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 text-center font-bold"
                  placeholder="DELETE"
                  disabled={isDeletingAll}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteAllConfirm(false);
                    setDeleteConfirmText("");
                  }}
                  disabled={isDeletingAll}
                  className="flex-1 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => {
                    if (deleteConfirmText === "DELETE") {
                      handleDeleteAllStudents();
                      setDeleteConfirmText("");
                    }
                  }}
                  disabled={isDeletingAll || deleteConfirmText !== "DELETE"}
                  className="flex-1 py-2 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isDeletingAll ? 'กำลังลบ...' : 'ลบข้อมูลทั้งหมด'}
                </button>
              </div>
            </div>
          </div>
        )}

        {studentToDelete && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8 text-rose-600" />
              </div>
              <h3 className="font-black text-slate-800 text-lg mb-2">
                ยืนยันการลบนักเรียน
              </h3>
              <p className="text-slate-500 text-sm mb-4">
                คุณต้องการลบนักเรียน "{studentToDelete.name}" ใช่หรือไม่?
                <br />
                การดำเนินการนี้ไม่สามารถกู้คืนได้
              </p>
              <div className="mb-6 text-left">
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  พิมพ์คำว่า <span className="text-rose-600 font-black">DELETE</span> เพื่อยืนยัน
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 text-center font-bold"
                  placeholder="DELETE"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStudentToDelete(null);
                    setDeleteConfirmText("");
                  }}
                  className="flex-1 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => {
                    if (deleteConfirmText === "DELETE") {
                      confirmDeleteStudent();
                      setDeleteConfirmText("");
                    }
                  }}
                  disabled={deleteConfirmText !== "DELETE"}
                  className="flex-1 py-2 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ลบข้อมูล
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Assessment Confirmation Modal */}
        {assessmentToDelete && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8 text-rose-600" />
              </div>
              <h3 className="font-black text-slate-800 text-lg mb-2">
                ยืนยันการลบการประเมิน
              </h3>
              <p className="text-slate-500 text-sm mb-6">
                คุณต้องการลบข้อมูลการประเมินนี้ใช่หรือไม่?
                <br />
                การดำเนินการนี้ไม่สามารถกู้คืนได้
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setAssessmentToDelete(null)}
                  className="flex-1 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleDeleteAssessment}
                  className="flex-1 py-2 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors"
                >
                  ลบข้อมูล
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Print Overlay */}
      {printHealthStudents && (
        <HealthPrintTemplate
          students={printHealthStudents}
          allAssessments={allAssessments}
          teacher={currentTeacher!}
          academicYear={systemAcademicYear}
          semester={systemSemester}
          months={showHistoryCompare ? Array.from(new Set(allAssessments.filter(a => a.month && new Set(printHealthStudents.map(s => s.id)).has(a.studentId)).map(a => a.month as string))).sort().reverse().slice(0, 4) : (selectedMonth ? [selectedMonth] : [])}
          onClose={() => setPrintHealthStudents(null)}
        />
      )}
      {printStudents && isKindergarten && (
        <KindergartenPrintTemplate
          students={printStudents}
          assessments={assessments}
          teacher={currentTeacher!}
          academicYear={systemAcademicYear || ''}
          semester={systemSemester || ''}
          allAssessments={allAssessments}
          selectedMonth={selectedMonth}
          onClose={() => setPrintStudents(null)}
        />
      )}
      {printStudents && !isKindergarten && (
        <AssessmentPrintTemplate
          students={printStudents}
          assessments={assessments}
          teacher={currentTeacher!}
          academicYear={systemAcademicYear || ''}
          semester={systemSemester || ''}
          onClose={() => setPrintStudents(null)}
        />
      )}

      {/* Parent Feedback Print Overlay */}
      {showFeedbackPrint && (
        <ParentFeedbackPrintTemplate
          teacher={currentTeacher!}
          academicYear={systemAcademicYear}
          semester={systemSemester}
          onClose={() => setShowFeedbackPrint(false)}
        />
      )}
    </div>
  );
};
