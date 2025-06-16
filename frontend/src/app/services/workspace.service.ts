import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Page } from '../models/page.model';
import { PageService } from './page.service';
import { getBlockText } from '../models/block.model';

export interface WorkspaceState {
  pages: Page[];
  showWelcome: boolean;
  isLoading: boolean;
  lastVisitedPage: string | null;
  recentPages: string[];
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: string;
  color: string;
}

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  private stateSubject = new BehaviorSubject<WorkspaceState>({
    pages: [],
    showWelcome: true,
    isLoading: false,
    lastVisitedPage: null,
    recentPages: []
  });

  state$: Observable<WorkspaceState> = this.stateSubject.asObservable();

  constructor(private pageService: PageService) {
    this.loadPages();
  }

  getState(): Observable<WorkspaceState> {
    return this.stateSubject.asObservable();
  }

  getCurrentState(): WorkspaceState {
    return this.stateSubject.value;
  }

  private loadPages(): void {
    this.setState({ isLoading: true });
    this.pageService.getPages().pipe(
      tap(pages => {
        this.setState({ 
          pages,
          isLoading: false,
          showWelcome: pages.length === 0
        });
      }),
      catchError(error => {
        console.error('Failed to load pages:', error);
        this.setState({ isLoading: false });
        return [];
      })
    ).subscribe();
  }

  private loadUserPreferences(): void {
    // Load user preferences from localStorage
    const lastVisitedPage = localStorage.getItem('lastVisitedPage');
    const recentPages = JSON.parse(localStorage.getItem('recentPages') || '[]');
    
    this.setState({
      lastVisitedPage,
      recentPages
    });
  }

  private setState(updates: Partial<WorkspaceState>): void {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({ ...currentState, ...updates });
  }

  // Quick Actions
  handleQuickAction(action: QuickAction): void {
    switch (action.action) {
      case 'create-page':
        this.createNewPage();
        break;
      case 'create-database':
        this.createNewDatabase();
        break;
      case 'import':
        this.showImportDialog();
        break;
      case 'browse-templates':
        this.showTemplatesDialog();
        break;
      case 'invite-team':
        this.showInviteDialog();
        break;
      case 'tutorial':
        this.startTutorial();
        break;
      default:
        console.warn('Unknown action:', action.action);
    }
  }

  private createNewPage(): void {
    const newPage: Partial<Page> = {
      title: 'Untitled',
      icon: '📄',
      blocks: []
    };

    this.pageService.createPage(newPage).subscribe({
      next: (page) => {
        this.addPageToState(page);
        this.hideWelcome();
        if (page.id) {
          this.updateRecentPages(page.id);
        }
      },
      error: (error) => {
        console.error('Failed to create page:', error);
      }
    });
  }

  private createNewDatabase(): void {
    const newPage: Partial<Page> = {
      title: 'Untitled Database',
      icon: '📊',
      blocks: []
    };

    this.pageService.createPage(newPage).subscribe({
      next: (page) => {
        this.addPageToState(page);
        this.hideWelcome();
        if (page.id) {
          this.updateRecentPages(page.id);
        }
      },
      error: (error) => {
        console.error('Failed to create database:', error);
      }
    });
  }

  private showImportDialog(): void {
    // This would open an import dialog
    console.log('Show import dialog');
  }

  private showTemplatesDialog(): void {
    // This would open a templates dialog
    console.log('Show templates dialog');
  }

  private showInviteDialog(): void {
    // This would open an invite dialog
    console.log('Show invite dialog');
  }

  private startTutorial(): void {
    // This would start the tutorial
    console.log('Start tutorial');
  }

  // Page Management
  private addPageToState(page: Page): void {
    const currentState = this.stateSubject.value;
    this.setState({
      pages: [page, ...currentState.pages]
    });
  }

  updatePage(page: Page): void {
    const currentState = this.stateSubject.value;
    const updatedPages = currentState.pages.map(p => 
      p.id === page.id ? page : p
    );
    
    this.setState({ pages: updatedPages });
    if (page.id) {
      this.updateRecentPages(page.id);
    }
  }

  deletePage(pageId: string): void {
    const currentState = this.stateSubject.value;
    const updatedPages = currentState.pages.filter(p => p.id !== pageId);
    
    this.setState({ 
      pages: updatedPages,
      showWelcome: updatedPages.length === 0
    });
  }

  // Recent Pages
  private updateRecentPages(pageId: string): void {
    const currentState = this.stateSubject.value;
    let recentPages = currentState.recentPages.filter(id => id !== pageId);
    recentPages = [pageId, ...recentPages].slice(0, 10); // Keep only 10 most recent
    
    this.setState({ recentPages });
    localStorage.setItem('recentPages', JSON.stringify(recentPages));
  }

  setLastVisitedPage(pageId: string): void {
    this.setState({ lastVisitedPage: pageId });
    localStorage.setItem('lastVisitedPage', pageId);
    this.updateRecentPages(pageId);
  }

  // Welcome Screen
  hideWelcome(): void {
    this.setState({ showWelcome: false });
  }

  showWelcome(): void {
    this.setState({ showWelcome: true });
  }

  // Utility Methods
  getRecentPages(): Page[] {
    const currentState = this.stateSubject.value;
    return currentState.recentPages
      .map(id => currentState.pages.find(p => p.id === id))
      .filter((page): page is Page => page !== undefined);
  }

  getLastVisitedPage(): Page | null {
    const currentState = this.stateSubject.value;
    if (!currentState.lastVisitedPage) return null;
    
    return currentState.pages.find(p => p.id === currentState.lastVisitedPage) || null;
  }

  refreshPages(): void {
    this.loadPages();
  }

  // Search
  searchPages(query: string): Page[] {
    const currentState = this.stateSubject.value;
    const queryLower = query.toLowerCase();
    
    return currentState.pages.filter(page => 
      (page.title && page.title.toLowerCase().includes(queryLower)) ||
      (page.blocks && page.blocks.some(block => 
        getBlockText(block).toLowerCase().includes(queryLower)
      ))
    );
  }

  // Statistics
  getWorkspaceStats(): { totalPages: number; totalBlocks: number; lastActivity: Date | null } {
    const currentState = this.stateSubject.value;
    const totalPages = currentState.pages.length;
    const totalBlocks = currentState.pages.reduce((sum, page) => 
      sum + (page.blocks ? page.blocks.length : 0), 0
    );
    
    const lastActivity = currentState.pages.length > 0 
      ? new Date(Math.max(...currentState.pages
          .map(p => p.updatedAt ? new Date(p.updatedAt).getTime() : 0)
          .filter(time => time > 0)))
      : null;

    return { totalPages, totalBlocks, lastActivity };
  }
} 