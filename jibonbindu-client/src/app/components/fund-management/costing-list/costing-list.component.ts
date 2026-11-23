import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FundCosting } from '../../../models/fund.model';
import { FundService } from '../../../services/fund.service';
import { PaginationComponent } from '../../common/pagination/pagination.component';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-costing-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaginationComponent],
  templateUrl: './costing-list.component.html',
  styleUrl: './costing-list.component.css',
})
export class CostingListComponent implements OnInit {
  private fundService = inject(FundService);
  private router = inject(Router);
  readonly themeService = inject(ThemeService);
  t(key: string): string {
    return this.themeService.translate(key);
  }

  costings = signal<FundCosting[]>([]);
  searchKeyword = signal<string>('');
  sortColumn = signal<string>('id');
  sortDirection = signal<'asc' | 'desc'>('desc');
  currentPage = signal<number>(1);
  pageSize = signal<number>(8);
  errorMessage = signal<string>('');
  statusFeedback = signal<string>('');

  ngOnInit(): void {
    this.loadCostings();
  }

  loadCostings(): void {
    this.fundService.getAllCostings().subscribe({
      next: (data) => {
        this.costings.set(data || []);
      },
      error: () => {
        this.errorMessage.set('Could not load costing vouchers from server.');
      },
    });
  }

  filteredCostings = computed(() => {
    const list = this.costings();
    const query = this.searchKeyword().trim().toLowerCase();

    if (!query) return list;

    return list.filter((item) => {
      const invCode = this.formatInvoiceCode(item.fundCostingId).toLowerCase();
      const spentBy = (item.spentByName || '').toLowerCase();
      const mobile = (item.spentByContactNo || '').toLowerCase();
      const purpose = (item.purpose || '').toLowerCase();
      const status = (item.settlementStatusTitle || '').toLowerCase();
      const remarks = (item.remarks || '').toLowerCase();
      const memberId = (item.memberId || '').toLowerCase();

      return (
        invCode.includes(query) ||
        spentBy.includes(query) ||
        mobile.includes(query) ||
        purpose.includes(query) ||
        status.includes(query) ||
        remarks.includes(query) ||
        memberId.includes(query)
      );
    });
  });

  sortedCostings = computed(() => {
    const list = [...this.filteredCostings()];
    const col = this.sortColumn();
    const dir = this.sortDirection();

    return list.sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (col) {
        case 'id':
          valA = a.fundCostingId;
          valB = b.fundCostingId;
          break;
        case 'date':
          valA = new Date(a.costingDate).getTime();
          valB = new Date(b.costingDate).getTime();
          break;
        case 'spentBy':
          valA = a.spentByName?.toLowerCase() || '';
          valB = b.spentByName?.toLowerCase() || '';
          break;
        case 'amount':
          valA = a.costAmount;
          valB = b.costAmount;
          break;
        case 'status':
          valA = a.settlementStatusTitle?.toLowerCase() || '';
          valB = b.settlementStatusTitle?.toLowerCase() || '';
          break;
        default:
          valA = a.fundCostingId;
          valB = b.fundCostingId;
      }

      if (valA < valB) return dir === 'asc' ? -1 : 1;
      if (valA > valB) return dir === 'asc' ? 1 : -1;
      return 0;
    });
  });

  pagedCostings = computed(() => {
    const list = this.sortedCostings();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return list.slice(start, start + size);
  });

  onSort(col: string): void {
    if (this.sortColumn() === col) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(col);
      this.sortDirection.set('asc');
    }
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  formatInvoiceCode(id: number): string {
    return `Inv-DC-${id.toString().padStart(3, '0')}`;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  }

  formatSpentBy(item: FundCosting): string {
    if (item.memberId) {
      return `${item.spentByName} (${item.memberId})`;
    }
    return item.spentByName;
  }

  editCosting(item: FundCosting): void {
    this.router.navigate(['/funds/costings/edit', item.fundCostingId]);
  }
}
