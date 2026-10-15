-- PostgreSQL Application Metadata Schema (Flyway V1__init_schema.sql)

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'VIEWER',
    department VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS data_sources (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL,
    host VARCHAR(255),
    port INTEGER,
    database_name VARCHAR(100),
    username VARCHAR(100),
    encrypted_password TEXT,
    default_schema VARCHAR(100) DEFAULT 'public',
    connection_url TEXT,
    min_idle INTEGER DEFAULT 2,
    max_pool_size INTEGER DEFAULT 10,
    created_by VARCHAR(36) REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS datasets (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    data_source_id VARCHAR(36) REFERENCES data_sources(id) ON DELETE CASCADE,
    query_text TEXT NOT NULL,
    row_count_estimate BIGINT,
    refresh_cron VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dataset_fields (
    id VARCHAR(36) PRIMARY KEY,
    dataset_id VARCHAR(36) REFERENCES datasets(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    label VARCHAR(150) NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    field_role VARCHAR(20) NOT NULL,
    is_calculated BOOLEAN DEFAULT FALSE,
    expression TEXT,
    format_pattern VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS reports (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    dataset_id VARCHAR(36) REFERENCES datasets(id) ON DELETE SET NULL,
    orientation VARCHAR(20) DEFAULT 'PORTRAIT',
    page_width INTEGER DEFAULT 595,
    page_height INTEGER DEFAULT 842,
    document_model JSONB NOT NULL,
    compiled_jrxml TEXT,
    created_by VARCHAR(36) REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dashboards (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    theme VARCHAR(50) DEFAULT 'light',
    auto_refresh_seconds INTEGER DEFAULT 0,
    widgets_layout JSONB NOT NULL,
    created_by VARCHAR(36) REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(36),
    execution_time_ms BIGINT,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_data_sources_created_by ON data_sources(created_by);
CREATE INDEX IF NOT EXISTS idx_reports_dataset_id ON reports(dataset_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(created_at);
