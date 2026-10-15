import { 
  DataSourceConfig, 
  Dataset, 
  ChartDefinition, 
  Dashboard, 
  ReportDefinition, 
  SqlQueryHistory, 
  UserProfile 
} from '../types/bi';

const STORAGE_KEYS = {
  DATA_SOURCES: 'intactbi_datasources',
  DATASETS: 'intactbi_datasets',
  CHARTS: 'intactbi_charts',
  DASHBOARDS: 'intactbi_dashboards',
  REPORTS: 'intactbi_reports',
  QUERY_HISTORY: 'intactbi_query_history',
  CURRENT_USER: 'intactbi_current_user',
};

// Initial Seed Data: Global Retail Orders & Performance
const INITIAL_RETAIL_DATA: Record<string, any>[] = [
  { order_id: 'ORD-1001', order_date: '2025-01-15', category: 'Technology', sub_category: 'Laptops', product_name: 'ThinkPad Carbon X1', region: 'North America', segment: 'Enterprise', sales: 1849.00, profit: 462.25, quantity: 2, discount: 0.05 },
  { order_id: 'ORD-1002', order_date: '2025-01-18', category: 'Furniture', sub_category: 'Chairs', product_name: 'Herman Miller Aeron', region: 'North America', segment: 'Corporate', sales: 1395.00, profit: 279.00, quantity: 1, discount: 0.00 },
  { order_id: 'ORD-1003', order_date: '2025-01-22', category: 'Office Supplies', sub_category: 'Storage', product_name: 'Modular Filing Cabinet', region: 'Europe', segment: 'Small Business', sales: 430.50, profit: 86.10, quantity: 3, discount: 0.10 },
  { order_id: 'ORD-1004', order_date: '2025-02-02', category: 'Technology', sub_category: 'Phones', product_name: 'Pixel 9 Pro Max', region: 'Asia Pacific', segment: 'Consumer', sales: 1199.00, profit: 299.75, quantity: 1, discount: 0.00 },
  { order_id: 'ORD-1005', order_date: '2025-02-10', category: 'Furniture', sub_category: 'Desks', product_name: 'Standing Motorized Desk', region: 'Europe', segment: 'Enterprise', sales: 850.00, profit: 170.00, quantity: 2, discount: 0.08 },
  { order_id: 'ORD-1006', order_date: '2025-02-14', category: 'Technology', sub_category: 'Accessories', product_name: 'Mechanical Ergonomic Keyboard', region: 'North America', segment: 'Corporate', sales: 220.00, profit: 66.00, quantity: 4, discount: 0.00 },
  { order_id: 'ORD-1007', order_date: '2025-02-20', category: 'Office Supplies', sub_category: 'Paper', product_name: 'Premium Laser Stock 500ct', region: 'Latin America', segment: 'Consumer', sales: 145.00, profit: 43.50, quantity: 10, discount: 0.15 },
  { order_id: 'ORD-1008', order_date: '2025-03-01', category: 'Technology', sub_category: 'Monitors', product_name: 'Dell UltraSharp 32 4K', region: 'North America', segment: 'Enterprise', sales: 899.00, profit: 224.75, quantity: 2, discount: 0.05 },
  { order_id: 'ORD-1009', order_date: '2025-03-05', category: 'Furniture', sub_category: 'Bookcases', product_name: 'Solid Oak Shelving Unit', region: 'Europe', segment: 'Corporate', sales: 740.00, profit: 111.00, quantity: 1, discount: 0.10 },
  { order_id: 'ORD-1010', order_date: '2025-03-12', category: 'Office Supplies', sub_category: 'Binders', product_name: 'Heavy Duty 3-Ring Ring Set', region: 'Asia Pacific', segment: 'Small Business', sales: 85.00, profit: 21.25, quantity: 5, discount: 0.00 },
  { order_id: 'ORD-1011', order_date: '2025-03-18', category: 'Technology', sub_category: 'Laptops', product_name: 'MacBook Pro 16 M3 Max', region: 'North America', segment: 'Enterprise', sales: 3499.00, profit: 874.75, quantity: 1, discount: 0.00 },
  { order_id: 'ORD-1012', order_date: '2025-03-24', category: 'Furniture', sub_category: 'Tables', product_name: 'Conference Room Oval Table', region: 'Latin America', segment: 'Enterprise', sales: 2100.00, profit: 315.00, quantity: 1, discount: 0.15 },
  { order_id: 'ORD-1013', order_date: '2025-04-02', category: 'Technology', sub_category: 'Storage', product_name: 'Enterprise NVMe 8TB Array', region: 'Europe', segment: 'Enterprise', sales: 1650.00, profit: 495.00, quantity: 2, discount: 0.00 },
  { order_id: 'ORD-1014', order_date: '2025-04-10', category: 'Office Supplies', sub_category: 'Appliances', product_name: 'Espresso Bar Commercial Maker', region: 'North America', segment: 'Corporate', sales: 1250.00, profit: 250.00, quantity: 1, discount: 0.05 },
  { order_id: 'ORD-1015', order_date: '2025-04-15', category: 'Furniture', sub_category: 'Chairs', product_name: 'Steelcase Gesture Chair', region: 'Asia Pacific', segment: 'Corporate', sales: 1180.00, profit: 236.00, quantity: 2, discount: 0.05 },
  { order_id: 'ORD-1016', order_date: '2025-04-20', category: 'Technology', sub_category: 'Phones', product_name: 'Samsung Galaxy S25 Ultra', region: 'North America', segment: 'Consumer', sales: 1299.00, profit: 324.75, quantity: 1, discount: 0.00 },
  { order_id: 'ORD-1017', order_date: '2025-05-01', category: 'Office Supplies', sub_category: 'Art', product_name: 'Design Markers Professional Pack', region: 'Europe', segment: 'Consumer', sales: 120.00, profit: 36.00, quantity: 3, discount: 0.00 },
  { order_id: 'ORD-1018', order_date: '2025-05-08', category: 'Technology', sub_category: 'Accessories', product_name: 'Noise Cancelling Wireless Headset', region: 'North America', segment: 'Corporate', sales: 380.00, profit: 95.00, quantity: 3, discount: 0.05 },
  { order_id: 'ORD-1019', order_date: '2025-05-14', category: 'Furniture', sub_category: 'Furnishings', product_name: 'Acoustic Wall Panel Grid', region: 'Asia Pacific', segment: 'Small Business', sales: 620.00, profit: 124.00, quantity: 2, discount: 0.10 },
  { order_id: 'ORD-1020', order_date: '2025-05-22', category: 'Technology', sub_category: 'Monitors', product_name: 'LG UltraFine 27 Studio 5K', region: 'Europe', segment: 'Enterprise', sales: 1299.00, profit: 324.75, quantity: 2, discount: 0.00 },
];

