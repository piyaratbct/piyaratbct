import os
import glob

for file in glob.glob("src/components/*.tsx"):
    with open(file, "r") as f:
        content = f.read()
    
    if 'className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"' in content:
        if "showPicker" not in content:
            content = content.replace(
                'className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"',
                'className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onClick={(e) => { try { (e.target as any).showPicker(); } catch(err) {} }}'
            )
            with open(file, "w") as f:
                f.write(content)
            print(f"Fixed {file}")

