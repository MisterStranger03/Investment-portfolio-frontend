import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe, PercentPipe } from '@angular/common';
import { forkJoin, of, Observable } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { RouterLink } from '@angular/router';

import { PortfolioService } from '../services/portfolio.service';
import { ProfileService, Profile } from '../services/profile';
import { Stock, EnhancedStock } from '../stock.model';

// --- Define more specific types for our API responses for full type safety ---
interface ProfileApiResponse { success: boolean; data: Profile | null; }
interface StocksApiResponse { success: boolean; data: Stock[]; }
interface PriceApiResponse { success: boolean; data: { price: number }; }
// This type represents the intermediate data after combining a stock with its price
type EnhancedData = { stock: Stock; price: number | null; };
// -----------------------------------------------------------------------------

@Component({
  selector: 'app-portfolio-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DecimalPipe, PercentPipe, RouterLink],
  templateUrl: './portfolio-dashboard.html',
  styleUrls: ['./portfolio-dashboard.scss']
})
export class PortfolioDashboardComponent implements OnInit {
  // Use modern inject() for cleaner code
  private portfolioService = inject(PortfolioService);
  private profileService = inject(ProfileService);

  portfolio: EnhancedStock[] = [];
  isLoading = true;
  userCurrency = 'INR';

  // Summary properties
  totalInvested = 0;
  totalCurrentValue = 0;
  totalGainLoss = 0;
  overallGainPercent = 0;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;

    // We explicitly type the response for each step in the RxJS chain
    (this.profileService.getProfile() as Observable<ProfileApiResponse>).pipe(
      switchMap((profileRes: ProfileApiResponse) => {
        if (profileRes.success && profileRes.data?.defaultCurrency) {
          this.userCurrency = profileRes.data.defaultCurrency;
        }
        return this.portfolioService.getStocks() as Observable<StocksApiResponse>;
      }),
      switchMap((stocksRes: StocksApiResponse): Observable<EnhancedData[]> => {
        if (!stocksRes.success || !Array.isArray(stocksRes.data) || stocksRes.data.length === 0) {
          return of([]);
        }
        
        const stocks: Stock[] = stocksRes.data;
        const priceRequests: Observable<EnhancedData>[] = stocks.map(stock =>
          (this.portfolioService.getCurrentPrice(stock.ticker) as Observable<PriceApiResponse>).pipe(
            map((priceRes: PriceApiResponse) => ({
              stock: stock,
              price: priceRes.success ? priceRes.data.price : null
            })),
            catchError(() => of({ stock: stock, price: null }))
          )
        );
        return forkJoin(priceRequests);
      })
    ).subscribe({
      next: (enhancedDataArray: EnhancedData[]) => {
        this.portfolio = enhancedDataArray.map((data: EnhancedData) => {
          const { stock, price } = data;
          const investedAmount = stock.quantity * stock.buyPrice;
          const currentValue = price !== null ? stock.quantity * price : null;
          const gainLoss = currentValue !== null ? currentValue - investedAmount : null;
          const gainLossPercent = gainLoss !== null && investedAmount !== 0 ? gainLoss / investedAmount : null;
          
          return {
            ...stock,
            currentPrice: price,
            investedAmount,
            currentValue,
            gainLoss,
            gainLossPercent,
            isLoadingPrice: false // Add this property to satisfy EnhancedStock interface
          };
        });
        this.calculateTotals();
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Failed to load portfolio data:", err);
        this.isLoading = false;
        this.portfolio = [];
        this.calculateTotals();
      }
    });
  }

  calculateTotals(): void {
    if (this.portfolio.length === 0) {
      this.totalInvested = 0;
      this.totalCurrentValue = 0;
      this.totalGainLoss = 0;
      this.overallGainPercent = 0;
      return;
    }
    this.totalInvested = this.portfolio.reduce((acc, stock) => acc + stock.investedAmount, 0);
    this.totalCurrentValue = this.portfolio.reduce((acc, stock) => acc + (stock.currentValue || stock.investedAmount), 0);
    this.totalGainLoss = this.totalCurrentValue - this.totalInvested;
    this.overallGainPercent = this.totalInvested !== 0 ? this.totalGainLoss / this.totalInvested : 0;
  }

  deleteStock(id: string): void {
    if (confirm('Are you sure you want to delete this asset?')) {
      this.portfolioService.deleteStock(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.portfolio = this.portfolio.filter(stock => stock._id !== id);
            this.calculateTotals();
          } else {
            alert('Failed to delete stock. Please try again.');
          }
        },
        error: (err) => {
          console.error('Delete error:', err);
          alert('An error occurred while deleting the stock.');
        }
      });
    }
  }
}