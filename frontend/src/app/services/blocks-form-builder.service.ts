import { Injectable } from '@angular/core';
import { FormBuilder, FormArray, FormGroup } from '@angular/forms';
import { Block } from '../models/block.model';
import { BlockFormUtil } from '../utils/block-form.util';

@Injectable({ providedIn: 'root' })
export class BlocksFormBuilderService {
  constructor(private fb: FormBuilder) {}

  buildArray(blocks: Block[]): FormArray<FormGroup> {
    const array = this.fb.array<FormGroup>([]);
    blocks.forEach(b => {
      const group = BlockFormUtil.createBlockGroup(this.fb, b);
      array.push(group);
    });
    return array;
  }

  /** Convert a FormArray back to Block[] */
  toBlocks(array: FormArray<FormGroup>): Block[] {
    return array.controls.map(ctrl => BlockFormUtil.toBlock(ctrl));
  }
} 