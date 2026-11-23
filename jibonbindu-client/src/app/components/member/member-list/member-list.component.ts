import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Member } from '../../../models/member.model';
import { MemberService } from '../../../services/member.service';
import { PaginationComponent } from '../../common/pagination/pagination.component';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaginationComponent],
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.css',
})
export class MemberListComponent implements OnInit {
  private memberService = inject(MemberService);
  private router = inject(Router);
  readonly themeService = inject(ThemeService);
  t(key: string): string {
    return this.themeService.translate(key);
  }

  members = signal<Member[]>([]);
  searchKeyword = signal<string>('');
  sortColumn = signal<string>('id');
  sortDirection = signal<'asc' | 'desc'>('asc');
  currentPage = signal<number>(1);
  pageSize = signal<number>(8);
  errorMessage = signal<string>('');
  statusFeedback = signal<string>('');

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers(): void {
    this.memberService.getAllMembers().subscribe({
      next: (data) => {
        this.members.set(data || []);
      },
      error: () => {
        this.errorMessage.set('Could not load member directory from server.');
      },
    });
  }

  filteredMembers = computed(() => {
    const list = this.members();
    const query = this.searchKeyword().trim().toLowerCase();

    if (!query) return list;

    return list.filter((m) => {
      const id = (m.memberID || '').toLowerCase();
      const name = (m.fullName || `${m.firstName} ${m.lastName}`).toLowerCase();
      const phone = (m.contactNumber || '').toLowerCase();
      const role = (m.roleName || '').toLowerCase();
      const district = (m.district || '').toLowerCase();
      const area = (m.area || '').toLowerCase();
      const nid = (m.nidNumber || '').toLowerCase();
      const cert = (m.birthCertificateNo || '').toLowerCase();

      return (
        id.includes(query) ||
        name.includes(query) ||
        phone.includes(query) ||
        role.includes(query) ||
        district.includes(query) ||
        area.includes(query) ||
        nid.includes(query) ||
        cert.includes(query)
      );
    });
  });

  sortedMembers = computed(() => {
    const list = [...this.filteredMembers()];
    const col = this.sortColumn();
    const dir = this.sortDirection();

    return list.sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (col) {
        case 'id':
          valA = a.memberID || '';
          valB = b.memberID || '';
          break;
        case 'name':
          valA = a.fullName?.toLowerCase() || '';
          valB = b.fullName?.toLowerCase() || '';
          break;
        case 'role':
          valA = a.roleName?.toLowerCase() || '';
          valB = b.roleName?.toLowerCase() || '';
          break;
        case 'dob':
          valA = new Date(a.dateOfBirth).getTime();
          valB = new Date(b.dateOfBirth).getTime();
          break;
        default:
          valA = a.memberID || '';
          valB = b.memberID || '';
      }

      if (valA < valB) return dir === 'asc' ? -1 : 1;
      if (valA > valB) return dir === 'asc' ? 1 : -1;
      return 0;
    });
  });

  pagedMembers = computed(() => {
    const list = this.sortedMembers();
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

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  }

  getInitials(name: string): string {
    if (!name) return 'M';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }

  getImageUrl(path?: string | null): string {
    return this.memberService.getImageUrl(path);
  }

  editMember(m: Member): void {
    this.router.navigate(['/members/edit', m.memberID]);
  }

  deleteMember(m: Member): void {
    if (confirm(`Are you sure you want to delete member ${m.fullName} (${m.memberID})?`)) {
      this.memberService.deleteMember(m.memberID).subscribe(() => {
        this.statusFeedback.set(`Member ${m.memberID} removed successfully.`);
        this.loadMembers();
        setTimeout(() => this.statusFeedback.set(''), 3000);
      });
    }
  }
}
