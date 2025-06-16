import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Subject, takeUntil } from 'rxjs';
import { Database, DatabaseView, DatabaseRecord, DatabaseProperty } from '../../models/database.model';
import { DatabaseService } from '../../services/database.service';
import { PropertyValueComponent } from './property-value.component';
import { PropertyEditorComponent } from './property-editor.component';

@Component({
  selector: 'app-database-board-view',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, PropertyValueComponent, PropertyEditorComponent],
  template: `
    <div class="board-view-container">
      <!-- Board Header -->
      <div class="board-header">
        <div class="board-controls">
          <button class="btn btn-primary" (click)="addNewRecord()">
            + New Record
          </button>
          <button class="btn btn-secondary" (click)="toggleGroupBy()">
            Group by: {{ getGroupByLabel() }}
          </button>
        </div>
        
        <div class="board-filters">
          <input 
            type="text" 
            placeholder="Search records..." 
            [(ngModel)]="searchTerm"
            (input)="onSearchChange()"
            class="search-input"
          >
        </div>
      </div>

      <!-- Board Content -->
      <div class="board-content">
        <div class="board-columns">
          <div 
            *ngFor="let group of groupedRecords; trackBy: trackByGroup"
            class="board-column"
          >
            <div class="column-header">
              <h3 class="column-title">
                {{ group.name }}
                <span class="column-count">({{ group.records.length }})</span>
              </h3>
              <button class="btn btn-sm btn-primary" (click)="addRecordToGroup(group.key)">
                +
              </button>
            </div>
            
            <div 
              class="column-content"
              cdkDropList
              [cdkDropListData]="group.records"
              [cdkDropListConnectedTo]="dropLists"
              (cdkDropListDropped)="onDrop($event)"
            >
              <div 
                *ngFor="let record of group.records; trackBy: trackByRecordId"
                class="board-card"
                cdkDrag
                [class.selected]="selectedRecords.has(record.id)"
                (click)="toggleRecordSelection(record.id, $event)"
              >
                <div class="card-header">
                  <div class="card-title">
                    {{ getRecordTitle(record) }}
                  </div>
                  <div class="card-actions">
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
                
                <div class="card-content">
                  <div 
                    *ngFor="let property of visibleProperties"
                    class="card-property"
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
                
                <div class="card-footer">
                  <div class="card-meta">
                    <span class="created-time">
                      {{ record.createdTime | date:'shortDate' }}
                    </span>
                    <span class="created-by">
                      by {{ record.createdBy }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="groupedRecords.length === 0">
        <div class="empty-content">
          <span class="empty-icon">📋</span>
          <h3>No records found</h3>
          <p>Create your first record to get started with the board view.</p>
          <button class="btn btn-primary" (click)="addNewRecord()">
            Create Record
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .board-view-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #f8f9fa;
    }

    .board-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: white;
      border-bottom: 1px solid #e0e0e0;
      gap: 16px;
    }

    .board-controls {
      display: flex;
      gap: 8px;
    }

    .board-filters {
      display: flex;
      gap: 8px;
    }

    .search-input {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      min-width: 200px;
    }

    .board-content {
      flex: 1;
      overflow: hidden;
    }

    .board-columns {
      display: flex;
      height: 100%;
      overflow-x: auto;
      padding: 16px;
      gap: 16px;
    }

    .board-column {
      min-width: 300px;
      max-width: 350px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      height: fit-content;
      max-height: calc(100vh - 200px);
    }

    .column-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #e0e0e0;
      background: #f8f9fa;
      border-radius: 8px 8px 0 0;
    }

    .column-title {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }

    .column-count {
      color: #666;
      font-weight: normal;
    }

    .column-content {
      flex: 1;
      padding: 8px;
      overflow-y: auto;
      min-height: 200px;
    }

    .board-card {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .board-card:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      transform: translateY(-1px);
    }

    .board-card.selected {
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }

    .board-card.cdk-drag-preview {
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
      transform: rotate(5deg);
    }

    .board-card.cdk-drag-placeholder {
      opacity: 0.3;
    }

    .board-card.cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 12px;
      border-bottom: 1px solid #f0f0f0;
    }

    .card-title {
      font-weight: 500;
      color: #333;
      flex: 1;
      margin-right: 8px;
    }

    .card-actions {
      display: flex;
      gap: 4px;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .board-card:hover .card-actions {
      opacity: 1;
    }

    .card-content {
      padding: 12px;
    }

    .card-property {
      margin-bottom: 8px;
    }

    .card-property:last-child {
      margin-bottom: 0;
    }

    .property-display {
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 20px;
    }

    .property-label {
      font-size: 12px;
      color: #666;
      font-weight: 500;
      min-width: 60px;
    }

    .property-editor {
      margin-top: 4px;
    }

    .card-footer {
      padding: 8px 12px;
      border-top: 1px solid #f0f0f0;
      background: #f8f9fa;
      border-radius: 0 0 6px 6px;
    }

    .card-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
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
      .board-header {
        flex-direction: column;
        align-items: stretch;
      }

      .board-controls,
      .board-filters {
        justify-content: center;
      }

      .board-columns {
        flex-direction: column;
        overflow-x: visible;
        overflow-y: auto;
      }

      .board-column {
        min-width: auto;
        max-width: none;
      }
    }
  `]
})
export class DatabaseBoardViewComponent implements OnInit, OnDestroy {
  @Input() database!: Database;
  @Input() view!: DatabaseView;
  @Output() recordUpdate = new EventEmitter<DatabaseRecord>();
  @Output() recordDelete = new EventEmitter<string>();

