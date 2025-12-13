package com.inventory.service.impl;

import com.inventory.dto.DashboardDTO;
import com.inventory.repository.CategoryRepository;
import com.inventory.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl {
    
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    
    public DashboardDTO getDashboardMetrics() {
        DashboardDTO dashboard = new DashboardDTO();
        
        dashboard.setTotalProductos(productRepository.count());
        dashboard.setTotalCategorias(categoryRepository.count());
        dashboard.setProductosBajoStock(productRepository.countProductsBajoStock());
        
        BigDecimal valorTotal = productRepository.calculateTotalInventoryValue();
        dashboard.setValorTotalInventario(valorTotal != null ? valorTotal : BigDecimal.ZERO);
        
        return dashboard;
    }
}