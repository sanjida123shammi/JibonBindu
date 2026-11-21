import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { ThemeService } from '../../services/theme.service';
import { DashboardStats } from '../../models/dashboard-stats.model';
import { BloodDonationData, BloodDonationResponse } from '../../models/blood-donation.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  readonly dashboardService = inject(DashboardService);
  readonly themeService = inject(ThemeService);

  isLoading = signal<boolean>(false);
  autoRefreshTimer: any = null;
  selectedYear = signal<number>(2026);

  stats = signal<DashboardStats>({
    totalCaseRequest: 0,
    totalSolvedCase: 0,
    totalDonor: 0,
    totalMembers: 0,
  });

  bloodDonations = signal<BloodDonationData[]>([]);
  chartYMax = 50;
  yAxisMarks = [50, 40, 30, 20, 10, 0];

  ngOnInit(): void {
    // Load dashboard data immediately upon entering
    this.refreshAllData();

    // Periodic auto-refresh every 15 seconds
    this.autoRefreshTimer = setInterval(() => {
      this.refreshAllData(false);
    }, 15000);
  }

  ngOnDestroy(): void {
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer);
    }
  }

  refreshAllData(showSpinner: boolean = true): void {
    if (showSpinner) this.isLoading.set(true);

    this.dashboardService.getDashboardStats().subscribe({
      next: (data: DashboardStats) => {
        this.stats.set(data);
        if (showSpinner) this.isLoading.set(false);
      },
      error: () => {
        if (showSpinner) this.isLoading.set(false);
      },
    });

    this.dashboardService.getMonthlyBloodDonations(this.selectedYear()).subscribe({
      next: (res: BloodDonationResponse) => {
        if (res && res.data) {
          this.bloodDonations.set(res.data);
        }
      },
      error: () => {
        this.bloodDonations.set(this.dashboardService.getFallbackMonthlyDonations());
      },
    });
  }

  t(key: string): string {
    return this.themeService.translate(key);
  }

  calculateY(count: number, height: number = 220): number {
    const clamped = Math.max(0, Math.min(50, count));
    return height - (clamped / 50) * height + 10;
  }

  getChartPoints(): string {
    const data = this.bloodDonations();
    if (!data.length) return '';
    const width = 640;
    const step = width / (data.length - 1);
    return data
      .map((item: BloodDonationData, idx: number) => {
        const x = idx * step + 40;
        const y = this.calculateY(item.count, 180);
        return `${x},${y}`;
      })
      .join(' ');
  }

  getChartAreaPoints(): string {
    const data = this.bloodDonations();
    if (!data.length) return '';
    const width = 640;
    const step = width / (data.length - 1);
    const topPoints = data.map((item: BloodDonationData, idx: number) => {
      const x = idx * step + 40;
      const y = this.calculateY(item.count, 180);
      return `${x},${y}`;
    });
    const lastX = (data.length - 1) * step + 40;
    const firstX = 40;
    const baseY = 190;
    return `${topPoints.join(' ')} ${lastX},${baseY} ${firstX},${baseY}`;
  }
}