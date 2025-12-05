import { Pipe, PipeTransform } from '@angular/core';
import { ClothingItem } from '../../core/models/clothing-item.model';

@Pipe({
  name: 'filterByType',
  standalone: true
})
export class FilterByTypePipe implements PipeTransform {
  transform(items: any[], type: string): any[] {
    if (!items) return [];
    if (!type || type === 'all') return items;
    return items.filter(i => {
      const candidate = i?.type ? i : i?.item;
      return candidate?.type === type;
    });
  }
}
