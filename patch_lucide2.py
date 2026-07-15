import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

content = content.replace("AlertTriangle, HeartPulse, X,", "AlertTriangle, HeartPulse, X, TrendingUp, TrendingDown, Minus,")

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
