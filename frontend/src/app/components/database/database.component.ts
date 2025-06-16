import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Database, DatabaseView } from '../../models/database.model';
import { DatabaseService } from '../../services/database.service';
import { DatabaseTableViewComponent } from './database-table-view.component';
import { DatabaseBoardViewComponent } from './database-board-view.component';
import { DatabaseListViewComponent } from './database-list-view.component';
import { DatabaseGalleryViewComponent } from './database-gallery-view.component';
import { DatabasePropertiesPanelComponent } from './database-properties-panel.component';
import { DatabaseViewsPanelComponent } from './database-views-panel.component';
import { DatabaseToolbarComponent } from './database-toolbar.component';

@Component({
  selector: 'app-database',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatabaseTableViewComponent,
    DatabaseBoardViewComponent,
    DatabaseListViewComponent,
    DatabaseGalleryViewComponent,
    DatabasePropertiesPanelComponent,
    DatabaseViewsPanelComponent,
    DatabaseToolbarComponent
  ],
  template: `
    <div class="database-container" *ngIf="currentDatabase">
      <!-- Database Header -->
      <div class="database-header">
        <div class="database-info">
          <span class="database-icon">{{ currentDatabase.icon }}</span>
          <div class="database-details">
            <h1 class="database-title">{{ currentDatabase.name }}</h1>
            <p class="database-description" *ngIf="currentDatabase.description">
              {{ currentDatabase.description }}
            </p>
          </div>
        </div>
        
        <!-- Database Toolbar -->
        <app-database-toolbar
          [database]="currentDatabase"
          [currentView]="currentView"
          (addRecord)="onAddRecord()"
          (addProperty)="onAddProperty()"
          (addView)="onAddView()"
          (exportData)="onExportData($event)"
          (importData)="onImportData($event)"
        ></app-database-toolbar>
      </div>

      <!-- Database Content -->
      <div class="database-content">
        <!-- Views Panel -->
        <div class="views-panel" *ngIf="showViewsPanel">
          <app-database-views-panel
            [views]="currentDatabase.views"
            [currentView]="currentView"
            (viewSelect)="onViewSelect($event)"
            (viewUpdate)="onViewUpdate($event)"
            (viewDelete)="onViewDelete($event)"
          ></app-database-views-panel>
        </div>

        <!-- Main Content Area -->
        <div class="main-content">
          <!-- Properties Panel -->
          <div class="properties-panel" *ngIf="showPropertiesPanel">
            <app-database-properties-panel
              [properties]="currentDatabase.properties"
              [currentView]="currentView"
              (propertyUpdate)="onPropertyUpdate($event)"
              (propertyDelete)="onPropertyDelete($event)"
            ></app-database-properties-panel>
          </div>

          <!-- Database View -->
          <div class="database-view">
            <!-- Table View -->
            <app-database-table-view
              *ngIf="currentView?.type === 'table'"
              [database]="currentDatabase"
              [view]="currentView!"
              (recordUpdate)="onRecordUpdate($event)"
              (recordDelete)="onRecordDelete($event)"
            ></app-database-table-view>

            <!-- Board View -->
            <app-database-board-view
              *ngIf="currentView?.type === 'board'"
              [database]="currentDatabase"
              [view]="currentView!"
              (recordUpdate)="onRecordUpdate($event)"
              (recordDelete)="onRecordDelete($event)"
            ></app-database-board-view>

            <!-- List View -->
            <app-database-list-view
              *ngIf="currentView?.type === 'list'"
              [database]="currentDatabase"
              [view]="currentView!"
              (recordUpdate)="onRecordUpdate($event)"
              (recordDelete)="onRecordDelete($event)"
            ></app-database-list-view>

            <!-- Gallery View -->
            <app-database-gallery-view
              *ngIf="currentView?.type === 'gallery'"
              [database]="currentDatabase"
              [view]="currentView!"
              (recordUpdate)="onRecordUpdate($event)"
              (recordDelete)="onRecordDelete($event)"
            ></app-database-gallery-view>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!currentDatabase">
        <div class="empty-content">
          <span class="empty-icon">📊</span>
          <h2>No Database Selected</h2>
          <p>Select a database from the sidebar or create a new one to get started.</p>
          <button class="btn btn-primary" (click)="onCreateDatabase()">
            Create Database
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .database-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #f8f9fa;
    }

    .database-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: white;
      border-bottom: 1px solid #e0e0e0;
    }

    .database-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .database-icon {
      font-size: 24px;
    }

    .database-title {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
    }

    .database-description {
      margin: 4px 0 0 0;
      color: #666;
    }

    .database-content {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .views-panel {
      width: 250px;
      border-right: 1px solid #e0e0e0;
      background: white;
    }

    .main-content {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .properties-panel {
      width: 300px;
      border-right: 1px solid #e0e0e0;
      background: white;
    }

    .database-view {
      flex: 1;
      overflow: hidden;
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

    .btn {
      padding: 8px 16px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }

    .btn-primary:hover {
      background: #0056b3;
    }
  `]
})
export class DatabaseComponent implements OnInit, OnDestroy {
  currentDatabase: Database | null = null;
  currentView: DatabaseView | null = null;
  showViewsPanel = true;
  showPropertiesPanel = true;

