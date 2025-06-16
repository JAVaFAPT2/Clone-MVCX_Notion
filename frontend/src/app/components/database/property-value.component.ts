import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatabaseProperty, PropertyType } from '../../models/database.model';

@Component({
  selector: 'app-property-value',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="property-value" [ngClass]="'type-' + property.type">
      <!-- Title Property -->
      <div *ngIf="property.type === 'title'" class="title-value">
        {{ value || 'Untitled' }}
      </div>

      <!-- Text Property -->
      <div *ngIf="property.type === 'text'" class="text-value">
        {{ value || '' }}
      </div>

      <!-- Number Property -->
      <div *ngIf="property.type === 'number'" class="number-value">
        {{ value || 0 }}
      </div>

      <!-- Select Property -->
      <div *ngIf="property.type === 'select'" class="select-value">
        <span 
          *ngIf="value" 
          class="select-option"
          [style.background-color]="getOptionColor(value)"
        >
          {{ value }}
        </span>
        <span *ngIf="!value" class="empty-value">-</span>
      </div>

      <!-- Multi-Select Property -->
      <div *ngIf="property.type === 'multi_select'" class="multi-select-value">
        <span 
          *ngFor="let option of getMultiSelectValues(value)"
          class="select-option"
          [style.background-color]="getOptionColor(option)"
        >
          {{ option }}
        </span>
        <span *ngIf="!value || getMultiSelectValues(value).length === 0" class="empty-value">-</span>
      </div>

      <!-- Date Property -->
      <div *ngIf="property.type === 'date'" class="date-value">
        {{ value ? (value | date:'shortDate') : '-' }}
      </div>

      <!-- Person Property -->
      <div *ngIf="property.type === 'person'" class="person-value">
        <span *ngIf="value" class="person-avatar">
          {{ getInitials(value) }}
        </span>
        <span *ngIf="!value" class="empty-value">-</span>
      </div>

      <!-- Files Property -->
      <div *ngIf="property.type === 'files'" class="files-value">
        <span *ngIf="value && getFilesCount(value) > 0" class="files-count">
          {{ getFilesCount(value) }} file{{ getFilesCount(value) !== 1 ? 's' : '' }}
        </span>
        <span *ngIf="!value || getFilesCount(value) === 0" class="empty-value">-</span>
      </div>

      <!-- Checkbox Property -->
      <div *ngIf="property.type === 'checkbox'" class="checkbox-value">
        <span class="checkbox-icon" [class.checked]="value">
          {{ value ? '☑' : '☐' }}
        </span>
      </div>

      <!-- URL Property -->
      <div *ngIf="property.type === 'url'" class="url-value">
        <a *ngIf="value" [href]="value" target="_blank" class="url-link">
          {{ getUrlDisplay(value) }}
        </a>
        <span *ngIf="!value" class="empty-value">-</span>
      </div>

      <!-- Email Property -->
      <div *ngIf="property.type === 'email'" class="email-value">
        <a *ngIf="value" [href]="'mailto:' + value" class="email-link">
          {{ value }}
        </a>
        <span *ngIf="!value" class="empty-value">-</span>
      </div>

      <!-- Phone Property -->
      <div *ngIf="property.type === 'phone'" class="phone-value">
        <a *ngIf="value" [href]="'tel:' + value" class="phone-link">
          {{ value }}
        </a>
        <span *ngIf="!value" class="empty-value">-</span>
      </div>

      <!-- Formula Property -->
      <div *ngIf="property.type === 'formula'" class="formula-value">
        {{ value || '0' }}
      </div>

      <!-- Created Time Property -->
      <div *ngIf="property.type === 'created_time'" class="created-time-value">
        {{ value ? (value | date:'medium') : '-' }}
      </div>

      <!-- Last Edited Time Property -->
      <div *ngIf="property.type === 'last_edited_time'" class="last-edited-time-value">
        {{ value ? (value | date:'medium') : '-' }}
      </div>

      <!-- Created By Property -->
      <div *ngIf="property.type === 'created_by'" class="created-by-value">
        <span *ngIf="value" class="person-avatar">
          {{ getInitials(value) }}
        </span>
        <span *ngIf="!value" class="empty-value">-</span>
      </div>

      <!-- Last Edited By Property -->
      <div *ngIf="property.type === 'last_edited_by'" class="last-edited-by-value">
        <span *ngIf="value" class="person-avatar">
          {{ getInitials(value) }}
        </span>
        <span *ngIf="!value" class="empty-value">-</span>
      </div>
    </div>
  `,
  styles: [`
    .property-value {
      display: flex;
      align-items: center;
      min-height: 24px;
      font-size: 14px;
    }

    .title-value {
      font-weight: 500;
      color: #333;
    }

    .text-value {
      color: #333;
      word-break: break-word;
    }

    .number-value {
      color: #333;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
    }

    .select-value,
    .multi-select-value {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }

    .select-option {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      color: white;
      background: #6c757d;
    }

    .multi-select-value .select-option {
      margin-bottom: 2px;
    }

    .date-value {
      color: #666;
      font-size: 13px;
    }

    .person-value,
    .created-by-value,
    .last-edited-by-value {
      display: flex;
      align-items: center;
    }

    .person-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #007bff;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 500;
    }

    .files-value {
      color: #666;
      font-size: 13px;
    }

    .files-count {
      color: #007bff;
    }

    .checkbox-value {
      display: flex;
      align-items: center;
    }

    .checkbox-icon {
      font-size: 16px;
      color: #ccc;
    }

    .checkbox-icon.checked {
      color: #28a745;
    }

    .url-value,
    .email-value,
    .phone-value {
      display: flex;
      align-items: center;
    }

    .url-link,
    .email-link,
    .phone-link {
      color: #007bff;
      text-decoration: none;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .url-link:hover,
    .email-link:hover,
    .phone-link:hover {
      text-decoration: underline;
    }

    .formula-value {
      color: #333;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
    }

    .created-time-value,
    .last-edited-time-value {
      color: #666;
      font-size: 13px;
    }

    .empty-value {
      color: #ccc;
      font-style: italic;
    }

    /* Type-specific styling */
    .type-title {
      font-weight: 500;
    }

    .type-number {
      text-align: right;
    }

    .type-checkbox {
      justify-content: center;
    }

    .type-date,
    .type-created_time,
    .type-last_edited_time {
      color: #666;
    }
  `]
})
export class PropertyValueComponent {
  @Input() property!: DatabaseProperty;
  @Input() value: any;

  getOptionColor(optionName: string): string {
    if (!this.property.options) return '#6c757d';
    
    const option = this.property.options.find(opt => opt.name === optionName);
    return option?.color || '#6c757d';
  }

  getMultiSelectValues(value: any): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return [value];
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getFilesCount(value: any): number {
    if (!value) return 0;
    if (Array.isArray(value)) return value.length;
    return 1;
  }

  getUrlDisplay(url: string): string {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + urlObj.pathname;
    } catch {
      return url;
    }
  }
} 