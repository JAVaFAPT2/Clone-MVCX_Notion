import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

const EMOJIS = ['📄','📁','📝','✅','❗','💡','🎯','📚','📊','📈','🗒️','🔗','⭐','🔥','🚀','🎉'];

@Component({
  selector: 'app-emoji-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './emoji-picker.component.html',
  styleUrls: ['./emoji-picker.component.scss']
})
export class EmojiPickerComponent {
  emojis = EMOJIS;
  @Output() select = new EventEmitter<string>();

  pick(emoji: string) {
    this.select.emit(emoji);
  }
} 