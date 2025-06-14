import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page } from '../models/page.model';

@Injectable({
  providedIn: 'root'
})
export class PageService {
  private readonly API = 'http://localhost:8080/api/pages';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Page[]> {
    return this.http.get<Page[]>(this.API);
  }

  get(id: string): Observable<Page> {
    return this.http.get<Page>(`${this.API}/${id}`);
  }

  create(page: Page): Observable<Page> {
    return this.http.post<Page>(this.API, page);
  }

  update(id: string, page: Page): Observable<Page> {
    return this.http.put<Page>(`${this.API}/${id}`, page);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
} 