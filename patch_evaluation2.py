with open('src/components/EvaluationModule.tsx', 'r') as f:
    content = f.read()

old_import = "import { BarChart3, TrendingUp, Award, BookOpen, ChevronDown, CheckCircle, Search, FileText, Wrench, CalendarDays } from 'lucide-react';"
new_import = "import { BarChart3, TrendingUp, Award, BookOpen, ChevronDown, CheckCircle, Search, FileText, Wrench, CalendarDays, AlertCircle } from 'lucide-react';"

content = content.replace(old_import, new_import)

with open('src/components/EvaluationModule.tsx', 'w') as f:
    f.write(content)
