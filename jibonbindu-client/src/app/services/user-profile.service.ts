import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ChangePasswordDTO, UpdateProfileDTO, UserProfile } from '../models/user-profile.model';

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  readonly defaultAvatar = 'assets/images/default-avatar.png';

  readonly profile = signal<UserProfile>({
    id: '',
    fullName: '',
    email: '',
    role: 'User',
    phoneNumber: '',
    location: 'Dhaka, Bangladesh',
    avatarUrl: '',
  });

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
    if (!path) return this.defaultAvatar;
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

  getProfile(): Observable<UserProfile> {
    return this.http
      .get<UserProfile>(`${this.baseUrl}/users/profile`, { headers: this.getAuthHeaders() })
      .pipe(
        tap((res) => {
          this.profile.set(res);
        }),
        catchError((err) => {
          console.error('[UserProfileService] Failed to load profile:', err);
          return throwError(() => err);
        }),
      );
  }

  updateProfile(dto: UpdateProfileDTO): Observable<{ message: string }> {
    return this.http
      .put<{ message: string }>(`${this.baseUrl}/users/profile`, dto, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        tap(() => {
          this.profile.update((p) => ({
            ...p,
            fullName: dto.fullName,
            phoneNumber: dto.phoneNumber,
            location: dto.location || 'Dhaka, Bangladesh',
            avatarUrl: dto.avatarUrl || p.avatarUrl,
          }));
        }),
      );
  }

  changePassword(dto: ChangePasswordDTO): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/users/change-password`, dto, {
      headers: this.getAuthHeaders(),
    });
  }

  uploadAvatar(file: File): Observable<{ avatarUrl: string }> {
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

    return this.http.post<{ avatarUrl: string }>(`${this.baseUrl}/users/upload-avatar`, formData, {
      headers,
    });
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('jbf_token');
    }
  }
}
