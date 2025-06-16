import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { PageService } from '../../services/page.service';
import { WorkspaceService, WorkspaceState, QuickAction } from '../../services/workspace.service';
import { Page } from '../../models/page.model';
import { Subject } from 'rxjs';
import { SearchBarComponent } from '../search/search-bar.component';
import { WorkspaceWelcomeComponent } from './workspace-welcome.component';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule, RouterModule, SearchBarComponent, WorkspaceWelcomeComponent],
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss']
})
export class WorkspaceComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  workspaceState: WorkspaceState = {
    pages: [],
    showWelcome: false,
    isLoading: true,
    lastVisitedPage: null,
    recentPages: []
  };
  loading = true;
  error = '';

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private pageService: PageService,
    private workspaceService: WorkspaceService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.loadWorkspaceState();
    
    // Listen for navigation back to workspace to refresh pages
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      if (event instanceof NavigationEnd && event.url === '/workspace') {
        this.refreshPages();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserData() {
    // Get user data from localStorage or token
    const token = this.authService.getToken();
    if (token) {
      // Decode JWT token to get user info (simplified)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUser = {
          id: payload.id,
          username: payload.sub,
          email: payload.email
        };
      } catch (e) {
        console.error('Error decoding token:', e);
      }
    }
  }

  loadWorkspaceState() {
    this.workspaceService.getState().subscribe({
      next: (state) => {
        this.workspaceState = state;
        this.loading = state.isLoading;
        this.error = '';
      },
      error: (error) => {
        console.error('Error loading workspace state:', error);
        this.error = 'Failed to load workspace. Please try again.';
        this.loading = false;
        
        // If unauthorized, redirect to login
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  loadPages() {
    this.loading = true;
    this.error = '';

    this.pageService.getPages().subscribe({
      next: (pages: Page[]) => {
        this.workspaceState.pages = pages;
        this.workspaceState.showWelcome = pages.length === 0;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading pages:', error);
        this.error = 'Failed to load pages. Please try again.';
        this.loading = false;
        
        // If unauthorized, redirect to login
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  createNewPage() {
    // Create a new page and open it immediately
    this.pageService.createPage({ title: 'Untitled', icon: '📄', blocks: [] }).subscribe({
      next: (newPage) => {
        this.refreshPages(() => {
          this.openPage(newPage.id!);
        });
      },
      error: (error) => {
        alert('Failed to create page. Please try again.');
        console.error('Create page error:', error);
      }
    });
  }

  openPage(pageId: string) {
    // Navigate to page editor
    this.router.navigate(['/workspace/page', pageId]);
    this.workspaceService.setLastVisitedPage(pageId);
  }

  deletePage(pageId: string, event: Event) {
    event.stopPropagation();
    if (!this.authService.isAuthenticated()) {
      alert('You are not authenticated. Please log in again.');
      this.router.navigate(['/login']);
      return;
    }
    if (confirm('Are you sure you want to delete this page?')) {
      this.pageService.deletePage(pageId).subscribe({
        next: () => {
          this.refreshPages();
        },
        error: (error) => {
          alert('Failed to delete page. Please try again.');
          console.error('Delete page error:', error);
        }
      });
    }
  }

  onQuickAction(action: QuickAction) {
    this.workspaceService.handleQuickAction(action);
  }

  onTemplateClick(template: any) {
    console.log('Template clicked:', template);
    // This would create a new page from the template
    this.createNewPage();
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Logout error:', err);
        // Still navigate to login even if logout fails
        this.router.navigate(['/login']);
      }
    });
  }

  refreshPages(callback?: () => void) {
    this.loading = true;
    this.error = '';
    this.pageService.getPages().subscribe({
      next: (pages: Page[]) => {
        this.workspaceState.pages = pages;
        this.workspaceState.showWelcome = pages.length === 0;
        this.loading = false;
        if (callback) callback();
      },
      error: (error) => {
        this.error = 'Failed to load pages. Please try again.';
        this.loading = false;
        if (callback) callback();
      }
    });
  }

  isPageOpen(): boolean {
    // Checks if the current route is a page editor route
    return this.router.url.startsWith('/workspace/page/');
  }

  get pages(): Page[] {
    return this.workspaceState.pages;
  }

  get showWelcome(): boolean {
    return this.workspaceState.showWelcome;
  }
} 