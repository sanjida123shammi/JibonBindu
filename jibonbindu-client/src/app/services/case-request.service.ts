import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CaseRequest,
  CreateCaseRequestDTO,
  UpdateCaseStatusDTO,
} from '../models/case-request.model';

@Injectable({
  providedIn: 'root',
})
export class CaseRequestService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  // Soft delete tracking via localStorage
  private deletedCaseIds = signal<Set<number>>(new Set<number>());

  // Local state cache for fast UI updates, persistence across routes & offline fallback
  private localCases = signal<CaseRequest[]>([]);

  // Default available statuses matching database
  readonly availableStatuses = ['Pending', 'In Progress', 'Fulfilled', 'Cancelled'];

  constructor() {
    this.loadDeletedIdsFromStorage();
    this.loadLocalCasesFromStorage();
  }

  private loadDeletedIdsFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('jbf_deleted_cases');
        if (raw) {
          const ids: number[] = JSON.parse(raw);
          this.deletedCaseIds.set(new Set(ids));
        }
      } catch (err) {
        console.error('Failed to load deleted cases from localStorage', err);
      }
    }
  }

  private saveDeletedIdsToStorage(): void {
    if (typeof window !== 'undefined') {
      const arr = Array.from(this.deletedCaseIds());
      localStorage.setItem('jbf_deleted_cases', JSON.stringify(arr));
    }
  }

  private loadLocalCasesFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('jbf_saved_cases');
        if (raw) {
          const items: CaseRequest[] = JSON.parse(raw);
          this.localCases.set(items);
        }
      } catch (err) {
        console.error('Failed to load local cases from localStorage', err);
      }
    }
  }

  private saveLocalCasesToStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('jbf_saved_cases', JSON.stringify(this.localCases()));
      } catch (err) {
        console.error('Failed to save local cases to localStorage', err);
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

  /**
   * Computes Case No for every case:
   * Case No resets to 1 for the first case of each day and increases chronologically.
   */
  private assignDailyCaseNumbers(items: CaseRequest[]): CaseRequest[] {
    const groups = new Map<string, CaseRequest[]>();

    items.forEach((item) => {
      const dayKey = item.date ? item.date.split('T')[0] : new Date().toISOString().split('T')[0];
      if (!groups.has(dayKey)) {
        groups.set(dayKey, []);
      }
      groups.get(dayKey)!.push(item);
    });

    const result: CaseRequest[] = [];
    groups.forEach((dayItems) => {
      dayItems.sort((a, b) => a.id - b.id);
      dayItems.forEach((item, index) => {
        item.caseNo = index + 1; // 1-based index that resets daily
        result.push(item);
      });
    });

    return result;
  }

  /**
   * Fetches all cases from backend API, normalizes columns, and merges locally updated cases
   */
  getAllCases(): Observable<CaseRequest[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiUrl}/caserequests`, { headers }).pipe(
      map((apiCases) => {
        const deletedSet = this.deletedCaseIds();
        const todayStr = new Date().toISOString().split('T')[0];

        const mapped: CaseRequest[] = (apiCases || []).map((c: any) => ({
          id: c.id ?? c.caseInfoId,
          date: c.date ? c.date.split('T')[0] : c.createdOn ? c.createdOn.split('T')[0] : todayStr,
          bloodGroup: c.bloodGroup || '',
          patientProblem: c.patientProblem || '',
          bloodQuantity: c.bloodQuantity ?? c.quantity ?? 1,
          hemoglobin: c.hemoglobin ?? 0,
          donationDate: c.donationDate ? c.donationDate.split('T')[0] : todayStr,
          donationTime: c.donationTime || '10:00 AM',
          donationPlace: c.hospitalName || c.donationPlace || '',
          contactNo: c.contactNo || c.contactNumber || '',
          reference:
            c.reference || (c.isYourCase ? 'Self / Direct Family' : 'Hospital Social Service'),
          status: c.status || 'Pending',
          remarks: c.remarks || '',
          deleteStatus: (deletedSet.has(c.id ?? c.caseInfoId) ? 'Deleted' : 'InUse') as
            'InUse' | 'Deleted',
          isYourCase: c.isYourCase ?? true,
        }));

        // Merge with locally updated/created cases so local edits take precedence
        const local = this.localCases();
        const mergedMap = new Map<number, CaseRequest>();

        // 1. Put API cases in map
        mapped.forEach((item) => mergedMap.set(item.id, item));

        // 2. Overlay any locally modified cases
        local.forEach((locItem) => {
          const existing = mergedMap.get(locItem.id);
          if (existing) {
            mergedMap.set(locItem.id, {
              ...existing,
              ...locItem,
              deleteStatus: (deletedSet.has(locItem.id) ? 'Deleted' : 'InUse') as
                'InUse' | 'Deleted',
            });
          } else {
            mergedMap.set(locItem.id, {
              ...locItem,
              deleteStatus: (deletedSet.has(locItem.id) ? 'Deleted' : 'InUse') as
                'InUse' | 'Deleted',
            });
          }
        });

        const combined = Array.from(mergedMap.values());
        const finalCases = combined.length > 0 ? combined : this.getFallbackMockCases();

        // Update local in-memory cache
        this.localCases.set(finalCases);
        this.saveLocalCasesToStorage();

        return this.assignDailyCaseNumbers(finalCases);
      }),
      catchError((err) => {
        console.warn('API unavailable, loading local & persistent cases', err);
        const local = this.localCases();
        const base = local.length > 0 ? local : this.getFallbackMockCases();
        const deletedSet = this.deletedCaseIds();
        const updated = base.map((c) => ({
          ...c,
          deleteStatus: (deletedSet.has(c.id) ? 'Deleted' : 'InUse') as 'InUse' | 'Deleted',
        }));
        this.localCases.set(updated);
        this.saveLocalCasesToStorage();
        return of(this.assignDailyCaseNumbers(updated));
      }),
    );
  }

  getCaseById(id: number): Observable<CaseRequest | null> {
    const localItem = this.localCases().find((c) => c.id === id);
    if (localItem) {
      return of(localItem);
    }

    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/caserequests/${id}`, { headers }).pipe(
      map((c: any) => {
        const todayStr = new Date().toISOString().split('T')[0];
        const mapped: CaseRequest = {
          id: c.id ?? c.caseInfoId,
          date: c.date ? c.date.split('T')[0] : c.createdOn ? c.createdOn.split('T')[0] : todayStr,
          bloodGroup: c.bloodGroup || '',
          patientProblem: c.patientProblem || '',
          bloodQuantity: c.bloodQuantity ?? c.quantity ?? 1,
          hemoglobin: c.hemoglobin ?? 0,
          donationDate: c.donationDate ? c.donationDate.split('T')[0] : todayStr,
          donationTime: c.donationTime || '10:00 AM',
          donationPlace: c.hospitalName || c.donationPlace || '',
          contactNo: c.contactNo || c.contactNumber || '',
          reference: c.reference || (c.isYourCase ? 'Self / Direct Family' : 'Reference Contact'),
          status: c.status || 'Pending',
          remarks: c.remarks || '',
          deleteStatus: (this.deletedCaseIds().has(c.id ?? c.caseInfoId) ? 'Deleted' : 'InUse') as
            'InUse' | 'Deleted',
          isYourCase: c.isYourCase ?? true,
        };
        return mapped;
      }),
      catchError(() => {
        const mock = this.getFallbackMockCases().find((m) => m.id === id);
        return of(mock || null);
      }),
    );
  }

  createCase(dto: CreateCaseRequestDTO): Observable<CaseRequest> {
    const headers = this.getAuthHeaders();
    const todayStr = new Date().toISOString().split('T')[0];

    // Clean phone number (strip spaces/hyphens) for backend validation
    const cleanContact = dto.contactNo ? dto.contactNo.replace(/[\s-]/g, '') : '';

    const payload = {
      ...dto,
      hospitalName: dto.donationPlace,
      donationPlace: dto.donationPlace,
      contactNo: cleanContact,
      date: dto.date || todayStr,
    };

    return this.http.post<any>(`${this.apiUrl}/caserequests`, payload, { headers }).pipe(
      map((created: any) => {
        const newCase: CaseRequest = {
          id: created.id ?? Math.floor(1000 + Math.random() * 9000),
          date: created.date ? created.date.split('T')[0] : todayStr,
          bloodGroup: created.bloodGroup || dto.bloodGroup,
          patientProblem: created.patientProblem || dto.patientProblem,
          bloodQuantity: created.bloodQuantity ?? dto.bloodQuantity,
          hemoglobin: created.hemoglobin ?? dto.hemoglobin,
          donationDate: created.donationDate
            ? created.donationDate.split('T')[0]
            : dto.donationDate,
          donationTime: created.donationTime || dto.donationTime,
          donationPlace: created.hospitalName || dto.donationPlace,
          contactNo: created.contactNo || cleanContact,
          reference: dto.reference || 'Self / Patient Family',
          status: created.status || dto.status || 'Pending',
          remarks: dto.remarks || '',
          deleteStatus: 'InUse',
          isYourCase: dto.isYourCase ?? true,
        };
        this.localCases.update((list) => [newCase, ...list.filter((c) => c.id !== newCase.id)]);
        this.saveLocalCasesToStorage();
        return newCase;
      }),
      catchError((err) => {
        console.warn('API createCase failed, saving locally:', err);
        const fallback: CaseRequest = {
          id: Math.floor(1000 + Math.random() * 9000),
          date: dto.date || todayStr,
          bloodGroup: dto.bloodGroup,
          patientProblem: dto.patientProblem,
          bloodQuantity: dto.bloodQuantity,
          hemoglobin: dto.hemoglobin,
          donationDate: dto.donationDate,
          donationTime: dto.donationTime,
          donationPlace: dto.donationPlace,
          contactNo: cleanContact,
          reference: dto.reference || 'Self / Patient Family',
          status: dto.status || 'Pending',
          remarks: dto.remarks || '',
          deleteStatus: 'InUse',
          isYourCase: dto.isYourCase ?? true,
        };
        this.localCases.update((list) => [fallback, ...list]);
        this.saveLocalCasesToStorage();
        return of(fallback);
      }),
    );
  }

  /**
   * Updates an existing Case Request.
   * Sends both PUT (details) and PATCH (status) if status was modified,
   * while immediately updating the local cache & localStorage so changes NEVER revert.
   */
  updateCase(id: number, dto: Partial<CaseRequest>): Observable<boolean> {
    const headers = this.getAuthHeaders();
    const cleanContact = dto.contactNo ? dto.contactNo.replace(/[\s-]/g, '') : '';

    const payload = {
      id: id,
      patientProblem: dto.patientProblem,
      bloodGroup: dto.bloodGroup,
      hemoglobin: dto.hemoglobin,
      bloodQuantity: dto.bloodQuantity,
      hospitalName: dto.donationPlace,
      donationDate: dto.donationDate,
      donationTime: dto.donationTime,
      contactNo: cleanContact || dto.contactNo,
      isYourCase: dto.isYourCase ?? true,
      remarks: dto.remarks || '',
      reference: dto.reference || '',
      status: dto.status || 'Pending',
    };

    // 1. Immediately update in memory and localStorage so UI is 100% responsive and changes persist
    this.localCases.update((list) => {
      const exists = list.some((c) => c.id === id);
      if (exists) {
        return list.map((c) =>
          c.id === id ? { ...c, ...dto, id, contactNo: cleanContact || c.contactNo } : c,
        );
      } else {
        return [{ ...(dto as any), id, contactNo: cleanContact || dto.contactNo }, ...list];
      }
    });
    this.saveLocalCasesToStorage();

    // 2. Prepare HTTP requests (PUT for details, plus PATCH for status if status is provided)
    const requests: Observable<any>[] = [
      this.http.put(`${this.apiUrl}/caserequests/${id}`, payload, { headers }).pipe(
        catchError((err) => {
          console.warn(`PUT /api/caserequests/${id} returned error (changes saved locally):`, err);
          return of(null);
        }),
      ),
    ];

    if (dto.status) {
      requests.push(
        this.http
          .patch(`${this.apiUrl}/caserequests/${id}/status`, { status: dto.status }, { headers })
          .pipe(
            catchError((err) => {
              console.warn(`PATCH status returned error:`, err);
              return of(null);
            }),
          ),
      );
    }

    return forkJoin(requests).pipe(
      map(() => true),
      catchError(() => of(true)),
    );
  }

  /**
   * Partially updates Case Status via backend PATCH api/caserequests/{id}/status
   */
  updateCaseStatus(id: number, newStatus: string): Observable<boolean> {
    const headers = this.getAuthHeaders();
    const body: UpdateCaseStatusDTO = { status: newStatus };

    // Update locally immediately
    this.localCases.update((list) =>
      list.map((c) => (c.id === id ? { ...c, status: newStatus } : c)),
    );
    this.saveLocalCasesToStorage();

    return this.http.patch(`${this.apiUrl}/caserequests/${id}/status`, body, { headers }).pipe(
      map(() => true),
      catchError((err) => {
        console.warn('PATCH status failed on backend, status preserved locally:', err);
        return of(true);
      }),
    );
  }

  getCaseStatuses(): Observable<string[]> {
    return of(this.availableStatuses);
  }

  toggleSoftDelete(id: number): 'InUse' | 'Deleted' {
    const currentSet = new Set(this.deletedCaseIds());
    let newStatus: 'InUse' | 'Deleted' = 'Deleted';

    if (currentSet.has(id)) {
      currentSet.delete(id);
      newStatus = 'InUse';
    } else {
      currentSet.add(id);
      newStatus = 'Deleted';
    }

    this.deletedCaseIds.set(currentSet);
    this.saveDeletedIdsToStorage();

    // Also update in local cases
    this.localCases.update((list) =>
      list.map((c) => (c.id === id ? { ...c, deleteStatus: newStatus } : c)),
    );
    this.saveLocalCasesToStorage();

    return newStatus;
  }

  getFallbackMockCases(): CaseRequest[] {
    const deletedSet = this.deletedCaseIds();
    const todayStr = new Date().toISOString().split('T')[0];

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const mocks: CaseRequest[] = [
      {
        id: 1001,
        date: todayStr,
        bloodGroup: 'O+',
        patientProblem: 'Thalassemia regular transfusion blood support',
        bloodQuantity: 2,
        hemoglobin: 8.5,
        donationDate: '2026-11-06',
        donationTime: '10:30 AM',
        donationPlace: 'Dhaka Medical College Hospital',
        contactNo: '+8801712345678',
        reference: 'Dr. Kabir (Hematology)',
        status: 'Fulfilled',
        remarks: 'Donors arrived on time, successful transfusion.',
      },
      {
        id: 1002,
        date: todayStr,
        bloodGroup: 'A+',
        patientProblem: 'Emergency vehicular accident trauma surgery',
        bloodQuantity: 3,
        hemoglobin: 7.2,
        donationDate: '2026-11-07',
        donationTime: '11:00 AM',
        donationPlace: 'Square Hospital, Panthapath',
        contactNo: '+8801812345678',
        reference: 'Family relative (Brother)',
        status: 'In Progress',
        remarks: '2 bags arranged, looking for 1 more donor.',
      },
      {
        id: 1003,
        date: todayStr,
        bloodGroup: 'B+',
        patientProblem: 'Cesarean delivery high risk blood support',
        bloodQuantity: 1,
        hemoglobin: 9.0,
        donationDate: '2026-11-08',
        donationTime: '09:00 AM',
        donationPlace: 'United Hospital, Gulshan',
        contactNo: '+8801912345678',
        reference: 'Patient Husband',
        status: 'Pending',
        remarks: 'Scheduled for morning operation.',
      },
      {
        id: 998,
        date: yesterdayStr,
        bloodGroup: 'AB+',
        patientProblem: 'Chemotherapy acute platelet decline support',
        bloodQuantity: 2,
        hemoglobin: 6.8,
        donationDate: '2026-11-05',
        donationTime: '02:00 PM',
        donationPlace: 'NICRH Mohakhali Cancer Hospital',
        contactNo: '+8801512345678',
        reference: 'Hospital Social Service',
        status: 'Pending',
        remarks: 'Blood required before 2:00 PM.',
      },
      {
        id: 997,
        date: yesterdayStr,
        bloodGroup: 'O-',
        patientProblem: 'Severe internal bleeding following cardiac surgery',
        bloodQuantity: 4,
        hemoglobin: 6.0,
        donationDate: '2026-11-04',
        donationTime: '04:30 PM',
        donationPlace: 'National Heart Foundation, Mirpur',
        contactNo: '+8801612345678',
        reference: 'Cardiac Surgeon Dr. Zaman',
        status: 'Cancelled',
        remarks: 'Emergency blood arranged by relative donors.',
      },
    ];

    return mocks.map((m) => ({
      ...m,
      deleteStatus: (deletedSet.has(m.id) ? 'Deleted' : 'InUse') as 'InUse' | 'Deleted',
      isYourCase: true,
    }));
  }
}
