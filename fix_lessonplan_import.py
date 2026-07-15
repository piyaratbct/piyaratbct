with open('src/components/LessonPlanForm.tsx', 'r') as f:
    content = f.read()

if "  CalendarDays," not in content:
    content = content.replace(
        '} from "lucide-react";',
        '  CalendarDays,\n} from "lucide-react";'
    )

with open('src/components/LessonPlanForm.tsx', 'w') as f:
    f.write(content)
print("FIXED")
