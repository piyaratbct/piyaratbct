import re

with open('src/components/StudentDetailModal.tsx', 'r') as f:
    content = f.read()

helper = """  const formatThaiDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString;
    }
  };
"""

target = "export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ student, onClose }) => {\n"
replacement = target + helper
content = content.replace(target, replacement)

with open('src/components/StudentDetailModal.tsx', 'w') as f:
    f.write(content)
