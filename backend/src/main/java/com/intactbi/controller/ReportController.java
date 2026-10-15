package com.intactbi.controller;

import com.intactbi.service.JasperReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private JasperReportService jasperReportService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listReports() {
        return ResponseEntity.ok(Collections.emptyList());
    }

    @PostMapping("/{id}/export")
    public ResponseEntity<byte[]> exportReport(
            @PathVariable String id,
            @RequestParam(defaultValue = "pdf") String format,
            @RequestBody(required = false) Map<String, Object> parameters) {
        
        try {
            byte[] mockReport = "PDF Document Content".getBytes();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"report_" + id + "." + format + "\"")
                    .contentType(format.equalsIgnoreCase("xlsx") 
                            ? MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                            : MediaType.APPLICATION_PDF)
                    .body(mockReport);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
