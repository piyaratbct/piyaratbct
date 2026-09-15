import { sortSubjects } from '../types';
import { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useAvailableSubjects(gradeLevel?: string) {
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchAvailableSubjects = async () => {
      try {
        const q = query(collection(db, 'curriculums'));
        const snapshot = await getDocs(q);
        
        let allDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        if (gradeLevel) {
          const getBaseGrade = (g: string) => g ? g.split('/')[0].trim() : '';
          const baseTargetGrade = getBaseGrade(gradeLevel);
          allDocs = allDocs.filter(d => {
            if (!d.gradeLevel) return true; // keep if no grade specified
            return getBaseGrade(d.gradeLevel) === baseTargetGrade;
          });
        }
        allDocs.sort(sortSubjects);
        const parentIds = new Set<string>();
        
        allDocs.forEach(data => {
          if (data.isParent) parentIds.add(data.id);
          if (data.parentId) parentIds.add(data.parentId);
        });

        const parentNames = new Set<string>();
        const childMap = new Map<string, string[]>();
        
        allDocs.forEach(data => {
          if ((parentIds.has(data.id) || data.isParent) && data.subjectName) {
            parentNames.add(data.subjectName);
            if (!childMap.has(data.subjectName)) childMap.set(data.subjectName, []);
          }
        });

        allDocs.forEach(data => {
          if (data.parentId) {
            const parentDoc = allDocs.find(d => d.id === data.parentId);
            if (parentDoc && parentDoc.subjectName && data.subjectName) {
              const children = childMap.get(parentDoc.subjectName) || [];
              if (!children.includes(data.subjectName)) {
                children.push(data.subjectName);
              }
              childMap.set(parentDoc.subjectName, children);
            }
          }
        });

        const dropDownData: any[] = [];
        
        const standaloneSubjects = new Set<string>();
        allDocs.forEach(data => {
          const isActuallyParent = parentIds.has(data.id) || data.isParent === true;
          if (data.subjectName && !isActuallyParent && !parentNames.has(data.subjectName) && !data.parentId) {
            standaloneSubjects.add(data.subjectName);
          }
        });
        
        // Arrays to hold different categories
        const basicSubjects: any[] = [];
        const additionalSubjects: any[] = [];
        const activitySubjects: any[] = [];
        
        // Categorize standalone subjects
        standaloneSubjects.forEach(s => {
          const originalDoc = allDocs.find(d => d.subjectName === s);
          const type = originalDoc?.subjectType || 'academic';
          const cat = originalDoc?.academicCategory || 'basic';
          
          const item = { type: 'single', name: s, subjectType: type, totalHours: originalDoc?.totalHours, requiredHoursPerTerm: originalDoc?.requiredHoursPerTerm };
          
          if (type === 'activity') {
            activitySubjects.push(item);
          } else if (cat === 'additional') {
            additionalSubjects.push(item);
          } else {
            basicSubjects.push(item);
          }
        });
        
        // Categorize parent subjects (groups)
        parentNames.forEach(pName => {
          const children = childMap.get(pName) || [];
          if (children.length > 0) {
            const originalDoc = allDocs.find(d => d.subjectName === pName);
            const type = originalDoc?.subjectType || 'academic';
            const cat = originalDoc?.academicCategory || 'basic';
            
            const item = { type: 'group', groupName: pName, subjects: children, totalHours: originalDoc?.totalHours, requiredHoursPerTerm: originalDoc?.requiredHoursPerTerm };
            
            if (type === 'activity') {
              activitySubjects.push(item);
            } else if (cat === 'additional') {
              additionalSubjects.push(item);
            } else {
              basicSubjects.push(item);
            }
          }
        });
        
        // Helper to push items with section headers
        if (basicSubjects.length > 0) {
          dropDownData.push({ type: 'header', label: '--- วิชาพื้นฐาน ---' });
          dropDownData.push(...basicSubjects);
        }
        
        if (additionalSubjects.length > 0) {
          dropDownData.push({ type: 'header', label: '--- วิชาเพิ่มเติม ---' });
          dropDownData.push(...additionalSubjects);
        }
        
        if (activitySubjects.length > 0) {
          dropDownData.push({ type: 'header', label: '--- กิจกรรมพัฒนาผู้เรียน ---' });
          dropDownData.push(...activitySubjects);
        }

        dropDownData.push({ type: 'header', label: '--- อื่นๆ ---' });
        dropDownData.push({ type: 'single', name: 'อื่นๆ' });
        setAvailableSubjects(dropDownData);
      } catch (error) {
        console.error("Error fetching available subjects", error);
      }
    };
    fetchAvailableSubjects();
  }, [gradeLevel]);

  return availableSubjects;
}