export const INITIAL_DATA_SOURCES: DataSourceConfig[] = [
  {
    id: 'ds-pg-prod',
    name: 'Production PostgreSQL (AWS RDS)',
    type: 'postgresql',
    host: 'postgres-prod.internal.corp',
    port: 5432,
    database: 'analytics_warehouse',
    username: 'intactbi_reader',
    password: '••••••••••••',
    schema: 'public',
    status: 'connected',
    lastTested: '2025-05-15 14:32:10 UTC',
    poolingConfig: {
      minimumIdle: 5,
      maximumPoolSize: 20,
      connectionTimeout: 30000,
      idleTimeout: 600000,
      maxLifetime: 1800000
    },
    tables: [
      {
        name: 'retail_orders',
        schema: 'public',
        rowCount: 142080,
        columns: [
          { name: 'order_id', dataType: 'VARCHAR(32)', nullable: false, isPrimaryKey: true, sampleValue: 'ORD-1001' },
          { name: 'order_date', dataType: 'DATE', nullable: false, isPrimaryKey: false, sampleValue: '2025-01-15' },
          { name: 'category', dataType: 'VARCHAR(64)', nullable: false, isPrimaryKey: false, sampleValue: 'Technology' },
          { name: 'sub_category', dataType: 'VARCHAR(64)', nullable: false, isPrimaryKey: false, sampleValue: 'Laptops' },
          { name: 'product_name', dataType: 'VARCHAR(255)', nullable: false, isPrimaryKey: false, sampleValue: 'ThinkPad Carbon X1' },
          { name: 'region', dataType: 'VARCHAR(64)', nullable: false, isPrimaryKey: false, sampleValue: 'North America' },
          { name: 'segment', dataType: 'VARCHAR(64)', nullable: false, isPrimaryKey: false, sampleValue: 'Enterprise' },
          { name: 'sales', dataType: 'NUMERIC(12,2)', nullable: false, isPrimaryKey: false, sampleValue: 1849.00 },
          { name: 'profit', dataType: 'NUMERIC(12,2)', nullable: false, isPrimaryKey: false, sampleValue: 462.25 },
          { name: 'quantity', dataType: 'INTEGER', nullable: false, isPrimaryKey: false, sampleValue: 2 },
          { name: 'discount', dataType: 'NUMERIC(4,2)', nullable: false, isPrimaryKey: false, sampleValue: 0.05 },
        ]
      },
      {
        name: 'customers',
        schema: 'public',
        rowCount: 28400,
        columns: [
          { name: 'customer_id', dataType: 'VARCHAR(32)', nullable: false, isPrimaryKey: true, sampleValue: 'CUST-8910' },
          { name: 'customer_name', dataType: 'VARCHAR(128)', nullable: false, isPrimaryKey: false, sampleValue: 'Acme Global Corp' },
          { name: 'country', dataType: 'VARCHAR(64)', nullable: false, isPrimaryKey: false, sampleValue: 'United States' },
          { name: 'credit_limit', dataType: 'NUMERIC(10,2)', nullable: false, isPrimaryKey: false, sampleValue: 50000.00 },
        ]
      }
    ],
    createdAt: '2025-01-10T10:00:00Z',
  },
  {
    id: 'ds-csv-retail',
    name: 'Retail Global Sales & Orders (CSV)',
    type: 'csv',
    fileName: 'global_retail_orders_2025.csv',
    fileSize: 489200,
    status: 'connected',
    lastTested: '2025-05-15 12:10:00 UTC',
    poolingConfig: {
      minimumIdle: 1,
      maximumPoolSize: 5,
      connectionTimeout: 5000,
      idleTimeout: 300000,
      maxLifetime: 600000
    },
    tables: [
      {
        name: 'global_retail_orders_2025',
        schema: 'default',
        rowCount: INITIAL_RETAIL_DATA.length,
        columns: [
          { name: 'order_id', dataType: 'VARCHAR(32)', nullable: false, isPrimaryKey: true, sampleValue: 'ORD-1001' },
          { name: 'category', dataType: 'VARCHAR(64)', nullable: false, isPrimaryKey: false, sampleValue: 'Technology' },
          { name: 'sub_category', dataType: 'VARCHAR(64)', nullable: false, isPrimaryKey: false, sampleValue: 'Laptops' },
          { name: 'product_name', dataType: 'VARCHAR(255)', nullable: false, isPrimaryKey: false, sampleValue: 'ThinkPad Carbon X1' },
          { name: 'region', dataType: 'VARCHAR(64)', nullable: false, isPrimaryKey: false, sampleValue: 'North America' },
          { name: 'segment', dataType: 'VARCHAR(64)', nullable: false, isPrimaryKey: false, sampleValue: 'Enterprise' },
          { name: 'sales', dataType: 'NUMERIC(12,2)', nullable: false, isPrimaryKey: false, sampleValue: 1849.00 },
          { name: 'profit', dataType: 'NUMERIC(12,2)', nullable: false, isPrimaryKey: false, sampleValue: 462.25 },
          { name: 'quantity', dataType: 'INTEGER', nullable: false, isPrimaryKey: false, sampleValue: 2 },
          { name: 'discount', dataType: 'NUMERIC(4,2)', nullable: false, isPrimaryKey: false, sampleValue: 0.05 },
        ]
      }
    ],
    createdAt: '2025-02-01T08:30:00Z',
  },
  {
    id: 'ds-mysql-dwh',
    name: 'Enterprise MySQL Data Warehouse',
    type: 'mysql',
    host: 'mysql-dw.us-east.company.net',
    port: 3306,
    database: 'bi_marts',
    username: 'ro_analyst',
    password: '••••••••••••',
    schema: 'bi_marts',
    status: 'connected',
    lastTested: '2025-05-14 09:20:00 UTC',
    poolingConfig: {
      minimumIdle: 2,
      maximumPoolSize: 10,
      connectionTimeout: 15000,
      idleTimeout: 300000,
      maxLifetime: 900000
    },
    tables: [
      {
        name: 'dim_regions',
        schema: 'bi_marts',
        rowCount: 8,
        columns: [
          { name: 'region_id', dataType: 'INT', nullable: false, isPrimaryKey: true, sampleValue: 1 },
          { name: 'region_name', dataType: 'VARCHAR(50)', nullable: false, isPrimaryKey: false, sampleValue: 'North America' },
          { name: 'director', dataType: 'VARCHAR(100)', nullable: false, isPrimaryKey: false, sampleValue: 'Sarah Jenkins' },
        ]
      }
    ],
    createdAt: '2025-02-15T11:00:00Z',
  }
];

