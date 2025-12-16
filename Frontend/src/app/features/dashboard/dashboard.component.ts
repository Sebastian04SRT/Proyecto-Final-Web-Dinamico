// src/app/features/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { DashboardService } from '../../core/services/dashboard.service';
import { ProductService } from '../../core/services/product.service';
import { Dashboard, Product } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatButtonModule
  ],
  template: `
    <div class="dashboard-container">
      <h1>Dashboard</h1>
      
      <div class="metrics-grid">
        <mat-card class="metric-card">
          <mat-card-header>
            <mat-icon color="primary">inventory_2</mat-icon>
            <mat-card-title>Total Productos</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <h2>{{metrics?.totalProductos || 0}}</h2>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="metric-card">
          <mat-card-header>
            <mat-icon color="accent">category</mat-icon>
            <mat-card-title>Total Categorías</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <h2>{{metrics?.totalCategorias || 0}}</h2>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="metric-card warning" *ngIf="(metrics?.productosBajoStock || 0) > 0">
          <mat-card-header>
            <mat-icon color="warn">warning</mat-icon>
            <mat-card-title>Productos Bajo Stock</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <h2>{{metrics?.productosBajoStock || 0}}</h2>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="metric-card">
          <mat-card-header>
            <mat-icon color="primary">attach_money</mat-icon>
            <mat-card-title>Valor Total Inventario</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <h2>\${{(metrics?.valorTotalInventario || 0) | number:'1.2-2'}}</h2>
          </mat-card-content>
        </mat-card>
      </div>
      
      <mat-card *ngIf="productosBajoStock.length > 0" class="bajo-stock-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>warning</mat-icon>
            Productos con Bajo Stock
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <table mat-table [dataSource]="productosBajoStock" class="mat-elevation-z0">
            <ng-container matColumnDef="nombre">
              <th mat-header-cell *matHeaderCellDef>Nombre</th>
              <td mat-cell *matCellDef="let product">{{product.nombre}}</td>
            </ng-container>
            
            <ng-container matColumnDef="categoria">
              <th mat-header-cell *matHeaderCellDef>Categoría</th>
              <td mat-cell *matCellDef="let product">{{product.categoriaNombre}}</td>
            </ng-container>
            
            <ng-container matColumnDef="stock">
              <th mat-header-cell *matHeaderCellDef>Stock Actual</th>
              <td mat-cell *matCellDef="let product">
                <span class="stock-badge">{{product.stockActual}}</span>
              </td>
            </ng-container>
            
            <ng-container matColumnDef="minimo">
              <th mat-header-cell *matHeaderCellDef>Stock Mínimo</th>
              <td mat-cell *matCellDef="let product">{{product.stockMinimo}}</td>
            </ng-container>
            
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }
    .metric-card {
      text-align: center;
    }
    .metric-card mat-card-header {
      justify-content: center;
      align-items: center;
      gap: 10px;
    }
    .metric-card h2 {
      font-size: 2.5em;
      margin: 20px 0;
      font-weight: bold;
    }
    .metric-card.warning {
      border-left: 4px solid #f44336;
    }
    .bajo-stock-card {
      margin-top: 30px;
    }
    .bajo-stock-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #f44336;
    }
    .stock-badge {
      background-color: #f44336;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-weight: bold;
    }
    table {
      width: 100%;
    }
  `]
})
export class DashboardComponent implements OnInit {
  metrics?: Dashboard;
  productosBajoStock: Product[] = [];
  displayedColumns = ['nombre', 'categoria', 'stock', 'minimo'];

  constructor(
    private dashboardService: DashboardService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.dashboardService.getDashboardMetrics().subscribe({
      next: (data) => {
        this.metrics = data;
      },
      error: (err) => console.error('Error al cargar métricas:', err)
    });

    this.productService.getProductsBajoStock().subscribe({
      next: (data) => {
        this.productosBajoStock = data;
      },
      error: (err) => console.error('Error al cargar productos bajo stock:', err)
    });
  }
}