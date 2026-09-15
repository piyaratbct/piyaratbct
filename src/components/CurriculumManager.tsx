import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { BookOpen, Search, Plus, Edit, Trash2, Upload, CheckCircle2, Circle, Loader2, Save, X, ChevronDown, ChevronRight, Download, AlertTriangle, CheckCircle, AlertCircle, Award } from 'lucide-react';
import { collection, query, getDocs, doc, setDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { CurriculumSubject, CurriculumStandard, CurriculumIndicator, GRADE_LEVELS, BASE_GRADE_LEVELS, SUBJECTS, sortSubjects } from '../types';
import { SubjectChildManager } from './SubjectChildManager';
import { IntegratedUnitBuilder } from './IntegratedUnitBuilder';

import { Student } from '../types';
interface CurriculumManagerProps {
  currentUserRole?: string;
  students?: Student[];
  systemSemester?: string;
  systemAcademicYear?: string;
}

export const CurriculumManager: React.FC<CurriculumManagerProps> = ({ currentUserRole = 'teacher', students = [], systemSemester = '', systemAcademicYear = '' }) => {
  const canEdit = currentUserRole === 'admin' || currentUserRole === 'academic' || currentUserRole === 'deputy' || currentUserRole === 'staff';

  const [curriculums, setCurriculums] = useState<CurriculumSubject[]>([]);
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'subjects' | 'integrated'>('subjects');
  const [innerTab, setInnerTab] = useState<'indicators' | 'structure'>('indicators');

  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void } | null>(null);
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' } | null>(null);

    const downloadTemplate = () => {
    const data = [
      {
        'รหัสวิชา': 'ค11101',
        'ชื่อรายวิชา': 'คณิตศาสตร์พื้นฐาน',
        'ระดับชั้น': 'ประถมศึกษาปีที่ 1',
        'มาตรฐาน': 'มาตรฐาน ค 1.1',
        'รหัสตัวชี้วัด': 'ค 1.1 ป.1/1',
        'คำอธิบายตัวชี้วัด': 'บอกจำนวนของสิ่งต่าง ๆ แสดงสิ่งต่าง ๆ ตามจำนวนที่กำหนด อ่านและเขียนตัวเลขฮินดูอารบิก ตัวเลขไทยแสดงจำนวนนับไม่เกิน 100 และ 0',
        'ประเภท': 'ตัวชี้วัดระหว่างทาง'
      },
      {
        'รหัสวิชา': 'ค11101',
        'ชื่อรายวิชา': 'คณิตศาสตร์พื้นฐาน',
        'ระดับชั้น': 'ประถมศึกษาปีที่ 1',
        'มาตรฐาน': 'มาตรฐาน ค 1.1',
        'รหัสตัวชี้วัด': 'ค 1.1 ป.1/2',
        'คำอธิบายตัวชี้วัด': 'เปรียบเทียบจำนวนนับไม่เกิน 100 และ 0 โดยใช้เครื่องหมาย = ≠ > <',
        'ประเภท': 'ตัวชี้วัดปลายทาง'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ตัวชี้วัด");

    // Adjust column widths
    const wscols = [
      { wch: 15 }, // รหัสวิชา
      { wch: 25 }, // ชื่อรายวิชา
      { wch: 20 }, // ระดับชั้น
      { wch: 15 }, // มาตรฐาน
      { wch: 15 }, // รหัสตัวชี้วัด
      { wch: 50 }, // คำอธิบาย
      { wch: 20 }  // ประเภท
    ];
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, 'curriculum_template.xlsx');
  };


  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [previewData, setPreviewData] = useState<Map<string, CurriculumSubject> | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Structure expectation:
      // SubjectName | GradeLevel | StandardTitle | IndicatorCode | IndicatorDescription | IndicatorType
      // Types: ต้องรู้ (core) / ควรรู้ (terminal)
      
      const newCurriculums = new Map<string, CurriculumSubject>();

      for (const row of jsonData as any[]) {
        const subjectCode = String(row['รหัสวิชา'] || row['SubjectCode'] || '').trim();
        const subjectName = String(row['ชื่อรายวิชา'] || row['SubjectName'] || '').trim();
        const gradeLevel = String(row['ระดับชั้น'] || row['GradeLevel'] || '').trim();
        const standardTitle = String(row['มาตรฐาน'] || row['StandardTitle'] || '').trim();
        const indicatorCode = String(row['รหัสตัวชี้วัด'] || row['IndicatorCode'] || '').trim();
        const indicatorDesc = String(row['คำอธิบายตัวชี้วัด'] || row['IndicatorDescription'] || row['คำอธิบาย'] || '').trim();
        let indicatorTypeRaw = String(row['ประเภท'] || row['IndicatorType'] || '').trim();
        
        let type: 'core' | 'terminal' = 'core';
        if (indicatorTypeRaw.includes('ควรรู้') || indicatorTypeRaw.toLowerCase().includes('terminal') || indicatorTypeRaw.includes('ปลายทาง')) {
          type = 'terminal';
        }

        if (!subjectName || !gradeLevel) continue;

        const subjectKey = `${subjectName}-${gradeLevel}`;
        
        let curr = newCurriculums.get(subjectKey);
        if (!curr) {
          curr = {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
            subjectCode,
            subjectName,
            gradeLevel,
            standards: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          newCurriculums.set(subjectKey, curr);
        }

        if (standardTitle) {
          let standard = curr.standards.find(s => s.title === standardTitle);
          if (!standard) {
            standard = {
              id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
              title: standardTitle,
              indicators: []
            };
            curr.standards.push(standard);
          }

          if (indicatorCode && indicatorDesc) {
            const existingInd = standard.indicators.find(i => i.code === indicatorCode);
            if (!existingInd) {
              standard.indicators.push({
                id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
                code: indicatorCode,
                description: indicatorDesc,
                type
              });
            }
          }
        }
      }

      if (newCurriculums.size === 0) {
        setAlertModal({ isOpen: true, title: 'ไม่พบข้อมูลที่ถูกต้อง', message: 'ไม่พบข้อมูลตัวชี้วัดในไฟล์ หรือรูปแบบคอลัมน์ไม่ตรงกับไฟล์ตัวอย่าง (ต้องมีคอลัมน์ "ชื่อรายวิชา" และ "ระดับชั้น")', type: 'error' });
        return;
      }

      setPreviewData(newCurriculums);
    } catch (error) {
      console.error('Error parsing excel:', error);
      setAlertModal({ isOpen: true, title: 'เกิดข้อผิดพลาด', message: 'เกิดข้อผิดพลาดในการนำเข้าไฟล์ Excel โปรดตรวจสอบรูปแบบไฟล์ให้ตรงกับแบบฟอร์ม', type: 'error' });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const confirmImport = async () => {
    if (!previewData) return;
    setIsImporting(true);
    try {
      let successCount = 0;
      for (const [_, curr] of previewData) {
        const existing = curriculums.find(c => c.subjectName === curr.subjectName && c.gradeLevel === curr.gradeLevel);
        if (existing) {
          const merged = { ...existing };
          curr.standards.forEach(newStd => {
            const extStd = merged.standards.find(s => s.title === newStd.title);
            if (extStd) {
              newStd.indicators.forEach(newInd => {
                const extInd = extStd.indicators.find(i => i.code === newInd.code);
                if (!extInd) {
                  extStd.indicators.push(newInd);
                }
              });
            } else {
              merged.standards.push(newStd);
            }
          });
          merged.updatedAt = new Date().toISOString();
          await setDoc(doc(db, 'curriculums', merged.id), merged);
        } else {
          await setDoc(doc(db, 'curriculums', curr.id), curr);
        }
        successCount++;
      }
      
      setAlertModal({ isOpen: true, title: 'นำเข้าข้อมูลสำเร็จ', message: `นำเข้าข้อมูลตัวชี้วัดจำนวน ${successCount} รายวิชาเรียบร้อยแล้ว`, type: 'success' });
      setPreviewData(null);
      await fetchCurriculums();
    } catch (error) {
      console.error('Error saving imported data:', error);
      setAlertModal({ isOpen: true, title: 'เกิดข้อผิดพลาด', message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลตัวชี้วัด', type: 'error' });
    } finally {
      setIsImporting(false);
    }
  };

  const clearIndicators = async (subjectId: string) => {
    setConfirmModal({ isOpen: true, title: 'ล้างข้อมูลตัวชี้วัด', message: 'ยืนยันการล้างข้อมูลตัวชี้วัดทั้งหมดในรายวิชานี้?', onConfirm: async () => {
      setConfirmModal(null);
      try {
        const curr = curriculums.find(c => c.id === subjectId);
        if (!curr) return;
        const updated = { ...curr, standards: [], updatedAt: new Date().toISOString() };
        await setDoc(doc(db, 'curriculums', subjectId), updated);
        await fetchCurriculums();
        if (selectedCurriculumId === subjectId) {
          const refreshed = curriculums.find(c => c.id === subjectId);
          if (refreshed) {
             refreshed.standards = [];
          }
        }
        setAlertModal({ isOpen: true, title: 'ล้างข้อมูลสำเร็จ', message: 'ล้างข้อมูลตัวชี้วัดเรียบร้อยแล้ว', type: 'success' });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, 'curriculums');
      }
    }});
  };



  // Modals / Forms state
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Partial<CurriculumSubject>>({});

  const [showStandardForm, setShowStandardForm] = useState(false);
  const [editingStandard, setEditingStandard] = useState<{ id?: string; title: string }>({ title: '' });

  const [showIndicatorForm, setShowIndicatorForm] = useState(false);
  const [targetStandardId, setTargetStandardId] = useState<string | null>(null);
  const [editingIndicator, setEditingIndicator] = useState<Partial<CurriculumIndicator>>({});

  useEffect(() => {
    fetchCurriculums();
  }, []);

  const fetchCurriculums = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'curriculums'));
      const snapshot = await getDocs(q);
      let data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as CurriculumSubject));
      data.sort((a, b) => a.gradeLevel.localeCompare(b.gradeLevel) || sortSubjects(a, b));
      setCurriculums(data);
      if (data.length > 0 && !selectedCurriculumId) {
        setSelectedCurriculumId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching curriculums:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCurriculum = curriculums.find(c => c.id === selectedCurriculumId);

  const filteredCurriculums = curriculums.filter(c => {
    // Only show parent subjects or independent subjects in the list
    if (c.parentId) return false;

    const matchesSearch = (c.subjectName && c.subjectName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.subjectCode && c.subjectCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.gradeLevel && c.gradeLevel.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const getBaseGrade = (grade: string) => grade ? grade.split('/')[0].trim() : '';
    
    const matchesGrade = gradeFilter === 'all' || 
                         c.gradeLevel === gradeFilter || 
                         getBaseGrade(c.gradeLevel) === getBaseGrade(gradeFilter);
                         
    const matchesType = typeFilter === 'all' ||
                        (typeFilter === 'activity' && c.subjectType === 'activity') ||
                        (typeFilter === 'basic' && (!c.subjectType || c.subjectType === 'academic') && (!c.academicCategory || c.academicCategory === 'basic')) ||
                        (typeFilter === 'additional' && (!c.subjectType || c.subjectType === 'academic') && c.academicCategory === 'additional');

    return matchesSearch && matchesGrade && matchesType;
  });

  const saveSubject = async () => {
    if (!editingSubject.subjectName || !editingSubject.gradeLevel) return;
    setIsSaving(true);
    try {
      const isNew = !editingSubject.id;
      
      // Get all selected grades, default to the single one if array is missing
      const selectedGrades = editingSubject.gradeLevels && editingSubject.gradeLevels.length > 0 
        ? editingSubject.gradeLevels 
        : [editingSubject.gradeLevel];

      // Clean undefined values
      const cleanPayload = Object.entries(editingSubject).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);
      
      // Create a separate document for EACH selected grade level
      const promises = selectedGrades.map((grade, index) => {
        // If editing an existing subject, use its ID for the FIRST grade selected.
        // For subsequent grades (meaning they added more grades during edit), create new IDs.
        // If it's a new subject altogether, generate a new ID for every grade.
        const docId = (!isNew && index === 0) ? editingSubject.id! : Date.now().toString() + index;
        
        const payload: CurriculumSubject = {
          ...cleanPayload,
          id: docId,
          subjectCode: editingSubject.subjectCode || '',
          subjectName: editingSubject.subjectName,
          gradeLevel: grade, // Set the specific grade
          subjectType: editingSubject.subjectType || 'academic',
          standards: editingSubject.standards || [],
          createdAt: isNew ? new Date().toISOString() : (editingSubject.createdAt || new Date().toISOString()),
          updatedAt: new Date().toISOString()
        };
        
        delete payload.gradeLevels; // Remove the array from the DB payload
        
        if (payload.subjectType === 'academic') {
          payload.academicCategory = editingSubject.academicCategory || 'basic';
        } else {
          delete payload.academicCategory; 
        }
        
        return setDoc(doc(db, 'curriculums', docId), payload);
      });

      await Promise.all(promises);
      
      await fetchCurriculums();
      setShowSubjectForm(false);
      
      // If we edited an existing one, keep it selected. 
      // If new, maybe just select the first one created, or none.
      if (!isNew) {
        setSelectedCurriculumId(editingSubject.id!);
      } else {
        setSelectedCurriculumId(null);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'curriculums');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteSubject = async (id: string) => {
    setConfirmModal({ isOpen: true, title: 'ลบรายวิชา', message: 'ยืนยันการลบรายวิชานี้? ข้อมูลมาตรฐานและตัวชี้วัดทั้งหมดจะถูกลบด้วย และไม่สามารถกู้คืนได้', onConfirm: async () => { setConfirmModal(null);
    try {
      await deleteDoc(doc(db, 'curriculums', id));
      if (selectedCurriculumId === id) setSelectedCurriculumId(null);
      await fetchCurriculums();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'curriculums');
    }
  }});
  };

  const handleDeleteAllCurriculums = async () => {
    setIsDeletingAll(true);
    try {
      for (const c of curriculums) {
        await deleteDoc(doc(db, 'curriculums', c.id));
      }
      setSelectedCurriculumId(null);
      await fetchCurriculums();
      setShowDeleteAllConfirm(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'curriculums');
    } finally {
      setIsDeletingAll(false);
    }
  };

  const importOBECCharacteristics = async (subjectId: string) => {
    if (!selectedCurriculum) return;
    setIsSaving(true);
    try {
      const OBEC_CHARACTERISTICS: CurriculumStandard = {
        id: 'obec_char_' + Date.now(),
        title: 'คุณลักษณะอันพึงประสงค์ 8 ประการ',
        indicators: [
          { id: Date.now().toString() + Math.random().toString(), code: 'ข้อ 1', description: 'รักชาติ ศาสน์ กษัตริย์', type: 'core' },
          { id: Date.now().toString() + Math.random().toString(), code: 'ข้อ 2', description: 'ซื่อสัตย์สุจริต', type: 'core' },
          { id: Date.now().toString() + Math.random().toString(), code: 'ข้อ 3', description: 'มีวินัย', type: 'core' },
          { id: Date.now().toString() + Math.random().toString(), code: 'ข้อ 4', description: 'ใฝ่เรียนรู้', type: 'core' },
          { id: Date.now().toString() + Math.random().toString(), code: 'ข้อ 5', description: 'อยู่อย่างพอเพียง', type: 'core' },
          { id: Date.now().toString() + Math.random().toString(), code: 'ข้อ 6', description: 'มุ่งมั่นในการทำงาน', type: 'core' },
          { id: Date.now().toString() + Math.random().toString(), code: 'ข้อ 7', description: 'รักความเป็นไทย', type: 'core' },
          { id: Date.now().toString() + Math.random().toString(), code: 'ข้อ 8', description: 'มีจิตสาธารณะ', type: 'core' }
        ]
      };
      
      const newSubject = { ...selectedCurriculum };
      newSubject.standards = [...(newSubject.standards || []), OBEC_CHARACTERISTICS];
      
      await setDoc(doc(db, 'curriculums', subjectId), newSubject);
      await fetchCurriculums();
      setAlertModal({ isOpen: true, title: 'นำเข้าสำเร็จ', message: 'นำเข้าคุณลักษณะอันพึงประสงค์ 8 ประการ เรียบร้อยแล้ว', type: 'success' });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'curriculums');
    } finally {
      setIsSaving(false);
    }
  };

  const importOBECCompetencies = async (subjectId: string) => {
    if (!selectedCurriculum) return;
    setIsSaving(true);
    try {
      const OBEC_COMPETENCIES: CurriculumStandard = {
        id: 'obec_comp_' + Date.now(),
        title: 'สมรรถนะสำคัญของผู้เรียน 5 ประการ',
        indicators: [
          { id: Date.now().toString() + Math.random().toString(), code: 'ข้อ 1', description: 'ความสามารถในการสื่อสาร', type: 'core' },
          { id: Date.now().toString() + Math.random().toString(), code: 'ข้อ 2', description: 'ความสามารถในการคิด', type: 'core' },
          { id: Date.now().toString() + Math.random().toString(), code: 'ข้อ 3', description: 'ความสามารถในการแก้ปัญหา', type: 'core' },
          { id: Date.now().toString() + Math.random().toString(), code: 'ข้อ 4', description: 'ความสามารถในการใช้ทักษะชีวิต', type: 'core' },
          { id: Date.now().toString() + Math.random().toString(), code: 'ข้อ 5', description: 'ความสามารถในการใช้เทคโนโลยี', type: 'core' }
        ]
      };
      
      const newSubject = { ...selectedCurriculum };
      newSubject.standards = [...(newSubject.standards || []), OBEC_COMPETENCIES];
      
      await setDoc(doc(db, 'curriculums', subjectId), newSubject);
      await fetchCurriculums();
      setAlertModal({ isOpen: true, title: 'นำเข้าสำเร็จ', message: 'นำเข้าสมรรถนะสำคัญของผู้เรียน 5 ประการ เรียบร้อยแล้ว', type: 'success' });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'curriculums');
    } finally {
      setIsSaving(false);
    }
  };

  const saveStandard = async () => {
    if (!selectedCurriculum || !editingStandard.title) return;
    setIsSaving(true);
    try {
      const updatedCurriculum = { ...selectedCurriculum };
      const isNew = !editingStandard.id;
      
      if (isNew) {
        const newStandard: CurriculumStandard = {
          id: Date.now().toString(),
          title: editingStandard.title,
          indicators: []
        };
        updatedCurriculum.standards = [...(updatedCurriculum.standards || []), newStandard];
      } else {
        updatedCurriculum.standards = updatedCurriculum.standards.map(s => 
          s.id === editingStandard.id ? { ...s, title: editingStandard.title } : s
        );
      }
      updatedCurriculum.updatedAt = new Date().toISOString();

      await setDoc(doc(db, 'curriculums', updatedCurriculum.id), updatedCurriculum);
      
      setCurriculums(prev => prev.map(c => c.id === updatedCurriculum.id ? updatedCurriculum : c));
      setShowStandardForm(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'curriculums');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteStandard = async (standardId: string) => {
    if (!selectedCurriculum) return;
    setConfirmModal({ isOpen: true, title: 'ลบมาตรฐานการเรียนรู้', message: 'ยืนยันการลบมาตรฐานการเรียนรู้นี้พร้อมตัวชี้วัดทั้งหมดภายใต้มาตรฐานนี้?', onConfirm: async () => { setConfirmModal(null);
    try {
      const updatedCurriculum = { ...selectedCurriculum };
      updatedCurriculum.standards = updatedCurriculum.standards.filter(s => s.id !== standardId);
      updatedCurriculum.updatedAt = new Date().toISOString();
      await setDoc(doc(db, 'curriculums', updatedCurriculum.id), updatedCurriculum);
      setCurriculums(prev => prev.map(c => c.id === updatedCurriculum.id ? updatedCurriculum : c));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'curriculums');
    }
  }});
  };

  const saveIndicator = async () => {
    if (!selectedCurriculum || !targetStandardId || !editingIndicator.code || !editingIndicator.description || !editingIndicator.type) return;
    setIsSaving(true);
    try {
      const updatedCurriculum = { ...selectedCurriculum };
      const standardIndex = updatedCurriculum.standards.findIndex(s => s.id === targetStandardId);
      if (standardIndex === -1) return;

      const standard = updatedCurriculum.standards[standardIndex];
      const isNew = !editingIndicator.id;

      const indicatorPayload: CurriculumIndicator = {
        id: isNew ? Date.now().toString() : editingIndicator.id!,
        code: editingIndicator.code,
        description: editingIndicator.description,
        type: editingIndicator.type as 'core' | 'terminal'
      };

      if (isNew) {
        standard.indicators = [...(standard.indicators || []), indicatorPayload];
      } else {
        standard.indicators = standard.indicators.map(ind => ind.id === indicatorPayload.id ? indicatorPayload : ind);
      }

      updatedCurriculum.standards[standardIndex] = standard;
      updatedCurriculum.updatedAt = new Date().toISOString();

      await setDoc(doc(db, 'curriculums', updatedCurriculum.id), updatedCurriculum);
      setCurriculums(prev => prev.map(c => c.id === updatedCurriculum.id ? updatedCurriculum : c));
      setShowIndicatorForm(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'curriculums');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteIndicator = async (standardId: string, indicatorId: string) => {
    if (!selectedCurriculum) return;
    setConfirmModal({ isOpen: true, title: 'ลบตัวชี้วัด', message: 'ยืนยันการลบตัวชี้วัดนี้?', onConfirm: async () => { setConfirmModal(null);
    try {
      const updatedCurriculum = { ...selectedCurriculum };
      const standardIndex = updatedCurriculum.standards.findIndex(s => s.id === standardId);
      if (standardIndex === -1) return;

      updatedCurriculum.standards[standardIndex].indicators = updatedCurriculum.standards[standardIndex].indicators.filter(ind => ind.id !== indicatorId);
      updatedCurriculum.updatedAt = new Date().toISOString();

      await setDoc(doc(db, 'curriculums', updatedCurriculum.id), updatedCurriculum);
      setCurriculums(prev => prev.map(c => c.id === updatedCurriculum.id ? updatedCurriculum : c));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'curriculums');
    }
  }});
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-indigo-500" />
          ระบบจัดการหลักสูตรและรายวิชา
        </h2>
        {canEdit && (
<div className="flex gap-2">
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".xlsx, .xls" 
            className="hidden" 
          />
          <button 
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg font-bold shadow-sm hover:bg-indigo-100 transition-colors whitespace-nowrap"
          >
            <Download className="h-4 w-4" /> โหลดไฟล์ตัวอย่าง (Excel)
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} 
            {isImporting ? 'กำลังนำเข้า...' : 'นำเข้าตัวชี้วัด (Excel)'}
          </button>

          <button 
            onClick={() => {
              setEditingSubject({ gradeLevel: BASE_GRADE_LEVELS[0], subjectName: SUBJECTS[0] });
              setShowSubjectForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow-sm hover:bg-indigo-700 transition-colors whitespace-nowrap"
          >
            <Plus className="h-4 w-4" /> เพิ่มรายวิชา
          </button>
          <button 
            onClick={() => setShowDeleteAllConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg font-bold shadow-sm hover:bg-rose-100 transition-colors whitespace-nowrap"
          >
            <Trash2 className="h-4 w-4" /> ล้างข้อมูลทั้งหมด
          </button>
        </div>
)}
      </div>

      <div className="flex bg-white rounded-xl shadow-sm border border-slate-100 p-1 w-max">
        <button
          onClick={() => setViewMode('subjects')}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            viewMode === 'subjects' 
              ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          รายวิชาเดี่ยว (Subjects)
        </button>
        <button
          onClick={() => setViewMode('integrated')}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            viewMode === 'integrated' 
              ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          หน่วยบูรณาการ (Integrated Units / PBL)
        </button>
      </div>

      {viewMode === 'integrated' && (
        <IntegratedUnitBuilder canEdit={canEdit} curriculums={curriculums} />
      )}
      
      {viewMode === 'subjects' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Subject List */}
          <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-200px)]">
            <h3 className="font-bold text-slate-800 mb-3">รายวิชาทั้งหมด</h3>
            
            <div className="mb-3 flex-shrink-0">
              <select 
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
              >
                <option value="all">ทุกระดับชั้น</option>
                {BASE_GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div className="relative mb-3 flex-shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="ค้นหารายวิชา..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-2 overflow-y-auto flex-1 pr-1 custom-scrollbar">
              {isLoading ? (
                <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
              ) : filteredCurriculums.length > 0 ? (
                filteredCurriculums.map(c => (
                  <div key={c.id} className="group relative">
                    <button 
                      onClick={() => setSelectedCurriculumId(c.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-start justify-between ${
                        selectedCurriculumId === c.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="min-w-0 pr-2 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          {c.subjectCode && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 flex-shrink-0">
                              {c.subjectCode}
                            </span>
                          )}
                          <span className="line-clamp-1 flex-1 font-bold flex items-center gap-1.5">
                            {c.subjectName}
                            {(!(c.totalHours || c.requiredHoursPerTerm)) && (
                               <AlertCircle className="h-3.5 w-3.5 text-orange-500 shrink-0" title="ยังไม่ได้ระบุชั่วโมงเรียน" />
                            )}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {c.gradeLevels && c.gradeLevels.length > 1 
                            ? `${c.gradeLevels[0]} - ${c.gradeLevels[c.gradeLevels.length - 1]}`
                            : c.gradeLevel}
                        </div>
                      </div>
                    </button>
                    {canEdit && selectedCurriculumId === c.id && (
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1 bg-indigo-50 pl-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingSubject(c); setShowSubjectForm(true); }}
                          className="p-1 text-indigo-400 hover:text-indigo-600 rounded"
                        ><Edit className="h-3.5 w-3.5" /></button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteSubject(c.id); }}
                          className="p-1 text-rose-400 hover:text-rose-600 rounded"
                        ><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center p-4 text-slate-400 text-sm">ไม่พบรายวิชา</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Content - Indicators */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-4">
            <div className="flex overflow-x-auto custom-scrollbar">
              <button 
                onClick={() => setInnerTab('indicators')}
                className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${innerTab === 'indicators' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                {selectedCurriculum?.subjectType === 'activity' ? '1. จุดประสงค์ / เกณฑ์ประเมิน' : '1. คลังตัวชี้วัด (Indicator Bank)'}
              </button>
              <button 
                onClick={() => setInnerTab('structure')}
                className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${innerTab === 'structure' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                2. ตั้งค่าวิชาย่อย (Parent-Child)
              </button>
            </div>
          </div>

          {innerTab === 'indicators' && (
            selectedCurriculum ? (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[calc(100vh-200px)]">
              <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-800">{selectedCurriculum.subjectName}</h3>
                  <p className="text-slate-500 text-sm mt-1">{selectedCurriculum.gradeLevel}</p>
                </div>
                {canEdit && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button 
                    onClick={() => {
                      setEditingSubject(selectedCurriculum);
                      setShowSubjectForm(true);
                    }}
                    className="px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" /> แก้ไขรายวิชา
                  </button>
                  <button 
                    onClick={() => deleteSubject(selectedCurriculum.id)}
                    className="px-3 py-2 bg-white border border-rose-200 text-rose-600 rounded-lg text-sm font-bold hover:bg-rose-50 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" /> ลบรายวิชา
                  </button>
                  <button 
                    onClick={() => clearIndicators(selectedCurriculum.id)}
                    className="px-3 py-2 bg-white border border-amber-200 text-amber-600 rounded-lg text-sm font-bold hover:bg-amber-50 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" /> ล้างตัวชี้วัดทั้งหมด
                  </button>
                  <div className="w-px h-8 bg-slate-200 mx-1"></div>
                  <button 
                    onClick={() => {
                      setEditingStandard({ title: '' });
                      setShowStandardForm(true);
                    }}
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" /> {selectedCurriculum?.subjectType === 'activity' ? 'เพิ่มเกณฑ์การประเมิน' : 'เพิ่มมาตรฐาน'}
                  </button>
                </div>
                )}
              </div>
              
              {canEdit && selectedCurriculum?.subjectType === 'activity' && (
                <div className="flex gap-2 mb-6">
                  <button 
                    onClick={() => importOBECCharacteristics(selectedCurriculum.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg font-bold shadow-sm hover:bg-emerald-100 transition-colors text-xs"
                  >
                    <CheckCircle className="h-4 w-4" /> นำเข้าคุณลักษณะอันพึงประสงค์ 8 ประการ (สพฐ.)
                  </button>
                  <button 
                    onClick={() => importOBECCompetencies(selectedCurriculum.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg font-bold shadow-sm hover:bg-blue-100 transition-colors text-xs"
                  >
                    <Award className="h-4 w-4" /> นำเข้าสมรรถนะสำคัญของผู้เรียน 5 ประการ (สพฐ.)
                  </button>
                </div>
              )}

              <div className="space-y-6">
                {selectedCurriculum.standards && selectedCurriculum.standards.length > 0 ? (
                  selectedCurriculum.standards.map((standard) => (
                    <div key={standard.id} className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-wrap justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800 text-sm sm:text-base">{standard.title}</h4>
                          <span className="text-[10px] font-bold bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full">
                            {standard.indicators?.length || 0} ตัวชี้วัด
                          </span>
                        </div>
                        {canEdit && (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              setTargetStandardId(standard.id);
                              setEditingIndicator({ code: '', description: '', type: 'core' });
                              setShowIndicatorForm(true);
                            }}
                            className="text-xs font-bold text-indigo-600 bg-white border border-indigo-100 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" /> เพิ่มตัวชี้วัด
                          </button>
                          <div className="h-4 w-px bg-slate-300 mx-1"></div>
                          <button onClick={() => { setEditingStandard({ id: standard.id, title: standard.title }); setShowStandardForm(true); }} className="text-slate-400 hover:text-indigo-600"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => deleteStandard(standard.id)} className="text-slate-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                        </div>
                        )}
                      </div>
                      
                      <div className="divide-y divide-slate-100">
                        {standard.indicators && standard.indicators.length > 0 ? (
                          standard.indicators.map((ind) => (
                            <div key={ind.id} className="p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                              <div className="mt-1 flex-shrink-0" title={ind.type === 'core' ? "ตัวชี้วัดต้องรู้ (ต้นทาง)" : "ตัวชี้วัดควรรู้ (ปลายทาง)"}>
                                {ind.type === 'core' ? (
                                  <CheckCircle2 className="h-5 w-5 text-rose-500" />
                                ) : (
                                  <Circle className="h-5 w-5 text-amber-500" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <span className="font-bold text-slate-800">{ind.code}</span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    ind.type === 'core' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                                  }`}>
                                    {ind.type === 'core' ? 'ตัวชี้วัดต้องรู้ (ต้นทาง)' : 'ตัวชี้วัดควรรู้ (ปลายทาง)'}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600 whitespace-pre-line">{ind.description}</p>
                              </div>
                              {canEdit && (
                              <div className="flex gap-2 text-slate-400">
                                <button onClick={() => { setTargetStandardId(standard.id); setEditingIndicator(ind); setShowIndicatorForm(true); }} className="hover:text-indigo-600"><Edit className="h-4 w-4" /></button>
                                <button onClick={() => deleteIndicator(standard.id, ind.id)} className="hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                              </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-slate-400 text-sm">ยังไม่มีตัวชี้วัดในมาตรฐานนี้</div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                    <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-700 mb-1">ยังไม่มีมาตรฐานการเรียนรู้</h3>
                    <p className="text-slate-500 text-sm">เพิ่มมาตรฐานการเรียนรู้เพื่อเริ่มต้นจัดการตัวชี้วัด</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full flex flex-col items-center justify-center text-slate-400 min-h-[400px]">
              <BookOpen className="h-16 w-16 mb-4 text-slate-200" />
              <p>เลือกรายวิชาทางด้านซ้าย หรือเพิ่มรายวิชาใหม่</p>
            </div>
          )
          )}

          {innerTab === 'structure' && (
            selectedCurriculum ? (
              <SubjectChildManager parentSubject={selectedCurriculum} onUpdate={fetchCurriculums} canEdit={canEdit} students={students} systemSemester={systemSemester} systemAcademicYear={systemAcademicYear} />
            ) : (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full flex flex-col items-center justify-center text-slate-400 min-h-[400px]">
                <BookOpen className="h-16 w-16 mb-4 text-slate-200" />
                <p>เลือกรายวิชาทางด้านซ้าย หรือเพิ่มรายวิชาใหม่</p>
              </div>
            )
          )}
        </div>
      </div>
      )}

      {/* Modals */}

      
      {/* Import Preview Modal */}
      {previewData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-black text-slate-800">ตัวอย่างข้อมูลก่อนนำเข้า</h3>
                <p className="text-sm text-slate-500 mt-1">ตรวจสอบความถูกต้องของข้อมูลตัวชี้วัดก่อนบันทึกลงระบบ</p>
              </div>
              <button onClick={() => setPreviewData(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6 bg-slate-50">
              {Array.from(previewData.values()).map((subject: CurriculumSubject, idx: number) => (
                <div key={idx} className="mb-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100">
                    <h4 className="font-bold text-indigo-900">{subject.subjectCode ? `[${subject.subjectCode}] ` : ''}{subject.subjectName} ({subject.gradeLevel})</h4>
                  </div>
                  
                  <div className="p-4 space-y-6">
                    {subject.standards.map((std, sIdx) => (
                      <div key={sIdx} className="space-y-3">
                        <div className="font-bold text-slate-700 bg-slate-100 px-3 py-2 rounded-lg inline-block">
                          {std.title}
                        </div>
                        <div className="overflow-x-auto rounded-lg border border-slate-200">
                          <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                              <tr>
                                <th className="px-4 py-3 w-32">รหัส</th>
                                <th className="px-4 py-3 min-w-[300px]">คำอธิบาย</th>
                                <th className="px-4 py-3 w-40 text-center">ประเภท</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {std.indicators.map((ind, iIdx) => (
                                <tr key={iIdx} className="hover:bg-slate-50/50">
                                  <td className="px-4 py-3 font-medium text-slate-700">{ind.code}</td>
                                  <td className="px-4 py-3 text-slate-600 whitespace-pre-wrap">{ind.description}</td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${ind.type === 'core' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                      {ind.type === 'core' ? 'ตัวชี้วัดระหว่างทาง' : 'ตัวชี้วัดปลายทาง'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-10">
              <button
                onClick={() => setPreviewData(null)}
                className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmImport}
                disabled={isImporting}
                className="px-6 py-2.5 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                {isImporting && <Loader2 className="h-4 w-4 animate-spin" />}
                ยืนยันการนำเข้าข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Alert Modal */}
      {alertModal && alertModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 text-center p-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4">
              {alertModal.type === 'success' ? (
                <CheckCircle className="h-6 w-6 text-emerald-500" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-rose-500" />
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">{alertModal.title}</h3>
            <p className="text-sm text-slate-600 mb-6">{alertModal.message}</p>
            <button
              onClick={() => setAlertModal(null)}
              className="w-full px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-500" />
                {confirmModal.title}
              </h3>
              <p className="text-sm text-slate-600">{confirmModal.message}</p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-4 py-2 text-sm font-bold bg-rose-500 text-white hover:bg-rose-600 rounded-lg transition-colors"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {showSubjectForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-500" />
                {editingSubject.id ? 'แก้ไขรายวิชา' : 'เพิ่มรายวิชาใหม่'}
              </h3>
              <button onClick={() => setShowSubjectForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">ระดับชั้น (เลือกได้มากกว่า 1)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BASE_GRADE_LEVELS.map(g => {
                    const isSelected = (editingSubject.gradeLevels || (editingSubject.gradeLevel ? [editingSubject.gradeLevel] : [])).includes(g);
                    return (
                      <label key={g} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        <input 
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            let currentGrades = editingSubject.gradeLevels || (editingSubject.gradeLevel ? [editingSubject.gradeLevel] : []);
                            if (e.target.checked) {
                              if (!currentGrades.includes(g)) {
                                currentGrades = [...currentGrades, g];
                              }
                            } else {
                              currentGrades = currentGrades.filter(grade => grade !== g);
                            }
                            
                            // Keep them sorted according to BASE_GRADE_LEVELS order
                            currentGrades.sort((a, b) => BASE_GRADE_LEVELS.indexOf(a) - BASE_GRADE_LEVELS.indexOf(b));
                            
                            setEditingSubject({
                              ...editingSubject, 
                              gradeLevels: currentGrades,
                              gradeLevel: currentGrades.length > 0 ? currentGrades[0] : ''
                            });
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-4 h-4"
                        />
                        <span className="text-sm font-medium">{g}</span>
                      </label>
                    );
                  })}
                </div>
                {(!editingSubject.gradeLevels || editingSubject.gradeLevels.length === 0) && !editingSubject.gradeLevel && (
                  <p className="text-rose-500 text-[10px] mt-1">* กรุณาเลือกระดับชั้นอย่างน้อย 1 ระดับ</p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ประเภทวิชา</label>
                  <select 
                    value={editingSubject.subjectType || 'academic'} 
                    onChange={e => {
                      const newType = e.target.value as 'academic' | 'activity';
                      setEditingSubject({
                        ...editingSubject, 
                        subjectType: newType,
                        // Reset academicCategory if switched to activity
                        academicCategory: newType === 'activity' ? undefined : (editingSubject.academicCategory || 'basic')
                      });
                    }}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm mb-4"
                  >
                    <option value="academic">วิชาการ (ตัดเกรด 0-4)</option>
                    <option value="activity">กิจกรรมพัฒนาผู้เรียน (ผ่าน / ไม่ผ่าน)</option>
                  </select>
                </div>
                
                {(!editingSubject.subjectType || editingSubject.subjectType === 'academic') && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">หมวดหมู่วิชาการ</label>
                    <select 
                      value={editingSubject.academicCategory || 'basic'} 
                      onChange={e => setEditingSubject({...editingSubject, academicCategory: e.target.value as 'basic' | 'additional'})}
                      className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm mb-4"
                    >
                      <option value="basic">วิชาพื้นฐาน</option>
                      <option value="additional">วิชาเพิ่มเติม</option>
                    </select>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อรายวิชา (พร้อมรหัส)</label>
                <input 
                  type="text" 
                  value={editingSubject.subjectName || ''}
                  onChange={e => setEditingSubject({...editingSubject, subjectName: e.target.value})}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="เช่น คณิตศาสตร์พื้นฐาน (ค11101)"
                  list="subject-options"
                />
                <datalist id="subject-options">
                  {SUBJECTS.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">โครงสร้างเวลาเรียน (ชั่วโมง / ปีการศึกษา)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={editingSubject.totalHours || editingSubject.requiredHoursPerTerm || ''}
                    onChange={e => setEditingSubject({...editingSubject, totalHours: e.target.value ? Number(e.target.value) : undefined})}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm pr-10"
                    placeholder="เช่น 100"
                    min="1"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium pointer-events-none">ชม.</div>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">ตัวเลขนี้จะถูกนำไปใช้คำนวณระยะเวลาเรียนที่แท้จริงหักลบกับวันหยุดในตารางสอน</p>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => setShowSubjectForm(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                ยกเลิก
              </button>
              <button onClick={saveSubject} disabled={isSaving || !editingSubject.subjectName} className="px-4 py-2 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {showStandardForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-slate-800 text-lg">
                {editingStandard.id ? 'แก้ไขมาตรฐาน' : 'เพิ่มมาตรฐานการเรียนรู้'}
              </h3>
              <button onClick={() => setShowStandardForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อมาตรฐาน</label>
              <input 
                type="text" 
                value={editingStandard.title}
                onChange={e => setEditingStandard({...editingStandard, title: e.target.value})}
                className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="เช่น มาตรฐาน ค 1.1"
                autoFocus
              />
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => setShowStandardForm(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                ยกเลิก
              </button>
              <button onClick={saveStandard} disabled={isSaving || !editingStandard.title} className="px-4 py-2 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {showIndicatorForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-slate-800 text-lg">
                {editingIndicator.id ? 'แก้ไขตัวชี้วัด' : 'เพิ่มตัวชี้วัด'}
              </h3>
              <button onClick={() => setShowIndicatorForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">รหัสตัวชี้วัด</label>
                <input 
                  type="text" 
                  value={editingIndicator.code || ''}
                  onChange={e => setEditingIndicator({...editingIndicator, code: e.target.value})}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                  placeholder="เช่น ค 1.1 ป.1/1"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">ประเภทตัวชี้วัด</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setEditingIndicator({...editingIndicator, type: 'core'})}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-bold transition-all text-left ${
                      editingIndicator.type === 'core' 
                        ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm' 
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                    }`}
                  >
                    <CheckCircle2 className={`h-5 w-5 ${editingIndicator.type === 'core' ? 'text-rose-500' : 'text-slate-400'}`} />
                    <div>
                      <div>ตัวชี้วัดต้องรู้</div>
                      <div className="text-[10px] font-normal opacity-80">(ต้นทาง)</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setEditingIndicator({...editingIndicator, type: 'terminal'})}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-bold transition-all text-left ${
                      editingIndicator.type === 'terminal' 
                        ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm' 
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                    }`}
                  >
                    <Circle className={`h-5 w-5 ${editingIndicator.type === 'terminal' ? 'text-amber-500' : 'text-slate-400'}`} />
                    <div>
                      <div>ตัวชี้วัดควรรู้</div>
                      <div className="text-[10px] font-normal opacity-80">(ปลายทาง)</div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">คำอธิบายตัวชี้วัด</label>
                <textarea 
                  value={editingIndicator.description || ''}
                  onChange={e => setEditingIndicator({...editingIndicator, description: e.target.value})}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm leading-relaxed"
                  placeholder="รายละเอียดตัวชี้วัด..."
                  rows={4}
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => setShowIndicatorForm(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                ยกเลิก
              </button>
              <button onClick={saveIndicator} disabled={isSaving || !editingIndicator.code || !editingIndicator.description} className="px-4 py-2 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteAllConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-rose-500" />
              ยืนยันการล้างข้อมูลทั้งหมด
            </h3>
            <p className="text-slate-600 mb-6">
              คุณกำลังจะลบข้อมูล "รายวิชาและตัวชี้วัดทั้งหมด" ออกจากระบบ การกระทำนี้ไม่สามารถย้อนกลับได้ คุณต้องการดำเนินการต่อหรือไม่?
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowDeleteAllConfirm(false)}
                className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                disabled={isDeletingAll}
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleDeleteAllCurriculums}
                className="px-4 py-2 font-bold bg-rose-600 text-white hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-2"
                disabled={isDeletingAll}
              >
                {isDeletingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {isDeletingAll ? 'กำลังลบข้อมูล...' : 'ยืนยันการลบทั้งหมด'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
