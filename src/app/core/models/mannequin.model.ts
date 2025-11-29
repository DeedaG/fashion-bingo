import { ClothingItem } from './clothing-item.model';

export interface Mannequin {
    equippedItems: { [type: string]: ClothingItem };
}
