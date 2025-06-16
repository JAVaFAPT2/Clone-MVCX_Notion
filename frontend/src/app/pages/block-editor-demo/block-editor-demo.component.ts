import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockEditorComponent } from '../../components/block-editor/block-editor.component';
import { Block, BlockType } from '../../models/block.model';

@Component({
  selector: 'app-block-editor-demo',
  standalone: true,
  imports: [CommonModule, BlockEditorComponent],
  template: `
    <div class="demo-container">
      <div class="demo-header">
        <h1>Block-Based Editor with Drag-and-Drop</h1>
        <p class="demo-description">
          A powerful block-based editor with drag-and-drop reordering, similar to Notion. 
          Create, edit, and reorder blocks with ease.
        </p>
      </div>

      <div class="demo-features">
        <div class="feature-grid">
          <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <h3>Drag & Drop Reordering</h3>
            <p>Click and drag the handle (⋮⋮) next to any block to reorder it within the document.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">⌨️</div>
            <h3>Keyboard Shortcuts</h3>
            <p>Use Ctrl/Cmd + ? to see all available keyboard shortcuts for efficient editing.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">📝</div>
            <h3>Multiple Block Types</h3>
            <p>Create paragraphs, headings, lists, todos, quotes, code blocks, and more.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🎨</div>
            <h3>Visual Feedback</h3>
            <p>See real-time visual feedback during drag operations with smooth animations.</p>
          </div>
        </div>
      </div>

      <div class="demo-instructions">
        <h2>How to Use Drag-and-Drop</h2>
        <div class="instruction-steps">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h4>Hover Over a Block</h4>
              <p>Move your mouse over any block in the editor. You'll see a drag handle (⋮⋮) appear on the left.</p>
            </div>
          </div>
          
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h4>Click and Drag</h4>
              <p>Click on the drag handle and drag the block to your desired position. You'll see a preview while dragging.</p>
            </div>
          </div>
          
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h4>Drop to Reorder</h4>
              <p>Release the mouse button to drop the block in its new position. The block will smoothly animate into place.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="demo-tips">
        <h3>💡 Pro Tips</h3>
        <ul>
          <li><strong>Multi-select:</strong> Hold Ctrl/Cmd and click multiple blocks to select them</li>
          <li><strong>Quick reorder:</strong> Use the drag handle for precise positioning</li>
          <li><strong>Keyboard navigation:</strong> Use arrow keys to move between blocks</li>
          <li><strong>Undo/Redo:</strong> Use Ctrl/Cmd + Z and Ctrl/Cmd + Y to undo/redo changes</li>
          <li><strong>Copy/Paste:</strong> Use Ctrl/Cmd + C and Ctrl/Cmd + V to copy and paste blocks</li>
        </ul>
      </div>

      <div class="editor-section">
        <h2>Try It Out</h2>
        <p>Create some blocks below and try the drag-and-drop functionality:</p>
        
        <app-block-editor 
          #blockEditor
          class="demo-editor"
        ></app-block-editor>
        
        <div class="editor-controls">
          <button class="control-btn" (click)="loadSampleContent()">
            📄 Load Sample Content
          </button>
          <button class="control-btn" (click)="clearEditor()">
            🗑️ Clear Editor
          </button>
          <button class="control-btn" (click)="exportContent()">
            📤 Export Content
          </button>
          <button class="control-btn" (click)="showBlockCount()">
            📊 Block Count
          </button>
        </div>
      </div>

      <div class="demo-footer">
        <h3>🎉 Features Implemented</h3>
        <div class="features-list">
          <div class="feature-item">✅ Drag-and-Drop Block Reordering</div>
          <div class="feature-item">✅ Visual Drag Handles</div>
          <div class="feature-item">✅ Smooth Animations</div>
          <div class="feature-item">✅ Keyboard Shortcuts</div>
          <div class="feature-item">✅ Multiple Block Types</div>
          <div class="feature-item">✅ Undo/Redo Support</div>
          <div class="feature-item">✅ Copy/Paste Blocks</div>
          <div class="feature-item">✅ Responsive Design</div>
          <div class="feature-item">✅ Accessibility Support</div>
          <div class="feature-item">✅ Dark Mode Ready</div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./block-editor-demo.component.scss']
})
export class BlockEditorDemoComponent implements OnInit {

  ngOnInit(): void {
    // Load sample content on initialization
    setTimeout(() => {
      this.loadSampleContent();
    }, 100);
  }

  loadSampleContent(): void {
    const sampleBlocks: Block[] = [
      {
        id: '1',
        type: 'heading1',
        content: [{ text: 'Welcome to the Block Editor Demo' }]
      },
      {
        id: '2',
        type: 'paragraph',
        content: [{ text: 'This is a powerful block-based editor with drag-and-drop functionality. Try dragging the blocks around using the handle (⋮⋮) that appears when you hover over each block.' }]
      },
      {
        id: '3',
        type: 'heading2',
        content: [{ text: 'Key Features' }]
      },
      {
        id: '4',
        type: 'bulleted_list',
        content: [{ text: 'Drag and drop reordering' }]
      },
      {
        id: '5',
        type: 'bulleted_list',
        content: [{ text: 'Multiple block types' }]
      },
      {
        id: '6',
        type: 'bulleted_list',
        content: [{ text: 'Keyboard shortcuts' }]
      },
      {
        id: '7',
        type: 'bulleted_list',
        content: [{ text: 'Visual feedback' }]
      },
      {
        id: '8',
        type: 'heading2',
        content: [{ text: 'Try These Actions' }]
      },
      {
        id: '9',
        type: 'todo',
        content: [{ text: 'Drag this todo item to a different position' }]
      },
      {
        id: '10',
        type: 'todo',
        content: [{ text: 'Create a new block using the toolbar' }]
      },
      {
        id: '11',
        type: 'todo',
        content: [{ text: 'Use keyboard shortcuts (Ctrl/Cmd + ?)' }]
      },
      {
        id: '12',
        type: 'quote',
        content: [{ text: 'The best way to predict the future is to invent it.' }]
      },
      {
        id: '13',
        type: 'paragraph',
        content: [{ text: 'This quote block can also be dragged around. The drag-and-drop functionality works with all block types!' }]
      },
      {
        id: '14',
        type: 'code',
        content: [{ text: '// This is a code block\nfunction helloWorld() {\n  console.log("Hello, Block Editor!");\n}' }]
      },
      {
        id: '15',
        type: 'callout',
        content: [{ text: '💡 Pro tip: You can drag any block to reorder it. The visual feedback makes it easy to see where the block will be placed.' }]
      }
    ];

    // Access the block editor component and set the blocks
    const blockEditor = (this as any).blockEditor;
    if (blockEditor) {
      blockEditor.setBlocks(sampleBlocks);
    }
  }

  clearEditor(): void {
    const blockEditor = (this as any).blockEditor;
    if (blockEditor) {
      blockEditor.clearEditor();
    }
  }

  exportContent(): void {
    const blockEditor = (this as any).blockEditor;
    if (blockEditor) {
      const content = blockEditor.exportContent();
      console.log('Exported Content:', content);
      
      // Create a downloadable file
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'block-editor-content.txt';
      a.click();
      window.URL.revokeObjectURL(url);
      
      alert('Content exported! Check the console and downloads folder.');
    }
  }

  showBlockCount(): void {
    const blockEditor = (this as any).blockEditor;
    if (blockEditor) {
      const count = blockEditor.getBlockCount();
      alert(`Current block count: ${count}`);
    }
  }
} 