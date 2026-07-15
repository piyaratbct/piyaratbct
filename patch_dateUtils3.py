with open('src/lib/dateUtils.ts', 'r') as f:
    content = f.read()

target = """export const formatThaiDate = (dateString?: string) => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    
    const day = d.getDate();
    const month = thaiMonths[d.getMonth()];
    const year = d.getFullYear() < 2400 ? d.getFullYear() + 543 : d.getFullYear();
    
    return `${day} ${month} ${year}`;
  } catch {
    return dateString;
  }
};"""

replacement = """export const formatThaiDate = (dateString?: string) => {
  if (!dateString) return '-';
  try {
    let parsedString = dateString;
    const sep = dateString.includes('/') ? '/' : (dateString.includes('-') ? '-' : null);
    if (sep) {
      const parts = dateString.split(sep);
      if (parts.length === 3 && parts[0].length <= 2 && parts[2].length === 4) {
        let day = parts[0].padStart(2, '0');
        let month = parts[1].padStart(2, '0');
        let year = parseInt(parts[2], 10);
        if (year > 2400) year -= 543;
        parsedString = `${year}-${month}-${day}`;
      }
    }
    
    if (/^\\d+$/.test(parsedString) && parseInt(parsedString, 10) > 30000) {
      const serial = parseInt(parsedString, 10);
      const d = new Date(Math.round((serial - 25569) * 86400 * 1000));
      parsedString = d.toISOString();
    }

    const d = new Date(parsedString);
    if (isNaN(d.getTime())) return dateString;
    
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    
    const day = d.getDate();
    const month = thaiMonths[d.getMonth()];
    const year = d.getFullYear() < 2400 ? d.getFullYear() + 543 : d.getFullYear();
    
    return `${day} ${month} ${year}`;
  } catch {
    return dateString;
  }
};"""

content = content.replace(target, replacement)

with open('src/lib/dateUtils.ts', 'w') as f:
    f.write(content)
