import React, { useState } from 'react';
import { 
  Terminal, 
  Play, 
  Layers, 
  History, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Database, 
  Download,
  Filter,
  Plus,
  Trash2
} from 'lucide-react';
import { Dataset, VisualQueryJoin, VisualQueryFilter, SqlQueryHistory } from '../../types/bi';
import { DataEngine } from '../../services/dataEngine';
import { storageService } from '../../services/storage';

interface SqlQueryBuilderProps {
  datasets: Dataset[];
  onSaveAsDataset?: (newDataset: Dataset) => void;
}

export const SqlQueryBuilder: React.FC<SqlQueryBuilderProps> = ({ datasets, onSaveAsDataset }) => {
  const [mode, setMode] = useState<'visual' | 'sql'>('visual');
  const [selectedTable, setSelectedTable] = useState('retail_orders');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'order_id', 'order_date', 'category', 'product_name', 'region', 'sales', 'profit'
  ]);
  const [joins, setJoins] = useState<VisualQueryJoin[]>([]);
  const [filters, setFilters] = useState<VisualQueryFilter[]>([]);
  const [orderByCol, setOrderByCol] = useState('sales');
  const [orderDir, setOrderDir] = useState<'ASC' | 'DESC'>('DESC');
  const [limit, setLimit] = useState<number>(50);

  // Raw SQL state
  const [rawSql, setRawSql] = useState<string>(
    `-- Enterprise PostgreSQL Reporting Query\nSELECT \n  category,\n  region,\n  COUNT(order_id) AS total_orders,\n  SUM(sales) AS gross_sales,\n  SUM(profit) AS net_profit\nFROM retail_orders\nWHERE sales > 200.00\nGROUP BY category, region\nORDER BY gross_sales DESC\nLIMIT 50;`
  );

  // Execution state
  const [queryResult, setQueryResult] = useState<{ columns: string[]; rows: Record<string, any>[]; durationMs: number } | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryHistory, setQueryHistory] = useState<SqlQueryHistory[]>(storageService.getQueryHistory());

  // Generate SQL from Visual Query Builder
  const generatedSql = `SELECT\n  ${selectedColumns.join(',\n  ')}\nFROM ${selectedTable}${
    joins.length > 0 ? '\n' + joins.map(j => `${j.type} ${j.rightTable} ON ${j.leftTable}.${j.leftColumn} = ${j.rightTable}.${j.rightColumn}`).join('\n') : ''
  }${
    filters.length > 0 ? '\nWHERE ' + filters.map(f => `${f.column} ${f.operator} '${f.value}'`).join(' AND ') : ''
  }\nORDER BY ${orderByCol} ${orderDir}\nLIMIT ${limit};`;

  const availableColumns = [
    'order_id', 'order_date', 'category', 'sub_category', 'product_name', 'region', 'segment', 'sales', 'profit', 'quantity', 'discount'
  ];

  const handleToggleColumn = (col: string) => {
    if (selectedColumns.includes(col)) {
      if (selectedColumns.length > 1) {
        setSelectedColumns(selectedColumns.filter(c => c !== col));
      }
    } else {
      setSelectedColumns([...selectedColumns, col]);
    }
  };

  const handleAddFilter = () => {
    setFilters([...filters, {
      id: `flt-${Date.now()}`,
      table: selectedTable,
      column: 'category',
      operator: '=',
      value: 'Technology'
    }]);
  };

  const handleRemoveFilter = (id: string) => {
    setFilters(filters.filter(f => f.id !== id));
  };

  const handleExecute = () => {
    setIsExecuting(true);
    const sqlToRun = mode === 'visual' ? generatedSql : rawSql;

    setTimeout(() => {
      const result = DataEngine.executeSql(sqlToRun, datasets);
      setQueryResult(result);
      setIsExecuting(false);

      const historyItem: SqlQueryHistory = {
        id: `hist-${Date.now()}`,
        query: sqlToRun,
        dataSourceId: datasets[0]?.dataSourceId || 'default',
        dataSourceName: datasets[0]?.dataSourceName || 'PostgreSQL DB',
        timestamp: new Date().toLocaleTimeString(),
        durationMs: result.durationMs,
        rowCount: result.rows.length,
        success: true
      };

      storageService.addQueryHistory(historyItem);
      setQueryHistory([historyItem, ...queryHistory]);
    }, 250);
  };

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-53px)] bg-slate-50 select-none">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-md bg-purple-50 text-purple-700">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">SQL Studio & Query Engine</h2>
            <p className="text-[11px] text-slate-500">PostgreSQL Dialect · JDBC Connection Pooling</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md text-xs font-semibold">
            <button
              onClick={() => setMode('visual')}
              className={`px-3 py-1 rounded transition-colors ${
                mode === 'visual' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Visual Query Builder
            </button>
            <button
              onClick={() => setMode('sql')}
              className={`px-3 py-1 rounded transition-colors ${
                mode === 'sql' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Raw SQL Editor
            </button>
          </div>

          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors shadow-xs"
          >
            <Play className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : ''}`} />
            <span>{isExecuting ? 'Executing...' : 'Run Query'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Split: Builder on Top, Results Table on Bottom */}
      <div className="flex-1 flex flex-col p-6 space-y-4 overflow-y-auto">
        {mode === 'visual' ? (
          <div className="grid grid-cols-3 gap-4">
            {/* Table & Columns Selection */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase text-slate-400">1. Select Table & Columns</h3>
              <div>
                <label className="text-slate-500 text-xs block mb-1">Source Table</label>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded font-mono font-medium text-slate-800"
                >
                  <option value="retail_orders">public.retail_orders (142,080 rows)</option>
                  <option value="customers">public.customers (28,400 rows)</option>
                  <option value="dim_regions">bi_marts.dim_regions (8 rows)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-500 text-xs block mb-1">Projected Columns</label>
                <div className="space-y-1 max-h-48 overflow-y-auto border border-slate-100 rounded p-1">
                  {availableColumns.map(col => (
                    <label key={col} className="flex items-center gap-2 text-xs p-1 hover:bg-slate-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedColumns.includes(col)}
                        onChange={() => handleToggleColumn(col)}
                        className="rounded text-purple-600"
                      />
                      <span className="font-mono text-slate-700">{col}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Filters & Ordering */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase text-slate-400">2. WHERE Filter Clauses</h3>
                <button
                  onClick={handleAddFilter}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Condition
                </button>
              </div>

              <div className="space-y-2">
                {filters.map(f => (
                  <div key={f.id} className="flex items-center gap-2 text-xs">
                    <select
                      value={f.column}
                      onChange={(e) => setFilters(filters.map(x => x.id === f.id ? { ...x, column: e.target.value } : x))}
                      className="p-1 border border-slate-200 rounded bg-slate-50 font-mono text-[11px]"
                    >
                      {availableColumns.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    <select
                      value={f.operator}
                      onChange={(e) => setFilters(filters.map(x => x.id === f.id ? { ...x, operator: e.target.value as any } : x))}
                      className="p-1 border border-slate-200 rounded bg-slate-50 font-mono text-[11px]"
                    >
                      <option value="=">=</option>
                      <option value="!=">!=</option>
                      <option value=">">&gt;</option>
                      <option value="<">&lt;</option>
                      <option value="LIKE">LIKE</option>
                    </select>

                    <input
                      type="text"
                      value={f.value}
                      onChange={(e) => setFilters(filters.map(x => x.id === f.id ? { ...x, value: e.target.value } : x))}
                      className="flex-1 p-1 border border-slate-200 rounded text-[11px]"
                    />

                    <button
                      onClick={() => handleRemoveFilter(f.id)}
                      className="text-rose-500 hover:text-rose-700 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}

                {filters.length === 0 && (
                  <p className="text-xs text-slate-400 italic">No filter conditions applied (full table scan).</p>
                )}
              </div>

              <div className="border-t border-slate-100 pt-3">
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Sorting & Limit</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-slate-400 text-[10px] block">Order By</label>
                    <select
                      value={orderByCol}
                      onChange={(e) => setOrderByCol(e.target.value)}
                      className="w-full p-1 border border-slate-200 rounded font-mono"
                    >
                      {availableColumns.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] block">Direction</label>
                    <select
                      value={orderDir}
                      onChange={(e) => setOrderDir(e.target.value as any)}
                      className="w-full p-1 border border-slate-200 rounded font-mono"
                    >
                      <option value="ASC">ASC (Ascending)</option>
                      <option value="DESC">DESC (Descending)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Generated SQL Code Box */}
            <div className="bg-slate-900 rounded-lg p-4 text-slate-100 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block mb-2">
                  Generated SQL Dialect (PostgreSQL 16)
                </span>
                <pre className="font-mono text-xs text-emerald-300 whitespace-pre-wrap leading-relaxed">
                  {generatedSql}
                </pre>
              </div>

              <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>HikariCP Pooled Connection</span>
                <span className="text-emerald-400 font-mono">Cost: 1.25</span>
              </div>
            </div>
          </div>
        ) : (
          /* Raw SQL Mode */
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2 text-slate-400 text-[11px]">
              <span>SQL Editor (supports parameterized placeholders like :startDate)</span>
              <span>PostgreSQL 16 Engine</span>
            </div>
            <textarea
              value={rawSql}
              onChange={(e) => setRawSql(e.target.value)}
              rows={8}
              className="w-full bg-transparent outline-none text-slate-200 font-mono text-xs resize-none"
            />
          </div>
        )}

        {/* Query Results Table Panel */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden flex-1 shadow-xs">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-800">Query Execution Results</span>
              {queryResult && (
                <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                  <span>{queryResult.rows.length} rows returned</span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-emerald-600 font-bold">
                    <Clock className="w-3 h-3" /> {queryResult.durationMs}ms
                  </span>
                </div>
              )}
            </div>

            {queryResult && queryResult.rows.length > 0 && (
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(queryResult.rows, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'query_results.json';
                  a.click();
                }}
                className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold"
              >
                <Download className="w-3.5 h-3.5" /> Export JSON
              </button>
            )}
          </div>

          {queryResult && queryResult.rows.length > 0 ? (
            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                  <tr>
                    {queryResult.columns.map(col => (
                      <th key={col} className="py-2.5 px-3 font-mono whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 font-mono text-[11px]">
                  {queryResult.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      {queryResult.columns.map(col => (
                        <td key={col} className="py-2 px-3 whitespace-nowrap">
                          {row[col] === null ? <span className="text-slate-300">NULL</span> : String(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              Click "Run Query" above to execute the SQL statement and preview rows.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
