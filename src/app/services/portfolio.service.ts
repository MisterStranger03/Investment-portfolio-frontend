import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NewStock } from '../stock.model';

interface ApiResponse { success: boolean; data: any; error?: string; }

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private apiUrl = 'https://investment-portfolio-backend.vercel.app/api';
  private http = inject(HttpClient);

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