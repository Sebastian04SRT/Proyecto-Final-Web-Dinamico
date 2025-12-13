package com.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {
    private Long totalProductos;
    private Long totalCategorias;
    private Long productosBajoStock;
    private BigDecimal valorTotalInventario;
}