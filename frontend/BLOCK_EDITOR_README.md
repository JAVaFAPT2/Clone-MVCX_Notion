# Block-Based Editor with Drag-and-Drop

A powerful, Notion-like block-based editor with drag-and-drop reordering functionality. This editor allows users to create, edit, and reorder content blocks with an intuitive drag-and-drop interface.

## 🎯 Key Features

### Drag-and-Drop Reordering
- **Visual Drag Handles**: Hover over any block to see the drag handle (⋮⋮)
- **Smooth Animations**: Real-time visual feedback during drag operations
- **Precise Positioning**: Drop blocks exactly where you want them
- **Multi-block Support**: Works with all block types (text, lists, todos, etc.)

### Block Types
- **Text Blocks**: Paragraphs, headings (H1, H2, H3)
- **List Blocks**: Bulleted lists, numbered lists, todos
- **Special Blocks**: Quotes, code blocks, callouts, toggles
- **Media Blocks**: Tables, images, dividers, embeds

### Keyboard Shortcuts
- **Ctrl/Cmd + ?**: Show/hide keyboard shortcuts help
- **Enter**: Create new block
- **Backspace**: Delete empty block
- **Tab/Shift+Tab**: Indent/outdent blocks
- **Arrow Keys**: Navigate between blocks
- **Ctrl/Cmd + Z/Y**: Undo/redo
- **Ctrl/Cmd + C/V**: Copy/paste blocks

## 🚀 Getting Started

### Installation

1. Install the Angular CDK for drag-and-drop functionality:
```bash
npm install @angular/cdk --legacy-peer-deps
```

2. Import the required modules in your component:
```typescript
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';
```

### Basic Usage

```typescript
import { Component } from '@angular/core';
import { BlockEditorComponent } from './components/block-editor/block-editor.component';
import { Block } from './models/block.model';

@Component({
  selector: 'app-my-editor',
  template: `
    <app-block-editor 
      #blockEditor
      (blockChange)="onBlockChange($event)"
    ></app-block-editor>
  `
})
export class MyEditorComponent {
  
  onBlockChange(event: { block: Block; index: number }) {
    console.log('Block changed:', event);
  }
}
```

## 🎮 Drag-and-Drop Usage

### How to Use Drag-and-Drop

1. **Hover Over a Block**: Move your mouse over any block in the editor
2. **See the Drag Handle**: A drag handle (⋮⋮) will appear on the left side
3. **Click and Drag**: Click on the drag handle and drag the block
4. **Drop to Reorder**: Release the mouse button to drop the block in its new position

### Visual Feedback

During drag operations, you'll see:
- **Drag Preview**: A semi-transparent copy of the block being dragged
- **Drop Placeholder**: A dashed outline showing where the block will be placed
- **Smooth Animations**: Other blocks smoothly move to make space
- **Rotation Effect**: The dragged block rotates slightly for visual appeal

### Code Example

```typescript
// Handle drag and drop events
onBlockDrop(event: CdkDragDrop<Block[]>): void {
  if (event.previousIndex === event.currentIndex) {
    return; // No change in position
  }

  // Move the block in the array
  const blocks = [...this.state.blocks];
  moveItemInArray(blocks, event.previousIndex, event.currentIndex);
  
  // Update the service with the new order
  this.blockEditorService.setBlocks(blocks);
  this.blockEditorService.saveToHistory();
  
  // Update focus to the moved block
  this.blockEditorService.setFocusedBlock(event.currentIndex);
}
```

## 🎨 Styling

### Drag Handle Styles

```scss
.drag-handle {
  position: absolute;
  left: -24px;
  top: 50%;
  transform: translateY(-50%) translateX(-8px);
  width: 20px;
  height: 20px;
  opacity: 0;
  cursor: grab;
  transition: all 0.2s ease;
  z-index: 5;

  &:hover {
    transform: translateY(-50%) translateX(-4px) scale(1.1);
  }

  &:active {
    cursor: grabbing;
  }
}
```

### CDK Drag and Drop Styles

```scss
.cdk-drag-preview {
  background: #ffffff;
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  opacity: 0.9;
  transform: rotate(2deg);
  z-index: 1000;
}

.cdk-drag-placeholder {
  background: #e3f2fd;
  border: 2px dashed #2196f3;
  border-radius: 6px;
  height: 40px;
  margin: 8px 0;
  opacity: 0.6;
  transition: all 0.2s ease;
}
```

## 🔧 Configuration

### Block Editor Service

The `BlockEditorService` manages the state and provides methods for:

```typescript
// Add a new block
addBlock(type: BlockType): void

// Update an existing block
updateBlock(block: Block, index: number): void

// Delete a block
deleteBlock(index: number): void

// Move focus between blocks
setFocusedBlock(index: number | null): void

// Undo/redo operations
undo(): void
redo(): void

// Copy/paste blocks
copyBlocks(indices: number[]): void
pasteBlocks(index: number): void
```

### Block Model

```typescript
interface Block {
  id: string;
  type: BlockType;
  content: BlockContent[];
}

interface BlockContent {
  text: string;
  style?: TextStyle;
}

type BlockType = 
  | 'paragraph' | 'heading1' | 'heading2' | 'heading3'
  | 'bulleted_list' | 'numbered_list' | 'todo'
  | 'quote' | 'code' | 'callout' | 'toggle'
  | 'table' | 'image' | 'divider' | 'embed';
```

## 📱 Responsive Design

The editor is fully responsive and works on:
- **Desktop**: Full drag-and-drop functionality
- **Tablet**: Touch-friendly drag handles
- **Mobile**: Optimized for touch interactions

### Mobile Considerations

