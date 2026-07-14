import re

with open('src/components/AdminMonitoringDashboard.tsx', 'r') as f:
    content = f.read()

target = "import React, { useMemo } from 'react';"
replacement = """import React, { useMemo, useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';"""
content = content.replace(target, replacement)

target2 = """export const AdminMonitoringDashboard: React.FC<AdminMonitoringDashboardProps> = ({
  records,
  plans,
  teachers
}) => {"""
replacement2 = """interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  timestamp: string;
}

export const AdminMonitoringDashboard: React.FC<AdminMonitoringDashboardProps> = ({
  records,
  plans,
  teachers
}) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    const q = query(collection(db, "auditLogs"), orderBy("timestamp", "desc"), limit(50));
    const unsub = onSnapshot(q, (snapshot) => {
      const logs: AuditLog[] = [];
      snapshot.forEach((doc) => {
        logs.push({ id: doc.id, ...doc.data() } as AuditLog);
      });
      setAuditLogs(logs);
    });
    return () => unsub();
  }, []);"""
content = content.replace(target2, replacement2)

target3 = """          <div className="overflow-x-auto custom-scrollbar">"""
replacement3 = """          {/* Audit Logs Section */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-rose-500" />
              บันทึกการรักษาความปลอดภัย (Security Audit Logs)
            </h4>
            <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
              {auditLogs.length > 0 ? (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-100/50 text-slate-500">
                        <th className="px-4 py-3 font-semibold w-1/4">วันที่และเวลา</th>
                        <th className="px-4 py-3 font-semibold">อีเมลผู้ใช้งาน</th>
                        <th className="px-4 py-3 font-semibold">เหตุการณ์</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-white transition">
                          <td className="px-4 py-3 text-slate-500 font-mono">
                            {new Date(log.timestamp).toLocaleString('th-TH')}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-700">
                            {log.userEmail}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-100 text-rose-700 font-medium">
                              <ShieldCheck className="h-3 w-3" />
                              เปลี่ยนรหัสผ่าน
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs">
                  ไม่มีบันทึกประวัติการเปลี่ยนรหัสผ่าน
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 overflow-x-auto custom-scrollbar">"""
content = content.replace(target3, replacement3)

with open('src/components/AdminMonitoringDashboard.tsx', 'w') as f:
    f.write(content)

