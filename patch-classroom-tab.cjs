const fs = require('fs');
let content = fs.readFileSync('src/components/ClassroomModule.tsx', 'utf8');

if (!content.includes('initialTab?:')) {
  content = content.replace(
    '  teachers?: Teacher[];\n}',
    "  teachers?: Teacher[];\n  initialTab?: 'students' | 'student360' | 'attendance' | 'assessments' | 'special-care';\n}"
  );
  
  content = content.replace(
    '  teachers = [],\n}) => {\n  const [activeTab, setActiveTab] = useState',
    '  teachers = [],\n  initialTab,\n}) => {\n  const [activeTab, setActiveTab] = useState'
  );
  
  content = content.replace(
    '    "students",\n  );',
    '    initialTab || "students",\n  );\n\n  useEffect(() => {\n    if (initialTab) setActiveTab(initialTab);\n  }, [initialTab]);'
  );
  
  fs.writeFileSync('src/components/ClassroomModule.tsx', content);
  console.log("Patched ClassroomModule.tsx");
} else {
  console.log("Already patched");
}
