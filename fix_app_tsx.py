with open('src/App.tsx', 'r') as f:
    content = f.read()

target = "return formatThaiDate(timestamp);"
replacement = "return formatThaiDate(new Date(timestamp).toISOString());"

if target in content:
    content = content.replace(target, replacement)
    print("FIXED")
else:
    print("NOT FOUND")

with open('src/App.tsx', 'w') as f:
    f.write(content)
