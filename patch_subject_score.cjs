const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf-8');

const oldCode = `  totalScore: number; // /100
  grade: string; // "4", "3.5", "3", etc.
  
  updatedAt: string;
}`;

const newCode = `  totalScore: number; // /100
  grade: string; // "4", "3.5", "3", etc.
  
  // การประเมินคุณลักษณะอันพึงประสงค์ 8 ประการ (0-3)
  characterScores?: Record<string, number>;
  characterResult?: string; // "3", "2", "1", "0"

  // การประเมินอ่าน คิดวิเคราะห์ เขียน (0-3)
  readingScores?: Record<string, number>;
  readingResult?: string; // "3", "2", "1", "0"

  // การประเมินสมรรถนะสำคัญของผู้เรียน (0-3)
  competencyScores?: Record<string, number>;
  competencyResult?: string; // "3", "2", "1", "0"
  
  updatedAt: string;
}`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/types.ts', code, 'utf-8');
console.log("Patched SubjectScore type");
