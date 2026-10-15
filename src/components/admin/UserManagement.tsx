import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Key, 
  Clock, 
  Check, 
  Lock, 
  FileText, 
  Database,
  Layers,
  UserPlus
} from 'lucide-react';
import { UserProfile, UserRole } from '../../types/bi';

interface UserManagementProps {
  currentUser: UserProfile;
  setCurrentUser: (u: UserProfile) => void;
}

const SAMPLE_USERS: UserProfile[] = [
  {
    id: 'usr-1',
    name: 'Devin Alexander',
    email: 'd.alexander@enterprise.intactbi.io',
    role: 'ADMIN',
    department: 'Data & Analytics Architecture',
    lastLogin: '2025-05-15 14:22:10 UTC'
  },
  {
    id: 'usr-2',
    name: 'Elena Rostova',
    email: 'e.rostova@enterprise.intactbi.io',
    role: 'DESIGNER',
    department: 'Business Intelligence Solutions',
    lastLogin: '2025-05-15 11:05:44 UTC'
  },
  {
    id: 'usr-3',
    name: 'Marcus Chen',
    email: 'm.chen@enterprise.intactbi.io',
    role: 'ANALYST',
    department: 'Finance & Operations',
    lastLogin: '2025-05-14 18:30:12 UTC'
  },
  {
    id: 'usr-4',
    name: 'Sophia Laurent',
    email: 's.laurent@enterprise.intactbi.io',
    role: 'VIEWER',
    department: 'Executive Leadership',
    lastLogin: '2025-05-15 09:12:00 UTC'
  }
];

const AUDIT_LOGS = [
  { id: 'aud-1', user: 'd.alexander@enterprise.intactbi.io', action: 'EXPORT_REPORT_PDF', resource: 'Quarterly Sales & Profitability', timestamp: '2025-05-15 14:32:01 UTC', status: 'SUCCESS', durationMs: 420 },
  { id: 'aud-2', user: 'e.rostova@enterprise.intactbi.io', action: 'MODIFY_CHART_DEFINITION', resource: 'Revenue by Category', timestamp: '2025-05-15 14:10:15 UTC', status: 'SUCCESS', durationMs: 85 },
  { id: 'aud-3', user: 'm.chen@enterprise.intactbi.io', action: 'EXECUTE_SQL_QUERY', resource: 'public.retail_orders (LIMIT 50)', timestamp: '2025-05-15 13:45:22 UTC', status: 'SUCCESS', durationMs: 24 },
  { id: 'aud-4', user: 'd.alexander@enterprise.intactbi.io', action: 'TEST_JDBC_CONNECTION', resource: 'postgres-prod.internal.corp', timestamp: '2025-05-15 12:10:00 UTC', status: 'SUCCESS', durationMs: 12 },
  { id: 'aud-5', user: 's.laurent@enterprise.intactbi.io', action: 'VIEW_DASHBOARD', resource: 'Executive Sales & Operations Cockpit', timestamp: '2025-05-15 09:15:30 UTC', status: 'SUCCESS', durationMs: 38 }
];

