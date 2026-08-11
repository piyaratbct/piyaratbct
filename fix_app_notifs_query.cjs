const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const notifQueryStr = `
    let unsubNotifications = () => {};
    if (currentTeacher) {
      const qNotif = query(
        collection(db, "notifications"),
        where("userId", "==", currentTeacher.id)
      );
      unsubNotifications = onSnapshot(qNotif, (snapshot) => {
        const fetchedNotifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification));
        // Sort by createdAt descending
        fetchedNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setNotifications(fetchedNotifs);
      });
    }

    return () => {
`;

code = code.replace(/return \(\) => \{/, notifQueryStr);

code = code.replace(/unsubStudents\(\);\n\s*\};\n/, 'unsubStudents();\n      unsubNotifications();\n    };\n');

fs.writeFileSync('src/App.tsx', code, 'utf8');
