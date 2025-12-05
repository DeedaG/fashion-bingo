import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ClothingItem } from '../models/clothing-item.model';
import { Mannequin } from '../models/mannequin.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClosetService {
  private baseUrl = environment.apiUrl +  '/closet';

  // Subject to broadcast closet updates (payload: playerId)
  private closetUpdated$ = new Subject<string>();

  constructor(private http: HttpClient) { }

  getCloset(playerId: string): Observable<ClothingItem[]> {
    console.log('Fetching closet for playerId:', playerId);
    // Ensure playerId is a valid GUID string before sending
    return this.http.get<ClothingItem[]>(`${this.baseUrl}/${encodeURIComponent(playerId)}`);
  }

  addItem(playerId: string, item: ClothingItem): Observable<ClothingItem> {
    return this.http.post<ClothingItem>(`${this.baseUrl}/${playerId}/add`, item)
      .pipe(
        tap(() => {
          // notify subscribers that this player's closet changed
          try { this.closetUpdated$.next(playerId); } catch { /* ignore */ }
        })
      );
  }

  equipItem(playerId: string, item: ClothingItem): Observable<Mannequin> {
    return this.http.post<Mannequin>(`${this.baseUrl}/${playerId}/equip`, item)
      .pipe(
        tap(() => {
          // notify subscribers that this player's closet (equipped state) changed
          try { this.closetUpdated$.next(playerId); } catch { /* ignore */ }
        })
      );
  }

  // Public observable for components to subscribe to closet updates
  onClosetUpdated(): Observable<string> {
    return this.closetUpdated$.asObservable();
  }

  // Imperative notify (optional use)
  notifyClosetUpdated(playerId: string) {
    try { this.closetUpdated$.next(playerId); } catch { /* ignore */ }
  }

  getImageSrc(item: ClothingItem | undefined) {
    if (!item?.imageUrl) { return ''; }
    return item.imageUrl.startsWith('http')
      ? item.imageUrl
      : `${environment.apiBase}${item.imageUrl}`;
  }
}
