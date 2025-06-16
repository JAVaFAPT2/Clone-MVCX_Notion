import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Block, BlockType, BlockMetadata } from '../../models/block.model';

@Component({
  selector: 'app-special-block',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="special-block" [class.focused]="isFocused">
      <div class="block-handle" (click)="showBlockMenu = !showBlockMenu">
        <span class="handle-icon">⋮</span>
      </div>
      
      <div class="block-content" [ngClass]="getBlockClass()">
        <!-- Block Type Icon -->
        <span class="block-type-icon">{{ getBlockIcon() }}</span>
        
        <!-- Block Content -->
        <div class="block-specific-content">
          <!-- Image Block -->
          <div *ngIf="block.type === 'image'" class="image-block">
            <div *ngIf="!getImageUrl()" class="image-upload">
              <input 
                type="file" 
                accept="image/*" 
                (change)="onImageUpload($event)"
                class="image-input"
              />
              <input 
                type="url" 
                placeholder="Paste image URL..." 
                (change)="onImageUrlInput($event)"
                class="image-url-input"
              />
              <div class="upload-placeholder">
                <span class="upload-icon">📷</span>
                <span class="upload-text">Click to upload image or paste URL</span>
              </div>
            </div>
            <div *ngIf="getImageUrl()" class="image-display">
              <img [src]="getImageUrl()" alt="Block image" class="block-image" (error)="onImageError()" />
              <input 
                type="text" 
                [value]="getImageCaption()" 
                (input)="updateImageCaption($event)"
                placeholder="Add caption..."
                class="image-caption"
              />
              <button (click)="removeImage()" class="remove-image-btn">Remove</button>
            </div>
            <div *ngIf="imageError" class="image-error">Invalid image URL or file.</div>
          </div>
          
          <!-- Table Block -->
          <div *ngIf="block.type === 'table'" class="table-block">
            <table class="block-table">
              <tr *ngFor="let row of getTableData(); let rowIndex = index">
                <td 
                  *ngFor="let cell of row; let colIndex = index"
                  contenteditable="true"
                  (input)="updateTableCell(rowIndex, colIndex, $event)"
                  [textContent]="cell"
                  class="table-cell"
                ></td>
                <td>
                  <button (click)="removeTableRow(rowIndex)" class="table-btn remove-btn">Remove Row</button>
                </td>
              </tr>
              <tr>
                <td *ngFor="let col of getTableData()[0]; let colIndex = index">
                  <button (click)="removeTableColumn(colIndex)" class="table-btn remove-btn">Remove Col</button>
                </td>
                <td></td>
              </tr>
            </table>
            <div class="table-controls">
              <button (click)="addTableRow()" class="table-btn">Add Row</button>
              <button (click)="addTableColumn()" class="table-btn">Add Column</button>
            </div>
          </div>
          
          <!-- Divider Block -->
          <div *ngIf="block.type === 'divider'" class="divider-block">
            <hr class="block-divider" />
          </div>
          
          <!-- Code Block -->
          <div *ngIf="block.type === 'code'" class="code-block">
            <div class="code-header">
              <select 
                [value]="getCodeLanguage()" 
                (change)="updateCodeLanguage($event)"
                class="language-select"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="css">CSS</option>
                <option value="html">HTML</option>
                <option value="json">JSON</option>
                <option value="sql">SQL</option>
              </select>
            </div>
            <textarea
              [value]="getCodeContent()"
              (input)="updateCodeContent($event)"
              placeholder="Enter code..."
              class="code-textarea"
              spellcheck="false"
            ></textarea>
          </div>
          
          <!-- Callout Block -->
          <div *ngIf="block.type === 'callout'" class="callout-block">
            <div class="callout-header">
              <input 
                type="text" 
                [value]="getCalloutIcon()" 
                (input)="updateCalloutIcon($event)"
                class="callout-icon-input"
                maxlength="2"
              />
              <select 
                [value]="getCalloutColor()" 
                (change)="updateCalloutColor($event)"
                class="callout-color-select"
              >
                <option value="blue">Blue</option>
                <option value="green">Green</option>
                <option value="yellow">Yellow</option>
                <option value="red">Red</option>
                <option value="purple">Purple</option>
                <option value="gray">Gray</option>
              </select>
            </div>
            <textarea
              [value]="getCalloutContent()"
              (input)="updateCalloutContent($event)"
              placeholder="Callout content..."
              class="callout-textarea"
            ></textarea>
          </div>
          
          <!-- Toggle Block -->
          <div *ngIf="block.type === 'toggle'" class="toggle-block">
            <div class="toggle-header" (click)="toggleCollapse()">
              <span class="toggle-icon">{{ isCollapsed() ? '▶' : '▼' }}</span>
              <textarea
                [value]="getToggleTitle()"
                (input)="updateToggleTitle($event)"
                placeholder="Toggle title..."
                class="toggle-title"
              ></textarea>
            </div>
            <div *ngIf="!isCollapsed()" class="toggle-content">
              <textarea
                [value]="getToggleContent()"
                (input)="updateToggleContent($event)"
                placeholder="Toggle content..."
                class="toggle-textarea"
              ></textarea>
            </div>
          </div>
          
          <!-- Embed Block -->
          <div *ngIf="block.type === 'embed'" class="embed-block">
            <input 
              type="url" 
              [value]="getEmbedUrl()" 
              (input)="updateEmbedUrl($event)"
              placeholder="Enter URL to embed..."
              class="embed-input"
            />
            <div *ngIf="getEmbedUrl() && !embedError" class="embed-preview">
              <iframe 
                [src]="getEmbedUrl()" 
                class="embed-iframe"
                frameborder="0"
                allowfullscreen
                (error)="onEmbedError()"
              ></iframe>
            </div>
            <div *ngIf="embedError" class="embed-error">Invalid or unsupported embed URL.</div>
          </div>
        </div>
        
        <!-- Block Actions -->
        <div class="block-actions" *ngIf="isFocused">
          <button class="action-btn" (click)="duplicateBlock()" title="Duplicate">📋</button>
          <button class="action-btn" (click)="deleteBlock()" title="Delete">🗑️</button>
        </div>
      </div>
      
      <!-- Block Menu -->
      <div class="block-menu" *ngIf="showBlockMenu" (click)="$event.stopPropagation()">
        <div class="menu-item" *ngFor="let option of getMenuOptions()" (click)="onMenuSelect(option)">
          <span class="menu-icon">{{ option.icon }}</span>
          <span class="menu-label">{{ option.label }}</span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./special-block.component.scss']
})
export class SpecialBlockComponent {
  @Input() block!: Block;
  @Input() index!: number;
  @Output() blockChange = new EventEmitter<{ block: Block; index: number }>();
  @Output() blockAction = new EventEmitter<{ action: string; block: Block; index: number }>();
  @Output() focusChange = new EventEmitter<{ focused: boolean; index: number }>();
  