export const INITIAL_DATASETS: Dataset[] = [
  {
    id: 'ds-orders-2025',
    name: 'Global Retail Sales & Orders (Standard Mart)',
    dataSourceId: 'ds-pg-prod',
    dataSourceName: 'Production PostgreSQL (AWS RDS)',
    sourceType: 'postgresql',
    queryOrTable: 'SELECT * FROM retail_orders',
    rowCount: INITIAL_RETAIL_DATA.length,
    data: INITIAL_RETAIL_DATA,
    fields: [
      { id: 'f_order_id', name: 'order_id', label: 'Order ID', dataType: 'string', role: 'dimension' },
      { id: 'f_order_date', name: 'order_date', label: 'Order Date', dataType: 'date', role: 'dimension' },
      { id: 'f_category', name: 'category', label: 'Category', dataType: 'string', role: 'dimension' },
      { id: 'f_sub_category', name: 'sub_category', label: 'Sub-Category', dataType: 'string', role: 'dimension' },
      { id: 'f_product_name', name: 'product_name', label: 'Product Name', dataType: 'string', role: 'dimension' },
      { id: 'f_region', name: 'region', label: 'Region', dataType: 'string', role: 'dimension' },
      { id: 'f_segment', name: 'segment', label: 'Customer Segment', dataType: 'string', role: 'dimension' },
      { id: 'f_sales', name: 'sales', label: 'Sales Amount ($)', dataType: 'number', role: 'metric', format: '$#,##0.00' },
      { id: 'f_profit', name: 'profit', label: 'Net Profit ($)', dataType: 'number', role: 'metric', format: '$#,##0.00' },
      { id: 'f_quantity', name: 'quantity', label: 'Quantity Sold', dataType: 'number', role: 'metric', format: '#,##0' },
      { id: 'f_discount', name: 'discount', label: 'Discount Rate', dataType: 'number', role: 'metric', format: '0.0%' },
      { id: 'f_margin', name: 'profit_margin', label: 'Profit Margin (%)', dataType: 'number', role: 'metric', isCalculated: true, expression: '(profit / sales) * 100', format: '0.0%' }
    ],
    createdAt: '2025-02-15T14:00:00Z',
    updatedAt: '2025-05-15T14:32:00Z',
  }
];

