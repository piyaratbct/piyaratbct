import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    # Replace experimentalAutoDetectLongPolling with experimentalForceLongPolling
    code = code.replace("experimentalAutoDetectLongPolling: true", "experimentalForceLongPolling: true")
    
    with open(filename, 'w') as f:
        f.write(code)

fix('src/lib/firebase.ts')
