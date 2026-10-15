import React from 'react';
import { 
  LayoutDashboard, 
  Database, 
  Table2, 
  BarChart3, 
  Layers, 
  FileText, 
  Terminal, 
  Clock, 
  Users, 
  Server,
  HelpCircle
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  counts: {
    dataSources: number;
    datasets: number;
    charts: number;
    dashboards: number;
    reports: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, counts }) => {
  const menuItems = [
    { id: 'home', label: 'Home Overview', icon: LayoutDashboard },
    { id: 'datasources', label: 'Data Sources', icon: Database, count: counts.dataSources },
    { id: 'datasets', label: 'Datasets & Schema', icon: Table2, count: counts.datasets },
    { id: 'charts', label: 'Chart Builder', icon: BarChart3, count: counts.charts },
    { id: 'dashboards', label: 'Dashboards', icon: Layers, count: counts.dashboards },
    { id: 'reports', label: 'Visual Report Designer', icon: FileText, count: counts.reports },
    { id: 'query', label: 'SQL Query Studio', icon: Terminal },
    { id: 'schedules', label: 'Execution & History', icon: Clock },
    { id: 'security', label: 'User & Permissions', icon: Users },
    { id: 'backend', label: 'Spring Boot 3 Specs', icon: Server },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 min-h-[calc(100vh-53px)] select-none">
      <div className="p-4 border-b border-slate-100">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Workspace Navigation
        </div>
      </div>

      <nav className="p-3 space-y-1 flex-1">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors text-left cursor-pointer ${
                isActive 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.count !== undefined && (
                <span className={`text-[11px] px-1.5 py-0.2 rounded-sm font-mono tabular-nums ${
                  isActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span className="font-medium">JasperReports 6.21 Compatible</span>
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <div className="text-[10px] text-slate-400 mt-1">
          Java 21 LTS · HikariCP · Spring Boot 3
        </div>
      </div>
    </aside>
  );
};
