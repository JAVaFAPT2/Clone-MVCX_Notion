import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BlockComponent } from '../block/block.component';
import { Block, BlockType } from '../../models/block.model';
import { Page } from '../../models/page.model';
import { PageService } from '../../services/page.service';

interface SlashCommand {
  type: BlockType;
  label: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-page-editor',
  templateUrl: './page-editor.component.html',
  styleUrls: ['./page-editor.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, BlockComponent]
})
export class PageEditorComponent implements OnInit {
  page: Page = {
    id: '',
    title: 'Untitled',
    blocks: [],
    icon: '📄'
  };

  showSlashCommands = false;
  currentSlashCommandIndex = 0;
  slashCommands: SlashCommand[] = [
    { type: 'paragraph', label: 'Text', icon: '📝', description: 'Just start writing with plain text' },
    { type: 'heading', label: 'Heading 1', icon: 'H1', description: 'Big section heading' },
    { type: 'heading2', label: 'Heading 2', icon: 'H2', description: 'Medium section heading' },
    { type: 'todo', label: 'To-do list', icon: '☐', description: 'Track tasks with a to-do list' },
    { type: 'bulleted', label: 'Bulleted list', icon: '•', description: 'Create a simple bulleted list' },
    { type: 'numbered', label: 'Numbered list', icon: '1.', description: 'Create a numbered list' },
    { type: 'quote', label: 'Quote', icon: '"', description: 'Capture a quote' },
    { type: 'code', label: 'Code', icon: '</>', description: 'Capture a code snippet' },
    { type: 'callout', label: 'Callout', icon: '💡', description: 'Highlight important information' }
  ];

  constructor(
    private pageService: PageService,
    private router: Router
  ) {}

  ngOnInit() {
    // Load page if ID is in route
    const pageId = this.router.url.split('/').pop();
    if (pageId && pageId !== 'new') {
      this.loadPage(pageId);
    }
  }

  loadPage(id: string) {
    this.pageService.getPage(id).subscribe({
      next: (page) => {
        if (page) {
          this.page = page;
        } else {
          console.error('Page not found');
          // Handle null page (e.g., redirect to 404 or workspace)
          this.router.navigate(['/workspace']);
        }
      },
      error: (error) => {
        console.error('Error loading page:', error);
        // Handle error (e.g., show error message)
      }
    });
  }

  onBlockUpdate(index: number, block: Block) {
    this.page.blocks[index] = block;
  }

  onBlockRemove(index: number) {
    this.page.blocks.splice(index, 1);
  }

  onBlockAddBelow(index: number) {
    const newBlock: Block = {
      id: `new_${Date.now()}`,
      type: 'paragraph',
      content: ''
    };
    this.page.blocks.splice(index + 1, 0, newBlock);
  }

  onBlockKeyDown(event: KeyboardEvent, index: number) {
    const block = this.page.blocks[index];
    const content = typeof block.content === 'string' ? block.content : block.content.map(c => c.text).join('');

    // Handle slash command
    if (event.key === '/' && content === '') {
      event.preventDefault();
      this.showSlashCommands = true;
      this.currentSlashCommandIndex = 0;
      return;
    }

    // Handle slash command navigation
    if (this.showSlashCommands) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.currentSlashCommandIndex = (this.currentSlashCommandIndex + 1) % this.slashCommands.length;
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.currentSlashCommandIndex = (this.currentSlashCommandIndex - 1 + this.slashCommands.length) % this.slashCommands.length;
      } else if (event.key === 'Enter') {
        event.preventDefault();
        this.applySlashCommand(index);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        this.showSlashCommands = false;
      }
    }
  }

  applySlashCommand(index: number) {
    const command = this.slashCommands[this.currentSlashCommandIndex];
    this.page.blocks[index] = {
      ...this.page.blocks[index],
      type: command.type,
      content: ''
    };
    this.showSlashCommands = false;
  }

  savePage() {
    console.log('Attempting to save page:', this.page);
    
    // Filter out invalid or empty blocks before saving
    const validBlocks = this.page.blocks.filter(block => {
      if (!block || !block.type) {
        console.warn('Invalid block found:', block);
        return false;
      }
      
      const hasType = !!block.type;
      const hasContent = typeof block.content === 'string' 
        ? (block.content?.trim().length > 0) 
        : (block.content && block.content.some(c => c.text && c.text.trim().length > 0));
      
      if (!hasType || !hasContent) {
        console.warn('Filtering out invalid block:', block);
      }
      
      return hasType && hasContent;
    });
    
    // Ensure we have at least one block
    if (validBlocks.length === 0) {
      validBlocks.push({
        id: `new_${Date.now()}`,
        type: 'paragraph',
        content: 'Empty page'
      });
    }
    
    const pageToSave = { ...this.page, blocks: validBlocks };
    console.log('Saving page with valid blocks:', pageToSave);
    
    if (!pageToSave.id) {
      // Create new page
      this.createNewPage(pageToSave);
    } else {
      // Update existing page
      this.updateExistingPage(pageToSave);
    }
  }
  
  private createNewPage(pageToSave: Page, retryCount = 0) {
    this.pageService.createPage(pageToSave).subscribe({
      next: (createdPage) => {
        console.log('Page created successfully:', createdPage);
        this.page = createdPage;
        this.router.navigate(['/page', createdPage.id]);
      },
      error: (error) => {
        console.error('Error creating page:', error);
        
        if (retryCount < 2) {
          console.log(`Retrying create page (attempt ${retryCount + 1})...`);
          setTimeout(() => this.createNewPage(pageToSave, retryCount + 1), 1000);
        } else {
          alert('Failed to create page. Please try again later.');
        }
      }
    });
  }
  
  private updateExistingPage(pageToSave: Page, retryCount = 0) {
    this.pageService.savePage(pageToSave).subscribe({
      next: (updatedPage) => {
        console.log('Page updated successfully:', updatedPage);
        this.page = updatedPage;
      },
      error: (error) => {
        console.error('Error saving page:', error);
        
        if (retryCount < 2) {
          console.log(`Retrying save page (attempt ${retryCount + 1})...`);
          setTimeout(() => this.updateExistingPage(pageToSave, retryCount + 1), 1000);
        } else {
          alert('Failed to save page. Please try again later.');
        }
      }
    });
  }

  deletePage() {
    if (this.page.id) {
      if (confirm('Are you sure you want to delete this page?')) {
        this.pageService.deletePage(this.page.id).subscribe({
          next: () => {
            this.router.navigate(['/workspace']);
          },
          error: (error) => {
            console.error('Error deleting page:', error);
            // Handle error (e.g., show error message)
          }
        });
      }
    } else {
      this.router.navigate(['/workspace']);
    }
  }

  backToWorkspace() {
    this.router.navigate(['/workspace']);
  }

  trackByBlockId(index: number, block: Block): string {
    return block.id;
  }
} 