  @ViewChild('textArea') textArea!: ElementRef<HTMLTextAreaElement>;
  
  isFocused = false;
  showBlockMenu = false;
  imageError = false;
  embedError = false;

  getBlockIcon(): string {
    const icons: Record<BlockType, string> = {
      paragraph: '¶',
      heading1: 'H1',
      heading2: 'H2',
      heading3: 'H3',
      todo: '☐',
      bulleted_list: '•',
      numbered_list: '1.',
      table: '⊞',
      image: '🖼️',
      quote: '"',
      divider: '—',
      code: '</>',
      callout: '💡',
      toggle: '▼',
      embed: '🔗',
    };
    return icons[this.block.type] || '¶';
  }

  getBlockClass(): string {
    return `block-${this.block.type.replace('_', '-')}`;
  }

  getMenuOptions() {
    const options: Record<BlockType, any[]> = {
      paragraph: [
        { label: 'Bold', icon: 'B', action: 'bold' },
        { label: 'Italic', icon: 'I', action: 'italic' },
        { label: 'Link', icon: '🔗', action: 'link' },
        { label: 'Delete', icon: '🗑️', action: 'delete' }
      ],
      heading1: [
        { label: 'Bold', icon: 'B', action: 'bold' },
        { label: 'Italic', icon: 'I', action: 'italic' },
        { label: 'Link', icon: '🔗', action: 'link' },
        { label: 'Delete', icon: '🗑️', action: 'delete' }
      ],
      heading2: [
        { label: 'Bold', icon: 'B', action: 'bold' },
        { label: 'Italic', icon: 'I', action: 'italic' },
        { label: 'Link', icon: '🔗', action: 'link' },
        { label: 'Delete', icon: '🗑️', action: 'delete' }
      ],
      heading3: [
        { label: 'Bold', icon: 'B', action: 'bold' },
        { label: 'Italic', icon: 'I', action: 'italic' },
        { label: 'Link', icon: '🔗', action: 'link' },
        { label: 'Delete', icon: '🗑️', action: 'delete' }
      ],
      todo: [
        { label: 'Toggle', icon: '☑️', action: 'toggle' },
        { label: 'Delete', icon: '🗑️', action: 'delete' }
      ],
      bulleted_list: [
        { label: 'Bold', icon: 'B', action: 'bold' },
        { label: 'Italic', icon: 'I', action: 'italic' },
        { label: 'Link', icon: '🔗', action: 'link' },
        { label: 'Delete', icon: '🗑️', action: 'delete' }
      ],
      numbered_list: [
        { label: 'Bold', icon: 'B', action: 'bold' },
        { label: 'Italic', icon: 'I', action: 'italic' },
        { label: 'Link', icon: '🔗', action: 'link' },
        { label: 'Delete', icon: '🗑️', action: 'delete' }
      ],
      image: [
        { label: 'Replace Image', icon: '🔄', action: 'replace' },
        { label: 'Add Caption', icon: '📝', action: 'caption' },
        { label: 'Delete Image', icon: '🗑️', action: 'delete' },
      ],
      table: [
        { label: 'Add Row', icon: '↓', action: 'addRow' },
        { label: 'Add Column', icon: '→', action: 'addColumn' },
        { label: 'Delete Table', icon: '🗑️', action: 'delete' },
      ],
      quote: [
        { label: 'Bold', icon: 'B', action: 'bold' },
        { label: 'Italic', icon: 'I', action: 'italic' },
        { label: 'Delete', icon: '🗑️', action: 'delete' }
      ],
      divider: [
        { label: 'Delete Divider', icon: '🗑️', action: 'delete' },
      ],
      code: [
        { label: 'Copy Code', icon: '📋', action: 'copy' },
        { label: 'Delete Code', icon: '🗑️', action: 'delete' },
      ],
      callout: [
        { label: 'Change Icon', icon: '🎨', action: 'icon' },
        { label: 'Change Color', icon: '🌈', action: 'color' },
        { label: 'Delete Callout', icon: '🗑️', action: 'delete' },
      ],
      toggle: [
        { label: 'Toggle Collapse', icon: '▼', action: 'toggle' },
        { label: 'Delete Toggle', icon: '🗑️', action: 'delete' },
      ],
      embed: [
        { label: 'Edit URL', icon: '🔗', action: 'edit' },
        { label: 'Delete Embed', icon: '🗑️', action: 'delete' },
      ],
    };
    return options[this.block.type] || [];
  }

