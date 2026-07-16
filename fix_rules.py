with open('firestore.rules', 'r') as f:
    content = f.read()

new_function = """    function isStudentManager() {
      return isSignedIn() 
        && (
          request.auth.token.email == 'piyarat.bct@gmail.com'
          ||
          (exists(/databases/$(database)/documents/teachers/$(request.auth.uid))
            && (getTeacherProfile(request.auth.uid).role == 'academic' 
                || getTeacherProfile(request.auth.uid).role == 'deputy'
                || getTeacherProfile(request.auth.uid).role == 'admin'
                || getTeacherProfile(request.auth.uid).role == 'discipline'))
        );
    }

    function isAdmin() {"""

content = content.replace('    function isAdmin() {', new_function)

old_students_rule = """    match /students/{studentId} {
      allow read: if isSignedIn();
      allow write: if isSignedIn();
    }"""
    
new_students_rule = """    match /students/{studentId} {
      allow read: if isSignedIn();
      allow write: if isStudentManager();
    }"""
    
content = content.replace(old_students_rule, new_students_rule)

with open('firestore.rules', 'w') as f:
    f.write(content)
