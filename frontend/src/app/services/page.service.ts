import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { tap } from 'rxjs/operators';
import { Page } from '../models/page.model';
import { Block, BlockType, getBlockText } from '../models/block.model';

export interface PageLink {
  id?: string;
  sourcePageId: string;
  targetPageId: string;
  linkText?: string;
  blockId: string;
  position?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({ providedIn: 'root' })
export class PageService {
  private apiUrl = 'http://localhost:8080/api/pages';
  private pageLinksUrl = 'http://localhost:8080/api/page-links';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    
    if (!token) {
      console.warn('No authentication token found!');
    }
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Get all pages for the current user
  getPages(): Observable<Page[]> {
    return this.http.get<Page[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  // Get a specific page by ID
  getPage(id: string): Observable<Page> {
    return this.http.get<Page>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(
        tap(page => {
          if (page.blocks) {
            page.blocks = page.blocks.map(normalizeBlock);
          }
        })
      );
  }

  // Create a new page
  createPage(page: Page): Observable<Page> {
    // Ensure required fields are present and convert blocks to backend format
    const payload: any = {
      title: page.title || 'Untitled',
      blocks: Array.isArray(page.blocks)
        ? page.blocks.map(b => ({
            type: b.type,
            content: getBlockText(b) // Convert array to string
          }))
        : [],
      icon: page.icon || '📄',
      parentId: page.parentId || null,
      order: page.order || 0  // Always include order field
    };
    return this.http.post<Page>(this.apiUrl, payload, { headers: this.getHeaders() });
  }

  // Update an existing page
  updatePage(id: string, page: Page): Observable<Page> {
    return this.http.put<Page>(`${this.apiUrl}/${id}`, page, { headers: this.getHeaders() });
  }

  // Delete a page
  deletePage(id: string): Observable<void> {
    console.log('PageService: Deleting page with ID:', id);
    
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders()
    });
  }

  // Search pages
  searchPages(query: string): Observable<Page[]> {
    return this.http.get<Page[]>(`${this.apiUrl}/search?query=${encodeURIComponent(query)}`, { 
      headers: this.getHeaders() 
    });
  }

  // Update page title only
  updatePageTitle(id: string, title: string): Observable<Page> {
    return this.http.put<Page>(`${this.apiUrl}/${id}/title`, `"${title}"`, { 
      headers: this.getHeaders() 
    });
  }

  // Update page icon only
  updatePageIcon(id: string, icon: string): Observable<Page> {
    return this.http.put<Page>(`${this.apiUrl}/${id}/icon`, `"${icon}"`, { 
      headers: this.getHeaders() 
    });
  }

  // Update Convex document ID
  updateConvexDocId(id: string, convexDocId: string): Observable<Page> {
    return this.http.put<Page>(`${this.apiUrl}/${id}/convex-doc`, `"${convexDocId}"`, { 
      headers: this.getHeaders() 
    });
  }

  // Get Convex document ID
  getConvexDocId(id: string): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/${id}/convex-doc`, { 
      headers: this.getHeaders() 
    });
  }

  // Page Linking Methods

  // Create a link between pages
  createPageLink(link: PageLink): Observable<PageLink> {
    return this.http.post<PageLink>(this.pageLinksUrl, link, { headers: this.getHeaders() });
  }

  // Remove a link between pages
  removePageLink(sourcePageId: string, targetPageId: string, blockId: string): Observable<void> {
    return this.http.delete<void>(`${this.pageLinksUrl}/${sourcePageId}/${targetPageId}/${blockId}`, { 
      headers: this.getHeaders() 
    });
  }

  // Get all links from a page
  getLinksFromPage(pageId: string): Observable<PageLink[]> {
    return this.http.get<PageLink[]>(`${this.pageLinksUrl}/from/${pageId}`, { 
      headers: this.getHeaders() 
    });
  }

  // Get all backlinks to a page
  getBacklinksToPage(pageId: string): Observable<PageLink[]> {
    return this.http.get<PageLink[]>(`${this.pageLinksUrl}/to/${pageId}`, { 
      headers: this.getHeaders() 
    });
  }

  // Get pages that the given page links to
  getLinkedPages(pageId: string): Observable<Page[]> {
    return this.http.get<Page[]>(`${this.pageLinksUrl}/${pageId}/linked-pages`, { 
      headers: this.getHeaders() 
    });
  }

  // Get pages that link to the given page (backlinks)
  getBacklinkPages(pageId: string): Observable<Page[]> {
    return this.http.get<Page[]>(`${this.pageLinksUrl}/${pageId}/backlink-pages`, { 
      headers: this.getHeaders() 
    });
  }

  // Search pages by link text
  searchPagesByLinkText(query: string): Observable<Page[]> {
    return this.http.get<Page[]>(`${this.pageLinksUrl}/search?query=${encodeURIComponent(query)}`, { 
      headers: this.getHeaders() 
    });
  }
}

// Utility to normalize blocks loaded from backend
export function normalizeBlock(block: any): Block {
  if (Array.isArray(block.content)) {
    return block;
  }
  if (typeof block.content === 'string') {
    return { ...block, content: [{ text: block.content }] };
  }
  return { ...block, content: [{ text: '' }] };
}

// Example usage: when loading a page
// page.blocks = page.blocks?.map(normalizeBlock) ?? []; 