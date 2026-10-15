import React from 'react';
import { 
  Database, 
  BarChart3, 
  Layers, 
  FileText, 
  Terminal, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  Server,
  Download,
  ShieldCheck
} from 'lucide-react';
import { 
  DataSourceConfig, 
  Dataset, 
  ChartDefinition, 
  Dashboard, 
  ReportDefinition 
} from '../../types/bi';

interface HomeDashboardProps {
  dataSources: DataSourceConfig[];
  datasets: Dataset[];
  charts: ChartDefinition[];
  dashboards: Dashboard[];
  reports: ReportDefinition[];
  setActiveTab: (tab: string) => void;
  onOpenReport: (reportId: string) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  dataSources,
  datasets,
  charts,
  dashboards,
  reports,
  setActiveTab,
  onOpenReport
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 space-y-8 select-none">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Hero Banner */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Enterprise Business Intelligence
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500">JasperReports 6.21 & Spring Boot 3 Engine</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              IntactBI Studio Control Center
            </h1>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Design enterprise-grade banded reports, construct interactive drag-and-drop analytics dashboards, execute SQL queries against relational databases, and export pixel-perfect PDF, Excel, and JRXML documents.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('datasources')}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              Add Data Source
            </button>
            <button
              onClick={() => setActiveTab('charts')}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-xs"
            >
              Open Chart Builder
            </button>
          </div>
        </div>

        {/* 4 Stat KPI Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div 
            onClick={() => setActiveTab('datasources')}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold text-slate-500">Data Sources</span>
              <Database className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {dataSources.length}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>PostgreSQL & Files Active</span>
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('charts')}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold text-slate-500">Saved Charts</span>
              <BarChart3 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {charts.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              15+ interactive chart types
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('dashboards')}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold text-slate-500">Dashboards</span>
              <Layers className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {dashboards.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Grid layout & cross-filters
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('reports')}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold text-slate-500">Banded Reports</span>
              <FileText className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {reports.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              JasperReports JRXML & PDF
            </div>
          </div>
        </div>

        {/* Guided Acceptance Test Workflow Steps */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">End-to-End BI Workflow Pipeline</h2>
              <p className="text-xs text-slate-500">Follow the standard analytics lifecycle from data ingestion to compiled Jasper report</p>
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
              Phase 1 & 2 Ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div 
              onClick={() => setActiveTab('datasources')}
              className="p-4 rounded-lg border border-slate-200 hover:border-slate-900 transition-all cursor-pointer bg-slate-50/50 hover:bg-white"
            >
              <div className="w-7 h-7 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs mb-3">
                1
              </div>
              <h3 className="text-xs font-bold text-slate-900">Connect Data Source</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Connect to PostgreSQL or upload CSV/Excel files. Inspect table schemas and preview rows.
              </p>
            </div>

            <div 
              onClick={() => setActiveTab('charts')}
              className="p-4 rounded-lg border border-slate-200 hover:border-slate-900 transition-all cursor-pointer bg-slate-50/50 hover:bg-white"
            >
              <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs mb-3">
                2
              </div>
              <h3 className="text-xs font-bold text-slate-900">Build Visual Charts</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Drag fields into X/Y axis shelves, choose aggregations (SUM, AVG), and select chart types.
              </p>
            </div>

            <div 
              onClick={() => setActiveTab('dashboards')}
              className="p-4 rounded-lg border border-slate-200 hover:border-slate-900 transition-all cursor-pointer bg-slate-50/50 hover:bg-white"
            >
              <div className="w-7 h-7 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs mb-3">
                3
              </div>
              <h3 className="text-xs font-bold text-slate-900">Assemble Dashboard</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Arrange widgets on a 12-column grid, configure cross-filters, and set auto-refresh intervals.
              </p>
            </div>

            <div 
              onClick={() => setActiveTab('reports')}
              className="p-4 rounded-lg border border-slate-200 hover:border-slate-900 transition-all cursor-pointer bg-slate-50/50 hover:bg-white"
            >
              <div className="w-7 h-7 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs mb-3">
                4
              </div>
              <h3 className="text-xs font-bold text-slate-900">JasperReports Design & Export</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Design banded tabular reports (Title, Header, Detail, Summary) and export to PDF, Excel, and JRXML.
              </p>
            </div>
          </div>
        </div>

        {/* Recently Defined Reports & Quick Preview */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Reports & Production Templates</h2>
              <p className="text-xs text-slate-500">JasperReports compiled layouts ready for distribution</p>
            </div>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View All Reports</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
            {reports.map(rep => (
              <div key={rep.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{rep.name}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>{rep.elements.length} elements</span>
                      <span>·</span>
                      <span className="font-mono">{rep.orientation.toUpperCase()} A4</span>
                      <span>·</span>
                      <span>{rep.parameters.length} parameters</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onOpenReport(rep.id);
                      setActiveTab('reports');
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                  >
                    Open in Designer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
