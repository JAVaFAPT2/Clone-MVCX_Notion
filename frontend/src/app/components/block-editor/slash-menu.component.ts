import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SlashMenuItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: string;
  type: string;
}

@Component({
  selector: 'app-slash-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="slash-menu" *ngIf="visible" [style.left.px]="position.x" [style.top.px]="position.y">
      <div 
        *ngFor="let item of items; let i = index"
        class="slash-menu-item"
        [class.selected]="i === selectedIndex"
        (click)="selectItem(item)"
        (mouseenter)="selectedIndex = i">
        <span class="icon">{{ item.icon }}</span>
        <div class="content">
          <div class="title">{{ item.title }}</div>
          <div class="description">{{ item.description }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .slash-menu {
      position: absolute;
      background: white;
      border: 1px solid #ddd;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      min-width: 200px;
      max-height: 300px;
      overflow-y: auto;
    }

    .slash-menu-item {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .slash-menu-item:hover,
    .slash-menu-item.selected {
      background-color: #f0f0f0;
    }

    .icon {
      margin-right: 12px;
      font-size: 16px;
      width: 20px;
      text-align: center;
    }

    .content {
      flex: 1;
    }

    .title {
      font-weight: 500;
      font-size: 14px;
      color: #333;
    }

    .description {
      font-size: 12px;
      color: #666;
      margin-top: 2px;
    }
  `]
})
export class SlashMenuComponent {
  @Input() visible = false;
  @Input() position = { x: 0, y: 0 };
  @Input() items: SlashMenuItem[] = [];
  @Input() selectedIndex = 0;
  
  @Output() itemSelected = new EventEmitter<SlashMenuItem>();

  selectItem(item: SlashMenuItem): void {
    this.itemSelected.emit(item);
  }
}