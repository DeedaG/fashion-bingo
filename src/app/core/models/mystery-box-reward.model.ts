import { ClothingItem } from './clothing-item.model';
import { Economy } from './economy.model';

export interface MysteryBoxOpenResult {
  item: ClothingItem;
  rarity: string;
  bonusCoins: number;
  bonusGems: number;
  economy: Economy;
  paymentMethod: string;
  coinsSpent: number;
  gemsSpent: number;
}

export interface MysteryBoxPricing {
  coinCost: number;
  gemCost: number;
}

export interface MysteryBoxHistoryEntry {
  rewardId: string;
  dateOpened: string;
  itemName: string;
  itemType: string;
  itemStyle: string;
  imageUrl?: string | null;
  rarity: string;
  coinsAwarded: number;
  gemsAwarded: number;
  paymentMethod: string;
  coinsSpent: number;
  gemsSpent: number;
}

export interface CoinSourceBreakdown {
  coinsFromMysteryBoxes: number;
  coinsSpentOnMysteryBoxes: number;
  netFromMysteryBoxes: number;
}

export interface MysteryBoxHistoryResponse {
  entries: MysteryBoxHistoryEntry[];
  coinSources: CoinSourceBreakdown;
}
