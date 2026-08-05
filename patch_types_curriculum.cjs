const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

const newTypes = `
export interface CurriculumIndicator {
  id: string;
  code: string;
  description: string;
  type: 'core' | 'terminal';
}

export interface CurriculumStandard {
  id: string;
  title: string;
  indicators: CurriculumIndicator[];
}

export interface CurriculumSubject {
  id: string;
  subjectName: string;
  gradeLevel: string;
  standards: CurriculumStandard[];
  createdAt: string;
  updatedAt: string;
}
`;

code += "\n" + newTypes;

fs.writeFileSync('src/types.ts', code, 'utf8');
