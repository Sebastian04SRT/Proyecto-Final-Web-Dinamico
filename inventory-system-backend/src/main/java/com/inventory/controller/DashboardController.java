package com.inventory.controller;

import com.inventory.dto.DashboardDTO;
import com.inventory.service.impl.DashboardServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Dashboard", description = "API para métricas del dashboard")
public class DashboardController {
    
    private final DashboardServiceImpl dashboardService;
    
    @GetMapping("/metrics")
    @Operation(summary = "Obtener métricas del dashboard")
    public ResponseEntity<DashboardDTO> getDashboardMetrics() {
        DashboardDTO metrics = dashboardService.getDashboardMetrics();
        return ResponseEntity.ok(metrics);
    }
}