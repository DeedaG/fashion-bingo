export interface ClothingItem {
  id: string;
  name: string;
  type: 'top' | 'bottom' | 'shoes' | 'accessory';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  imageUrl: string;
}
