package com.inventory.service;

import com.inventory.dto.ProductDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface ProductService {
    ProductDTO createProduct(ProductDTO productDTO);
    ProductDTO updateProduct(Long id, ProductDTO productDTO);
    void deleteProduct(Long id);
    ProductDTO getProductById(Long id);
    Page<ProductDTO> getAllProducts(Pageable pageable);
    Page<ProductDTO> searchProducts(String search, Pageable pageable);
    Page<ProductDTO> getProductsByCategory(Long categoriaId, Pageable pageable);
    List<ProductDTO> getProductsBajoStock();
    void updateStock(Long id, Integer cantidad, String tipo, String motivo);
}