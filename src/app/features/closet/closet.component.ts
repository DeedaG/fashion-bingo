import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ClosetService } from '../../core/services/closet.service';
import { ClothingItem } from '../../core/models/clothing-item.model';
import { Mannequin } from '../../core/models/mannequin.model';
import { FilterByTypePipe } from '../../shared/pipes/filter-by-type.pipe';
import { environment } from '../../../../environments/environment';

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
  readonly topSlotTypes = ["Shirt", "Blouse", "Sweater", "Coat"];

  private subscriptions = new Subscription();

  constructor(private closetService: ClosetService) {}

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
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['playerId']) {
      const val = changes['playerId'].currentValue;
      if (typeof val === 'string' && val.trim().length > 0) {
        this.loadCloset();
      } else {
        this.closet = [];
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
        ["Hat"],
        ["Necklace"]
      ];
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
        alert('Congratulations! Your mannequin is fully dressed and your name is on the Hall of Fame!');
        this.lastActionMessage = 'Full look locked in! Those pieces have been retired from your closet.';
        this.closet = this.closet.filter(ci => !idsToRemove.includes(ci.id));
        this.syncClosetSlots();
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

  private isItemEquipped(item: ClothingItem): boolean {
    return Object.values(this.mannequin.equippedItems ?? {}).some(eq => eq?.id === item.id);
  }

  private markItemInUse(item: ClothingItem, inUse: boolean): void {
    const slot = this.closetSlots.find(s => s.item?.id === item.id);
    if (slot) {
      slot.inUse = inUse;
    }
  }

}
