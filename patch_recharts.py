import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

import_statement = 'import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";\n'

if "recharts" not in content:
    content = content.replace('import {', import_statement + 'import {', 1)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
