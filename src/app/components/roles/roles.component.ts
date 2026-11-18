import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RoleItem } from '../../models/role.model';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.css',
})
export class RolesComponent implements OnInit {
  private roleService = inject(RoleService);

  roles = signal<RoleItem[]>([]);
  newRoleName = '';
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.roleService.getRoles().subscribe({
      next: (list) => this.roles.set(list || []),
      error: () => this.errorMessage.set('Failed to load system roles.'),
    });
  }

  onAddRole(): void {
    if (!this.newRoleName.trim()) {
      this.errorMessage.set('Please provide a role name.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.roleService.createRole({ name: this.newRoleName.trim() }).subscribe({
      next: (created) => {
        this.isSubmitting.set(false);
        this.newRoleName = '';
        this.successMessage.set(`Role "${created.name}" created successfully.`);
        this.loadRoles();
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to create role.');
      },
    });
  }

  onDeleteRole(role: RoleItem): void {
    if (!confirm(`Are you sure you want to delete role "${role.name}"?`)) return;

    this.roleService.deleteRole(role.id).subscribe({
      next: () => {
        this.successMessage.set(`Role "${role.name}" deleted.`);
        this.loadRoles();
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to delete role.');
      },
    });
  }
}
