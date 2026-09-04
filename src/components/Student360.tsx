import { AvatarUpload } from "./AvatarUpload";
import React, { useState } from 'react';
import { Student, StudentAssessment, KindergartenAssessment, SubjectScore, DisciplineIncident } from "../types";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { 
  Search, User, GraduationCap, HeartPulse, TrendingUp, TrendingDown, Minus, 
  BrainCircuit, Home, Activity, FileText,
  Award, AlertCircle, Calendar, Droplets, Download, ChevronDown, Printer, FileJson
} from 'lucide-react';

// Mock Data
const MOCK_STUDENTS = [
  {
    id: "S-001",
    studentId: "65012",
    firstName: "ด.ช. พัฒนพงษ์",
    lastName: "เจริญดี",
    nickname: "นนท์",
    grade: "ป.3/1",
    dob: "2015-05-12",
    bloodType: "O",
    allergies: "แพ้นมวัว, อาหารทะเล",
    allergicFood: "นมวัว, อาหารทะเล",
    allergicMedicine: "ไม่มี",
    congenitalDisease: "หอบหืด",
    medicalInfo: "เคยผ่าตัดไส้ติ่ง",
    fatherName: "นาย สมชาย เจริญดี",
    motherName: "นาง สมหญิง เจริญดี",
    parentPhone: "081-234-5678",
    fatherPhone: "081-234-5678",
    motherPhone: "089-111-2222",
    academic: {
      gpa: 3.85,
      attendanceRate: 98,
      subjects: [
        { name: "คณิตศาสตร์", score: 85, grade: "4" },
        { name: "ภาษาไทย", score: 90, grade: "4" },
        { name: "วิทยาศาสตร์", score: 92, grade: "4" },
        { name: "ภาษาอังกฤษ", score: 88, grade: "4" },
      ]
    },
    health: {
      height: 135,
      weight: 32,
      bmi: 17.5,
      vision: "ปกติ",
      dental: "ฟันผุ 1 ซี่"
    },
    behavior: {
      score: 95,
      notes: "เป็นเด็กตั้งใจเรียน มีความรับผิดชอบ",
      achievements: ["รางวัลชนะเลิศ ประกวดวาดภาพระดับชั้นประถมศึกษา", "นักเรียนดีเด่น ประจำเดือนมิถุนายน"]
    },
    pastoralCare: [
      { date: "2023-08-15", type: "เยี่ยมบ้าน", summary: "ครอบครัวอบอุ่น มีความพร้อมในการสนับสนุนการเรียน", counselor: "ครู สมศรี" },
      { date: "2023-09-10", type: "ปรึกษาหารือ", summary: "นักเรียนมีความกังวลเรื่องการสอบคณิตศาสตร์ ให้คำแนะนำเรื่องการแบ่งเวลา", counselor: "ครู สมชาย" }
    ]
  }
];


const formatThaiDateAndAge = (dobString: string) => {
  if (!dobString || dobString === "ไม่ระบุ") return "ไม่ระบุ";
  const date = new Date(dobString);
  if (isNaN(date.getTime())) return dobString;

  const thaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  const d = date.getDate();
  const m = thaiMonths[date.getMonth()];
  const y = date.getFullYear() + 543;

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const mDiff = today.getMonth() - date.getMonth();
  if (mDiff < 0 || (mDiff === 0 && today.getDate() < date.getDate())) {
    age--;
  }

  return `${d} ${m} ${y} (อายุ ${age} ปี)`;
};


const getDisciplineTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    fight: 'ทะเลาะวิวาท',
    assault: 'ทำร้ายร่างกาย',
    feud: 'ความบาดหมาง',
    bullying: 'กลั่นแกล้ง',
    misunderstanding: 'ความเข้าใจผิด',
    disruption: 'ก่อความวุ่นวาย',
    accident: 'อุบัติเหตุ',
    illness: 'เจ็บป่วยกะทันหัน',
    vandalism: 'ทำลายทรัพย์สิน',
    other: 'อื่นๆ',
    late: 'มาสาย',
    absent: 'ขาดเรียน',
    uniform: 'แต่งกายผิดระเบียบ',
    homework: 'ไม่ส่งงาน',
  };
  return map[type] || type;
};

const getDisciplineActionLabel = (action: string) => {
  const map: Record<string, string> = {
    none: 'ไม่มี',
    warning: 'ตักเตือนด้วยวาจา',
    written_warning: 'ทำทัณฑ์บน',
    parent_meeting: 'เชิญผู้ปกครอง',
    suspension: 'พักการเรียน',
    expulsion: 'ไล่ออก',
    counseling: 'ให้คำปรึกษา',
    first_aid: 'ปฐมพยาบาลเบื้องต้น',
    hospital: 'นำส่งโรงพยาบาล',
    other: 'อื่นๆ',
  };
  return map[action] || action;
};

