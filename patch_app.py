import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add import
content = content.replace("import { auth, db } from './lib/firebase';", "import { auth, db } from './lib/firebase';\nimport { formatThaiDate } from './lib/dateUtils';")

# Replace toLocaleDateString
content = content.replace("return new Date(timestamp).toLocaleDateString('th-TH');", "return formatThaiDate(timestamp);")

with open('src/App.tsx', 'w') as f:
    f.write(content)
