import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Player } from '../models/player.model';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private baseUrl = `${environment.apiUrl}/player`;

  constructor(private http: HttpClient) {}

  createPlayer(playerId: string): Observable<Player> {
    return this.http.post<Player>(`${this.baseUrl}/createPlayer`, { playerId });
  }

  getPlayer(playerId: string): Observable<Player> {
    return this.http.get<Player>(`${this.baseUrl}/${playerId}`);
  }
}
