package com.inventory.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDTO {
    private Long id;
    
    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 3, max = 50)
    private String nombre;
    
    @Size(max = 200)
    private String descripcion;
    
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    private Integer totalProductos;
}