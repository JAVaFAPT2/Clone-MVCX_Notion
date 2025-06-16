import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { PageTreeService, PageNode } from '../../services/page-tree.service';
import { PageSelectionService } from '../../services/page-selection.service';
import { Page } from '../../models/page.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule, DragDropModule]
})
export class SidebarComponent implements OnInit {
  pageTree: PageNode[] = [];
  selectedPageId: string | null = null;

  constructor(
    private pageTreeService: PageTreeService,
    private pageSelectionService: PageSelectionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPages();
  }

  loadPages() {
    this.pageTreeService.getAllPages().subscribe(pages => {
      this.pageTree = this.pageTreeService.buildTree(pages);
    });
  }

  selectPage(page: PageNode) {
    this.selectedPageId = page.id;
    // TODO: Emit event or navigate to page editor
  }

  createPage(parentId?: string) {
    // TODO: Show input for new page title
    const title = prompt('New page title:');
    if (!title) return;
    this.pageTreeService.createPage({ title, parentId }).subscribe(() => this.loadPages());
  }

  renamePage(page: PageNode) {
    const title = prompt('Rename page:', page.title);
    if (!title) return;
    this.pageTreeService.updatePage(page.id, { title }).subscribe(() => this.loadPages());
  }

  deletePage(page: PageNode) {
    if (confirm(`Delete page "${page.title}"?`)) {
      this.pageTreeService.deletePage(page.id).subscribe(() => this.loadPages());
    }
  }

  onPageClick(page: PageNode) {
    // Convert PageNode to Page (minimal fields for selection)
    const selectedPage: Page = {
      id: page.id,
      title: page.title,
      parentId: page.parentId,
      icon: page.icon
    };
    this.pageSelectionService.selectPage(selectedPage);
    this.router.navigate(['/workspace/page', page.id]);
  }

  // Drag-and-drop handler for root level
  drop(event: CdkDragDrop<PageNode[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.pageTree, event.previousIndex, event.currentIndex);
      // Persist new order to backend
      const movedPage = this.pageTree[event.currentIndex];
      this.pageTreeService.updateOrder(movedPage.id, event.currentIndex).subscribe({
        next: () => {
          console.log('Page order updated successfully');
        },
        error: (err) => {
          console.error('Failed to update page order:', err);
          // Reload to revert changes
          this.loadPages();
        }
      });
    } else {
      // Handle moving between containers (for nested pages)
      const movedPage = event.previousContainer.data[event.previousIndex];
      const newParentId = null; // Root level
      const newOrder = event.currentIndex;
      
      this.pageTreeService.movePage(movedPage.id, newParentId, newOrder).subscribe({
        next: () => {
          console.log('Page moved successfully');
          this.loadPages(); // Reload to get updated tree
        },
        error: (err) => {
          console.error('Failed to move page:', err);
          this.loadPages(); // Reload to revert changes
        }
      });
    }
  }

  // Drag-and-drop handler for child nodes (optional, for nested drag)
  dropChild(event: CdkDragDrop<PageNode[]>, parent: PageNode) {
    if (event.previousContainer === event.container) {
      moveItemInArray(parent.children!, event.previousIndex, event.currentIndex);
      // Persist new order to backend
      const movedPage = parent.children![event.currentIndex];
      this.pageTreeService.updateOrder(movedPage.id, event.currentIndex).subscribe({
        next: () => {
          console.log('Child page order updated successfully');
        },
        error: (err) => {
          console.error('Failed to update child page order:', err);
          this.loadPages(); // Reload to revert changes
        }
      });
    } else {
      // Handle moving between containers (for nested pages)
      const movedPage = event.previousContainer.data[event.previousIndex];
      const newParentId = parent.id;
      const newOrder = event.currentIndex;
      
      this.pageTreeService.movePage(movedPage.id, newParentId, newOrder).subscribe({
        next: () => {
          console.log('Child page moved successfully');
          this.loadPages(); // Reload to get updated tree
        },
        error: (err) => {
          console.error('Failed to move child page:', err);
          this.loadPages(); // Reload to revert changes
        }
      });
    }
  }
} 