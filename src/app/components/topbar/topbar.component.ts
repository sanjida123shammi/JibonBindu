import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { DashboardService } from '../../services/dashboard.service';
import { UserProfileService } from '../../services/user-profile.service';
import { AppNotification } from '../../models/notification.model';
import { UserProfile } from '../../models/user-profile.model';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css',
})
export class TopbarComponent implements OnInit {
  readonly themeService = inject(ThemeService);
  readonly dashboardService = inject(DashboardService);
  readonly profileService = inject(UserProfileService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);

  get userAvatarUrl(): string {
    return this.profileService.getImageUrl(this.currentUser().avatarUrl);
  }

  isProfileMenuOpen = signal<boolean>(false);
  isNotificationMenuOpen = signal<boolean>(false);

  notifications = signal<AppNotification[]>([]);
  unreadNotificationsCount = computed(() => {
    return this.notifications().filter((n: AppNotification) => !n.isRead).length;
  });

  currentUser = signal<UserProfile>({
    id: '1',
    fullName: 'Your name',
    email: 'yourname@gmail.com',
    role: 'Admin',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
  });

  private pollInterval: any = null;

  ngOnInit(): void {
    this.loadProfile();
    this.loadNotifications();

    // Poll for new notifications every 10 seconds so Admin sees requests in real-time
    this.pollInterval = setInterval(() => {
      this.loadNotifications();
    }, 10000);
  }

  ngOnDestroy(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  loadProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (profile: UserProfile) => {
        if (profile) {
          this.currentUser.set(profile);
          this.cdr.detectChanges();
        }
      },
    });
  }

  loadNotifications(): void {
    this.dashboardService.getNotifications().subscribe({
      next: (list: AppNotification[]) => {
        this.notifications.set(list);
        this.cdr.detectChanges();
      },
    });
  }

  toggleProfileMenu(event?: MouseEvent): void {
    event?.stopPropagation();
    this.isProfileMenuOpen.update((v) => !v);
    if (this.isProfileMenuOpen()) {
      this.isNotificationMenuOpen.set(false);
    }
  }

  toggleNotificationMenu(event?: MouseEvent): void {
    event?.stopPropagation();
    this.isNotificationMenuOpen.update((v) => !v);
    if (this.isNotificationMenuOpen()) {
      this.isProfileMenuOpen.set(false);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Automatically collapse profile menu when clicking outside
    if (this.isProfileMenuOpen()) {
      const profileWrapper = this.elementRef.nativeElement.querySelector('.profile-wrapper');
      if (profileWrapper && !profileWrapper.contains(target)) {
        this.isProfileMenuOpen.set(false);
      }
    }

    // Automatically collapse notification menu when clicking outside
    if (this.isNotificationMenuOpen()) {
      const notifWrapper = this.elementRef.nativeElement.querySelector('.notification-wrapper');
      if (notifWrapper && !notifWrapper.contains(target)) {
        this.isNotificationMenuOpen.set(false);
      }
    }
  }

  closeDropdowns(): void {
    this.isProfileMenuOpen.set(false);
    this.isNotificationMenuOpen.set(false);
  }

  markAllNotificationsRead(): void {
    this.notifications.update((list: AppNotification[]) =>
      list.map((n: AppNotification) => ({ ...n, isRead: true })),
    );
  }

  // ─── Member Request Helpers ───────────────────────────────────────────────

  /** Extracts the embedded JSON payload from a MemberRequest notification message. */
  getMemberRequestPayload(
    message: string,
  ): { name: string; contactNumber: string; email?: string } | null {
    const marker = '__payload__:';
    const idx = message.indexOf(marker);
    if (idx === -1) return null;
    try {
      return JSON.parse(message.substring(idx + marker.length));
    } catch {
      return null;
    }
  }

  /** Returns the display-safe message (strips the hidden payload JSON). */
  getCleanMessage(message: string): string {
    const idx = message.indexOf('__payload__:');
    return idx === -1
      ? message
      : message
          .substring(0, idx)
          .trim()
          .replace(/\|?\s*$/, '');
  }

  approveMemberRequest(notification: AppNotification): void {
    const payload = this.getMemberRequestPayload(notification.message);
    if (!payload) return;

    const parts = (payload.name || 'Member').trim().split(' ');
    const firstName = parts[0] || 'Member';
    const lastName = parts.slice(1).join(' ') || 'Applicant';

    const dto = {
      firstName: firstName,
      lastName: lastName,
      dateOfBirth: new Date('2000-01-01').toISOString(),
      contactNumber: payload.contactNumber || '01700000000',
      district: 'Dhaka',
      city: 'Dhaka',
      area: 'Headquarters',
      email: payload.email || undefined,
      nidNumber: 'REQ' + Date.now().toString().slice(-10), // Safe 13-digit NID
    };

    this.dashboardService.approveMemberRequest(dto).subscribe({
      next: (res) => {
        // 1. Mark notification read on server
        this.dashboardService.markNotificationRead(notification.id).subscribe();

        // 2. Update local state immediately
        this.notifications.update((list) =>
          list.map((n) =>
            n.id === notification.id ? { ...n, isRead: true, title: '✓ Approved: ' + n.title } : n,
          ),
        );

        // 3. Immediately refresh notifications list from server
        this.loadNotifications();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to approve member request:', err);
        alert(err?.error?.error || err?.error?.message || 'Failed to approve member request.');
      },
    });
  }

  holdMemberRequest(notification: AppNotification): void {
    // Just mark as read — no DB action for "Hold"
    this.notifications.update((list) =>
      list.map((n) =>
        n.id === notification.id ? { ...n, isRead: true, title: '— On Hold: ' + n.title } : n,
      ),
    );
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleLanguage(): void {
    this.themeService.toggleLanguage();
  }

  t(key: string): string {
    return this.themeService.translate(key);
  }

  navigateToDashboard(): void {
    this.closeDropdowns();
    this.router.navigate(['/dashboard']);
  }

  navigateToProfile(): void {
    this.closeDropdowns();
    this.router.navigate(['/profile']);
  }

  onLogout(): void {
    this.closeDropdowns();
    this.profileService.logout();
    this.router.navigate(['/login']);
  }
}
