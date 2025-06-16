import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockType } from '../../models/block.model';

export interface SlashMenuItem {
  label: string;
  type: BlockType;
  icon?: string;
  shortcut?: string;
}

@Component({
  selector: 'app-slash-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="slash-menu" [ngStyle]="{ top: position?.top + 'px', left: position?.left + 'px' }">
      <div class="slash-menu-list">
        <div
          *ngFor="let item of filteredItems; let i = index"
          class="slash-menu-item"
          [class.selected]="i === selectedIndex"
          (mousedown)="$event.preventDefault(); selectItem(item)"
        >
          <span class="icon">{{ item.icon }}</span>
          <span class="label">{{ item.label }}</span>
          <span class="shortcut" *ngIf="item.shortcut">{{ item.shortcut }}</span>
        </div>
        <div *ngIf="filteredItems.length === 0" class="slash-menu-empty">No results</div>
      </div>
    </div>
  `,
  styleUrls: ['./slash-menu.component.scss']
})
export class SlashMenuComponent {
  @Input() position: { top: number; left: number } | null = null;
  @Input() filter: string = '';
  @Output() select = new EventEmitter<SlashMenuItem>();
  @Output() close = new EventEmitter<void>();

  items: SlashMenuItem[] = [
    { label: 'Text', type: 'paragraph', icon: 'T' },
    { label: 'Heading 1', type: 'heading1', icon: 'H1', shortcut: '#' },
    { label: 'Heading 2', type: 'heading2', icon: 'H2', shortcut: '##' },
    { label: 'Heading 3', type: 'heading3', icon: 'H3', shortcut: '###' },
    { label: 'Bulleted list', type: 'bulleted_list', icon: '•', shortcut: '-' },
    { label: 'Numbered list', type: 'numbered_list', icon: '1.', shortcut: '1.' },
    { label: 'To-do list', type: 'todo', icon: '☑', shortcut: '[]' },
    { label: 'Table', type: 'table', icon: '▦', shortcut: 'table' },
    { label: 'Image', type: 'image', icon: '🖼️', shortcut: 'img' },
    { label: 'Quote', type: 'quote', icon: '❝', shortcut: '>' },
    { label: 'Divider', type: 'divider', icon: '―', shortcut: '---' },
  ];

  selectedIndex = 0;

  get filteredItems(): SlashMenuItem[] {
    if (!this.filter) return this.items;
    const f = this.filter.toLowerCase();
    return this.items.filter(item =>
      item.label.toLowerCase().includes(f) ||
      item.type.toLowerCase().includes(f) ||
      (item.shortcut && item.shortcut.includes(f))
    );
  }

  ngOnChanges() {
    this.selectedIndex = 0;
  }

  selectItem(item: SlashMenuItem) {
    this.select.emit(item);
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      this.selectedIndex = (this.selectedIndex + 1) % this.filteredItems.length;
      event.preventDefault();
    } else if (event.key === 'ArrowUp') {
      this.selectedIndex = (this.selectedIndex - 1 + this.filteredItems.length) % this.filteredItems.length;
      event.preventDefault();
    } else if (event.key === 'Enter') {
      if (this.filteredItems[this.selectedIndex]) {
        this.selectItem(this.filteredItems[this.selectedIndex]);
      }
      event.preventDefault();
    } else if (event.key === 'Escape') {
      this.close.emit();
      event.preventDefault();
    }
  }
} 