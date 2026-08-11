import React, { useState } from 'react';
import { Student } from "../types";
import { 
  Search, User, GraduationCap, HeartPulse, 
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
        { name: "สังคมศึกษา", score: 95, grade: "4" },
        { name: "สุขศึกษา", score: 98, grade: "4" },
      ]
    },
    health: {
      height: 135,
      weight: 32,
      bmi: 17.5,
      vision: "ปกติ",
      dental: "ฟันผุ 1 ซี่ (รักษากับทันตแพทย์แล้ว)"
    },
    behavior: {
      score: 95,
      notes: "เป็นเด็กที่มีความรับผิดชอบสูง ชอบช่วยเหลือเพื่อนในชั้นเรียน มีความเป็นผู้นำ",
      achievements: ["ชนะเลิศการประกวดวาดภาพระดับสายชั้น ป.3", "นักเรียนดีเด่นประจำเดือนสิงหาคม"]
    },
    pastoralCare: [
      { date: "15 ก.ค. 2026", type: "ให้คำปรึกษา", details: "นักเรียนมีความกังวลเรื่องการสอบ ได้พูดคุยและแนะนำวิธีการแบ่งเวลาอ่านหนังสือ" },
      { date: "10 พ.ค. 2026", type: "เยี่ยมบ้าน", details: "สภาพแวดล้อมทางบ้านอบอุ่น ผู้ปกครองเอาใจใส่ดูแลเรื่องการเรียนเป็นอย่างดี" }
    ]
  },
  {
    id: "S-002",
    studentId: "65088",
    firstName: "ด.ญ. รินรดา",
    lastName: "สุขใจ",
    nickname: "ริน",
    grade: "ป.3/1",
    dob: "2015-08-24",
    bloodType: "B",
    allergies: "ไม่มี",
    allergicFood: "ไม่มี",
    allergicMedicine: "ไม่มี",
    congenitalDisease: "ไม่มี",
    medicalInfo: "ไม่มี",
    fatherName: "นาย สมพล สุขใจ",
    motherName: "นาง รัตนา สุขใจ",
    parentPhone: "089-876-5432",
    fatherPhone: "081-333-4444",
    motherPhone: "089-876-5432",
    academic: {
      gpa: 3.25,
      attendanceRate: 92,
      subjects: [
        { name: "คณิตศาสตร์", score: 65, grade: "2.5" },
        { name: "ภาษาไทย", score: 82, grade: "4" },
        { name: "วิทยาศาสตร์", score: 70, grade: "3" },
        { name: "ภาษาอังกฤษ", score: 94, grade: "4" },
        { name: "สังคมศึกษา", score: 85, grade: "4" },
        { name: "สุขศึกษา", score: 90, grade: "4" },
      ]
    },
    health: {
      height: 130,
      weight: 28,
      bmi: 16.5,
      vision: "สั้น 150 (สวมแว่นตา)",
      dental: "ปกติ"
    },
    behavior: {
      score: 85,
      notes: "เป็นเด็กร่าเริง ชอบวิชาภาษาอังกฤษและศิลปะ แต่สมาธิสั้นเล็กน้อยในวิชาคำนวณ",
      achievements: ["เข้าร่วมประกวดร้องเพลงประสานเสียงโรงเรียน"]
    },
    pastoralCare: [
      { date: "05 ส.ค. 2026", type: "ติดตามผล", details: "ประสานงานกับครูคณิตศาสตร์เพื่อจัดหาแบบฝึกหัดเสริมให้ฝึกทำเพิ่มเติม" },
      { date: "12 พ.ค. 2026", type: "เยี่ยมบ้าน", details: "อยู่กับคุณยายเป็นหลัก คุณแม่ทำงานต่างจังหวัด จะกลับมาช่วงวันหยุด" }
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

export function Student360({ initialStudent }: { initialStudent?: Student | null }) {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Extend MOCK_STUDENTS with initialStudent if it exists and is not in MOCK_STUDENTS
  const extendedStudents = React.useMemo(() => {
    const list = [...MOCK_STUDENTS];
    if (initialStudent && !list.find(s => s.id === initialStudent.id || s.studentId === initialStudent.studentId)) {
      list.push({
        id: initialStudent.id,
        studentId: initialStudent.studentId,
        firstName: initialStudent.firstName,
        lastName: initialStudent.lastName,
        nickname: initialStudent.nickname || '',
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
          attendanceRate: 100,
          subjects: []
        },
        health: {
          height: initialStudent.height || 0,
          weight: initialStudent.weight || 0,
          bmi: initialStudent.weight && initialStudent.height ? Number((initialStudent.weight / Math.pow(initialStudent.height / 100, 2)).toFixed(1)) : 0,
          vision: "รอผลตรวจ",
          dental: "รอผลตรวจ"
        },
        behavior: {
          score: 100,
          notes: "ยังไม่มีบันทึกเพิ่มเติม",
          achievements: []
        },
        pastoralCare: []
      });
    }
    return list;
  }, [initialStudent]);

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(initialStudent ? initialStudent.id : "S-001");
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
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-indigo-600" />
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
                  <div className="w-20 h-20 rounded-2xl border-4 border-white bg-indigo-50 flex items-center justify-center shadow-sm">
                    <User className="w-10 h-10 text-indigo-400" />
                  </div>
                </div>
              </div>
              <div className="pt-14 p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-black text-slate-800 leading-tight">
                      {student.firstName} {student.lastName}
                    </h2>
                    <p className="text-sm font-bold text-indigo-600 mt-0.5">ชื่อเล่น: {student.nickname}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold whitespace-nowrap">
                    {student.grade}
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
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-indigo-500" /> 
                      ผลสัมฤทธิ์ทางการเรียน (รายวิชาพื้นฐาน)
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {student.academic.subjects.map(sub => (
                        <div key={sub.name} className="bg-white p-4 rounded-2xl border border-slate-200">
                          <div className="flex justify-between items-end mb-2">
                            <span className="font-bold text-slate-700 text-sm">{sub.name}</span>
                            <div className="text-right">
                              <span className="text-xs text-slate-500 font-medium">เกรด {sub.grade}</span>
                              <span className="ml-2 text-lg font-black text-indigo-600">{sub.score}</span>
                              <span className="text-[10px] text-slate-400 font-bold ml-1">/ 100</span>
                            </div>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div 
                              className={`h-2.5 rounded-full ${sub.score >= 80 ? 'bg-emerald-500' : sub.score >= 70 ? 'bg-indigo-500' : sub.score >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                              style={{ width: `${sub.score}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
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
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
                        <p className="text-xs font-bold text-slate-500 mb-1">ส่วนสูง</p>
                        <p className="text-xl font-black text-slate-800">{student.health.height} <span className="text-sm font-bold text-slate-400">ซม.</span></p>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
                        <p className="text-xs font-bold text-slate-500 mb-1">น้ำหนัก</p>
                        <p className="text-xl font-black text-slate-800">{student.health.weight} <span className="text-sm font-bold text-slate-400">กก.</span></p>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
                        <p className="text-xs font-bold text-slate-500 mb-1">ดัชนีมวลกาย (BMI)</p>
                        <p className={`text-xl font-black ${
                          student.health.bmi < 18.5 ? 'text-amber-500' : 
                          student.health.bmi < 23 ? 'text-emerald-500' : 'text-rose-500'
                        }`}>{student.health.bmi.toFixed(1)}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1">
                          {student.health.bmi < 18.5 ? 'น้ำหนักน้อยกว่าเกณฑ์' : 
                           student.health.bmi < 23 ? 'สมส่วน' : 'น้ำหนักเกินเกณฑ์'}
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
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{student.health.vision}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-700 mb-1">สุขภาพช่องปากและฟัน</h4>
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{student.health.dental}</p>
                      </div>
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
                        {student.behavior.achievements.length === 0 && (
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
                      
                      {student.pastoralCare.length === 0 && (
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
