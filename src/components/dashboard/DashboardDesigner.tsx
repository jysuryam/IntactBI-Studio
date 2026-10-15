import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Plus, 
  Save, 
  Trash2, 
  RefreshCw, 
  Filter, 
  Palette, 
  Maximize2, 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Grid,
  Check,
  Move
} from 'lucide-react';
import { 
  Dashboard, 
  DashboardWidget, 
  ChartDefinition, 
  Dataset, 
  DashboardTheme 
} from '../../types/bi';
import { DataEngine } from '../../services/dataEngine';
import { storageService } from '../../services/storage';

interface DashboardDesignerProps {
  dashboards: Dashboard[];
  setDashboards: (dashboards: Dashboard[]) => void;
  charts: ChartDefinition[];
  datasets: Dataset[];
  onOpenChartBuilder: (chartId?: string) => void;
}

export const DashboardDesigner: React.FC<DashboardDesignerProps> = ({
  dashboards,
  setDashboards,
  charts,
  datasets,
  onOpenChartBuilder
}) => {
  const [selectedDashboardId, setSelectedDashboardId] = useState<string>(dashboards[0]?.id || '');
  const activeDashboard = dashboards.find(d => d.id === selectedDashboardId) || dashboards[0];

  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(0);
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString());
  const [isAddingWidget, setIsAddingWidget] = useState(false);
  const [selectedWidgetType, setSelectedWidgetType] = useState<'chart' | 'kpi' | 'text'>('chart');
  const [selectedChartToAdd, setSelectedChartToAdd] = useState<string>(charts[0]?.id || '');
  const [saveToast, setSaveToast] = useState(false);

  // Auto Refresh timer
  useEffect(() => {
    if (autoRefreshInterval <= 0) return;
    const interval = setInterval(() => {
      setLastRefreshed(new Date().toLocaleTimeString());
    }, autoRefreshInterval * 1000);
    return () => clearInterval(interval);
  }, [autoRefreshInterval]);

  const handleFilterChange = (filterKey: string, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: value === 'ALL' ? undefined : value
    }));
  };

  const handleAddWidget = () => {
    if (!activeDashboard) return;

    let newWidget: DashboardWidget;

    if (selectedWidgetType === 'chart') {
      const chart = charts.find(c => c.id === selectedChartToAdd);
      newWidget = {
        id: `w-${Date.now()}`,
        type: 'chart',
        chartId: selectedChartToAdd,
        title: chart?.name || 'Chart Widget',
        x: 0,
        y: 10,
        w: 6,
        h: 6
      };
    } else if (selectedWidgetType === 'kpi') {
      newWidget = {
        id: `w-${Date.now()}`,
        type: 'kpi',
        title: 'Realized Margin KPI',
        x: 0,
        y: 10,
        w: 3,
        h: 2,
        kpiConfig: {
          metricField: 'profit',
          datasetId: datasets[0]?.id || '',
          aggregation: 'SUM',
          format: '$#,##0',
          trendPercentage: 16.2,
          trendLabel: 'vs benchmark'
        }
      };
    } else {
      newWidget = {
        id: `w-${Date.now()}`,
        type: 'text',
        title: 'Executive Annotation',
        textContent: 'Q2 Performance exceeds projection by 14.8% due to high Enterprise sales in North America and Western Europe.',
        x: 0,
        y: 10,
        w: 4,
        h: 2
      };
    }

    const updatedWidgets = [...activeDashboard.widgets, newWidget];
    const updatedDashboard = { ...activeDashboard, widgets: updatedWidgets, updatedAt: new Date().toISOString() };
    
    storageService.saveDashboard(updatedDashboard);
    setDashboards(dashboards.map(d => d.id === updatedDashboard.id ? updatedDashboard : d));
    setIsAddingWidget(false);
  };

  const handleDeleteWidget = (widgetId: string) => {
    if (!activeDashboard) return;
    const updatedWidgets = activeDashboard.widgets.filter(w => w.id !== widgetId);
    const updatedDashboard = { ...activeDashboard, widgets: updatedWidgets };
    storageService.saveDashboard(updatedDashboard);
    setDashboards(dashboards.map(d => d.id === updatedDashboard.id ? updatedDashboard : d));
  };

  const handleResizeWidget = (widgetId: string, deltaW: number) => {
    if (!activeDashboard) return;
    const updatedWidgets = activeDashboard.widgets.map(w => {
      if (w.id === widgetId) {
        const newW = Math.min(Math.max(w.w + deltaW, 3), 12);
        return { ...w, w: newW };
      }
      return w;
    });
    const updatedDashboard = { ...activeDashboard, widgets: updatedWidgets };
    storageService.saveDashboard(updatedDashboard);
    setDashboards(dashboards.map(d => d.id === updatedDashboard.id ? updatedDashboard : d));
  };

  const handleThemeChange = (theme: DashboardTheme) => {
    if (!activeDashboard) return;
    const updatedDashboard = { ...activeDashboard, theme };
    storageService.saveDashboard(updatedDashboard);
    setDashboards(dashboards.map(d => d.id === updatedDashboard.id ? updatedDashboard : d));
  };

  const handleCreateNewDashboard = () => {
    const newDash: Dashboard = {
      id: `dash-${Date.now()}`,
      name: 'Custom Operations Dashboard',
      description: 'Custom analytical overview layout',
      theme: 'light',
      autoRefreshSeconds: 0,
      activeFilters: {},
      widgets: [
        {
          id: `w-kpi-${Date.now()}`,
          type: 'kpi',
          title: 'Total Gross Volume',
          x: 0,
          y: 0,
          w: 4,
          h: 2,
          kpiConfig: {
            metricField: 'sales',
            datasetId: datasets[0]?.id || '',
            aggregation: 'SUM',
            format: '$#,##0',
            trendPercentage: 12.5,
            trendLabel: 'on-track'
          }
        },
        {
          id: `w-chart-${Date.now()}`,
          type: 'chart',
          chartId: charts[0]?.id,
          title: charts[0]?.name || 'Primary Performance Chart',
          x: 0,
          y: 2,
          w: 8,
          h: 6
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    storageService.saveDashboard(newDash);
    setDashboards([...dashboards, newDash]);
    setSelectedDashboardId(newDash.id);
  };

  // Render a widget based on its configuration and activeFilters
  const renderWidgetContent = (widget: DashboardWidget) => {
    if (widget.type === 'kpi') {
      const ds = datasets.find(d => d.id === widget.kpiConfig?.datasetId) || datasets[0];
      const metric = widget.kpiConfig?.metricField || 'sales';
      const agg = widget.kpiConfig?.aggregation || 'SUM';

      let rows = ds?.data || [];
      if (activeFilters.region) rows = rows.filter(r => r.region === activeFilters.region);
      if (activeFilters.category) rows = rows.filter(r => r.category === activeFilters.category);

      const nums = rows.map(r => Number(r[metric])).filter(n => !isNaN(n));
      const val = DataEngine.calcAggregation(nums, agg);

      return (
        <div className="flex flex-col justify-center h-full p-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {widget.title} ({agg})
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-900 mt-1">
            ${val.toLocaleString()}
          </div>
          {widget.kpiConfig?.trendPercentage && (
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{widget.kpiConfig.trendPercentage}% {widget.kpiConfig.trendLabel}</span>
            </div>
          )}
        </div>
      );
    }

    if (widget.type === 'text') {
      return (
        <div className="p-2 text-xs text-slate-600 leading-relaxed">
          <h4 className="font-bold text-slate-800 text-xs mb-1">{widget.title}</h4>
          <p>{widget.textContent}</p>
        </div>
      );
    }

    // Chart widget
    const chart = charts.find(c => c.id === widget.chartId) || charts[0];
    if (!chart) {
      return <div className="text-xs text-slate-400 p-4">No chart linked to widget.</div>;
    }

    const ds = datasets.find(d => d.id === chart.datasetId) || datasets[0];
    const aggData = DataEngine.aggregateChartData(ds, chart, activeFilters);

    return (
      <div className="h-full flex flex-col p-2">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className="font-bold text-xs text-slate-900">{chart.name}</h4>
            <span className="text-[10px] text-slate-400 font-mono">{chart.type.toUpperCase()}</span>
          </div>
          <button
            onClick={() => onOpenChartBuilder(chart.id)}
            className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold"
          >
            Edit in Builder
          </button>
        </div>

        {/* Mini Chart Graphic */}
        <div className="flex-1 w-full flex items-end gap-2 pt-4 pb-2 border-b border-l border-slate-200">
          {aggData.categories.map((cat, idx) => {
            const val = aggData.series[0]?.data[idx] || 0;
            const maxVal = Math.max(...(aggData.series[0]?.data || [1]), 1);
            const heightPct = Math.min(Math.max((val / maxVal) * 85, 8), 92);

            return (
              <div key={cat} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                <div
                  className="w-full max-w-[32px] rounded-t-xs bg-slate-900 group-hover:bg-blue-600 transition-colors"
                  style={{ height: `${heightPct}%` }}
                >
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1 py-0.5 rounded font-mono pointer-events-none z-10 whitespace-nowrap">
                    {val.toLocaleString()}
                  </div>
                </div>
                <span className="text-[9px] text-slate-500 truncate w-full text-center mt-1">
                  {cat}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const themeClasses = {
    light: 'bg-slate-50 text-slate-900',
    slate: 'bg-slate-900 text-white',
    midnight: 'bg-slate-950 text-slate-100',
    corporate: 'bg-blue-50/40 text-slate-900'
  };

  return (
    <div className={`flex flex-col min-h-[calc(100vh-53px)] ${themeClasses[activeDashboard?.theme || 'light']}`}>
      {/* Top Controls Toolbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <select
            value={selectedDashboardId}
            onChange={(e) => setSelectedDashboardId(e.target.value)}
            className="text-sm font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none cursor-pointer py-1"
          >
            {dashboards.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <button
            onClick={handleCreateNewDashboard}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> New Dashboard
          </button>
        </div>

        {/* Global Filter Bar (Interactive Cross-Filtering) */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={activeFilters.region || 'ALL'}
            onChange={(e) => handleFilterChange('region', e.target.value)}
            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800 text-xs"
          >
            <option value="ALL">All Regions</option>
            <option value="North America">North America</option>
            <option value="Europe">Europe</option>
            <option value="Asia Pacific">Asia Pacific</option>
            <option value="Latin America">Latin America</option>
          </select>

          <select
            value={activeFilters.category || 'ALL'}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800 text-xs"
          >
            <option value="ALL">All Categories</option>
            <option value="Technology">Technology</option>
            <option value="Furniture">Furniture</option>
            <option value="Office Supplies">Office Supplies</option>
          </select>

          {/* Theme Switcher */}
          <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
            <Palette className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={activeDashboard?.theme || 'light'}
              onChange={(e) => handleThemeChange(e.target.value as DashboardTheme)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800 text-xs"
            >
              <option value="light">Light Theme</option>
              <option value="slate">Slate Theme</option>
              <option value="midnight">Midnight</option>
              <option value="corporate">Corporate</option>
            </select>
          </div>

          {/* Auto Refresh */}
          <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={autoRefreshInterval}
              onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800 text-xs"
            >
              <option value="0">Manual Refresh</option>
              <option value="10">Auto 10s</option>
              <option value="30">Auto 30s</option>
              <option value="60">Auto 60s</option>
            </select>
          </div>

          <button
            onClick={() => setIsAddingWidget(true)}
            className="flex items-center gap-1 px-3 py-1 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Widget</span>
          </button>
        </div>
      </div>

      {/* Grid Dashboard Canvas */}
      <div className="p-6 flex-1">
        <div className="max-w-7xl mx-auto">
          {/* Grid Layout (12 columns) */}
          <div className="grid grid-cols-12 gap-4">
            {activeDashboard?.widgets.map(widget => (
              <div
                key={widget.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs relative group transition-all"
                style={{
                  gridColumn: `span ${widget.w} / span ${widget.w}`,
                  minHeight: widget.type === 'kpi' ? '120px' : '280px'
                }}
              >
                {/* Widget Controls Bar (Visible on hover) */}
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-xs px-1.5 py-0.5 rounded border border-slate-200 z-10">
                  <button
                    onClick={() => handleResizeWidget(widget.id, -1)}
                    className="text-xs px-1 hover:text-blue-600 font-mono font-bold"
                    title="Narrower"
                  >
                    -
                  </button>
                  <span className="text-[10px] text-slate-400 font-mono">{widget.w}col</span>
                  <button
                    onClick={() => handleResizeWidget(widget.id, 1)}
                    className="text-xs px-1 hover:text-blue-600 font-mono font-bold"
                    title="Wider"
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleDeleteWidget(widget.id)}
                    className="text-xs px-1 hover:text-rose-600 ml-1"
                    title="Delete widget"
                  >
                    <Trash2 className="w-3 h-3 text-slate-400 hover:text-rose-600" />
                  </button>
                </div>

                {renderWidgetContent(widget)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Widget Modal */}
      {isAddingWidget && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Add Dashboard Widget</h3>
              <button onClick={() => setIsAddingWidget(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Widget Type</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedWidgetType('chart')}
                  className={`p-2 rounded border text-center ${selectedWidgetType === 'chart' ? 'border-slate-900 bg-slate-900 text-white font-bold' : 'border-slate-200'}`}
                >
                  Saved Chart
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedWidgetType('kpi')}
                  className={`p-2 rounded border text-center ${selectedWidgetType === 'kpi' ? 'border-slate-900 bg-slate-900 text-white font-bold' : 'border-slate-200'}`}
                >
                  KPI Card
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedWidgetType('text')}
                  className={`p-2 rounded border text-center ${selectedWidgetType === 'text' ? 'border-slate-900 bg-slate-900 text-white font-bold' : 'border-slate-200'}`}
                >
                  Text Note
                </button>
              </div>
            </div>

            {selectedWidgetType === 'chart' && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Select Chart</label>
                <select
                  value={selectedChartToAdd}
                  onChange={(e) => setSelectedChartToAdd(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded"
                >
                  {charts.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                onClick={() => setIsAddingWidget(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddWidget}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded"
              >
                Place on Canvas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
