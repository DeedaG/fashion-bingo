import { Pipe, PipeTransform } from '@angular/core';
import { ClothingItem } from '../../core/models/clothing-item.model';

@Pipe({
  name: 'filterByType',
  standalone: true
})
export class FilterByTypePipe implements PipeTransform {
  transform(items: ClothingItem[], type: string): ClothingItem[] {
    if (!items) return [];
    if (!type || type === 'all') return items;
    return items.filter(i => i.type === type);
  }
}
