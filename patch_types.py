with open('src/types.ts', 'r') as f:
    content = f.read()

new_type = """
export interface DisciplineIncident {
  id: string;
  studentIds: string[];
  studentNames: string[]; // For easy display without joining
  description: string;
  type: 'fight' | 'conflict' | 'misunderstanding' | 'accident' | 'other';
  teacherId: string;
  teacherName: string;
  date: string;
  semester: string;
  academicYear: string;
  createdAt: string;
  updatedAt: string;
}
"""

if "export interface DisciplineIncident" not in content:
    content += new_type
    with open('src/types.ts', 'w') as f:
        f.write(content)
    print("Added DisciplineIncident type")
else:
    print("Type already exists")
