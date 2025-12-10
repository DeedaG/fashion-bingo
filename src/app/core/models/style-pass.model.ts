export interface StylePassTier {
  id: string;
  name: string;
  requiredPoints: number;
  freeReward: string;
  freeRewardImageUrl?: string | null;
  premiumReward: string;
  premiumRewardImageUrl?: string | null;
  freeUnlocked: boolean;
  freeClaimed: boolean;
  premiumUnlocked: boolean;
  premiumClaimed: boolean;
}

export interface StylePassState {
  points: number;
  premiumUnlocked: boolean;
  tiers: StylePassTier[];
}
