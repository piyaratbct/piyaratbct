import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Student } from '../types';

export interface FailedSubjectDetail {
  subject: string;
  grade: string;
  totalScore?: number;
  reason: string;
}

export interface StudentAcademicStats {
  gpa?: number;
  totalScoreAvg?: number;
  totalSubjectsEvaluated: number;
  attendancePercentage?: number;
  attendedSessions?: number;
  totalSessions?: number;
}

export interface PromotionCriteriaConfig {
  minAttendancePercent?: number; // default 80%
  minGpa?: number; // default 1.00
  disallowFailingGrades?: boolean; // default true (grade 0, ร, มส, ขส not allowed)
  requireKindergartenPass?: boolean; // default true
  requireRecordedScores?: boolean; // default true (must have actual scores/grades recorded)
}

export interface StudentPromotionWarning {
  studentId: string;
  hasWarning: boolean;
  canPromote: boolean;
  hasRecordedData: boolean; // whether student has any recorded score / assessment data
  isMissingScores?: boolean; // true if no scores/assessments recorded
  failedSubjects: FailedSubjectDetail[];
  lowAttendance?: {
    percentage: number;
    attended: number;
    total: number;
    required: number;
  };
  lowGpa?: {
    gpa: number;
    required: number;
    totalSubjects: number;
  };
  kindergartenIssues?: string[];
  summaryText: string;
  detailedReasons: string[];
  academicStats: StudentAcademicStats;
}

