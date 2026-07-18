with open('src/types.ts', 'r') as f:
    content = f.read()

old_interface = """export interface SubjectScore {
  id: string;
  studentId: string;
  gradeLevel: string;
  academicYear: string;
  semester: string;
  subject: string;
  teacherId: string;
  
  // Scores
  midtermScore: number; // e.g. /20
  finalScore: number;   // e.g. /30
  assignmentScore: number; // e.g. /50
  totalScore: number; // /100
  grade: string; // "4", "3.5", "3", etc.
  
  updatedAt: string;
}"""

new_interface = """export interface SubjectScore {
  id: string;
  studentId: string;
  gradeLevel: string;
  academicYear: string;
  semester: string;
  subject: string;
  teacherId: string;
  
  // Non-grade scores
  preTestScore?: number;
  postTestScore?: number;

  // Grade scores
  beforeMidKnowledgeScore: number; // 20
  beforeMidSoftSkillScore: number; // 10
  midtermScore: number; // 20
  afterMidKnowledgeScore: number; // 20
  afterMidSoftSkillScore: number; // 10
  finalScore: number; // 20
  
  totalScore: number; // /100
  grade: string; // "4", "3.5", "3", etc.
  
  updatedAt: string;
}"""

content = content.replace(old_interface, new_interface)

with open('src/types.ts', 'w') as f:
    f.write(content)
