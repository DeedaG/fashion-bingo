import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopService, ShopOffer } from '../../core/services/shop.service';
import { ClosetService } from '../../core/services/closet.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit, OnChanges {
  @Input() playerId = '';
  offers: ShopOffer[] = [];
  loading = false;
  statusMessage = '';

  constructor(private shopService: ShopService, private closetService: ClosetService) {}

  ngOnInit(): void {
    this.loadOffers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['playerId'] && !changes['playerId'].currentValue) {
      this.statusMessage = 'Start a game to unlock the boutique.';
    }
  }

  imageUrl(offer: ShopOffer): string {
    return `${environment.apiBase}/clothing/${offer.sprite}`;
  }

  buy(offer: ShopOffer): void {
    if (!this.playerId || this.playerId.trim().length === 0) {
      this.statusMessage = 'Start a game first so we can place items in your closet.';
      return;
    }
    this.loading = true;
    this.shopService.buyOffer(this.playerId.trim(), offer.id).subscribe({
      next: result => {
        this.loading = false;
        this.statusMessage = `${offer.name} added to your closet!`;
        try { this.closetService.notifyClosetUpdated(this.playerId.trim()); } catch { /* ignore */ }
      },
      error: err => {
        this.loading = false;
        const message = err?.error ?? 'Purchase failed. Please try again.';
        this.statusMessage = typeof message === 'string' ? message : 'Purchase failed. Please try again.';
      }
    });
  }

  private loadOffers(): void {
    this.loading = true;
    this.shopService.getOffers().subscribe({
      next: offers => {
        this.offers = offers;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.statusMessage = 'Unable to load the boutique right now.';
      }
    });
  }
}
