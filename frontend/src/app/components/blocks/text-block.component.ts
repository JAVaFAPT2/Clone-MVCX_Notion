import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Block, BlockType, TextSegment, TextFormat, getBlockText, setBlockText, applyFormatting } from '../../models/block.model';

interface FormatOption {
  name: string;
  property: keyof TextFormat;
  icon: string;
  label: string;
}

interface MenuOption {
  label: string;
  icon: string;
  action: string;
  newType?: string;
  shortcut?: string;
}

@Component({
  selector: 'app-text-block',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="text-block" [class.focused]="isFocused" [class.empty]="isEmpty" [class.selected]="isSelected">
      <!-- Block Handle (visible on hover/focus) -->
      <div class="block-handle" (click)="showBlockMenu = !showBlockMenu" [class.visible]="isFocused || isHovered">
        <span class="handle-icon">⋮</span>
      </div>
      
      <div class="block-content" [ngClass]="getBlockClass()" (mouseenter)="isHovered = true" (mouseleave)="isHovered = false">
        <!-- Block Type Icon -->
        <span class="block-type-icon" [class.visible]="isFocused || isHovered">{{ getBlockIcon() }}</span>
        
        <!-- Text Input -->
        <div class="text-input-container">
          <textarea
            #textArea
            [value]="getDisplayText()"
            [placeholder]="getPlaceholder()"
            (input)="onInput($event)"
            (keydown)="onKeydown($event)"
            (focus)="onFocus()"
            (blur)="onBlur()"
            [ngClass]="getTextAreaClass()"
            rows="1"
            [style.height.px]="textareaHeight"
          ></textarea>
          
          <!-- Rich Text Toolbar -->
          <div class="rich-text-toolbar" *ngIf="isFocused && hasSelection" [style.top.px]="toolbarTop">
            <button 
              *ngFor="let format of availableFormats" 
              [class]="'format-btn ' + format.name"
              [class.active]="isFormatActive(format.property)"
              (click)="toggleFormat(format.property)"
              [title]="format.label"
            >
              {{ format.icon }}
            </button>
          </div>
        </div>
        
        <!-- Block Actions -->
        <div class="block-actions" *ngIf="isFocused" [class.visible]="isFocused">
          <button class="action-btn" (click)="duplicateBlock()" title="Duplicate">📋</button>
          <button class="action-btn" (click)="deleteBlock()" title="Delete">🗑️</button>
        </div>
      </div>
      
      <!-- Block Menu -->
      <div class="block-menu" *ngIf="showBlockMenu" (click)="$event.stopPropagation()">
        <div class="menu-item" *ngFor="let option of getMenuOptions()" (click)="onMenuSelect(option)">
          <span class="menu-icon">{{ option.icon }}</span>
          <span class="menu-label">{{ option.label }}</span>
          <span class="menu-shortcut" *ngIf="option.shortcut">{{ option.shortcut }}</span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./text-block.component.scss']
})
export class TextBlockComponent {
  @Input() block!: Block;
  @Input() index!: number;
  @Input() isSelected: boolean = false;
  @Output() blockChange = new EventEmitter<{ block: Block; index: number }>();
  @Output() blockAction = new EventEmitter<{ action: string; block: Block; index: number }>();
  @Output() focusChange = new EventEmitter<{ focused: boolean; index: number }>();
  @Output() slashCommand = new EventEmitter<{ filter: string; position: { top: number; left: number }; index: number }>();
  @Output() hideSlashCommand = new EventEmitter<void>();
  
  @ViewChild('textArea') textArea!: ElementRef<HTMLTextAreaElement>;
  
  isFocused = false;
  isHovered = false;
  showBlockMenu = false;
  hasSelection = false;
  selectionStart = 0;
  selectionEnd = 0;
  toolbarTop = 0;
  textareaHeight = 20;
  
