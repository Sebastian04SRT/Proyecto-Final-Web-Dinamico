// src/app/features/products/stock-dialog/stock-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/models';

@Component({
  selector: 'app-stock-dialog',
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
    <h2 mat-dialog-title>Actualizar Stock - {{data.product.nombre}}</h2>
    
    <mat-dialog-content>
      <div class="stock-info">
        <p><strong>Stock Actual:</strong> {{data.product.stockActual}}</p>
        <p><strong>Stock Mínimo:</strong> {{data.product.stockMinimo}}</p>
      </div>
      
      <form [formGroup]="stockForm" class="stock-form">
        <mat-form-field appearance="outline">
          <mat-label>Tipo de Movimiento</mat-label>
          <mat-select formControlName="tipo">
            <mat-option value="ENTRADA">Entrada (Agregar stock)</mat-option>
            <mat-option value="SALIDA">Salida (Restar stock)</mat-option>
            <mat-option value="AJUSTE">Ajuste (Establecer cantidad exacta)</mat-option>
          </mat-select>
          <mat-error *ngIf="stockForm.get('tipo')?.hasError('required')">
            Seleccione un tipo de movimiento
          </mat-error>
        </mat-form-field>
        
        <mat-form-field appearance="outline">
          <mat-label>Cantidad</mat-label>
          <input matInput type="number" formControlName="cantidad" placeholder="0">
          <mat-error *ngIf="stockForm.get('cantidad')?.hasError('required')">
            La cantidad es obligatoria
          </mat-error>
          <mat-error *ngIf="stockForm.get('cantidad')?.hasError('min')">
            La cantidad debe ser mayor a 0
          </mat-error>
        </mat-form-field>
        
        <mat-form-field appearance="outline">
          <mat-label>Motivo</mat-label>
          <textarea matInput formControlName="motivo" rows="3" placeholder="Describa el motivo del movimiento"></textarea>
          <mat-error *ngIf="stockForm.get('motivo')?.hasError('required')">
            El motivo es obligatorio
          </mat-error>
        </mat-form-field>
        
        <div class="preview" *ngIf="stockForm.valid && stockForm.get('tipo')?.value && stockForm.get('cantidad')?.value">
          <p><strong>Stock resultante:</strong> {{calculateNewStock()}}</p>
        </div>
      </form>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="stockForm.invalid">
        Actualizar Stock
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .stock-info {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
    .stock-info p {
      margin: 5px 0;
    }
    .stock-form {
      display: flex;
      flex-direction: column;
      gap: 15px;
      min-width: 400px;
    }
    .preview {
      background-color: #e3f2fd;
      padding: 10px;
      border-radius: 4px;
      border-left: 4px solid #2196f3;
    }
    .preview p {
      margin: 0;
      font-size: 16px;
    }
  `]
})
export class StockDialogComponent {
  stockForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private dialogRef: MatDialogRef<StockDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { product: Product }
  ) {
    this.stockForm = this.fb.group({
      tipo: ['', Validators.required],
      cantidad: ['', [Validators.required, Validators.min(1)]],
      motivo: ['', Validators.required]
    });
  }

  calculateNewStock(): number {
    const tipo = this.stockForm.get('tipo')?.value;
    const cantidad = parseInt(this.stockForm.get('cantidad')?.value || '0');
    const stockActual = this.data.product.stockActual;

    switch (tipo) {
      case 'ENTRADA':
        return stockActual + cantidad;
      case 'SALIDA':
        return stockActual - cantidad;
      case 'AJUSTE':
        return cantidad;
      default:
        return stockActual;
    }
  }

  onSubmit(): void {
    if (this.stockForm.valid) {
      const { tipo, cantidad, motivo } = this.stockForm.value;
      
      this.productService.updateStock(this.data.product.id!, cantidad, tipo, motivo).subscribe({
        next: () => {
          this.showSuccess('Stock actualizado exitosamente');
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.showError(err.error?.message || 'Error al actualizar stock');
        }
      });
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