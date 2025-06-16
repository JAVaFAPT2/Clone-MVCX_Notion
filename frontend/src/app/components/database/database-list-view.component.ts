import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Database, DatabaseView, DatabaseRecord, DatabaseProperty } from '../../models/database.model';
import { DatabaseService } from '../../services/database.service';
import { PropertyValueComponent } from './property-value.component';
import { PropertyEditorComponent } from './property-editor.component';

@Component({
  selector: 'app-database-list-view',
  standalone: true,
  imports: [CommonModule, FormsModule, PropertyValueComponent, PropertyEditorComponent],
  template: `
    <div class="list-view-container">
      <!-- List Header -->
      <div class="list-header">
        <div class="list-controls">
          <button class="btn btn-primary" (click)="addNewRecord()">
            + New Record
          </button>
          <button class="btn btn-secondary" (click)="toggleSort()">
            Sort by: {{ getSortLabel() }}
          </button>
        </div>
        
        <div class="list-filters">
          <input 
            type="text" 
            placeholder="Search records..." 
            [(ngModel)]="searchTerm"
            (input)="onSearchChange()"
            class="search-input"
          >
        </div>
      </div>

      <!-- List Content -->
      <div class="list-content">
        <div class="list-items">
          <div 
            *ngFor="let record of filteredRecords; trackBy: trackByRecordId"
            class="list-item"
            [class.selected]="selectedRecords.has(record.id)"
            (click)="toggleRecordSelection(record.id, $event)"
          >
            <div class="item-header">
              <div class="item-title">
                {{ getRecordTitle(record) }}
              </div>
              <div class="item-actions">
                <button 
                  class="btn btn-sm btn-icon"
                  (click)="duplicateRecord(record); $event.stopPropagation()"
                  title="Duplicate record"
                >
                  📋
                </button>
                <button 
                  class="btn btn-sm btn-icon btn-danger"
                  (click)="deleteRecord(record.id); $event.stopPropagation()"
                  title="Delete record"
                >
                  🗑️
                </button>
              </div>
            </div>
            
            <div class="item-content">
              <div 
                *ngFor="let property of visibleProperties"
                class="item-property"
                [class.editing]="editingCell === record.id + '_' + property.id"
              >
                <div 
                  *ngIf="editingCell !== record.id + '_' + property.id"
                  class="property-display"
                  (dblclick)="startEditing(record.id, property.id)"
                >
                  <span class="property-label">{{ property.name }}:</span>
                  <app-property-value 
                    [property]="property"
                    [value]="record.properties[property.id]"
                  ></app-property-value>
                </div>
                <div 
                  *ngIf="editingCell === record.id + '_' + property.id"
                  class="property-editor"
                >
                  <app-property-editor
                    [property]="property"
                    [value]="record.properties[property.id]"
                    (save)="saveEdit(record.id, property.id, $event)"
                    (cancel)="cancelEdit()"
                  ></app-property-editor>
                </div>
              </div>
            </div>
            
            <div class="item-footer">
              <div class="item-meta">
                <span class="created-time">
                  {{ record.createdTime | date:'shortDate' }}
                </span>
                <span class="created-by">
                  by {{ record.createdBy }}
                </span>
                <span class="last-edited">
                  Last edited {{ record.lastEditedTime | date:'shortDate' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="filteredRecords.length === 0">
        <div class="empty-content">
          <span class="empty-icon">📝</span>
          <h3>No records found</h3>
          <p>Create your first record to get started with the list view.</p>
          <button class="btn btn-primary" (click)="addNewRecord()">
            Create Record
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .list-view-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: white;
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
      background: #f8f9fa;
      gap: 16px;
    }

    .list-controls {
      display: flex;
      gap: 8px;
    }

    .list-filters {
      display: flex;
      gap: 8px;
    }

    .search-input {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      min-width: 200px;
    }

    .list-content {
      flex: 1;
      overflow-y: auto;
    }

    .list-items {
      padding: 8px;
    }

    .list-item {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .list-item:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      transform: translateY(-1px);
    }

    .list-item.selected {
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;
    }

    .item-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      flex: 1;
      margin-right: 16px;
    }

    .item-actions {
      display: flex;
      gap: 4px;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .list-item:hover .item-actions {
      opacity: 1;
    }

    .item-content {
      padding: 16px;
    }

    .item-property {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      min-height: 24px;
    }

    .item-property:last-child {
      margin-bottom: 0;
    }

    .property-display {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
    }

    .property-label {
      font-size: 14px;
      color: #666;
      font-weight: 500;
      min-width: 120px;
      flex-shrink: 0;
    }

    .property-editor {
      width: 100%;
    }

    .item-footer {
      padding: 12px 16px;
      border-top: 1px solid #f0f0f0;
      background: #f8f9fa;
      border-radius: 0 0 8px 8px;
    }

    .item-meta {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: #666;
    }

    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 40px;
    }

    .empty-content {
      text-align: center;
      max-width: 400px;
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
      display: block;
    }

    .empty-content h3 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .empty-content p {
      margin: 0 0 16px 0;
      color: #666;
    }

    .btn {
      padding: 8px 16px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    .btn:hover {
      background: #f8f9fa;
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

    .btn-sm {
      padding: 4px 8px;
      font-size: 12px;
    }

    .btn-icon {
      padding: 2px;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: none;
      font-size: 12px;
    }

    .btn-icon:hover {
      background: #f8f9fa;
      border-radius: 4px;
    }

    .btn-danger {
      color: #dc3545;
    }

    .btn-danger:hover {
      background: #dc3545;
      color: white;
    }

    @media (max-width: 768px) {
      .list-header {
        flex-direction: column;
        align-items: stretch;
      }

      .list-controls,
      .list-filters {
        justify-content: center;
      }

      .item-header {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }

      .item-title {
        margin-right: 0;
      }

      .item-actions {
        opacity: 1;
        justify-content: flex-end;
      }

      .property-display {
        flex-direction: column;
        align-items: stretch;
        gap: 4px;
      }

      .property-label {
        min-width: auto;
      }

      .item-meta {
        flex-direction: column;
        gap: 4px;
      }
    }
  `]
})
export class DatabaseListViewComponent implements OnInit, OnDestroy {
  @Input() database!: Database;
  @Input() view!: DatabaseView;
  @Output() recordUpdate = new EventEmitter<DatabaseRecord>();
  @Output() recordDelete = new EventEmitter<string>();

