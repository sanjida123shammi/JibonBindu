import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  FundCosting,
  FundCostingDTO,
  FundDeposit,
  FundDepositDTO,
  FundDonorOption,
  FundLookupsResponse,
  PersonOption,
} from '../models/fund.model';

@Injectable({
  providedIn: 'root',
})
export class FundService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  constructor() {
    // Clear out any old cached mock deposits or costings from previous sessions
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('jbf_fund_deposits');
        localStorage.removeItem('jbf_fund_costings');
      } catch {
        // Ignore storage errors
      }
    }
  }

  private getAuthHeaders(): HttpHeaders {
    let token = '';
    if (typeof window !== 'undefined') {
      token =
        localStorage.getItem('jbf_token') ||
        localStorage.getItem('token') ||
        localStorage.getItem('jwt') ||
        '';
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
  }

  // =========================================================================
  // LOOKUP OPTIONS (From dbo.usp_FundLookup_GetAll)
  // =========================================================================

  getLookups(): Observable<FundLookupsResponse> {
    return this.http
      .get<FundLookupsResponse>(`${this.baseUrl}/fundlookups`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((err) => {
          console.error('[FundService] Failed to load fund lookups:', err);
          return of({
            donationTypes: [],
            fundingTypes: [],
            cashTypes: [],
            donorTypes: [],
            settlementStatuses: [],
          });
        }),
      );
  }

  getFundDonors(search?: string): Observable<FundDonorOption[]> {
    let params = new HttpParams().set('take', '100');
    if (search) params = params.set('search', search);

    return this.http
      .get<FundDonorOption[]>(`${this.baseUrl}/fundlookups/fund-donors`, {
        headers: this.getAuthHeaders(),
        params,
      })
      .pipe(
        catchError((err) => {
          console.error('[FundService] Failed to load fund donors:', err);
          return of([]);
        }),
      );
  }

  getPeople(search?: string): Observable<PersonOption[]> {
    let params = new HttpParams().set('take', '50');
    if (search) params = params.set('search', search);

    return this.http
      .get<PersonOption[]>(`${this.baseUrl}/fundlookups/people`, {
        headers: this.getAuthHeaders(),
        params,
      })
      .pipe(
        catchError((err) => {
          console.error('[FundService] Failed to load people list:', err);
          return of([]);
        }),
      );
  }

  // =========================================================================
  // FUND DEPOSITS (Real data from dbo.FundDeposits)
  // =========================================================================

  getAllDeposits(filter?: any): Observable<FundDeposit[]> {
    let params = new HttpParams().set('pageSize', '200');
    if (filter) {
      if (filter.from) params = params.set('from', filter.from);
      if (filter.to) params = params.set('to', filter.to);
      if (filter.fundDonorId) params = params.set('fundDonorId', filter.fundDonorId);
      if (filter.fundDonorTypeId) params = params.set('fundDonorTypeId', filter.fundDonorTypeId);
      if (filter.fundingTypeId) params = params.set('fundingTypeId', filter.fundingTypeId);
      if (filter.cashTypeId) params = params.set('cashTypeId', filter.cashTypeId);
    }

    return this.http
      .get<FundDeposit[]>(`${this.baseUrl}/funddeposits`, {
        headers: this.getAuthHeaders(),
        params,
      })
      .pipe(
        map((apiDeposits) => apiDeposits || []),
        catchError((err) => {
          console.error('[FundService] Failed to load fund deposits:', err);
          return of([]);
        }),
      );
  }

  getDepositById(id: number): Observable<FundDeposit | undefined> {
    return this.http
      .get<FundDeposit>(`${this.baseUrl}/funddeposits/${id}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((err) => {
          console.error(`[FundService] Failed to get deposit #${id}:`, err);
          return throwError(() => err);
        }),
      );
  }

  createDeposit(dto: FundDepositDTO): Observable<FundDeposit> {
    return this.http
      .post<FundDeposit>(`${this.baseUrl}/funddeposits`, dto, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((err) => {
          console.error('[FundService] Failed to create deposit:', err);
          return throwError(() => err);
        }),
      );
  }

  updateDeposit(id: number, dto: FundDepositDTO): Observable<FundDeposit | null> {
    return this.http
      .put<FundDeposit>(`${this.baseUrl}/funddeposits/${id}`, dto, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((err) => {
          console.error(`[FundService] Failed to update deposit #${id}:`, err);
          return throwError(() => err);
        }),
      );
  }

  deleteDeposit(id: number): Observable<boolean> {
    return this.http
      .delete(`${this.baseUrl}/funddeposits/${id}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map(() => true),
        catchError((err) => {
          console.error(`[FundService] Failed to delete deposit #${id}:`, err);
          return throwError(() => err);
        }),
      );
  }

  // =========================================================================
  // FUND COSTINGS (Real data from dbo.DailyCosts)
  // =========================================================================

  getAllCostings(filter?: any): Observable<FundCosting[]> {
    let params = new HttpParams().set('pageSize', '200');
    if (filter) {
      if (filter.from) params = params.set('from', filter.from);
      if (filter.to) params = params.set('to', filter.to);
      if (filter.spentByPersonId) params = params.set('spentByPersonId', filter.spentByPersonId);
      if (filter.settlementStatusId)
        params = params.set('settlementStatusId', filter.settlementStatusId);
    }

    return this.http
      .get<FundCosting[]>(`${this.baseUrl}/fundcostings`, {
        headers: this.getAuthHeaders(),
        params,
      })
      .pipe(
        map((apiCostings) => apiCostings || []),
        catchError((err) => {
          console.error('[FundService] Failed to load fund costings:', err);
          return of([]);
        }),
      );
  }

  getCostingById(id: number): Observable<FundCosting | undefined> {
    return this.http
      .get<FundCosting>(`${this.baseUrl}/fundcostings/${id}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((err) => {
          console.error(`[FundService] Failed to get costing #${id}:`, err);
          return throwError(() => err);
        }),
      );
  }

  createCosting(dto: FundCostingDTO): Observable<FundCosting> {
    return this.http
      .post<FundCosting>(`${this.baseUrl}/fundcostings`, dto, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((err) => {
          console.error('[FundService] Failed to create costing:', err);
          return throwError(() => err);
        }),
      );
  }

  updateCosting(id: number, dto: FundCostingDTO): Observable<FundCosting | null> {
    return this.http
      .put<FundCosting>(`${this.baseUrl}/fundcostings/${id}`, dto, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((err) => {
          console.error(`[FundService] Failed to update costing #${id}:`, err);
          return throwError(() => err);
        }),
      );
  }

  deleteCosting(id: number): Observable<boolean> {
    return this.http
      .delete(`${this.baseUrl}/fundcostings/${id}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map(() => true),
        catchError((err) => {
          console.error(`[FundService] Failed to delete costing #${id}:`, err);
          return throwError(() => err);
        }),
      );
  }
}
