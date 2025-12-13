package com.inventory.service.impl;

import com.inventory.dto.ProductDTO;
import com.inventory.entity.Category;
import com.inventory.entity.Product;
import com.inventory.entity.StockMovement;
import com.inventory.repository.CategoryRepository;
import com.inventory.repository.ProductRepository;
import com.inventory.repository.StockMovementRepository;
import com.inventory.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {
    
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final StockMovementRepository stockMovementRepository;
    
    @Override
    public ProductDTO createProduct(ProductDTO productDTO) {
        Category category = categoryRepository.findById(productDTO.getCategoriaId())
            .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        
        Product product = new Product();
        product.setNombre(productDTO.getNombre());
        product.setDescripcion(productDTO.getDescripcion());
        product.setPrecio(productDTO.getPrecio());
        product.setStockActual(productDTO.getStockActual());
        product.setStockMinimo(productDTO.getStockMinimo() != null ? productDTO.getStockMinimo() : 5);
        product.setCategoria(category);
        
        Product savedProduct = productRepository.save(product);
        
        // Registrar movimiento inicial
        if (savedProduct.getStockActual() > 0) {
            StockMovement movement = new StockMovement();
            movement.setProducto(savedProduct);
            movement.setTipo(StockMovement.TipoMovimiento.ENTRADA);
            movement.setCantidad(savedProduct.getStockActual());
            movement.setStockAnterior(0);
            movement.setStockNuevo(savedProduct.getStockActual());
            movement.setMotivo("Stock inicial");
            stockMovementRepository.save(movement);
        }
        
        return convertToDTO(savedProduct);
    }
    
    @Override
    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        
        Category category = categoryRepository.findById(productDTO.getCategoriaId())
            .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        
        product.setNombre(productDTO.getNombre());
        product.setDescripcion(productDTO.getDescripcion());
        product.setPrecio(productDTO.getPrecio());
        product.setStockMinimo(productDTO.getStockMinimo());
        product.setCategoria(category);
        
        Product updatedProduct = productRepository.save(product);
        return convertToDTO(updatedProduct);
    }
    
    @Override
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        productRepository.delete(product);
    }
    
    @Override
    @Transactional(readOnly = true)
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        return convertToDTO(product);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<ProductDTO> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable).map(this::convertToDTO);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<ProductDTO> searchProducts(String search, Pageable pageable) {
        if (search == null || search.trim().isEmpty()) {
            return getAllProducts(pageable);
        }
        return productRepository.searchProducts(search.trim(), pageable).map(this::convertToDTO);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<ProductDTO> getProductsByCategory(Long categoriaId, Pageable pageable) {
        return productRepository.findByCategoriaId(categoriaId, pageable).map(this::convertToDTO);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getProductsBajoStock() {
        return productRepository.findProductsBajoStock()
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    public void updateStock(Long id, Integer cantidad, String tipo, String motivo) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        
        Integer stockAnterior = product.getStockActual();
        Integer stockNuevo;
        
        StockMovement.TipoMovimiento tipoMovimiento = StockMovement.TipoMovimiento.valueOf(tipo.toUpperCase());
        
        switch (tipoMovimiento) {
            case ENTRADA:
                stockNuevo = stockAnterior + cantidad;
                break;
            case SALIDA:
                if (stockAnterior < cantidad) {
                    throw new RuntimeException("Stock insuficiente");
                }
                stockNuevo = stockAnterior - cantidad;
                break;
            case AJUSTE:
                stockNuevo = cantidad;
                cantidad = Math.abs(stockNuevo - stockAnterior);
                break;
            default:
                throw new RuntimeException("Tipo de movimiento inválido");
        }
        
        product.setStockActual(stockNuevo);
        productRepository.save(product);
        
        StockMovement movement = new StockMovement();
        movement.setProducto(product);
        movement.setTipo(tipoMovimiento);
        movement.setCantidad(cantidad);
        movement.setStockAnterior(stockAnterior);
        movement.setStockNuevo(stockNuevo);
        movement.setMotivo(motivo);
        stockMovementRepository.save(movement);
    }
    
    private ProductDTO convertToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setNombre(product.getNombre());
        dto.setDescripcion(product.getDescripcion());
        dto.setPrecio(product.getPrecio());
        dto.setStockActual(product.getStockActual());
        dto.setStockMinimo(product.getStockMinimo());
        dto.setCategoriaId(product.getCategoria().getId());
        dto.setCategoriaNombre(product.getCategoria().getNombre());
        dto.setFechaCreacion(product.getFechaCreacion());
        dto.setFechaActualizacion(product.getFechaActualizacion());
        dto.setBajoStock(product.isBajoStock());
        return dto;
    }
}