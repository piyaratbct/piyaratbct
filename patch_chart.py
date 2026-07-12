import re

with open('src/components/DisciplineModule.tsx', 'r') as f:
    content = f.read()

# 1. Imports
import_target = "import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';"
import_replacement = """import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';"""
content = content.replace(import_target, import_replacement)

# 2. Stats calculation
stats_target = "  const filteredIncidents = incidents.filter(i => "
stats_replacement = """  const stats = incidents.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const COLORS = {
    fight: '#f43f5e', // rose-500
    bullying: '#f97316', // orange-500
    disruption: '#f59e0b', // amber-500
    accident: '#3b82f6', // blue-500
    illness: '#10b981', // emerald-500
    vandalism: '#a855f7', // purple-500
    other: '#64748b', // slate-500
  };

  const chartData = Object.keys(stats).map(type => {
    const label = getTypeLabel(type).label;
    const shortLabel = label.split('/')[0].split(':')[0].trim();
    return {
      name: shortLabel,
      fullName: label,
      value: stats[type],
      fill: COLORS[type as keyof typeof COLORS] || COLORS.other
    };
  }).sort((a, b) => b.value - a.value);

  const filteredIncidents = incidents.filter(i => """
content = content.replace(stats_target, stats_replacement)

# 3. Chart UI
ui_target = """      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="relative mb-6">"""
ui_replacement = """      {!loading && incidents.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold text-slate-800 mb-6">สถิติประเภทเหตุการณ์ (Bar Chart)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold text-slate-800 mb-6">สัดส่วนเหตุการณ์ (Pie Chart)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    wrapperStyle={{ fontSize: '12px', paddingLeft: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="relative mb-6">"""
content = content.replace(ui_target, ui_replacement)

with open('src/components/DisciplineModule.tsx', 'w') as f:
    f.write(content)
print("Added charts")