  filteredRecords: DatabaseRecord[] = [];
  visibleProperties: DatabaseProperty[] = [];
  selectedRecords = new Set<string>();
  editingCell: string | null = null;
  searchTerm = '';
  sortConfig: { propertyId: string; direction: 'asc' | 'desc' } | null = null;

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

  updateVisibleProperties(): void {
    if (this.view.visibleProperties) {
      this.visibleProperties = this.database.properties.filter(p => 
        this.view.visibleProperties!.includes(p.id)
      );
    } else {
      this.visibleProperties = this.database.properties.slice(0, 8); // Limit for list view
    }
  }

  loadRecords(): void {
    this.databaseService.getFilteredRecords(this.database.id, this.view.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(records => {
        this.filteredRecords = records;
        this.applySorting();
      });
  }

  applySorting(): void {
    if (this.sortConfig) {
      this.filteredRecords.sort((a, b) => {
        const aValue = a.properties[this.sortConfig!.propertyId];
        const bValue = b.properties[this.sortConfig!.propertyId];
        
        let comparison = 0;
        if (aValue < bValue) comparison = -1;
        else if (aValue > bValue) comparison = 1;
        
        if (this.sortConfig!.direction === 'desc') comparison *= -1;
        return comparison;
      });
    }
  }

  getSortLabel(): string {
    if (!this.sortConfig) return 'Created Time';
    
    const property = this.database.properties.find(p => p.id === this.sortConfig!.propertyId);
    const direction = this.sortConfig.direction === 'asc' ? '↑' : '↓';
    return `${property?.name || 'Unknown'} ${direction}`;
  }

  toggleSort(): void {
    // This would open a modal to select sorting property
    console.log('Toggle sort');
  }

  onSearchChange(): void {
    // Implement search functionality
    console.log('Search:', this.searchTerm);
  }

  getRecordTitle(record: DatabaseRecord): string {
    const titleProperty = this.database.properties.find(p => p.type === 'title');
    if (titleProperty) {
      return record.properties[titleProperty.id] || 'Untitled';
    }
    return 'Untitled';
  }

  toggleRecordSelection(recordId: string, event: MouseEvent): void {
    if (event.ctrlKey || event.metaKey) {
      if (this.selectedRecords.has(recordId)) {
        this.selectedRecords.delete(recordId);
      } else {
        this.selectedRecords.add(recordId);
      }
    } else {
      this.selectedRecords.clear();
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

  trackByRecordId(index: number, record: DatabaseRecord): string {
    return record.id;
  }
} 