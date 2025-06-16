import { FormBuilder, FormGroup } from '@angular/forms';
import { Block } from '../models/block.model';

/**
 * Utility that converts a Block model to a reactive FormGroup and back.
 */
export class BlockFormUtil {
  static createBlockGroup(fb: FormBuilder, block: Block): FormGroup {
    return fb.group({
      id: [block.id],
      type: [block.type],
      content: [typeof block.content === 'string' ? block.content : ''],
      checked: [block.checked ?? false]
    });
  }

  static toBlock(group: FormGroup): Block {
    const raw = group.getRawValue();
    return {
      id: raw.id,
      type: raw.type,
      content: raw.content,
      checked: raw.checked
    } as Block;
  }
} 