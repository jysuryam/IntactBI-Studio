import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  AreaChart, 
  Layers, 
  Plus, 
  Save, 
  RotateCcw, 
  Sliders, 
  ChevronRight, 
  Filter,
  Sparkles,
  TrendingUp,
  Table,
  Eye,
  Check,
  X
} from 'lucide-react';
import { 
  ChartDefinition, 
  ChartType, 
  AggregationType, 
  Dataset, 
  DatasetField, 
  ChartFieldBinding 
} from '../../types/bi';
import { DataEngine } from '../../services/dataEngine';
import { storageService } from '../../services/storage';

interface ChartBuilderProps {
  datasets: Dataset[];
  charts: ChartDefinition[];
  setCharts: (charts: ChartDefinition[]) => void;
  onNavigateToDashboard?: (chartId: string) => void;
}

const PALETTES: Record<string, string[]> = {
  ocean: ['#0284c7', '#06b6d4', '#3b82f6', '#6366f1', '#0ea5e9'],
  emerald: ['#059669', '#10b981', '#14b8a6', '#84cc16', '#22c55e'],
  sunset: ['#f97316', '#ef4444', '#f59e0b', '#ec4899', '#d97706'],
  slate: ['#334155', '#475569', '#64748b', '#0f172a', '#94a3b8'],
  corporate: ['#1e3a8a', '#2563eb', '#38bdf8', '#0284c7', '#4f46e5'],
};

