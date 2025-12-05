import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';

type LookbookItem = {
  name: string;
  image: string;
  type: string;
};

type LookbookOutfit = {
  title: string;
  subtitle: string;
  description: string;
  items: LookbookItem[];
};

@Component({
  selector: 'app-lookbook',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lookbook.component.html',
  styleUrls: ['./lookbook.component.css']
})
export class LookbookComponent {
  protected readonly outfits: LookbookOutfit[] = [
    {
      title: 'Sunlit Stroll',
      subtitle: 'Outfit #1',
      description: 'Breathable linens and pastel brims for a boardwalk-ready vibe.',
      items: [
        { name: 'Sun Dress', image: 'sun-dress.png', type: 'Dress' },
        { name: 'Sun Hat', image: 'straw-hat.png', type: 'Hat' },
        { name: 'Summer Sandal', image: 'sandal.png', type: 'Shoes' }
      ]
    },
    {
      title: 'City Gala',
      subtitle: 'Outfit #2',
      description: 'Layer pearls over jet black silhouettes for instant evening drama.',
      items: [
        { name: 'Black Top', image: 'blouse-black.png', type: 'Blouse' },
        { name: 'Gold Skirt', image: 'taffeta-skirt.png', type: 'Skirt' },
        { name: 'Black Boot', image: 'boot.png', type: 'Shoes' },
        { name: 'Pearl Necklace', image: 'pearls.png', type: 'Necklace' }
      ]
    },
    {
      title: 'Arcade Pop',
      subtitle: 'Outfit #3',
      description: 'Retro denim, neon kicks, and a bright tee for a perfect bingo night.',
      items: [
        { name: 'T Shirt', image: 'pink-tee.png', type: 'Shirt' },
        { name: 'Jeans', image: 'goodjeans.png', type: 'Pants' },
        { name: 'Sneakers', image: 'sneakers.jpg', type: 'Shoes' },
        { name: 'Baseball Hat', image: 'baseball-hat.png', type: 'Hat' }
      ]
    },
    {
      title: 'Red Carpet Run',
      subtitle: 'Outfit #4',
      description: 'Velvet accessories and sculpted heels turn any catwalk into yours.',
      items: [
        { name: 'Black Dress', image: 'gown-black.png', type: 'Dress' },
        { name: 'Black Stiletto', image: 'stiletto.png', type: 'Shoes' },
        { name: 'Velvet Black Purse', image: 'purse-black.png', type: 'Bag' }
      ]
    },
    {
      title: 'Cozy Corridor',
      subtitle: 'Outfit #5',
      description: 'Chunky knits meet structured trousers for winter-ready polish.',
      items: [
        { name: 'Sweater', image: 'sweater.jpg', type: 'Sweater' },
        { name: 'Trousers', image: 'trousers.png', type: 'Pants' },
        { name: 'Doc Martens', image: 'doc-marten.png', type: 'Shoes' },
        { name: 'Blue Leather Handbag', image: 'handbag-blue.png', type: 'Bag' }
      ]
    }
  ];

  protected imageUrl(file: string): string {
    if (!file) {
      return '';
    }
    return file.startsWith('http') ? file : `${environment.apiBase}/clothing/${file}`;
  }
}
