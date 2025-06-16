import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DebugService } from '../../services/debug.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-debug-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="debug-panel" [class.collapsed]="isCollapsed" [class.expanded]="!isCollapsed">
      <div class="debug-header" (click)="toggleCollapse()">
        <span>🐞 Debug Panel</span>
        <div class="controls">
          <label>
            <input type="checkbox" [checked]="debugService.isEnabled()" (change)="toggleDebug($event)">
            Enable Debug
          </label>
          <button (click)="clearLogs($event)">Clear</button>
          <button (click)="toggleCollapse()">{{ isCollapsed ? '▼' : '▲' }}</button>
        </div>
      </div>
      
      <div class="debug-content" *ngIf="!isCollapsed">
        <div class="filters">
          <label>
            <input type="checkbox" [(ngModel)]="filters.info" (change)="applyFilters()">
            Info
          </label>
          <label>
            <input type="checkbox" [(ngModel)]="filters.warning" (change)="applyFilters()">
            Warning
          </label>
          <label>
            <input type="checkbox" [(ngModel)]="filters.error" (change)="applyFilters()">
            Error
          </label>
          <label>
            <input type="checkbox" [(ngModel)]="filters.ui" (change)="applyFilters()">
            UI
          </label>
          <label>
            <input type="checkbox" [(ngModel)]="filters.state" (change)="applyFilters()">
            State
          </label>
        </div>
        
        <div class="log-container">
          <div *ngFor="let log of filteredLogs" class="log-entry" [class]="'log-' + log.level">
            <div class="log-time">{{ formatTime(log.timestamp) }}</div>
            <div class="log-category">[{{ log.category }}]</div>
            <div class="log-message">{{ log.message }}</div>
            <div class="log-data" *ngIf="log.data">{{ formatData(log.data) }}</div>
          </div>
          
          <div *ngIf="filteredLogs.length === 0" class="no-logs">
            No logs to display
          </div>
        </div>
        
        <div class="debug-info">
          <div>Memory: {{ memoryUsage }} MB</div>
          <div>API Calls: {{ apiCallCount }}</div>
          <div>Errors: {{ errorCount }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .debug-panel {
      position: fixed;
      bottom: 0;
      right: 0;
      width: 400px;
      background-color: rgba(0, 0, 0, 0.85);
      color: #fff;
      font-family: monospace;
      font-size: 12px;
      z-index: 9999;
      border-top-left-radius: 5px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
      transition: height 0.3s ease;
    }
    
    .debug-panel.collapsed {
      height: 30px;
    }
    
    .debug-panel.expanded {
      height: 300px;
      display: flex;
      flex-direction: column;
    }
    
    .debug-header {
      padding: 5px 10px;
      background-color: #333;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      user-select: none;
    }
    
    .controls {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    
    .debug-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    .filters {
      padding: 5px 10px;
      display: flex;
      gap: 10px;
      background-color: #222;
      border-bottom: 1px solid #444;
    }
    
    .log-container {
      flex: 1;
      overflow-y: auto;
      padding: 5px;
    }
    
    .log-entry {
      padding: 3px 5px;
      margin-bottom: 2px;
      display: flex;
      flex-wrap: wrap;
      border-bottom: 1px solid #333;
    }
    
    .log-info { color: #7fdbff; }
    .log-warning { color: #ffdc00; }
    .log-error { color: #ff4136; }
    .log-ui { color: #2ecc40; }
    .log-state { color: #b10dc9; }
    
    .log-time {
      margin-right: 5px;
      color: #aaa;
    }
    
    .log-category {
      margin-right: 5px;
      font-weight: bold;
    }
    
    .log-data {
      width: 100%;
      margin-top: 2px;
      padding-left: 10px;
      color: #999;
      white-space: pre-wrap;
      word-break: break-all;
    }
    
    .debug-info {
      padding: 5px 10px;
      background-color: #222;
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #444;
    }
    
    .no-logs {
      padding: 10px;
      text-align: center;
      color: #666;
    }
    
    button {
      background: #444;
      border: none;
      color: white;
      padding: 2px 5px;
      border-radius: 3px;
      cursor: pointer;
    }
    
    button:hover {
      background: #555;
    }
  `]
})
export class DebugPanelComponent implements OnInit, OnDestroy {
  isCollapsed = true;
  logs: any[] = [];
  filteredLogs: any[] = [];
  memoryUsage = '0';
  apiCallCount = 0;
  errorCount = 0;
  
  filters = {
    info: true,
    warning: true,
    error: true,
    ui: true,
    state: true
  };
  
  private refreshSubscription?: Subscription;

  constructor(public debugService: DebugService) {}

  ngOnInit() {
    // Refresh logs and stats every second
    this.refreshSubscription = interval(1000).subscribe(() => {
      this.refreshLogs();
      this.updateStats();
    });
    
    // Initial refresh
    this.refreshLogs();
    this.updateStats();
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleDebug(event: Event) {
    const target = event.target as HTMLInputElement;
    this.debugService.setDebugEnabled(target.checked);
    event.stopPropagation();
  }

  clearLogs(event: Event) {
    this.debugService.clearLogHistory();
    this.refreshLogs();
    event.stopPropagation();
  }

  applyFilters() {
    this.filteredLogs = this.logs.filter(log => {
      if (log.level === 'info' && !this.filters.info) return false;
      if (log.level === 'warning' && !this.filters.warning) return false;
      if (log.level === 'error' && !this.filters.error) return false;
      if (log.level === 'ui' && !this.filters.ui) return false;
      if (log.level === 'state' && !this.filters.state) return false;
      return true;
    });
  }

  formatTime(timestamp: Date): string {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString() + '.' + date.getMilliseconds().toString().padStart(3, '0');
  }

  formatData(data: any): string {
    if (!data) return '';
    try {
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return String(data);
    }
  }

  private refreshLogs() {
    this.logs = this.debugService.getLogHistory();
    this.applyFilters();
    this.errorCount = this.logs.filter(log => log.level === 'error').length;
  }

  private updateStats() {
    // Calculate memory usage
    if (window.performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      this.memoryUsage = (memory.usedJSHeapSize / (1024 * 1024)).toFixed(2);
    }
    
    // Count API calls from log history
    this.apiCallCount = this.logs.filter(log => 
      log.category === 'api' || 
      (log.message && log.message.includes('API'))
    ).length;
  }
} 