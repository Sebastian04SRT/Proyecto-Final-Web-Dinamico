package com.inventory.repository;

import com.inventory.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    Page<Product> findByNombreContainingIgnoreCase(String nombre, Pageable pageable);
    
    Page<Product> findByCategoriaId(Long categoriaId, Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE " +
           "LOWER(p.nombre) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.descripcion) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Product> searchProducts(@Param("search") String search, Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE p.stockActual <= p.stockMinimo")
    List<Product> findProductsBajoStock();
    
    @Query("SELECT COUNT(p) FROM Product p WHERE p.stockActual <= p.stockMinimo")
    Long countProductsBajoStock();
    
    @Query("SELECT SUM(p.precio * p.stockActual) FROM Product p")
    BigDecimal calculateTotalInventoryValue();
    
    @Query("SELECT p FROM Product p WHERE p.categoria.id = :categoriaId AND " +
           "(LOWER(p.nombre) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.descripcion) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> searchProductsByCategory(
        @Param("categoriaId") Long categoriaId,
        @Param("search") String search,
        Pageable pageable
    );
}