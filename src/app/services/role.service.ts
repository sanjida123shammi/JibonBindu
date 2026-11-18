import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AssignMemberRolesDTO,
  CreateRoleDTO,
  MemberAssignedRoles,
  MemberLookup,
  RoleItem,
  UserDetail,
} from '../models/role.model';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private getAuthHeaders(): HttpHeaders {
    let token = '';
    if (typeof window !== 'undefined') {
      token =
        localStorage.getItem('token') ||
        localStorage.getItem('jwt') ||
        localStorage.getItem('jbf_token') ||
        '';
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
  }

  // --- Roles API ---
  getRoles(): Observable<RoleItem[]> {
    return this.http.get<RoleItem[]>(`${this.apiUrl}/roles`, {
      headers: this.getAuthHeaders(),
    });
  }

  createRole(dto: CreateRoleDTO): Observable<RoleItem> {
    return this.http.post<RoleItem>(`${this.apiUrl}/roles`, dto, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteRole(roleId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/roles/${roleId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // --- Member Roles API ---
  getMembers(): Observable<MemberLookup[]> {
    return this.http.get<MemberLookup[]>(`${this.apiUrl}/roles/members`, {
      headers: this.getAuthHeaders(),
    });
  }

  getMemberRoles(): Observable<MemberAssignedRoles[]> {
    return this.http.get<MemberAssignedRoles[]>(`${this.apiUrl}/roles/member-roles`, {
      headers: this.getAuthHeaders(),
    });
  }

  assignMemberRoles(dto: AssignMemberRolesDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/roles/assign-member-roles`, dto, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteMemberRoles(memberId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/roles/member-roles/${memberId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // --- Users API ---
  getAllUsers(): Observable<UserDetail[]> {
    return this.http.get<UserDetail[]>(`${this.apiUrl}/users`, {
      headers: this.getAuthHeaders(),
    });
  }
}
