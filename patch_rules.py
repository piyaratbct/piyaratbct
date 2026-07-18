with open('firestore.rules', 'r') as f:
    content = f.read()

new_rule = """
    match /subject_scores/{scoreId} {
      allow read: if isSignedIn();
      allow write: if isSignedIn();
    }
  }
}"""
content = content.replace("  }\n}", new_rule)

with open('firestore.rules', 'w') as f:
    f.write(content)
