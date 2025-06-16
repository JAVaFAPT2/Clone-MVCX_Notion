import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Block } from '../models/block.model';
import { extractLinksFromBlocks } from '../utils/page-link.util';

export interface PageLink {
  id?: string;
  sourcePageId: string;
  targetPageId: string;
  linkText?: string;
  blockId?: string;
  position?: number;
}

@Injectable({ providedIn: 'root' })
export class PageLinkApiService {
  private base = '/api/page-links';

  constructor(private http: HttpClient) {}

  /** Get all links originating from a page */
  getLinksFromPage(pageId: string): Observable<PageLink[]> {
    return this.http.get<PageLink[]>(`${this.base}/from/${pageId}`);
  }

  /** Create a link between pages */
  createLink(sourcePageId: string, targetPageId: string, linkText: string): Observable<PageLink> {
    return this.http.post<PageLink>(this.base, {
      sourcePageId,
      targetPageId,
      linkText,
      blockId: null,
      position: null
    });
  }

  /** Remove a link */
  removeLink(sourcePageId: string, targetPageId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${sourcePageId}/${targetPageId}/null`);
  }

  /** Get backlinks TO a page */
  getBacklinks(pageId: string): Observable<PageLink[]> {
    return this.http.get<PageLink[]>(`${this.base}/to/${pageId}`);
  }

  /**
   * Synchronise page links based on current block content.
   * Creates new links and removes obsolete ones.
   */
  syncLinks(pageId: string, blocks: Block[]): Observable<void> {
    const desiredLinks = extractLinksFromBlocks(blocks);

    return this.getLinksFromPage(pageId).pipe(
      switchMap(existing => {
        const existingTargets = existing.map(l => l.targetPageId);

        const toAdd = desiredLinks.filter(t => !existingTargets.includes(t));
        const toRemove = existingTargets.filter(t => !desiredLinks.includes(t));

        const addCalls = toAdd.map(t => this.createLink(pageId, t, t));
        const removeCalls = toRemove.map(t => this.removeLink(pageId, t));

        if (addCalls.length === 0 && removeCalls.length === 0) {
          return of(void 0);
        }

        return forkJoin([...addCalls, ...removeCalls]).pipe(map(() => void 0));
      }),
      catchError(err => {
        console.error('[PageLinkApi] syncLinks error', err);
        return of(void 0);
      })
    );
  }
} 