export const INITIAL_CHARTS: ChartDefinition[] = [
  {
    id: 'chart-rev-category',
    name: 'Total Revenue by Product Category',
    datasetId: 'ds-orders-2025',
    type: 'column',
    categoryFields: [{ fieldId: 'f_category', fieldName: 'category', label: 'Category', dataType: 'string' }],
    valueFields: [{ fieldId: 'f_sales', fieldName: 'sales', label: 'Sales', dataType: 'number', aggregation: 'SUM', format: '$#,##0' }],
    filters: [],
    title: 'Revenue by Category',
    subtitle: 'Aggregated sum of gross sales across product lines',
    colorPalette: 'ocean',
    showLegend: true,
    showGrid: true,
    showValuesOnBars: true,
    sortField: 'sales',
    sortDirection: 'desc',
    createdAt: '2025-03-01T10:00:00Z',
    updatedAt: '2025-05-10T12:00:00Z',
  },
  {
    id: 'chart-profit-region',
    name: 'Net Profit Distribution by Region',
    datasetId: 'ds-orders-2025',
    type: 'pie',
    categoryFields: [{ fieldId: 'f_region', fieldName: 'region', label: 'Region', dataType: 'string' }],
    valueFields: [{ fieldId: 'f_profit', fieldName: 'profit', label: 'Net Profit', dataType: 'number', aggregation: 'SUM', format: '$#,##0' }],
    filters: [],
    title: 'Regional Profit Distribution',
    subtitle: 'Share of operating margin by geographical market',
    colorPalette: 'emerald',
    showLegend: true,
    showGrid: false,
    showValuesOnBars: true,
    createdAt: '2025-03-02T11:00:00Z',
    updatedAt: '2025-05-10T12:00:00Z',
  },
  {
    id: 'chart-segment-performance',
    name: 'Customer Segment Sales & Units',
    datasetId: 'ds-orders-2025',
    type: 'bar',
    categoryFields: [{ fieldId: 'f_segment', fieldName: 'segment', label: 'Segment', dataType: 'string' }],
    valueFields: [
      { fieldId: 'f_sales', fieldName: 'sales', label: 'Sales', dataType: 'number', aggregation: 'SUM', format: '$#,##0' },
      { fieldId: 'f_profit', fieldName: 'profit', label: 'Profit', dataType: 'number', aggregation: 'SUM', format: '$#,##0' }
    ],
    filters: [],
    title: 'Sales & Profit by Segment',
    subtitle: 'Comparison between Enterprise, Corporate and Consumer tiers',
    colorPalette: 'slate',
    showLegend: true,
    showGrid: true,
    showValuesOnBars: true,
    createdAt: '2025-03-05T14:30:00Z',
    updatedAt: '2025-05-10T12:00:00Z',
  }
];

