import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SslCommerzInitRequest, SslCommerzInitResponse } from '../models/sslcommerz.model';

@Injectable({
  providedIn: 'root',
})
export class SslCommerzService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /**
   * Calls ASP.NET Core API to initialize an SSLCOMMERZ payment session
   * POST: http://localhost:5127/api/sslcommerz/initiate
   */
  initiatePayment(payload: SslCommerzInitRequest): Observable<SslCommerzInitResponse> {
    return this.http.post<SslCommerzInitResponse>(`${this.baseUrl}/sslcommerz/initiate`, payload);
  }
}
