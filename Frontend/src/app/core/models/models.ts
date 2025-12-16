// src/app/core/models/models.ts

export interface Product {
  id?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stockActual: number;
  stockMinimo: number;
  categoriaId: number;
  categoriaNombre?: string;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
  bajoStock?: boolean;
}

export interface Category {
  id?: number;
  nombre: string;
  descripcion?: string;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
  totalProductos?: number;
}

export interface StockMovement {
  id?: number;
  productoId: number;
  productoNombre?: string;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  cantidad: number;
  stockAnterior?: number;
  stockNuevo?: number;
  motivo?: string;
  fechaMovimiento?: Date;
}

export interface Dashboard {
  totalProductos: number;
  totalCategorias: number;
  productosBajoStock: number;
  valorTotalInventario: number;
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}