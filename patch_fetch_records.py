import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    fetch_events = """    const unsubEvents = onSnapshot(collection(db, 'schoolEvents'), snap => {
      setSchoolEvents(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });"""

    fetch_events_new = """    const unsubEvents = onSnapshot(collection(db, 'schoolEvents'), snap => {
      setSchoolEvents(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    
    // Fetch lesson records for insights
    const unsubRecords = onSnapshot(collection(db, 'records'), snap => {
      setLessonRecords(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });"""

    code = code.replace(fetch_events, fetch_events_new)
    
    unsubscribe_old = """    return () => {
      unsubAttendance();
      unsubDiscipline();
      unsubScores();
      unsubEvents();
    };"""

    unsubscribe_new = """    return () => {
      unsubAttendance();
      unsubDiscipline();
      unsubScores();
      unsubEvents();
      unsubRecords();
    };"""

    code = code.replace(unsubscribe_old, unsubscribe_new)

    with open(filename, 'w') as f:
        f.write(code)

fix('src/components/CharacterAssessmentView.tsx')