```scss
@media (max-width: 768px) {
  .drag-handle {
    left: -20px;
    width: 16px;
    height: 16px;
    
    .drag-dots {
      font-size: 8px;
    }
  }
}
```

## 🌙 Dark Mode Support

The editor automatically adapts to dark mode preferences:

```scss
@media (prefers-color-scheme: dark) {
  .block-wrapper {
    &:hover {
      background: #2d2d2d;
    }
    
    .drag-handle {
      .drag-indicator {
        background: #333333;
        border-color: #555555;
      }
    }
  }
}
```

## ♿ Accessibility

### Keyboard Navigation
- **Tab**: Navigate between blocks and controls
- **Enter**: Activate buttons and create new blocks
- **Escape**: Cancel operations and clear selections
- **Arrow Keys**: Move between blocks

### Screen Reader Support
- Drag handles have proper ARIA labels
- Block types are announced to screen readers
- Focus management is handled correctly

### Focus Indicators
```scss
.drag-handle:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}
```

## 🧪 Testing

### Unit Tests

```typescript
describe('BlockEditorComponent', () => {
  it('should handle drag and drop correctly', () => {
    const component = new BlockEditorComponent();
    const mockEvent = {
      previousIndex: 0,
      currentIndex: 2,
      item: { data: mockBlock }
    };
    
    component.onBlockDrop(mockEvent);
    expect(component.state.blocks[2]).toEqual(mockBlock);
  });
});
```

### Integration Tests

```typescript
it('should show drag handle on hover', () => {
  const blockElement = fixture.debugElement.query(By.css('.block-wrapper'));
  blockElement.triggerEventHandler('mouseenter', {});
  
  const dragHandle = fixture.debugElement.query(By.css('.drag-handle'));
  expect(dragHandle.nativeElement.style.opacity).toBe('1');
});
```

## 🚀 Performance

### Optimization Tips

1. **Track By Function**: Use `trackByBlockId` for efficient rendering
2. **Lazy Loading**: Load blocks as needed for large documents
3. **Debouncing**: Debounce rapid drag operations
4. **Virtual Scrolling**: Consider virtual scrolling for very long documents

### Memory Management

```typescript
// Clean up subscriptions
ngOnDestroy(): void {
  this.subscription.unsubscribe();
}

// Use OnPush change detection strategy
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

## 🔄 State Management

### History Management

The editor maintains an undo/redo history:

```typescript
// Save state to history
saveToHistory(): void {
  this.history.push([...this.state.blocks]);
  if (this.history.length > MAX_HISTORY_SIZE) {
    this.history.shift();
  }
}

// Undo last action
undo(): void {
  if (this.history.length > 0) {
    const previousState = this.history.pop();
    this.state.blocks = previousState;
  }
}
```

## 📊 Analytics

Track user interactions for insights:

```typescript
// Track drag and drop usage
onBlockDrop(event: CdkDragDrop<Block[]>): void {
  // ... existing logic ...
  
  // Track analytics
  this.analytics.track('block_reordered', {
    blockType: event.item.data.type,
    distance: Math.abs(event.currentIndex - event.previousIndex)
  });
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Drag Handle Not Visible**
   - Check CSS z-index values
   - Ensure hover states are working
   - Verify Angular CDK is installed

2. **Blocks Not Reordering**
   - Check `moveItemInArray` import
   - Verify event handlers are connected
   - Ensure state updates are triggering re-renders

3. **Performance Issues**
   - Use `trackBy` functions
   - Implement virtual scrolling for large lists
   - Debounce rapid operations

### Debug Mode

Enable debug logging:

```typescript
// In component
console.log('Drag event:', event);
console.log('Block state:', this.state.blocks);
```

## 📚 API Reference

### BlockEditorComponent

#### Properties
- `state: BlockEditorState` - Current editor state
- `showToolbar: boolean` - Show/hide toolbar
- `isDragging: boolean` - Drag operation status

#### Methods
- `onBlockDrop(event: CdkDragDrop<Block[]>)` - Handle drag and drop
- `addBlock(type: BlockType)` - Add new block
- `setBlocks(blocks: Block[])` - Set all blocks
- `getBlocks(): Block[]` - Get all blocks
- `exportContent(): string` - Export as text
- `importContent(content: string)` - Import from text

### BlockEditorService

#### Methods
- `getState(): Observable<BlockEditorState>` - Get state stream
- `setBlocks(blocks: Block[])` - Update blocks
- `addBlock(type: BlockType)` - Add block
- `updateBlock(block: Block, index: number)` - Update block
- `deleteBlock(index: number)` - Delete block
- `undo()` - Undo last action
- `redo()` - Redo last action

## 🎉 Examples

### Complete Example

```typescript
@Component({
  selector: 'app-editor-demo',
  template: `
    <app-block-editor 
      #blockEditor
      class="my-editor"
    ></app-block-editor>
    
    <div class="controls">
      <button (click)="addHeading()">Add Heading</button>
      <button (click)="addList()">Add List</button>
      <button (click)="exportContent()">Export</button>
    </div>
  `
})
export class EditorDemoComponent {
  @ViewChild('blockEditor') blockEditor!: BlockEditorComponent;

  addHeading(): void {
    this.blockEditor.addBlock('heading1');
  }

  addList(): void {
    this.blockEditor.addBlock('bulleted_list');
  }

  exportContent(): void {
    const content = this.blockEditor.exportContent();
    console.log('Exported:', content);
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Happy Editing! 🎉**

The block editor with drag-and-drop functionality provides a powerful, intuitive way to create and organize content. Whether you're building a note-taking app, a content management system, or a collaborative editor, this component gives you the tools you need for a great user experience. 