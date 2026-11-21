import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { BloodDonor, CreateBloodDonorDTO, DonationType } from '../models/blood-donor.model';

@Injectable({
  providedIn: 'root',
})
export class BloodDonorService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  readonly donationIntervals: Record<DonationType, number> = {
    WholeBlood: 100,
    Plasma: 28,
    Platelets: 21,
  };

  readonly donationTypes: DonationType[] = ['WholeBlood', 'Plasma', 'Platelets'];

  readonly bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('jbf_saved_donors');
      } catch {
        // Ignore storage errors
      }
    }
  }

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

  calculateAvailability(
    lastDonationDate: string | null | undefined,
    donationType: DonationType = 'WholeBlood',
  ): { status: 'Available' | 'Unavailable'; nextEligibleDate: string | null } {
    if (!lastDonationDate) {
      return { status: 'Available', nextEligibleDate: null };
    }

    const donation = new Date(lastDonationDate);
    if (isNaN(donation.getTime())) {
      return { status: 'Available', nextEligibleDate: null };
    }

    const intervalDays = this.donationIntervals[donationType] || 100;
    const nextEligible = new Date(donation);
    nextEligible.setDate(nextEligible.getDate() + intervalDays);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isEligible = nextEligible <= today;
    return {
      status: isEligible ? 'Available' : 'Unavailable',
      nextEligibleDate: nextEligible.toISOString().split('T')[0],
    };
  }

  calculateDaysSince(dateStr: string | null | undefined): string {
    if (!dateStr) return 'No previous donation';
    const donationDate = new Date(dateStr);
    if (isNaN(donationDate.getTime())) return 'No previous donation';

    const now = new Date();
    if (donationDate > now) return '0 days';

    let years = now.getFullYear() - donationDate.getFullYear();
    let months = now.getMonth() - donationDate.getMonth();
    let days = now.getDate() - donationDate.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonthLastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      days += prevMonthLastDay;
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    return `${years} years, ${months} months, ${days} days`;
  }

  /**
   * Requirement 4: Formatted sequential code as (DI-013, DI-014, DI-015)
   */
  formatDonorCode(id: number): string {
    return `DI-${String(id).padStart(3, '0')}`;
  }

  normalizeDonationType(val: any): DonationType {
    if (val === 1 || val === 'Plasma') return 'Plasma';
    if (val === 2 || val === 'Platelets') return 'Platelets';
    return 'WholeBlood';
  }

  /**
   * Maps backend SQL database response (dbo.vwBloodDonors) directly to UI BloodDonor model
   */
  mapApiToBloodDonor(d: any): BloodDonor {
    const donorId = d.bloodDonorId ?? d.id ?? 1;
    const donorCode = d.donorCode
      ? d.donorCode.replace(/^BD-/, 'DI-')
      : this.formatDonorCode(donorId);
    const fullName =
      d.fullName || `${d.firstName || ''} ${d.lastName || ''}`.trim() || 'Unknown Donor';
    const names = fullName.split(' ');
    const firstName = d.firstName || names[0] || 'Donor';
    const lastName = d.lastName || names.slice(1).join(' ') || '';
    const address = d.address || [d.area, d.city, d.district].filter(Boolean).join(', ') || '';
    const lastDonationDate = d.lastDonationDate ? d.lastDonationDate.split('T')[0] : null;
    const donationType = this.normalizeDonationType(d.lastDonationType);
    const { status: autoStatus, nextEligibleDate } = this.calculateAvailability(
      lastDonationDate,
      donationType,
    );
    return {
      id: donorId,
      donorCode: donorCode,
      firstName: firstName,
      lastName: lastName,
      fullName: fullName,
      bloodGroup: d.bloodGroup || 'O+',
      contactNo: d.contactNo || d.contactNumber || '',
      address: address,
      district: d.district || '',
      city: d.city || '',
      area: d.area || '',
      lastDonationDate: lastDonationDate,
      lastDonationType: donationType,
      daysSinceLastDonation: this.calculateDaysSince(lastDonationDate),
      nextEligibleDate: d.nextEligibleDate ? d.nextEligibleDate.split('T')[0] : nextEligibleDate,
      status: d.status || autoStatus,
      dateOfBirth: d.dateOfBirth ? d.dateOfBirth.split('T')[0] : '',
      totalDonation: Number(d.totalDonation ?? 0),
      donationFromJbf: Number(d.donationFromJbf ?? 0),
      preferredLocation: d.preferredLocation || '',
      preferredTime: d.preferredTime || '',
      remarks: d.remarks || '',
      discontinueStatus: (d.discontinueStatus ||
        (d.status === 'Unavailable' ? 'InActive' : 'IsActive')) as 'IsActive' | 'InActive',
    };
  }

  /**
   * Fetches real-time donors directly from backend API / database (NO mock fallbacks)
   */
  getAllDonors(): Observable<BloodDonor[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiUrl}/blooddonors`, { headers }).pipe(
      map((apiDonors) => {
        return (apiDonors || []).map((d: any) => this.mapApiToBloodDonor(d));
      }),
      catchError((err) => {
        console.error('[BloodDonorService] Failed to load blood donors from API:', err);
        return throwError(() => err);
      }),
    );
  }

  getDonorById(id: number): Observable<BloodDonor | null> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/blooddonors/${id}`, { headers }).pipe(
      map((d: any) => (d ? this.mapApiToBloodDonor(d) : null)),
      catchError((err) => {
        console.error(`[BloodDonorService] Failed to fetch donor #${id}:`, err);
        return throwError(() => err);
      }),
    );
  }

  createDonor(dto: CreateBloodDonorDTO): Observable<BloodDonor> {
    const headers = this.getAuthHeaders();
    const cleanContact = dto.contactNo ? dto.contactNo.replace(/[\s-]/g, '') : '';
    const fullName = `${dto.firstName.trim()} ${dto.lastName.trim()}`.trim();
    const address = dto.address || [dto.area, dto.city, dto.district].filter(Boolean).join(', ');
    const donationType = this.normalizeDonationType(dto.lastDonationType);
    const { status: autoStatus } = this.calculateAvailability(dto.lastDonationDate, donationType);
    const payload = {
      ...dto,
      fullName: fullName,
      contactNo: cleanContact,
      address: address,
      dateOfBirth: dto.dateOfBirth,
      totalDonation: Number(dto.totalDonation ?? 0),
      donationFromJbf: Number(dto.donationFromJbf ?? 0),
      status: autoStatus,
      isAvailable: autoStatus === 'Available',
      lastDonationType: donationType === 'Plasma' ? 1 : donationType === 'Platelets' ? 2 : 0,
    };
    return this.http.post<any>(`${this.apiUrl}/blooddonors`, payload, { headers }).pipe(
      map((created: any) => this.mapApiToBloodDonor(created)),
      catchError((err) => {
        console.error('[BloodDonorService] Failed to create blood donor:', err);
        return throwError(() => err);
      }),
    );
  }

  updateDonor(id: number, dto: Partial<BloodDonor>): Observable<boolean> {
    const headers = this.getAuthHeaders();
    const cleanContact = dto.contactNo ? dto.contactNo.replace(/[\s-]/g, '') : '';
    const fullName = dto.fullName || `${dto.firstName || ''} ${dto.lastName || ''}`.trim();
    const address = dto.address || [dto.area, dto.city, dto.district].filter(Boolean).join(', ');
    const donationType = this.normalizeDonationType(dto.lastDonationType);
    const { status: autoStatus } = this.calculateAvailability(dto.lastDonationDate, donationType);
    const payload = {
      ...dto,
      id: id,
      fullName: fullName,
      address: address,
      contactNo: cleanContact || dto.contactNo,
      dateOfBirth: dto.dateOfBirth,
      totalDonation: Number(dto.totalDonation ?? 0),
      donationFromJbf: Number(dto.donationFromJbf ?? 0),
      status: autoStatus,
      isAvailable: autoStatus === 'Available',
      lastDonationType: donationType === 'Plasma' ? 1 : donationType === 'Platelets' ? 2 : 0,
    };
    return this.http.put(`${this.apiUrl}/blooddonors/${id}`, payload, { headers }).pipe(
      map(() => true),
      catchError((err) => {
        console.error(`[BloodDonorService] Failed to update blood donor #${id}:`, err);
        return throwError(() => err);
      }),
    );
  }

  toggleDiscontinue(id: number): Observable<boolean> {
    const headers = this.getAuthHeaders();
    return this.http.patch(`${this.apiUrl}/blooddonors/${id}/discontinue`, {}, { headers }).pipe(
      map(() => true),
      catchError((err) => {
        console.error(
          `[BloodDonorService] Failed to toggle discontinue status for donor #${id}:`,
          err,
        );
        return throwError(() => err);
      }),
    );
  }
}
