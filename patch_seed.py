import re

with open('src/components/DisciplineModule.tsx', 'r') as f:
    content = f.read()

import re
content = re.sub(r'  const seedMockData = async \(\) => \{.*?  \};\n\n', '', content, flags=re.DOTALL)

with open('src/components/DisciplineModule.tsx', 'w') as f:
    f.write(content)
