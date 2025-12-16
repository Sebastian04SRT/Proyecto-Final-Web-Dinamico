// src/app/features/categories/category-form/category-form.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/models';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title>{{isEditMode ? 'Editar Categoría' : 'Nueva Categoría'}}</h2>
    
    <mat-dialog-content>
      <form [formGroup]="categoryForm" class="category-form">
        <mat-form-field appearance="outline">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="nombre" placeholder="Nombre de la categoría">
          <mat-error *ngIf="categoryForm.get('nombre')?.hasError('required')">
            El nombre es obligatorio
          </mat-error>
          <mat-error *ngIf="categoryForm.get('nombre')?.hasError('minlength')">
            Mínimo 3 caracteres
          </mat-error>
        </mat-form-field>
        
        <mat-form-field appearance="outline">
          <mat-label>Descripción</mat-label>
          <textarea matInput formControlName="descripcion" rows="3" placeholder="Descripción de la categoría (opcional)"></textarea>
          <mat-error *ngIf="categoryForm.get('descripcion')?.hasError('maxlength')">
            Máximo 200 caracteres
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="categoryForm.invalid">
        {{isEditMode ? 'Actualizar' : 'Crear'}}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .category-form {
      display: flex;
      flex-direction: column;
      gap: 15px;
      min-width: 400px;
      padding: 20px 0;
    }
    mat-form-field {
      width: 100%;
    }
  `]
})
export class CategoryFormComponent implements OnInit {
  categoryForm: FormGroup;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private dialogRef: MatDialogRef<CategoryFormComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { category?: Category }
  ) {
    this.categoryForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      descripcion: ['', [Validators.maxLength(200)]]
    });
  }

  ngOnInit(): void {
    if (this.data.category) {
      this.isEditMode = true;
      this.categoryForm.patchValue(this.data.category);
    }
  }

  onSubmit(): void {
    if (this.categoryForm.valid) {
      const categoryData: Category = this.categoryForm.value;
      
      if (this.isEditMode && this.data.category?.id) {
        this.categoryService.updateCategory(this.data.category.id, categoryData).subscribe({
          next: () => {
            this.showSuccess('Categoría actualizada exitosamente');
            this.dialogRef.close(true);
          },
          error: (err) => this.showError(err.error?.message || 'Error al actualizar categoría')
        });
      } else {
        this.categoryService.createCategory(categoryData).subscribe({
          next: () => {
            this.showSuccess('Categoría creada exitosamente');
            this.dialogRef.close(true);
          },
          error: (err) => this.showError(err.error?.message || 'Error al crear categoría')
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