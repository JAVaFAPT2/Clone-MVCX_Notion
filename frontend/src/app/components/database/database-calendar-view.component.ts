import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Database, DatabaseView, DatabaseRecord, DatabaseProperty } from '../../models/database.model';
import { DatabaseService } from '../../services/database.service';
import { PropertyValueComponent } from './property-value.component';
import { PropertyEditorComponent } from './property-editor.component';

@Component({
  selector: 'app-database-calendar-view',
  standalone: true,
  imports: [CommonModule, FormsModule, PropertyValueComponent, PropertyEditorComponent],
  template: `
    <div class="calendar-view-container">
      <!-- Calendar Header -->
      <div class="calendar-header">
        <div class="calendar-controls">
          <button class="btn btn-secondary" (click)="previousMonth()">
            ←
          </button>
          <h2 class="current-month">{{ getCurrentMonthYear() }}</h2>
          <button class="btn btn-secondary" (click)="nextMonth()">
            →
          </button>
          <button class="btn btn-primary" (click)="goToToday()">
            Today
          </button>
        </div>
        
        <div class="calendar-filters">
          <select [(ngModel)]="dateProperty" (change)="onDatePropertyChange()" class="date-property-select">
            <option *ngFor="let prop of dateProperties" [value]="prop.id">
              {{ prop.name }}
            </option>
          </select>
          <input 
            type="text" 
            placeholder="Search records..." 
            [(ngModel)]="searchTerm"
            (input)="onSearchChange()"
            class="search-input"
          >
        </div>
      </div>

      <!-- Calendar Content -->
      <div class="calendar-content">
        <div class="calendar-grid">
          <!-- Day Headers -->
          <div class="day-header" *ngFor="let day of weekDays">
            {{ day }}
          </div>
          
          <!-- Calendar Days -->
          <div 
            *ngFor="let day of calendarDays; trackBy: trackByDay"
            class="calendar-day"
            [class.other-month]="!day.isCurrentMonth"
            [class.today]="day.isToday"
            [class.has-events]="day.records.length > 0"
          >
            <div class="day-number">{{ day.dayNumber }}</div>
            <div class="day-events">
              <div 
                *ngFor="let record of day.records; trackBy: trackByRecordId"
                class="day-event"
                [class.selected]="selectedRecords.has(record.id)"
                (click)="toggleRecordSelection(record.id, $event)"
              >
                <div class="event-title">
                  {{ getRecordTitle(record) }}
                </div>
                <div class="event-actions">
                  <button 
                    class="btn btn-sm btn-icon"
                    (click)="duplicateRecord(record); $event.stopPropagation()"
                    title="Duplicate record"
                  >
                    📋
                  </button>
                  <button 
                    class="btn btn-sm btn-icon btn-danger"
                    (click)="deleteRecord(record.id); $event.stopPropagation()"
                    title="Delete record"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <button 
                *ngIf="day.records.length < 3"
                class="btn btn-sm btn-add-event"
                (click)="addEventToDay(day.date)"
              >
                + Add Event
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="calendarDays.length === 0">
        <div class="empty-content">
          <span class="empty-icon">📅</span>
          <h3>No calendar data</h3>
          <p>Select a date property to view records in calendar format.</p>
          <button class="btn btn-primary" (click)="addNewRecord()">
            Create Record
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calendar-view-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: white;
    }

    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
      background: #f8f9fa;
      gap: 16px;
    }

    .calendar-controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .current-month {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
      min-width: 150px;
      text-align: center;
    }

    .calendar-filters {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .date-property-select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      font-size: 14px;
    }

    .search-input {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      min-width: 200px;
    }

    .calendar-content {
      flex: 1;
      overflow: auto;
      padding: 16px;
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
      background: #e0e0e0;
      border: 1px solid #e0e0e0;
      height: calc(100vh - 200px);
    }

    .day-header {
      background: #f8f9fa;
      padding: 12px;
      text-align: center;
      font-weight: 600;
      color: #666;
      font-size: 14px;
    }

    .calendar-day {
      background: white;
      padding: 8px;
      min-height: 120px;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .calendar-day.other-month {
      background: #f8f9fa;
      color: #ccc;
    }

    .calendar-day.today {
      background: #e3f2fd;
      border: 2px solid #007bff;
    }

    .calendar-day.has-events {
      background: #fff3cd;
    }

    .day-number {
      font-size: 14px;
      font-weight: 500;
      color: #333;
      margin-bottom: 4px;
    }

    .calendar-day.other-month .day-number {
      color: #ccc;
    }

    .day-events {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .day-event {
      background: #007bff;
      color: white;
      padding: 4px 6px;
      border-radius: 4px;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 4px;
    }

    .day-event:hover {
      background: #0056b3;
    }

    .day-event.selected {
      background: #28a745;
      box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.5);
    }

    .event-title {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .event-actions {
      display: flex;
      gap: 2px;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .day-event:hover .event-actions {
      opacity: 1;
    }

    .btn-add-event {
      background: #28a745;
      color: white;
      border: none;
      padding: 2px 6px;
      font-size: 10px;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 2px;
    }

    .btn-add-event:hover {
      background: #218838;
    }

    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 40px;
    }

    .empty-content {
      text-align: center;
      max-width: 400px;
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
      display: block;
    }

    .empty-content h3 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .empty-content p {
      margin: 0 0 16px 0;
      color: #666;
    }

    .btn {
      padding: 8px 16px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    .btn:hover {
      background: #f8f9fa;
    }

    .btn-primary {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }

    .btn-primary:hover {
      background: #0056b3;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
      border-color: #6c757d;
    }

    .btn-secondary:hover {
      background: #545b62;
    }

    .btn-sm {
      padding: 4px 8px;
      font-size: 12px;
    }

    .btn-icon {
      padding: 2px;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: none;
      font-size: 10px;
      color: white;
    }

    .btn-icon:hover {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
    }

    .btn-danger {
      color: #ffc107;
    }

    .btn-danger:hover {
      background: #dc3545;
      color: white;
    }

    @media (max-width: 768px) {
      .calendar-header {
        flex-direction: column;
        align-items: stretch;
      }

      .calendar-controls {
        justify-content: center;
      }

      .calendar-filters {
        justify-content: center;
      }

      .calendar-grid {
        grid-template-columns: repeat(7, 1fr);
        height: auto;
        min-height: 400px;
      }

      .calendar-day {
        min-height: 80px;
      }

      .day-event {
        font-size: 10px;
        padding: 2px 4px;
      }

      .event-actions {
        opacity: 1;
      }
    }
  `]
})
export class DatabaseCalendarViewComponent implements OnInit, OnDestroy {
  @Input() database!: Database;
  @Input() view!: DatabaseView;
  @Output() recordUpdate = new EventEmitter<DatabaseRecord>();
  @Output() recordDelete = new EventEmitter<string>();

