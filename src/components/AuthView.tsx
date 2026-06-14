import React, { useState } from 'react';
import { Teacher, SUBJECTS } from '../types';
import { BookOpen, UserPlus, LogIn, Award, Building2, Phone, User, Mail, ShieldCheck, KeyRound, Shield, Loader2 } from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc 
} from 'firebase/firestore';

interface AuthViewProps {
  onLogin: (teacher: Teacher) => void;
}

export function AuthView({ onLogin }: AuthViewProps) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register state
  const [regEmail, setRegEmail] = useState('');
  const [thaiName, setThaiName] = useState('');
  const [englishName, setEnglishName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'teacher' | 'academic' | 'deputy' | 'admin'>('teacher');
  const [academicPasscode, setAcademicPasscode] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    if (!email || !password) {
      setErrorMsg('กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน');
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const uid = userCredential.user.uid;

      // Retrieve teacher document from firestore
      const docRef = doc(db, 'teachers', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const teacherData = docSnap.data() as Teacher;
        setSuccessMsg('เข้าสู่ระบบสำเร็จ ยินดีต้อนรับ!');
        setTimeout(() => {
          onLogin(teacherData);
        }, 800);
      } else {
        // Fallback: If user created but profile is missing
        const fallbackTeacher: Teacher = {
          id: uid,
          email: email.trim(),
          thaiName: 'ไม่มีข้อมูลคุณครู',
          englishName: 'No Name Profile',
          employeeId: 'N/A',
          phoneNumber: 'N/A',
          affiliation: 'โรงเรียนศิริมงคลศึกษา บางบัวทอง',
          displayName: email.trim().split('@')[0],
          role: 'teacher'
        };
        await setDoc(docRef, fallbackTeacher);
        setSuccessMsg('เข้าสู่ระบบสำเร็จ (สร้างข้อมูลตั้งต้นเพิ่มเติมเรียบร้อย)');
        setTimeout(() => {
          onLogin(fallbackTeacher);
        }, 1000);
      }
    } catch (err: any) {
      console.error("Login failure:", err);
      let thaiError = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง';
      if (err.code === 'auth/invalid-email') thaiError = 'รูปแบบอีเมลไม่ถูกต้อง';
      if (err.code === 'auth/user-not-found') thaiError = 'ไม่พบผู้ใช้งานนี้ในระบบ';
      if (err.code === 'auth/wrong-password') thaiError = 'รหัสผ่านป้อนไม่ถูกต้อง';
      if (err.code === 'auth/operation-not-allowed') {
        thaiError = 'ยังไม่ได้เปิดใช้งานผู้ให้บริการล็อกอินด้วย Email/Password ใน Firebase Console ของฝั่งผู้เริ่มโครงการ';
      }
      setErrorMsg(`${thaiError} (${err.message || err})`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    if (!regEmail || !thaiName || !englishName || !employeeId || !phoneNumber || (regRole === 'teacher' && !affiliation) || !displayName || !regPassword) {
      setErrorMsg('กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง');
      setIsLoading(false);
      return;
    }

    if (regRole !== 'teacher' && academicPasscode.trim() !== 'admin 2516') {
      setErrorMsg('รหัสตรวจรับสิทธิ์ควบคุมดูแลผู้บริหารระบบไม่ถูกต้อง (กรุณาติดต่อผู้ดูแลระบบเพื่อขอรับรหัสผ่านที่ถูกต้อง)');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Sign up on Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, regEmail.trim(), regPassword);
      const uid = userCredential.user.uid;

      // 2. Setup user document registry in Firestore under `/teachers/{uid}`
      let resolvedAffiliation = affiliation.trim();
      if (regRole === 'academic') {
        resolvedAffiliation = 'หัวหน้าฝ่ายวิชาการ';
      } else if (regRole === 'deputy') {
        resolvedAffiliation = 'รองผู้อำนวยการ';
      } else if (regRole === 'admin') {
        resolvedAffiliation = 'ผู้ดูแลระบบ';
      }

      const newTeacher: Teacher = {
        id: uid,
        email: regEmail.trim(),
        thaiName: thaiName.trim(),
        englishName: englishName.trim(),
        employeeId: employeeId.trim(),
        phoneNumber: phoneNumber.trim(),
        affiliation: resolvedAffiliation,
        displayName: displayName.trim(),
        role: regRole
      };

      await setDoc(doc(db, 'teachers', uid), newTeacher);

      setSuccessMsg('ลงทะเบียนผู้ใช้และบันทึกบัญชีครูสําเร็จแล้ว!');
      
      // Clear fields
      setRegEmail('');
      setThaiName('');
      setEnglishName('');
      setEmployeeId('');
      setPhoneNumber('');
      setAffiliation('');
      setDisplayName('');
      setRegPassword('');
      setAcademicPasscode('');

      setTimeout(() => {
        setIsLoginTab(true);
        setEmail(newTeacher.email);
        setSuccessMsg('');
      }, 1500);

    } catch (err: any) {
      console.error("Registration error:", err);
      let thaiError = 'ไม่สามารถสมัครสมาชิกได้ โปรดลองอีกครั้ง';
      if (err.code === 'auth/email-already-in-use') thaiError = 'อีเมลนี้ถูกเปิดใช้บริการในระบบเรียบร้อยแล้ว';
      if (err.code === 'auth/weak-password') thaiError = 'รหัสผ่านสั้นเกินไป (ต้องไม่ต่ำกว่า 6 ตัวอักษร)';
      if (err.code === 'auth/operation-not-allowed') {
        thaiError = 'ยังไม่ได้เปิดใช้งานผู้ให้บริการล็อกอินด้วย Email/Password ใน Firebase Console ของฝั่งผู้เริ่มโครงการ';
      }
      setErrorMsg(`${thaiError} (${err.message || err})`);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to sign in or auto-create testing system accounts (seamless Red-Team integration testing)
  const handleUseDemoAccount = async (role: 'teacher' | 'academic') => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);
    
    const demoEmail = role === 'academic' 
      ? 'academic_demo@lessonlog.com' 
      : 'teacher_demo@lessonlog.com';
    const demoPassword = 'Password123';

    try {
      // Attempt login
      const userCredential = await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
      const docRef = doc(db, 'teachers', userCredential.user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const teacherData = docSnap.data() as Teacher;
        setSuccessMsg(`สลับใช้บัญชีสาธิตสำหรับ ${role === 'academic' ? 'ฝ่ายวิชาการ' : 'ครูผู้สอน'} เรียบร้อย!`);
        setTimeout(() => {
          onLogin(teacherData);
        }, 800);
      } else {
        throw new Error("Profile missing");
      }
    } catch (err: any) {
      // If user metadata is missing or credentials invalid, perform auto-setup in background
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.message === 'Profile missing') {
        try {
          let credential;
          try {
            credential = await createUserWithEmailAndPassword(auth, demoEmail, demoPassword);
          } catch (signUpErr: any) {
            if (signUpErr.code === 'auth/email-already-in-use') {
              credential = await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
            } else {
              throw signUpErr;
            }
          }
          const uid = credential.user.uid;
          const demoTeacher: Teacher = role === 'academic' ? {
            id: uid,
            email: demoEmail,
            thaiName: 'หัวหน้าวิชาการ วิชาดี',
            englishName: 'Academic Supervisor Vichadee',
            employeeId: 'AC-10022',
            phoneNumber: '02-123-4567',
            affiliation: 'โรงเรียนศิริมงคลศึกษา บางบัวทอง (ฝ่ายวิชาการ)',
            displayName: 'ฝ่ายวิชาการ (Academic Supervisor)',
            role: 'academic'
          } : {
            id: uid,
            email: demoEmail,
            thaiName: 'ครูปิยรัตน์ ธรรมคุณ',
            englishName: 'Piyarat Thammakun',
            employeeId: 'ED-84521',
            phoneNumber: '089-765-4321',
            affiliation: 'โรงเรียนศิริมงคลศึกษา บางบัวทอง (กลุ่มสาระวิทยาศาสตร์และเทคโนโลยี)',
            displayName: 'ครูปิยรัตน์ (Teacher Piyarat)',
            role: 'teacher'
          };
          await setDoc(doc(db, 'teachers', uid), demoTeacher);
          setSuccessMsg(`จัดเตรียมและเข้าใช้บัญชีคัดเลือก (${role === 'academic' ? 'ฝ่ายวิชาการ' : 'ครูผู้สอน'}) สําเร็จ`);
          setTimeout(() => {
            onLogin(demoTeacher);
          }, 800);
        } catch (innerError: any) {
          console.error("Failed setting up automatic demo user profile:", innerError);
          setErrorMsg(`ไม่สามารถเริ่มบัญชีจำลองได้: ${innerError.message || innerError}`);
        }
      } else {
        console.error("General login error:", err);
        setErrorMsg(`ปัญหาการตรวจสอบสิทธิ์: ${err.message || err}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-pink-50/40 via-white to-sky-50/40 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans transition-all duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Logo & Name */}
        <div className="flex flex-col items-center justify-center">
          <div className="h-16 w-16 bg-gradient-to-tr from-sky-450 via-sky-500 to-pink-400 rounded-2xl flex items-center justify-center shadow-md transform hover:rotate-3 transition duration-300">
            <BookOpen className="h-9 w-9 text-white animate-pulse" />
          </div>
          <h1 className="mt-4 text-center text-3xl font-black text-slate-800 tracking-tight font-sans">
            LessonLog
          </h1>
          <p className="mt-2 text-center text-xs font-semibold text-sky-600/90 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100">
            ระบบบันทึกผลหลังสอนสําหรับคุณครู
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-xl border border-slate-100">
          
          {/* Tabs Selector */}
          <div className="flex space-x-1 p-1 bg-slate-100 rounded-xl mb-6">
            <button
              disabled={isLoading}
              onClick={() => {
                setIsLoginTab(true);
                setErrorMsg('');
              }}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                isLoginTab
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-50'
              }`}
            >
              <LogIn className="h-4 w-4" />
              <span>เข้าสู่ระบบ</span>
            </button>
            <button
              disabled={isLoading}
              onClick={() => {
                setIsLoginTab(false);
                setErrorMsg('');
              }}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                !isLoginTab
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-50'
              }`}
            >
              <UserPlus className="h-4 w-4" />
              <span>สมัครสมาชิก</span>
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="mb-4 bg-rose-50 border-l-4 border-rose-500 p-4 text-rose-700 text-xs rounded-r-lg">
              <p className="font-semibold">ข้อผิดพลาด</p>
              <p>{errorMsg}</p>
              
              {errorMsg.includes('auth/operation-not-allowed') && (
                <div className="mt-3 p-3 bg-white/85 rounded-lg border border-rose-200 text-slate-700 font-sans space-y-2 leading-relaxed text-[11px]">
                  <p className="font-bold text-rose-800">💡 วิธีแก้ไขเปิดระบบล็อกอินด้วยตนเองใน 1 นาที:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>ไปที่เว็บไซต์ฐานข้อมูลหลัก <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-black outline-none inline-flex items-center gap-0.5">Firebase Console</a></li>
                    <li>ค้นหาและคลิกเลือกโปรเจกต์ของคุณ: <strong className="text-slate-900 bg-slate-100 px-1 py-0.5 rounded">{firebaseConfig.projectId}</strong></li>
                    <li>คลิกแท็บเมนู <strong className="text-slate-900">Authentication</strong> ในแถบเมนูด้านซ้าย</li>
                    <li>เลือกแถบด้านบนชื่อว่า <strong className="text-slate-900">Sign-in method</strong></li>
                    <li>กดปุ่ม <strong className="text-slate-900">Add new provider</strong> (หรือ click สำหรับ Email/Password)</li>
                    <li>เลือกตัวเลือก <strong className="text-blue-700 font-bold">Email/Password</strong></li>
                    <li>สวิตช์ปุ่มตัวแรกให้เป็น <strong className="text-emerald-700 font-bold">Enable (เปิดใช้งาน)</strong> แล้วกด <strong className="text-slate-950 font-black">Save (บันทึก)</strong></li>
                  </ol>
                  <p className="text-[10px] text-slate-500 italic mt-2">เมื่อเสร็จสิ้นเรียบร้อย กลับมารีเฟรชหน้านี้เพื่อเข้าใช้งานระบบได้ทันที!</p>
                </div>
              )}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 bg-emerald-50 border-l-4 border-emerald-500 p-4 text-emerald-700 text-xs rounded-r-lg">
              <p className="font-semibold">สำเร็จ</p>
              <p>{successMsg}</p>
            </div>
          )}

          {isLoginTab ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5 animate-pulse">
                  <Mail className="h-4 w-4 text-slate-400" />
                  อีเมลบัญชีผู้ใช้
                </label>
                <input
                  type="email"
                  required
                  disabled={isLoading}
                  placeholder="ระบุอีเมลเข้าใช้งาน..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-slate-400 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <KeyRound className="h-4 w-4 text-slate-400" />
                  รหัสผ่าน
                </label>
                <input
                  type="password"
                  required
                  disabled={isLoading}
                  placeholder="ระบุรหัสผ่าน..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-slate-400 disabled:bg-slate-100"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-sky-450 via-sky-500 to-pink-400 hover:opacity-95 text-white font-extrabold py-2.5 px-4 rounded-xl shadow-xs transition duration-200 hover:shadow-sky-100 text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>กำลังดำเนินการครู...</span>
                    </>
                  ) : (
                    <span>เข้าสู่ระบบ</span>
                  )}
                </button>
              </div>

            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 text-sky-800 text-xs flex gap-2">
                <Award className="h-5 w-5 text-sky-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-xs">ข้อมูลสมาชิกคุณครู</p>
                  <p className="mt-0.5 text-[10px]">โปรไฟล์นี้เชื่อมต่อกับโครงข่ายคลาวด์และฐานข้อมูลเพื่อความปลอดภัย</p>
                </div>
              </div>

              {/* Role Picker (คุณครู vs หัวหน้าฝ่ายวิชาการ vs รองผู้อำนวยการ vs ผู้ดูแลระบบ) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-violet-500" />
                  ระบุบทบาท / ขอบเขตระดับสิทธิ์การลงทะเบียนสิทธิ์
                </label>
                <select
                  disabled={isLoading}
                  value={regRole}
                  onChange={(e) => {
                    setRegRole(e.target.value as 'teacher' | 'academic' | 'deputy' | 'admin');
                    setAcademicPasscode('');
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 cursor-pointer"
                >
                  <option value="teacher">คุณครูผู้สอน (ลงประวัติ จัดเตรียมเอกสาร และเซ็นชื่อตนเอง)</option>
                  <option value="academic">หัวหน้าฝ่ายวิชาการ (ดูแลภาพรวม ตรวจสอบรับรองและลงชื่อผ่านแดชบอร์ด)</option>
                  <option value="deputy">รองผู้อำนวยการ (ดูแลฝ่ายวิชาการ ตรวจสอบรับรองลงนามรายงาน)</option>
                  <option value="admin">ผู้ดูแลระบบ (ควบคุมดูแล จัดระบบฐานข้อมูลความปลอดภัย)</option>
                </select>
              </div>

              {regRole !== 'teacher' && (
                <div className="bg-violet-50 border border-violet-100 p-3.5 rounded-xl space-y-2 animate-in slide-in-from-top duration-200">
                  <label className="block text-xs font-black text-violet-900 flex items-center gap-1.5">
                    <KeyRound className="h-4 w-4 text-violet-600" />
                    รหัสผ่านยืนยันสิทธิ์บริหารควบคุมดูแลระบบ *
                  </label>
                  <input
                    type="password"
                    required
                    disabled={isLoading}
                    placeholder="กรอกรหัสผ่านเพื่อรับสิทธิ์ควบคุมดูแล..."
                    value={academicPasscode}
                    onChange={(e) => setAcademicPasscode(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-violet-300 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 font-mono text-slate-900 font-bold"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <User className="h-3 w-3 text-slate-400" />
                    ชื่อ-นามสกุล (ภาษาไทย)
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isLoading}
                    placeholder="เช่น ครูใจดี รักเรียน"
                    value={thaiName}
                    onChange={(e) => setThaiName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <User className="h-3 w-3 text-slate-400" />
                    ชื่อ-นามสกุล (ภาษาอังกฤษ)
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isLoading}
                    placeholder="เช่น Kru Jaidee"
                    value={englishName}
                    onChange={(e) => setEnglishName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs disabled:bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Award className="h-3 w-3 text-slate-400" />
                    รหัสประจำตัวครู (Employee ID)
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isLoading}
                    placeholder="เช่น T001"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Phone className="h-3 w-3 text-slate-400" />
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="tel"
                    required
                    disabled={isLoading}
                    placeholder="เช่น 089xxxxxxx"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs disabled:bg-slate-50"
                  />
                </div>
              </div>

              {regRole === 'teacher' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-slate-400" />
                    กลุ่มสาระการเรียนรู้ที่สังกัด *
                  </label>
                  <select
                    required
                    disabled={isLoading}
                    value={affiliation}
                    onChange={(e) => setAffiliation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs bg-white disabled:bg-slate-50 cursor-pointer"
                  >
                    <option value="" disabled>-- เลือกกลุ่มสาระการเรียนรู้ --</option>
                    {SUBJECTS.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="border-t border-slate-100 my-2 pt-2"></div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <User className="h-3 w-3 text-indigo-500" />
                    ชื่อเล่น / ชื่อเรียกทั่วไป
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isLoading}
                    placeholder="เช่น ครูดี, แอดมิน"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs bg-indigo-50/20 disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Mail className="h-3 w-3 text-slate-400" />
                    อีเมลเข้าใช้งาน
                  </label>
                  <input
                    type="email"
                    required
                    disabled={isLoading}
                    placeholder="เช่น teacher@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs disabled:bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <KeyRound className="h-3 w-3 text-slate-400" />
                  รหัสผ่านที่ต้องการ
                </label>
                <input
                  type="password"
                  required
                  disabled={isLoading}
                  placeholder="ระบุรหัสผ่าน..."
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs disabled:bg-slate-50"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-sky-450 via-sky-500 to-pink-400 hover:opacity-95 text-white font-extrabold py-2 px-4 rounded-xl shadow-xs transition duration-200 text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>กำลังลงทะเบียนข้อมูลครู...</span>
                    </>
                  ) : (
                    <span>ตกลง สมัครสมาชิก</span>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
