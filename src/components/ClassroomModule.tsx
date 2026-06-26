import React, { useState, useEffect } from "react";
import {
  Users,
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
} from "lucide-react";
import { Student, StudentAssessment, GRADE_LEVELS, Teacher } from "../types";
import { AssessmentPrintTemplate } from "./AssessmentPrintTemplate";
import { ParentFeedbackPrintTemplate } from "./ParentFeedbackPrintTemplate";
import { ImportStudentData } from "./ImportStudentData";
import { StudentModal } from "./StudentModal";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  setDoc,
  writeBatch,
  deleteDoc,
} from "firebase/firestore";
import { AssessmentModal } from "./AssessmentModal";

interface ClassroomModuleProps {
  currentTeacher: Teacher | null;
  systemAcademicYear?: string;
  systemSemester?: string;
}

export const ClassroomModule: React.FC<ClassroomModuleProps> = ({
  currentTeacher,
  systemAcademicYear = "2567",
  systemSemester = "1",
}) => {
  const [activeTab, setActiveTab] = useState<"students" | "assessments">(
    "students",
  );
  const [selectedGrade, setSelectedGrade] = useState<string>(GRADE_LEVELS[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [showImport, setShowImport] = useState(false);
  const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female">(
    "all",
  );

  // Assessments state
  const [assessments, setAssessments] = useState<
    Record<string, StudentAssessment>
  >({});
  const [evaluatingStudent, setEvaluatingStudent] = useState<Student | null>(
    null,
  );

  // Print state
  const [printStudents, setPrintStudents] = useState<Student[] | null>(null);
  const [showFeedbackPrint, setShowFeedbackPrint] = useState(false);

  // Student Form state
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Delete confirmation state
  const [studentToDelete, setStudentToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [assessmentToDelete, setAssessmentToDelete] =
    useState<StudentAssessment | null>(null);

  const [expandedHistory, setExpandedHistory] = useState<
    Record<string, boolean>
  >({});

  const toggleHistory = (studentId: string) => {
    setExpandedHistory((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  const thaiFormatDateTime = (isoString?: string) => {
    if (!isoString) return "-";
    try {
      const d = new Date(isoString);
      return d.toLocaleString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

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
          })
          .filter(student => student.gradeLevel === selectedGrade);

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
        const fetchedAssessments: Record<string, StudentAssessment> = {};
        snapshot.docs.forEach((doc) => {
          const data = doc.data() as StudentAssessment;
          if (data.gradeLevel) {
            data.gradeLevel = data.gradeLevel.replace(/\s*\(ป\..*\)/g, '');
          }
          if (data.gradeLevel === selectedGrade) {
            fetchedAssessments[data.studentId] = data;
          }
        });
        setAssessments(fetchedAssessments);
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

  const filteredStudents = students.filter((student) => {
    if (genderFilter === "all") return true;
    return student.gender === genderFilter;
  });

  const totalCount = students.length;
  const maleCount = students.filter((s) => s.gender === "male").length;
  const femaleCount = students.filter((s) => s.gender === "female").length;

  // Initialize empty assessment if not exist
  const getInitialAssessment = (studentId: string): StudentAssessment => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const currentMonthStr = todayStr.substring(0, 7);

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
      month: currentMonthStr,
      recordDate: todayStr,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const handleSaveStudent = async (
    studentData: Omit<Student, "id">,
    id?: string,
  ) => {
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
      await deleteDoc(doc(db, "students", studentToDelete.id));
      setStudentToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, "students");
    }
  };

  const handleDeleteAssessment = async () => {
    if (!assessmentToDelete) return;
    try {
      await deleteDoc(doc(db, "assessments", assessmentToDelete.id));
      setAssessmentToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, "assessments");
    }
  };

  const handleSaveAssessment = async (assessment: StudentAssessment) => {
    try {
      const now = new Date().toISOString();
      const teacherName = currentTeacher
        ? currentTeacher.displayName || currentTeacher.thaiName
        : "ผู้ใช้งาน";

      let updatedHistory = assessment.editHistory || [];
      // If the assessment is being updated (i.e. already has an ID, though we construct the ID here),
      // we check if it already existed.
      // We can rely on assessments state to check if it's an update.
      const safeGradeLevel = assessment.gradeLevel.replace(/\//g, "-");
      const docId = `${safeGradeLevel}_${assessment.studentId}`;
      const existing = assessments[assessment.studentId];

      if (existing) {
        updatedHistory.push({
          editedBy: teacherName,
          editedAt: now,
        });
      }

      const assessmentToSave = {
        ...assessment,
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

  const printBatchReport = () => {
    // Print all students in the current grade who have been assessed
    const assessedStudents = filteredStudents.filter((s) => assessments[s.id]);
    if (assessedStudents.length === 0) {
      alert("ยังไม่มีข้อมูลการประเมินในระดับชั้นนี้");
      return;
    }
    setPrintStudents(assessedStudents);
  };

  const printFeedbackBatchReport = () => {
    setShowFeedbackPrint(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="print:hidden space-y-6">
        {/* Module Header with attractive display */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-pink-300 opacity-20 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl"></div>

          <div className="flex items-center gap-5 relative z-10">
            <div className="h-16 w-16 bg-white/20 backdrop-blur-md text-white rounded-2xl flex items-center justify-center shadow-inner border border-white/30">
              <Users className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight drop-shadow-sm">
                2. การจัดการชั้นเรียน (LessonClass)
              </h2>
              <p className="text-pink-100 font-medium mt-1">
                จัดการข้อมูลนักเรียนและประเมินพัฒนาการแบบรายบุคคล
              </p>
            </div>
          </div>

          {/* Grade Selector inside header */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 rounded-xl">
            <label className="text-sm font-bold text-pink-50">
              เลือกระดับชั้น:
            </label>
            <div className="relative">
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="appearance-none bg-white text-slate-800 rounded-lg pl-3 pr-8 py-1.5 text-sm font-bold focus:ring-2 focus:ring-pink-300 outline-none w-full sm:w-auto min-w-[120px] shadow-sm cursor-pointer"
              >
                {GRADE_LEVELS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-100 max-w-md">
          <button
            onClick={() => setActiveTab("students")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === "students"
                ? "bg-pink-100 text-pink-700"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <UserPlus className="h-4 w-4" /> ฐานข้อมูลนักเรียน
          </button>
          <button
            onClick={() => setActiveTab("assessments")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === "assessments"
                ? "bg-pink-100 text-pink-700"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <CheckCircle className="h-4 w-4" /> ประเมินพัฒนาการ
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {activeTab === "students" && (
            <div className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-800">
                    รายชื่อนักเรียน {selectedGrade}
                  </h3>
                  <div className="flex gap-3 mt-2 text-sm font-medium">
                    <span className="bg-slate-100 px-3 py-1 rounded-lg text-slate-600">
                      ทั้งหมด:{" "}
                      <span className="font-bold text-slate-900">
                        {totalCount}
                      </span>{" "}
                      คน
                    </span>
                    <span className="bg-blue-50 px-3 py-1 rounded-lg text-blue-700">
                      ชาย: <span className="font-bold">{maleCount}</span> คน
                    </span>
                    <span className="bg-pink-50 px-3 py-1 rounded-lg text-pink-700">
                      หญิง: <span className="font-bold">{femaleCount}</span> คน
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <select
                    value={genderFilter}
                    onChange={(e) =>
                      setGenderFilter(
                        e.target.value as "all" | "male" | "female",
                      )
                    }
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-pink-500 bg-white"
                  >
                    <option value="all">เพศ: ทั้งหมด</option>
                    <option value="male">เพศ: ชาย</option>
                    <option value="female">เพศ: หญิง</option>
                  </select>
                  <button
                    onClick={() => setShowImport(true)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                  >
                    <FileSpreadsheet className="h-4 w-4" /> นำเข้าข้อมูล
                    (Excel/CSV)
                  </button>
                  <button
                    onClick={() => {
                      setEditingStudent(null);
                      setShowStudentModal(true);
                    }}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                  >
                    <UserPlus className="h-4 w-4" /> เพิ่มนักเรียน
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-center">เลขที่</th>
                      <th className="px-4 py-3">รหัสนักเรียน</th>
                      <th className="px-4 py-3">ชื่อ-นามสกุล</th>
                      <th className="px-4 py-3 text-center">เพศ</th>
                      <th className="px-4 py-3 text-center">สถานะ</th>
                      <th className="px-4 py-3 text-right">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-8 text-slate-500"
                        >
                          ไม่พบข้อมูลนักเรียนในระดับชั้นนี้
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student) => (
                        <tr
                          key={student.id}
                          className="border-b border-slate-100 hover:bg-slate-50"
                        >
                          <td className="px-4 py-3 text-center font-medium">
                            {student.number}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-500">
                            {student.studentId}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-800">
                            {student.firstName} {student.lastName}{" "}
                            {student.nickname && `(${student.nickname})`}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {student.gender === "male" ? "ชาย" : "หญิง"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-bold ${student.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                            >
                              {student.status === "active"
                                ? "ปกติ"
                                : "ย้าย/ออก"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingStudent(student);
                                  setShowStudentModal(true);
                                }}
                                className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                                title="แก้ไขข้อมูล"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() =>
                                  setStudentToDelete({
                                    id: student.id,
                                    name: `${student.firstName} ${student.lastName}`,
                                  })
                                }
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="ลบนักเรียน"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "assessments" && (
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-800">
                    ประเมินพัฒนาการนักเรียน
                  </h3>
                  <div className="flex gap-3 mt-2 text-sm font-medium">
                    <span className="bg-slate-100 px-3 py-1 rounded-lg text-slate-600">
                      ทั้งหมด:{" "}
                      <span className="font-bold text-slate-900">
                        {totalCount}
                      </span>{" "}
                      คน
                    </span>
                    <span className="bg-blue-50 px-3 py-1 rounded-lg text-blue-700">
                      ชาย: <span className="font-bold">{maleCount}</span> คน
                    </span>
                    <span className="bg-pink-50 px-3 py-1 rounded-lg text-pink-700">
                      หญิง: <span className="font-bold">{femaleCount}</span> คน
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <select
                    value={genderFilter}
                    onChange={(e) =>
                      setGenderFilter(
                        e.target.value as "all" | "male" | "female",
                      )
                    }
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-pink-500 bg-white"
                  >
                    <option value="all">เพศ: ทั้งหมด</option>
                    <option value="male">เพศ: ชาย</option>
                    <option value="female">เพศ: หญิง</option>
                  </select>
                  <button
                    onClick={printBatchReport}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                  >
                    <Printer className="h-4 w-4" /> ออกรายงานรวม
                  </button>
                  <button
                    onClick={printFeedbackBatchReport}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                  >
                    <Printer className="h-4 w-4" /> พิมพ์แบบตอบกลับ (ฟอร์มเปล่า)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStudents.map((student) => {
                  const hasAssessed = !!assessments[student.id];
                  const assessment = assessments[student.id];
                  return (
                    <div
                      key={student.id}
                      className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow flex flex-col"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="text-xs font-bold text-pink-500 mb-1">
                            เลขที่ {student.number}
                          </div>
                          <div className="font-bold text-slate-800">
                            {student.firstName} {student.lastName}
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
                                {thaiFormatDateTime(assessment.lastEditedAt)}
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
                                        {thaiFormatDateTime(history.editedAt)}
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
                          className={`flex-1 py-2 rounded-lg text-xs font-bold text-center transition-colors ${
                            hasAssessed
                              ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                              : "bg-pink-100 text-pink-700 hover:bg-pink-200"
                          }`}
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
                {filteredStudents.length === 0 && (
                  <div className="col-span-full text-center py-8 text-slate-500">
                    ไม่พบข้อมูลนักเรียนในระดับชั้นนี้
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Assessment Modal/Form Overlay */}
        {evaluatingStudent && (
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
        {/* Delete Confirmation Modal */}
        {studentToDelete && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8 text-rose-600" />
              </div>
              <h3 className="font-black text-slate-800 text-lg mb-2">
                ยืนยันการลบนักเรียน
              </h3>
              <p className="text-slate-500 text-sm mb-6">
                คุณต้องการลบนักเรียน "{studentToDelete.name}" ใช่หรือไม่?
                <br />
                การดำเนินการนี้ไม่สามารถกู้คืนได้
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setStudentToDelete(null)}
                  className="flex-1 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={confirmDeleteStudent}
                  className="flex-1 py-2 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors"
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
      {printStudents && (
        <AssessmentPrintTemplate
          students={printStudents}
          assessments={assessments}
          teacher={currentTeacher!}
          academicYear={systemAcademicYear}
          semester={systemSemester}
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
