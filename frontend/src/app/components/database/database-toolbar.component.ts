import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Database, DatabaseView } from '../../models/database.model';

@Component({
  selector: 'app-database-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="database-toolbar">
      <!-- Left Actions -->
      <div class="toolbar-left">
        <button class="btn btn-secondary" (click)="onAddRecord()">
          <span class="icon">+</span>
          New Record
        </button>
        
        <button class="btn btn-secondary" (click)="onAddProperty()">
          <span class="icon">⚙️</span>
          Add Property
        </button>
        
        <button class="btn btn-secondary" (click)="onAddView()">
          <span class="icon">👁️</span>
          Add View
        </button>
      </div>

      <!-- Center Actions -->
      <div class="toolbar-center">
        <div class="view-type-selector" *ngIf="currentView">
          <span class="view-type-label">View:</span>
          <select 
            [value]="currentView.type" 
            (change)="onViewTypeChange($event)"
            class="view-type-select"
          >
            <option value="table">Table</option>
            <option value="board">Board</option>
            <option value="list">List</option>
            <option value="gallery">Gallery</option>
            <option value="calendar">Calendar</option>
            <option value="timeline">Timeline</option>
          </select>
        </div>
      </div>

      <!-- Right Actions -->
      <div class="toolbar-right">
        <div class="dropdown">
          <button class="btn btn-secondary dropdown-toggle" (click)="toggleExportDropdown()">
            <span class="icon">📤</span>
            Export
          </button>
          <div class="dropdown-menu" *ngIf="showExportDropdown">
            <button class="dropdown-item" (click)="onExportData('csv')">
              Export as CSV
            </button>
            <button class="dropdown-item" (click)="onExportData('json')">
              Export as JSON
            </button>
            <button class="dropdown-item" (click)="onExportData('excel')">
              Export as Excel
            </button>
          </div>
        </div>

        <div class="dropdown">
          <button class="btn btn-secondary dropdown-toggle" (click)="toggleImportDropdown()">
            <span class="icon">📥</span>
            Import
          </button>
          <div class="dropdown-menu" *ngIf="showImportDropdown">
            <button class="dropdown-item" (click)="onImportData('csv')">
              Import from CSV
            </button>
            <button class="dropdown-item" (click)="onImportData('json')">
              Import from JSON
            </button>
            <button class="dropdown-item" (click)="onImportData('excel')">
              Import from Excel
            </button>
          </div>
        </div>

        <button class="btn btn-secondary" (click)="onShareDatabase()">
          <span class="icon">🔗</span>
          Share
        </button>

        <button class="btn btn-secondary" (click)="onDatabaseSettings()">
          <span class="icon">⚙️</span>
          Settings
        </button>
      </div>
    </div>

    <!-- File Input for Import -->
    <input 
      #fileInput
      type="file" 
      [accept]="getFileAccept()"
      (change)="onFileSelected($event)"
      style="display: none;"
    >
  `,
  styles: [`
    .database-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
      background: #f8f9fa;
      border-bottom: 1px solid #e0e0e0;
      gap: 16px;
    }

    .toolbar-left,
    .toolbar-center,
    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      color: #333;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    .btn:hover {
      background: #f8f9fa;
      border-color: #007bff;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
      border-color: #6c757d;
    }

    .btn-secondary:hover {
      background: #545b62;
    }

    .icon {
      font-size: 16px;
    }

    .view-type-selector {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .view-type-label {
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }

    .view-type-select {
      padding: 6px 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      font-size: 14px;
      outline: none;
    }

    .view-type-select:focus {
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }

    .dropdown {
      position: relative;
    }

    .dropdown-toggle {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .dropdown-toggle::after {
      content: '▼';
      font-size: 10px;
      margin-left: 4px;
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      min-width: 150px;
    }

    .dropdown-item {
      display: block;
      width: 100%;
      padding: 8px 12px;
      border: none;
      background: none;
      text-align: left;
      cursor: pointer;
      font-size: 14px;
      color: #333;
    }

    .dropdown-item:hover {
      background: #f8f9fa;
    }

    @media (max-width: 768px) {
      .database-toolbar {
        flex-direction: column;
        gap: 8px;
      }

      .toolbar-left,
      .toolbar-center,
      .toolbar-right {
        width: 100%;
        justify-content: center;
      }

      .btn {
        font-size: 12px;
        padding: 6px 8px;
      }

      .icon {
        font-size: 14px;
      }
    }
  `]
})
export class DatabaseToolbarComponent {
  @Input() database!: Database;
  @Input() currentView!: DatabaseView | null;
  
  @Output() addRecord = new EventEmitter<void>();
  @Output() addProperty = new EventEmitter<void>();
  @Output() addView = new EventEmitter<void>();
  @Output() exportData = new EventEmitter<string>();
  @Output() importData = new EventEmitter<any>();
  @Output() viewTypeChange = new EventEmitter<string>();
  @Output() shareDatabase = new EventEmitter<void>();
  @Output() databaseSettings = new EventEmitter<void>();

  showExportDropdown = false;
  showImportDropdown = false;
  currentImportType = '';

  onAddRecord(): void {
    this.addRecord.emit();
  }

  onAddProperty(): void {
    this.addProperty.emit();
  }

  onAddView(): void {
    this.addView.emit();
  }

  onExportData(format: string): void {
    this.showExportDropdown = false;
    this.exportData.emit(format);
  }

  onImportData(format: string): void {
    this.showImportDropdown = false;
    this.currentImportType = format;
    // Trigger file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onViewTypeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.viewTypeChange.emit(target.value);
  }

  onShareDatabase(): void {
    this.shareDatabase.emit();
  }

  onDatabaseSettings(): void {
    this.databaseSettings.emit();
  }

  toggleExportDropdown(): void {
    this.showExportDropdown = !this.showExportDropdown;
    this.showImportDropdown = false;
  }

  toggleImportDropdown(): void {
    this.showImportDropdown = !this.showImportDropdown;
    this.showExportDropdown = false;
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (file) {
      this.importData.emit({
        type: this.currentImportType,
        file: file
      });
    }
    
    // Reset file input
    target.value = '';
  }

  getFileAccept(): string {
    switch (this.currentImportType) {
      case 'csv':
        return '.csv';
      case 'json':
        return '.json';
      case 'excel':
        return '.xlsx,.xls';
      default:
        return '*';
    }
  }
} 