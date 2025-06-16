import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Database, DatabaseView, DatabaseRecord, DatabaseProperty } from '../../models/database.model';
import { DatabaseService } from '../../services/database.service';
import { PropertyValueComponent } from './property-value.component';
import { PropertyEditorComponent } from './property-editor.component';

@Component({
  selector: 'app-database-table-view',
  standalone: true,
  imports: [CommonModule, FormsModule, PropertyValueComponent, PropertyEditorComponent],
  template: `
    <div class="table-view-container">
      <!-- Table Header -->
      <div class="table-header">
        <div class="table-controls">
          <button class="btn btn-secondary" (click)="toggleSelectAll()">
            {{ allSelected ? 'Deselect All' : 'Select All' }}
          </button>
          <button class="btn btn-primary" (click)="addNewRecord()">
            + New Record
          </button>
        </div>
        
        <div class="table-filters">
          <input 
            type="text" 
            placeholder="Search records..." 
            [(ngModel)]="searchTerm"
            (input)="onSearchChange()"
            class="search-input"
          >
          <button class="btn btn-secondary" (click)="toggleFilters()">
            Filters
          </button>
        </div>
      </div>

      <!-- Filters Panel -->
      <div class="filters-panel" *ngIf="showFilters">
        <div class="filter-group" *ngFor="let property of database.properties">
          <label>{{ property.name }}</label>
          <select [(ngModel)]="filters[property.id]" (change)="applyFilters()">
            <option value="">Any</option>
            <option *ngFor="let option of getPropertyOptions(property)" [value]="option">
              {{ option }}
            </option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="table-wrapper">
        <table class="database-table">
          <thead>
            <tr>
              <th class="checkbox-column">
                <input 
                  type="checkbox" 
                  [checked]="allSelected"
                  (change)="toggleSelectAll()"
                >
              </th>
              <th 
                *ngFor="let property of visibleProperties" 
                class="property-header"
                [class.sortable]="isSortable(property)"
                (click)="sortBy(property)"
              >
                <div class="header-content">
                  <span>{{ property.name }}</span>
                  <span class="sort-icon" *ngIf="isSortable(property)">
                    {{ getSortIcon(property) }}
                  </span>
                </div>
              </th>
              <th class="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              *ngFor="let record of filteredRecords; trackBy: trackByRecordId"
              class="table-row"
              [class.selected]="selectedRecords.has(record.id)"
            >
              <td class="checkbox-column">
                <input 
                  type="checkbox" 
                  [checked]="selectedRecords.has(record.id)"
                  (change)="toggleRecordSelection(record.id)"
                >
              </td>
              <td 
                *ngFor="let property of visibleProperties" 
                class="property-cell"
                [class.editing]="editingCell === record.id + '_' + property.id"
              >
                <div 
                  *ngIf="editingCell !== record.id + '_' + property.id"
                  class="cell-content"
                  (dblclick)="startEditing(record.id, property.id)"
                >
                  <app-property-value 
                    [property]="property"
                    [value]="record.properties[property.id]"
                  ></app-property-value>
                </div>
                <div 
                  *ngIf="editingCell === record.id + '_' + property.id"
                  class="cell-editor"
                >
                  <app-property-editor
                    [property]="property"
                    [value]="record.properties[property.id]"
                    (save)="saveEdit(record.id, property.id, $event)"
                    (cancel)="cancelEdit()"
                  ></app-property-editor>
                </div>
              </td>
              <td class="actions-column">
                <div class="action-buttons">
                  <button class="btn btn-sm btn-secondary" (click)="duplicateRecord(record)">
                    📋
                  </button>
                  <button class="btn btn-sm btn-danger" (click)="deleteRecord(record.id)">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Table Footer -->
      <div class="table-footer">
        <div class="table-info">
          <span>{{ filteredRecords.length }} of {{ database.records.length }} records</span>
          <span *ngIf="selectedRecords.size > 0">
            ({{ selectedRecords.size }} selected)
          </span>
        </div>
        
        <div class="table-pagination" *ngIf="totalPages > 1">
          <button 
            class="btn btn-sm" 
            [disabled]="currentPage === 1"
            (click)="goToPage(currentPage - 1)"
          >
            Previous
          </button>
          <span class="page-info">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          <button 
            class="btn btn-sm" 
            [disabled]="currentPage === totalPages"
            (click)="goToPage(currentPage + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .table-view-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
      background: #f8f9fa;
    }

    .table-controls {
      display: flex;
      gap: 8px;
    }

    .table-filters {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .search-input {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      min-width: 200px;
    }

    .filters-panel {
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
      background: #f8f9fa;
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .filter-group label {
      font-size: 12px;
      font-weight: 500;
      color: #666;
    }

    .filter-group select {
      padding: 4px 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 12px;
    }

    .table-wrapper {
      flex: 1;
      overflow: auto;
    }

    .database-table {
      width: 100%;
      border-collapse: collapse;
    }

    .database-table th,
    .database-table td {
      padding: 12px 8px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }

    .database-table th {
      background: #f8f9fa;
      font-weight: 600;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .checkbox-column {
      width: 40px;
      text-align: center;
    }

    .actions-column {
      width: 80px;
      text-align: center;
    }

    .property-header {
      cursor: pointer;
      user-select: none;
    }

    .property-header:hover {
      background: #e9ecef;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .sort-icon {
      font-size: 12px;
      color: #666;
    }

    .table-row {
      transition: background-color 0.2s;
    }

    .table-row:hover {
      background: #f8f9fa;
    }

    .table-row.selected {
      background: #e3f2fd;
    }

    .property-cell {
      position: relative;
    }

    .cell-content {
      cursor: pointer;
    }

    .cell-content:hover {
      background: #f0f0f0;
      border-radius: 4px;
      padding: 2px;
      margin: -2px;
    }

    .cell-editor {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: white;
      border: 2px solid #007bff;
      border-radius: 4px;
      z-index: 20;
    }

    .action-buttons {
      display: flex;
      gap: 4px;
      justify-content: center;
    }

    .btn-sm {
      padding: 4px 8px;
      font-size: 12px;
    }

    .table-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-top: 1px solid #e0e0e0;
      background: #f8f9fa;
    }

    .table-info {
      font-size: 14px;
      color: #666;
    }

    .table-pagination {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .page-info {
      font-size: 14px;
      color: #666;
    }

    .btn {
      padding: 8px 16px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn:hover {
      background: #f8f9fa;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }

    .btn-primary:hover {
      background: #0056b3;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
      border-color: #6c757d;
    }

    .btn-secondary:hover {
      background: #545b62;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
      border-color: #dc3545;
    }

    .btn-danger:hover {
      background: #c82333;
    }
  `]
})
export class DatabaseTableViewComponent implements OnInit, OnDestroy {
  @Input() database!: Database;
  @Input() view!: DatabaseView;
  @Output() recordUpdate = new EventEmitter<DatabaseRecord>();
  @Output() recordDelete = new EventEmitter<string>();

