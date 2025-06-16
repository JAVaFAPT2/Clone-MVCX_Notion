import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlockComponent } from '../../components/block/block.component';
import { Block } from '../../models/block.model';

@Component({
  selector: 'app-block-editor-demo',
  templateUrl: './block-editor-demo.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, BlockComponent]
})
export class BlockEditorDemoComponent {
  blocks: Block[] = [
    {
      id: '1',
      type: 'paragraph',
      content: 'Welcome to the block editor demo!'
    },
    {
      id: '2',
      type: 'heading',
      content: 'Try different block types'
    },
    {
      id: '3',
      type: 'todo',
      content: 'Type / to see available commands',
      checked: false
    }
  ];

  onBlockUpdate(index: number, block: Block) {
    this.blocks[index] = block;
  }

  onBlockRemove(index: number) {
    this.blocks.splice(index, 1);
    if (this.blocks.length === 0) {
      this.blocks.push({
        id: `new_${Date.now()}`,
        type: 'paragraph',
        content: ''
      });
    }
  }

  onBlockAddBelow(index: number) {
    const newBlock: Block = {
      id: `new_${Date.now()}`,
      type: 'paragraph',
      content: ''
    };
    this.blocks.splice(index + 1, 0, newBlock);
  }

  onBlockKeyDown(event: KeyboardEvent, index: number) {
    // Handle slash command and other keyboard shortcuts
    if (event.key === '/' && this.blocks[index].content === '') {
      event.preventDefault();
      // Show slash command menu
    }
  }
} 