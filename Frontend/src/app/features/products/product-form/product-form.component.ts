// src/app/features/products/product-form/product-form.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductService } from '../../../core/services/product.service';
import { Product, Category } from '../../../core/models/models';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title>{{isEditMode ? 'Editar Producto' : 'Nuevo Producto'}}</h2>
    
    <mat-dialog-content>
      <form [formGroup]="productForm" class="product-form">
        <mat-form-field appearance="outline">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="nombre" placeholder="Nombre del producto">
          <mat-error *ngIf="productForm.get('nombre')?.hasError('required')">
            El nombre es obligatorio
          </mat-error>
          <mat-error *ngIf="productForm.get('nombre')?.hasError('minlength')">
            Mínimo 3 caracteres
          </mat-error>
        </mat-form-field>
        
        <mat-form-field appearance="outline">
          <mat-label>Descripción</mat-label>
          <textarea matInput formControlName="descripcion" rows="3" placeholder="Descripción del producto"></textarea>
          <mat-error *ngIf="productForm.get('descripcion')?.hasError('required')">
            La descripción es obligatoria
          </mat-error>
        </mat-form-field>
        
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Categoría</mat-label>
            <mat-select formControlName="categoriaId">
              <mat-option *ngFor="let category of data.categories" [value]="category.id">
                {{category.nombre}}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="productForm.get('categoriaId')?.hasError('required')">
              La categoría es obligatoria
            </mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline">
            <mat-label>Precio</mat-label>
            <input matInput type="number" formControlName="precio" placeholder="0.00" step="0.01">
            <span matPrefix>$&nbsp;</span>
            <mat-error *ngIf="productForm.get('precio')?.hasError('required')">
              El precio es obligatorio
            </mat-error>
            <mat-error *ngIf="productForm.get('precio')?.hasError('min')">
              El precio debe ser mayor a 0
            </mat-error>
          </mat-form-field>
        </div>
        
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Stock Actual</mat-label>
            <input matInput type="number" formControlName="stockActual" [readonly]="isEditMode">
            <mat-error *ngIf="productForm.get('stockActual')?.hasError('required')">
              El stock es obligatorio
            </mat-error>
            <mat-error *ngIf="productForm.get('stockActual')?.hasError('min')">
              El stock no puede ser negativo
            </mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline">
            <mat-label>Stock Mínimo</mat-label>
            <input matInput type="number" formControlName="stockMinimo">
            <mat-error *ngIf="productForm.get('stockMinimo')?.hasError('min')">
              El stock mínimo no puede ser negativo
            </mat-error>
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="productForm.invalid">
        {{isEditMode ? 'Actualizar' : 'Crear'}}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .product-form {
      display: flex;
      flex-direction: column;
      gap: 15px;
      min-width: 500px;
      padding: 20px 0;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    mat-form-field {
      width: 100%;
    }
  `]
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private dialogRef: MatDialogRef<ProductFormComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { product?: Product, categories: Category[] }
  ) {
    this.productForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.maxLength(500)]],
      categoriaId: ['', Validators.required],
      precio: ['', [Validators.required, Validators.min(0.01)]],
      stockActual: ['', [Validators.required, Validators.min(0)]],
      stockMinimo: [5, [Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    if (this.data.product) {
      this.isEditMode = true;
      this.productForm.patchValue(this.data.product);
    }
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const productData: Product = this.productForm.value;
      
      if (this.isEditMode && this.data.product?.id) {
        this.productService.updateProduct(this.data.product.id, productData).subscribe({
          next: () => {
            this.showSuccess('Producto actualizado exitosamente');
            this.dialogRef.close(true);
          },
          error: (err) => this.showError('Error al actualizar producto')
        });
      } else {
        this.productService.createProduct(productData).subscribe({
          next: () => {
            this.showSuccess('Producto creado exitosamente');
            this.dialogRef.close(true);
          },
          error: (err) => this.showError('Error al crear producto')
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 3000 });
  }

  showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 5000 });
  }
}