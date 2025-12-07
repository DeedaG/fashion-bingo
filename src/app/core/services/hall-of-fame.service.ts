import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HallOfFameEntry } from '../models/hall-of-fame-entry.model';

@Injectable({ providedIn: 'root' })
export class HallOfFameService {
  private baseUrl = `${environment.apiUrl}/halloffame`;

  constructor(private http: HttpClient) {}

  getEntries(): Observable<HallOfFameEntry[]> {
    return this.http.get<HallOfFameEntry[]>(this.baseUrl);
  }

  recordEntry(playerId: string, playerName: string | undefined, outfitItems: string[]): Observable<HallOfFameEntry> {
    return this.http.post<HallOfFameEntry>(
      `${this.baseUrl}/${encodeURIComponent(playerId)}`,
      { playerName, outfitItems }
    );
  }
}
