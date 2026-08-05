const fs = require('fs');
let code = fs.readFileSync('src/components/CurriculumManager.tsx', 'utf8');

const importXlsx = `import * as XLSX from 'xlsx';\nimport { useRef } from 'react';`;

code = code.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect, useRef } from 'react';\nimport * as XLSX from 'xlsx';");

const fileUploadLogic = `
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

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
        const subjectName = String(row['ชื่อรายวิชา'] || row['SubjectName'] || '').trim();
        const gradeLevel = String(row['ระดับชั้น'] || row['GradeLevel'] || '').trim();
        const standardTitle = String(row['มาตรฐาน'] || row['StandardTitle'] || '').trim();
        const indicatorCode = String(row['รหัสตัวชี้วัด'] || row['IndicatorCode'] || '').trim();
        const indicatorDesc = String(row['คำอธิบายตัวชี้วัด'] || row['IndicatorDescription'] || row['คำอธิบาย'] || '').trim();
        let indicatorTypeRaw = String(row['ประเภท'] || row['IndicatorType'] || '').trim();
        
        let type: 'core' | 'terminal' = 'core';
        if (indicatorTypeRaw.includes('ควรรู้') || indicatorTypeRaw.toLowerCase().includes('terminal')) {
          type = 'terminal';
        }

        if (!subjectName || !gradeLevel) continue;

        const subjectKey = \`\${subjectName}-\${gradeLevel}\`;
        
        let curr = newCurriculums.get(subjectKey);
        if (!curr) {
          curr = {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
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

      // Save to firebase
      let successCount = 0;
      for (const [_, curr] of newCurriculums) {
        // Check if subject already exists
        const existing = curriculums.find(c => c.subjectName === curr.subjectName && c.gradeLevel === curr.gradeLevel);
        if (existing) {
          // Merge standards
          const merged = { ...existing };
          curr.standards.forEach(newStd => {
            const extStd = merged.standards.find(s => s.title === newStd.title);
            if (extStd) {
              // Merge indicators
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
      
      alert(\`นำเข้าข้อมูลสำเร็จ \${successCount} รายวิชา\`);
      await fetchCurriculums();
    } catch (error) {
      console.error('Error parsing excel:', error);
      alert('เกิดข้อผิดพลาดในการนำเข้าไฟล์ Excel โปรดตรวจสอบรูปแบบไฟล์');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
`;

code = code.replace("const [searchQuery, setSearchQuery] = useState('');", "const [searchQuery, setSearchQuery] = useState('');\n" + fileUploadLogic);

const buttonHtml = `
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".xlsx, .xls" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} 
            {isImporting ? 'กำลังนำเข้า...' : 'นำเข้าตัวชี้วัด (Excel)'}
          </button>
`;

code = code.replace(
  "{/* In the future: CSV Upload feature */}",
  buttonHtml
);

fs.writeFileSync('src/components/CurriculumManager.tsx', code, 'utf8');
