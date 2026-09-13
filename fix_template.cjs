const fs = require('fs');
const file = 'src/components/CurriculumManager.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldFunc = `  const downloadTemplate = () => {
    const data = [
      {
        'ชื่อรายวิชา': 'คณิตศาสตร์พื้นฐาน (ค11101)',
        'ระดับชั้น': 'ประถมศึกษาปีที่ 1',
        'มาตรฐาน': 'มาตรฐาน ค 1.1',
        'รหัสตัวชี้วัด': 'ค 1.1 ป.1/1',
        'คำอธิบายตัวชี้วัด': 'บอกจำนวนของสิ่งต่าง ๆ แสดงสิ่งต่าง ๆ ตามจำนวนที่กำหนด อ่านและเขียนตัวเลขฮินดูอารบิก ตัวเลขไทยแสดงจำนวนนับไม่เกิน 100 และ 0',
        'ประเภท': 'ตัวชี้วัดระหว่างทาง'
      },
      {
        'ชื่อรายวิชา': 'คณิตศาสตร์พื้นฐาน (ค11101)',
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
      { wch: 25 }, // ชื่อรายวิชา
      { wch: 20 }, // ระดับชั้น
      { wch: 15 }, // มาตรฐาน
      { wch: 15 }, // รหัสตัวชี้วัด
      { wch: 50 }, // คำอธิบาย
      { wch: 20 }  // ประเภท
    ];
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, 'curriculum_template.xlsx');
  };`;

const newFunc = `  const downloadTemplate = () => {
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
  };`;

if (code.includes(oldFunc)) {
  code = code.replace(oldFunc, newFunc);
  fs.writeFileSync(file, code);
  console.log("Success");
} else {
  console.log("Failed to find exact match. Will try regex.");
  // Regex approach for robustness
  const startIdx = code.indexOf('const downloadTemplate = () => {');
  const endIdx = code.indexOf('};', startIdx) + 2;
  if (startIdx !== -1 && endIdx !== -1) {
    code = code.substring(0, startIdx) + newFunc + code.substring(endIdx);
    fs.writeFileSync(file, code);
    console.log("Success via regex slice");
  } else {
    console.log("Completely failed to find downloadTemplate");
  }
}
