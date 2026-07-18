with open('firestore.rules', 'r') as f:
    content = f.read()

new_rule = """
    match /subject_scores/{scoreId} {
      allow read: if isSignedIn();
      allow write: if isSignedIn();
    }
    match /subject_settings/{settingId} {
      allow read: if isSignedIn();
      allow write: if isSignedIn();
    }
  }
}"""
content = content.replace("    match /subject_scores/{scoreId} {\n      allow read: if isSignedIn();\n      allow write: if isSignedIn();\n    }\n  }\n}", new_rule)

with open('firestore.rules', 'w') as f:
    f.write(content)
