import re

with open('src/components/StudentModal.tsx', 'r') as f:
    content = f.read()

target = """  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, student?.id);
  };"""

replacement = """  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = { ...formData };
    if (dataToSave.weight !== '') {
      dataToSave.weight = Number(dataToSave.weight);
    } else {
      delete dataToSave.weight;
    }
    if (dataToSave.height !== '') {
      dataToSave.height = Number(dataToSave.height);
    } else {
      delete dataToSave.height;
    }
    onSave(dataToSave as any, student?.id);
  };"""

content = content.replace(target, replacement)

with open('src/components/StudentModal.tsx', 'w') as f:
    f.write(content)
