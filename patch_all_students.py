import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

# First replace the state
state_target = '''  const [students, setStudents] = useState<Student[]>([]);'''
state_replacement = '''  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [students, setStudents] = useState<Student[]>([]);'''

content = content.replace(state_target, state_replacement)

# Next, update the useEffect to set allStudents, and keep setStudents for backward compatibility if needed, but actually we can just derive it.
# Wait, if I just store `allStudents` state, and change `students` to be derived?
# Let's see how `students` is used.
