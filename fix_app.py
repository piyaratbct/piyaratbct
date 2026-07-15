with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("import {\nimport { formatThaiDate } from './lib/dateUtils';", "import { formatThaiDate } from './lib/dateUtils';\nimport {")
with open('src/App.tsx', 'w') as f:
    f.write(content)