  availableFormats: FormatOption[] = [
    { name: 'bold', property: 'bold', icon: 'B', label: 'Bold' },
    { name: 'italic', property: 'italic', icon: 'I', label: 'Italic' },
    { name: 'underline', property: 'underline', icon: 'U', label: 'Underline' },
    { name: 'strikethrough', property: 'strikethrough', icon: 'S', label: 'Strikethrough' },
    { name: 'code', property: 'code', icon: '</>', label: 'Code' },
    { name: 'link', property: 'link', icon: '🔗', label: 'Link' },
  ];

  get isEmpty(): boolean {
    return !getBlockText(this.block).trim();
  }

  getDisplayText(): string {
    return getBlockText(this.block);
  }

  getPlaceholder(): string {
    const placeholders: Record<BlockType, string> = {
      paragraph: 'Type "/" for commands',
      heading1: 'Heading 1',
      heading2: 'Heading 2',
      heading3: 'Heading 3',
      todo: 'To-do',
      bulleted_list: 'List item',
      numbered_list: 'List item',
      table: 'Table',
      image: 'Image',
      quote: 'Quote',
      divider: '',
      code: 'Code',
      callout: 'Callout',
      toggle: 'Toggle',
      embed: 'Embed URL',
    };
    return placeholders[this.block.type] || 'Type here...';
  }

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

  getTextAreaClass(): string {
    return `text-area ${this.block.type}`;
  }

  getMenuOptions(): MenuOption[] {
    const options: MenuOption[] = [];
    
    // Text blocks
    if (this.block.type !== 'paragraph') {
      options.push({ label: 'Convert to Paragraph', icon: '¶', action: 'convert', newType: 'paragraph' });
    }
    if (this.block.type !== 'heading1') {
      options.push({ label: 'Convert to Heading 1', icon: 'H1', action: 'convert', newType: 'heading1' });
    }
    if (this.block.type !== 'heading2') {
      options.push({ label: 'Convert to Heading 2', icon: 'H2', action: 'convert', newType: 'heading2' });
    }
    if (this.block.type !== 'heading3') {
      options.push({ label: 'Convert to Heading 3', icon: 'H3', action: 'convert', newType: 'heading3' });
    }
    
    // List blocks
    if (this.block.type !== 'bulleted_list') {
      options.push({ label: 'Convert to Bulleted List', icon: '•', action: 'convert', newType: 'bulleted_list' });
    }
    if (this.block.type !== 'numbered_list') {
      options.push({ label: 'Convert to Numbered List', icon: '1.', action: 'convert', newType: 'numbered_list' });
    }
    if (this.block.type !== 'todo') {
      options.push({ label: 'Convert to Todo', icon: '☐', action: 'convert', newType: 'todo' });
    }
    
    // Other blocks
    if (this.block.type !== 'quote') {
      options.push({ label: 'Convert to Quote', icon: '"', action: 'convert', newType: 'quote' });
    }
    if (this.block.type !== 'code') {
      options.push({ label: 'Convert to Code', icon: '</>', action: 'convert', newType: 'code' });
    }
    
    // Actions
    options.push({ label: 'Duplicate', icon: '📋', action: 'duplicate' });
    options.push({ label: 'Delete', icon: '🗑️', action: 'delete' });
    
    return options;
  }

  onTextInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    const newText = target.value;
    const updatedBlock = setBlockText(this.block, newText);
    this.blockChange.emit({ block: updatedBlock, index: this.index });
    
