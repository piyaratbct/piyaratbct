import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """  setDoc,
  writeBatch,
  deleteDoc,"""

replacement = """  setDoc,
  updateDoc,
  writeBatch,
  deleteDoc,"""

content = content.replace(target, replacement)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