export const ChartBuilder: React.FC<ChartBuilderProps> = ({
  datasets,
  charts,
  setCharts,
  onNavigateToDashboard
}) => {
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(datasets[0]?.id || '');
  const activeDataset = datasets.find(d => d.id === selectedDatasetId) || datasets[0];

  // Active chart working draft
  const [activeChartId, setActiveChartId] = useState<string>(charts[0]?.id || '');
  const existingChart = charts.find(c => c.id === activeChartId);

  const [chartName, setChartName] = useState(existingChart?.name || 'New Analytics Chart');
  const [chartType, setChartType] = useState<ChartType>(existingChart?.type || 'column');
  const [categoryFields, setCategoryFields] = useState<ChartFieldBinding[]>(
    existingChart?.categoryFields || [{ fieldId: 'f_category', fieldName: 'category', label: 'Category', dataType: 'string' }]
  );
  const [valueFields, setValueFields] = useState<ChartFieldBinding[]>(
    existingChart?.valueFields || [{ fieldId: 'f_sales', fieldName: 'sales', label: 'Sales', dataType: 'number', aggregation: 'SUM', format: '$#,##0' }]
  );
  const [colorPalette, setColorPalette] = useState(existingChart?.colorPalette || 'ocean');
  const [showLegend, setShowLegend] = useState(existingChart?.showLegend ?? true);
  const [showGrid, setShowGrid] = useState(existingChart?.showGrid ?? true);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(existingChart?.sortDirection || 'desc');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Sync when selecting existing chart
  const handleSelectChart = (c: ChartDefinition) => {
    setActiveChartId(c.id);
    setSelectedDatasetId(c.datasetId);
    setChartName(c.name);
    setChartType(c.type);
    setCategoryFields(c.categoryFields);
    setValueFields(c.valueFields);
    setColorPalette(c.colorPalette);
    setShowLegend(c.showLegend);
    setShowGrid(c.showGrid);
    setSortDirection(c.sortDirection || 'desc');
  };

  const handleCreateNewChart = () => {
    setActiveChartId(`chart-${Date.now()}`);
    setChartName('New Analytics Chart');
    setChartType('column');
    setCategoryFields([{ fieldId: activeDataset.fields[0].id, fieldName: activeDataset.fields[0].name, label: activeDataset.fields[0].label, dataType: activeDataset.fields[0].dataType }]);
    const metricField = activeDataset.fields.find(f => f.role === 'metric') || activeDataset.fields[0];
    setValueFields([{ fieldId: metricField.id, fieldName: metricField.name, label: metricField.label, dataType: metricField.dataType, aggregation: 'SUM', format: '$#,##0' }]);
  };

  // Add field to Category / X-Axis
  const handleBindCategory = (f: DatasetField) => {
    setCategoryFields([{ fieldId: f.id, fieldName: f.name, label: f.label, dataType: f.dataType }]);
  };

  // Add field to Values / Y-Axis
  const handleBindValue = (f: DatasetField) => {
    if (valueFields.some(v => v.fieldId === f.id)) return;
    setValueFields([...valueFields, {
      fieldId: f.id,
      fieldName: f.name,
      label: f.label,
      dataType: f.dataType,
      aggregation: 'SUM',
      format: '$#,##0'
    }]);
  };

  const handleRemoveValue = (fieldId: string) => {
    setValueFields(valueFields.filter(v => v.fieldId !== fieldId));
  };

  const handleUpdateAggregation = (fieldId: string, agg: AggregationType) => {
    setValueFields(valueFields.map(v => v.fieldId === fieldId ? { ...v, aggregation: agg } : v));
  };

  // Aggregate data using DataEngine
  const aggregatedData = useMemo(() => {
    if (!activeDataset) return { categories: [], series: [], rawRows: [] };
    const chartDef: ChartDefinition = {
      id: activeChartId,
      name: chartName,
      datasetId: activeDataset.id,
      type: chartType,
      categoryFields,
      valueFields,
      filters: [],
      title: chartName,
      colorPalette,
      showLegend,
      showGrid,
      showValuesOnBars: true,
      sortField: valueFields[0]?.fieldName,
      sortDirection,
      createdAt: '',
      updatedAt: ''
    };
    return DataEngine.aggregateChartData(activeDataset, chartDef);
  }, [activeDataset, activeChartId, chartName, chartType, categoryFields, valueFields, colorPalette, showLegend, showGrid, sortDirection]);

  // Save chart
  const handleSaveChart = () => {
    const updatedChart: ChartDefinition = {
      id: activeChartId || `chart-${Date.now()}`,
      name: chartName,
      datasetId: activeDataset.id,
      type: chartType,
      categoryFields,
      valueFields,
      filters: [],
      title: chartName,
      colorPalette,
      showLegend,
      showGrid,
      showValuesOnBars: true,
      sortField: valueFields[0]?.fieldName,
      sortDirection,
      createdAt: existingChart?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    storageService.saveChart(updatedChart);
    const updatedList = charts.some(c => c.id === updatedChart.id)
      ? charts.map(c => c.id === updatedChart.id ? updatedChart : c)
      : [...charts, updatedChart];
    
    setCharts(updatedList);
    setActiveChartId(updatedChart.id);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 2000);
  };

  const colors = PALETTES[colorPalette] || PALETTES.ocean;

  return (
    <div className="flex h-full min-h-[calc(100vh-53px)] bg-slate-50 select-none">
      {/* 1. Left Data Fields Panel (Draggable/Clickable fields) */}
      <div className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-3 border-b border-slate-100">
          <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
            Active Dataset
          </label>
          <select
            value={selectedDatasetId}
            onChange={(e) => setSelectedDatasetId(e.target.value)}
            className="w-full text-xs p-1.5 bg-slate-50 border border-slate-200 rounded text-slate-800 font-medium"
          >
            {datasets.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Saved Charts Selector */}
        <div className="p-3 border-b border-slate-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase text-slate-400">Saved Charts</span>
            <button
              onClick={handleCreateNewChart}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
            >
              <Plus className="w-3 h-3" /> New
            </button>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {charts.map(c => (
              <button
                key={c.id}
                onClick={() => handleSelectChart(c)}
                className={`w-full text-left px-2 py-1.5 rounded text-xs truncate transition-colors flex items-center justify-between ${
                  c.id === activeChartId ? 'bg-slate-900 text-white font-medium' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="truncate">{c.name}</span>
                <span className="text-[10px] opacity-75 font-mono ml-1">{c.type}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Fields list */}
        <div className="p-3 flex-1 overflow-y-auto space-y-3">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
              Dimensions (Categories)
            </span>
            <div className="space-y-1">
              {activeDataset?.fields.filter(f => f.role === 'dimension').map(f => (
                <div
                  key={f.id}
                  onClick={() => handleBindCategory(f)}
                  className="px-2.5 py-1.5 rounded bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 text-xs text-slate-700 flex items-center justify-between cursor-pointer transition-colors"
                  title="Click to set as Category / X-Axis"
                >
                  <span className="truncate">{f.label}</span>
                  <span className="text-[10px] font-mono text-slate-400">{f.dataType}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
              Metrics (Measures)
            </span>
            <div className="space-y-1">
              {activeDataset?.fields.filter(f => f.role === 'metric').map(f => (
                <div
                  key={f.id}
                  onClick={() => handleBindValue(f)}
                  className="px-2.5 py-1.5 rounded bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 text-xs text-slate-700 flex items-center justify-between cursor-pointer transition-colors"
                  title="Click to add to Values / Y-Axis"
                >
                  <span className="truncate">{f.label}</span>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">123</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Center Canvas & Chart Preview Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Builder Control Strip */}
        <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={chartName}
              onChange={(e) => setChartName(e.target.value)}
              className="text-sm font-bold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-slate-900 focus:outline-none px-1 py-0.5 bg-transparent"
            />
            <span className="text-[11px] text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-mono">
              {aggregatedData.categories.length} data points
            </span>
          </div>

          <div className="flex items-center gap-2">
            {saveSuccessMsg && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <Check className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
            <button
              onClick={handleSaveChart}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Chart</span>
            </button>
            {onNavigateToDashboard && (
              <button
                onClick={() => onNavigateToDashboard(activeChartId)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>To Dashboard</span>
              </button>
            )}
          </div>
        </div>

        {/* Shelf Drop-Zones (Categories & Values) */}
        <div className="bg-white border-b border-slate-200 p-3 grid grid-cols-2 gap-3 text-xs">
          {/* Category Shelf */}
          <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
            <div className="text-[10px] font-bold uppercase text-slate-400 mb-1.5 flex items-center justify-between">
              <span>Category / X-Axis (Dimension)</span>
              <span className="text-[10px] text-slate-400">Click field from left</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {categoryFields.map(cf => (
                <div key={cf.fieldId} className="flex items-center gap-1.5 px-2 py-1 bg-blue-100 text-blue-900 rounded font-medium text-xs">
                  <span>{cf.label}</span>
                </div>
              ))}
              {categoryFields.length === 0 && (
                <span className="text-slate-400 italic text-[11px]">No category chosen</span>
              )}
            </div>
          </div>

          {/* Value Shelf with Aggregation Dropdown */}
          <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
            <div className="text-[10px] font-bold uppercase text-slate-400 mb-1.5 flex items-center justify-between">
              <span>Values / Measures (Y-Axis)</span>
              <span className="text-[10px] text-slate-400">Configurable Aggregation</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {valueFields.map(vf => (
                <div key={vf.fieldId} className="flex items-center gap-1.5 px-2 py-1 bg-emerald-100 text-emerald-900 rounded font-medium text-xs">
                  <span>{vf.label}</span>
                  <select
                    value={vf.aggregation || 'SUM'}
                    onChange={(e) => handleUpdateAggregation(vf.fieldId, e.target.value as AggregationType)}
                    className="bg-emerald-200 text-emerald-950 text-[10px] rounded px-1 font-bold outline-none cursor-pointer"
                  >
                    <option value="SUM">SUM</option>
                    <option value="AVG">AVG</option>
                    <option value="COUNT">COUNT</option>
                    <option value="MIN">MIN</option>
                    <option value="MAX">MAX</option>
                  </select>
                  <button
                    onClick={() => handleRemoveValue(vf.fieldId)}
                    className="text-emerald-700 hover:text-emerald-950 font-bold text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
              {valueFields.length === 0 && (
                <span className="text-slate-400 italic text-[11px]">No value metrics bound</span>
              )}
            </div>
          </div>
        </div>

        {/* Visual Chart Canvas */}
        <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center">
          <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{chartName}</h3>
                <p className="text-[11px] text-slate-500">
                  {chartType.toUpperCase()} · Bound to {activeDataset.name}
                </p>
              </div>
              {showLegend && aggregatedData.series.length > 0 && (
                <div className="flex items-center gap-3 text-xs">
                  {aggregatedData.series.map((s, idx) => (
                    <div key={s.name} className="flex items-center gap-1.5">
                      <span 
                        className="w-3 h-3 rounded-xs inline-block" 
                        style={{ backgroundColor: colors[idx % colors.length] }} 
                      />
                      <span className="text-slate-600 font-medium">{s.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rendering Chart By Type */}
            {aggregatedData.categories.length === 0 ? (
              <div className="h-72 flex flex-col items-center justify-center text-slate-400 text-xs">
                <BarChart3 className="w-8 h-8 text-slate-300 mb-2" />
                Select at least one Category and one Metric value to render chart
              </div>
            ) : chartType === 'column' || chartType === 'bar' ? (
              <div className="h-80 w-full flex items-end gap-3 pt-6 pb-2 px-4 border-b border-l border-slate-200 relative">
                {/* Background Grid Lines */}
                {showGrid && (
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                    <div className="border-b border-slate-400 w-full" />
                    <div className="border-b border-slate-400 w-full" />
                    <div className="border-b border-slate-400 w-full" />
                    <div className="border-b border-slate-400 w-full" />
                  </div>
                )}

                {/* Bars */}
                {(() => {
                  const allVals = aggregatedData.series.flatMap(s => s.data);
                  const maxVal = Math.max(...allVals, 1);

                  return aggregatedData.categories.map((cat, catIdx) => (
                    <div key={cat} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                      <div className="w-full flex items-end justify-center gap-1 h-full">
                        {aggregatedData.series.map((s, sIdx) => {
                          const val = s.data[catIdx] || 0;
                          const heightPct = Math.min(Math.max((val / maxVal) * 88, 4), 95);
                          return (
                            <div
                              key={s.name}
                              className="w-full max-w-[42px] rounded-t-sm transition-all duration-300 hover:brightness-110 relative cursor-pointer"
                              style={{
                                height: `${heightPct}%`,
                                backgroundColor: colors[sIdx % colors.length]
                              }}
                            >
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-10 font-mono">
                                {val.toLocaleString()}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium mt-2 truncate w-full text-center">
                        {cat}
                      </span>
                    </div>
                  ));
                })()}
              </div>
            ) : chartType === 'pie' || chartType === 'donut' ? (
              <div className="h-80 w-full flex items-center justify-center gap-8">
                {(() => {
                  const values = aggregatedData.series[0]?.data || [];
                  const total = values.reduce((a, b) => a + b, 0) || 1;
                  let currentAngle = 0;

                  return (
                    <div className="flex items-center gap-8">
                      <svg width="220" height="220" viewBox="0 0 100 100" className="transform -rotate-90">
                        {values.map((val, idx) => {
                          const percentage = val / total;
                          const strokeDasharray = `${percentage * 314.15} 314.15`;
                          const strokeDashoffset = -currentAngle * 314.15;
                          currentAngle += percentage;

                          return (
                            <circle
                              key={idx}
                              r={chartType === 'donut' ? '30' : '20'}
                              cx="50"
                              cy="50"
                              fill="transparent"
                              stroke={colors[idx % colors.length]}
                              strokeWidth={chartType === 'donut' ? '18' : '40'}
                              strokeDasharray={strokeDasharray}
                              strokeDashoffset={strokeDashoffset}
                              className="transition-all hover:opacity-80"
                            />
                          );
                        })}
                      </svg>

                      <div className="space-y-1.5 text-xs max-h-60 overflow-y-auto">
                        {aggregatedData.categories.map((cat, idx) => (
                          <div key={cat} className="flex items-center gap-2">
                            <span 
                              className="w-2.5 h-2.5 rounded-full shrink-0" 
                              style={{ backgroundColor: colors[idx % colors.length] }} 
                            />
                            <span className="font-medium text-slate-800">{cat}</span>
                            <span className="font-mono text-slate-500 text-[11px]">
                              {((values[idx] / total) * 100).toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : chartType === 'kpi' ? (
              <div className="h-64 flex flex-col items-center justify-center text-center">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">
                  {valueFields[0]?.label || 'Metric'} ({valueFields[0]?.aggregation || 'SUM'})
                </span>
                <span className="text-5xl font-extrabold font-mono text-slate-900">
                  {aggregatedData.series[0]?.data.reduce((a, b) => a + b, 0).toLocaleString()}
                </span>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-3 py-1 rounded-full">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+18.4% performance index</span>
                </div>
              </div>
            ) : (
              // Line / Area / Generic
              <div className="h-80 w-full flex items-end gap-3 pt-6 pb-2 px-4 border-b border-l border-slate-200 relative">
                {aggregatedData.categories.map((cat, catIdx) => {
                  const val = aggregatedData.series[0]?.data[catIdx] || 0;
                  const allVals = aggregatedData.series.flatMap(s => s.data);
                  const maxVal = Math.max(...allVals, 1);
                  const heightPct = Math.min(Math.max((val / maxVal) * 88, 6), 95);

                  return (
                    <div key={cat} className="flex-1 flex flex-col items-center justify-end h-full group">
                      <div 
                        className="w-2.5 rounded-full mb-1 transition-all group-hover:scale-125"
                        style={{ height: `${heightPct}%`, backgroundColor: colors[0] }}
                      />
                      <span className="text-[10px] text-slate-500 font-medium truncate w-full text-center">
                        {cat}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Right Properties Panel */}
      <div className="w-64 border-l border-slate-200 bg-white p-4 space-y-5 overflow-y-auto shrink-0">
        <div>
          <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">Visual Chart Type</h3>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            {[
              { type: 'column', label: 'Column' },
              { type: 'bar', label: 'Bar' },
              { type: 'line', label: 'Line' },
              { type: 'area', label: 'Area' },
              { type: 'pie', label: 'Pie' },
              { type: 'donut', label: 'Donut' },
              { type: 'kpi', label: 'KPI' },
              { type: 'pivot', label: 'Table' },
            ].map(item => (
              <button
                key={item.type}
                onClick={() => setChartType(item.type as ChartType)}
                className={`p-2 rounded border text-center transition-colors cursor-pointer ${
                  chartType === item.type
                    ? 'border-slate-900 bg-slate-900 text-white font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">Color Palette</h3>
          <div className="space-y-1.5">
            {Object.keys(PALETTES).map(pKey => (
              <button
                key={pKey}
                onClick={() => setColorPalette(pKey)}
                className={`w-full p-2 rounded border text-xs flex items-center justify-between transition-colors ${
                  colorPalette === pKey ? 'border-slate-900 bg-slate-50 font-bold' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="capitalize">{pKey}</span>
                <div className="flex gap-1">
                  {PALETTES[pKey].map((c, idx) => (
                    <span key={idx} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">Display Options</h3>
          <div className="space-y-2 text-xs text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showLegend}
                onChange={(e) => setShowLegend(e.target.checked)}
                className="rounded text-slate-900"
              />
              <span>Show Legend</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="rounded text-slate-900"
              />
              <span>Show Grid Lines</span>
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">Sort Ordering</h3>
          <select
            value={sortDirection}
            onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded text-slate-800"
          >
            <option value="desc">Metric Value (High to Low)</option>
            <option value="asc">Metric Value (Low to High)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
