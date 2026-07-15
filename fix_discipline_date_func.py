with open('src/components/DisciplineModule.tsx', 'r') as f:
    content = f.read()

# Add import formatThaiDate
content = content.replace("import { formatThaiMonthYear } from '../lib/dateUtils';", "import { formatThaiMonthYear, formatThaiDate } from '../lib/dateUtils';")

# Remove the local formatThaiDate function
target = """const formatThaiDate = (dateString: string) => {
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
};"""

if target in content:
    content = content.replace(target, "")
    print("REMOVED LOCAL FUNCTION")
else:
    print("LOCAL FUNCTION NOT FOUND")

with open('src/components/DisciplineModule.tsx', 'w') as f:
    f.write(content)
