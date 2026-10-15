import React from 'react';
import { 
  Database, 
  Layers, 
  BarChart3, 
  FileText, 
  Terminal, 
  ShieldCheck, 
  Code2, 
  Plus
} from 'lucide-react';
import { UserRole } from '../../types/bi';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  onNewArtifact: () => void;
  onOpenJavaArch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentRole,
  setCurrentRole,
  onNewArtifact,
  onOpenJavaArch,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3 border-b border-slate-200 bg-white sticky top-0 z-40 select-none shadow-xs">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm tracking-wider">
          IBI
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
            IntactBI Studio
          </span>
          <span className="text-[10px] text-slate-500 font-medium -mt-1">
            Enterprise Analytics & Report Engine
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Links (Clean Single-Line Controls) */}
      <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600">
        <button
          onClick={() => setActiveTab('datasources')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'datasources' 
              ? 'bg-slate-100 text-slate-900 font-bold' 
              : 'hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-blue-600" />
          <span>Data Sources</span>
        </button>

        <button
          onClick={() => setActiveTab('charts')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'charts' 
              ? 'bg-slate-100 text-slate-900 font-bold' 
              : 'hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Chart Builder</span>
        </button>

        <button
          onClick={() => setActiveTab('dashboards')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'dashboards' 
              ? 'bg-slate-100 text-slate-900 font-bold' 
              : 'hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-indigo-600" />
          <span>Dashboards</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'reports' 
              ? 'bg-slate-100 text-slate-900 font-bold' 
              : 'hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-amber-600" />
          <span>Jasper Designer</span>
        </button>

        <button
          onClick={() => setActiveTab('query')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'query' 
              ? 'bg-slate-100 text-slate-900 font-bold' 
              : 'hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-purple-600" />
          <span>SQL Studio</span>
        </button>
      </nav>

      {/* Zone 3: Quick Role Switcher & Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Java 21 / Spring Boot 3 Backend Blueprint Button */}
        <button
          onClick={onOpenJavaArch}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors border border-slate-200"
          title="View Java 21 LTS Spring Boot 3 Backend Architecture, Flyway Schema, & Maven Multi-Module"
        >
          <Code2 className="w-3.5 h-3.5 text-slate-700" />
          <span className="hidden sm:inline">Spring Boot 3 Specs</span>
        </button>

        {/* Role Switcher */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-md border border-slate-200 text-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-500 font-medium hidden sm:inline">Role:</span>
          <select
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value as UserRole)}
            className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer"
          >
            <option value="ADMIN">Admin</option>
            <option value="DESIGNER">Designer</option>
            <option value="ANALYST">Analyst</option>
            <option value="VIEWER">Viewer</option>
          </select>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={onNewArtifact}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Item</span>
        </button>
      </div>
    </header>
  );
};
