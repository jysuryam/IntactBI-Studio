export type DataSourceType = 
  | 'postgresql' 
  | 'mysql' 
  | 'oracle' 
  | 'sqlserver' 
  | 'h2' 
  | 'csv' 
  | 'excel' 
  | 'json' 
  | 'rest' 
  | 'mongodb';

export interface PoolingConfig {
  minimumIdle: number;
  maximumPoolSize: number;
  connectionTimeout: number; // ms
  idleTimeout: number; // ms
  maxLifetime: number; // ms
}

export interface DataSourceConfig {
  id: string;
  name: string;
  type: DataSourceType;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  schema?: string;
  url?: string;
  fileName?: string;
  fileSize?: number;
  status: 'connected' | 'disconnected' | 'error' | 'testing';
  lastTested?: string;
  errorMessage?: string;
  poolingConfig: PoolingConfig;
  tables?: SchemaTable[];
  createdAt: string;
}

export interface SchemaColumn {
  name: string;
  dataType: string;
  nullable: boolean;
  isPrimaryKey: boolean;
  sampleValue?: string | number | boolean;
}

export interface SchemaTable {
  name: string;
  schema: string;
  rowCount: number;
  columns: SchemaColumn[];
}

export type FieldDataType = 'string' | 'number' | 'date' | 'boolean';
export type FieldRole = 'dimension' | 'metric';

export interface DatasetField {
  id: string;
  name: string;
  label: string;
  dataType: FieldDataType;
  role: FieldRole;
  isCalculated?: boolean;
  expression?: string;
  format?: string;
}

export interface Dataset {
  id: string;
  name: string;
  dataSourceId: string;
  dataSourceName: string;
  sourceType: DataSourceType;
  queryOrTable: string;
  fields: DatasetField[];
  data: Record<string, any>[];
  rowCount: number;
  createdAt: string;
  updatedAt: string;
}

export type ChartType = 
  | 'bar' 
  | 'column' 
  | 'stacked_bar' 
  | 'line' 
  | 'area' 
  | 'pie' 
  | 'donut' 
  | 'scatter' 
  | 'heatmap' 
  | 'gauge' 
  | 'funnel' 
  | 'waterfall' 
  | 'combo' 
  | 'kpi' 
  | 'pivot';

export type AggregationType = 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX' | 'NONE';

export interface ChartFieldBinding {
  fieldId: string;
  fieldName: string;
  label: string;
  dataType: FieldDataType;
  aggregation?: AggregationType;
  format?: string;
}

export interface ChartFilter {
  fieldId: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'in';
  value: any;
  value2?: any;
}

export interface ChartDefinition {
  id: string;
  name: string;
  datasetId: string;
  type: ChartType;
  categoryFields: ChartFieldBinding[]; // X-axis / Dimensions
  valueFields: ChartFieldBinding[];    // Y-axis / Metrics
  seriesField?: ChartFieldBinding;    // Secondary grouping / Legend
  tooltipFields?: ChartFieldBinding[];
  filters: ChartFilter[];
  title: string;
  subtitle?: string;
  colorPalette: string;
  showLegend: boolean;
  showGrid: boolean;
  showValuesOnBars: boolean;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  createdAt: string;
  updatedAt: string;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'kpi' | 'text' | 'table' | 'filter';
  chartId?: string;
  title: string;
  subtitle?: string;
  x: number;
  y: number;
  w: number; // in grid columns (1 to 12)
  h: number; // in grid row units
  kpiConfig?: {
    metricField: string;
    datasetId: string;
    aggregation: AggregationType;
    format: string;
    targetValue?: number;
    trendPercentage?: number;
    trendLabel?: string;
  };
  textContent?: string;
  filterConfig?: {
    datasetId: string;
    fieldId: string;
    filterType: 'dropdown' | 'dateRange' | 'buttons';
  };
}

export type DashboardTheme = 'light' | 'slate' | 'midnight' | 'corporate';

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  theme: DashboardTheme;
  autoRefreshSeconds: number; // 0 = off, 10, 30, 60
  widgets: DashboardWidget[];
  activeFilters: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export type ReportBandType = 
  | 'title' 
  | 'pageHeader' 
  | 'columnHeader' 
  | 'detail' 
  | 'columnFooter' 
  | 'pageFooter' 
  | 'summary';

export interface ReportElement {
  id: string;
  band: ReportBandType;
  type: 'staticText' | 'textField' | 'line' | 'rectangle' | 'image' | 'crosstab';
  x: number; // mm or px relative to band
  y: number;
  width: number;
  height: number;
  text?: string;
  fieldExpression?: string;
  fontSize?: number;
  fontBold?: boolean;
  fontItalic?: boolean;
  fontUnderline?: boolean;
  alignment?: 'left' | 'center' | 'right';
  textColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  formatPattern?: string;
}

export interface ReportBand {
  type: ReportBandType;
  title: string;
  height: number; // px
  visible: boolean;
}

export interface ReportDefinition {
  id: string;
  name: string;
  datasetId: string;
  orientation: 'portrait' | 'landscape';
  pageWidth: number; // 595 standard A4
  pageHeight: number; // 842 standard A4
  topMargin: number;
  bottomMargin: number;
  leftMargin: number;
  rightMargin: number;
  bands: Record<ReportBandType, ReportBand>;
  elements: ReportElement[];
  parameters: { name: string; type: string; defaultValue: string; prompt: string }[];
  variables: { name: string; calculation: 'SUM' | 'COUNT' | 'AVERAGE' | 'DISTINCT'; expression: string; initialValue?: string }[];
  jrxmlContent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SqlQueryHistory {
  id: string;
  query: string;
  dataSourceId: string;
  dataSourceName: string;
  timestamp: string;
  durationMs: number;
  rowCount: number;
  success: boolean;
  errorMessage?: string;
}

export type UserRole = 'ADMIN' | 'DESIGNER' | 'ANALYST' | 'VIEWER';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  lastLogin: string;
}

export interface VisualQueryJoin {
  id: string;
  type: 'INNER JOIN' | 'LEFT JOIN' | 'RIGHT JOIN';
  leftTable: string;
  leftColumn: string;
  rightTable: string;
  rightColumn: string;
}

export interface VisualQueryFilter {
  id: string;
  table: string;
  column: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN' | 'IS NOT NULL';
  value: string;
}
