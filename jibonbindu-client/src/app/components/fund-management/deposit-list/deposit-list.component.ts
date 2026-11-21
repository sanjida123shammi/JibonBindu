import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FundDeposit } from '../../../models/fund.model';
import { FundService } from '../../../services/fund.service';
import { PaginationComponent } from '../../common/pagination/pagination.component';

@Component({
  selector: 'app-deposit-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaginationComponent],
  templateUrl: './deposit-list.component.html',
  styleUrl: './deposit-list.component.css',
})
export class DepositListComponent implements OnInit {
  private fundService = inject(FundService);
  private router = inject(Router);

  deposits = signal<FundDeposit[]>([]);
  searchKeyword = signal<string>('');
  sortColumn = signal<string>('id');
  sortDirection = signal<'asc' | 'desc'>('desc');
  currentPage = signal<number>(1);
  pageSize = signal<number>(8);
  errorMessage = signal<string>('');

  ngOnInit(): void {
    this.loadDeposits();
  }

  loadDeposits(): void {
    this.fundService.getAllDeposits().subscribe({
      next: (data) => {
        this.deposits.set(data || []);
      },
      error: () => {
        this.errorMessage.set('Could not load deposits from server.');
      },
    });
  }

  filteredDeposits = computed(() => {
    const list = this.deposits();
    const query = this.searchKeyword().trim().toLowerCase();

    if (!query) return list;

    return list.filter((item) => {
      const invCode = this.formatInvoiceCode(item.fundDepositId).toLowerCase();
      const name = (item.donorName || '').toLowerCase();
      const mobile = (item.donorContactNo || '').toLowerCase();
      const receiver = (item.fundReceiver || '').toLowerCase();
      const memberId = (item.memberId || '').toLowerCase();
      const donorType = (item.fundDonorTypeName || '').toLowerCase();
      const cashType = (item.cashTypeName || '').toLowerCase();
      const remarks = (item.months || '').toLowerCase();

      return (
        invCode.includes(query) ||
        name.includes(query) ||
        mobile.includes(query) ||
        receiver.includes(query) ||
        memberId.includes(query) ||
        donorType.includes(query) ||
        cashType.includes(query) ||
        remarks.includes(query)
      );
    });
  });

  sortedDeposits = computed(() => {
    const list = [...this.filteredDeposits()];
    const col = this.sortColumn();
    const dir = this.sortDirection();

    return list.sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (col) {
        case 'id':
          valA = a.fundDepositId;
          valB = b.fundDepositId;
          break;
        case 'date':
          valA = new Date(a.fundDonationDate).getTime();
          valB = new Date(b.fundDonationDate).getTime();
          break;
        case 'name':
          valA = a.donorName?.toLowerCase() || '';
          valB = b.donorName?.toLowerCase() || '';
          break;
        case 'amount':
          valA = a.amount;
          valB = b.amount;
          break;
        default:
          valA = a.fundDepositId;
          valB = b.fundDepositId;
      }

      if (valA < valB) return dir === 'asc' ? -1 : 1;
      if (valA > valB) return dir === 'asc' ? 1 : -1;
      return 0;
    });
  });

  pagedDeposits = computed(() => {
    const list = this.sortedDeposits();
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
    return `Inv-FD-${id.toString().padStart(3, '0')}`;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  }

  editDeposit(item: FundDeposit): void {
    this.router.navigate(['/funds/deposits/edit', item.fundDepositId]);
  }
}
