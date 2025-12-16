// src/app/features/products/product-list/product-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Product, Category, PageResponse } from '../../../core/models/models';
import { ProductFormComponent } from '../product-form/product-form.component';
import { StockDialogComponent } from '../stock-dialog/stock-dialog.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <div class="product-list-container">
      <div class="header">
        <h1>Gestión de Productos</h1>
        <button mat-raised-button color="primary" (click)="openProductDialog()">
          <mat-icon>add</mat-icon>
          Nuevo Producto
        </button>
      </div>
      
      <div class="filters">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Buscar productos</mat-label>
          <input matInput [(ngModel)]="searchQuery" (keyup.enter)="searchProducts()" placeholder="Nombre o descripción">
          <button mat-icon-button matSuffix (click)="searchProducts()">
            <mat-icon>search</mat-icon>
          </button>
        </mat-form-field>
        
        <mat-form-field appearance="outline">
          <mat-label>Filtrar por categoría</mat-label>
          <mat-select [(ngModel)]="selectedCategory" (selectionChange)="filterByCategory()">
            <mat-option [value]="null">Todas las categorías</mat-option>
            <mat-option *ngFor="let category of categories" [value]="category.id">
              {{category.nombre}}
            </mat-option>
          </mat-select>
        </mat-form-field>
        
        <button mat-raised-button (click)="clearFilters()">
          <mat-icon>clear</mat-icon>
          Limpiar Filtros
        </button>
      </div>
      
      <div class="table-container">
        <table mat-table [dataSource]="products" class="mat-elevation-z2">
          <ng-container matColumnDef="nombre">
            <th mat-header-cell *matHeaderCellDef>Nombre</th>
            <td mat-cell *matCellDef="let product">{{product.nombre}}</td>
          </ng-container>
          
          <ng-container matColumnDef="descripcion">
            <th mat-header-cell *matHeaderCellDef>Descripción</th>
            <td mat-cell *matCellDef="let product">{{product.descripcion}}</td>
          </ng-container>
          
          <ng-container matColumnDef="categoria">
            <th mat-header-cell *matHeaderCellDef>Categoría</th>
            <td mat-cell *matCellDef="let product">
              <mat-chip>{{product.categoriaNombre}}</mat-chip>
            </td>
          </ng-container>
          
          <ng-container matColumnDef="precio">
            <th mat-header-cell *matHeaderCellDef>Precio</th>
            <td mat-cell *matCellDef="let product">\${{product.precio | number:'1.2-2'}}</td>
          </ng-container>
          
          <ng-container matColumnDef="stock">
            <th mat-header-cell *matHeaderCellDef>Stock</th>
            <td mat-cell *matCellDef="let product">
              <span [class.low-stock]="product.bajoStock">
                {{product.stockActual}}
              </span>
            </td>
          </ng-container>
          
          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef>Acciones</th>
            <td mat-cell *matCellDef="let product">
              <button mat-icon-button color="primary" (click)="openStockDialog(product)" matTooltip="Actualizar Stock">
                <mat-icon>inventory</mat-icon>
              </button>
              <button mat-icon-button color="accent" (click)="editProduct(product)" matTooltip="Editar">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteProduct(product)" matTooltip="Eliminar">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>
          
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        
        <mat-paginator 
          [length]="totalElements"
          [pageSize]="pageSize"
          [pageSizeOptions]="[5, 10, 25, 50]"
          (page)="onPageChange($event)"
          showFirstLastButtons>
        </mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .product-list-container {
      padding: 20px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .filters {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
      align-items: center;
      flex-wrap: wrap;
    }
    .search-field {
      flex: 1;
      min-width: 300px;
    }
    .table-container {
      background: white;
      border-radius: 4px;
    }
    table {
      width: 100%;
    }
    .low-stock {
      color: #f44336;
      font-weight: bold;
    }
    mat-chip {
      font-size: 12px;
    }
  `]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  displayedColumns = ['nombre', 'descripcion', 'categoria', 'precio', 'stock', 'acciones'];
  
  searchQuery = '';
  selectedCategory: number | null = null;
  
  pageSize = 10;
  pageIndex = 0;
  totalElements = 0;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.productService.getAllProducts(this.pageIndex, this.pageSize).subscribe({
      next: (response: PageResponse<Product>) => {
        this.products = response.content;
        this.totalElements = response.totalElements;
      },
      error: (err) => this.showError('Error al cargar productos')
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategories(0, 100).subscribe({
      next: (response) => {
        this.categories = response.content;
      },
      error: (err) => this.showError('Error al cargar categorías')
    });
  }

  searchProducts(): void {
    if (this.searchQuery.trim()) {
      this.productService.searchProducts(this.searchQuery, this.pageIndex, this.pageSize).subscribe({
        next: (response) => {
          this.products = response.content;
          this.totalElements = response.totalElements;
        },
        error: (err) => this.showError('Error en la búsqueda')
      });
    } else {
      this.loadProducts();
    }
  }

  filterByCategory(): void {
    if (this.selectedCategory) {
      this.productService.getProductsByCategory(this.selectedCategory, this.pageIndex, this.pageSize).subscribe({
        next: (response) => {
          this.products = response.content;
          this.totalElements = response.totalElements;
        },
        error: (err) => this.showError('Error al filtrar')
      });
    } else {
      this.loadProducts();
    }
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = null;
    this.pageIndex = 0;
    this.loadProducts();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProducts();
  }

  openProductDialog(product?: Product): void {
    const dialogRef = this.dialog.open(ProductFormComponent, {
      width: '600px',
      data: { product, categories: this.categories }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProducts();
      }
    });
  }

  openStockDialog(product: Product): void {
    const dialogRef = this.dialog.open(StockDialogComponent, {
      width: '500px',
      data: { product }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProducts();
      }
    });
  }

  editProduct(product: Product): void {
    this.openProductDialog(product);
  }

  deleteProduct(product: Product): void {
    if (confirm(`¿Está seguro de eliminar el producto "${product.nombre}"?`)) {
      this.productService.deleteProduct(product.id!).subscribe({
        next: () => {
          this.showSuccess('Producto eliminado exitosamente');
          this.loadProducts();
        },
        error: (err) => this.showError('Error al eliminar producto')
      });
    }
  }

  showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 3000 });
  }

  showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 5000, panelClass: ['error-snackbar'] });
  }
}