package com.inventory.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockMovementDTO {
    private Long id;
    
    @NotNull
    private Long productoId;
    
    private String productoNombre;
    
    @NotNull
    private String tipo;
    
    @NotNull
    @Min(1)
    private Integer cantidad;
    
    private Integer stockAnterior;
    private Integer stockNuevo;
    
    @Size(max = 300)
    private String motivo;
    
    private LocalDateTime fechaMovimiento;
}