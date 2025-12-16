// src/app/features/categories/category-list/category-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/models';
import { CategoryFormComponent } from '../category-form/category-form.component';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,
    MatTooltipModule
  ],
  template: `
    <div class="category-list-container">
      <div class="header">
        <h1>Gestión de Categorías</h1>
        <button mat-raised-button color="primary" (click)="openCategoryDialog()">
          <mat-icon>add</mat-icon>
          Nueva Categoría
        </button>
      </div>
      
      <mat-card>
        <mat-card-content>
          <table mat-table [dataSource]="categories" class="mat-elevation-z0">
            <ng-container matColumnDef="nombre">
              <th mat-header-cell *matHeaderCellDef>Nombre</th>
              <td mat-cell *matCellDef="let category">{{category.nombre}}</td>
            </ng-container>
            
            <ng-container matColumnDef="descripcion">
              <th mat-header-cell *matHeaderCellDef>Descripción</th>
              <td mat-cell *matCellDef="let category">{{category.descripcion || '-'}}</td>
            </ng-container>
            
            <ng-container matColumnDef="totalProductos">
              <th mat-header-cell *matHeaderCellDef>Total Productos</th>
              <td mat-cell *matCellDef="let category">{{category.totalProductos || 0}}</td>
            </ng-container>
            
            <ng-container matColumnDef="fechaCreacion">
              <th mat-header-cell *matHeaderCellDef>Fecha Creación</th>
              <td mat-cell *matCellDef="let category">{{category.fechaCreacion | date:'short'}}</td>
            </ng-container>
            
            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let category">
                <button mat-icon-button color="accent" (click)="editCategory(category)" matTooltip="Editar">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteCategory(category)" matTooltip="Eliminar">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>
            
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .category-list-container {
      padding: 20px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
    }
  `]
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  displayedColumns = ['nombre', 'descripcion', 'totalProductos', 'fechaCreacion', 'acciones'];

  constructor(
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (response) => {
        this.categories = response.content;
      },
      error: (err) => this.showError('Error al cargar categorías')
    });
  }

  openCategoryDialog(category?: Category): void {
    const dialogRef = this.dialog.open(CategoryFormComponent, {
      width: '500px',
      data: { category }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCategories();
      }
    });
  }

  editCategory(category: Category): void {
    this.openCategoryDialog(category);
  }

  deleteCategory(category: Category): void {
    if (confirm(`¿Está seguro de eliminar la categoría "${category.nombre}"?`)) {
      this.categoryService.deleteCategory(category.id!).subscribe({
        next: () => {
          this.showSuccess('Categoría eliminada exitosamente');
          this.loadCategories();
        },
        error: (err) => {
          this.showError(err.error?.message || 'Error al eliminar categoría');
        }
      });
    }
  }

  showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 3000 });
  }

  showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 5000 });
  }
}