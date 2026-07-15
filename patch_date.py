import re

with open('src/lib/dateUtils.ts', 'r') as f:
    content = f.read()

target1 = """    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    
    const day = d.getDate();
    const month = thaiMonths[d.getMonth()];
    const year = d.getFullYear() < 2400 ? d.getFullYear() + 543 : d.getFullYear();
    
    return `${day} ${month} ${year}`;"""

replacement1 = """    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear() < 2400 ? d.getFullYear() + 543 : d.getFullYear();
    
    return `${day}/${month}/${year}`;"""

content = content.replace(target1, replacement1)

target2 = """    const thaiMonthsShort = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    
    const day = d.getDate();
    const month = thaiMonthsShort[d.getMonth()];
    const year = d.getFullYear() < 2400 ? d.getFullYear() + 543 : d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    
    return `${day} ${month} ${year} ${hours}:${minutes} น.`;"""

replacement2 = """    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear() < 2400 ? d.getFullYear() + 543 : d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes} น.`;"""

content = content.replace(target2, replacement2)

target3 = """    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    
    const month = thaiMonths[d.getMonth()];
    const year = d.getFullYear() < 2400 ? d.getFullYear() + 543 : d.getFullYear();
    
    return `${month} ${year}`;"""

replacement3 = """    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear() < 2400 ? d.getFullYear() + 543 : d.getFullYear();
    
    return `${month}/${year}`;"""

content = content.replace(target3, replacement3)

with open('src/lib/dateUtils.ts', 'w') as f:
    f.write(content)
