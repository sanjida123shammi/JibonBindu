import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PaginationComponent } from '../../common/pagination/pagination.component';
import { CaseRequestService } from '../../../services/case-request.service';
import { CaseRequest } from '../../../models/case-request.model';

@Component({
  selector: 'app-case-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaginationComponent],
  templateUrl: './case-list.component.html',
  styleUrl: './case-list.component.css',
})
export class CaseListComponent implements OnInit {
  private caseService = inject(CaseRequestService);
  private router = inject(Router);

  cases = signal<CaseRequest[]>([]);
  isLoading = signal<boolean>(true);
  statusUpdateFeedback = signal<string | null>(null);

  availableStatuses = signal<string[]>(['Pending', 'In Progress', 'Fulfilled', 'Cancelled']);

  searchKeyword = signal<string>('');
  sortColumn = signal<string>('id');
  sortDirection = signal<'asc' | 'desc'>('desc');

  currentPage = signal<number>(1);
  pageSize = signal<number>(7);

  selectedIds = signal<Set<number>>(new Set<number>());
  protected readonly Math = Math;

  ngOnInit(): void {
    this.loadStatuses();
    this.loadCases();
  }

  loadStatuses(): void {
    this.caseService.getCaseStatuses().subscribe({
      next: (statuses) => {
        if (statuses && statuses.length) {
          this.availableStatuses.set(statuses);
        }
      },
    });
  }

  loadCases(): void {
    this.isLoading.set(true);
    this.caseService.getAllCases().subscribe({
      next: (data) => {
        this.cases.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  filteredAndSortedCases = computed(() => {
    let list = [...this.cases()];
    const query = this.searchKeyword().toLowerCase().trim();

    if (query) {
      list = list.filter(
        (c) =>
          c.id.toString().includes(query) ||
          c.caseNo?.toString().includes(query) ||
          c.date?.toLowerCase().includes(query) ||
          c.patientProblem?.toLowerCase().includes(query) ||
          c.bloodGroup?.toLowerCase().includes(query) ||
          c.donationPlace?.toLowerCase().includes(query) ||
          c.contactNo?.toLowerCase().includes(query) ||
          c.reference?.toLowerCase().includes(query) ||
          c.status?.toLowerCase().includes(query) ||
          c.remarks?.toLowerCase().includes(query) ||
          c.deleteStatus?.toLowerCase().includes(query),
      );
    }

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

  paginatedCases = computed(() => {
    const list = this.filteredAndSortedCases();
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

  toggleSelectOne(id: number): void {
    const set = new Set(this.selectedIds());
    if (set.has(id)) {
      set.delete(id);
    } else {
      set.add(id);
    }
    this.selectedIds.set(set);
  }

  onStatusChange(caseId: number, newStatus: string): void {
    this.caseService.updateCaseStatus(caseId, newStatus).subscribe({
      next: () => {
        this.cases.update((list) =>
          list.map((c) => (c.id === caseId ? { ...c, status: newStatus } : c)),
        );
        this.statusUpdateFeedback.set(`Case #${caseId} status changed to "${newStatus}"`);
        setTimeout(() => this.statusUpdateFeedback.set(null), 3000);
      },
      error: () => {
        this.statusUpdateFeedback.set(`Failed to update Case #${caseId} status`);
        setTimeout(() => this.statusUpdateFeedback.set(null), 3000);
      },
    });
  }

  onEditCase(id: number): void {
    this.router.navigate(['/cases/edit', id]);
  }

  onDeleteCase(id: number): void {
    const newStatus = this.caseService.toggleSoftDelete(id);
    this.cases.update((list) =>
      list.map((c) => (c.id === id ? { ...c, deleteStatus: newStatus } : c)),
    );
  }
}
