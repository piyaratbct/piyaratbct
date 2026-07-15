import re

with open('src/components/AssessmentModal.tsx', 'r') as f:
    content = f.read()

content = content.replace('                  type="number"\n                  step="0.1"\n                  value={weight}', '                  type="number"\n                  step="0.1"\n                  min="10"\n                  max="150"\n                  value={weight}')
content = content.replace('                  type="number"\n                  step="0.1"\n                  value={height}', '                  type="number"\n                  step="0.1"\n                  min="80"\n                  max="200"\n                  value={height}')

with open('src/components/AssessmentModal.tsx', 'w') as f:
    f.write(content)

with open('src/components/StudentModal.tsx', 'r') as f:
    content = f.read()

content = content.replace('                  type="number"\n                step="0.1"\n                value={formData.weight}', '                  type="number"\n                step="0.1"\n                min="10"\n                max="150"\n                value={formData.weight}')
content = content.replace('                  type="number"\n                step="0.1"\n                value={formData.height}', '                  type="number"\n                step="0.1"\n                min="80"\n                max="200"\n                value={formData.height}')

with open('src/components/StudentModal.tsx', 'w') as f:
    f.write(content)
