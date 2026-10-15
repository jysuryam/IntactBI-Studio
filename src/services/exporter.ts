import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { ReportDefinition, Dataset } from '../types/bi';

export class ReportExporter {
  /**
   * Export report or dataset data to PDF using jsPDF
   */
  static exportToPdf(report: ReportDefinition, dataset: Dataset, filename = 'intactbi_report.pdf'): void {
    const doc = new jsPDF({
      orientation: report.orientation || 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    // 1. Report Title & Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(report.name, 40, 50);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Dataset: ${dataset.name} | Source: ${dataset.dataSourceName} | Generated: ${new Date().toISOString()}`, 40, 68);

    // Subtle horizontal divider rule
    doc.setDrawColor(226, 232, 240);
    doc.line(40, 78, 555, 78);

    // 2. Prepare columns and table data from report detail elements or dataset fields
    const detailBindings = report.elements.filter(el => el.band === 'detail' && el.fieldExpression);
    
    let tableHeaders: string[] = [];
    let fieldKeys: string[] = [];

    if (detailBindings.length > 0) {
      detailBindings.forEach(binding => {
        const cleanField = (binding.fieldExpression || '').replace(/[$\\{}]/g, '').replace(/^F/, '');
        fieldKeys.push(cleanField);
        // Find matching columnHeader element or use clean field
        const headerEl = report.elements.find(el => el.band === 'columnHeader' && Math.abs(el.x - binding.x) < 30);
        tableHeaders.push(headerEl?.text || cleanField.toUpperCase());
      });
    } else {
      fieldKeys = dataset.fields.map(f => f.name);
      tableHeaders = dataset.fields.map(f => f.label || f.name);
    }

    const tableRows = (dataset.data || []).map(row => {
      return fieldKeys.map(key => {
        const val = row[key];
        if (val === null || val === undefined) return '-';
        if (typeof val === 'number') {
          return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        return String(val);
      });
    });

    // 3. Render Table using autoTable
    autoTable(doc, {
      startY: 90,
      head: [tableHeaders],
      body: tableRows,
      theme: 'grid',
      styles: {
        fontSize: 8.5,
        cellPadding: 5,
        textColor: [51, 65, 85],
        font: 'helvetica'
      },
      headStyles: {
        fillColor: [30, 41, 59], // slate-800
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // slate-50
      },
      margin: { left: 40, right: 40 }
    });

    // 4. Download PDF
    doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
  }

  /**
   * Export dataset to Microsoft Excel (.xlsx) using SheetJS
   */
  static exportToExcel(dataset: Dataset, filename = 'intactbi_report.xlsx'): void {
    if (!dataset || !dataset.data || dataset.data.length === 0) return;

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataset.data);

    // Auto calculate column widths
    const colWidths = Object.keys(dataset.data[0] || {}).map(key => {
      const maxLen = Math.max(
        key.length,
        ...dataset.data.slice(0, 50).map(r => String(r[key] ?? '').length)
      );
      return { wch: Math.min(Math.max(maxLen + 4, 12), 40) };
    });
    worksheet['!cols'] = colWidths;

    // Create workbook and append worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report_Data');

    // Download file
    XLSX.writeFile(workbook, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
  }

  /**
   * Export dataset to CSV
   */
  static exportToCsv(dataset: Dataset, filename = 'intactbi_data.csv'): void {
    if (!dataset || !dataset.data || dataset.data.length === 0) return;

    const headers = Object.keys(dataset.data[0]);
    const csvRows = [
      headers.join(','),
      ...dataset.data.map(row => 
        headers.map(h => {
          const val = row[h] ?? '';
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        }).join(',')
      )
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Generate valid JasperReports JRXML XML representation from the visual report model
   */
  static generateJrxml(report: ReportDefinition, dataset: Dataset): string {
    const fieldsXml = (dataset?.fields || []).map(f => {
      const javaType = f.dataType === 'number' 
        ? 'java.math.BigDecimal' 
        : f.dataType === 'date' 
        ? 'java.sql.Date' 
        : 'java.lang.String';
      return `\t<field name="${f.name}" class="${javaType}"/>`;
    }).join('\n');

    const paramsXml = (report.parameters || []).map(p => 
      `\t<parameter name="${p.name}" class="${p.type}">\n\t\t<defaultValueExpression><![CDATA["${p.defaultValue}"]]></defaultValueExpression>\n\t</parameter>`
    ).join('\n');

    const variablesXml = (report.variables || []).map(v => 
      `\t<variable name="${v.name}" class="java.math.BigDecimal" calculation="${v.calculation}">\n\t\t<variableExpression><![CDATA[${v.expression}]]></variableExpression>\n\t</variable>`
    ).join('\n');

    // Generate band XML elements
    const renderBandElements = (bandType: string) => {
      const bandEls = report.elements.filter(e => e.band === bandType);
      return bandEls.map(el => {
        if (el.type === 'staticText') {
          return `\t\t\t<staticText>
\t\t\t\t<reportElement x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" forecolor="${el.textColor || '#000000'}"/>
\t\t\t\t<textElement textAlignment="${(el.alignment || 'left').toUpperCase()}">
\t\t\t\t\t<font fontName="SansSerif" size="${el.fontSize || 10}" isBold="${Boolean(el.fontBold)}" isItalic="${Boolean(el.fontItalic)}"/>
\t\t\t\t</textElement>
\t\t\t\t<text><![CDATA[${el.text || ''}]]></text>
\t\t\t</staticText>`;
        } else if (el.type === 'textField') {
          return `\t\t\t<textField ${el.formatPattern ? `pattern="${el.formatPattern}"` : ''}>
\t\t\t\t<reportElement x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" forecolor="${el.textColor || '#000000'}"/>
\t\t\t\t<textElement textAlignment="${(el.alignment || 'left').toUpperCase()}">
\t\t\t\t\t<font fontName="SansSerif" size="${el.fontSize || 9}" isBold="${Boolean(el.fontBold)}"/>
\t\t\t\t</textElement>
\t\t\t\t<textFieldExpression><![CDATA[${el.fieldExpression || `"${el.text || ''}"`}]]></textFieldExpression>
\t\t\t</textField>`;
        }
        return '';
      }).filter(Boolean).join('\n');
    };

    return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Created with IntactBI Studio Visual Designer & JasperReports Library 6.21 -->
<jasperReport xmlns="http://jasperreports.sourceforge.net/jasperreports" 
              xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
              xsi:schemaLocation="http://jasperreports.sourceforge.net/jasperreports http://jasperreports.sourceforge.net/xsd/jasperreport.xsd" 
              name="${report.name.replace(/[^a-zA-Z0-9_]/g, '_')}" 
              pageWidth="${report.pageWidth}" 
              pageHeight="${report.pageHeight}" 
              orientation="${report.orientation.toUpperCase()}" 
              columnWidth="${report.pageWidth - report.leftMargin - report.rightMargin}" 
              leftMargin="${report.leftMargin}" 
              rightMargin="${report.rightMargin}" 
              topMargin="${report.topMargin}" 
              bottomMargin="${report.bottomMargin}" 
              uuid="intactbi-${report.id}">
              
\t<property name="ireport.zoom" value="1.0"/>
\t<property name="com.jaspersoft.studio.data.defaultdataadapter" value="${dataset?.dataSourceName || 'PostgreSQL'}"/>
\t<property name="net.sf.jasperreports.export.xlsx.detect.cell.type" value="true"/>

${paramsXml}

\t<queryString>
\t\t<![CDATA[${dataset?.queryOrTable || 'SELECT * FROM data'}]]>
\t</queryString>

${fieldsXml}

${variablesXml}

\t<title>
\t\t<band height="${report.bands.title.height}" splitType="Stretch">
${renderBandElements('title')}
\t\t</band>
\t</title>

\t<pageHeader>
\t\t<band height="${report.bands.pageHeader.height}" splitType="Stretch">
${renderBandElements('pageHeader')}
\t\t</band>
\t</pageHeader>

\t<columnHeader>
\t\t<band height="${report.bands.columnHeader.height}" splitType="Stretch">
${renderBandElements('columnHeader')}
\t\t</band>
\t</columnHeader>

\t<detail>
\t\t<band height="${report.bands.detail.height}" splitType="Stretch">
${renderBandElements('detail')}
\t\t</band>
\t</detail>

\t<pageFooter>
\t\t<band height="${report.bands.pageFooter.height}" splitType="Stretch">
${renderBandElements('pageFooter')}
\t\t</band>
\t</pageFooter>

\t<summary>
\t\t<band height="${report.bands.summary.height}" splitType="Stretch">
${renderBandElements('summary')}
\t\t</band>
\t</summary>
</jasperReport>`;
  }

  /**
   * Download JRXML file
   */
  static downloadJrxml(report: ReportDefinition, dataset: Dataset): void {
    const xml = this.generateJrxml(report, dataset);
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${report.name.replace(/[^a-zA-Z0-9_]/g, '_')}.jrxml`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
