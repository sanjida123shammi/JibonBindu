import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { DashboardStats } from '../models/dashboard-stats.model';
import { BloodDonationData, BloodDonationResponse } from '../models/blood-donation.model';
import { AppNotification } from '../models/notification.model';
import { UserProfile } from '../models/user-profile.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  // Real-time connection and auth signals
  readonly isConnectedToApi = signal<boolean>(false);
  readonly isAuthenticated = signal<boolean>(false);
  readonly lastSyncTime = signal<Date>(new Date());
  readonly authError = signal<string | null>(null);
  private baseUrl = 'http://localhost:5127/api';

  constructor() {
    this.checkInitialAuth();
  }

  checkInitialAuth(): void {
    if (typeof window !== 'undefined') {
      const token =
        localStorage.getItem('jbf_token') ||
        localStorage.getItem('token') ||
        localStorage.getItem('jwt');
      this.isAuthenticated.set(!!token);
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

  /**
   * 1. Authenticates directly with backend credentials and returns the token string
   */
  loginWithCredentials(
    email: string = 'admin@jibonbindu.org',
    password: string = 'AdminPassword123!',
  ): Observable<string | null> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap((res: any) => {
        const token = res?.token || res?.jwt || res?.accessToken;
        if (token && typeof window !== 'undefined') {
          // Keep tokens synced with jbf-login ('jbf_token')
          localStorage.setItem('jbf_token', token);
          localStorage.setItem('token', token);
          localStorage.setItem(
            'user',
            JSON.stringify({
              id: res?.user?.id || '1',
              name: res?.user?.name || res?.user?.fullName || 'Admin',
              email: email,
              role: res?.user?.role || 'Admin',
            }),
          );
          this.isAuthenticated.set(true);
          this.authError.set(null);
        }
      }),
      map((res: any) => {
        const token = res?.token || res?.jwt || res?.accessToken;
        return token ? String(token) : null;
      }),
      catchError((err: any) => {
        console.error('Login error', err);
        this.authError.set('Could not authenticate. Check backend API status.');
        return of(null);
      }),
    );
  }

  /**
   * Boolean wrapper for login
   */
  login(
    email: string = 'admin@jibonbindu.org',
    password: string = 'AdminPassword123!',
  ): Observable<boolean> {
    return this.loginWithCredentials(email, password).pipe(map((token) => !!token));
  }

  getDashboardStats(): Observable<DashboardStats> {
    const headers = this.getAuthHeaders();

    const caseRequests$ = this.http.get<any[]>(`${this.apiUrl}/caserequests`, { headers }).pipe(
      tap(() => this.isConnectedToApi.set(true)),
      catchError((err: any) => {
        if (err.status === 401) {
          this.isAuthenticated.set(false);
          this.authError.set('Authentication token required for real database data');
        }
        return of([]);
      }),
    );

    const donationTotal$ = this.http
      .get<any>(`${this.apiUrl}/reports/blood-donations/total`, { headers })
      .pipe(catchError(() => of(null)));

    const bloodDonors$ = this.http
      .get<any[]>(`${this.apiUrl}/blooddonors`, { headers })
      .pipe(catchError(() => of([])));

    return forkJoin({
      cases: caseRequests$,
      donationTotal: donationTotal$,
      donors: bloodDonors$,
    }).pipe(
      map(
        ({ cases, donationTotal, donors }: { cases: any[]; donationTotal: any; donors: any[] }) => {
          this.lastSyncTime.set(new Date());

          const totalCases = cases.length;
          const solvedCases = cases.filter(
            (c: any) =>
              c.status?.toLowerCase() === 'fulfilled' || c.status?.toLowerCase() === 'solved',
          ).length;

          const totalDonors =
            donationTotal?.distinctDonors ?? (donors.length > 0 ? donors.length : 0);

          return {
            totalCaseRequest: totalCases,
            totalSolvedCase: solvedCases,
            totalDonor: totalDonors,
            totalMembers: 1,
          };
        },
      ),
    );
  }

  getMonthlyBloodDonations(
    year: number = new Date().getFullYear(),
  ): Observable<BloodDonationResponse> {
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const headers = this.getAuthHeaders();

    return this.http
      .get<any[]>(`${this.apiUrl}/reports/blood-donations/monthly?year=${year}`, { headers })
      .pipe(
        map((apiRows: any[]) => {
          if (!apiRows || !Array.isArray(apiRows)) {
            apiRows = [];
          }

          const donations: BloodDonationData[] = monthNames.map((mName, index) => {
            const monthNumber = index + 1;
            const match = apiRows.find(
              (r: any) =>
                r.month === monthNumber ||
                r.monthName?.toLowerCase() === mName.toLowerCase() ||
                r.name?.toLowerCase() === mName.toLowerCase(),
            );
            return {
              month: mName,
              count: match ? Number(match.totalDonations ?? match.count ?? match.total ?? 0) : 0,
            };
          });

          // Provides both data and donations properties so both are valid
          return { year, data: donations, donations };
        }),
        catchError((err: any) => {
          console.warn(
            'Could not fetch monthly blood donations from API, using fallback data',
            err,
          );
          const fallback = this.getFallbackMonthlyDonations();
          return of({ year, data: fallback, donations: fallback });
        }),
      );
  }

  /**
   * Alias for backward compatibility
   */
  getBloodDonationReport(
    year: number = new Date().getFullYear(),
  ): Observable<BloodDonationResponse> {
    return this.getMonthlyBloodDonations(year);
  }

  /**
   * 3. Fallback monthly blood donation data (scale 0-50) when API is unreachable
   */
  getFallbackMonthlyDonations(): BloodDonationData[] {
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const defaultCounts = [15, 22, 19, 28, 35, 42, 38, 25, 45, 30, 20, 36];
    return monthNames.map((month, index) => ({
      month,
      count: defaultCounts[index] ?? 0,
    }));
  }

  /**
   * Fetches real notifications from database
   */
  getNotifications(): Observable<AppNotification[]> {
    const headers = this.getAuthHeaders();
    return this.http
      .get<any[]>(`${this.apiUrl}/notifications?unreadOnly=false&take=10`, { headers })
      .pipe(
        map((rows: any[]) => {
          if (!rows || !Array.isArray(rows)) return [];
          return rows.map((r: any) => ({
            id: r.id,
            title: r.title,
            message: r.message,
            type: r.type,
            caseInfoId: r.caseInfoId,
            isRead: r.isRead,
            createdAt: r.createdAtUtc
              ? new Date(r.createdAtUtc).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Recently',
          }));
        }),
        catchError(() => of([])),
      );
  }

  /**
   * Retrieves current authenticated user profile: calls /api/auth/me
   */
  getCurrentUser(): Observable<UserProfile> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/auth/me`, { headers }).pipe(
      map((user: any) => ({
        id: user.id || '1',
        fullName: user.name || 'Admin',
        email: user.email || 'admin@jibonbindu.org',
        role: user.role || 'Admin',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      })),
      catchError(() => {
        return of({
          id: '1',
          fullName: 'Admin User',
          email: 'admin@jibonbindu.org',
          role: 'Admin',
          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        });
      }),
    );
  }

  /**
   * Logout and clear jbf-login tokens
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jbf_token');
      localStorage.removeItem('token');
      localStorage.removeItem('jwt');
      localStorage.removeItem('user');
      this.isAuthenticated.set(false);
      window.location.href = `${environment.reactPortalUrl}/login`;
    }
  }

  approveMemberRequest(dto: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    contactNumber: string;
    district: string;
    city: string;
    area: string;
    email?: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/members/approve-request`, dto);
  }

  markNotificationRead(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(`${this.apiUrl}/notifications/${id}/read`, {}, { headers });
  }
}
