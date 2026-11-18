import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserDetail } from '../../models/role.model';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css',
})
export class UserListComponent implements OnInit {
  private roleService = inject(RoleService);

  users = signal<UserDetail[]>([]);
  searchKeyword = signal<string>('');
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.roleService.getAllUsers().subscribe({
      next: (list) => this.users.set(list || []),
      error: () => this.errorMessage.set('Failed to load users list.'),
    });
  }

  filteredUsers = computed(() => {
    const list = this.users();
    const q = this.searchKeyword().trim().toLowerCase();
    if (!q) return list;

    return list.filter((u) => {
      const name = (u.name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const id = (u.id || '').toLowerCase();
      const member = (u.memberID || '').toLowerCase();
      const roles = (u.roles || []).join(' ').toLowerCase();

      return (
        name.includes(q) ||
        email.includes(q) ||
        id.includes(q) ||
        member.includes(q) ||
        roles.includes(q)
      );
    });
  });
}
