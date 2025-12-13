package com.inventory.controller;

import com.inventory.dto.StockMovementDTO;
import com.inventory.entity.StockMovement;
import com.inventory.repository.StockMovementRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stock-movements")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Movimientos de Stock", description = "API para consultar movimientos de inventario")
public class StockMovementController {
    
    private final StockMovementRepository stockMovementRepository;
    
    @GetMapping
    @Operation(summary = "Obtener todos los movimientos de stock")
    public ResponseEntity<Page<StockMovementDTO>> getAllMovements(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<StockMovementDTO> movements = stockMovementRepository
            .findAllOrderByFechaDesc(pageable)
            .map(this::convertToDTO);
        return ResponseEntity.ok(movements);
    }
    
    @GetMapping("/product/{productoId}")
    @Operation(summary = "Obtener movimientos de un producto específico")
    public ResponseEntity<List<StockMovementDTO>> getMovementsByProduct(@PathVariable Long productoId) {
        List<StockMovementDTO> movements = stockMovementRepository
            .findByProductoIdOrderByFechaMovimientoDesc(productoId)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(movements);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Obtener un movimiento por ID")
    public ResponseEntity<StockMovementDTO> getMovementById(@PathVariable Long id) {
        StockMovement movement = stockMovementRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Movimiento no encontrado"));
        return ResponseEntity.ok(convertToDTO(movement));
    }
    
    private StockMovementDTO convertToDTO(StockMovement movement) {
        StockMovementDTO dto = new StockMovementDTO();
        dto.setId(movement.getId());
        dto.setProductoId(movement.getProducto().getId());
        dto.setProductoNombre(movement.getProducto().getNombre());
        dto.setTipo(movement.getTipo().name());
        dto.setCantidad(movement.getCantidad());
        dto.setStockAnterior(movement.getStockAnterior());
        dto.setStockNuevo(movement.getStockNuevo());
        dto.setMotivo(movement.getMotivo());
        dto.setFechaMovimiento(movement.getFechaMovimiento());
        return dto;
    }
}