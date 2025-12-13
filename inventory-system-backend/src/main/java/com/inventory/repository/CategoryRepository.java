package com.inventory.repository;

import com.inventory.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    Optional<Category> findByNombreIgnoreCase(String nombre);
    
    boolean existsByNombreIgnoreCase(String nombre);
    
    Page<Category> findByNombreContainingIgnoreCase(String nombre, Pageable pageable);
    
    @Query("SELECT c FROM Category c LEFT JOIN FETCH c.productos")
    Page<Category> findAllWithProducts(Pageable pageable);
}