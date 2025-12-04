import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ClosetService } from '../../core/services/closet.service';
import { ClothingItem } from '../../core/models/clothing-item.model';
import { Mannequin } from '../../core/models/mannequin.model';
import { FilterByTypePipe } from '../../shared/pipes/filter-by-type.pipe';

@Component({
  selector: 'app-closet',
  standalone: true,
  imports: [CommonModule, FilterByTypePipe],
  templateUrl: './closet.component.html',
  styleUrls: ['./closet.component.css']
})
export class ClosetComponent implements OnInit, OnDestroy, OnChanges {
  closet: ClothingItem[] = [];
  mannequin: Mannequin = { equippedItems: {} };
  @Input() playerId = '';
  filterType: string = 'all';
  lastActionMessage = '';

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
          this.closet = Array.isArray(items) ? items : [];
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

      // Check if mannequin is fully dressed
      const requiredTypes = ["Shirt", "Pants", "Shoes", "Hat", "Accessory"];
      const fullyDressed = requiredTypes.every(type => !!this.mannequin.equippedItems[type]);
      if (fullyDressed) {
        alert('Congratulations! Your mannequin is fully dressed and your name is on the Hall of Fame!');
        // Optionally refresh leaderboard
      }
      this.lastActionMessage = `${item.name} equipped!`;
    }, err => {
      console.error('Equip error', err);
      this.lastActionMessage = 'Failed to equip item.';
    });
  }

}
