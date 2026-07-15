import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()


target1 = """                            <RechartsTooltip 
                              formatter={(value, name) => [`${value} คน`, name === 'underweight' ? 'ผอม' : name === 'normal' ? 'สมส่วน' : name === 'overweight' ? 'ท้วม' : name === 'obese1' ? 'เริ่มอ้วน' : 'อ้วน']}"""

replacement1 = """                            <RechartsTooltip 
                              formatter={(value, name) => [`${value} คน`, name === 'underweight' ? 'ผอม' : name === 'normal' ? 'สมส่วน' : name === 'overweight' ? 'ท้วม' : name === 'obese1' ? 'เริ่มอ้วน' : name === 'obese2' ? 'อ้วน' : 'ขาดวันเกิด']}"""

content = content.replace(target1, replacement1)

target2 = """                              payload={[
                                { value: 'ผอม', type: 'circle', color: '#3b82f6' },
                                { value: 'สมส่วน', type: 'circle', color: '#22c55e' },
                                { value: 'ท้วม', type: 'circle', color: '#eab308' },
                                { value: 'เริ่มอ้วน', type: 'circle', color: '#f97316' },
                                { value: 'อ้วน', type: 'circle', color: '#ef4444' }
                              ]}"""

replacement2 = """                              payload={[
                                { value: 'ผอม', type: 'circle', color: '#3b82f6' },
                                { value: 'สมส่วน', type: 'circle', color: '#22c55e' },
                                { value: 'ท้วม', type: 'circle', color: '#eab308' },
                                { value: 'เริ่มอ้วน', type: 'circle', color: '#f97316' },
                                { value: 'อ้วน', type: 'circle', color: '#ef4444' },
                                { value: 'ขาดวันเกิด', type: 'circle', color: '#94a3b8' }
                              ]}"""

content = content.replace(target2, replacement2)

target3 = """                            <Bar dataKey="underweight" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="normal" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="overweight" stackId="a" fill="#eab308" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="obese1" stackId="a" fill="#f97316" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="obese2" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />"""

replacement3 = """                            <Bar dataKey="underweight" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="normal" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="overweight" stackId="a" fill="#eab308" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="obese1" stackId="a" fill="#f97316" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="obese2" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="unknown" stackId="a" fill="#94a3b8" radius={[4, 4, 0, 0]} />"""

content = content.replace(target3, replacement3)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
