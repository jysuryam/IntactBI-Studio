import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { HomeDashboard } from './components/home/HomeDashboard';
import { DataSourceManager } from './components/datasource/DataSourceManager';
import { ChartBuilder } from './components/chart/ChartBuilder';
import { DashboardDesigner } from './components/dashboard/DashboardDesigner';
import { VisualReportDesigner } from './components/report/VisualReportDesigner';
import { SqlQueryBuilder } from './components/query/SqlQueryBuilder';
import { UserManagement } from './components/admin/UserManagement';
import { JavaArchitectureModal } from './components/java-backend/JavaArchitectureModal';
import { 
  DataSourceConfig, 
  Dataset, 
  ChartDefinition, 
  Dashboard, 
  ReportDefinition, 
  UserProfile, 
  UserRole 
} from './types/bi';
import { storageService } from './services/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [dataSources, setDataSources] = useState<DataSourceConfig[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [charts, setCharts] = useState<ChartDefinition[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [reports, setReports] = useState<ReportDefinition[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(storageService.getCurrentUser());
  const [isJavaModalOpen, setIsJavaModalOpen] = useState(false);

  // Initialize data from storageService
  useEffect(() => {
    setDataSources(storageService.getDataSources());
    setDatasets(storageService.getDatasets());
    setCharts(storageService.getCharts());
    setDashboards(storageService.getDashboards());
    setReports(storageService.getReports());
  }, []);

  const handleRoleChange = (newRole: UserRole) => {
    const updated = { ...currentUser, role: newRole };
    setCurrentUser(updated);
    storageService.setCurrentUser(updated);
  };

  const handleOpenDataset = (datasetId: string) => {
    setActiveTab('charts');
  };

  const handleOpenReport = (reportId: string) => {
    setActiveTab('reports');
  };

  const handleNewArtifact = () => {
    if (activeTab === 'charts') {
      // Trigger new chart
    } else if (activeTab === 'dashboards') {
      // Trigger new dashboard
    } else {
      setActiveTab('datasources');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Bar with Top Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentUser.role}
        setCurrentRole={handleRoleChange}
        onNewArtifact={handleNewArtifact}
        onOpenJavaArch={() => setIsJavaModalOpen(true)}
      />

      {/* Main Workspace with Sidebar & Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          counts={{
            dataSources: dataSources.length,
            datasets: datasets.length,
            charts: charts.length,
            dashboards: dashboards.length,
            reports: reports.length,
          }}
        />

        <main className="flex-1 flex flex-col overflow-y-auto">
          {activeTab === 'home' && (
            <HomeDashboard
              dataSources={dataSources}
              datasets={datasets}
              charts={charts}
              dashboards={dashboards}
              reports={reports}
              setActiveTab={setActiveTab}
              onOpenReport={handleOpenReport}
            />
          )}

          {activeTab === 'datasources' && (
            <DataSourceManager
              dataSources={dataSources}
              setDataSources={setDataSources}
              datasets={datasets}
              setDatasets={setDatasets}
              onOpenDataset={handleOpenDataset}
            />
          )}

          {activeTab === 'datasets' && (
            <DataSourceManager
              dataSources={dataSources}
              setDataSources={setDataSources}
              datasets={datasets}
              setDatasets={setDatasets}
              onOpenDataset={handleOpenDataset}
            />
          )}

          {activeTab === 'charts' && (
            <ChartBuilder
              datasets={datasets}
              charts={charts}
              setCharts={setCharts}
              onNavigateToDashboard={() => setActiveTab('dashboards')}
            />
          )}

          {activeTab === 'dashboards' && (
            <DashboardDesigner
              dashboards={dashboards}
              setDashboards={setDashboards}
              charts={charts}
              datasets={datasets}
              onOpenChartBuilder={(chartId) => {
                setActiveTab('charts');
              }}
            />
          )}

          {activeTab === 'reports' && (
            <VisualReportDesigner
              reports={reports}
              setReports={setReports}
              datasets={datasets}
            />
          )}

          {activeTab === 'query' && (
            <SqlQueryBuilder
              datasets={datasets}
            />
          )}

          {activeTab === 'schedules' && (
            <div className="p-8 max-w-5xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Report Schedules & Background Jobs</h1>
                  <p className="text-xs text-slate-500">Automated report distribution and scheduled snapshot delivery</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs divide-y divide-slate-100">
                {[
                  { name: 'Daily Executive Sales Flash', cron: '0 0 6 * * ? (Every day at 06:00 UTC)', format: 'PDF & Excel', recipients: 'exec-team@enterprise.intactbi.io', lastRun: 'Today 06:00:12 UTC', status: 'SUCCESS' },
                  { name: 'Weekly Regional Margin Audit', cron: '0 0 8 ? * MON (Mondays at 08:00 UTC)', format: 'Jasper PDF', recipients: 'regional-directors@enterprise.intactbi.io', lastRun: '2025-05-12 08:00:04 UTC', status: 'SUCCESS' },
                  { name: 'Monthly Financial Reconciliation', cron: '0 0 2 1 * ? (1st of month at 02:00 UTC)', format: 'XLSX Sheet', recipients: 'finance-audit@enterprise.intactbi.io', lastRun: '2025-05-01 02:00:25 UTC', status: 'SUCCESS' },
                ].map((job, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{job.name}</h3>
                      <div className="text-[11px] text-slate-500 mt-1 font-mono">
                        {job.cron} · {job.format} · To: {job.recipients}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                        {job.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <UserManagement
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
            />
          )}

          {activeTab === 'backend' && (
            <div className="p-8 max-w-5xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Spring Boot 3 & JasperReports Backend</h1>
                  <p className="text-xs text-slate-500">Java 21 LTS microservice architecture and PostgreSQL schema</p>
                </div>
                <button
                  onClick={() => setIsJavaModalOpen(true)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md"
                >
                  View Code Artifacts
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
                  <h3 className="text-xs font-bold uppercase text-slate-400">Java 21 LTS Stack</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Uses Spring Boot 3.3.4, Spring Web, Spring Data JPA with Hibernate 6, and HikariCP connection pooling for low-latency queries.
                  </p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
                  <h3 className="text-xs font-bold uppercase text-slate-400">JasperReports 6.21 Engine</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Translates JSON report documents into standard JRXML schema, compiles with Java bytecode, and fills with JDBC or POI datasources.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Java Architecture Modal */}
      <JavaArchitectureModal
        isOpen={isJavaModalOpen}
        onClose={() => setIsJavaModalOpen(false)}
      />
    </div>
  );
}
