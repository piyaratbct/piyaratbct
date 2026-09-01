import re

def clean_file(filename):
    with open(filename, 'r') as f:
        content = f.read()
    
    # Remove duplicates
    content = content.replace("import { LessonRecord, Student, Student,", "import { LessonRecord, Student,")
    content = content.replace("import { formatThaiDate } from '../lib/dateUtils';\nimport { DESIRABLE_CHARACTERISTICS } from '../data';\nimport { formatThaiDate } from '../lib/dateUtils';\nimport { DESIRABLE_CHARACTERISTICS } from '../data';", "import { formatThaiDate } from '../lib/dateUtils';\nimport { DESIRABLE_CHARACTERISTICS } from '../data';")
    content = content.replace("import { formatThaiDate } from '../lib/dateUtils';\nimport { DESIRABLE_CHARACTERISTICS } from '../data';\nimport { formatThaiDate } from '../lib/dateUtils';", "import { formatThaiDate } from '../lib/dateUtils';\nimport { DESIRABLE_CHARACTERISTICS } from '../data';")
    
    with open(filename, 'w') as f:
        f.write(content)

clean_file('src/components/LessonLogForm.tsx')
clean_file('src/components/PBLLessonLogForm.tsx')
