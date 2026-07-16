with open('src/App.tsx', 'r') as f:
    content = f.read()

old_records_query = """      if (currentTeacher.role !== "teacher") {
        recordsQuery = collection(db, "records");
      } else {
        recordsQuery = query(
          collection(db, "records"),
          where("teacherId", "==", currentTeacher.id),
        );
      }"""

new_records_query = """      const canReadAll = ['admin', 'academic', 'deputy'].includes(currentTeacher.role || '');
      if (canReadAll) {
        recordsQuery = collection(db, "records");
      } else {
        recordsQuery = query(
          collection(db, "records"),
          where("teacherId", "==", currentTeacher.id),
        );
      }"""

content = content.replace(old_records_query, new_records_query)

old_plans_query = """    let plansQuery: any = collection(db, "lessonPlans");
    try {
      if (currentTeacher.role === "teacher") {
        plansQuery = query(
          collection(db, "lessonPlans"),
          where("teacherId", "==", currentTeacher.id),
        );
      }
    }"""

new_plans_query = """    let plansQuery: any;
    try {
      const canReadAll = ['admin', 'academic', 'deputy'].includes(currentTeacher.role || '');
      if (canReadAll) {
        plansQuery = collection(db, "lessonPlans");
      } else {
        plansQuery = query(
          collection(db, "lessonPlans"),
          where("teacherId", "==", currentTeacher.id),
        );
      }
    }"""

content = content.replace(old_plans_query, new_plans_query)

with open('src/App.tsx', 'w') as f:
    f.write(content)
