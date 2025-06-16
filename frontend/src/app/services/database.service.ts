import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { 
  Database, 
  DatabaseProperty, 
  DatabaseRecord, 
  DatabaseView, 
  DatabaseTemplate,
  DatabaseStats,
  PropertyType,
  ViewType,
  FilterConfig,
  SortConfig,
  createSampleDatabase,
  createDefaultProperties,
  createDefaultView
} from '../models/database.model';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private databases = new BehaviorSubject<Database[]>([]);
  private currentDatabase = new BehaviorSubject<Database | null>(null);
  private currentView = new BehaviorSubject<DatabaseView | null>(null);

  constructor() {
    this.initializeSampleData();
  }

  // Database Management
  getDatabases(): Observable<Database[]> {
    return this.databases.asObservable();
  }

  getDatabase(id: string): Observable<Database | null> {
    return this.databases.pipe(
      map(dbs => dbs.find(db => db.id === id) || null)
    );
  }

  createDatabase(name: string, description?: string): Observable<Database> {
    const database = createSampleDatabase(name, description);
    const currentDbs = this.databases.value;
    this.databases.next([...currentDbs, database]);
    return of(database);
  }

  updateDatabase(id: string, updates: Partial<Database>): Observable<Database | null> {
    const currentDbs = this.databases.value;
    const index = currentDbs.findIndex(db => db.id === id);
    
    if (index === -1) return of(null);
    
    const updatedDatabase = {
      ...currentDbs[index],
      ...updates,
      lastEditedTime: new Date()
    };
    
    currentDbs[index] = updatedDatabase;
    this.databases.next([...currentDbs]);
    
    // Update current database if it's the one being edited
    if (this.currentDatabase.value?.id === id) {
      this.currentDatabase.next(updatedDatabase);
    }
    
    return of(updatedDatabase);
  }

  deleteDatabase(id: string): Observable<boolean> {
    const currentDbs = this.databases.value;
    const filteredDbs = currentDbs.filter(db => db.id !== id);
    this.databases.next(filteredDbs);
    
    if (this.currentDatabase.value?.id === id) {
      this.currentDatabase.next(null);
      this.currentView.next(null);
    }
    
    return of(true);
  }

  // Property Management
  addProperty(databaseId: string, property: Omit<DatabaseProperty, 'id' | 'order'>): Observable<DatabaseProperty | null> {
    return this.getDatabase(databaseId).pipe(
      map(database => {
        if (!database) return null;
        
        const newProperty: DatabaseProperty = {
          ...property,
          id: `prop_${Date.now()}`,
          order: database.properties.length
        };
        
        const updatedDatabase = {
          ...database,
          properties: [...database.properties, newProperty],
          lastEditedTime: new Date()
        };
        
        this.updateDatabaseInList(updatedDatabase);
        return newProperty;
      })
    );
  }

  updateProperty(databaseId: string, propertyId: string, updates: Partial<DatabaseProperty>): Observable<DatabaseProperty | null> {
    return this.getDatabase(databaseId).pipe(
      map(database => {
        if (!database) return null;
        
        const propertyIndex = database.properties.findIndex(p => p.id === propertyId);
        if (propertyIndex === -1) return null;
        
        const updatedProperty = {
          ...database.properties[propertyIndex],
          ...updates
        };
        
        const updatedProperties = [...database.properties];
        updatedProperties[propertyIndex] = updatedProperty;
        
        const updatedDatabase = {
          ...database,
          properties: updatedProperties,
          lastEditedTime: new Date()
        };
        
        this.updateDatabaseInList(updatedDatabase);
        return updatedProperty;
      })
    );
  }

  deleteProperty(databaseId: string, propertyId: string): Observable<boolean> {
    return this.getDatabase(databaseId).pipe(
      map(database => {
        if (!database) return false;
        
        const updatedProperties = database.properties.filter(p => p.id !== propertyId);
        const updatedDatabase = {
          ...database,
          properties: updatedProperties,
          lastEditedTime: new Date()
        };
        
        this.updateDatabaseInList(updatedDatabase);
        return true;
      })
    );
  }

  // Record Management
  addRecord(databaseId: string, properties: Record<string, any>): Observable<DatabaseRecord | null> {
    return this.getDatabase(databaseId).pipe(
      map(database => {
        if (!database) return null;
        
        const newRecord: DatabaseRecord = {
          id: `record_${Date.now()}`,
          properties,
          createdTime: new Date(),
          lastEditedTime: new Date(),
          createdBy: 'current-user',
          lastEditedBy: 'current-user'
        };
        
        const updatedDatabase = {
          ...database,
          records: [...database.records, newRecord],
          lastEditedTime: new Date()
        };
        
        this.updateDatabaseInList(updatedDatabase);
        return newRecord;
      })
    );
  }

  updateRecord(databaseId: string, recordId: string, properties: Record<string, any>): Observable<DatabaseRecord | null> {
    return this.getDatabase(databaseId).pipe(
      map(database => {
        if (!database) return null;
        
        const recordIndex = database.records.findIndex(r => r.id === recordId);
        if (recordIndex === -1) return null;
        
        const updatedRecord = {
          ...database.records[recordIndex],
          properties: { ...database.records[recordIndex].properties, ...properties },
          lastEditedTime: new Date(),
          lastEditedBy: 'current-user'
        };
        
        const updatedRecords = [...database.records];
        updatedRecords[recordIndex] = updatedRecord;
        
        const updatedDatabase = {
          ...database,
          records: updatedRecords,
          lastEditedTime: new Date()
        };
        
        this.updateDatabaseInList(updatedDatabase);
        return updatedRecord;
      })
    );
  }

  deleteRecord(databaseId: string, recordId: string): Observable<boolean> {
    return this.getDatabase(databaseId).pipe(
      map(database => {
        if (!database) return false;
        
        const updatedRecords = database.records.filter(r => r.id !== recordId);
        const updatedDatabase = {
          ...database,
          records: updatedRecords,
          lastEditedTime: new Date()
        };
        
        this.updateDatabaseInList(updatedDatabase);
        return true;
      })
    );
  }

  // View Management
  addView(databaseId: string, view: Omit<DatabaseView, 'id'>): Observable<DatabaseView | null> {
    return this.getDatabase(databaseId).pipe(
      map(database => {
        if (!database) return null;
        
        const newView: DatabaseView = {
          ...view,
          id: `view_${databaseId}_${Date.now()}`
        };
        
        const updatedDatabase = {
          ...database,
          views: [...database.views, newView],
          lastEditedTime: new Date()
        };
        
        this.updateDatabaseInList(updatedDatabase);
        return newView;
      })
    );
  }

  updateView(databaseId: string, viewId: string, updates: Partial<DatabaseView>): Observable<DatabaseView | null> {
    return this.getDatabase(databaseId).pipe(
      map(database => {
        if (!database) return null;
        
        const viewIndex = database.views.findIndex(v => v.id === viewId);
        if (viewIndex === -1) return null;
        
        const updatedView = {
          ...database.views[viewIndex],
          ...updates
        };
        
        const updatedViews = [...database.views];
        updatedViews[viewIndex] = updatedView;
        
        const updatedDatabase = {
          ...database,
          views: updatedViews,
          lastEditedTime: new Date()
        };
        
        this.updateDatabaseInList(updatedDatabase);
        return updatedView;
      })
    );
  }

  deleteView(databaseId: string, viewId: string): Observable<boolean> {
    return this.getDatabase(databaseId).pipe(
      map(database => {
        if (!database) return false;
        
        const updatedViews = database.views.filter(v => v.id !== viewId);
        const updatedDatabase = {
          ...database,
          views: updatedViews,
          lastEditedTime: new Date()
        };
        
        this.updateDatabaseInList(updatedDatabase);
        return true;
      })
    );
  }

  // Data Filtering and Sorting
  getFilteredRecords(databaseId: string, viewId: string): Observable<DatabaseRecord[]> {
    return this.getDatabase(databaseId).pipe(
      map(database => {
        if (!database) return [];
        
        const view = database.views.find(v => v.id === viewId);
        if (!view) return database.records;
        
        let filteredRecords = [...database.records];
        
        // Apply filters
        if (view.filter && view.filter.length > 0) {
          filteredRecords = this.applyFilters(filteredRecords, view.filter);
        }
        
        // Apply sorting
        if (view.sort && view.sort.length > 0) {
          filteredRecords = this.applySorting(filteredRecords, view.sort, database.properties);
        }
        
        return filteredRecords;
      })
    );
  }

  // Current Database and View Management
  setCurrentDatabase(database: Database | null): void {
    this.currentDatabase.next(database);
    if (database) {
      const defaultView = database.views.find(v => v.isDefault) || database.views[0];
      this.currentView.next(defaultView || null);
    } else {
      this.currentView.next(null);
    }
  }

  getCurrentDatabase(): Observable<Database | null> {
    return this.currentDatabase.asObservable();
  }

  setCurrentView(view: DatabaseView | null): void {
    this.currentView.next(view);
  }

  getCurrentView(): Observable<DatabaseView | null> {
    return this.currentView.asObservable();
  }

  // Statistics
  getDatabaseStats(databaseId: string): Observable<DatabaseStats> {
    return this.getDatabase(databaseId).pipe(
      map(database => {
        if (!database) {
          return {
            totalRecords: 0,
            totalViews: 0,
            lastUpdated: new Date()
          };
        }
        
        return {
          totalRecords: database.records.length,
          totalViews: database.views.length,
          lastUpdated: database.lastEditedTime,
          mostActiveProperty: this.getMostActiveProperty(database),
          recordGrowth: this.calculateRecordGrowth(database)
        };
      })
    );
  }

  // Templates
  getDatabaseTemplates(): Observable<DatabaseTemplate[]> {
    const templates: DatabaseTemplate[] = [
      {
        id: 'template_tasks',
        name: 'Task Tracker',
        description: 'Track tasks and projects',
        icon: '✅',
        category: 'Productivity',
        tags: ['tasks', 'projects', 'productivity'],
        properties: [
          { id: 'title', name: 'Task', type: 'title', required: true, order: 0 },
          { id: 'status', name: 'Status', type: 'select', order: 1, options: [
            { id: 'todo', name: 'To Do', color: '#ff6b6b' },
            { id: 'in_progress', name: 'In Progress', color: '#4ecdc4' },
            { id: 'done', name: 'Done', color: '#45b7d1' }
          ]},
          { id: 'priority', name: 'Priority', type: 'select', order: 2, options: [
            { id: 'low', name: 'Low', color: '#95a5a6' },
            { id: 'medium', name: 'Medium', color: '#f39c12' },
            { id: 'high', name: 'High', color: '#e74c3c' }
          ]},
          { id: 'due_date', name: 'Due Date', type: 'date', order: 3 },
          { id: 'assignee', name: 'Assignee', type: 'person', order: 4 }
        ]
      },
      {
        id: 'template_contacts',
        name: 'Contact List',
        description: 'Manage contacts and relationships',
        icon: '👥',
        category: 'Business',
        tags: ['contacts', 'business', 'people'],
        properties: [
          { id: 'title', name: 'Name', type: 'title', required: true, order: 0 },
          { id: 'email', name: 'Email', type: 'email', order: 1 },
          { id: 'phone', name: 'Phone', type: 'phone', order: 2 },
          { id: 'company', name: 'Company', type: 'text', order: 3 },
          { id: 'role', name: 'Role', type: 'text', order: 4 },
          { id: 'category', name: 'Category', type: 'select', order: 5, options: [
            { id: 'client', name: 'Client', color: '#3498db' },
            { id: 'vendor', name: 'Vendor', color: '#e67e22' },
            { id: 'partner', name: 'Partner', color: '#9b59b6' },
            { id: 'personal', name: 'Personal', color: '#2ecc71' }
          ]}
        ]
      },
      {
        id: 'template_inventory',
        name: 'Inventory Tracker',
        description: 'Track inventory and stock levels',
        icon: '📦',
        category: 'Business',
        tags: ['inventory', 'stock', 'business'],
        properties: [
          { id: 'title', name: 'Item Name', type: 'title', required: true, order: 0 },
          { id: 'sku', name: 'SKU', type: 'text', order: 1 },
          { id: 'quantity', name: 'Quantity', type: 'number', order: 2 },
          { id: 'price', name: 'Price', type: 'number', order: 3 },
          { id: 'category', name: 'Category', type: 'select', order: 4, options: [
            { id: 'electronics', name: 'Electronics', color: '#3498db' },
            { id: 'clothing', name: 'Clothing', color: '#e67e22' },
            { id: 'books', name: 'Books', color: '#9b59b6' },
            { id: 'other', name: 'Other', color: '#95a5a6' }
          ]},
          { id: 'supplier', name: 'Supplier', type: 'text', order: 5 },
          { id: 'last_restocked', name: 'Last Restocked', type: 'date', order: 6 }
        ]
      }
    ];
    
    return of(templates);
  }

  createDatabaseFromTemplate(template: DatabaseTemplate, name: string): Observable<Database> {
    const database: Database = {
      id: `db_${Date.now()}`,
      name,
      description: template.description,
      icon: template.icon,
      properties: template.properties.map(p => ({ ...p, id: `prop_${Date.now()}_${Math.random()}` })),
      records: template.sampleRecords || [],
      views: [createDefaultView(`db_${Date.now()}`)],
      createdTime: new Date(),
      lastEditedTime: new Date(),
      createdBy: 'current-user',
      lastEditedBy: 'current-user'
    };
    
    const currentDbs = this.databases.value;
    this.databases.next([...currentDbs, database]);
    return of(database);
  }

  // Private helper methods
  private updateDatabaseInList(updatedDatabase: Database): void {
    const currentDbs = this.databases.value;
    const index = currentDbs.findIndex(db => db.id === updatedDatabase.id);
    
    if (index !== -1) {
      currentDbs[index] = updatedDatabase;
      this.databases.next([...currentDbs]);
      
      if (this.currentDatabase.value?.id === updatedDatabase.id) {
        this.currentDatabase.next(updatedDatabase);
      }
    }
  }

  private applyFilters(records: DatabaseRecord[], filters: FilterConfig[]): DatabaseRecord[] {
    return records.filter(record => {
      return filters.every(filter => {
        const value = record.properties[filter.propertyId];
        
        switch (filter.operator) {
          case 'equals':
            return value === filter.value;
          case 'does_not_equal':
            return value !== filter.value;
          case 'contains':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'does_not_contain':
            return !String(value).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'is_empty':
            return !value || value === '';
          case 'is_not_empty':
            return value && value !== '';
          case 'greater_than':
            return Number(value) > Number(filter.value);
          case 'less_than':
            return Number(value) < Number(filter.value);
          default:
            return true;
        }
      });
    });
  }

  private applySorting(records: DatabaseRecord[], sortConfigs: SortConfig[], properties: DatabaseProperty[]): DatabaseRecord[] {
    return records.sort((a, b) => {
      for (const sortConfig of sortConfigs) {
        const aValue = a.properties[sortConfig.propertyId];
        const bValue = b.properties[sortConfig.propertyId];
        
        let comparison = 0;
        
        if (aValue < bValue) comparison = -1;
        else if (aValue > bValue) comparison = 1;
        
        if (sortConfig.direction === 'desc') comparison *= -1;
        
        if (comparison !== 0) return comparison;
      }
      
      return 0;
    });
  }

  private getMostActiveProperty(database: Database): string | undefined {
    // Simple implementation - could be enhanced with usage tracking
    return database.properties.find(p => p.type === 'title')?.id;
  }

  private calculateRecordGrowth(database: Database): number {
    // Simple implementation - could be enhanced with historical data
    return database.records.length;
  }

  private initializeSampleData(): void {
    const sampleDatabases: Database[] = [
      {
        id: 'sample_tasks',
        name: 'My Tasks',
        description: 'Personal task tracker',
        icon: '✅',
        properties: [
          { id: 'title', name: 'Task', type: 'title', required: true, order: 0, width: 200 },
          { id: 'status', name: 'Status', type: 'select', order: 1, width: 120, options: [
            { id: 'todo', name: 'To Do', color: '#ff6b6b' },
            { id: 'in_progress', name: 'In Progress', color: '#4ecdc4' },
            { id: 'done', name: 'Done', color: '#45b7d1' }
          ]},
          { id: 'priority', name: 'Priority', type: 'select', order: 2, width: 100, options: [
            { id: 'low', name: 'Low', color: '#95a5a6' },
            { id: 'medium', name: 'Medium', color: '#f39c12' },
            { id: 'high', name: 'High', color: '#e74c3c' }
          ]},
          { id: 'due_date', name: 'Due Date', type: 'date', order: 3, width: 120 },
          { id: 'created_time', name: 'Created', type: 'created_time', order: 4, width: 150 }
        ],
        records: [
          {
            id: 'task_1',
            properties: {
              title: 'Complete database implementation',
              status: 'in_progress',
              priority: 'high',
              due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            },
            createdTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            lastEditedTime: new Date(),
            createdBy: 'current-user',
            lastEditedBy: 'current-user'
          },
          {
            id: 'task_2',
            properties: {
              title: 'Review code changes',
              status: 'todo',
              priority: 'medium',
              due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
            },
            createdTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            lastEditedTime: new Date(),
            createdBy: 'current-user',
            lastEditedBy: 'current-user'
          }
        ],
        views: [
          {
            id: 'view_table',
            name: 'Table',
            type: 'table',
            visibleProperties: ['title', 'status', 'priority', 'due_date', 'created_time'],
            isDefault: true
          },
          {
            id: 'view_board',
            name: 'Board',
            type: 'board',
            visibleProperties: ['title', 'priority', 'due_date'],
            groupBy: 'status'
          }
        ],
        createdTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        lastEditedTime: new Date(),
        createdBy: 'current-user',
        lastEditedBy: 'current-user'
      }
    ];
    
    this.databases.next(sampleDatabases);
  }
} 