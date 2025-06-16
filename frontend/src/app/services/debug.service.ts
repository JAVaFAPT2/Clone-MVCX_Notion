import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DebugService {
  private isDebugEnabled = true;
  private logHistory: any[] = [];
  private maxHistorySize = 100;

  constructor() {
    // Check if debug is disabled via localStorage
    const debugDisabled = localStorage.getItem('debugDisabled') === 'true';
    this.isDebugEnabled = !debugDisabled;
    
    // Log that the debug service is initialized
    this.log('system', '🔧 Debug service initialized', { enabled: this.isDebugEnabled });
    
    // Add global error handler
    window.addEventListener('error', (event) => {
      this.error('system', 'Uncaught error', { 
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });
  }

  /**
   * Enable or disable debugging
   */
  setDebugEnabled(enabled: boolean): void {
    this.isDebugEnabled = enabled;
    localStorage.setItem('debugDisabled', (!enabled).toString());
    this.log('system', `Debug ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if debugging is enabled
   */
  isEnabled(): boolean {
    return this.isDebugEnabled;
  }

  /**
   * Log an informational message
   */
  log(category: string, message: string, data?: any): void {
    if (!this.isDebugEnabled) return;
    
    const logEntry = this.createLogEntry('info', category, message, data);
    this.addToHistory(logEntry);
    
    console.log(`[${category}] ${message}`, data || '');
  }

  /**
   * Log a warning message
   */
  warn(category: string, message: string, data?: any): void {
    if (!this.isDebugEnabled) return;
    
    const logEntry = this.createLogEntry('warning', category, message, data);
    this.addToHistory(logEntry);
    
    console.warn(`⚠️ [${category}] ${message}`, data || '');
  }

  /**
   * Log an error message
   */
  error(category: string, message: string, data?: any): void {
    // Always log errors, even if debug is disabled
    const logEntry = this.createLogEntry('error', category, message, data);
    this.addToHistory(logEntry);
    
    console.error(`❌ [${category}] ${message}`, data || '');
  }

  /**
   * Log a UI event
   */
  logUIEvent(component: string, event: string, data?: any): void {
    if (!this.isDebugEnabled) return;
    
    const logEntry = this.createLogEntry('ui', component, event, data);
    this.addToHistory(logEntry);
    
    console.log(`🖱️ [${component}] ${event}`, data || '');
  }

  /**
   * Log a state change
   */
  logState(component: string, state: string, data?: any): void {
    if (!this.isDebugEnabled) return;
    
    const logEntry = this.createLogEntry('state', component, state, data);
    this.addToHistory(logEntry);
    
    console.log(`📊 [${component}] State: ${state}`, data || '');
  }

  /**
   * Get the log history
   */
  getLogHistory(): any[] {
    return [...this.logHistory];
  }

  /**
   * Clear the log history
   */
  clearLogHistory(): void {
    this.logHistory = [];
    this.log('system', 'Log history cleared');
  }

  /**
   * Create a log entry object
   */
  private createLogEntry(level: string, category: string, message: string, data?: any): any {
    return {
      timestamp: new Date(),
      level,
      category,
      message,
      data
    };
  }

  /**
   * Add a log entry to the history, maintaining the maximum size
   */
  private addToHistory(entry: any): void {
    this.logHistory.push(entry);
    
    // Trim history if it exceeds the maximum size
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory = this.logHistory.slice(-this.maxHistorySize);
    }
  }
} 