    // Check for slash command
    this.checkForSlashCommand(newText, target);
  }

  private checkForSlashCommand(text: string, textarea: HTMLTextAreaElement): void {
    const lines = text.split('\n');
    const currentLine = lines[lines.length - 1];
    
    if (currentLine.startsWith('/')) {
      const filter = currentLine.substring(1);
      const position = this.getCursorPosition(textarea);
      this.slashCommand.emit({ filter, position, index: this.index });
    } else {
      this.hideSlashCommand.emit();
    }
  }

  private getCursorPosition(textarea: HTMLTextAreaElement): { top: number; left: number } {
    const rect = textarea.getBoundingClientRect();
    const textBeforeCursor = textarea.value.substring(0, textarea.selectionStart);
    const lines = textBeforeCursor.split('\n');
    const currentLine = lines[lines.length - 1];
    
    // Create a temporary span to measure text width
    const span = document.createElement('span');
    span.style.font = window.getComputedStyle(textarea).font;
    span.style.visibility = 'hidden';
    span.style.position = 'absolute';
    span.style.whiteSpace = 'pre';
    span.textContent = currentLine;
    document.body.appendChild(span);
    
    const textWidth = span.offsetWidth;
    document.body.removeChild(span);
    
    const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight) || 20;
    const top = rect.top + (lines.length - 1) * lineHeight + lineHeight; // Position below the current line
    const left = rect.left + Math.min(textWidth, rect.width - 280); // Ensure menu doesn't go off-screen
    
    return { top, left };
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      if (event.shiftKey) {
        // Shift+Enter: new line within same block
        return;
      } else {
        // Enter: new block
        event.preventDefault();
        this.blockAction.emit({ action: 'newBlock', block: this.block, index: this.index });
      }
    } else if (event.key === 'Backspace') {
      const target = event.target as HTMLTextAreaElement;
      const cursorPosition = target.selectionStart;
      const text = target.value;
      
      // If cursor is at the beginning and block is empty, delete the block
      if (cursorPosition === 0 && (!text || text.trim() === '')) {
        event.preventDefault();
        this.blockAction.emit({ action: 'deleteBlock', block: this.block, index: this.index });
      }
    } else if (event.key === 'Tab') {
      event.preventDefault();
      if (event.shiftKey) {
        this.blockAction.emit({ action: 'outdent', block: this.block, index: this.index });
      } else {
        this.blockAction.emit({ action: 'indent', block: this.block, index: this.index });
      }
    } else if (event.key === '/') {
      // Show slash menu with proper positioning
      const target = event.target as HTMLTextAreaElement;
      const position = this.getCursorPosition(target);
      this.slashCommand.emit({ 
        position: position, 
        filter: '',
        index: this.index
      });
    }
  }

  onInput(event: any): void {
    const value = event.target.value;
    this.block.content = [{ text: value }];
    this.blockChange.emit({ block: this.block, index: this.index });
    
    // Check for slash command with proper positioning
    if (value.endsWith('/')) {
      const target = event.target as HTMLTextAreaElement;
      const position = this.getCursorPosition(target);
      this.slashCommand.emit({ 
        position: position, 
        filter: '',
        index: this.index
      });
    }
  }

  onFocus(): void {
    this.isFocused = true;
    this.focusChange.emit({ focused: true, index: this.index });
  }

  onBlur(): void {
    this.isFocused = false;
    this.hasSelection = false;
    this.focusChange.emit({ focused: false, index: this.index });
  }

  onSelect(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.selectionStart = target.selectionStart;
    this.selectionEnd = target.selectionEnd;
    this.hasSelection = this.selectionStart !== this.selectionEnd;
    
    if (this.hasSelection) {
      const rect = target.getBoundingClientRect();
      this.toolbarTop = rect.top - 40;
    }
  }

  toggleFormat(formatProperty: keyof TextFormat): void {
    const updatedBlock = applyFormatting(this.block, this.selectionStart, this.selectionEnd, { [formatProperty]: true });
    this.blockChange.emit({ block: updatedBlock, index: this.index });
  }

  isFormatActive(formatProperty: keyof TextFormat): boolean {
    // This would check if the current selection has the format applied
    // For now, return false as a placeholder
    return false;
  }

  duplicateBlock(): void {
    this.blockAction.emit({ action: 'duplicate', block: this.block, index: this.index });
  }

  deleteBlock(): void {
    this.blockAction.emit({ action: 'delete', block: this.block, index: this.index });
  }

  onMenuSelect(option: MenuOption): void {
    this.showBlockMenu = false;
    
    if (option.action === 'convert' && option.newType) {
      this.blockAction.emit({ 
        action: 'convert', 
        block: { ...this.block, type: option.newType as BlockType }, 
        index: this.index 
      });
    } else if (option.action === 'duplicate') {
      this.duplicateBlock();
    } else if (option.action === 'delete') {
      this.deleteBlock();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.textArea?.nativeElement.contains(event.target as Node)) {
      this.showBlockMenu = false;
    }
  }
} 