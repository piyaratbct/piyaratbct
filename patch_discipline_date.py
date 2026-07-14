import re

with open('src/components/DisciplineModule.tsx', 'r') as f:
    content = f.read()

# Add formatThaiDate function after imports
import_section = "import { db } from '../lib/firebase';"
format_date_fn = """import { db } from '../lib/firebase';

const formatThaiDate = (dateString: string) => {
  if (!dateString) return '';
  try {
    const [year, month, day] = dateString.split('-');
    const months = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    return `${parseInt(day)} ${months[parseInt(month) - 1]} ${parseInt(year) + 543}`;
  } catch (e) {
    return dateString;
  }
};
"""
content = content.replace(import_section, format_date_fn)

# Remove the old date display
target_remove_date = """                    <div className="flex gap-2">
                      <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-lg whitespace-nowrap">
                        {incident.date}
                      </span>
                      {(currentTeacher.id === incident.teacherId || currentTeacher.role === 'admin' || currentTeacher.role === 'discipline') && ("""

replacement_remove_date = """                    <div className="flex gap-2">
                      {(currentTeacher.id === incident.teacherId || currentTeacher.role === 'admin' || currentTeacher.role === 'discipline') && ("""
content = content.replace(target_remove_date, replacement_remove_date)


# Move the date to the bottom
target_add_date = """                    {incident.time && (
                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock className="h-3.5 w-3.5" />
                        <span>เวลา: {incident.time} น.</span>
                      </div>
                    )}"""

replacement_add_date = """                    <div className="flex items-center gap-3 text-slate-400 mt-0.5">
                      {incident.date && (
                        <div className="flex items-center gap-1 text-slate-400">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatThaiDate(incident.date)}</span>
                        </div>
                      )}
                      {incident.time && (
                        <div className="flex items-center gap-1 text-slate-400">
                          <Clock className="h-3.5 w-3.5" />
                          <span>เวลา {incident.time} น.</span>
                        </div>
                      )}
                    </div>"""
content = content.replace(target_add_date, replacement_add_date)

with open('src/components/DisciplineModule.tsx', 'w') as f:
    f.write(content)

