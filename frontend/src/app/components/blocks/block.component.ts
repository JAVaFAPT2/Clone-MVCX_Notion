import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Block, BlockType, setBlockText } from '../../models/block.model';

interface SlashMenuItem {
  label: string;
  type: BlockType;
  icon?: string;
  shortcut?: string;
}

@Component({
  selector: 'app-block',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="block" style="position:relative;">
      <ng-container [ngSwitch]="block.type">
        <h1 *ngSwitchCase="'heading'">
          <input class="block-input heading" [(ngModel)]="block.content" (input)="onInput()" (keydown.enter)="onAddBelow()" (keydown.backspace)="onBackspace($any($event))" (keydown)="onKeyDown($any($event))" placeholder="Heading" />
        </h1>
        <div *ngSwitchCase="'todo'" class="todo-block">
          <input type="checkbox" [(ngModel)]="block.checked" (change)="onTodoToggle()" />
          <input class="block-input todo" [(ngModel)]="block.content" (input)="onInput()" (keydown.enter)="onAddBelow()" (keydown.backspace)="onBackspace($any($event))" (keydown)="onKeyDown($any($event))" placeholder="To-do" />
        </div>
        <ul *ngSwitchCase="'bulleted'" class="bulleted-block">
          <li><input class="block-input bulleted" [(ngModel)]="block.content" (input)="onInput()" (keydown.enter)="onAddBelow()" (keydown.backspace)="onBackspace($any($event))" (keydown)="onKeyDown($any($event))" placeholder="Bulleted list" /></li>
        </ul>
        <ol *ngSwitchCase="'numbered'" class="numbered-block">
          <li><input class="block-input numbered" [(ngModel)]="block.content" (input)="onInput()" (keydown.enter)="onAddBelow()" (keydown.backspace)="onBackspace($any($event))" (keydown)="onKeyDown($any($event))" placeholder="Numbered list" /></li>
        </ol>
        <input *ngSwitchDefault class="block-input" [(ngModel)]="block.content" (input)="onInput()" (keydown.enter)="onAddBelow()" (keydown.backspace)="onBackspace($any($event))" (keydown)="onKeyDown($any($event))" placeholder="Type / for commands" />
      </ng-container>
      <div *ngIf="showSlashMenu" class="slash-menu">
        <div *ngFor="let item of filteredSlashMenuItems; let i = index"
             [class.selected]="i === slashMenuIndex"
             (mousedown)="selectSlashMenuItem(item)">
          <span class="icon">{{ item.icon }}</span>
          <span class="label">{{ item.label }}</span>
          <span class="shortcut" *ngIf="item.shortcut">{{ item.shortcut }}</span>
        </div>
        <div *ngIf="filteredSlashMenuItems.length === 0" class="slash-menu-empty">No results</div>
      </div>
    </div>
  `,
  styleUrls: ['./block.component.scss']
})
export class BlockComponent {
  @Input() block!: Block;
  @Output() update = new EventEmitter<Block>();
  @Output() remove = new EventEmitter<void>();
  @Output() addBelow = new EventEmitter<void>();

  showSlashMenu = false;
  slashMenuIndex = 0;
  slashMenuFilter = '';
  slashMenuItems: SlashMenuItem[] = [
    { label: 'Text', type: 'paragraph', icon: 'T', shortcut: 'Enter' },
    { label: 'Heading', type: 'heading', icon: 'H', shortcut: '/heading' },
    { label: 'To-do', type: 'todo', icon: '☑', shortcut: '/todo' },
    { label: 'Bulleted list', type: 'bulleted', icon: '•', shortcut: '/bulleted' },
    { label: 'Numbered list', type: 'numbered', icon: '1.', shortcut: '/numbered' },
  ];

  get filteredSlashMenuItems(): SlashMenuItem[] {
    if (!this.slashMenuFilter) return this.slashMenuItems;
    const f = this.slashMenuFilter.toLowerCase();
    return this.slashMenuItems.filter(item =>
      item.label.toLowerCase().includes(f) ||
      item.type.toLowerCase().includes(f) ||
      (item.shortcut && item.shortcut.includes(f))
    );
  }

  onInput() {
    if (this.block.content.startsWith('/')) {
      this.showSlashMenu = true;
      this.slashMenuFilter = this.block.content.slice(1);
      this.slashMenuIndex = 0;
    } else {
      this.showSlashMenu = false;
      this.slashMenuFilter = '';
      this.update.emit(this.block);
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (this.showSlashMenu) {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          this.slashMenuIndex = (this.slashMenuIndex + 1) % this.filteredSlashMenuItems.length;
          break;
        case 'ArrowUp':
          event.preventDefault();
          this.slashMenuIndex = (this.slashMenuIndex - 1 + this.filteredSlashMenuItems.length) % this.filteredSlashMenuItems.length;
          break;
        case 'Escape':
          event.preventDefault();
          this.showSlashMenu = false;
          this.slashMenuFilter = '';
          break;
      }
    }
  }

  selectSlashMenuItem(item: SlashMenuItem) {
    this.block = {
      ...this.block,
      type: item.type,
      content: '',
      checked: item.type === 'todo' ? false : undefined
    };
    this.showSlashMenu = false;
    this.update.emit(this.block);
  }

  onAddBelow() {
    if (this.showSlashMenu) {
      this.selectSlashMenuItem(this.filteredSlashMenuItems[this.slashMenuIndex]);
    } else {
      this.addBelow.emit();
    }
  }

  onBackspace(event: KeyboardEvent) {
    if (this.block.content === '') {
      event.preventDefault();
      this.remove.emit();
    }
  }

  onTodoToggle() {
    this.update.emit(this.block);
  }
} 