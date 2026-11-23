import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PaginationComponent } from '../../common/pagination/pagination.component';
import { BloodDonorService } from '../../../services/blood-donor.service';
import { BloodDonor, DonationType } from '../../../models/blood-donor.model';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-donor-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaginationComponent],
  templateUrl: './donor-list.component.html',
  styleUrl: './donor-list.component.css',
})
export class DonorListComponent implements OnInit {
  private donorService = inject(BloodDonorService);
  private router = inject(Router);
  readonly themeService = inject(ThemeService);
  t(key: string): string {
    return this.themeService.translate(key);
  }

  donors = signal<BloodDonor[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  statusFeedback = signal<string | null>(null);

  // Search & Sorting
  searchKeyword = signal<string>('');
  sortColumn = signal<string>('id');
  sortDirection = signal<'asc' | 'desc'>('asc');

  // Multi-category Filters (Requirement 9)
  filterBloodGroup = signal<string>('');
  filterDistrict = signal<string>('');
  filterArea = signal<string>('');
  filterDiscontinue = signal<string>('');
  filterAvailability = signal<string>('');
  filterDonationType = signal<string>('');

  // Pagination
  currentPage = signal<number>(1);
  pageSize = signal<number>(7);

  bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  donationTypes: DonationType[] = ['WholeBlood', 'Plasma', 'Platelets'];
  protected readonly Math = Math;

  ngOnInit(): void {
    this.loadDonors();
  }

  loadDonors(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.donorService.getAllDonors().subscribe({
      next: (data) => {
        this.donors.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 401) {
          this.errorMessage.set(
            'Unauthorized (401): Please log in to view blood donors from the database.',
          );
        } else if (err.status === 403) {
          this.errorMessage.set(
            'Access Denied (403): Your account role does not have permission to view blood donors (Admin or Member required).',
          );
        } else {
          this.errorMessage.set(
            'Could not load blood donors from the database. Please check your backend API connection.',
          );
        }
      },
    });
  }

  // Unique Districts for dropdown filter
  availableDistricts = computed(() => {
    const set = new Set<string>();
    this.donors().forEach((d) => {
      if (d.district) set.add(d.district);
    });
    return Array.from(set).sort();
  });

  // Unique Areas for dropdown filter
  availableAreas = computed(() => {
    const set = new Set<string>();
    const selectedDist = this.filterDistrict().toLowerCase();
    this.donors().forEach((d) => {
      if (selectedDist && d.district?.toLowerCase() !== selectedDist) {
        return;
      }
      if (d.area) set.add(d.area);
    });
    return Array.from(set).sort();
  });

  // Active filters count
  activeFilterCount = computed(() => {
    let count = 0;
    if (this.filterBloodGroup()) count++;
    if (this.filterDistrict()) count++;
    if (this.filterArea()) count++;
    if (this.filterDiscontinue()) count++;
    if (this.filterAvailability()) count++;
    if (this.filterDonationType()) count++;
    return count;
  });

  resetFilters(): void {
    this.searchKeyword.set('');
    this.filterBloodGroup.set('');
    this.filterDistrict.set('');
    this.filterArea.set('');
    this.filterDiscontinue.set('');
    this.filterAvailability.set('');
    this.filterDonationType.set('');
    this.currentPage.set(1);
  }

  // Filtered & Sorted donor list
  filteredAndSortedDonors = computed(() => {
    let list = [...this.donors()];
    const query = this.searchKeyword().toLowerCase().trim();
    const bg = this.filterBloodGroup().toLowerCase();
    const district = this.filterDistrict().toLowerCase();
    const area = this.filterArea().toLowerCase();
    const discontinue = this.filterDiscontinue();
    const availability = this.filterAvailability().toLowerCase();
    const donationType = this.filterDonationType().toLowerCase();

    // 1. Text Search across all columns
    if (query) {
      list = list.filter(
        (d) =>
          d.id.toString().includes(query) ||
          d.donorCode?.toLowerCase().includes(query) ||
          d.fullName?.toLowerCase().includes(query) ||
          d.bloodGroup?.toLowerCase().includes(query) ||
          d.contactNo?.toLowerCase().includes(query) ||
          d.address?.toLowerCase().includes(query) ||
          d.district?.toLowerCase().includes(query) ||
          d.city?.toLowerCase().includes(query) ||
          d.area?.toLowerCase().includes(query) ||
          d.lastDonationType?.toLowerCase().includes(query) ||
          d.remarks?.toLowerCase().includes(query) ||
          d.preferredLocation?.toLowerCase().includes(query) ||
          d.status?.toLowerCase().includes(query) ||
          d.discontinueStatus?.toLowerCase().includes(query),
      );
    }

    // 2. Multi-category Filters
    if (bg) {
      list = list.filter((d) => d.bloodGroup.toLowerCase() === bg);
    }
    if (district) {
      list = list.filter((d) => d.district?.toLowerCase() === district);
    }
    if (area) {
      list = list.filter((d) => d.area?.toLowerCase() === area);
    }
    if (discontinue) {
      list = list.filter((d) => d.discontinueStatus === discontinue);
    }
    if (availability) {
      list = list.filter((d) => d.status.toLowerCase() === availability);
    }
    if (donationType) {
      list = list.filter((d) => d.lastDonationType?.toLowerCase() === donationType);
    }

    // 3. Sorting
    const col = this.sortColumn();
    const dir = this.sortDirection() === 'asc' ? 1 : -1;

    list.sort((a: any, b: any) => {
      const valA = a[col] ?? '';
      const valB = b[col] ?? '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return (valA - valB) * dir;
      }
      return String(valA).localeCompare(String(valB)) * dir;
    });

    return list;
  });

  // Paginated page subset
  paginatedDonors = computed(() => {
    const list = this.filteredAndSortedDonors();
    const start = (this.currentPage() - 1) * this.pageSize();
    return list.slice(start, start + this.pageSize());
  });

  onSort(column: string): void {
    if (this.sortColumn() === column) {
      this.sortDirection.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onEditDonor(id: number): void {
    this.router.navigate(['/donors/edit', id]);
  }

  /**
   * Requirement 7: When Delete button is clicked, toggle Discontinue Status in database
   */
  onDeleteDonor(id: number): void {
    const targetDonor = this.donors().find((d) => d.id === id);
    if (!targetDonor) return;

    const newStatus: 'IsActive' | 'InActive' =
      targetDonor.discontinueStatus === 'InActive' ? 'IsActive' : 'InActive';

    this.donorService.toggleDiscontinue(id).subscribe({
      next: () => {
        this.donors.update((list) =>
          list.map((d) => (d.id === id ? { ...d, discontinueStatus: newStatus } : d)),
        );
        const code = targetDonor.donorCode || `#DI-${id}`;
        if (newStatus === 'InActive') {
          this.statusFeedback.set(`Donor ${code} marked as InActive (Discontinued)`);
        } else {
          this.statusFeedback.set(`Donor ${code} restored to IsActive`);
        }
        setTimeout(() => this.statusFeedback.set(null), 3000);
      },
      error: () => {
        this.statusFeedback.set(`Failed to update status for donor #${id}`);
        setTimeout(() => this.statusFeedback.set(null), 3000);
      },
    });
  }
}