  // Image Block Methods
  getImageUrl(): string {
    return this.block.metadata?.url || '';
  }

  getImageCaption(): string {
    return this.block.metadata?.caption || '';
  }

  onImageUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        this.updateBlockMetadata({ url });
      };
      reader.readAsDataURL(file);
    }
  }

  updateImageCaption(event: Event): void {
    const caption = (event.target as HTMLInputElement).value;
    this.updateBlockMetadata({ caption });
  }

  // Table Block Methods
  getTableData(): string[][] {
    return this.block.metadata?.tableData || [['', ''], ['', '']];
  }

  updateTableCell(rowIndex: number, colIndex: number, event: Event): void {
    const tableData = this.getTableData();
    tableData[rowIndex][colIndex] = (event.target as HTMLElement).textContent || '';
    this.updateBlockMetadata({ tableData });
  }

  addTableRow(): void {
    const tableData = this.getTableData();
    const newRow = new Array(tableData[0].length).fill('');
    tableData.push(newRow);
    this.updateBlockMetadata({ tableData, rows: tableData.length });
  }

  addTableColumn(): void {
    const tableData = this.getTableData();
    tableData.forEach(row => row.push(''));
    this.updateBlockMetadata({ tableData, columns: tableData[0].length });
  }

  // Code Block Methods
  getCodeLanguage(): string {
    return this.block.metadata?.language || 'javascript';
  }

  getCodeContent(): string {
    return Array.isArray(this.block.content)
      ? this.block.content.map(seg => typeof seg === 'string' ? seg : seg.text).join('')
      : '';
  }

  updateCodeLanguage(event: Event): void {
    const language = (event.target as HTMLSelectElement).value;
    this.updateBlockMetadata({ language });
  }

  updateCodeContent(event: Event): void {
    const content = (event.target as HTMLTextAreaElement).value;
    this.updateBlockContent(content);
  }

  // Callout Block Methods
  getCalloutIcon(): string {
    return this.block.metadata?.icon || '💡';
  }

  getCalloutColor(): string {
    return this.block.metadata?.color || 'blue';
  }

  getCalloutContent(): string {
    return Array.isArray(this.block.content)
      ? this.block.content.map(seg => typeof seg === 'string' ? seg : seg.text).join('')
      : '';
  }

  updateCalloutIcon(event: Event): void {
    const icon = (event.target as HTMLInputElement).value;
    this.updateBlockMetadata({ icon });
  }

  updateCalloutColor(event: Event): void {
    const color = (event.target as HTMLSelectElement).value;
    this.updateBlockMetadata({ color });
  }

  updateCalloutContent(event: Event): void {
    const content = (event.target as HTMLTextAreaElement).value;
    this.updateBlockContent(content);
  }

  // Toggle Block Methods
  isCollapsed(): boolean {
    return this.block.metadata?.collapsed || false;
  }

  getToggleTitle(): string {
    return Array.isArray(this.block.content)
      ? this.block.content[0]?.text || ''
      : '';
  }

  getToggleContent(): string {
    return Array.isArray(this.block.content)
      ? this.block.content[1]?.text || ''
      : '';
  }

  toggleCollapse(): void {
    const collapsed = !this.isCollapsed();
    this.updateBlockMetadata({ collapsed });
  }

  updateToggleTitle(event: Event): void {
    const title = (event.target as HTMLTextAreaElement).value;
    this.updateBlockContent(title, 0);
  }

  updateToggleContent(event: Event): void {
    const content = (event.target as HTMLTextAreaElement).value;
    this.updateBlockContent(content, 1);
  }

  // Embed Block Methods
  getEmbedUrl(): string {
    return this.block.metadata?.url || '';
  }

  updateEmbedUrl(event: Event): void {
    const url = (event.target as HTMLInputElement).value;
    this.updateBlockMetadata({ url });
  }

  // Helper Methods
  updateBlockMetadata(metadata: Partial<BlockMetadata>): void {
    const updatedBlock = {
      ...this.block,
      metadata: { ...this.block.metadata, ...metadata }
    };
    this.blockChange.emit({ block: updatedBlock, index: this.index });
  }

  updateBlockContent(content: string, index: number = 0): void {
    const updatedContent = [...this.block.content];
    updatedContent[index] = { text: content };
    const updatedBlock = { ...this.block, content: updatedContent };
    this.blockChange.emit({ block: updatedBlock, index: this.index });
  }

  duplicateBlock(): void {
    this.blockAction.emit({ action: 'duplicate', block: this.block, index: this.index });
  }

  deleteBlock(): void {
    this.blockAction.emit({ action: 'delete', block: this.block, index: this.index });
  }

  onMenuSelect(option: any): void {
    this.showBlockMenu = false;
    this.blockAction.emit({ 
      action: option.action, 
      block: this.block, 
      index: this.index 
    });
  }

  onImageUrlInput(event: Event): void {
    const url = (event.target as HTMLInputElement).value;
    if (url && url.startsWith('http')) {
      this.updateBlockMetadata({ url });
      this.imageError = false;
      this.blockChange.emit({ block: this.block, index: this.index });
    } else {
      this.imageError = true;
    }
  }

  onImageError(): void {
    this.imageError = true;
  }

  removeImage(): void {
    this.updateBlockMetadata({ url: undefined });
    this.imageError = false;
    this.blockChange.emit({ block: this.block, index: this.index });
  }

  removeTableRow(rowIndex: number): void {
    const data = this.getTableData();
    if (data.length > 1) {
      data.splice(rowIndex, 1);
      this.updateBlockMetadata({ tableData: data });
      this.blockChange.emit({ block: this.block, index: this.index });
    }
  }

  removeTableColumn(colIndex: number): void {
    const data = this.getTableData();
    if (data[0].length > 1) {
      for (let row of data) {
        row.splice(colIndex, 1);
      }
      this.updateBlockMetadata({ tableData: data });
      this.blockChange.emit({ block: this.block, index: this.index });
    }
  }

  onEmbedError(): void {
    this.embedError = true;
  }
} 