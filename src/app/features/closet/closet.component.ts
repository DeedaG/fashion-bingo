import { Component, OnInit } from '@angular/core';
import { ClosetService } from '../../core/services/closet.service';
import { ClothingItem } from '../../core/models/clothing-item.model';
import { Mannequin } from '../../core/models/mannequin.model';

@Component({
  selector: 'app-closet',
  templateUrl: './closet.component.html',
  styleUrls: ['./closet.component.scss']
})
export class ClosetComponent implements OnInit {
  closet: ClothingItem[] = [];
  mannequin: Mannequin = { equippedItems: {} };
  playerId = 'some-player-id';

  constructor(private closetService: ClosetService) {}

  ngOnInit(): void {
    this.loadCloset();
  }

  loadCloset(): void {
    this.closetService.getCloset(this.playerId).subscribe(items => this.closet = items);
  }

  equipItem(item: ClothingItem): void {
    this.closetService.equipItem(this.playerId, item).subscribe(man => {
      this.mannequin = man;

      // Check if mannequin is fully dressed
      const requiredTypes = ["Shirt", "Pants", "Shoes", "Hat", "Accessory"];
      const fullyDressed = requiredTypes.every(type => !!this.mannequin.equippedItems[type]);
      if (fullyDressed) {
        alert('Congratulations! Your mannequin is fully dressed and your name is on the Hall of Fame!');
        // Optionally refresh leaderboard
      }
    });
  }

}
