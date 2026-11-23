import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);

  // Accordion states
  isCaseRequestOpen = signal<boolean>(false);
  isBloodDonorOpen = signal<boolean>(false);
  isFundOpen = signal<boolean>(false);
  isFundDepositOpen = signal<boolean>(false);
  isFundCostingOpen = signal<boolean>(false);
  isMemberOpen = signal<boolean>(false);
  isRoleAssignOpen = signal<boolean>(false);

  // ─── Role Check Getters ──────────────────────────────────────────────────
  private get userRoles(): string[] {
    const user = this.authService.activeUser();
    if (!user) return [];
    const list = (user as any).roles ?? [user.role];
    return (Array.isArray(list) ? list : [list]).map((r: string) =>
      r.toLowerCase().replace(/[-\s]/g, ''),
    );
  }

  private hasRole(...rolesToCheck: string[]): boolean {
    const currentRoles = this.userRoles;
    return rolesToCheck.some((r) => currentRoles.includes(r.toLowerCase().replace(/[-\s]/g, '')));
  }

  /** Admin has access to everything */
  get isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /** Blood Searching Member sees Case Request & Blood Donor */
  get isBloodSearchingMember(): boolean {
    return this.isAdmin || this.hasRole('bloodsearchingmember', 'member');
  }

  /** Fund Manager sees Fund Management */
  get isFundManager(): boolean {
    return this.isAdmin || this.hasRole('fundmanager');
  }

  /** Seeker, Blood-Donor, Fund-Donor, Member see Fund Donation */
  get canDonateFund(): boolean {
    return this.isAdmin || this.hasRole('seeker', 'blooddonor', 'funddonor', 'member');
  }

  /** Seeker, Blood-Donor, Fund-Donor see Case Request (New only) & Want to be a member */
  get isLimitedCaseUser(): boolean {
    return !this.isAdmin && this.hasRole('seeker', 'blooddonor', 'funddonor');
  }

  /** Seeker, Fund-Donor see Donate Blood */
  get canDonateBlood(): boolean {
    return !this.isAdmin;
  }

  ngOnInit(): void {
    this.autoExpandActiveRoute(this.router.url);

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        this.autoExpandActiveRoute(event.urlAfterRedirects || event.url);
      });
  }

  private autoExpandActiveRoute(url: string): void {
    if (url.startsWith('/cases')) {
      this.isCaseRequestOpen.set(true);
    } else if (url.startsWith('/donors')) {
      this.isBloodDonorOpen.set(true);
    } else if (url.startsWith('/funds') || url.startsWith('/fund')) {
      this.isFundOpen.set(true);
      if (url.includes('/deposits')) {
        this.isFundDepositOpen.set(true);
      } else if (url.includes('/costings')) {
        this.isFundCostingOpen.set(true);
      }
    } else if (url.startsWith('/members')) {
      this.isMemberOpen.set(true);
    } else if (url.startsWith('/roles') || url.startsWith('/member-roles')) {
      this.isRoleAssignOpen.set(true);
    }
  }

  isCaseActive(): boolean {
    return this.router.url.startsWith('/cases');
  }

  isDonorActive(): boolean {
    return this.router.url.startsWith('/donors');
  }

  isFundActive(): boolean {
    return this.router.url.startsWith('/funds') || this.router.url.startsWith('/fund');
  }

  isDepositActive(): boolean {
    return this.router.url.startsWith('/funds/deposits');
  }

  isCostingActive(): boolean {
    return this.router.url.startsWith('/funds/costings');
  }

  isMemberActive(): boolean {
    return this.router.url.startsWith('/members');
  }

  isRoleAssignActive(): boolean {
    return this.router.url.startsWith('/roles') || this.router.url.startsWith('/member-roles');
  }

  isUsersActive(): boolean {
    return this.router.url.startsWith('/users');
  }

  toggleCaseRequest(): void {
    this.isCaseRequestOpen.update((open) => !open);
  }

  toggleBloodDonor(): void {
    this.isBloodDonorOpen.update((open) => !open);
  }

  toggleFund(): void {
    this.isFundOpen.update((open) => !open);
  }

  toggleFundDeposit(event?: Event): void {
    if (event) event.stopPropagation();
    this.isFundDepositOpen.update((open) => !open);
  }

  toggleFundCosting(event?: Event): void {
    if (event) event.stopPropagation();
    this.isFundCostingOpen.update((open) => !open);
  }

  toggleMember(): void {
    this.isMemberOpen.update((open) => !open);
  }

  toggleRoleAssign(): void {
    this.isRoleAssignOpen.update((open) => !open);
  }

  navigateToHome(): void {
    if (typeof window !== 'undefined') {
      const token = this.authService.retrieveToken();
      // Pass the active token in the URL query so React instantly recognizes the user
      window.location.href = token
        ? `${environment.reactPortalUrl}/?token=${encodeURIComponent(token)}`
        : `${environment.reactPortalUrl}/`;
    }
  }

  t(key: string): string {
    return this.themeService.translate(key);
  }
}