export const INITIAL_DASHBOARDS: Dashboard[] = [
  {
    id: 'dash-exec-overview',
    name: 'Executive Sales & Operations Cockpit',
    description: 'High-level business performance metrics, regional margin distribution, and product tier revenue.',
    theme: 'light',
    autoRefreshSeconds: 0,
    activeFilters: {},
    widgets: [
      {
        id: 'w-kpi-1',
        type: 'kpi',
        title: 'Total Gross Sales',
        x: 0,
        y: 0,
        w: 3,
        h: 2,
        kpiConfig: {
          metricField: 'sales',
          datasetId: 'ds-orders-2025',
          aggregation: 'SUM',
          format: '$#,##0',
          trendPercentage: 14.8,
          trendLabel: 'vs prior quarter'
        }
      },
      {
        id: 'w-kpi-2',
        type: 'kpi',
        title: 'Net Realized Profit',
        x: 3,
        y: 0,
        w: 3,
        h: 2,
        kpiConfig: {
          metricField: 'profit',
          datasetId: 'ds-orders-2025',
          aggregation: 'SUM',
          format: '$#,##0',
          trendPercentage: 22.4,
          trendLabel: 'margin +3.2%'
        }
      },
      {
        id: 'w-kpi-3',
        type: 'kpi',
        title: 'Average Order Value',
        x: 6,
        y: 0,
        w: 3,
        h: 2,
        kpiConfig: {
          metricField: 'sales',
          datasetId: 'ds-orders-2025',
          aggregation: 'AVG',
          format: '$#,##0',
          trendPercentage: 6.1,
          trendLabel: 'healthy basket'
        }
      },
      {
        id: 'w-kpi-4',
        type: 'kpi',
        title: 'Units Dispatched',
        x: 9,
        y: 0,
        w: 3,
        h: 2,
        kpiConfig: {
          metricField: 'quantity',
          datasetId: 'ds-orders-2025',
          aggregation: 'SUM',
          format: '#,##0',
          trendPercentage: 9.3,
          trendLabel: 'on-time fulfillment'
        }
      },
      {
        id: 'w-chart-1',
        type: 'chart',
        chartId: 'chart-rev-category',
        title: 'Sales by Product Line',
        x: 0,
        y: 2,
        w: 7,
        h: 6,
      },
      {
        id: 'w-chart-2',
        type: 'chart',
        chartId: 'chart-profit-region',
        title: 'Regional Profit Distribution',
        x: 7,
        y: 2,
        w: 5,
        h: 6,
      },
      {
        id: 'w-chart-3',
        type: 'chart',
        chartId: 'chart-segment-performance',
        title: 'Segment Performance Breakdown',
        x: 0,
        y: 8,
        w: 12,
        h: 5,
      }
    ],
    createdAt: '2025-03-10T09:00:00Z',
    updatedAt: '2025-05-12T16:00:00Z',
  }
];

