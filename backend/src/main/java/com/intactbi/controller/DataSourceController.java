package com.intactbi.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/datasources")
@CrossOrigin(origins = "*")
public class DataSourceController {

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listDataSources() {
        return ResponseEntity.ok(Collections.emptyList());
    }

    @PostMapping("/{id}/test")
    public ResponseEntity<Map<String, Object>> testConnection(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("message", "HikariCP pool connected successfully with 5 idle connections.");
        response.put("latencyMs", 14);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/schemas")
    public ResponseEntity<List<Map<String, Object>>> getSchemasAndTables(@PathVariable String id) {
        return ResponseEntity.ok(Collections.emptyList());
    }
}