export const UserManagement: React.FC<UserManagementProps> = ({ currentUser, setCurrentUser }) => {
  const [users, setUsers] = useState<UserProfile[]>(SAMPLE_USERS);
  const [activeTab, setActiveTab] = useState<'users' | 'matrix' | 'audit'>('users');

  const handleSwitchUser = (user: UserProfile) => {
    setCurrentUser(user);
  };

  const roleColors: Record<UserRole, string> = {
    ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
    DESIGNER: 'bg-blue-100 text-blue-800 border-blue-200',
    ANALYST: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    VIEWER: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 space-y-6 select-none">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Security & Role-Based Access Control</h1>
            <p className="text-xs text-slate-500">Manage user credentials, enterprise roles, and audit query logs</p>
          </div>

          <div className="flex items-center gap-1 bg-slate-200 p-0.5 rounded-md text-xs font-semibold">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded transition-colors ${activeTab === 'users' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              User Accounts
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 rounded transition-colors ${activeTab === 'matrix' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              Permission Matrix
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded transition-colors ${activeTab === 'audit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              Audit Trail
            </button>
          </div>
        </div>

        {/* TAB 1: USERS */}
        {activeTab === 'users' && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Active Directory & Local Identities</span>
              <span className="text-xs text-slate-500 font-mono">{users.length} users registered</span>
            </div>

            <div className="divide-y divide-slate-100">
              {users.map(u => {
                const isCurrent = u.id === currentUser.id;
                return (
                  <div key={u.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                        {u.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{u.name}</span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${roleColors[u.role]}`}>
                            {u.role}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] bg-slate-900 text-white px-1.5 py-0.2 rounded font-semibold">
                              ACTIVE SESSION
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {u.email} · {u.department} · Last login: {u.lastLogin}
                        </div>
                      </div>
                    </div>

                    <div>
                      {!isCurrent ? (
                        <button
                          onClick={() => handleSwitchUser(u)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                        >
                          Switch To User
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Logged In
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: RBAC MATRIX */}
        {activeTab === 'matrix' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Role-Based Access Control (RBAC) Entitlements</h3>
            <p className="text-xs text-slate-500">Enforced by Spring Security and REST API JWT filters</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-200 border border-slate-200 rounded-lg">
                <thead className="bg-slate-50 text-slate-700 font-bold">
                  <tr>
                    <th className="py-3 px-4">Capability / Resource</th>
                    <th className="py-3 px-4 text-center">ADMIN</th>
                    <th className="py-3 px-4 text-center">DESIGNER</th>
                    <th className="py-3 px-4 text-center">ANALYST</th>
                    <th className="py-3 px-4 text-center">VIEWER</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {[
                    { name: 'Connect & Configure Data Sources', admin: true, designer: false, analyst: false, viewer: false },
                    { name: 'Define Datasets & Calculated Fields', admin: true, designer: true, analyst: false, viewer: false },
                    { name: 'Build & Save Charts', admin: true, designer: true, analyst: false, viewer: false },
                    { name: 'Create & Edit Dashboards', admin: true, designer: true, analyst: false, viewer: false },
                    { name: 'Design Jaspersoft Banded Reports', admin: true, designer: true, analyst: false, viewer: false },
                    { name: 'Execute Custom SQL Queries', admin: true, designer: true, analyst: true, viewer: false },
                    { name: 'Export Reports (PDF, XLSX, CSV)', admin: true, designer: true, analyst: true, viewer: true },
                    { name: 'User Management & Security Audit', admin: true, designer: false, analyst: false, viewer: false },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 font-medium text-slate-900">{row.name}</td>
                      <td className="py-2.5 px-4 text-center">{row.admin ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">-</span>}</td>
                      <td className="py-2.5 px-4 text-center">{row.designer ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">-</span>}</td>
                      <td className="py-2.5 px-4 text-center">{row.analyst ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">-</span>}</td>
                      <td className="py-2.5 px-4 text-center">{row.viewer ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">-</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Immutable Audit Log</span>
              <span className="text-xs text-slate-500 font-mono">Recent 5 operations logged</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-100">
                <thead className="bg-slate-100 text-slate-600 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4">Timestamp</th>
                    <th className="py-2.5 px-4">Operator</th>
                    <th className="py-2.5 px-4">Action</th>
                    <th className="py-2.5 px-4">Resource Target</th>
                    <th className="py-2.5 px-4">Latency</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-700">
                  {AUDIT_LOGS.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-2 px-4 whitespace-nowrap text-slate-500">{log.timestamp}</td>
                      <td className="py-2 px-4 whitespace-nowrap font-sans font-medium text-slate-800">{log.user}</td>
                      <td className="py-2 px-4 whitespace-nowrap text-blue-600 font-bold">{log.action}</td>
                      <td className="py-2 px-4 whitespace-nowrap text-slate-600">{log.resource}</td>
                      <td className="py-2 px-4 whitespace-nowrap text-slate-500">{log.durationMs}ms</td>
                      <td className="py-2 px-4 whitespace-nowrap text-emerald-600 font-bold">{log.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
