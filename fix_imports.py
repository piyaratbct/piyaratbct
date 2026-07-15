import os
import re

def add_import(file_path, import_stmt):
    with open(file_path, 'r') as f:
        content = f.read()
    
    if import_stmt not in content:
        # Find the last import
        imports_end = 0
        for m in re.finditer(r'^import .*?;?\n', content, flags=re.MULTILINE):
            imports_end = m.end()
        
        if imports_end > 0:
            content = content[:imports_end] + import_stmt + '\n' + content[imports_end:]
        else:
            content = import_stmt + '\n' + content
            
        with open(file_path, 'w') as f:
            f.write(content)

add_import('src/App.tsx', "import { formatThaiDate } from './lib/dateUtils';")
add_import('src/components/AssessmentModal.tsx', "import { formatThaiDateTime } from '../lib/dateUtils';")
add_import('src/components/AssessmentPrintTemplate.tsx', "import { formatThaiMonthYear } from '../lib/dateUtils';")
add_import('src/components/ClassroomModule.tsx', "import { formatThaiDateTime } from '../lib/dateUtils';")
add_import('src/components/LessonLogList.tsx', "import { formatThaiDateTime } from '../lib/dateUtils';")

