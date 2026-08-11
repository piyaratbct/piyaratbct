const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const notifStates = `  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
`;

code = code.replace(/const \[showTeacherListModal, setShowTeacherListModal\] = useState<boolean>\(false\);\n/, 'const [showTeacherListModal, setShowTeacherListModal] = useState<boolean>(false);\n' + notifStates);

fs.writeFileSync('src/App.tsx', code, 'utf8');
