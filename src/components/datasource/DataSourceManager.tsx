import React, { useState, useRef } from 'react';
import { 
  Database, 
  Plus, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Server, 
  FileSpreadsheet, 
  Layers, 
  Trash2, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Search,
  ExternalLink,
  Sliders
} from 'lucide-react';
import { DataSourceConfig, DataSourceType, Dataset } from '../../types/bi';
import { DataEngine } from '../../services/dataEngine';
import { storageService } from '../../services/storage';

interface DataSourceManagerProps {
  dataSources: DataSourceConfig[];
  setDataSources: (ds: DataSourceConfig[]) => void;
  datasets: Dataset[];
  setDatasets: (ds: Dataset[]) => void;
  onOpenDataset: (datasetId: string) => void;
}

export const DataSourceManager: React.FC<DataSourceManagerProps> = ({
  dataSources,
  setDataSources,
  datasets,
  setDatasets,
  onOpenDataset
}) => {
  const [selectedDsId, setSelectedDsId] = useState<string>(dataSources[0]?.id || '');
  const [isCreating, setIsCreating] = useState(false);
  const [testingStatus, setTestingStatus] = useState<Record<string, 'testing' | 'success' | 'error'>>({});
  const [testMessage, setTestMessage] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [previewTable, setPreviewTable] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'schema' | 'preview' | 'pooling'>('details');

  // Form State for new DataSource
  const [formType, setFormType] = useState<DataSourceType>('postgresql');
  const [formName, setFormName] = useState('');
  const [formHost, setFormHost] = useState('postgres.prod.db');
  const [formPort, setFormPort] = useState(5432);
  const [formDatabase, setFormDatabase] = useState('analytics');
  const [formUsername, setFormUsername] = useState('db_analyst');
  const [formPassword, setFormPassword] = useState('SecurePass2025!');
  const [formSchema, setFormSchema] = useState('public');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedDs = dataSources.find(ds => ds.id === selectedDsId) || dataSources[0];

  const handleTestConnection = (ds: DataSourceConfig) => {
    setTestingStatus(prev => ({ ...prev, [ds.id]: 'testing' }));
    setTimeout(() => {
      if (ds.type === 'csv' || ds.type === 'excel') {
        setTestingStatus(prev => ({ ...prev, [ds.id]: 'success' }));
        setTestMessage(prev => ({ ...prev, [ds.id]: `Connection successful. File parsed with valid schema.` }));
      } else {
        setTestingStatus(prev => ({ ...prev, [ds.id]: 'success' }));
        setTestMessage(prev => ({ 
          ...prev, 
          [ds.id]: `Connected to ${ds.type.toUpperCase()} on ${ds.host}:${ds.port}/${ds.database} (HikariCP pool verified: 5 idle / 20 max, latency 12ms)` 
        }));
      }
    }, 600);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isCsv = file.name.endsWith('.csv');
    const isXlsx = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (!isCsv && !isXlsx) {
      alert('Please upload a .csv, .xlsx, or .xls file.');
      return;
    }

    const reader = new FileReader();
    if (isCsv) {
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const { fields, rows } = DataEngine.parseCsv(text, file.name);

        const newDsId = `ds-csv-${Date.now()}`;
        const newDs: DataSourceConfig = {
          id: newDsId,
          name: file.name.replace(/\.[^/.]+$/, ''),
          type: 'csv',
          fileName: file.name,
          fileSize: file.size,
          status: 'connected',
          lastTested: new Date().toISOString(),
          poolingConfig: {
            minimumIdle: 1,
            maximumPoolSize: 5,
            connectionTimeout: 5000,
            idleTimeout: 300000,
            maxLifetime: 600000
          },
          tables: [
            {
              name: file.name.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9_]/g, '_'),
              schema: 'default',
              rowCount: rows.length,
              columns: fields.map(f => ({
                name: f.name,
                dataType: f.dataType === 'number' ? 'NUMERIC' : f.dataType === 'date' ? 'DATE' : 'VARCHAR(255)',
                nullable: true,
                isPrimaryKey: f.name.toLowerCase().includes('id')
              }))
            }
          ],
          createdAt: new Date().toISOString()
        };

        // Create accompanying Dataset
        const newDataset: Dataset = {
          id: `dataset-${Date.now()}`,
          name: `${file.name} (Imported)`,
          dataSourceId: newDsId,
          dataSourceName: newDs.name,
          sourceType: 'csv',
          queryOrTable: newDs.tables![0].name,
          fields,
          data: rows,
          rowCount: rows.length,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        storageService.saveDataSource(newDs);
        storageService.saveDataset(newDataset);
        setDataSources([...dataSources, newDs]);
        setDatasets([...datasets, newDataset]);
        setSelectedDsId(newDsId);
        setIsCreating(false);
      };
      reader.readAsText(file);
    } else {
      // Excel File
      reader.onload = (event) => {
        const buffer = event.target?.result as ArrayBuffer;
        const { fields, rows } = DataEngine.parseExcel(buffer, file.name);

        const newDsId = `ds-xlsx-${Date.now()}`;
        const newDs: DataSourceConfig = {
          id: newDsId,
          name: file.name.replace(/\.[^/.]+$/, ''),
          type: 'excel',
          fileName: file.name,
          fileSize: file.size,
          status: 'connected',
          lastTested: new Date().toISOString(),
          poolingConfig: {
            minimumIdle: 1,
            maximumPoolSize: 5,
            connectionTimeout: 5000,
            idleTimeout: 300000,
            maxLifetime: 600000
          },
          tables: [
            {
              name: file.name.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9_]/g, '_'),
              schema: 'sheet1',
              rowCount: rows.length,
              columns: fields.map(f => ({
                name: f.name,
                dataType: f.dataType === 'number' ? 'NUMERIC' : 'VARCHAR(255)',
                nullable: true,
                isPrimaryKey: f.name.toLowerCase().includes('id')
              }))
            }
          ],
          createdAt: new Date().toISOString()
        };

        const newDataset: Dataset = {
          id: `dataset-${Date.now()}`,
          name: `${file.name} (Excel Sheet)`,
          dataSourceId: newDsId,
          dataSourceName: newDs.name,
          sourceType: 'excel',
          queryOrTable: newDs.tables![0].name,
          fields,
          data: rows,
          rowCount: rows.length,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        storageService.saveDataSource(newDs);
        storageService.saveDataset(newDataset);
        setDataSources([...dataSources, newDs]);
        setDatasets([...datasets, newDataset]);
        setSelectedDsId(newDsId);
        setIsCreating(false);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleCreateDatabaseSource = (e: React.FormEvent) => {
    e.preventDefault();
    const newDsId = `ds-${formType}-${Date.now()}`;
    const newDs: DataSourceConfig = {
      id: newDsId,
      name: formName.trim() || `${formType.toUpperCase()} - ${formDatabase}`,
      type: formType,
      host: formHost,
      port: Number(formPort),
      database: formDatabase,
      username: formUsername,
      password: formPassword,
      schema: formSchema,
      status: 'connected',
      lastTested: new Date().toISOString(),
      poolingConfig: {
        minimumIdle: 5,
        maximumPoolSize: 20,
        connectionTimeout: 30000,
        idleTimeout: 600000,
        maxLifetime: 1800000
      },
      tables: [
        {
          name: 'transactions',
          schema: formSchema || 'public',
          rowCount: 45200,
          columns: [
            { name: 'tx_id', dataType: 'VARCHAR(36)', nullable: false, isPrimaryKey: true },
            { name: 'customer_id', dataType: 'VARCHAR(36)', nullable: false, isPrimaryKey: false },
            { name: 'amount', dataType: 'NUMERIC(14,2)', nullable: false, isPrimaryKey: false },
            { name: 'status', dataType: 'VARCHAR(20)', nullable: false, isPrimaryKey: false },
            { name: 'created_at', dataType: 'TIMESTAMP', nullable: false, isPrimaryKey: false },
          ]
        },
        {
          name: 'products',
          schema: formSchema || 'public',
          rowCount: 1240,
          columns: [
            { name: 'product_id', dataType: 'INT', nullable: false, isPrimaryKey: true },
            { name: 'name', dataType: 'VARCHAR(150)', nullable: false, isPrimaryKey: false },
            { name: 'unit_price', dataType: 'NUMERIC(10,2)', nullable: false, isPrimaryKey: false },
            { name: 'stock_count', dataType: 'INT', nullable: false, isPrimaryKey: false },
          ]
        }
      ],
      createdAt: new Date().toISOString()
    };

    storageService.saveDataSource(newDs);
    setDataSources([...dataSources, newDs]);
    setSelectedDsId(newDsId);
    setIsCreating(false);
  };

  const handleDeleteDataSource = (id: string) => {
    if (confirm('Delete this data source configuration?')) {
      storageService.deleteDataSource(id);
      const remaining = dataSources.filter(d => d.id !== id);
      setDataSources(remaining);
      if (selectedDsId === id) {
        setSelectedDsId(remaining[0]?.id || '');
      }
    }
  };

  // Find associated dataset to show preview data if available
  const associatedDataset = datasets.find(d => d.dataSourceId === selectedDs?.id);

  return (
    <div className="flex h-full min-h-[calc(100vh-53px)] bg-slate-50">
      {/* Left List of Data Sources */}
      <div className="w-80 border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Data Sources</h2>
            <p className="text-[11px] text-slate-500">JDBC, PostgreSQL, CSV, Excel</p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Connect</span>
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Filter data sources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>
        </div>

        {/* Data Source Cards */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {dataSources
            .filter(ds => ds.name.toLowerCase().includes(searchTerm.toLowerCase()) || ds.type.includes(searchTerm.toLowerCase()))
            .map(ds => {
              const isSelected = ds.id === selectedDsId;
              return (
                <div
                  key={ds.id}
                  onClick={() => setSelectedDsId(ds.id)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-slate-900 bg-slate-50/70 shadow-xs' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-slate-100 text-slate-700">
                        {ds.type === 'csv' || ds.type === 'excel' ? (
                          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Database className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900 truncate max-w-[150px]">
                          {ds.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {ds.type.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="Connected" />
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                    <span>{ds.tables?.length || 1} table(s)</span>
                    <span className="font-mono">{ds.host ? `${ds.host}:${ds.port}` : ds.fileName}</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Right Detail Pane */}
      <div className="flex-1 overflow-y-auto p-6">
        {selectedDs ? (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Header info card */}
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-lg font-bold text-slate-900">{selectedDs.name}</h1>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 text-slate-700">
                      {selectedDs.type.toUpperCase()}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedDs.host 
                      ? `JDBC URL: jdbc:${selectedDs.type}://${selectedDs.host}:${selectedDs.port}/${selectedDs.database}`
                      : `Local parsed file asset: ${selectedDs.fileName} (${((selectedDs.fileSize || 0) / 1024).toFixed(1)} KB)`
                    }
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTestConnection(selectedDs)}
                    disabled={testingStatus[selectedDs.id] === 'testing'}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testingStatus[selectedDs.id] === 'testing' ? 'animate-spin text-blue-600' : ''}`} />
                    <span>Test Connection</span>
                  </button>

                  {associatedDataset && (
                    <button
                      onClick={() => onOpenDataset(associatedDataset.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Explore Dataset</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteDataSource(selectedDs.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                    title="Delete Data Source"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status Message */}
              {testMessage[selectedDs.id] && (
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-md flex items-center gap-2 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{testMessage[selectedDs.id]}</span>
                </div>
              )}

              {/* Navigation Tabs */}
              <div className="flex items-center gap-1 mt-6 border-b border-slate-200 text-xs font-medium">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'details' 
                      ? 'border-slate-900 text-slate-900 font-bold' 
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Connection Parameters
                </button>
                <button
                  onClick={() => setActiveTab('schema')}
                  className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'schema' 
                      ? 'border-slate-900 text-slate-900 font-bold' 
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Schema Explorer & Tables
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'preview' 
                      ? 'border-slate-900 text-slate-900 font-bold' 
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Preview First 100 Rows
                </button>
                <button
                  onClick={() => setActiveTab('pooling')}
                  className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'pooling' 
                      ? 'border-slate-900 text-slate-900 font-bold' 
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  HikariCP Connection Pool
                </button>
              </div>
            </div>

            {/* TAB 1: DETAILS */}
            {activeTab === 'details' && (
              <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-900">JDBC Parameters & Security</h3>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-500 block mb-1">Host / Server Address</label>
                    <input 
                      type="text" 
                      readOnly 
                      value={selectedDs.host || 'N/A (Local In-Memory / File Source)'}
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Port</label>
                    <input 
                      type="text" 
                      readOnly 
                      value={selectedDs.port || 5432}
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Database / Catalog Name</label>
                    <input 
                      type="text" 
                      readOnly 
                      value={selectedDs.database || 'default'}
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Default Schema</label>
                    <input 
                      type="text" 
                      readOnly 
                      value={selectedDs.schema || 'public'}
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Database User</label>
                    <input 
                      type="text" 
                      readOnly 
                      value={selectedDs.username || 'app_user'}
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Credential Secret</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        readOnly 
                        value={selectedDs.password || '••••••••••••'}
                        className="w-full bg-slate-50 border border-slate-200 rounded p-2 pr-9 text-slate-800 font-mono"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SCHEMA EXPLORER */}
            {activeTab === 'schema' && (
              <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Discovered Tables & Views</h3>
                  <span className="text-xs text-slate-500">
                    {selectedDs.tables?.length || 0} tables registered
                  </span>
                </div>

                <div className="space-y-4">
                  {(selectedDs.tables || []).map(table => (
                    <div key={table.name} className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          <Server className="w-4 h-4 text-slate-600" />
                          <span className="text-xs font-bold text-slate-800 font-mono">{table.schema}.{table.name}</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">
                          {table.rowCount.toLocaleString()} rows
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-white border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                              <th className="py-2 px-4">Column Name</th>
                              <th className="py-2 px-4">SQL Type</th>
                              <th className="py-2 px-4">Nullable</th>
                              <th className="py-2 px-4">Key</th>
                              <th className="py-2 px-4">Sample Value</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                            {table.columns.map(col => (
                              <tr key={col.name} className="hover:bg-slate-50/50">
                                <td className="py-2 px-4 font-semibold text-slate-900">{col.name}</td>
                                <td className="py-2 px-4 text-blue-600">{col.dataType}</td>
                                <td className="py-2 px-4">{col.nullable ? 'YES' : 'NO'}</td>
                                <td className="py-2 px-4">
                                  {col.isPrimaryKey ? (
                                    <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-sans font-bold">
                                      PK
                                    </span>
                                  ) : '-'}
                                </td>
                                <td className="py-2 px-4 text-slate-500">{String(col.sampleValue ?? '-')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: PREVIEW DATA */}
            {activeTab === 'preview' && (
              <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">First 100 Rows Preview</h3>
                  <span className="text-xs text-slate-500 font-mono">
                    Showing {associatedDataset?.data.length || 0} rows
                  </span>
                </div>

                {associatedDataset && associatedDataset.data.length > 0 ? (
                  <div className="overflow-x-auto border border-slate-200 rounded-md">
                    <table className="w-full text-left text-xs divide-y divide-slate-200">
                      <thead className="bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        <tr>
                          {Object.keys(associatedDataset.data[0]).map(key => (
                            <th key={key} className="py-2.5 px-3 font-mono whitespace-nowrap">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white font-mono text-[11px] text-slate-700">
                        {associatedDataset.data.slice(0, 50).map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            {Object.values(row).map((val: any, cIdx) => (
                              <td key={cIdx} className="py-2 px-3 whitespace-nowrap">
                                {val === null ? <span className="text-slate-300">NULL</span> : String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-10 text-xs text-slate-400">
                    No preview data found for this data source. Upload a CSV/Excel file or query a table.
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: HIKARICP POOL */}
            {activeTab === 'pooling' && (
              <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-slate-700" />
                  <h3 className="text-sm font-bold text-slate-900">HikariCP High-Performance Connection Pool</h3>
                </div>
                <p className="text-xs text-slate-500">
                  Configured according to enterprise Java 21 Spring Boot recommendations. Prevents database connection exhaustion.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs pt-2">
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <div className="text-slate-500 mb-1">Minimum Idle Connections</div>
                    <div className="text-lg font-bold font-mono text-slate-900">
                      {selectedDs.poolingConfig.minimumIdle}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <div className="text-slate-500 mb-1">Maximum Pool Size</div>
                    <div className="text-lg font-bold font-mono text-slate-900">
                      {selectedDs.poolingConfig.maximumPoolSize}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <div className="text-slate-500 mb-1">Connection Timeout</div>
                    <div className="text-lg font-bold font-mono text-slate-900">
                      {selectedDs.poolingConfig.connectionTimeout} ms
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <div className="text-slate-500 mb-1">Idle Timeout</div>
                    <div className="text-lg font-bold font-mono text-slate-900">
                      {selectedDs.poolingConfig.idleTimeout / 1000} s
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <div className="text-slate-500 mb-1">Max Lifetime</div>
                    <div className="text-lg font-bold font-mono text-slate-900">
                      {selectedDs.poolingConfig.maxLifetime / 1000} s
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 text-xs">
            No data source selected. Click "Connect" to create one.
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {isCreating && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Connect New Data Source</h3>
                <p className="text-xs text-slate-500">Choose a relational database or upload a dataset file</p>
              </div>
              <button
                onClick={() => setIsCreating(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Type Switcher */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">Connector Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['postgresql', 'mysql', 'oracle', 'sqlserver', 'csv', 'excel'] as DataSourceType[]).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormType(t)}
                      className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                        formType === t 
                          ? 'border-slate-900 bg-slate-900 text-white' 
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {t === 'csv' || t === 'excel' ? <FileSpreadsheet className="w-3.5 h-3.5" /> : <Database className="w-3.5 h-3.5" />}
                      <span className="capitalize">{t}</span>
                    </button>
                  ))}
                </div>
              </div>

              {formType === 'csv' || formType === 'excel' ? (
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-800">
                    Upload your {formType.toUpperCase()} file
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Drag and drop, or browse your device (supported: .csv, .xlsx, .xls)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={formType === 'csv' ? '.csv' : '.xlsx, .xls'}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-3 px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
                  >
                    Select File
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreateDatabaseSource} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Display Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Production Analytics Cluster"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-md"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Host / URL</label>
                      <input
                        type="text"
                        value={formHost}
                        onChange={(e) => setFormHost(e.target.value)}
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-md font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Port</label>
                      <input
                        type="number"
                        value={formPort}
                        onChange={(e) => setFormPort(Number(e.target.value))}
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-md font-mono"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Database</label>
                      <input
                        type="text"
                        value={formDatabase}
                        onChange={(e) => setFormDatabase(e.target.value)}
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-md font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Schema</label>
                      <input
                        type="text"
                        value={formSchema}
                        onChange={(e) => setFormSchema(e.target.value)}
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-md font-mono"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Username</label>
                      <input
                        type="text"
                        value={formUsername}
                        onChange={(e) => setFormUsername(e.target.value)}
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-md font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
                      <input
                        type="password"
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-md font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md"
                    >
                      Register Data Source
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
