import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Page } from '../models/page.model';
import { PageService } from './page.service';

@Injectable({
  providedIn: 'root'
})
export class PageLinkParserService {

  constructor(private pageService: PageService) {}

  getSuggestedPages(query: string): Observable<Page[]> {
    if (!query || query.length < 2) {
      return of([]);
    }

    // Search pages by title
    return this.pageService.searchPages(query);
  }

  parsePageLinks(content: string): Array<{ text: string; pageId: string; start: number; end: number }> {
    const links: Array<{ text: string; pageId: string; start: number; end: number }> = [];
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      links.push({
        text: match[1],
        pageId: match[2],
        start: match.index,
        end: match.index + match[0].length
      });
    }

    return links;
  }

  extractLinkText(content: string, cursorPosition: number): string | null {
    const beforeCursor = content.substring(0, cursorPosition);
    const bracketMatch = beforeCursor.match(/\[([^\]]*)$/);
    
    if (bracketMatch) {
      return bracketMatch[1];
    }
    
    return null;
  }

  insertPageLink(content: string, cursorPosition: number, page: Page): string {
    const beforeCursor = content.substring(0, cursorPosition);
    const afterCursor = content.substring(cursorPosition);
    
    // Find the start of the link (the opening bracket)
    const bracketIndex = beforeCursor.lastIndexOf('[');
    
    if (bracketIndex >= 0) {
      const beforeLink = content.substring(0, bracketIndex);
      const afterLink = afterCursor;
      return beforeLink + `[${page.title || 'Untitled'}](${page.id})` + afterLink;
    }
    
    // If no opening bracket found, insert at cursor position
    return beforeCursor + `[${page.title || 'Untitled'}](${page.id})` + afterCursor;
  }

  validatePageLink(pageId: string): Observable<boolean> {
    // Check if the page exists
    return new Observable(observer => {
      this.pageService.getPage(pageId).subscribe({
        next: () => observer.next(true),
        error: () => observer.next(false),
        complete: () => observer.complete()
      });
    });
  }
} 