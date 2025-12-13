package com.inventory.service.impl;

import com.inventory.dto.CategoryDTO;
import com.inventory.entity.Category;
import com.inventory.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl {
    
    private final CategoryRepository categoryRepository;
    
    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        if (categoryRepository.existsByNombreIgnoreCase(categoryDTO.getNombre())) {
            throw new RuntimeException("Ya existe una categoría con ese nombre");
        }
        
        Category category = new Category();
        category.setNombre(categoryDTO.getNombre());
        category.setDescripcion(categoryDTO.getDescripcion());
        
        Category savedCategory = categoryRepository.save(category);
        return convertToDTO(savedCategory);
    }
    
    public CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        
        if (!category.getNombre().equalsIgnoreCase(categoryDTO.getNombre()) &&
            categoryRepository.existsByNombreIgnoreCase(categoryDTO.getNombre())) {
            throw new RuntimeException("Ya existe una categoría con ese nombre");
        }
        
        category.setNombre(categoryDTO.getNombre());
        category.setDescripcion(categoryDTO.getDescripcion());
        
        Category updatedCategory = categoryRepository.save(category);
        return convertToDTO(updatedCategory);
    }
    
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        
        if (!category.getProductos().isEmpty()) {
            throw new RuntimeException("No se puede eliminar una categoría con productos asociados");
        }
        
        categoryRepository.delete(category);
    }
    
    @Transactional(readOnly = true)
    public CategoryDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        return convertToDTO(category);
    }
    
    @Transactional(readOnly = true)
    public Page<CategoryDTO> getAllCategories(Pageable pageable) {
        return categoryRepository.findAll(pageable).map(this::convertToDTO);
    }
    
    private CategoryDTO convertToDTO(Category category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(category.getId());
        dto.setNombre(category.getNombre());
        dto.setDescripcion(category.getDescripcion());
        dto.setFechaCreacion(category.getFechaCreacion());
        dto.setFechaActualizacion(category.getFechaActualizacion());
        dto.setTotalProductos(category.getProductos().size());
        return dto;
    }
}