import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Member } from '../../../models/member.model';
import { MemberAssignedRoles, RoleItem } from '../../../models/role.model';
import { MemberService } from '../../../services/member.service';
import { RoleService } from '../../../services/role.service';

@Component({
  selector: 'app-member-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './member-roles.component.html',
  styleUrl: './member-roles.component.css',
})
export class MemberRolesComponent implements OnInit {
  private roleService = inject(RoleService);
  private memberService = inject(MemberService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('assignSection') assignSection!: ElementRef<HTMLDivElement>;

  members = signal<Member[]>([]);
  availableRoles = signal<RoleItem[]>([]);
  memberAssignments = signal<MemberAssignedRoles[]>([]);

  // Form State
  selectedMemberId = '';
  selectedRoleIds: { [roleId: string]: boolean } = {};
  isEditing = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);

  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    // 1. Load available roles from AspNetRoles
    this.roleService.getRoles().subscribe({
      next: (list) => this.availableRoles.set(list || []),
      error: (err) => console.error('[MemberRoles] Failed to load roles:', err),
    });

    // 2. Load members from MemberService so it matches the Member List exactly!
    this.memberService.getAllMembers().subscribe({
      next: (membersList) => {
        this.members.set(membersList || []);
        this.loadAssignments();
      },
      error: (err) => {
        console.error('[MemberRoles] Failed to load members:', err);
        this.roleService.getMembers().subscribe((list) => {
          this.members.set((list as any) || []);
          this.loadAssignments();
        });
      },
    });
  }

  loadAssignments(): void {
    this.roleService.getMemberRoles().subscribe({
      next: (backendAssignments) => {
        this.mergeAssignments(backendAssignments || []);
      },
      error: (err) => {
        console.error('[MemberRoles] Failed to load assignments:', err);
        this.mergeAssignments([]);
      },
    });
  }

  /**
   * Merges all members from the Member List with their assigned roles so EVERY member is shown.
   */
  private mergeAssignments(backendAssignments: MemberAssignedRoles[]): void {
    const assignedMap = new Map<string, MemberAssignedRoles>();
    backendAssignments.forEach((a) => assignedMap.set(a.memberID, a));

    const combined: MemberAssignedRoles[] = this.members().map((m) => {
      const existing = assignedMap.get(m.memberID);
      const baseRole = m.roleName || 'Member';

      const roleNamesSet = new Set<string>();
      const roleIdsSet = new Set<string>();

      // Add base role from the Member List
      if (baseRole) {
        roleNamesSet.add(baseRole);
        const matched = this.availableRoles().find(
          (r) => r.name.toLowerCase() === baseRole.toLowerCase(),
        );
        if (matched) roleIdsSet.add(matched.id);
      }

      // Add newly assigned roles from backend if any
      if (existing) {
        existing.roleNames?.forEach((rn) => roleNamesSet.add(rn));
        existing.roleIds?.forEach((rid) => roleIdsSet.add(rid));
      }

      const roleNames = Array.from(roleNamesSet);
      const roleIds = Array.from(roleIdsSet);

      return {
        memberID: m.memberID,
        memberName: m.fullName,
        contactNumber: m.contactNumber,
        roleIds: roleIds,
        roleNames: roleNames,
        roleNamesDisplay: roleNames.join(', '),
      };
    });

    this.memberAssignments.set(combined);
  }

  onMemberChange(): void {
    this.selectedRoleIds = {};
    if (!this.selectedMemberId) return;

    const existing = this.memberAssignments().find((m) => m.memberID === this.selectedMemberId);

    if (existing && existing.roleIds) {
      existing.roleIds.forEach((id) => (this.selectedRoleIds[id] = true));
    }
  }

  isRoleChecked(roleId: string): boolean {
    return !!this.selectedRoleIds[roleId];
  }

  toggleRole(roleId: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedRoleIds[roleId] = input.checked;
  }

  onAssign(): void {
    if (!this.selectedMemberId) {
      this.errorMessage.set('Please select a member.');
      return;
    }

    const checkedRoleIds = Object.keys(this.selectedRoleIds).filter(
      (id) => this.selectedRoleIds[id],
    );

    if (checkedRoleIds.length === 0) {
      this.errorMessage.set('Please select at least one role checkbox.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.roleService
      .assignMemberRoles({
        memberID: this.selectedMemberId,
        roleIds: checkedRoleIds,
      })
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.successMessage.set(
            `Roles assigned to Member ${this.selectedMemberId} successfully.`,
          );
          this.resetForm();
          this.loadAssignments();
          setTimeout(() => this.successMessage.set(null), 3500);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err?.error?.message || 'Failed to assign roles.');
        },
      });
  }

  onEdit(item: MemberAssignedRoles): void {
    this.isEditing.set(true);
    this.selectedMemberId = item.memberID;

    this.selectedRoleIds = {};
    if (item.roleIds) {
      item.roleIds.forEach((id) => (this.selectedRoleIds[id] = true));
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.assignSection?.nativeElement) {
      this.assignSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  onDelete(item: MemberAssignedRoles): void {
    if (
      !confirm(
        `Are you sure you want to remove assigned roles for ${item.memberName} (${item.memberID})?`,
      )
    )
      return;

    this.roleService.deleteMemberRoles(item.memberID).subscribe({
      next: () => {
        this.successMessage.set(`Role assignments for ${item.memberID} removed.`);
        this.loadAssignments();
        if (this.selectedMemberId === item.memberID) {
          this.resetForm();
        }
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to remove role assignments.');
      },
    });
  }

  resetForm(): void {
    this.selectedMemberId = '';
    this.selectedRoleIds = {};
    this.isEditing.set(false);
  }
}
