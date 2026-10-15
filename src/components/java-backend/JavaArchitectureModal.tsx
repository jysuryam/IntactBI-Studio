import React, { useState } from 'react';
import { 
  Server, 
  Code2, 
  FileCode, 
  Database, 
  Check, 
  Copy, 
  Download, 
  Layers,
  Terminal,
  ShieldCheck
} from 'lucide-react';

interface JavaArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JavaArchitectureModal: React.FC<JavaArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'pom' | 'schema' | 'docker' | 'api'>('overview');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const POM_XML = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.4</version>
        <relativePath/>
    </parent>

    <groupId>com.intactbi</groupId>
    <artifactId>intactbi-studio-parent</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>pom</packaging>
    <name>IntactBI Studio Platform</name>

    <properties>
        <java.version>21</java.version>
        <jasperreports.version>6.21.0</jasperreports.version>
        <poi.version>5.2.5</poi.version>
        <commons-csv.version>1.10.0</commons-csv.version>
        <hikaricp.version>5.1.0</hikaricp.version>
    </properties>

    <modules>
        <module>intellibi-common</module>
        <module>intellibi-datasource</module>
        <module>intellibi-query-engine</module>
        <module>intellibi-chart-engine</module>
        <module>intellibi-report-engine</module>
        <module>intellibi-dashboard</module>
        <module>intellibi-security</module>
        <module>intellibi-extensions</module>
        <module>intellibi-api</module>
    </modules>

    <dependencies>
        <!-- Spring Boot 3 Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>

        <!-- HikariCP Connection Pool -->
        <dependency>
            <groupId>com.zaxxer</groupId>
            <artifactId>HikariCP</artifactId>
            <version>\${hikaricp.version}</version>
        </dependency>

        <!-- PostgreSQL Metadata Driver -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- Flyway Database Migrations -->
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>

        <!-- JasperReports 6.21.0 Engine -->
        <dependency>
            <groupId>net.sf.jasperreports</groupId>
            <artifactId>jasperreports</artifactId>
            <version>\${jasperreports.version}</version>
        </dependency>
        <dependency>
            <groupId>net.sf.jasperreports</groupId>
            <artifactId>jasperreports-fonts</artifactId>
            <version>\${jasperreports.version}</version>
        </dependency>

        <!-- Apache POI 5.2.5 (Excel Export & Ingestion) -->
        <dependency>
            <groupId>org.apache.poi</groupId>
            <artifactId>poi</artifactId>
            <version>\${poi.version}</version>
        </dependency>
        <dependency>
            <groupId>org.apache.poi</groupId>
            <artifactId>poi-ooxml</artifactId>
            <version>\${poi.version}</version>
        </dependency>

        <!-- Apache Commons CSV -->
        <dependency>
            <groupId>org.apache.commons</groupId>
            <artifactId>commons-csv</artifactId>
            <version>\${commons-csv.version}</version>
        </dependency>
    </dependencies>
</project>`;

  const FLYWAY_SCHEMA = `-- PostgreSQL Application Metadata Schema (V1__init_schema.sql)
-- IntactBI Studio Database Schema

CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'VIEWER',
    department VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE data_sources (
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

CREATE TABLE datasets (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    data_source_id VARCHAR(36) REFERENCES data_sources(id) ON DELETE CASCADE,
    query_text TEXT NOT NULL,
    row_count_estimate BIGINT,
    refresh_cron VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reports (
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

CREATE TABLE dashboards (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    theme VARCHAR(50) DEFAULT 'light',
    auto_refresh_seconds INTEGER DEFAULT 0,
    widgets_layout JSONB NOT NULL,
    created_by VARCHAR(36) REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(36),
    execution_time_ms BIGINT,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_data_sources_created_by ON data_sources(created_by);
CREATE INDEX idx_reports_dataset_id ON reports(dataset_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(created_at);`;

  const DOCKER_COMPOSE = `version: '3.8'

services:
  intactbi-postgres:
    image: postgres:16-alpine
    container_name: intactbi-postgres
    environment:
      POSTGRES_DB: intactbi_metadata
      POSTGRES_USER: intactbi_admin
      POSTGRES_PASSWORD: IntactBiSecurePassword2025!
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U intactbi_admin -d intactbi_metadata"]
      interval: 5s
      timeout: 5s
      retries: 5

  intactbi-backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: intactbi-backend
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://intactbi-postgres:5432/intactbi_metadata
      SPRING_DATASOURCE_USERNAME: intactbi_admin
      SPRING_DATASOURCE_PASSWORD: IntactBiSecurePassword2025!
      SPRING_JPA_HIBERNATE_DDL_AUTO: validate
      SPRING_FLYWAY_ENABLED: 'true'
    depends_on:
      intactbi-postgres:
        condition: service_healthy

volumes:
  pgdata:`;

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Server className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Java 21 LTS & Spring Boot 3 Backend Architecture</h2>
              <p className="text-xs text-slate-300">JasperReports 6.21, HikariCP, PostgreSQL Flyway Schema, Maven Multi-Module</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-base font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'overview' ? 'border-slate-900 text-slate-900 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Architecture Overview
          </button>
          <button
            onClick={() => setActiveTab('pom')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'pom' ? 'border-slate-900 text-slate-900 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Maven pom.xml
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'schema' ? 'border-slate-900 text-slate-900 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            PostgreSQL DDL (Flyway)
          </button>
          <button
            onClick={() => setActiveTab('docker')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'docker' ? 'border-slate-900 text-slate-900 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Docker Compose
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'api' ? 'border-slate-900 text-slate-900 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            REST API Contracts
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 text-xs text-slate-700 bg-white">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Multi-Module Maven System Design</h3>
              <p className="text-slate-600 leading-relaxed">
                As required in Section 1, 2, and 16, IntactBI Studio is built upon an enterprise multi-module Maven design to separate concerns and guarantee secure classloading:
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold font-mono text-blue-700">intellibi-datasource</span>
                  <p className="text-slate-500 mt-1">JDBC connector pooling with HikariCP, PostgreSQL/MySQL drivers, CSV/Excel parsers via Apache POI and Commons CSV.</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold font-mono text-purple-700">intellibi-report-engine</span>
                  <p className="text-slate-500 mt-1">JasperReports 6.21 compiler and filler, JRXML document model mapper, PDF/XLSX export service.</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold font-mono text-emerald-700">intellibi-query-engine</span>
                  <p className="text-slate-500 mt-1">SQL AST validation, injection protection, timeout governors, and pagination streaming.</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold font-mono text-amber-700">intellibi-security</span>
                  <p className="text-slate-500 mt-1">Spring Security 6 with JWT token filter, RBAC method security, and cryptographic credential vaults.</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-950">
                <span className="font-bold block mb-1">Production Deployment Command:</span>
                <code className="font-mono text-xs bg-white px-2 py-1 rounded border border-blue-200 block text-slate-900">
                  mvn clean package -DskipTests && docker compose up -d
                </code>
              </div>
            </div>
          )}

          {activeTab === 'pom' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">pom.xml (Java 21 LTS / Spring Boot 3.3.4)</span>
                <button
                  onClick={() => handleCopy(POM_XML)}
                  className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy pom.xml'}</span>
                </button>
              </div>
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-[11px] overflow-x-auto max-h-96 leading-relaxed">
                {POM_XML}
              </pre>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">V1__init_schema.sql (Flyway Migration)</span>
                <button
                  onClick={() => handleCopy(FLYWAY_SCHEMA)}
                  className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy SQL'}</span>
                </button>
              </div>
              <pre className="bg-slate-900 text-emerald-300 p-4 rounded-lg font-mono text-[11px] overflow-x-auto max-h-96 leading-relaxed">
                {FLYWAY_SCHEMA}
              </pre>
            </div>
          )}

          {activeTab === 'docker' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">docker-compose.yml</span>
                <button
                  onClick={() => handleCopy(DOCKER_COMPOSE)}
                  className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy YAML'}</span>
                </button>
              </div>
              <pre className="bg-slate-900 text-blue-200 p-4 rounded-lg font-mono text-[11px] overflow-x-auto max-h-96 leading-relaxed">
                {DOCKER_COMPOSE}
              </pre>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-3">
              <span className="font-bold text-slate-800">Spring Web REST Endpoints</span>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="p-2 bg-slate-50 rounded border flex items-center justify-between">
                  <div><span className="text-blue-600 font-bold">GET</span> /api/datasources</div>
                  <span className="text-slate-400 font-sans">List all configured data sources</span>
                </div>
                <div className="p-2 bg-slate-50 rounded border flex items-center justify-between">
                  <div><span className="text-emerald-600 font-bold">POST</span> /api/datasources/{'{id}'}/test</div>
                  <span className="text-slate-400 font-sans">Test JDBC connectivity via HikariCP</span>
                </div>
                <div className="p-2 bg-slate-50 rounded border flex items-center justify-between">
                  <div><span className="text-blue-600 font-bold">GET</span> /api/datasets/{'{id}'}/preview</div>
                  <span className="text-slate-400 font-sans">Fetch first 100 rows with schema</span>
                </div>
                <div className="p-2 bg-slate-50 rounded border flex items-center justify-between">
                  <div><span className="text-emerald-600 font-bold">POST</span> /api/reports/{'{id}'}/export</div>
                  <span className="text-slate-400 font-sans">Compile JRXML & stream PDF/XLSX</span>
                </div>
                <div className="p-2 bg-slate-50 rounded border flex items-center justify-between">
                  <div><span className="text-emerald-600 font-bold">POST</span> /api/query/execute</div>
                  <span className="text-slate-400 font-sans">Execute parameterized SQL with timeout</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Source code templates available in /backend/ directory
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
