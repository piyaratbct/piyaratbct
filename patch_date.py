with open('src/lib/dateUtils.ts', 'r') as f:
    content = f.read()

target = """export const formatThaiMonthYear = (dateString?: string) => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    
    const monthIdx = d.getMonth();
    const year = d.getFullYear() < 2400 ? d.getFullYear() + 543 : d.getFullYear();
    
    const monthName = THAI_MONTHS_FULL[monthIdx];
    return `${monthName} ${year}`;
  } catch {
    return dateString;
  }
};"""

replacement = """export const formatThaiMonthYear = (dateString?: string) => {
  if (!dateString) return '-';
  try {
    // Check if it's YYYY-MM
    const parts = dateString.split('-');
    if (parts.length === 2 && parts[0].length === 4) {
      const year = parseInt(parts[0], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      const thaiYear = year < 2400 ? year + 543 : year;
      if (monthIdx >= 0 && monthIdx < 12) {
        return `${THAI_MONTHS_FULL[monthIdx]} ${thaiYear}`;
      }
    }
    
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    
    const monthIdx = d.getMonth();
    const year = d.getFullYear() < 2400 ? d.getFullYear() + 543 : d.getFullYear();
    
    const monthName = THAI_MONTHS_FULL[monthIdx];
    return `${monthName} ${year}`;
  } catch {
    return dateString;
  }
};"""

if target in content:
    content = content.replace(target, replacement)
    print("FIXED")
else:
    print("NOT FOUND")

with open('src/lib/dateUtils.ts', 'w') as f:
    f.write(content)