  calendarDays: Array<{
    date: Date;
    dayNumber: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    records: DatabaseRecord[];
  }> = [];
  
  selectedRecords = new Set<string>();
  searchTerm = '';
  currentDate = new Date();
  dateProperty = '';
  dateProperties: DatabaseProperty[] = [];
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  private destroy$ = new Subject<void>();

  constructor(private databaseService: DatabaseService) {}

  ngOnInit(): void {
    this.updateDateProperties();
    this.loadRecords();
    this.generateCalendar();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateDateProperties(): void {
    this.dateProperties = this.database.properties.filter(p => 
      ['date', 'created_time', 'last_edited_time'].includes(p.type)
    );
    
    if (this.dateProperties.length > 0 && !this.dateProperty) {
      this.dateProperty = this.dateProperties[0].id;
    }
  }

  loadRecords(): void {
    this.databaseService.getFilteredRecords(this.database.id, this.view.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(records => {
        this.assignRecordsToDays(records);
      });
  }

  generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    this.calendarDays = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dayDate = new Date(date);
      this.calendarDays.push({
        date: dayDate,
        dayNumber: dayDate.getDate(),
        isCurrentMonth: dayDate.getMonth() === month,
        isToday: dayDate.getTime() === today.getTime(),
        records: []
      });
    }
  }

  assignRecordsToDays(records: DatabaseRecord[]): void {
    if (!this.dateProperty) return;
    
    // Clear existing records
    this.calendarDays.forEach(day => day.records = []);
    
    records.forEach(record => {
      const dateValue = record.properties[this.dateProperty];
      if (dateValue) {
        const recordDate = new Date(dateValue);
        const day = this.calendarDays.find(d => 
          d.date.getDate() === recordDate.getDate() &&
          d.date.getMonth() === recordDate.getMonth() &&
          d.date.getFullYear() === recordDate.getFullYear()
        );
        
        if (day) {
          day.records.push(record);
        }
      }
    });
  }

  getCurrentMonthYear(): string {
    return this.currentDate.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  }

  previousMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.generateCalendar();
    this.loadRecords();
  }

  nextMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.generateCalendar();
    this.loadRecords();
  }

  goToToday(): void {
    this.currentDate = new Date();
    this.generateCalendar();
    this.loadRecords();
  }

  onDatePropertyChange(): void {
    this.loadRecords();
  }

  onSearchChange(): void {
    // Implement search functionality
    console.log('Search:', this.searchTerm);
  }

  getRecordTitle(record: DatabaseRecord): string {
    const titleProperty = this.database.properties.find(p => p.type === 'title');
    if (titleProperty) {
      return record.properties[titleProperty.id] || 'Untitled';
    }
    return 'Untitled';
  }

  toggleRecordSelection(recordId: string, event: MouseEvent): void {
    if (event.ctrlKey || event.metaKey) {
      if (this.selectedRecords.has(recordId)) {
        this.selectedRecords.delete(recordId);
      } else {
        this.selectedRecords.add(recordId);
      }
    } else {
      this.selectedRecords.clear();
      this.selectedRecords.add(recordId);
    }
  }

  addEventToDay(date: Date): void {
    const newRecord = {
      [this.dateProperty]: date,
      title: 'New Event'
    };
    this.databaseService.addRecord(this.database.id, newRecord)
      .subscribe();
  }

  addNewRecord(): void {
    const newRecord = {
      title: 'New Record'
    };
    this.databaseService.addRecord(this.database.id, newRecord)
      .subscribe();
  }

  duplicateRecord(record: DatabaseRecord): void {
    const duplicatedProperties = { ...record.properties };
    this.databaseService.addRecord(this.database.id, duplicatedProperties)
      .subscribe();
  }

  deleteRecord(recordId: string): void {
    if (confirm('Are you sure you want to delete this record?')) {
      this.recordDelete.emit(recordId);
    }
  }

  trackByDay(index: number, day: any): string {
    return day.date.toISOString();
  }

  trackByRecordId(index: number, record: DatabaseRecord): string {
    return record.id;
  }
} 