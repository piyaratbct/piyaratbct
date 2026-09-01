import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    # Import more icons
    old_imports = "import { Award, CheckCircle, Search, Medal, Sparkles, Filter, ChevronDown, User, ShieldCheck, AlertCircle } from 'lucide-react';"
    new_imports = "import { Award, CheckCircle, Search, Medal, Sparkles, Filter, ChevronDown, User, ShieldCheck, AlertCircle, BookOpen, Flag, Clock, GraduationCap, ShieldAlert } from 'lucide-react';"
    code = code.replace(old_imports, new_imports)
    
    with open(filename, 'w') as f:
        f.write(code)

fix('src/components/CharacterAssessmentView.tsx')
