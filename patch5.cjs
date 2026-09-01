const fs = require('fs');
let code = fs.readFileSync('src/components/LessonAdmitModule.tsx', 'utf8');

code = code.replace(
  "const [loading, setLoading] = useState(false);\n  const [appToDelete, setAppToDelete] = useState<AdmissionRecord | null>(null);",
  "const [loading, setLoading] = useState(false);"
);

code = code.replace(
  "const [isSubmitting, setIsSubmitting] = useState(false);",
  "const [isSubmitting, setIsSubmitting] = useState(false);\n  const [appToDelete, setAppToDelete] = useState<AdmissionRecord | null>(null);"
);

fs.writeFileSync('src/components/LessonAdmitModule.tsx', code);
