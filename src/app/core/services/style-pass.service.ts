import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { StylePassState } from '../models/style-pass.model';

@Injectable({ providedIn: 'root' })
export class StylePassService {
  private baseUrl = `${environment.apiUrl}/stylepass`;

  constructor(private http: HttpClient) {}

  getState(playerId: string): Observable<StylePassState> {
    return this.http.get<StylePassState>(`${this.baseUrl}/${encodeURIComponent(playerId)}`);
  }

  grantPoints(playerId: string, points: number): Observable<StylePassState> {
    return this.http.post<StylePassState>(
      `${this.baseUrl}/${encodeURIComponent(playerId)}/grant`,
      { points }
    );
  }

  claimTier(playerId: string, tierId: string, track: 'free' | 'premium'): Observable<StylePassState> {
    return this.http.post<StylePassState>(
      `${this.baseUrl}/${encodeURIComponent(playerId)}/claim`,
      { tierId, track }
    );
  }

  upgrade(playerId: string): Observable<StylePassState> {
    return this.http.post<StylePassState>(
      `${this.baseUrl}/${encodeURIComponent(playerId)}/upgrade`,
      { useGems: true }
    );
  }
}
