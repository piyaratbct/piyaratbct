import re

with open('src/components/AssessmentPrintTemplate.tsx', 'r') as f:
    content = f.read()

# Add import
if "import { formatThaiMonthYear } from '../lib/dateUtils';" not in content:
    content = content.replace("import React from 'react';", "import React from 'react';\nimport { formatThaiMonthYear } from '../lib/dateUtils';")

target = """                    {assessment.month
                      ? new Date(assessment.month).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "long",
                        })
                      : "-"}"""

content = content.replace(target, "{formatThaiMonthYear(assessment.month)}")

with open('src/components/AssessmentPrintTemplate.tsx', 'w') as f:
    f.write(content)
