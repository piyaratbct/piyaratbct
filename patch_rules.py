import re

with open('firestore.rules', 'r') as f:
    content = f.read()

target = """    match /schoolEvents/{eventId} {
      allow read: if isSignedIn();
      allow write: if isAcademic();
    }"""

replacement = """    match /schoolEvents/{eventId} {
      allow read: if isSignedIn();
      allow write: if isAcademic();
    }

    match /disciplineIncidents/{incidentId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() && (resource.data.teacherId == request.auth.uid || isAdmin());
    }"""

if target in content:
    content = content.replace(target, replacement)
    with open('firestore.rules', 'w') as f:
        f.write(content)
    print("Added disciplineIncidents rules")
else:
    print("Could not find target in firestore.rules")
