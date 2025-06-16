import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { Page } from '../models/page.model';
import { Block, BackendBlock, fromBackendBlock, toBackendBlock, createBlock } from '../models/block.model';
import { environment } from '../../environments/environment';
import { DebugService } from './debug.service';

interface BackendPage {
  id: string;
  title: string;
  blocks: BackendBlock[];
  icon?: string;
  updatedAt?: string;
  convexDocId?: string;
  linkedPageIds?: string[];
  createdBy?: string;
  lastEditedBy?: string;
  isPublic?: boolean;
  parentPageId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PageService {
  private apiUrl = `${environment.apiUrl}/pages`;

  constructor(
    private http: HttpClient,
    private debugService: DebugService
  ) {}

  private convertPageForBackend(page: Page): Partial<BackendPage> {
    if (!page) {
      console.error('Null or undefined page passed to convertPageForBackend');
      return { title: '', blocks: [] };
    }
    
    const backendBlocks = (page.blocks || []).map(block => {
      try {
        return toBackendBlock(block);
      } catch (error) {
        console.error('Error converting block to backend format:', error, block);
        // Return a default block if conversion fails
        return { type: 'paragraph', content: '' };
      }
    });

    // Only send the fields that are meant to be updated.
    return {
      title: page.title || '',
      icon: page.icon,
      blocks: backendBlocks,
    };
  }

  private convertPageFromBackend(backendPage: BackendPage): Page {
    if (!backendPage) {
      console.error('Null or undefined backendPage passed to convertPageFromBackend');
      return {
        id: '',
        title: '',
        blocks: [],
      };
    }
    
    const blocks = (backendPage.blocks || []).map(backendBlock => {
      try {
        return fromBackendBlock(backendBlock);
      } catch (error) {
        console.error('Error converting backend block to frontend format:', error, backendBlock);
        // Return a default block if conversion fails
        return createBlock('paragraph', '');
      }
    });

    return {
      ...backendPage,
      blocks,
      updatedAt: backendPage.updatedAt ? new Date(backendPage.updatedAt) : undefined
    };
  }

  getPages(): Observable<Page[]> {
    this.debugService.log('api', 'Fetching all pages');
    
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(pages => {
        const convertedPages = pages.map(page => this.convertPageFromBackend(page));
        this.debugService.log('api', `Fetched ${convertedPages.length} pages`);
        return convertedPages;
      }),
      catchError(error => {
        this.debugService.error('api', 'Error fetching pages', error);
        return of([]);
      })
    );
  }

  getPage(id: string): Observable<Page | null> {
    this.debugService.log('api', `Fetching page with ID: ${id}`);
    
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(page => {
        const convertedPage = this.convertPageFromBackend(page);
        this.debugService.log('api', `Fetched page: ${convertedPage.title}`);
        return convertedPage;
      }),
      catchError(error => {
        this.debugService.error('api', `Error fetching page with ID: ${id}`, error);
        return of(null);
      })
    );
  }

  createPage(page: Partial<Page>): Observable<Page> {
    this.debugService.log('api', 'Creating new page', { title: page.title });
    
    const backendPayload = this.convertPageForBackend(page as Page);
    
    return this.http.post<any>(this.apiUrl, backendPayload).pipe(
      map(createdPage => {
        const convertedPage = this.convertPageFromBackend(createdPage);
        this.debugService.log('api', `Created page with ID: ${convertedPage.id}`);
        return convertedPage;
      }),
      catchError(error => {
        this.debugService.error('api', 'Error creating page', error);
        throw error;
      })
    );
  }

  updatePage(id: string, page: Partial<Page>): Observable<Page> {
    const pageToUpdate = {
      ...page,
      blocks: (page.blocks || []).map(block => toBackendBlock(block))
    };
    return this.http.put<Page>(`${this.apiUrl}/${id}`, pageToUpdate).pipe(
      map(updatedPage => ({
        ...updatedPage,
        blocks: (updatedPage.blocks || []).map(block => fromBackendBlock(block))
      }))
    );
  }

  savePage(page: Page): Observable<Page> {
    if (!page.id) {
      throw new Error('Page ID is required to save.');
    }
    
    this.debugService.log('api', `Saving page with ID: ${page.id}`, { title: page.title });
    
    try {
      const backendPayload = this.convertPageForBackend(page);
      this.debugService.log('api', 'Backend payload prepared', backendPayload);
      
      return this.http.put<any>(`${this.apiUrl}/${page.id}`, backendPayload).pipe(
        map(updatedPage => {
          this.debugService.log('api', 'Backend response received', updatedPage);
          try {
            const convertedPage = this.convertPageFromBackend(updatedPage);
            this.debugService.log('api', `Page saved successfully: ${convertedPage.title}`);
            return convertedPage;
          } catch (error) {
            this.debugService.error('api', 'Error converting page from backend', error);
            // Return original page if conversion fails
            return page;
          }
        }),
        catchError(error => {
          this.debugService.error('api', `Error saving page with ID: ${page.id}`, error);
          throw error;
        })
      );
    } catch (error) {
      this.debugService.error('api', 'Error preparing page for backend', error);
      throw error;
    }
  }

  deletePage(id: string): Observable<void> {
    this.debugService.log('api', `Deleting page with ID: ${id}`);
    
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      map(() => {
        this.debugService.log('api', `Deleted page with ID: ${id}`);
      }),
      catchError(error => {
        this.debugService.error('api', `Error deleting page with ID: ${id}`, error);
        throw error;
      })
    );
  }

  updateBlock(pageId: string, blockId: string, block: Block): Observable<Block> {
    try {
      const blockToUpdate = toBackendBlock(block);
      return this.http.put<BackendBlock>(
        `${this.apiUrl}/${pageId}/blocks/${blockId}`,
        blockToUpdate
      ).pipe(
        map(updatedBlock => {
          try {
            return fromBackendBlock(updatedBlock);
          } catch (error) {
            console.error('Error converting updated block to frontend format:', error);
            throw error;
          }
        })
      );
    } catch (error) {
      console.error('Error converting block to backend format:', error);
      throw error;
    }
  }

  deleteBlock(pageId: string, blockId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${pageId}/blocks/${blockId}`);
  }
} 