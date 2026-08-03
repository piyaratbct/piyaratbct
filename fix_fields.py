import re

with open('src/components/DailyNotificationPopup.tsx', 'r') as f:
    content = f.read()

# Fix day filter
old_day_filter = """          const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          const todayStr = days[dayOfWeek];
          
          // Fetch schedules for today
          const scheduleQ = query(
            collection(db, 'schedules'),
            where('teacherId', '==', currentTeacher.id),
            where('academicYear', '==', systemAcademicYear),
            where('semester', '==', systemSemester)
          );
          
          const scheduleSnap = await getDocs(scheduleQ);
          const schedules = scheduleSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
          
          // Filter for today and sort by period
          const todayClassSchedules = schedules
            .filter(s => s.day === todayStr)"""

new_day_filter = """          
          // Fetch schedules for today
          const scheduleQ = query(
            collection(db, 'schedules'),
            where('teacherId', '==', currentTeacher.id),
            where('academicYear', '==', systemAcademicYear),
            where('semester', '==', systemSemester)
          );
          
          const scheduleSnap = await getDocs(scheduleQ);
          const schedules = scheduleSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
          
          // Filter for today and sort by period
          const todayClassSchedules = schedules
            .filter(s => s.dayOfWeek === dayOfWeek)"""

content = content.replace(old_day_filter, new_day_filter)

# Fix subject Name
content = content.replace("schedule.subjectName", "schedule.subject")

with open('src/components/DailyNotificationPopup.tsx', 'w') as f:
    f.write(content)
