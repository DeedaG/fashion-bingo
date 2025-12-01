import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClothingItem } from '../models/clothing-item.model';
import { Mannequin } from '../models/mannequin.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClosetService {
  private baseUrl = environment.apiUrl +  '/closet';

  constructor(private http: HttpClient) { }

  getCloset(playerId: string): Observable<ClothingItem[]> {
    return this.http.get<ClothingItem[]>(`${this.baseUrl}/${playerId}`);
  }

  addItem(playerId: string, item: ClothingItem): Observable<ClothingItem> {
    return this.http.post<ClothingItem>(`${this.baseUrl}/${playerId}/add`, item);
  }

  equipItem(playerId: string, item: ClothingItem): Observable<Mannequin> {
    return this.http.post<Mannequin>(`${this.baseUrl}/${playerId}/equip`, item);
  }
}
