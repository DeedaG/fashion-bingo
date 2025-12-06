import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ClosetService } from '../../core/services/closet.service';
import { ClothingItem } from '../../core/models/clothing-item.model';
import { Mannequin } from '../../core/models/mannequin.model';
import { FilterByTypePipe } from '../../shared/pipes/filter-by-type.pipe';
import { environment } from '../../../../environments/environment';
import { PlayerService } from '../../core/services/player.service';
import { Player } from '../../core/models/player.model';

@Component({
  selector: 'app-closet',
  standalone: true,
  imports: [CommonModule, FilterByTypePipe],
  templateUrl: './closet.component.html',
  styleUrls: ['./closet.component.css']
})
export class ClosetComponent implements OnInit, OnDestroy, OnChanges {
  closet: ClothingItem[] = [];
  closetSlots: { item?: ClothingItem; inUse?: boolean }[] = [];
  mannequin: Mannequin = { equippedItems: {} };
  @Input() playerId = '';
  filterType: string = 'all';
  lastActionMessage = '';
  outfitLocked = false;
  isPremiumPlayer = false;
  playerDisplayName = '';
  celebrationMessage = '';
  readonly topSlotTypes = ["Shirt", "Blouse", "Sweater", "Coat"];
  private readonly hatRequiredNames = new Set<string>([
    'Sun Dress',
    'Summer Sandal',
    'Sun Hat',
    'Beach Bag',
    'T Shirt',
    'Sneakers',
    'Jeans',
    'Crossbody Bag',
    'Baseball Hat'
  ]);

  private subscriptions = new Subscription();

  constructor(private closetService: ClosetService, private playerService: PlayerService) {}

  ngOnInit(): void {
    // subscribe for real-time updates
    this.subscriptions.add(
      this.closetService.onClosetUpdated().subscribe(updatedPlayerId => {
        if (!this.playerId || this.playerId.trim().length === 0 || this.playerId === updatedPlayerId) {
          this.loadCloset();
          this.lastActionMessage = 'Closet refreshed after update.';
        }
      })
    );

    // If the component is created after a player already started a game,
    // make sure we hydrate the closet immediately.
    if (this.playerId && this.playerId.trim().length > 0) {
      this.loadCloset();
    }
  }