export function Student360({ initialStudent }: { initialStudent?: Student | null }) {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Extend MOCK_STUDENTS with initialStudent if it exists and is not in MOCK_STUDENTS
    const extendedStudents = React.useMemo(() => {
    const list = [...MOCK_STUDENTS] as any[];
    if (initialStudent) {
      const existingIdx = list.findIndex(s => s.id === initialStudent.id || s.studentId === initialStudent.studentId);
      const mapped = {
        id: initialStudent.id,
        studentId: initialStudent.studentId,
        firstName: initialStudent.firstName,
        lastName: initialStudent.lastName,
        nickname: initialStudent.nickname || '',
        photoURL: initialStudent.photoURL || '',
        grade: initialStudent.gradeLevel,
        dob: initialStudent.dob || "ไม่ระบุ",
        bloodType: initialStudent.bloodGroup || "ไม่ระบุ",
        allergies: [initialStudent.allergicFood, initialStudent.allergicMedicine].filter(Boolean).join(', ') || "ไม่มี",
        allergicFood: initialStudent.allergicFood || "ไม่มี",
        allergicMedicine: initialStudent.allergicMedicine || "ไม่มี",
        congenitalDisease: initialStudent.congenitalDisease || "ไม่มี",
        medicalInfo: initialStudent.medicalInfo || "ไม่มี",
        fatherName: initialStudent.fatherName || [initialStudent.fatherFirstName, initialStudent.fatherLastName].filter(Boolean).join(' ') || "ไม่ระบุ",
        motherName: initialStudent.motherName || [initialStudent.motherFirstName, initialStudent.motherLastName].filter(Boolean).join(' ') || "ไม่ระบุ",
        fatherPhone: initialStudent.fatherPhone || "ไม่ระบุ",
        motherPhone: initialStudent.motherPhone || "ไม่ระบุ",
        parentPhone: initialStudent.parentPhone || "ไม่ระบุ",
        academic: {
          gpa: 0,
          attendance: 100,
          participation: 0,
          assignments: 0
        },
        behavior: {
          score: 100,
          merits: 0,
          demerits: 0,
          notes: "ไม่มีข้อมูล",
          achievements: []
        },
        pastoralCare: [],
        health: {
          height: initialStudent.height ? parseFloat(initialStudent.height.toString()) : 0,
          weight: initialStudent.weight ? parseFloat(initialStudent.weight.toString()) : 0,
          bmi: 0,
          vision: initialStudent.vision || "ไม่ระบุ",
          dental: initialStudent.dental || "ไม่ระบุ"
        }
      };
      if (existingIdx >= 0) {
        list[existingIdx] = { ...list[existingIdx], ...mapped };
      } else {
        list.push(mapped);
      }
    }
    return list;
  }, [initialStudent]);

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(initialStudent ? initialStudent.id : "S-001");
  const [assessments, setAssessments] = React.useState<StudentAssessment[]>([]);
  const [kAssessments, setKAssessments] = React.useState<KindergartenAssessment[]>([]);
  const [subjectScores, setSubjectScores] = React.useState<SubjectScore[]>([]);
  const [disciplineIncidents, setDisciplineIncidents] = React.useState<DisciplineIncident[]>([]);
  const [hiddenRadarSubjects, setHiddenRadarSubjects] = useState<Record<string, string[]>>({});

  React.useEffect(() => {
    const student = extendedStudents.find(s => s.id === selectedStudentId);
    if (!student || !student.id) return;

    const fetchAssessments = async () => {
      try {
        const q1 = query(collection(db, 'assessments'), where('studentId', '==', student.id));
        const snap1 = await getDocs(q1);
        setAssessments(snap1.docs.map(d => ({id: d.id, ...d.data()} as StudentAssessment)));

        const q2 = query(collection(db, 'kindergartenAssessments'), where('studentId', '==', student.id));
        const snap2 = await getDocs(q2);
        setKAssessments(snap2.docs.map(d => ({id: d.id, ...d.data()} as KindergartenAssessment)));

        const q3 = query(collection(db, 'subject_scores'), where('studentId', '==', student.id));
        const snap3 = await getDocs(q3);
        let fetchedScores = snap3.docs.map(d => ({id: d.id, ...d.data()} as SubjectScore));
        
        // Fetch Discipline Incidents
        const q4 = query(collection(db, 'disciplineIncidents'));
        const snap4 = await getDocs(q4);
        const allIncidents = snap4.docs.map(d => ({id: d.id, ...d.data()} as DisciplineIncident));
        const studentIncidents = allIncidents.filter(inc => {
          if (inc.offenderIds && inc.offenderIds.length > 0) {
            return inc.offenderIds.includes(student.id);
          }
          if ((!inc.offenderIds || inc.offenderIds.length === 0) && (!inc.victimIds || inc.victimIds.length === 0)) {
            return inc.studentIds?.includes(student.id);
          }
          return false;
        });
        setDisciplineIncidents(studentIncidents);
        
        // Mock data specifically for Radar Chart demo if student is พัฒนพงษ์ and has no real scores
        if (student.firstName.includes('พัฒนพงษ์') && fetchedScores.length === 0) {
          fetchedScores = [
            { id: 'm1', studentId: student.id, gradeLevel: student.grade || 'ป.3/1', academicYear: '2566', semester: '1', subject: 'คณิตศาสตร์พื้นฐาน', teacherId: 'mock', totalScore: 85, grade: '4' } as any,
            { id: 'm2', studentId: student.id, gradeLevel: student.grade || 'ป.3/1', academicYear: '2566', semester: '1', subject: 'ภาษาไทย', teacherId: 'mock', totalScore: 90, grade: '4' } as any,
            { id: 'm3', studentId: student.id, gradeLevel: student.grade || 'ป.3/1', academicYear: '2566', semester: '1', subject: 'วิทยาศาสตร์', teacherId: 'mock', totalScore: 92, grade: '4' } as any,
            { id: 'm4', studentId: student.id, gradeLevel: student.grade || 'ป.3/1', academicYear: '2566', semester: '1', subject: 'ภาษาอังกฤษ', teacherId: 'mock', totalScore: 88, grade: '4' } as any,
            { id: 'm5', studentId: student.id, gradeLevel: student.grade || 'ป.3/1', academicYear: '2566', semester: '1', subject: 'สังคมศึกษา', teacherId: 'mock', totalScore: 78, grade: '3.5' } as any,
            { id: 'm6', studentId: student.id, gradeLevel: student.grade || 'ป.3/1', academicYear: '2566', semester: '1', subject: 'ศิลปะและดนตรี', teacherId: 'mock', totalScore: 96, grade: '4' } as any,
          ];
        }
        
        setSubjectScores(fetchedScores);
      } catch (err) {
        console.error("Error fetching assessments:", err);
      }
    };
    fetchAssessments();
  }, [selectedStudentId]);
  const [activeTab, setActiveTab] = useState<"academic" | "health" | "behavior" | "pastoral">("academic");
  const [showExportMenu, setShowExportMenu] = useState(false);

  const filteredStudents = extendedStudents.filter(s => 
    s.firstName.includes(searchTerm) || 
    s.lastName.includes(searchTerm) || 
    s.studentId.includes(searchTerm) ||
    s.nickname.includes(searchTerm)
  );

  const student = extendedStudents.find(s => s.id === selectedStudentId);

  const handleExportJSON = () => {
    if (!student) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(student, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `student_${student.studentId}_${student.firstName}.json`);
    document.body.appendChild(downloadAnchorNode); 
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleExportPDF = () => {
    window.print();
  };



  // Compute health trends
  let currentWeight = student?.health?.weight || 0;
  let currentHeight = student?.health?.height || 0;
  let currentBmi = student?.health?.bmi || 0;
  let trendIcon = <Minus className="h-4 w-4 text-slate-300" />;
  let trendLabel = "";

  const allAvailableAssessments = [...kAssessments, ...assessments];
  const sortedAssessments = allAvailableAssessments.filter(a => a.weight && a.height).sort((a, b) => (b.month || '').localeCompare(a.month || ''));
  
  if (sortedAssessments.length > 0) {
    const latest = sortedAssessments[0];
      currentWeight = latest.weight || currentWeight;
      currentHeight = latest.height || currentHeight;
      currentBmi = currentWeight / Math.pow(currentHeight / 100, 2);
      
      if (sortedAssessments.length > 1) {
        const previous = sortedAssessments[1];
        const prevBmi = (previous.weight || 0) / Math.pow((previous.height || 100) / 100, 2);
        
        const diff = currentBmi - prevBmi;
        if (diff > 0.5) {
          trendIcon = <TrendingUp className="h-4 w-4 text-red-500" />;
          trendLabel = `เพิ่มขึ้น ${diff.toFixed(1)}`;
        } else if (diff < -0.5) {
          trendIcon = <TrendingDown className="h-4 w-4 text-green-500" />;
          trendLabel = `ลดลง ${Math.abs(diff).toFixed(1)}`;
        }
      }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header & Search */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center">
              <User className="h-5 w-5 text-indigo-600" />
            </div>
            Student 360°
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">ระบบข้อมูลนักเรียนแบบรอบด้าน สำหรับการดูแลรายบุคคล</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto flex-1 justify-end">
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="ค้นหาชื่อ, นามสกุล หรือรหัสนักเรียน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
            />
            {searchTerm && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden z-20">
                {filteredStudents.length > 0 ? (
                  <ul className="max-h-60 overflow-y-auto p-2 space-y-1">
                    {filteredStudents.map(s => (
                      <li 
                        key={s.id}
                        onClick={() => {
                          setSelectedStudentId(s.id);
                          setSearchTerm("");
                        }}
                        className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                      >
                        <div className="shrink-0 flex items-center justify-center">
                          <AvatarUpload url={s.photoURL} name={s.firstName || '?'} size="sm" onUpload={async () => {}} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{s.firstName} {s.lastName} ({s.nickname})</p>
                          <p className="text-[10px] text-slate-500">รหัส: {s.studentId} | ชั้น: {s.grade}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-sm text-slate-500">ไม่พบรายชื่อนักเรียน</div>
                )}
              </div>
            )}
          </div>
          
          {student && (
            <div className="relative w-full md:w-auto z-10">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all font-bold text-sm whitespace-nowrap shadow-sm"
              >
                <Download className="w-4 h-4 text-indigo-500" />
                ส่งออกข้อมูล
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
              
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button 
                    onClick={() => {
                      handleExportPDF();
                      setShowExportMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors text-left"
                  >
                    <Printer className="w-4 h-4 text-indigo-400" />
                    ส่งออกเป็น PDF (พิมพ์)
                  </button>
                  <button 
                    onClick={() => {
                      handleExportJSON();
                      setShowExportMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors text-left border-t border-slate-100"
                  >
                    <FileJson className="w-4 h-4 text-indigo-400" />
                    ส่งออกเป็น JSON
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {student ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Student Profile Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-500 relative">
                <div className="absolute -bottom-10 left-6">
                  <div className="w-20 h-20 rounded-2xl border-4 border-white bg-white flex items-center justify-center shadow-sm relative overflow-hidden">
                    <AvatarUpload
                      url={student.photoURL}
                      name={student.firstName || '?'}
                      size="xl"
                      editable={false}
                      onUpload={async () => {}}
                    />
                  </div>
                </div>
              </div>
              <div className="pt-14 p-6">
                <div className="flex flex-col items-start gap-1">
                  <h2 className="text-lg font-black text-slate-800 leading-tight">
                    {student.firstName} {student.lastName}
                  </h2>
                  <p className="text-sm font-bold text-indigo-600">ชื่อเล่น: {student.nickname}</p>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-bold whitespace-nowrap mt-1">
                    ชั้น {student.grade}
                  </span>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between text-sm pb-3 border-b border-slate-100">
                    <span className="text-slate-500 flex items-center gap-2"><FileText className="w-4 h-4" /> รหัสนักเรียน</span>
                    <span className="font-bold text-slate-800">{student.studentId}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm pb-3 border-b border-slate-100">
                    <span className="text-slate-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> วันเกิด</span>
                    <span className="font-bold text-slate-800">{formatThaiDateAndAge(student.dob)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm pb-3 border-b border-slate-100">
                    <span className="text-slate-500 flex items-center gap-2"><Droplets className="w-4 h-4 text-rose-400" /> กรุ๊ปเลือด</span>
                    <span className="font-bold text-rose-600">{student.bloodType}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm pb-3 border-b border-slate-100">
                    <span className="text-slate-500 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-rose-500" /> โรคประจำตัว</span>
                    <span className={`font-bold ${student.congenitalDisease === 'ไม่มี' ? 'text-slate-800' : 'text-rose-600'}`}>
                      {student.congenitalDisease}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm pb-3 border-b border-slate-100">
                    <span className="text-slate-500 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-orange-500" /> แพ้อาหาร</span>
                    <span className={`font-bold ${student.allergicFood === 'ไม่มี' ? 'text-slate-800' : 'text-orange-600'}`}>
                      {student.allergicFood}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm pb-3 border-b border-slate-100">
                    <span className="text-slate-500 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-purple-500" /> แพ้ยา</span>
                    <span className={`font-bold ${student.allergicMedicine === 'ไม่มี' ? 'text-slate-800' : 'text-purple-600'}`}>
                      {student.allergicMedicine}
                    </span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                  <h3 className="text-sm font-black text-slate-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-500" /> ข้อมูลครอบครัว
                  </h3>
                  <div className="flex flex-col gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">บิดา</span>
                      <span className="font-bold text-slate-800">{student.fatherName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 text-xs">เบอร์โทรศัพท์</span>
                      <span className="font-bold text-indigo-600 text-xs">{student.fatherPhone}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 pb-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">มารดา</span>
                      <span className="font-bold text-slate-800">{student.motherName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 text-xs">เบอร์โทรศัพท์</span>
                      <span className="font-bold text-indigo-600 text-xs">{student.motherPhone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Widget */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-50 p-4 rounded-3xl border border-indigo-100/50">
                <p className="text-xs font-bold text-indigo-600 mb-1">ผลการเรียนเฉลี่ย (GPA)</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-black text-indigo-900 leading-none">{student.academic.gpa.toFixed(2)}</span>
                </div>
              </div>
              <div className="bg-emerald-50 p-4 rounded-3xl border border-emerald-100/50">
                <p className="text-xs font-bold text-emerald-600 mb-1">เวลาเรียน (เข้าเรียน)</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-black text-emerald-900 leading-none">{student.academic.attendanceRate}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Tabs */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
              
              {/* Tabs Navigation */}
              <div className="flex overflow-x-auto hide-scrollbar border-b border-slate-100 p-2 gap-2">
                <button
                  onClick={() => setActiveTab('academic')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${
                    activeTab === 'academic' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" /> ด้านการเรียน
                </button>
                <button
                  onClick={() => setActiveTab('health')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${
                    activeTab === 'health' ? 'bg-rose-50 text-rose-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  <HeartPulse className="w-4 h-4" /> สุขภาพ & ร่างกาย
                </button>
                <button
                  onClick={() => setActiveTab('behavior')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${
                    activeTab === 'behavior' ? 'bg-amber-50 text-amber-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  <BrainCircuit className="w-4 h-4" /> พัฒนาการ & พฤติกรรม
                </button>
                <button
                  onClick={() => setActiveTab('pastoral')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${
                    activeTab === 'pastoral' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  <Home className="w-4 h-4" /> การดูแลช่วยเหลือ
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6 flex-1 bg-slate-50/30">
                
                {/* Academic Tab */}
                {activeTab === 'academic' && (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <h3 className="text-base font-black text-slate-800 flex items-center gap-2 mb-2">
                      <Activity className="w-5 h-5 text-indigo-500" /> 
                      ผลสัมฤทธิ์ทางการเรียน
                    </h3>
                    
                    {subjectScores.length === 0 ? (
                      <p className="text-center text-slate-500 py-8 bg-white rounded-2xl border border-slate-200">ยังไม่มีข้อมูลผลสัมฤทธิ์ทางการเรียนที่ถูกบันทึก</p>
                    ) : (
                      (Object.entries(
                        subjectScores.reduce((acc, score) => {
                          const key = `${score.semester}/${score.academicYear}`;
                          if (!acc[key]) acc[key] = [];
                          acc[key].push(score);
                          return acc;
                        }, {} as Record<string, SubjectScore[]>)
                      ) as [string, SubjectScore[]][]).map(([term, scores]) => {
                        // Prepare data for Radar Chart
                        const hiddenForTerm = hiddenRadarSubjects[term] || [];
                        const visibleScores = scores.filter(s => !hiddenForTerm.includes(s.id));
                        const radarData = visibleScores.map(s => ({
                          subject: s.subject.length > 15 ? s.subject.substring(0,15)+'...' : s.subject,
                          score: s.totalScore || 0,
                          fullMark: 100
                        }));
                        
                        return (
                          <div key={term} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <h4 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
                              <span className="w-1.5 h-5 rounded-full bg-indigo-500"></span>
                              ภาคเรียนที่ {term}
                            </h4>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                              {/* Spider Chart */}
                              <div className="flex flex-col gap-3">
                                <div className="flex flex-wrap gap-1.5">
                                  {scores.map(sub => {
                                    const isHidden = hiddenForTerm.includes(sub.id);
                                    return (
                                      <button
                                        key={`filter-${sub.id}`}
                                        onClick={() => {
                                          setHiddenRadarSubjects(prev => {
                                            const hidden = prev[term] || [];
                                            if (hidden.includes(sub.id)) {
                                              return { ...prev, [term]: hidden.filter(id => id !== sub.id) };
                                            }
                                            return { ...prev, [term]: [...hidden, sub.id] };
                                          });
                                        }}
                                        className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${isHidden ? 'bg-white border-slate-200 text-slate-400 hover:border-slate-300' : 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold hover:bg-indigo-100'}`}
                                      >
                                        {sub.subject}
                                      </button>
                                    );
                                  })}
                                </div>
                                {visibleScores.length >= 3 ? (
                                  <div className="h-[300px] w-full bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center p-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                                        <PolarGrid stroke="#e2e8f0" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                        <Tooltip 
                                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Radar name="คะแนนรวม" dataKey="score" stroke="#6366f1" fill="#818cf8" fillOpacity={0.5} />
                                      </RadarChart>
                                    </ResponsiveContainer>
                                  </div>
                                ) : (
                                  <div className="h-[300px] w-full bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center p-6 text-center">
                                    <p className="text-sm text-slate-500">กรุณาเลือกวิชาอย่างน้อย 3 วิชาเพื่อแสดงกราฟใยแมงมุม</p>
                                  </div>
                                )}
                              </div>
                              
                              {/* Subject Cards */}
                              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {scores.map(sub => (
                                  <div key={sub.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors">
                                    <div className="flex justify-between items-end mb-2">
                                      <span className="font-bold text-slate-700 text-sm line-clamp-1 flex-1 pr-2">{sub.subject}</span>
                                      <div className="text-right shrink-0">
                                        <span className="text-xs text-slate-500 font-medium">เกรด {sub.grade || '-'}</span>
                                        <span className="ml-2 text-lg font-black text-indigo-600">{sub.totalScore || 0}</span>
                                        <span className="text-[10px] text-slate-400 font-bold ml-1">/ 100</span>
                                      </div>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                      <div 
                                        className={`h-2 rounded-full ${(sub.totalScore || 0) >= 80 ? 'bg-emerald-500' : (sub.totalScore || 0) >= 70 ? 'bg-indigo-500' : (sub.totalScore || 0) >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                                        style={{ width: `${sub.totalScore || 0}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Health Tab */}
                {activeTab === 'health' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                      <HeartPulse className="w-5 h-5 text-rose-500" /> 
                      ข้อมูลสุขภาพและพัฒนาการทางร่างกาย
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center relative">
                        <p className="text-xs font-bold text-slate-500 mb-1">ส่วนสูง</p>
                        <p className="text-xl font-black text-slate-800">{currentHeight} <span className="text-sm font-bold text-slate-400">ซม.</span></p>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center relative">
                        <p className="text-xs font-bold text-slate-500 mb-1">น้ำหนัก</p>
                        <p className="text-xl font-black text-slate-800">{currentWeight} <span className="text-sm font-bold text-slate-400">กก.</span></p>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center relative flex flex-col items-center">
                        <p className="text-xs font-bold text-slate-500 mb-1">ดัชนีมวลกาย (BMI)</p>
                        <div className="flex items-center gap-2">
                           <p className={`text-xl font-black ${
                             currentBmi < 18.5 ? 'text-amber-500' : 
                             currentBmi < 23 ? 'text-emerald-500' : 'text-rose-500'
                           }`}>{currentBmi.toFixed(1)}</p>
                           {trendLabel && (
                             <div className="flex items-center gap-0.5 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100" title={trendLabel}>
                               {trendIcon}
                               <span className="text-[10px] font-bold text-slate-500 hidden sm:inline">{trendLabel}</span>
                             </div>
                           )}
                           {!trendLabel && (
                             <div className="flex items-center gap-0.5 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100" title="คงที่">
                               {trendIcon}
                             </div>
                           )}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 mt-1">
                          {currentBmi < 18.5 ? 'น้ำหนักน้อยกว่าเกณฑ์' : 
                           currentBmi < 23 ? 'สมส่วน' : 'น้ำหนักเกินเกณฑ์'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-700 mb-1">โรคประจำตัว</h4>
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{student.congenitalDisease}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-700 mb-1">ข้อมูลสุขภาพอื่นๆ</h4>
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{student.medicalInfo}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-700 mb-1">การมองเห็น</h4>
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{student.vision || student.health.vision}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-700 mb-1">สุขภาพช่องปากและฟัน</h4>
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{student.dental || student.health.dental}</p>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 mt-6">
                      <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-500" /> 
                        ประวัติการเจริญเติบโต (BMI ย้อนหลัง)
                      </h4>
                      {sortedAssessments.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                              <tr>
                                <th className="px-4 py-3 whitespace-nowrap rounded-tl-xl">เดือนที่ประเมิน</th>
                                <th className="px-4 py-3 text-right">น้ำหนัก (กก.)</th>
                                <th className="px-4 py-3 text-right">ส่วนสูง (ซม.)</th>
                                <th className="px-4 py-3 text-center">BMI</th>
                                <th className="px-4 py-3 rounded-tr-xl">ผลการประเมิน</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {sortedAssessments.map((a, idx) => {
                                const w = a.weight || 0;
                                const h = (a.height || 100) / 100;
                                const bmi = w / (h * h);
                                
                                let label = '';
                                let color = '';
                                if (bmi < 18.5) { label = 'ผอม'; color = 'text-blue-700 bg-blue-100 border-blue-200'; }
                                else if (bmi < 23) { label = 'สมส่วน'; color = 'text-green-700 bg-green-100 border-green-200'; }
                                else if (bmi < 25) { label = 'ท้วม'; color = 'text-yellow-700 bg-yellow-100 border-yellow-200'; }
                                else if (bmi < 30) { label = 'เริ่มอ้วน'; color = 'text-orange-700 bg-orange-100 border-orange-200'; }
                                else { label = 'อ้วน'; color = 'text-red-700 bg-red-100 border-red-200'; }

                                const parts = (a.month || '').split('-');
                                const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
                                const formattedMonth = parts.length === 2 
                                  ? `${monthNames[parseInt(parts[1])-1]} ${parseInt(parts[0]) + 543}`
                                  : (a.month || `ภาคเรียนที่ ${a.semester}/${a.academicYear}`);

                                return (
                                  <tr key={'health_'+idx} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-slate-700">{formattedMonth}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-slate-600">{w}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-slate-600">{a.height}</td>
                                    <td className="px-4 py-3 text-center font-bold text-slate-700">{bmi.toFixed(1)}</td>
                                    <td className="px-4 py-3">
                                      <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold border ${color}`}>
                                        {label}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-6 text-slate-400 text-sm italic bg-slate-50 rounded-xl border border-slate-100">
                          ยังไม่มีประวัติการวัดน้ำหนัก-ส่วนสูง
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* Behavior Tab */}
                {activeTab === 'behavior' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                        <BrainCircuit className="w-5 h-5 text-amber-500" /> 
                        พัฒนาการและพฤติกรรม
                      </h3>
                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                        <span className="text-xs font-bold text-slate-500">คะแนนความประพฤติ</span>
                        <span className="text-base font-black text-emerald-600">{student.behavior.score}</span>
                        <span className="text-xs font-bold text-slate-400">/ 100</span>
                      </div>
                    </div>

                    <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100/50">
                      <h4 className="text-sm font-bold text-amber-800 mb-2">บันทึกพฤติกรรมโดยรวม</h4>
                      <p className="text-sm text-slate-700 leading-relaxed">{student.behavior.notes}</p>
                    </div>

                    
                    {disciplineIncidents.length > 0 && (
                      <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-100/50 mb-6">
                        <h4 className="text-sm font-bold text-rose-800 mb-3 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-500" /> ข้อมูลจากระบบงานปกครอง
                        </h4>
                        <div className="space-y-3">
                          {disciplineIncidents.map(inc => (
                            <div key={inc.id} className="bg-white p-3 rounded-xl border border-rose-100 shadow-sm relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-1 h-full bg-rose-400"></div>
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md">
                                  {inc.date ? new Date(inc.date).toLocaleDateString('th-TH') : 'ไม่ระบุวันที่'}
                                </span>
                                <span className="text-[10px] font-bold text-slate-500 px-2 py-0.5 rounded-full bg-slate-100">
                                  {getDisciplineTypeLabel(inc.type)}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-slate-800 mt-2">{inc.description}</p>
                              {inc.actionTaken && inc.actionTaken !== 'none' && (
                                <p className="text-xs text-rose-600 mt-1"><strong>การดำเนินการ:</strong> {getDisciplineActionLabel(inc.actionTaken)}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
{/* Linked Assessments */}
                    {(assessments.some(a => a.publishContentToStudent360 || a.publishActivitiesToStudent360) || 
                      kAssessments.some(a => a.publishNotesToStudent360)) && (
                      <div>
                        <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-pink-500" /> ข้อมูลจากแบบประเมินพัฒนาการ
                        </h4>
                        <div className="space-y-3">
                          {assessments.filter(a => a.publishContentToStudent360 || a.publishActivitiesToStudent360).map(a => (
                            <div key={a.id} className="bg-white p-4 rounded-xl border border-pink-100 shadow-sm relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-1 h-full bg-pink-400"></div>
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2 py-1 rounded-md">
                                  ภาคเรียนที่ {a.semester}/{a.academicYear}
                                </span>
                                {a.month && <span className="text-xs text-slate-500">ประเมินเดือน: {a.month}</span>}
                              </div>
                              {a.publishContentToStudent360 && a.content && (
                                <div className="mt-2">
                                  <p className="text-xs font-bold text-slate-600">พฤติกรรม/พัฒนาการที่พบ:</p>
                                  <p className="text-sm text-slate-700 mt-0.5 whitespace-pre-wrap">{a.content}</p>
                                </div>
                              )}
                              {a.publishActivitiesToStudent360 && a.activities && (
                                <div className="mt-2 pt-2 border-t border-slate-100">
                                  <p className="text-xs font-bold text-slate-600">วิธีการส่งเสริม/แก้ไขปัญหา:</p>
                                  <p className="text-sm text-slate-700 mt-0.5 whitespace-pre-wrap">{a.activities}</p>
                                </div>
                              )}
                            </div>
                          ))}
                          
                          {kAssessments.filter(a => a.publishNotesToStudent360).map(a => (
                            <div key={a.id} className="bg-white p-4 rounded-xl border border-pink-100 shadow-sm relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-1 h-full bg-pink-400"></div>
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2 py-1 rounded-md">
                                  ปฐมวัย ภาคเรียนที่ {a.semester}/{a.academicYear}
                                </span>
                                {a.month && <span className="text-xs text-slate-500">ประเมินเดือน: {a.month}</span>}
                              </div>
                              {a.publishNotesToStudent360 && a.teacherNotes && (
                                <div className="mt-2">
                                  <p className="text-xs font-bold text-slate-600">ข้อเสนอแนะเพิ่มเติม:</p>
                                  <p className="text-sm text-slate-700 mt-0.5 whitespace-pre-wrap">{a.teacherNotes}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4 text-indigo-500" /> ผลงานและความภาคภูมิใจ
                      </h4>
                      <div className="space-y-2">
                        {student.behavior.achievements.map((ach, idx) => (
                          <div key={idx} className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                            <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-xs font-black text-indigo-600">{idx + 1}</span>
                            </div>
                            <p className="text-sm font-medium text-slate-700 leading-snug">{ach}</p>
                          </div>
                        ))}
                        
                        {/* Dynamic Achievements from Assessments */}
                        {[...assessments, ...kAssessments].filter(a => a.hasAchievement && a.achievementContent).map((a, idx) => (
                          <div key={'ach_'+a.id} className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-400"></div>
                            <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-100">
                              <Award className="w-3 h-3 text-indigo-500" />
                            </div>
                            <div className="flex-1">
                               <div className="flex justify-between items-center mb-1">
                                 <span className="text-xs font-bold text-indigo-600">จากแบบประเมินฯ ({a.month || `เทอม ${a.semester}/${a.academicYear}`})</span>
                               </div>
                               <p className="text-sm font-medium text-slate-700 leading-snug whitespace-pre-wrap">{a.achievementContent}</p>
                            </div>
                          </div>
                        ))}

                        {student.behavior.achievements.length === 0 && !assessments.some(a => a.hasAchievement) && !kAssessments.some(a => a.hasAchievement) && (
                          <p className="text-sm text-slate-500 italic">ยังไม่มีบันทึกผลงาน</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Pastoral Care Tab */}
                {activeTab === 'pastoral' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                      <Home className="w-5 h-5 text-emerald-500" /> 
                      บันทึกการดูแลช่วยเหลือนักเรียน
                    </h3>

                    <div className="relative border-l-2 border-emerald-100 ml-4 space-y-6 pb-4">
                      {/* Dynamic Pastoral Care from Assessments */}
                      {[...assessments, ...kAssessments].filter(a => a.hasPastoralCare && a.pastoralCareContent).map((a, idx) => (
                        <div key={'pastoral_'+a.id} className="relative pl-6">
                          <div className="absolute w-4 h-4 bg-emerald-400 rounded-full border-4 border-white -left-[9px] top-1 shadow-sm"></div>
                          <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400"></div>
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                                จากแบบประเมินฯ
                              </span>
                              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {a.month || `ภาคเรียนที่ ${a.semester}/${a.academicYear}`}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed mt-3 whitespace-pre-wrap">{a.pastoralCareContent}</p>
                          </div>
                        </div>
                      ))}

                      {student.pastoralCare.map((record, idx) => (
                        <div key={idx} className="relative pl-6">
                          <div className="absolute w-4 h-4 bg-emerald-500 rounded-full border-4 border-white -left-[9px] top-1"></div>
                          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                                {record.type}
                              </span>
                              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {record.date}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed mt-3">{record.details}</p>
                          </div>
                        </div>
                      ))}
                      
                      {student.pastoralCare.length === 0 && !assessments.some(a => a.hasPastoralCare) && !kAssessments.some(a => a.hasPastoralCare) && (
                        <div className="pl-6">
                          <p className="text-sm text-slate-500 italic">ยังไม่มีบันทึกการดูแลช่วยเหลือ</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-black text-slate-800">ค้นหานักเรียนเพื่อดูข้อมูล</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
            พิมพ์ชื่อ นามสกุล หรือรหัสนักเรียนในช่องค้นหาด้านบน เพื่อเรียกดูข้อมูลแบบ 360 องศา
          </p>
        </div>
      )}

    </div>
  );
}