export const INITIAL_REPORTS: ReportDefinition[] = [
  {
    id: 'rep-retail-financials',
    name: 'Quarterly Sales & Profitability Detail Report',
    datasetId: 'ds-orders-2025',
    orientation: 'portrait',
    pageWidth: 595,
    pageHeight: 842,
    topMargin: 20,
    bottomMargin: 20,
    leftMargin: 20,
    rightMargin: 20,
    bands: {
      title: { type: 'title', title: 'Title Band', height: 75, visible: true },
      pageHeader: { type: 'pageHeader', title: 'Page Header', height: 35, visible: true },
      columnHeader: { type: 'columnHeader', title: 'Column Header', height: 28, visible: true },
      detail: { type: 'detail', title: 'Detail Band', height: 24, visible: true },
      columnFooter: { type: 'columnFooter', title: 'Column Footer', height: 15, visible: false },
      pageFooter: { type: 'pageFooter', title: 'Page Footer', height: 30, visible: true },
      summary: { type: 'summary', title: 'Summary Band', height: 50, visible: true }
    },
    elements: [
      // Title Band elements
      {
        id: 'el-title-1',
        band: 'title',
        type: 'staticText',
        x: 0,
        y: 10,
        width: 555,
        height: 28,
        text: 'INTACTBI ENTERPRISE AUDIT & SALES REPORT',
        fontSize: 16,
        fontBold: true,
        alignment: 'center',
        textColor: '#0f172a'
      },
      {
        id: 'el-title-sub',
        band: 'title',
        type: 'staticText',
        x: 0,
        y: 42,
        width: 555,
        height: 18,
        text: 'Generated with JasperReports Engine 6.21 · Source: Production PostgreSQL',
        fontSize: 10,
        fontItalic: true,
        alignment: 'center',
        textColor: '#64748b'
      },
      // Page Header
      {
        id: 'el-pgh-1',
        band: 'pageHeader',
        type: 'staticText',
        x: 0,
        y: 8,
        width: 250,
        height: 16,
        text: 'Global Retail Division — Confidential',
        fontSize: 9,
        alignment: 'left',
        textColor: '#94a3b8'
      },
      {
        id: 'el-pgh-date',
        band: 'pageHeader',
        type: 'textField',
        x: 355,
        y: 8,
        width: 200,
        height: 16,
        fieldExpression: '$P{REPORT_DATE}',
        text: 'Generated: 2025-05-15',
        fontSize: 9,
        alignment: 'right',
        textColor: '#94a3b8'
      },
      // Column Header
      {
        id: 'el-col-1',
        band: 'columnHeader',
        type: 'staticText',
        x: 0,
        y: 4,
        width: 70,
        height: 20,
        text: 'Order ID',
        fontSize: 10,
        fontBold: true,
        alignment: 'left',
        backgroundColor: '#f1f5f9',
        textColor: '#1e293b'
      },
      {
        id: 'el-col-2',
        band: 'columnHeader',
        type: 'staticText',
        x: 75,
        y: 4,
        width: 80,
        height: 20,
        text: 'Category',
        fontSize: 10,
        fontBold: true,
        alignment: 'left',
        backgroundColor: '#f1f5f9',
        textColor: '#1e293b'
      },
      {
        id: 'el-col-3',
        band: 'columnHeader',
        type: 'staticText',
        x: 160,
        y: 4,
        width: 155,
        height: 20,
        text: 'Product Name',
        fontSize: 10,
        fontBold: true,
        alignment: 'left',
        backgroundColor: '#f1f5f9',
        textColor: '#1e293b'
      },
      {
        id: 'el-col-4',
        band: 'columnHeader',
        type: 'staticText',
        x: 320,
        y: 4,
        width: 75,
        height: 20,
        text: 'Region',
        fontSize: 10,
        fontBold: true,
        alignment: 'left',
        backgroundColor: '#f1f5f9',
        textColor: '#1e293b'
      },
      {
        id: 'el-col-5',
        band: 'columnHeader',
        type: 'staticText',
        x: 400,
        y: 4,
        width: 70,
        height: 20,
        text: 'Sales ($)',
        fontSize: 10,
        fontBold: true,
        alignment: 'right',
        backgroundColor: '#f1f5f9',
        textColor: '#1e293b'
      },
      {
        id: 'el-col-6',
        band: 'columnHeader',
        type: 'staticText',
        x: 475,
        y: 4,
        width: 80,
        height: 20,
        text: 'Profit ($)',
        fontSize: 10,
        fontBold: true,
        alignment: 'right',
        backgroundColor: '#f1f5f9',
        textColor: '#1e293b'
      },
      // Detail Band Elements (Field Bindings)
      {
        id: 'el-det-1',
        band: 'detail',
        type: 'textField',
        x: 0,
        y: 4,
        width: 70,
        height: 18,
        fieldExpression: '$F{order_id}',
        text: 'ORD-1001',
        fontSize: 9,
        alignment: 'left',
        textColor: '#334155'
      },
      {
        id: 'el-det-2',
        band: 'detail',
        type: 'textField',
        x: 75,
        y: 4,
        width: 80,
        height: 18,
        fieldExpression: '$F{category}',
        text: 'Technology',
        fontSize: 9,
        alignment: 'left',
        textColor: '#334155'
      },
      {
        id: 'el-det-3',
        band: 'detail',
        type: 'textField',
        x: 160,
        y: 4,
        width: 155,
        height: 18,
        fieldExpression: '$F{product_name}',
        text: 'ThinkPad Carbon X1',
        fontSize: 9,
        alignment: 'left',
        textColor: '#0f172a'
      },
      {
        id: 'el-det-4',
        band: 'detail',
        type: 'textField',
        x: 320,
        y: 4,
        width: 75,
        height: 18,
        fieldExpression: '$F{region}',
        text: 'North America',
        fontSize: 9,
        alignment: 'left',
        textColor: '#334155'
      },
      {
        id: 'el-det-5',
        band: 'detail',
        type: 'textField',
        x: 400,
        y: 4,
        width: 70,
        height: 18,
        fieldExpression: '$F{sales}',
        text: '$1,849.00',
        fontSize: 9,
        alignment: 'right',
        formatPattern: '$#,##0.00',
        textColor: '#0f172a'
      },
      {
        id: 'el-det-6',
        band: 'detail',
        type: 'textField',
        x: 475,
        y: 4,
        width: 80,
        height: 18,
        fieldExpression: '$F{profit}',
        text: '$462.25',
        fontSize: 9,
        alignment: 'right',
        formatPattern: '$#,##0.00',
        textColor: '#16a34a'
      },
      // Page Footer
      {
        id: 'el-ftr-1',
        band: 'pageFooter',
        type: 'staticText',
        x: 0,
        y: 8,
        width: 250,
        height: 16,
        text: 'IntactBI Enterprise Studio v3.4',
        fontSize: 8,
        alignment: 'left',
        textColor: '#94a3b8'
      },
      {
        id: 'el-ftr-num',
        band: 'pageFooter',
        type: 'textField',
        x: 355,
        y: 8,
        width: 200,
        height: 16,
        fieldExpression: '"Page " + $V{PAGE_NUMBER} + " of " + $V{PAGE_COUNT}',
        text: 'Page 1 of 1',
        fontSize: 8,
        alignment: 'right',
        textColor: '#94a3b8'
      },
      // Summary Band
      {
        id: 'el-sum-1',
        band: 'summary',
        type: 'staticText',
        x: 240,
        y: 12,
        width: 150,
        height: 20,
        text: 'TOTAL REPORT SUMMARY:',
        fontSize: 10,
        fontBold: true,
        alignment: 'right',
        textColor: '#0f172a'
      },
      {
        id: 'el-sum-sales',
        band: 'summary',
        type: 'textField',
        x: 400,
        y: 12,
        width: 70,
        height: 20,
        fieldExpression: '$V{SUM_SALES}',
        text: '$23,178.50',
        fontSize: 10,
        fontBold: true,
        alignment: 'right',
        formatPattern: '$#,##0.00',
        textColor: '#0f172a'
      },
      {
        id: 'el-sum-profit',
        band: 'summary',
        type: 'textField',
        x: 475,
        y: 12,
        width: 80,
        height: 20,
        fieldExpression: '$V{SUM_PROFIT}',
        text: '$4,845.85',
        fontSize: 10,
        fontBold: true,
        alignment: 'right',
        formatPattern: '$#,##0.00',
        textColor: '#16a34a'
      }
    ],
    parameters: [
      { name: 'REPORT_TITLE', type: 'java.lang.String', defaultValue: 'Quarterly Sales & Profitability', prompt: 'Report Title' },
      { name: 'DATE_FROM', type: 'java.util.Date', defaultValue: '2025-01-01', prompt: 'Start Date' },
      { name: 'REGION_FILTER', type: 'java.lang.String', defaultValue: 'ALL', prompt: 'Target Region' }
    ],
    variables: [
      { name: 'SUM_SALES', calculation: 'SUM', expression: '$F{sales}', initialValue: '0.00' },
      { name: 'SUM_PROFIT', calculation: 'SUM', expression: '$F{profit}', initialValue: '0.00' },
      { name: 'COUNT_ORDERS', calculation: 'COUNT', expression: '$F{order_id}', initialValue: '0' }
    ],
    createdAt: '2025-03-12T15:00:00Z',
    updatedAt: '2025-05-14T10:00:00Z',
  }
];

