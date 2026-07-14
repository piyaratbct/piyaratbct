import re

with open('firestore.rules', 'r') as f:
    content = f.read()

target = """    match /disciplineIncidents/{incidentId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() && (resource.data.teacherId == request.auth.uid || isAdmin());
    }"""

replacement = """    match /disciplineIncidents/{incidentId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() && (resource.data.teacherId == request.auth.uid || isAdmin());
    }
    
    match /auditLogs/{logId} {
      allow read: if isAdmin();
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
    }"""

content = content.replace(target, replacement)

with open('firestore.rules', 'w') as f:
    f.write(content)