export function usePromotionEvaluations(
  academicYear: string,
  gradeLevel: string,
  students: Student[],
  customCriteria?: PromotionCriteriaConfig
) {
  const [warnings, setWarnings] = useState<Record<string, StudentPromotionWarning>>({});
  const [isLoading, setIsLoading] = useState(false);

  const minAttendancePercent = customCriteria?.minAttendancePercent ?? 80;
  const minGpa = customCriteria?.minGpa ?? 1.00;
  const disallowFailingGrades = customCriteria?.disallowFailingGrades ?? true;
  const requireKindergartenPass = customCriteria?.requireKindergartenPass ?? true;
  const requireRecordedScores = customCriteria?.requireRecordedScores ?? true;

  // Use a stable serialized key of student IDs to prevent infinite loops from array reference changes
  const studentsKey = students.map(s => s.id).sort().join(',');

  useEffect(() => {
    if (!academicYear || !students || students.length === 0) {
      setWarnings({});
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const cleanYear = academicYear.replace(/\D/g, '') || academicYear;
    const studentIds = new Set(students.map(s => s.id));

    const checkEvaluations = async () => {
      setIsLoading(true);
      try {
        const warningsMap: Record<string, StudentPromotionWarning> = {};

        // Track student grade points for GPA calculation
        // studentId -> array of numeric grades
        const studentGradesMap: Record<string, { numericGrades: number[]; totalScores: number[] }> = {};

        // Initialize for all students
        students.forEach(s => {
          studentGradesMap[s.id] = { numericGrades: [], totalScores: [] };
          warningsMap[s.id] = {
            studentId: s.id,
            hasWarning: false,
            canPromote: true,
            hasRecordedData: false,
            isMissingScores: false,
            failedSubjects: [],
            kindergartenIssues: [],
            summaryText: '',
            detailedReasons: [],
            academicStats: {
              totalSubjectsEvaluated: 0
            }
          };
        });

        // 1. Fetch subject scores
        let scoreDocs: any[] = [];
        try {
          // Attempt 1: query by gradeLevel
          const scoresQuery = query(
            collection(db, 'subject_scores'),
            where('gradeLevel', '==', gradeLevel)
          );
          const scoreSnapshot = await getDocs(scoresQuery);
          if (!scoreSnapshot.empty) {
            scoreDocs = scoreSnapshot.docs.map(d => d.data());
          }
        } catch (e) {
          // fallback
        }

        // Attempt 2: if empty, query all subject_scores (collection is small in school DB)
        if (scoreDocs.length === 0) {
          try {
            const allScoresQuery = query(collection(db, 'subject_scores'));
            const allScoreSnapshot = await getDocs(allScoresQuery);
            scoreDocs = allScoreSnapshot.docs.map(d => d.data());
          } catch (err) {
            console.warn('Could not query subject_scores:', err);
          }
        }

        scoreDocs.forEach(data => {
          const studentId = data.studentId;
          if (!studentId || !studentIds.has(studentId)) return;

          // If academicYear is specified and doc has academicYear, verify match
          if (cleanYear && data.academicYear) {
            const docYear = String(data.academicYear).replace(/\D/g, '');
            if (docYear && docYear !== cleanYear) return;
          }

          // Mark that this student has recorded data in subject_scores
          if (warningsMap[studentId]) {
            warningsMap[studentId].hasRecordedData = true;
          }

          const grade = String(data.grade || '').trim();
          const totalScore = typeof data.totalScore === 'number' ? data.totalScore : Number(data.totalScore);
          const activityResult = data.activityResult;
          const subject = data.subject || 'ไม่ระบุวิชา';

          // Helper to extract grade value for GPA
          const numericGradeVal = parseFloat(grade);
          if (!isNaN(numericGradeVal)) {
            studentGradesMap[studentId]?.numericGrades.push(numericGradeVal);
          }
          if (!isNaN(totalScore) && totalScore > 0) {
            studentGradesMap[studentId]?.totalScores.push(totalScore);
          }

          let isFailing = false;
          let reason = '';

          // Check grade < 1, 0, ร, มส, ขส (if disallowFailingGrades is enabled)
          if (disallowFailingGrades) {
            if (grade === '0' || grade === '0.0') {
              isFailing = true;
              reason = `ได้เกรด 0${!isNaN(totalScore) && totalScore > 0 ? ` (คะแนน ${totalScore}/100)` : ''}`;
            } else if (grade === 'ร') {
              isFailing = true;
              reason = 'ติด "ร" (รอการตัดสินผลการเรียน)';
            } else if (grade === 'มส') {
              isFailing = true;
              reason = 'ติด "มส" (หมดสิทธิ์สอบเนื่องจากเวลาเรียนไม่พอ)';
            } else if (grade === 'ขส') {
              isFailing = true;
              reason = 'ติด "ขส" (ขาดการสอบปลายภาค)';
            } else if (!isNaN(Number(grade)) && grade !== '' && Number(grade) < 1) {
              isFailing = true;
              reason = `เกรด ${grade} (ต่ำกว่าเกณฑ์ 1.0)`;
            } else if (activityResult === 'ไม่ผ่าน') {
              isFailing = true;
              reason = 'กิจกรรมไม่ผ่านการประเมิน (มผ)';
            } else if (!isNaN(totalScore) && totalScore > 0 && totalScore < 50 && (!grade || grade === '0')) {
              isFailing = true;
              reason = `คะแนนรวม ${totalScore}/100 (ต่ำกว่า 50 คะแนน)`;
            }
          }

          if (isFailing) {
            const current = warningsMap[studentId];
            if (current) {
              if (!current.failedSubjects.some(f => f.subject === subject)) {
                current.failedSubjects.push({
                  subject,
                  grade: grade || '0',
                  totalScore: !isNaN(totalScore) ? totalScore : undefined,
                  reason
                });
                current.hasWarning = true;
                current.canPromote = false;
              }
            }
          }
        });

        // Compute GPA & Total Score average for each student
        Object.entries(studentGradesMap).forEach(([id, record]) => {
          const w = warningsMap[id];
          if (!w) return;

          const count = record.numericGrades.length;
          w.academicStats.totalSubjectsEvaluated = count;

          if (count > 0) {
            const sumGrades = record.numericGrades.reduce((acc, curr) => acc + curr, 0);
            const calculatedGpa = Number((sumGrades / count).toFixed(2));
            w.academicStats.gpa = calculatedGpa;

            if (record.totalScores.length > 0) {
              const sumScores = record.totalScores.reduce((acc, curr) => acc + curr, 0);
              w.academicStats.totalScoreAvg = Number((sumScores / record.totalScores.length).toFixed(1));
            }

            // Check GPA threshold
            if (calculatedGpa < minGpa) {
              w.lowGpa = {
                gpa: calculatedGpa,
                required: minGpa,
                totalSubjects: count
              };
              w.hasWarning = true;
              w.canPromote = false;
            }
          }
        });

        // 2. Fetch attendance sessions
        let attendanceDocs: any[] = [];
        try {
          const attendanceQuery = query(
            collection(db, 'attendanceSessions'),
            where('gradeLevel', '==', gradeLevel)
          );
          const attendanceSnapshot = await getDocs(attendanceQuery);
          if (!attendanceSnapshot.empty) {
            attendanceDocs = attendanceSnapshot.docs.map(d => d.data());
          }
        } catch (e) {
          // fallback
        }

        if (attendanceDocs.length === 0) {
          try {
            const allAttendanceQuery = query(collection(db, 'attendanceSessions'));
            const allAttendanceSnapshot = await getDocs(allAttendanceQuery);
            attendanceDocs = allAttendanceSnapshot.docs.map(d => d.data());
          } catch (err) {
            console.warn('Could not query attendanceSessions:', err);
          }
        }

        // Calculate student attendance statistics
        const studentAttendanceStats: Record<string, { attended: number; total: number }> = {};
        
        attendanceDocs.forEach(data => {
          // Filter by gradeLevel if relevant
          const docGrade = data.gradeLevel;
          if (gradeLevel && docGrade && docGrade !== gradeLevel && !docGrade.startsWith(gradeLevel)) {
            return;
          }

          // If academicYear is specified and doc has academicYear, verify match
          if (cleanYear && data.academicYear) {
            const docYear = String(data.academicYear).replace(/\D/g, '');
            if (docYear && docYear !== cleanYear) return;
          }

          const attendanceData = data.attendanceData as Record<string, string> | undefined;
          if (!attendanceData) return;

          studentIds.forEach(id => {
            const status = attendanceData[id];
            if (!status) return;

            if (!studentAttendanceStats[id]) {
              studentAttendanceStats[id] = { attended: 0, total: 0 };
            }

            studentAttendanceStats[id].total += 1;
            if (status === 'present' || status === 'late') {
              studentAttendanceStats[id].attended += 1;
            }
          });
        });

        // Check if attendance < minAttendancePercent (require at least 5 recorded sessions to avoid false positives on 1 demo session)
        Object.entries(studentAttendanceStats).forEach(([id, stats]) => {
          const w = warningsMap[id];
          if (!w) return;

          const percentage = stats.total > 0 ? Number(((stats.attended / stats.total) * 100).toFixed(1)) : 0;
          w.academicStats.attendedSessions = stats.attended;
          w.academicStats.totalSessions = stats.total;
          w.academicStats.attendancePercentage = percentage;

          if (stats.total >= 5 && percentage < minAttendancePercent) {
            w.lowAttendance = {
              percentage,
              attended: stats.attended,
              total: stats.total,
              required: minAttendancePercent
            };
            w.hasWarning = true;
            w.canPromote = false;
          }
        });

        // 3. Kindergarten developmental assessments (if kindergarten)
        if (gradeLevel.includes('อนุบาล')) {
          let kinderDocs: any[] = [];
          try {
            const kinderQuery = query(
              collection(db, 'assessments'),
              where('gradeLevel', '==', gradeLevel)
            );
            const kinderSnapshot = await getDocs(kinderQuery);
            kinderSnapshot.docs.forEach(d => kinderDocs.push(d.data()));
          } catch (e) {
            // fallback
          }

          try {
            const kgAltQuery = query(collection(db, 'kindergartenAssessments'));
            const kgAltSnapshot = await getDocs(kgAltQuery);
            kgAltSnapshot.docs.forEach(d => kinderDocs.push(d.data()));
          } catch (e) {
            // ignore
          }

          kinderDocs.forEach(data => {
            const studentId = data.studentId;
            if (!studentId || !studentIds.has(studentId)) return;

            // If academicYear is specified, verify match
            if (cleanYear && data.academicYear) {
              const docYear = String(data.academicYear).replace(/\D/g, '');
              if (docYear && docYear !== cleanYear) return;
            }

            const issues: string[] = [];
            const devItems = [
              { name: 'ด้านร่างกาย', score: data.physicalScore ?? (data.physicalDev === '1' ? 1 : undefined) },
              { name: 'ด้านอารมณ์ จิตใจ', score: data.emotionalScore ?? (data.emotionalDev === '1' ? 1 : undefined) },
              { name: 'ด้านสังคม', score: data.citizenshipScore ?? (data.citizenshipDev === '1' ? 1 : undefined) },
              { name: 'ด้านสติปัญญา', score: data.intellectualScore ?? (data.intellectualDev === '1' ? 1 : undefined) },
            ];

            devItems.forEach(item => {
              if (item.score === 1 || item.score === 0) {
                issues.push(`${item.name} (ระดับ 1: ต้องปรับปรุง)`);
              }
            });

            if (issues.length > 0) {
              const current = warningsMap[studentId];
              if (current) {
                current.kindergartenIssues = Array.from(new Set([...(current.kindergartenIssues || []), ...issues]));
                if (requireKindergartenPass) {
                  current.hasWarning = true;
                  current.canPromote = false;
                }
              }
            }
          });
        }

        // Generate summary text & detailed reasons for each student
        const isKindergarten = gradeLevel.includes('อนุบาล');

        Object.keys(warningsMap).forEach(id => {
          const w = warningsMap[id];
          const reasons: string[] = [];
          const summaryParts: string[] = [];

          // 0. Check if student has any recorded scores/assessment data
          if (requireRecordedScores) {
            // For Kindergarten, check kindergarten development data or scores
            // For Primary/other grades, check if any subject scores have been evaluated
            const hasData = isKindergarten
              ? w.hasRecordedData
              : w.academicStats.totalSubjectsEvaluated > 0;

            if (!hasData) {
              w.isMissingScores = true;
              w.hasWarning = true;
              w.canPromote = false;
              summaryParts.push('ยังไม่มีข้อมูลคะแนน');
              reasons.push(
                isKindergarten
                  ? 'ยังไม่มีการบันทึกผลการประเมินพัฒนาการ 4 ด้าน หรือผลการเรียนในระบบ'
                  : 'ยังไม่มีการบันทึกคะแนน/เกรดผลการเรียนในระบบ (ไม่สามารถตัดสินผลการเลื่อนชั้นได้)'
              );
            }
          }

          if (w.failedSubjects.length > 0) {
            summaryParts.push(`ไม่ผ่าน ${w.failedSubjects.length} วิชา`);
            w.failedSubjects.forEach(f => {
              reasons.push(`วิชา ${f.subject}: ${f.reason}`);
            });
          }

          if (w.lowGpa) {
            summaryParts.push(`เกรดเฉลี่ย ${w.lowGpa.gpa.toFixed(2)} (เกณฑ์ ≥ ${w.lowGpa.required.toFixed(2)})`);
            reasons.push(`ค่าเฉลี่ยผลการเรียนรวม (GPA) ได้ ${w.lowGpa.gpa.toFixed(2)} ซึ่งต่ำกว่าเกณฑ์ขั้นต่ำ ${w.lowGpa.required.toFixed(2)} (ประเมินจาก ${w.lowGpa.totalSubjects} วิชา)`);
          }

          if (w.lowAttendance) {
            summaryParts.push(`เวลาเรียน ${w.lowAttendance.percentage}% (ต่ำกว่า ${w.lowAttendance.required}%)`);
            reasons.push(`เวลาเรียนรวมได้ ${w.lowAttendance.percentage}% (${w.lowAttendance.attended}/${w.lowAttendance.total} คาบ) ต่ำกว่าเกณฑ์ขั้นต่ำ ${w.lowAttendance.required}% ติดสถานะ มส.`);
          }

          if (w.kindergartenIssues && w.kindergartenIssues.length > 0) {
            summaryParts.push(`พัฒนาการ ${w.kindergartenIssues.length} ด้านต้องปรับปรุง`);
            w.kindergartenIssues.forEach(issue => {
              reasons.push(`พัฒนาการปฐมวัย: ${issue}`);
            });
          }

          w.detailedReasons = reasons;
          w.summaryText = summaryParts.length > 0 ? summaryParts.join(' • ') : 'ผ่านเกณฑ์ทั้งหมด';
          w.canPromote = !w.hasWarning;
        });

        if (isMounted) {
          setWarnings(warningsMap);
        }
      } catch (error) {
        console.error('Error checking promotion evaluations:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkEvaluations();

    return () => {
      isMounted = false;
    };
  }, [academicYear, gradeLevel, studentsKey, minAttendancePercent, minGpa, disallowFailingGrades, requireKindergartenPass, requireRecordedScores]);

  const warningCount = (Object.values(warnings) as StudentPromotionWarning[]).filter(w => w.hasWarning).length;
  const eligibleCount = (Object.values(warnings) as StudentPromotionWarning[]).filter(w => w.canPromote).length;
  const missingScoresCount = (Object.values(warnings) as StudentPromotionWarning[]).filter(w => w.isMissingScores).length;

  return {
    warnings,
    warningCount,
    eligibleCount,
    missingScoresCount,
    criteria: {
      minAttendancePercent,
      minGpa,
      disallowFailingGrades,
      requireKindergartenPass,
      requireRecordedScores
    },
    isLoading,
    getWarningForStudent: (studentId: string) => warnings[studentId]
  };
}
