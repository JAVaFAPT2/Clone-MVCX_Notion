import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseProperty, PropertyType } from '../../models/database.model';

@Component({
  selector: 'app-property-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="property-editor" [ngClass]="'type-' + property.type">
      <!-- Title Property Editor -->
      <input 
        *ngIf="property.type === 'title'"
        #titleInput
        type="text" 
        [(ngModel)]="editValue"
        (keydown)="onKeyDown($event)"
        (blur)="onBlur()"
        class="title-input"
        placeholder="Untitled"
        autofocus
      >

      <!-- Text Property Editor -->
      <textarea 
        *ngIf="property.type === 'text'"
        #textInput
        [(ngModel)]="editValue"
        (keydown)="onKeyDown($event)"
        (blur)="onBlur()"
        class="text-input"
        placeholder="Enter text..."
        rows="2"
        autofocus
      ></textarea>

      <!-- Number Property Editor -->
      <input 
        *ngIf="property.type === 'number'"
        #numberInput
        type="number" 
        [(ngModel)]="editValue"
        (keydown)="onKeyDown($event)"
        (blur)="onBlur()"
        class="number-input"
        autofocus
      >

      <!-- Select Property Editor -->
      <select 
        *ngIf="property.type === 'select'"
        #selectInput
        [(ngModel)]="editValue"
        (change)="onSave()"
        (blur)="onBlur()"
        class="select-input"
        autofocus
      >
        <option value="">Select an option</option>
        <option 
          *ngFor="let option of property.options" 
          [value]="option.name"
          [style.color]="option.color"
        >
          {{ option.name }}
        </option>
      </select>

      <!-- Multi-Select Property Editor -->
      <div *ngIf="property.type === 'multi_select'" class="multi-select-editor">
        <div class="selected-options">
          <span 
            *ngFor="let option of selectedOptions; let i = index"
            class="selected-option"
            [style.background-color]="getOptionColor(option)"
          >
            {{ option }}
            <button 
              type="button" 
              class="remove-option"
              (click)="removeOption(i)"
            >
              ×
            </button>
          </span>
        </div>
        <select 
          #multiSelectInput
          (change)="addOption($event)"
          (blur)="onBlur()"
          class="multi-select-input"
        >
          <option value="">Add option...</option>
          <option 
            *ngFor="let option of availableOptions" 
            [value]="option.name"
          >
            {{ option.name }}
          </option>
        </select>
      </div>

      <!-- Date Property Editor -->
      <input 
        *ngIf="property.type === 'date'"
        #dateInput
        type="date" 
        [value]="getDateValue()"
        (change)="onDateChange($event)"
        (blur)="onBlur()"
        class="date-input"
        autofocus
      >

      <!-- Person Property Editor -->
      <input 
        *ngIf="property.type === 'person'"
        #personInput
        type="text" 
        [(ngModel)]="editValue"
        (keydown)="onKeyDown($event)"
        (blur)="onBlur()"
        class="person-input"
        placeholder="Enter person name..."
        autofocus
      >

      <!-- Checkbox Property Editor -->
      <input 
        *ngIf="property.type === 'checkbox'"
        #checkboxInput
        type="checkbox" 
        [checked]="editValue"
        (change)="onCheckboxChange($event)"
        (blur)="onBlur()"
        class="checkbox-input"
        autofocus
      >

      <!-- URL Property Editor -->
      <input 
        *ngIf="property.type === 'url'"
        #urlInput
        type="url" 
        [(ngModel)]="editValue"
        (keydown)="onKeyDown($event)"
        (blur)="onBlur()"
        class="url-input"
        placeholder="https://example.com"
        autofocus
      >

      <!-- Email Property Editor -->
      <input 
        *ngIf="property.type === 'email'"
        #emailInput
        type="email" 
        [(ngModel)]="editValue"
        (keydown)="onKeyDown($event)"
        (blur)="onBlur()"
        class="email-input"
        placeholder="user@example.com"
        autofocus
      >

      <!-- Phone Property Editor -->
      <input 
        *ngIf="property.type === 'phone'"
        #phoneInput
        type="tel" 
        [(ngModel)]="editValue"
        (keydown)="onKeyDown($event)"
        (blur)="onBlur()"
        class="phone-input"
        placeholder="+1 (555) 123-4567"
        autofocus
      >

      <!-- Formula Property Editor (Read-only) -->
      <div *ngIf="property.type === 'formula'" class="formula-display">
        {{ editValue || '0' }}
      </div>

      <!-- Created Time Property (Read-only) -->
      <div *ngIf="property.type === 'created_time'" class="created-time-display">
        {{ editValue ? (editValue | date:'medium') : '-' }}
      </div>

      <!-- Last Edited Time Property (Read-only) -->
      <div *ngIf="property.type === 'last_edited_time'" class="last-edited-time-display">
        {{ editValue ? (editValue | date:'medium') : '-' }}
      </div>

      <!-- Created By Property (Read-only) -->
      <div *ngIf="property.type === 'created_by'" class="created-by-display">
        <span *ngIf="editValue" class="person-avatar">
          {{ getInitials(editValue) }}
        </span>
        <span *ngIf="!editValue" class="empty-value">-</span>
      </div>

      <!-- Last Edited By Property (Read-only) -->
      <div *ngIf="property.type === 'last_edited_by'" class="last-edited-by-display">
        <span *ngIf="editValue" class="person-avatar">
          {{ getInitials(editValue) }}
        </span>
        <span *ngIf="!editValue" class="empty-value">-</span>
      </div>

      <!-- Action Buttons for Multi-Select -->
      <div *ngIf="property.type === 'multi_select'" class="editor-actions">
        <button type="button" class="btn btn-sm btn-primary" (click)="onSave()">
          Save
        </button>
        <button type="button" class="btn btn-sm btn-secondary" (click)="onCancel()">
          Cancel
        </button>
      </div>
    </div>
  `,
  styles: [`
    .property-editor {
      display: flex;
      align-items: center;
      min-height: 24px;
      padding: 2px;
    }

    .title-input,
    .text-input,
    .number-input,
    .select-input,
    .date-input,
    .person-input,
    .url-input,
    .email-input,
    .phone-input {
      width: 100%;
      padding: 4px 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      outline: none;
    }

    .title-input:focus,
    .text-input:focus,
    .number-input:focus,
    .select-input:focus,
    .date-input:focus,
    .person-input:focus,
    .url-input:focus,
    .email-input:focus,
    .phone-input:focus {
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }

    .text-input {
      resize: vertical;
      min-height: 60px;
    }

    .number-input {
      text-align: right;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
    }

    .checkbox-input {
      width: 16px;
      height: 16px;
      margin: 0;
    }

    .multi-select-editor {
      width: 100%;
    }

    .selected-options {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-bottom: 4px;
    }

    .selected-option {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      color: white;
      background: #6c757d;
    }

    .remove-option {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 14px;
      padding: 0;
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }

    .remove-option:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .multi-select-input {
      width: 100%;
      padding: 4px 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .formula-display,
    .created-time-display,
    .last-edited-time-display,
    .created-by-display,
    .last-edited-by-display {
      color: #666;
      font-size: 13px;
      font-style: italic;
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

    .empty-value {
      color: #ccc;
      font-style: italic;
    }

    .editor-actions {
      display: flex;
      gap: 4px;
      margin-top: 4px;
    }

    .btn {
      padding: 4px 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      font-size: 12px;
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
      padding: 2px 6px;
      font-size: 11px;
    }

    /* Type-specific styling */
    .type-number {
      justify-content: flex-end;
    }

    .type-checkbox {
      justify-content: center;
    }

    .type-formula,
    .type-created_time,
    .type-last_edited_time,
    .type-created_by,
    .type-last_edited_by {
      pointer-events: none;
    }
  `]
})
export class PropertyEditorComponent implements OnInit {
  @Input() property!: DatabaseProperty;
  @Input() value: any;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  @ViewChild('titleInput') titleInput?: ElementRef<HTMLInputElement>;
  @ViewChild('textInput') textInput?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('numberInput') numberInput?: ElementRef<HTMLInputElement>;
  @ViewChild('selectInput') selectInput?: ElementRef<HTMLSelectElement>;
  @ViewChild('dateInput') dateInput?: ElementRef<HTMLInputElement>;
  @ViewChild('personInput') personInput?: ElementRef<HTMLInputElement>;
  @ViewChild('checkboxInput') checkboxInput?: ElementRef<HTMLInputElement>;
  @ViewChild('urlInput') urlInput?: ElementRef<HTMLInputElement>;
  @ViewChild('emailInput') emailInput?: ElementRef<HTMLInputElement>;
  @ViewChild('phoneInput') phoneInput?: ElementRef<HTMLInputElement>;
  @ViewChild('multiSelectInput') multiSelectInput?: ElementRef<HTMLSelectElement>;

  editValue: any;
  selectedOptions: string[] = [];

  ngOnInit(): void {
    this.editValue = this.value;
    
    if (this.property.type === 'multi_select') {
      this.selectedOptions = Array.isArray(this.value) ? [...this.value] : (this.value ? [this.value] : []);
    }
  }

  get availableOptions(): any[] {
    if (!this.property.options) return [];
    return this.property.options.filter(option => 
      !this.selectedOptions.includes(option.name)
    );
  }

  getOptionColor(optionName: string): string {
    if (!this.property.options) return '#6c757d';
    
    const option = this.property.options.find(opt => opt.name === optionName);
    return option?.color || '#6c757d';
  }

  getDateValue(): string {
    if (!this.editValue) return '';
    const date = new Date(this.editValue);
    return date.toISOString().split('T')[0];
  }

  onDateChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.editValue = target.value ? new Date(target.value) : null;
    this.onSave();
  }

  onCheckboxChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.editValue = target.checked;
    this.onSave();
  }

  addOption(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const optionName = target.value;
    if (optionName && !this.selectedOptions.includes(optionName)) {
      this.selectedOptions.push(optionName);
      target.value = '';
    }
  }

  removeOption(index: number): void {
    this.selectedOptions.splice(index, 1);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSave();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.onCancel();
    }
  }

  onBlur(): void {
    // Small delay to allow for button clicks
    setTimeout(() => {
      if (this.property.type !== 'multi_select') {
        this.onSave();
      }
    }, 100);
  }

  onSave(): void {
    let valueToSave = this.editValue;
    
    if (this.property.type === 'multi_select') {
      valueToSave = [...this.selectedOptions];
    }
    
    this.save.emit(valueToSave);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
} 