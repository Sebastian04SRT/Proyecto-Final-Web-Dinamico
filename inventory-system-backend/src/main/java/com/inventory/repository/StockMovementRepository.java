package com.inventory.repository;

import com.inventory.entity.StockMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    
    Page<StockMovement> findByProductoId(Long productoId, Pageable pageable);
    
    List<StockMovement> findByProductoIdOrderByFechaMovimientoDesc(Long productoId);
    
    @Query("SELECT sm FROM StockMovement sm WHERE sm.fechaMovimiento BETWEEN :startDate AND :endDate")
    List<StockMovement> findByDateRange(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    @Query("SELECT sm FROM StockMovement sm ORDER BY sm.fechaMovimiento DESC")
    Page<StockMovement> findAllOrderByFechaDesc(Pageable pageable);
    
    @Query("SELECT sm FROM StockMovement sm WHERE sm.producto.id = :productoId " +
           "ORDER BY sm.fechaMovimiento DESC")
    List<StockMovement> findTop10ByProductoId(@Param("productoId") Long productoId, Pageable pageable);
}