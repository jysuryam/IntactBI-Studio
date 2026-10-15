package com.intactbi.service;

import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import net.sf.jasperreports.engine.export.ooxml.JRXlsxExporter;
import net.sf.jasperreports.export.SimpleExporterInput;
import net.sf.jasperreports.export.SimpleOutputStreamExporterOutput;
import net.sf.jasperreports.export.SimpleXlsxReportConfiguration;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.util.Collection;
import java.util.Map;

@Service
public class JasperReportService {

    /**
     * Compiles JRXML source string to JasperReport binary
     */
    public JasperReport compileJrxml(String jrxmlContent) throws JRException {
        try (InputStream stream = new ByteArrayInputStream(jrxmlContent.getBytes(StandardCharsets.UTF_8))) {
            return JasperCompileManager.compileReport(stream);
        } catch (Exception e) {
            throw new JRException("Failed to compile JRXML template: " + e.getMessage(), e);
        }
    }

    /**
     * Fills report with JDBC Connection
     */
    public JasperPrint fillReport(JasperReport report, Map<String, Object> parameters, Connection connection) throws JRException {
        return JasperFillManager.fillReport(report, parameters, connection);
    }

    /**
     * Fills report with in-memory collection datasource (e.g. parsed CSV / Excel)
     */
    public JasperPrint fillReportWithCollection(JasperReport report, Map<String, Object> parameters, Collection<?> data) throws JRException {
        JRDataSource dataSource = new JRBeanCollectionDataSource(data);
        return JasperFillManager.fillReport(report, parameters, dataSource);
    }

    /**
     * Export JasperPrint to PDF byte array
     */
    public byte[] exportToPdf(JasperPrint print) throws JRException {
        return JasperExportManager.exportReportToPdf(print);
    }

    /**
     * Export JasperPrint to Microsoft Excel (.xlsx) using Apache POI
     */
    public byte[] exportToXlsx(JasperPrint print) throws JRException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        JRXlsxExporter exporter = new JRXlsxExporter();
        
        exporter.setExporterInput(new SimpleExporterInput(print));
        exporter.setExporterOutput(new SimpleOutputStreamExporterOutput(outputStream));

        SimpleXlsxReportConfiguration configuration = new SimpleXlsxReportConfiguration();
        configuration.setOnePagePerSheet(false);
        configuration.setDetectCellType(true);
        configuration.setCollapseRowSpan(false);
        configuration.setWhitePageBackground(false);
        exporter.setConfiguration(configuration);

        exporter.exportReport();
        return outputStream.toByteArray();
    }
}
