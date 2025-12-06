export interface StylePassTier {
  id: string;
  name: string;
  requiredPoints: number;
  freeReward: string;
  premiumReward: string;
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
