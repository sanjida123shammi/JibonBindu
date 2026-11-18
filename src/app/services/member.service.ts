import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Member, MemberDTO } from '../models/member.model';

export interface PersonRoleOption {
  personRoleId: number;
  personRoleName: string;
}

@Injectable({
  providedIn: 'root',
})
export class MemberService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  constructor() {
    // Clear out stale mock members from browser storage
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('jbf_members');
      } catch {
        // Ignore storage exceptions
      }
    }
  }

  private getAuthHeaders(): HttpHeaders {
    let token = '';
    if (typeof window !== 'undefined') {
      token =
        localStorage.getItem('token') ||
        localStorage.getItem('jbf_token') ||
        localStorage.getItem('jwt') ||
        '';
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
  }

  getImageUrl(path?: string | null): string {
    if (!path) return '';
    if (
      path.startsWith('http://') ||
      path.startsWith('https://') ||
      path.startsWith('data:') ||
      path.startsWith('blob:')
    ) {
      return path;
    }
    const backendBase = this.baseUrl.replace(/\/api\/?$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${backendBase}${cleanPath}`;
  }

  getAllMembers(): Observable<Member[]> {
    return this.http
      .get<Member[]>(`${this.baseUrl}/members`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((err) => {
          console.error('[MemberService] Error loading members:', err);
          return throwError(() => err);
        }),
      );
  }

  getPersonRoles(): Observable<PersonRoleOption[]> {
    return this.http
      .get<PersonRoleOption[]>(`${this.baseUrl}/members/roles`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((err) => {
          console.error('[MemberService] Error loading person roles:', err);
          return throwError(() => err);
        }),
      );
  }

  getMemberById(id: string): Observable<Member> {
    return this.http
      .get<Member>(`${this.baseUrl}/members/${id}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((err) => {
          console.error(`[MemberService] Error loading member ${id}:`, err);
          return throwError(() => err);
        }),
      );
  }

  createMember(dto: MemberDTO): Observable<Member> {
    return this.http
      .post<Member>(`${this.baseUrl}/members`, dto, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((err) => {
          console.error('[MemberService] Live create member failed:', err);
          return throwError(() => err);
        }),
      );
  }

  updateMember(id: string, dto: MemberDTO): Observable<void> {
    return this.http
      .put<void>(`${this.baseUrl}/members/${id}`, dto, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((err) => {
          console.error(`[MemberService] Live update member ${id} failed:`, err);
          return throwError(() => err);
        }),
      );
  }

  deleteMember(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/members/${id}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((err) => {
          console.error(`[MemberService] Delete member ${id} failed:`, err);
          return throwError(() => err);
        }),
      );
  }

  uploadImage(file: File): Observable<{ imageUrl: string }> {
    let token = '';
    if (typeof window !== 'undefined') {
      token =
        localStorage.getItem('token') ||
        localStorage.getItem('jbf_token') ||
        localStorage.getItem('jwt') ||
        '';
    }
    const headers = new HttpHeaders({
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });

    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ imageUrl: string }>(`${this.baseUrl}/members/upload-image`, formData, {
      headers,
    });
  }

  requestMembership(payload: {
    name: string;
    contactNumber: string;
    email?: string;
  }): import('rxjs').Observable<{ flag: boolean; message: string }> {
    return this.http.post<{ flag: boolean; message: string }>(
      `${this.baseUrl}/members/request-membership`,
      payload,
    );
  }
}
