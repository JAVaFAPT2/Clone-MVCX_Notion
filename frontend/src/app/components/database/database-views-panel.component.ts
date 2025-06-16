import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatabaseView, ViewType } from '../../models/database.model';

@Component({
  selector: 'app-database-views-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="views-panel">
      <div class="views-header">
        <h3 class="views-title">Views</h3>
        <button class="btn btn-sm btn-primary" (click)="onAddView()">
          <span class="icon">+</span>
        </button>
      </div>

      <div class="views-list">
        <div 
          *ngFor="let view of views; trackBy: trackByViewId"
          class="view-item"
          [class.active]="currentView?.id === view.id"
          (click)="onViewSelect(view)"
        >
          <div class="view-info">
            <span class="view-icon">{{ getViewIcon(view.type) }}</span>
            <span class="view-name">{{ view.name }}</span>
            <span class="view-badge" *ngIf="view.isDefault">Default</span>
          </div>
          
          <div class="view-actions" *ngIf="!view.isDefault">
            <button 
              class="btn btn-sm btn-icon"
              (click)="onViewEdit(view); $event.stopPropagation()"
              title="Edit view"
            >
              ✏️
            </button>
            <button 
              class="btn btn-sm btn-icon"
              (click)="onViewDuplicate(view); $event.stopPropagation()"
              title="Duplicate view"
            >
              📋
            </button>
            <button 
              class="btn btn-sm btn-icon btn-danger"
              (click)="onViewDelete(view.id); $event.stopPropagation()"
              title="Delete view"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      <!-- View Type Legend -->
      <div class="view-legend">
        <h4 class="legend-title">View Types</h4>
        <div class="legend-items">
          <div class="legend-item">
            <span class="legend-icon">📊</span>
            <span class="legend-text">Table</span>
          </div>
          <div class="legend-item">
            <span class="legend-icon">📋</span>
            <span class="legend-text">Board</span>
          </div>
          <div class="legend-item">
            <span class="legend-icon">📝</span>
            <span class="legend-text">List</span>
          </div>
          <div class="legend-item">
            <span class="legend-icon">🖼️</span>
            <span class="legend-text">Gallery</span>
          </div>
          <div class="legend-item">
            <span class="legend-icon">📅</span>
            <span class="legend-text">Calendar</span>
          </div>
          <div class="legend-item">
            <span class="legend-icon">⏰</span>
            <span class="legend-text">Timeline</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .views-panel {
      width: 250px;
      background: white;
      border-right: 1px solid #e0e0e0;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .views-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
      background: #f8f9fa;
    }

    .views-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .views-list {
      flex: 1;
      overflow-y: auto;
      padding: 8px 0;
    }

    .view-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
      cursor: pointer;
      transition: background-color 0.2s;
      border-left: 3px solid transparent;
    }

    .view-item:hover {
      background: #f8f9fa;
    }

    .view-item.active {
      background: #e3f2fd;
      border-left-color: #007bff;
    }

    .view-info {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 0;
    }

    .view-icon {
      font-size: 16px;
      width: 20px;
      text-align: center;
    }

    .view-name {
      font-size: 14px;
      color: #333;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .view-badge {
      background: #28a745;
      color: white;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 10px;
      font-weight: 500;
    }

    .view-actions {
      display: flex;
      gap: 2px;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .view-item:hover .view-actions {
      opacity: 1;
    }

    .btn {
      padding: 4px 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s;
    }

    .btn:hover {
      background: #f8f9fa;
    }

    .btn-sm {
      padding: 2px 4px;
      font-size: 10px;
    }

    .btn-primary {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }

    .btn-primary:hover {
      background: #0056b3;
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

    .view-legend {
      padding: 16px;
      border-top: 1px solid #e0e0e0;
      background: #f8f9fa;
    }

    .legend-title {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: #666;
    }

    .legend-items {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .legend-icon {
      font-size: 14px;
      width: 16px;
      text-align: center;
    }

    .legend-text {
      font-size: 12px;
      color: #666;
    }

    .icon {
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .views-panel {
        width: 100%;
        height: auto;
        border-right: none;
        border-bottom: 1px solid #e0e0e0;
      }

      .views-list {
        max-height: 200px;
      }
    }
  `]
})
export class DatabaseViewsPanelComponent {
  @Input() views: DatabaseView[] = [];
  @Input() currentView: DatabaseView | null = null;
  
  @Output() viewSelect = new EventEmitter<DatabaseView>();
  @Output() viewUpdate = new EventEmitter<DatabaseView>();
  @Output() viewDelete = new EventEmitter<string>();
  @Output() viewAdd = new EventEmitter<void>();
  @Output() viewDuplicate = new EventEmitter<DatabaseView>();

  onViewSelect(view: DatabaseView): void {
    this.viewSelect.emit(view);
  }

  onViewEdit(view: DatabaseView): void {
    this.viewUpdate.emit(view);
  }

  onViewDelete(viewId: string): void {
    if (confirm('Are you sure you want to delete this view?')) {
      this.viewDelete.emit(viewId);
    }
  }

  onAddView(): void {
    this.viewAdd.emit();
  }

  onViewDuplicate(view: DatabaseView): void {
    this.viewDuplicate.emit(view);
  }

  getViewIcon(type: ViewType): string {
    const icons: Record<ViewType, string> = {
      table: '📊',
      board: '📋',
      list: '📝',
      gallery: '🖼️',
      calendar: '📅',
      timeline: '⏰'
    };
    return icons[type] || '👁️';
  }

  trackByViewId(index: number, view: DatabaseView): string {
    return view.id;
  }
} 