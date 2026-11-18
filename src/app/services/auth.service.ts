import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserCredentials {
  email: string;
  password: string;
}

export interface NewUserPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: string;
}

export interface ApiResponse<T = any> {
  flag: boolean;
  message: string;
  token?: string;
  data?: T;
}

export interface SessionInfo {
  id: string;
  name: string;
  email: string;
  /** Primary / highest-privilege role (for display). */
  role: string;
  /** All roles assigned to the user (extracted from JWT claims). */
  roles: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly baseUrl = environment.apiUrl;

  readonly activeUser = signal<SessionInfo | null>(null);
  readonly loggedIn = signal<boolean>(false);

  constructor() {
    this.initSession();
  }

  private initSession(): void {
    if (typeof window === 'undefined') return;
    const token = this.retrieveToken();
    if (token && !this.isExpired(token)) {
      this.activeUser.set(this.readClaims(token));
      this.loggedIn.set(true);
    } else {
      this.wipeSession();
    }
  }

  login(credentials: UserCredentials): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/auth/login`, credentials).pipe(
      tap((res) => {
        if (res?.flag && res.token) {
          this.storeToken(res.token);
        }
      }),
      catchError((err) =>
        of({
          flag: false,
          message: err?.error?.message || 'Authentication failed. Please verify your credentials.',
        }),
      ),
    );
  }

  register(payload: NewUserPayload): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/auth/register`, payload).pipe(
      catchError((err) =>
        of({
          flag: false,
          message: err?.error?.message || 'Could not complete registration.',
        }),
      ),
    );
  }

  getRegistrationRoles(): Observable<string[]> {
    return this.http
      .get<string[]>(`${this.baseUrl}/auth/registration-roles`)
      .pipe(catchError(() => of(['Seeker', 'BloodDonor', 'FundDonor', 'Member'])));
  }

  storeToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', token);
    localStorage.setItem('jbf_token', token);
    this.activeUser.set(this.readClaims(token));
    this.loggedIn.set(true);
  }

  retrieveToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token') || localStorage.getItem('jbf_token');
  }

  isExpired(tokenStr?: string | null): boolean {
    const jwt = tokenStr ?? this.retrieveToken();
    if (!jwt) return true;
    try {
      const payload = JSON.parse(atob(jwt.split('.')[1]));
      return payload.exp ? Date.now() >= payload.exp * 1000 : false;
    } catch {
      return true;
    }
  }

  readClaims(token: string): SessionInfo | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      // Collect ALL role claims — JWT may issue them as an array or a single string
      const roleClaimKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
      const rawRoles: string[] = [];
      const rawFromClaim = payload[roleClaimKey] ?? payload['role'];

      if (Array.isArray(rawFromClaim)) {
        rawRoles.push(...rawFromClaim);
      } else if (rawFromClaim) {
        rawRoles.push(String(rawFromClaim));
      }

      // Priority: Admin > Member > first available > 'User'
      const primaryRole = rawRoles.includes('Admin')
        ? 'Admin'
        : rawRoles.includes('Member')
          ? 'Member'
          : (rawRoles[0] ?? 'User');

      return {
        id:
          payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
          payload['nameid'] ||
          '',
        name:
          payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
          payload['unique_name'] ||
          '',
        email:
          payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
          payload['email'] ||
          '',
        role: primaryRole,
        roles: rawRoles.length > 0 ? rawRoles : ['User'],
      };
    } catch {
      return null;
    }
  }

  logout(): void {
    this.wipeSession();
    this.router.navigate(['/login']);
  }

  private wipeSession(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
    localStorage.removeItem('jbf_token');
    localStorage.removeItem('user');
    this.activeUser.set(null);
    this.loggedIn.set(false);
  }
}
