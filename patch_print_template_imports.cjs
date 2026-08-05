const fs = require('fs');
let code = fs.readFileSync('src/components/PrintTemplate.tsx', 'utf8');
code = code.replace(
  "import { Printer, X, Eye, HelpCircle, Lock, ShieldCheck, ShieldAlert, User, CheckCircle } from 'lucide-react';",
  "import { Printer, X, Eye, HelpCircle, Lock, ShieldCheck, ShieldAlert, User, CheckCircle, Edit3, XCircle } from 'lucide-react';"
);
fs.writeFileSync('src/components/PrintTemplate.tsx', code, 'utf8');
