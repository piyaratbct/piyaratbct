with open('firestore.rules', 'r') as f:
    content = f.read()

old_rule = """    match /disciplineIncidents/{incidentId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() && (resource.data.teacherId == request.auth.uid || isAdmin());
    }"""

new_rule = """    match /disciplineIncidents/{incidentId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() && (
        resource.data.teacherId == request.auth.uid 
        || isAdmin()
        || (exists(/databases/$(database)/documents/teachers/$(request.auth.uid)) 
            && getTeacherProfile(request.auth.uid).role == 'discipline')
      );
    }"""

content = content.replace(old_rule, new_rule)

with open('firestore.rules', 'w') as f:
    f.write(content)