export const INITIAL_USER: UserProfile = {
  id: 'usr-1',
  name: 'Devin Alexander',
  email: 'd.alexander@enterprise.intactbi.io',
  role: 'ADMIN',
  department: 'Data & Analytics Architecture',
  lastLogin: '2025-05-15T08:00:00Z',
};

class StorageService {
  // Data Sources
  getDataSources(): DataSourceConfig[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DATA_SOURCES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DATA_SOURCES, JSON.stringify(INITIAL_DATA_SOURCES));
      return INITIAL_DATA_SOURCES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_DATA_SOURCES;
    }
  }

  saveDataSource(ds: DataSourceConfig): void {
    const list = this.getDataSources();
    const index = list.findIndex(item => item.id === ds.id);
    if (index >= 0) {
      list[index] = ds;
    } else {
      list.push(ds);
    }
    localStorage.setItem(STORAGE_KEYS.DATA_SOURCES, JSON.stringify(list));
  }

  deleteDataSource(id: string): void {
    const list = this.getDataSources().filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DATA_SOURCES, JSON.stringify(list));
  }

  // Datasets
  getDatasets(): Dataset[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DATASETS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DATASETS, JSON.stringify(INITIAL_DATASETS));
      return INITIAL_DATASETS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_DATASETS;
    }
  }

  saveDataset(dataset: Dataset): void {
    const list = this.getDatasets();
    const index = list.findIndex(item => item.id === dataset.id);
    if (index >= 0) {
      list[index] = dataset;
    } else {
      list.push(dataset);
    }
    localStorage.setItem(STORAGE_KEYS.DATASETS, JSON.stringify(list));
  }

  deleteDataset(id: string): void {
    const list = this.getDatasets().filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DATASETS, JSON.stringify(list));
  }

  // Charts
  getCharts(): ChartDefinition[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CHARTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CHARTS, JSON.stringify(INITIAL_CHARTS));
      return INITIAL_CHARTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CHARTS;
    }
  }

  saveChart(chart: ChartDefinition): void {
    const list = this.getCharts();
    const index = list.findIndex(c => c.id === chart.id);
    if (index >= 0) {
      list[index] = chart;
    } else {
      list.push(chart);
    }
    localStorage.setItem(STORAGE_KEYS.CHARTS, JSON.stringify(list));
  }

  deleteChart(id: string): void {
    const list = this.getCharts().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CHARTS, JSON.stringify(list));
  }

  // Dashboards
  getDashboards(): Dashboard[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DASHBOARDS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DASHBOARDS, JSON.stringify(INITIAL_DASHBOARDS));
      return INITIAL_DASHBOARDS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_DASHBOARDS;
    }
  }

  saveDashboard(dashboard: Dashboard): void {
    const list = this.getDashboards();
    const index = list.findIndex(d => d.id === dashboard.id);
    if (index >= 0) {
      list[index] = dashboard;
    } else {
      list.push(dashboard);
    }
    localStorage.setItem(STORAGE_KEYS.DASHBOARDS, JSON.stringify(list));
  }

  deleteDashboard(id: string): void {
    const list = this.getDashboards().filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DASHBOARDS, JSON.stringify(list));
  }

  // Reports
  getReports(): ReportDefinition[] {
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_REPORTS));
      return INITIAL_REPORTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_REPORTS;
    }
  }

  saveReport(report: ReportDefinition): void {
    const list = this.getReports();
    const index = list.findIndex(r => r.id === report.id);
    if (index >= 0) {
      list[index] = report;
    } else {
      list.push(report);
    }
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(list));
  }

  deleteReport(id: string): void {
    const list = this.getReports().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(list));
  }

  // Query History
  getQueryHistory(): SqlQueryHistory[] {
    const raw = localStorage.getItem(STORAGE_KEYS.QUERY_HISTORY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  addQueryHistory(item: SqlQueryHistory): void {
    const list = this.getQueryHistory();
    list.unshift(item);
    if (list.length > 50) list.pop();
    localStorage.setItem(STORAGE_KEYS.QUERY_HISTORY, JSON.stringify(list));
  }

  // Current User
  getCurrentUser(): UserProfile {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return INITIAL_USER;
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_USER;
    }
  }

  setCurrentUser(user: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }
}

export const storageService = new StorageService();