  filteredRecords: DatabaseRecord[] = [];
  visibleProperties: DatabaseProperty[] = [];
  selectedRecords = new Set<string>();
  editingCell: string | null = null;
  searchTerm = '';
  showFilters = false;
  filters: Record<string, any> = {};
  sortConfig: { propertyId: string; direction: 'asc' | 'desc' } | null = null;
  currentPage = 1;
  pageSize = 50;
  totalPages = 1;

  private destroy$ = new Subject<void>();

  constructor(private databaseService: DatabaseService) {}

  ngOnInit(): void {
    this.updateVisibleProperties();
    this.loadRecords();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get allSelected(): boolean {
    return this.selectedRecords.size === this.filteredRecords.length && this.filteredRecords.length > 0;
  }

  updateVisibleProperties(): void {
    if (this.view.visibleProperties) {
      this.visibleProperties = this.database.properties.filter(p => 
        this.view.visibleProperties!.includes(p.id)
      );
    } else {
      this.visibleProperties = this.database.properties;
    }
  }

  loadRecords(): void {
    this.databaseService.getFilteredRecords(this.database.id, this.view.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(records => {
        this.filteredRecords = records;
        this.applySearchAndFilters();
        this.calculatePagination();
      });
  }

  applySearchAndFilters(): void {
    let filtered = [...this.database.records];

    // Apply search
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(record => {
        return Object.values(record.properties).some(value => 
          String(value).toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply filters
    Object.entries(this.filters).forEach(([propertyId, filterValue]) => {
      if (filterValue) {
        filtered = filtered.filter(record => 
          record.properties[propertyId] === filterValue
        );
      }
    });

    // Apply sorting
    if (this.sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a.properties[this.sortConfig!.propertyId];
        const bValue = b.properties[this.sortConfig!.propertyId];
        
        let comparison = 0;
        if (aValue < bValue) comparison = -1;
        else if (aValue > bValue) comparison = 1;
        
        if (this.sortConfig!.direction === 'desc') comparison *= -1;
        return comparison;
      });
    }

    this.filteredRecords = filtered;
    this.calculatePagination();
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredRecords.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
  }

  getPaginatedRecords(): DatabaseRecord[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredRecords.slice(start, end);
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.applySearchAndFilters();
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.applySearchAndFilters();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  sortBy(property: DatabaseProperty): void {
    if (!this.isSortable(property)) return;

    if (this.sortConfig?.propertyId === property.id) {
      this.sortConfig.direction = this.sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortConfig = { propertyId: property.id, direction: 'asc' };
    }

    this.applySearchAndFilters();
  }

  isSortable(property: DatabaseProperty): boolean {
    return ['text', 'number', 'date', 'select', 'title'].includes(property.type);
  }

  getSortIcon(property: DatabaseProperty): string {
    if (this.sortConfig?.propertyId !== property.id) return '↕️';
    return this.sortConfig.direction === 'asc' ? '↑' : '↓';
  }

  getPropertyOptions(property: DatabaseProperty): any[] {
    if (property.type === 'select' && property.options) {
      return property.options.map(opt => opt.name);
    }
    return [];
  }

  toggleSelectAll(): void {
    if (this.allSelected) {
      this.selectedRecords.clear();
    } else {
      this.filteredRecords.forEach(record => this.selectedRecords.add(record.id));
    }
  }

  toggleRecordSelection(recordId: string): void {
    if (this.selectedRecords.has(recordId)) {
      this.selectedRecords.delete(recordId);
    } else {
      this.selectedRecords.add(recordId);
    }
  }

  startEditing(recordId: string, propertyId: string): void {
    this.editingCell = recordId + '_' + propertyId;
  }

  saveEdit(recordId: string, propertyId: string, value: any): void {
    const record = this.database.records.find(r => r.id === recordId);
    if (record) {
      const updatedRecord = {
        ...record,
        properties: { ...record.properties, [propertyId]: value }
      };
      this.recordUpdate.emit(updatedRecord);
    }
    this.editingCell = null;
  }

  cancelEdit(): void {
    this.editingCell = null;
  }

  addNewRecord(): void {
    const newRecord = {
      title: 'New Record'
    };
    this.databaseService.addRecord(this.database.id, newRecord)
      .subscribe();
  }

  duplicateRecord(record: DatabaseRecord): void {
    const duplicatedProperties = { ...record.properties };
    this.databaseService.addRecord(this.database.id, duplicatedProperties)
      .subscribe();
  }

  deleteRecord(recordId: string): void {
    if (confirm('Are you sure you want to delete this record?')) {
      this.recordDelete.emit(recordId);
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  trackByRecordId(index: number, record: DatabaseRecord): string {
    return record.id;
  }
} 