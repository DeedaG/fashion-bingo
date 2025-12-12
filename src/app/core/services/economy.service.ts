import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Economy {
  coins: number;
  gems: number;
  energy: number;
}

@Injectable({
  providedIn: 'root'
})
export class EconomyService {
  private baseUrl = `${environment.apiUrl}/economy`;

  constructor(private http: HttpClient) {}

  topUp(playerId: string, coins: number, gems: number): Observable<Economy> {
    return this.http.post<Economy>(`${this.baseUrl}/${playerId}/topup`, { coins, gems });
  }
}