  private destroy$ = new Subject<void>();

  constructor(private databaseService: DatabaseService) {}

  ngOnInit(): void {
    // Subscribe to current database changes
    this.databaseService.getCurrentDatabase()
      .pipe(takeUntil(this.destroy$))
      .subscribe(database => {
        this.currentDatabase = database;
      });

    // Subscribe to current view changes
    this.databaseService.getCurrentView()
      .pipe(takeUntil(this.destroy$))
      .subscribe(view => {
        this.currentView = view;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Event Handlers
  onViewSelect(view: DatabaseView): void {
    this.databaseService.setCurrentView(view);
  }

  onViewUpdate(view: DatabaseView): void {
    if (this.currentDatabase) {
      this.databaseService.updateView(this.currentDatabase.id, view.id, view)
        .subscribe();
    }
  }

  onViewDelete(viewId: string): void {
    if (this.currentDatabase) {
      this.databaseService.deleteView(this.currentDatabase.id, viewId)
        .subscribe();
    }
  }

  onPropertyUpdate(property: any): void {
    if (this.currentDatabase) {
      this.databaseService.updateProperty(this.currentDatabase.id, property.id, property)
        .subscribe();
    }
  }

  onPropertyDelete(propertyId: string): void {
    if (this.currentDatabase) {
      this.databaseService.deleteProperty(this.currentDatabase.id, propertyId)
        .subscribe();
    }
  }

  onRecordUpdate(record: any): void {
    if (this.currentDatabase) {
      this.databaseService.updateRecord(this.currentDatabase.id, record.id, record.properties)
        .subscribe();
    }
  }

  onRecordDelete(recordId: string): void {
    if (this.currentDatabase) {
      this.databaseService.deleteRecord(this.currentDatabase.id, recordId)
        .subscribe();
    }
  }

  onAddRecord(): void {
    if (this.currentDatabase) {
      const newRecord = {
        title: 'New Record'
      };
      this.databaseService.addRecord(this.currentDatabase.id, newRecord)
        .subscribe();
    }
  }

  onAddProperty(): void {
    if (this.currentDatabase) {
      const newProperty = {
        name: 'New Property',
        type: 'text' as const,
        required: false,
        unique: false
      };
      this.databaseService.addProperty(this.currentDatabase.id, newProperty)
        .subscribe();
    }
  }

  onAddView(): void {
    if (this.currentDatabase) {
      const newView = {
        name: 'New View',
        type: 'table' as const,
        visibleProperties: ['title'],
        isDefault: false
      };
      this.databaseService.addView(this.currentDatabase.id, newView)
        .subscribe();
    }
  }

  onCreateDatabase(): void {
    const name = prompt('Enter database name:');
    if (name) {
      this.databaseService.createDatabase(name)
        .subscribe(database => {
          this.databaseService.setCurrentDatabase(database);
        });
    }
  }

  onExportData(format: string): void {
    console.log('Export data:', format);
    // Implementation for data export
  }

  onImportData(data: any): void {
    console.log('Import data:', data);
    // Implementation for data import
  }

  // Panel Toggle Methods
  toggleViewsPanel(): void {
    this.showViewsPanel = !this.showViewsPanel;
  }

  togglePropertiesPanel(): void {
    this.showPropertiesPanel = !this.showPropertiesPanel;
  }
} 