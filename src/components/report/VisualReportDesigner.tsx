import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  RotateCw, 
  Save, 
  Eye, 
  Code2, 
  Plus, 
  Trash2, 
  Layers, 
  Sliders, 
  Type, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Check, 
  FileSpreadsheet,
  FileCode,
  Table as TableIcon
} from 'lucide-react';
import { 
  ReportDefinition, 
  ReportBandType, 
  ReportElement, 
  Dataset, 
  DatasetField 
} from '../../types/bi';
import { ReportExporter } from '../../services/exporter';
import { storageService } from '../../services/storage';

interface VisualReportDesignerProps {
  reports: ReportDefinition[];
  setReports: (reports: ReportDefinition[]) => void;
  datasets: Dataset[];
}

export const VisualReportDesigner: React.FC<VisualReportDesignerProps> = ({
  reports,
  setReports,
  datasets
}) => {
  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0]?.id || '');
  const activeReport = reports.find(r => r.id === selectedReportId) || reports[0];

  const [activeDatasetId, setActiveDatasetId] = useState<string>(activeReport?.datasetId || datasets[0]?.id || '');
  const activeDataset = datasets.find(d => d.id === activeDatasetId) || datasets[0];

  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'canvas' | 'preview' | 'jrxml'>('canvas');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [saveToast, setSaveToast] = useState(false);

  // Selected element for property inspector
  const selectedElement = activeReport?.elements.find(el => el.id === selectedElementId) || null;

  // Add field to band as dynamic text element
  const handleAddFieldToBand = (field: DatasetField, band: ReportBandType) => {
    if (!activeReport) return;

    // Calculate intelligent default X coordinate based on existing elements in this band
    const existingBandEls = activeReport.elements.filter(e => e.band === band);
    const lastX = existingBandEls.reduce((max, el) => Math.max(max, el.x + el.width), 0);
    const newX = Math.min(lastX + 5, 450);

    const newElement: ReportElement = {
      id: `el-${Date.now()}`,
      band,
      type: 'textField',
      x: newX,
      y: 4,
      width: 80,
      height: 18,
      fieldExpression: `$F{${field.name}}`,
      text: field.label,
      fontSize: 9,
      alignment: field.dataType === 'number' ? 'right' : 'left',
      textColor: '#0f172a',
      formatPattern: field.format
    };

    // If detail band, also automatically create column header label if not already present
    let extraElements: ReportElement[] = [];
    if (band === 'detail') {
      const headerEl: ReportElement = {
        id: `el-hdr-${Date.now()}`,
        band: 'columnHeader',
        type: 'staticText',
        x: newX,
        y: 4,
        width: 80,
        height: 20,
        text: field.label,
        fontSize: 10,
        fontBold: true,
        alignment: field.dataType === 'number' ? 'right' : 'left',
        textColor: '#1e293b',
        backgroundColor: '#f1f5f9'
      };
      extraElements.push(headerEl);
    }

    const updatedElements = [...activeReport.elements, newElement, ...extraElements];
    const updatedReport = { ...activeReport, elements: updatedElements, updatedAt: new Date().toISOString() };
    
    storageService.saveReport(updatedReport);
    setReports(reports.map(r => r.id === updatedReport.id ? updatedReport : r));
    setSelectedElementId(newElement.id);
  };

  // Update selected element property
  const handleUpdateElement = (updates: Partial<ReportElement>) => {
    if (!activeReport || !selectedElementId) return;

    const updatedElements = activeReport.elements.map(el => 
      el.id === selectedElementId ? { ...el, ...updates } : el
    );
    const updatedReport = { ...activeReport, elements: updatedElements };
    storageService.saveReport(updatedReport);
    setReports(reports.map(r => r.id === updatedReport.id ? updatedReport : r));
  };

  const handleDeleteElement = (id: string) => {
    if (!activeReport) return;
    const updatedElements = activeReport.elements.filter(e => e.id !== id);
    const updatedReport = { ...activeReport, elements: updatedElements };
    storageService.saveReport(updatedReport);
    setReports(reports.map(r => r.id === updatedReport.id ? updatedReport : r));
    if (selectedElementId === id) setSelectedElementId(null);
  };

  const handleSaveReport = () => {
    if (!activeReport) return;
    storageService.saveReport(activeReport);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleExportPdf = () => {
    if (!activeReport || !activeDataset) return;
    ReportExporter.exportToPdf(activeReport, activeDataset, `${activeReport.name}.pdf`);
  };

  const handleExportExcel = () => {
    if (!activeDataset) return;
    ReportExporter.exportToExcel(activeDataset, `${activeReport?.name || 'Report'}.xlsx`);
  };

  const handleExportCsv = () => {
    if (!activeDataset) return;
    ReportExporter.exportToCsv(activeDataset, `${activeReport?.name || 'Report'}.csv`);
  };

  const handleDownloadJrxml = () => {
    if (!activeReport || !activeDataset) return;
    ReportExporter.downloadJrxml(activeReport, activeDataset);
  };

  // Band list in visual Jaspersoft sequence
  const bandSequence: ReportBandType[] = [
    'title',
    'pageHeader',
    'columnHeader',
    'detail',
    'columnFooter',
    'pageFooter',
    'summary'
  ];

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-53px)] bg-slate-100 select-none">
      {/* 1. Top Ribbon Toolbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase text-slate-400">Report:</span>
            <select
              value={selectedReportId}
              onChange={(e) => setSelectedReportId(e.target.value)}
              className="text-xs font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none cursor-pointer py-1"
            >
              {reports.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <span className="text-slate-300">|</span>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md text-xs">
            <button
              onClick={() => setViewMode('canvas')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                viewMode === 'canvas' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Design Canvas
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                viewMode === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Live Data Preview
            </button>
            <button
              onClick={() => setViewMode('jrxml')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                viewMode === 'jrxml' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              JRXML Source
            </button>
          </div>
        </div>

        {/* Action Controls & Real Exports */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded px-1 text-xs">
            <button
              onClick={() => setZoomLevel(Math.max(zoomLevel - 15, 60))}
              className="p-1 hover:text-slate-900 text-slate-500"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[10px] w-9 text-center text-slate-700">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(Math.min(zoomLevel + 15, 150))}
              className="p-1 hover:text-slate-900 text-slate-500"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {saveToast && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
              <Check className="w-3.5 h-3.5" /> Saved!
            </span>
          )}

          <button
            onClick={handleSaveReport}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>

          {/* Export Dropdown / Buttons */}
          <div className="flex items-center gap-1 bg-slate-900 text-white rounded-md p-0.5 text-xs font-semibold">
            <button
              onClick={handleExportPdf}
              className="px-2.5 py-1 hover:bg-slate-800 rounded transition-colors flex items-center gap-1"
              title="Download compiled PDF report"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="px-2 py-1 hover:bg-slate-800 rounded transition-colors"
              title="Download Excel XLSX sheet"
            >
              XLSX
            </button>
            <button
              onClick={handleExportCsv}
              className="px-2 py-1 hover:bg-slate-800 rounded transition-colors"
              title="Download CSV"
            >
              CSV
            </button>
            <button
              onClick={handleDownloadJrxml}
              className="px-2 py-1 hover:bg-slate-800 rounded transition-colors text-amber-300"
              title="Download JasperReports JRXML template"
            >
              JRXML
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main 3-Panel Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Palette: Dataset Fields & Band Target */}
        <div className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-100">
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Data Field Palette
            </label>
            <select
              value={activeDatasetId}
              onChange={(e) => setActiveDatasetId(e.target.value)}
              className="w-full text-xs p-1.5 bg-slate-50 border border-slate-200 rounded"
            >
              {datasets.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="p-3 flex-1 overflow-y-auto space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
                Available Fields (Click to insert into Detail Band)
              </span>
              <div className="space-y-1">
                {activeDataset?.fields.map(f => (
                  <div
                    key={f.id}
                    onClick={() => handleAddFieldToBand(f, 'detail')}
                    className="p-2 rounded bg-slate-50 hover:bg-blue-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between cursor-pointer transition-colors"
                    title="Click to place in Detail Band with matching Column Header"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-mono text-[10px] text-blue-600 font-bold">$F</span>
                      <span className="truncate font-medium">{f.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{f.dataType}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
                Jasper Parameters & Variables
              </span>
              <div className="space-y-1 text-xs">
                {activeReport?.parameters.map(p => (
                  <div key={p.name} className="p-1.5 bg-slate-50 border border-slate-200 rounded text-slate-600 font-mono text-[11px]">
                    <span className="text-purple-600 font-bold">$P</span>&#123;{p.name}&#125;
                  </div>
                ))}
                {activeReport?.variables.map(v => (
                  <div key={v.name} className="p-1.5 bg-slate-50 border border-slate-200 rounded text-slate-600 font-mono text-[11px]">
                    <span className="text-emerald-600 font-bold">$V</span>&#123;{v.name}&#125;
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel: Jaspersoft Banded Canvas / Live Preview / JRXML */}
        <div className="flex-1 overflow-auto p-6 flex justify-center bg-slate-100">
          {viewMode === 'canvas' && (
            <div 
              className="bg-white shadow-md border border-slate-300 relative transition-transform origin-top"
              style={{
                width: `${activeReport?.pageWidth || 595}px`,
                minHeight: `${activeReport?.pageHeight || 842}px`,
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center'
              }}
            >
              {/* Report Header Margin indicator */}
              <div className="px-6 py-2 border-b border-dashed border-slate-200 text-[10px] text-slate-400 uppercase tracking-widest text-center">
                A4 Standard Page Layout ({activeReport?.orientation.toUpperCase()})
              </div>

              {/* Jaspersoft Band Stack */}
              <div className="divide-y divide-slate-300">
                {bandSequence.map(bandType => {
                  const bandDef = activeReport?.bands[bandType];
                  if (!bandDef || !bandDef.visible) return null;

                  const bandElements = activeReport?.elements.filter(e => e.band === bandType) || [];

                  return (
                    <div
                      key={bandType}
                      className="relative border-b border-slate-200 group"
                      style={{ height: `${bandDef.height}px` }}
                    >
                      {/* Left Band Label Ribbon */}
                      <div className="absolute -left-20 top-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 whitespace-nowrap">
                        {bandDef.title}
                      </div>

                      {/* Elements inside band */}
                      {bandElements.map(el => {
                        const isSelected = el.id === selectedElementId;
                        return (
                          <div
                            key={el.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedElementId(el.id);
                            }}
                            className={`absolute p-1 cursor-pointer transition-all border ${
                              isSelected 
                                ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-500 z-20' 
                                : 'border-dashed border-slate-300 hover:border-slate-400'
                            }`}
                            style={{
                              left: `${el.x}px`,
                              top: `${el.y}px`,
                              width: `${el.width}px`,
                              height: `${el.height}px`,
                              backgroundColor: el.backgroundColor || 'transparent',
                              textAlign: el.alignment || 'left',
                              color: el.textColor || '#000000',
                              fontSize: `${el.fontSize || 9}px`,
                              fontWeight: el.fontBold ? 'bold' : 'normal',
                              fontStyle: el.fontItalic ? 'italic' : 'normal',
                            }}
                          >
                            <span className="truncate block leading-tight font-sans">
                              {el.fieldExpression || el.text || 'text'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Live Data Preview Mode */}
          {viewMode === 'preview' && (
            <div className="w-full max-w-4xl bg-white shadow-md border border-slate-200 rounded-lg p-8">
              <div className="border-b border-slate-200 pb-4 mb-6">
                <h2 className="text-xl font-bold text-slate-900">{activeReport?.name}</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Live data binding with {activeDataset?.name} ({activeDataset?.rowCount} rows)
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-slate-200">
                  <thead className="bg-slate-100 font-bold text-slate-700">
                    <tr>
                      {activeReport?.elements.filter(e => e.band === 'columnHeader').map(h => (
                        <th key={h.id} className="py-2 px-3 whitespace-nowrap font-medium" style={{ textAlign: h.alignment || 'left' }}>
                          {h.text}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                    {activeDataset?.data.slice(0, 15).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        {activeReport?.elements.filter(e => e.band === 'detail').map(d => {
                          const fieldName = (d.fieldExpression || '').replace(/[$\\{}]/g, '').replace(/^F/, '');
                          const val = row[fieldName];
                          return (
                            <td key={d.id} className="py-2 px-3 whitespace-nowrap" style={{ textAlign: d.alignment || 'left' }}>
                              {typeof val === 'number' ? `$${val.toFixed(2)}` : String(val ?? '-')}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* JRXML Source Code Editor Mode */}
          {viewMode === 'jrxml' && (
            <div className="w-full max-w-4xl bg-slate-900 rounded-lg p-5 text-slate-100 font-mono text-xs overflow-auto shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <span className="text-slate-400">JasperReports 6.21 XML Schema Definition (JRXML)</span>
                <button
                  onClick={handleDownloadJrxml}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-sans text-xs font-semibold"
                >
                  Download .jrxml
                </button>
              </div>
              <pre className="whitespace-pre overflow-x-auto leading-relaxed text-blue-200">
                {activeReport && activeDataset ? ReportExporter.generateJrxml(activeReport, activeDataset) : ''}
              </pre>
            </div>
          )}
        </div>

        {/* Right Properties Inspector */}
        <div className="w-64 border-l border-slate-200 bg-white p-4 space-y-4 overflow-y-auto shrink-0">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold uppercase text-slate-400">Element Properties</h3>
            {selectedElement && (
              <button
                onClick={() => handleDeleteElement(selectedElement.id)}
                className="text-rose-600 hover:text-rose-800 text-xs flex items-center gap-0.5"
                title="Delete element"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {selectedElement ? (
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-500 block mb-1">Element Type</label>
                <span className="font-mono font-bold text-slate-800">{selectedElement.type} ({selectedElement.band})</span>
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Static Text / Expression</label>
                <input
                  type="text"
                  value={selectedElement.fieldExpression || selectedElement.text || ''}
                  onChange={(e) => {
                    if (selectedElement.type === 'textField') {
                      handleUpdateElement({ fieldExpression: e.target.value });
                    } else {
                      handleUpdateElement({ text: e.target.value });
                    }
                  }}
                  className="w-full p-1.5 border border-slate-200 rounded font-mono text-xs bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-500 block mb-1">Width (px)</label>
                  <input
                    type="number"
                    value={selectedElement.width}
                    onChange={(e) => handleUpdateElement({ width: Number(e.target.value) })}
                    className="w-full p-1.5 border border-slate-200 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">Height (px)</label>
                  <input
                    type="number"
                    value={selectedElement.height}
                    onChange={(e) => handleUpdateElement({ height: Number(e.target.value) })}
                    className="w-full p-1.5 border border-slate-200 rounded font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Text Alignment</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['left', 'center', 'right'] as const).map(align => (
                    <button
                      key={align}
                      onClick={() => handleUpdateElement({ alignment: align })}
                      className={`p-1.5 rounded border text-center capitalize ${
                        selectedElement.alignment === align ? 'bg-slate-900 text-white font-bold' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-500 block mb-1">Font Size</label>
                  <input
                    type="number"
                    value={selectedElement.fontSize || 10}
                    onChange={(e) => handleUpdateElement({ fontSize: Number(e.target.value) })}
                    className="w-full p-1.5 border border-slate-200 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">Font Weight</label>
                  <button
                    onClick={() => handleUpdateElement({ fontBold: !selectedElement.fontBold })}
                    className={`w-full p-1.5 border rounded text-center ${selectedElement.fontBold ? 'bg-slate-900 text-white font-bold' : 'border-slate-200'}`}
                  >
                    Bold
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Number Format Pattern</label>
                <input
                  type="text"
                  placeholder="e.g. $#,##0.00 or 0.0%"
                  value={selectedElement.formatPattern || ''}
                  onChange={(e) => handleUpdateElement({ formatPattern: e.target.value })}
                  className="w-full p-1.5 border border-slate-200 rounded font-mono text-xs"
                />
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-6 text-center">
              Click any report element on the canvas to configure its Jasper styling and data binding.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