  private requiresHat(): boolean {
    const equipped = Object.values(this.mannequin.equippedItems ?? {});
    return equipped.some(item => !!item?.name && this.hatRequiredNames.has(item.name));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['playerId']) {
      const val = changes['playerId'].currentValue;
      if (typeof val === 'string' && val.trim().length > 0) {
        this.loadCloset();
      } else {
        this.closet = [];
        this.closetSlots = [];
        this.isPremiumPlayer = false;
        this.playerDisplayName = '';
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadCloset(): void {
    console.log('ClosetComponent.loadCloset playerId:', this.playerId);

    if(!this.playerId || this.playerId.trim().length === 0){
      this.closet = [];
      this.lastActionMessage = 'Please start a game or enter a playerId to load your closet.';
      return; 
    }
    if (typeof this.playerId === 'string' && this.playerId.trim().length > 0) {
      this.fetchPlayerProfile();
      this.closetService.getCloset(this.playerId.trim()).subscribe({
        next: items => {
          const loaded = Array.isArray(items) ? items : [];
          this.closet = loaded;
          this.syncClosetSlots();
          console.log('Closet loaded:', this.closet);
          this.lastActionMessage = `Loaded ${this.closet.length} items.`;
        },
        error: err => {
          console.error('Error loading closet:', err);
          this.lastActionMessage = 'Failed to load closet. Please check your player ID.';
        }
      });
    } else {
      this.closet = [];
      console.warn('ClosetComponent: playerId is invalid');
    }
  }

  equipItem(item: ClothingItem): void {
    this.closetService.equipItem(this.playerId, item).subscribe(man => {
      const updated = man?.equippedItems ?? {};
      const current = this.mannequin?.equippedItems ?? {};
      this.mannequin = {
        equippedItems: {
          ...current,
          ...updated
        }
      };

      const slotRequirements: string[][] = [
        [...this.topSlotTypes, "Dress"],
        ["Pants", "Dress"],
        ["Shoes"],
        ["Bag"]
      ];
      if (this.requiresHat()) {
        slotRequirements.push(["Hat"]);
      }
      const fullyDressed = slotRequirements.every(optionSet =>
        optionSet.some(type => !!this.mannequin.equippedItems[type])
      );
      if (fullyDressed) {
        this.outfitLocked = true;
        this.retireCompletedOutfit(slotRequirements);
      } else {
        this.lastActionMessage = `${item.name} equipped!`;
      }
      this.markItemInUse(item, true);
    }, err => {
      console.error('Equip error', err);
      this.lastActionMessage = 'Failed to equip item.';
    });
  }

  unequip(type: string): void {
    if (this.outfitLocked) {
      this.lastActionMessage = 'Completed outfits cannot be changed.';
      return;
    }

    const current = this.mannequin.equippedItems?.[type];

    if (!type || !current) {
      return;
    }

    const updated = { ...this.mannequin.equippedItems };
    delete updated[type];
    this.mannequin = { equippedItems: updated };
    this.lastActionMessage = `${type} removed from mannequin.`;
    if (current?.id) {
      this.markItemInUse(current, false);
    }
  }

  private retireCompletedOutfit(requirements: string[][]): void {
    const equippedItems = requirements
      .map(optionSet => {
        for (const type of optionSet) {
          const candidate = this.mannequin.equippedItems[type];
          if (candidate?.id) {
            return candidate;
          }
        }
        return undefined;
      })
      .filter((itm): itm is ClothingItem => !!itm && !!itm.id);

    const uniqueItems = new Map<string, ClothingItem>();
    equippedItems.forEach(item => {
      if (item.id && !uniqueItems.has(item.id)) {
        uniqueItems.set(item.id, item);
      }
    });

    if (!this.playerId || uniqueItems.size === 0) {
      this.lastActionMessage = 'Completed outfit, but no items were available to retire.';
      this.outfitLocked = false;
      return;
    }

    const idsToRemove = Array.from(uniqueItems.keys());

    this.closetService.consumeItems(this.playerId, idsToRemove).subscribe({
      next: () => {
        this.celebrationMessage = 'Flawless finish! Your mannequin has taken the runway and your name is now shining in the Hall of Fame.';
        this.lastActionMessage = 'Full look locked in! Those pieces have been retired from your closet.';
        if (!this.isPremiumPlayer) {
          this.closet = this.closet.filter(ci => !idsToRemove.includes(ci.id));
          this.syncClosetSlots();
        } else {
          this.releaseInUseSlots(idsToRemove);
        }
        const updatedEquipped = { ...this.mannequin.equippedItems };
        uniqueItems.forEach(item => {
          if (item.type && updatedEquipped[item.type]?.id === item.id) {
            delete updatedEquipped[item.type];
          }
        });
        this.mannequin = { equippedItems: updatedEquipped };
        this.outfitLocked = false;
        try { this.closetService.notifyClosetUpdated(this.playerId); } catch { /* ignore */ }
      },
      error: err => {
        console.error('Retire outfit error', err);
        this.lastActionMessage = 'Your mannequin is dressed, but we could not retire the items. Please try again.';
        this.outfitLocked = false;
      }
    });
  }

  getEquippedForTypes(types: string[]): { type: string; item: ClothingItem } | null {
    for (const type of types) {
      const candidate = this.mannequin.equippedItems?.[type];
      if (candidate) {
        return { type, item: candidate };
      }
    }
    return null;
  }

  private syncClosetSlots(): void {
    this.closetSlots = this.closet.map(item => ({
      item,
      inUse: this.isItemEquipped(item)
    }));
  }

  private releaseInUseSlots(idsToRemove: string[]): void {
    const idSet = new Set(idsToRemove);
    this.closetSlots = this.closetSlots.map(slot => (
      slot.item && idSet.has(slot.item.id)
        ? { ...slot, inUse: false }
        : slot
    ));
  }

  private isItemEquipped(item: ClothingItem): boolean {
    return Object.values(this.mannequin.equippedItems ?? {}).some(eq => eq?.id === item.id);
  }

  private markItemInUse(item: ClothingItem, inUse: boolean): void {
    const slot = this.closetSlots.find(s => s.item?.id === item.id);
    if (slot) {
      slot.inUse = inUse;
    }
  }

  private assignProfileDetails(player: Partial<Player> | any): void {
    if (!player) {
      this.isPremiumPlayer = false;
      return;
    }
    this.isPremiumPlayer = this.resolvePremiumFlag(player);
    const rawName = (player as any).name ?? (player as any).Name;
    if (typeof rawName === 'string' && rawName.trim().length > 0) {
      this.playerDisplayName = rawName.trim();
    }
  }

  private resolvePremiumFlag(player: Partial<Player> | any): boolean {
    if (typeof (player as any).isPremium === 'boolean') {
      return (player as any).isPremium;
    }
    if (typeof (player as any).IsPremium === 'boolean') {
      return (player as any).IsPremium;
    }
    return false;
  }

  upgradeToPremium(): void {
    if (!this.playerId) {
      this.lastActionMessage = 'Start a game to upgrade your closet.';
      return;
    }
    this.playerService.setPremiumStatus(this.playerId.trim(), true).subscribe({
      next: player => {
        this.assignProfileDetails(player);
        this.lastActionMessage = 'Premium closet unlocked! Items will now persist.';
      },
      error: err => {
        console.error('Premium upgrade failed', err);
        this.lastActionMessage = 'Unable to unlock premium right now. Please try again.';
      }
    });
  }

  get displayPlayerLabel(): string {
    if (this.playerDisplayName?.trim()) {
      return this.playerDisplayName.trim();
    }
    if (this.playerId?.trim()) {
      return this.formatPlayerLabel(this.playerId.trim());
    }
    return '—';
  }

  private formatPlayerLabel(id: string): string {
    if (!id) {
      return '';
    }
    const normalized = id.startsWith('player-') ? id.replace('player-', '') : id;
    return `Player ${normalized.slice(0, 6)}`;
  }

  private fetchPlayerProfile(): void {
    if (!this.playerId) {
      return;
    }
    const trimmed = this.playerId.trim();
    if (trimmed.length === 0) {
      return;
    }
    this.playerService.getPlayer(trimmed).subscribe({
      next: player => {
        this.assignProfileDetails(player);
      },
      error: err => {
        console.warn('Unable to load player profile', err);
      }
    });
  }

  dismissCelebration(): void {
    this.celebrationMessage = '';
  }

}