  groupedRecords: Array<{
    key: string;
    name: string;
    records: DatabaseRecord[];
  }> = [];
  
  visibleProperties: DatabaseProperty[] = [];
  selectedRecords = new Set<string>();
  editingCell: string | null = null;
  searchTerm = '';
  dropLists: any[] = [];

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
      this.visibleProperties = this.database.properties.slice(0, 5); // Limit for board view
    }
  }

  loadRecords(): void {
    this.databaseService.getFilteredRecords(this.database.id, this.view.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(records => {
        this.groupRecords(records);
      });
  }

  groupRecords(records: DatabaseRecord[]): void {
    const groupByProperty = this.view.groupBy || 'status';
    const property = this.database.properties.find(p => p.id === groupByProperty);
    
    if (!property) {
      // Default grouping by status or first select property
      const selectProperty = this.database.properties.find(p => p.type === 'select');
      if (selectProperty) {
        this.groupByProperty(records, selectProperty.id);
      } else {
        this.groupedRecords = [{
          key: 'all',
          name: 'All Records',
          records: records
        }];
      }
      return;
    }

    this.groupByProperty(records, groupByProperty);
  }

  groupByProperty(records: DatabaseRecord[], propertyId: string): void {
    const groups = new Map<string, DatabaseRecord[]>();
    
    records.forEach(record => {
      const value = record.properties[propertyId] || 'No Value';
      if (!groups.has(value)) {
        groups.set(value, []);
      }
      groups.get(value)!.push(record);
    });

    this.groupedRecords = Array.from(groups.entries()).map(([key, records]) => ({
      key,
      name: key,
      records
    }));

    // Sort groups by name
    this.groupedRecords.sort((a, b) => a.name.localeCompare(b.name));
  }

  getGroupByLabel(): string {
    const groupByProperty = this.view.groupBy || 'status';
    const property = this.database.properties.find(p => p.id === groupByProperty);
    return property ? property.name : 'Status';
  }

  toggleGroupBy(): void {
    // This would open a modal to select grouping property
    console.log('Toggle group by');
  }

  onSearchChange(): void {
    // Implement search functionality
    console.log('Search:', this.searchTerm);
  }

  onDrop(event: CdkDragDrop<DatabaseRecord[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      
      // Update the record's group property
      const record = event.container.data[event.currentIndex];
      const groupByProperty = this.view.groupBy || 'status';
      const newValue = this.groupedRecords.find(g => g.records === event.container.data)?.key;
      
      if (newValue && record) {
        this.recordUpdate.emit({
          ...record,
          properties: { ...record.properties, [groupByProperty]: newValue }
        });
      }
    }
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

  addRecordToGroup(groupKey: string): void {
    const groupByProperty = this.view.groupBy || 'status';
    const newRecord = {
      [groupByProperty]: groupKey,
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

  trackByGroup(index: number, group: any): string {
    return group.key;
  }

  trackByRecordId(index: number, record: DatabaseRecord): string {
    return record.id;
  }
} 