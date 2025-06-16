import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatabaseProperty, PropertyType } from '../../models/database.model';

@Component({
  selector: 'app-database-properties-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="properties-panel">
      <div class="properties-header">
        <h3 class="properties-title">Properties</h3>
        <button class="btn btn-sm btn-primary" (click)="onAddProperty()">
          <span class="icon">+</span>
        </button>
      </div>

      <div class="properties-list">
        <div 
          *ngFor="let property of properties; trackBy: trackByPropertyId"
          class="property-item"
          [class.visible]="isPropertyVisible(property)"
          [class.required]="property.required"
        >
          <div class="property-info">
            <span class="property-icon">{{ getPropertyIcon(property.type) }}</span>
            <div class="property-details">
              <span class="property-name">{{ property.name }}</span>
              <span class="property-type">{{ getPropertyTypeLabel(property.type) }}</span>
            </div>
            <div class="property-badges">
              <span class="badge required" *ngIf="property.required">Required</span>
              <span class="badge unique" *ngIf="property.unique">Unique</span>
            </div>
          </div>
          
          <div class="property-actions">
            <button 
              class="btn btn-sm btn-icon"
              [class.visible-toggle]="true"
              [class.visible]="isPropertyVisible(property)"
              (click)="onToggleVisibility(property); $event.stopPropagation()"
              [title]="isPropertyVisible(property) ? 'Hide property' : 'Show property'"
            >
              {{ isPropertyVisible(property) ? '👁️' : '🙈' }}
            </button>
            <button 
              class="btn btn-sm btn-icon"
              (click)="onPropertyEdit(property); $event.stopPropagation()"
              title="Edit property"
            >
              ✏️
            </button>
            <button 
              class="btn btn-sm btn-icon btn-danger"
              (click)="onPropertyDelete(property.id); $event.stopPropagation()"
              title="Delete property"
              [disabled]="property.type === 'title'"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      <!-- Property Type Legend -->
      <div class="property-legend">
        <h4 class="legend-title">Property Types</h4>
        <div class="legend-items">
          <div class="legend-item">
            <span class="legend-icon">📝</span>
            <span class="legend-text">Title</span>
          </div>
          <div class="legend-item">
            <span class="legend-icon">📄</span>
            <span class="legend-text">Text</span>
          </div>
          <div class="legend-item">
            <span class="legend-icon">🔢</span>
            <span class="legend-text">Number</span>
          </div>
          <div class="legend-item">
            <span class="legend-icon">🏷️</span>
            <span class="legend-text">Select</span>
          </div>
          <div class="legend-item">
            <span class="legend-icon">📅</span>
            <span class="legend-text">Date</span>
          </div>
          <div class="legend-item">
            <span class="legend-icon">👤</span>
            <span class="legend-text">Person</span>
          </div>
          <div class="legend-item">
            <span class="legend-icon">☑️</span>
            <span class="legend-text">Checkbox</span>
          </div>
          <div class="legend-item">
            <span class="legend-icon">🔗</span>
            <span class="legend-text">URL</span>
          </div>
          <div class="legend-item">
            <span class="legend-icon">📧</span>
            <span class="legend-text">Email</span>
          </div>
          <div class="legend-item">
            <span class="legend-icon">📱</span>
            <span class="legend-text">Phone</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .properties-panel {
      width: 280px;
      background: white;
      border-left: 1px solid #e0e0e0;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .properties-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
      background: #f8f9fa;
    }

    .properties-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .properties-list {
      flex: 1;
      overflow-y: auto;
      padding: 8px 0;
    }

    .property-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
      cursor: pointer;
      transition: all 0.2s;
      border-left: 3px solid transparent;
    }

    .property-item:hover {
      background: #f8f9fa;
    }

    .property-item.visible {
      border-left-color: #28a745;
    }

    .property-item.required {
      background: #fff3cd;
    }

    .property-item.required:hover {
      background: #ffeaa7;
    }

    .property-info {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 0;
    }

    .property-icon {
      font-size: 16px;
      width: 20px;
      text-align: center;
    }

    .property-details {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .property-name {
      font-size: 14px;
      color: #333;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .property-type {
      font-size: 11px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .property-badges {
      display: flex;
      gap: 4px;
    }

    .badge {
      font-size: 9px;
      padding: 1px 4px;
      border-radius: 8px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .badge.required {
      background: #dc3545;
      color: white;
    }

    .badge.unique {
      background: #17a2b8;
      color: white;
    }

    .property-actions {
      display: flex;
      gap: 2px;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .property-item:hover .property-actions {
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

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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

    .btn-icon.visible-toggle.visible {
      color: #28a745;
    }

    .btn-icon.visible-toggle:not(.visible) {
      color: #6c757d;
    }

    .btn-danger {
      color: #dc3545;
    }

    .btn-danger:hover {
      background: #dc3545;
      color: white;
    }

    .property-legend {
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
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .legend-icon {
      font-size: 12px;
      width: 14px;
      text-align: center;
    }

    .legend-text {
      font-size: 11px;
      color: #666;
    }

    .icon {
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .properties-panel {
        width: 100%;
        height: auto;
        border-left: none;
        border-top: 1px solid #e0e0e0;
      }

      .properties-list {
        max-height: 200px;
      }

      .legend-items {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DatabasePropertiesPanelComponent {
  @Input() properties: DatabaseProperty[] = [];
  @Input() currentView: any = null;
  
  @Output() propertyUpdate = new EventEmitter<DatabaseProperty>();
  @Output() propertyDelete = new EventEmitter<string>();
  @Output() propertyAdd = new EventEmitter<void>();
  @Output() propertyToggleVisibility = new EventEmitter<DatabaseProperty>();

  onPropertyEdit(property: DatabaseProperty): void {
    this.propertyUpdate.emit(property);
  }

  onPropertyDelete(propertyId: string): void {
    if (confirm('Are you sure you want to delete this property?')) {
      this.propertyDelete.emit(propertyId);
    }
  }

  onAddProperty(): void {
    this.propertyAdd.emit();
  }

  onToggleVisibility(property: DatabaseProperty): void {
    this.propertyToggleVisibility.emit(property);
  }

  isPropertyVisible(property: DatabaseProperty): boolean {
    if (!this.currentView || !this.currentView.visibleProperties) {
      return true;
    }
    return this.currentView.visibleProperties.includes(property.id);
  }

  getPropertyIcon(type: PropertyType): string {
    const icons: Record<PropertyType, string> = {
      title: '📝',
      text: '📄',
      number: '🔢',
      select: '🏷️',
      multi_select: '🏷️',
      date: '📅',
      person: '👤',
      files: '📁',
      checkbox: '☑️',
      url: '🔗',
      email: '📧',
      phone: '📱',
      formula: '🧮',
      relation: '🔗',
      rollup: '📊',
      created_time: '⏰',
      created_by: '👤',
      last_edited_time: '⏰',
      last_edited_by: '👤'
    };
    return icons[type] || '❓';
  }

  getPropertyTypeLabel(type: PropertyType): string {
    const labels: Record<PropertyType, string> = {
      title: 'Title',
      text: 'Text',
      number: 'Number',
      select: 'Select',
      multi_select: 'Multi-select',
      date: 'Date',
      person: 'Person',
      files: 'Files',
      checkbox: 'Checkbox',
      url: 'URL',
      email: 'Email',
      phone: 'Phone',
      formula: 'Formula',
      relation: 'Relation',
      rollup: 'Rollup',
      created_time: 'Created Time',
      created_by: 'Created By',
      last_edited_time: 'Last Edited Time',
      last_edited_by: 'Last Edited By'
    };
    return labels[type] || 'Unknown';
  }

  trackByPropertyId(index: number, property: DatabaseProperty): string {
    return property.id;
  }
} 