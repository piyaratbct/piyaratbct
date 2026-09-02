import re

with open('src/lib/dateUtils.ts', 'r') as f:
    code = f.read()

target = """    if (/^\d+$/.test(parsedString) && parseInt(parsedString, 10) > 30000) {
      const serial = parseInt(parsedString, 10);
      const d = new Date(Math.round((serial - 25569) * 86400 * 1000));
      parsedString = d.toISOString();
    }"""

replacement = """    if (/^\d+$/.test(parsedString)) {
      const serial = parseInt(parsedString, 10);
      if (serial > 30000) {
        const d = new Date(Math.round((serial - 25569) * 86400 * 1000));
        parsedString = d.toISOString();
      } else {
        // It's just a small number (e.g. 1, 2, 3), don't parse it as a Date
        return dateString;
      }
    }"""

code = code.replace(target, replacement)

with open('src/lib/dateUtils.ts', 'w') as f:
    f.write(code)

print("Updated dateUtils")
