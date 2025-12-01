import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
export class ClosetComponent implements OnInit {
  closet: ClothingItem[] = [];
  mannequin: Mannequin = { equippedItems: {} };
  playerId = '';
  filterType: string = 'all';

  constructor(private closetService: ClosetService) {}

  ngOnInit(): void {
    this.loadCloset();
  }

  loadCloset(): void {
    if(!this.playerId){
      this.closet = [];
      return; 
    };
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
