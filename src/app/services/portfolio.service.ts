import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NewStock } from '../stock.model';
import { environment } from '../../environments/environment.prod';

interface ApiResponse { success: boolean; data: any; error?: string; }

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private apiUrl = `${environment.backendUrl}/api`;
  private http = inject(HttpClient);
  // private apiUrl = `${environment.backendUrl}/api`;

  getStocks(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/stocks`);
  }

  addStock(payload: NewStock): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/stocks`, payload);
  }

  deleteStock(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/stocks/${id}`);
  }

  getCurrentPrice(ticker: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/price/${ticker}`);
  }
}